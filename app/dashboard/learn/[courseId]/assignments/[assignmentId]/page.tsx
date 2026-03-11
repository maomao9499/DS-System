import { prisma as db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { StudentWorkspace } from "@/components/assigments/StudentWorkspace"; // 学生作业工作台组件
export default async function StudentAssignmentPage({
  params,
}: {
  params: Promise<{ courseId: string; assignmentId: string }>;
}) {
  const session = await auth();
  const { courseId, assignmentId } = await params;

  if (!session?.user) redirect("/login");

  // 1. 获取作业及题目信息
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!assignment || !assignment.published) notFound();

  // 2. 核心安全机制：洗脱正确答案！
  // 绝不能把含有标准答案的 metadata 直接传给前端客户端组件
  const sanitizedQuestions = assignment.questions.map((q) => {
    const safeMetadata = { ...((q.metadata as any) || {}) };

    // 如果是选择题或填空题，删除 correct 字段
    if (safeMetadata.correct) {
      delete safeMetadata.correct;
    }

    return {
      ...q,
      metadata: safeMetadata,
    };
  });

  const safeAssignmentData = {
    ...assignment,
    questions: sanitizedQuestions,
  };

  // 3. 检查学生是否已经提交过（可选：如果提交过了，可以提示或只读展示）
  const existingSubmission = await db.submission.findUnique({
    where: {
      studentId_assignmentId: {
        studentId: session.user.id,
        assignmentId: assignment.id,
      },
    },
  });

  return (
    // 注意：外层不使用默认的 max-w 容器，而是全屏沉浸式渲染
    <div className="w-full h-full">
      {existingSubmission ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-muted/20">
          <h2 className="text-2xl font-bold mb-4">✅ 你已完成本次实训</h2>
          <p className="text-muted-foreground mb-6">
            当前状态：
            {existingSubmission.status === "COMPLETED"
              ? "批改完成"
              : "等待人工批阅"}
          </p>
          <p className="text-xl font-bold text-primary mb-8">
            得分：
            {existingSubmission.totalScore !== null
              ? `${existingSubmission.totalScore} 分`
              : "待定"}
          </p>
        </div>
      ) : (
        // 渲染我们在上一步写的工作台组件
        <StudentWorkspace assignment={safeAssignmentData} courseId={courseId} />
      )}
    </div>
  );
}
