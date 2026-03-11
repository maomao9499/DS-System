import { prisma as db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { GradingWorkspace } from "@/components/assigments/GradingWorkspace"; // 教师批改工作台组件
export default async function GradeDetailPage({
  params,
}: {
  params: Promise<{
    courseId: string;
    assignmentId: string;
    submissionId: string;
  }>;
}) {
  const session = await auth();
  const { submissionId } = await params;

  if (!session?.user || session.user.role !== "TEACHER") redirect("/dashboard");

  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: true,
      assignment: {
        include: {
          questions: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!submission) notFound();

  return (
    <div className="w-full h-full">
      {/* 沉浸式渲染组件 */}
      <GradingWorkspace submission={submission} />
    </div>
  );
}
