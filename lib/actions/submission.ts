"use server";

import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 定义前端传来的作答结构
interface StudentAnswer {
  questionId: string;
  answer: any; // 选择题是选项数组/字符串，编程题是代码字符串
}

export async function submitAssignmentAction(
  assignmentId: string,
  studentAnswers: StudentAnswer[],
) {
  try {
    const session = await auth();
    // 明确校验 user.id 的存在性，让 TS 百分百确信它是一个 string
    if (!session?.user?.id) throw new Error("未登录或获取用户ID失败");

    const studentId = session.user.id;

    // 1. 获取该作业的完整题目和标准答案（学生端是拿不到 correct 字段的，必须在后端查）
    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: { questions: true },
    });

    if (!assignment) throw new Error("作业不存在");

    let totalScore = 0;
    let hasManualReview = false; // 是否包含需要老师人工批改的主观题

    // 2. 遍历学生的每一道作答，进行自动判分
    const gradedAnswers = studentAnswers.map((studentAns) => {
      const question = assignment.questions.find(
        (q) => q.id === studentAns.questionId,
      );
      if (!question) return { ...studentAns, score: 0, isCorrect: false };

      const metadata: any = question.metadata;
      let score = 0;
      let isCorrect = false;

      // === 客观题判分逻辑 ===
      if (question.type === "SINGLE_CHOICE") {
        const correctAns = metadata.correct?.[0]; // ["A"] -> "A"
        if (studentAns.answer === correctAns) {
          score = question.score;
          isCorrect = true;
        }
      } else if (question.type === "MULTIPLE_CHOICE") {
        const correctArray = metadata.correct || []; // ["A", "B"]
        const studentArray = Array.isArray(studentAns.answer)
          ? studentAns.answer
          : [];
        // 简单数组比对 (交集判断)
        if (
          correctArray.length === studentArray.length &&
          correctArray.every((val: string) => studentArray.includes(val))
        ) {
          score = question.score;
          isCorrect = true;
        }
      } else if (question.type === "FILL_BLANK") {
        const correctAnswers = metadata.correct || []; // ["清洗", "数据清洗"]
        const studentText = (studentAns.answer || "").trim().toLowerCase();
        // 只要命中一个同义词就算对
        if (
          correctAnswers.some(
            (ans: string) => ans.trim().toLowerCase() === studentText,
          )
        ) {
          score = question.score;
          isCorrect = true;
        }
      }
      // === 主观/编程题逻辑 ===
      else if (question.type === "PROGRAMMING") {
        // 我们在阶段 3.2 的规划中：主观编程题一律交给老师批阅
        hasManualReview = true;
        score = 0; // 暂时给 0，等老师打分
        isCorrect = false; // 状态待定
      }

      totalScore += score;

      return {
        questionId: question.id,
        answer: studentAns.answer,
        score,
        isCorrect,
        type: question.type,
      };
    });

    // 3. 将判分结果存入 Submission 表
    // 使用 upsert，允许学生多次提交（覆盖更新），如果你想做“只能提交一次”，改成 create 并捕获 unique error
    const submission = await db.submission.upsert({
      where: {
        studentId_assignmentId: {
          studentId,
          assignmentId,
        },
      },
      update: {
        answers: gradedAnswers,
        totalScore: hasManualReview ? null : totalScore, // 如果有主观题，总分先为空，等待老师汇总
        status: hasManualReview ? "AUTO_GRADED" : "COMPLETED",
      },
      create: {
        studentId,
        assignmentId,
        answers: gradedAnswers,
        totalScore: hasManualReview ? null : totalScore,
        status: hasManualReview ? "AUTO_GRADED" : "COMPLETED",
      },
    });

    revalidatePath(`/dashboard/learn/[courseId]/assignments/${assignmentId}`);

    return { success: true, submissionId: submission.id };
  } catch (error: any) {
    console.error("[SUBMIT_ASSIGNMENT_ERROR]", error);
    return { success: false, error: error.message || "提交失败" };
  }
}

// actions/submission.ts 的最下方追加

export async function gradeSubmissionAction(
  submissionId: string,
  manualScores: Record<string, number>, // 格式: { questionId: 给定的分数 }
  teacherFeedback: string,
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "TEACHER") {
      throw new Error("无权操作");
    }

    // 1. 获取当前提交记录
    const submission = await db.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: { include: { questions: true } } },
    });

    if (!submission) throw new Error("未找到提交记录");

    let currentAnswers = submission.answers as any[];
    let newTotalScore = 0;

    // 2. 遍历答案，汇总机评分数，并注入老师的人工打分
    const updatedAnswers = currentAnswers.map((ans) => {
      // 找到对应的题目配置
      const q = submission.assignment.questions.find(
        (q) => q.id === ans.questionId,
      );
      if (!q) return ans;

      let finalScore = ans.score || 0;

      // 如果是主观编程题，采用老师传过来的 manualScores 中的分数
      if (
        q.gradingType === "MANUAL_REVIEW" &&
        manualScores[q.id] !== undefined
      ) {
        finalScore = manualScores[q.id];
        ans.score = finalScore;
        ans.isCorrect = finalScore > 0; // 只要给了分就算对（或者你可以自定义逻辑）
      }

      newTotalScore += finalScore;
      return ans;
    });

    // 3. 更新数据库
    await db.submission.update({
      where: { id: submissionId },
      data: {
        answers: updatedAnswers,
        totalScore: newTotalScore,
        status: "COMPLETED", // 批改完成
        teacherFeedback: teacherFeedback,
      },
    });

    // 清除缓存
    revalidatePath(
      `/dashboard/courses/${submission.assignment.courseId}/assignments/${submission.assignmentId}/submissions`,
    );
    revalidatePath(
      `/dashboard/courses/${submission.assignment.courseId}/assignments/${submission.assignmentId}/submissions/${submissionId}`,
    );

    return { success: true };
  } catch (error: any) {
    console.error("[GRADE_SUBMISSION_ERROR]", error);
    return { success: false, error: error.message };
  }
}
