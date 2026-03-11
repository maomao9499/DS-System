import { prisma as db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AssignmentEditor } from "@/components/assigments/AssignmentEditor";

export default async function EditAssignmentPage({
  params,
}: {
  params: Promise<{ courseId: string; assignmentId: string }>;
}) {
  const session = await auth();
  const { courseId, assignmentId } = await params;

  if (!session?.user || session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  // 获取作业及其包含的题目信息
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      questions: {
        orderBy: { order: "asc" }, // 按题目顺序排列
      },
    },
  });

  if (!assignment) notFound();

  // 格式化 initialData，匹配前端 react-hook-form 的数据结构
  const initialData = {
    id: assignment.id, // 带着 ID 传给前端，让前端知道这是编辑模式
    title: assignment.title,
    description: assignment.description || "",
    questions: assignment.questions.map((q) => ({
      type: q.type,
      content: q.content,
      score: q.score,
      metadata: q.metadata, // Prisma 查出来的 JSON 会自动映射
    })),
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          编辑作业：{assignment.title}
        </h1>
      </div>
      <AssignmentEditor courseId={courseId} initialData={initialData} />
    </div>
  );
}
