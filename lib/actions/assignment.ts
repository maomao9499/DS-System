"use server";

import { auth } from "@/lib/auth"; // 根据你的 Auth.js 配置路径调整
import { prisma as db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 定义从前端传来的数据结构类型
interface QuestionData {
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILL_BLANK" | "PROGRAMMING";
  content: string;
  score: number;
  metadata?: any;
}

interface AssignmentData {
  title: string;
  description?: string;
  questions: QuestionData[];
}

export async function createAssignmentAction(
  courseId: string,
  data: AssignmentData,
) {
  try {
    // 1. 鉴权：检查是否登录，且是否为教师角色
    const session = await auth();
    if (!session?.user || session.user.role !== "TEACHER") {
      throw new Error("未授权：只有教师可以发布作业");
    }

    // 2. 校验权限：确保这门课存在，且属于当前这位老师
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    });

    if (!course || course.teacherId !== session.user.id) {
      throw new Error("权限不足：您只能在自己创建的课程中发布作业");
    }

    // 3. 数据库操作：利用 Prisma 的 "嵌套写入 (Nested Writes)" 一次性插入作业和所有题目
    const assignment = await db.assignment.create({
      data: {
        title: data.title,
        description: data.description,
        courseId: courseId,
        published: true, // 默认发布，你也可以在此处根据需求设为 false 做草稿功能

        // 嵌套创建该作业下的所有题目
        questions: {
          create: data.questions.map((q, index) => ({
            type: q.type,
            content: q.content,
            score: q.score,
            metadata: q.metadata,
            order: index, // 记录题目的顺序
            // 判断是否需要人工批改：如果是编程题，默认设为人工批阅
            gradingType:
              q.type === "PROGRAMMING" ? "MANUAL_REVIEW" : "AUTO_STRICT",
          })),
        },
      },
    });

    // 4. 清除缓存，让前端页面刷新获取最新数据
    revalidatePath(`/dashboard/courses/${courseId}`);
    revalidatePath(`/dashboard/courses/${courseId}/assignments`);

    return { success: true, assignmentId: assignment.id };
  } catch (error: any) {
    console.error("[CREATE_ASSIGNMENT_ERROR]", error);
    return { success: false, error: error.message || "内部服务器错误" };
  }
}
// actions/assignment.ts 的最下方追加

export async function updateAssignmentAction(
  assignmentId: string,
  courseId: string,
  data: AssignmentData,
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "TEACHER") {
      throw new Error("未授权操作");
    }

    // 校验权限：确保这门课是这个老师的
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    });

    if (!course || course.teacherId !== session.user.id) {
      throw new Error("权限不足");
    }

    // 数据库操作：更新作业内容。
    // 为了应对“老师可能删除了旧题目、增加了新题目、或者修改了旧题目顺序”的复杂场景，
    // 最稳妥且干净的做法是：利用 Prisma 嵌套写入，先删除该作业下的所有旧题目，再把表单里的新题目全量写入。
    await db.assignment.update({
      where: { id: assignmentId },
      data: {
        title: data.title,
        description: data.description,
        questions: {
          deleteMany: {}, // 暴力且优雅：清空当前作业的旧题目
          create: data.questions.map((q, index) => ({
            type: q.type,
            content: q.content,
            score: q.score,
            metadata: q.metadata,
            order: index,
            gradingType:
              q.type === "PROGRAMMING" ? "MANUAL_REVIEW" : "AUTO_STRICT",
          })),
        },
      },
    });

    revalidatePath(`/dashboard/courses/${courseId}`);
    revalidatePath(
      `/dashboard/courses/${courseId}/assignments/${assignmentId}`,
    );

    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_ASSIGNMENT_ERROR]", error);
    return { success: false, error: error.message || "内部服务器错误" };
  }
}
