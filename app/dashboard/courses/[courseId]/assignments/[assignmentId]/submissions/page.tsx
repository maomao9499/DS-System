import { prisma as db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SubmissionsListPage({
  params,
}: {
  params: Promise<{ courseId: string; assignmentId: string }>;
}) {
  const session = await auth();
  const { courseId, assignmentId } = await params;

  if (!session?.user || session.user.role !== "TEACHER") redirect("/dashboard");

  // 获取作业信息和所有的提交记录
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      submissions: {
        include: { student: true }, // 连带查出学生信息
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!assignment) return <div>作业不存在</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link
        href={`/dashboard/courses/${courseId}`}
        className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        返回课程大纲
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          批改大厅：{assignment.title}
        </h1>
        <p className="text-muted-foreground mt-2">
          共收到 {assignment.submissions.length} 份作业提交。
        </p>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">学生姓名 / 账号</th>
              <th className="px-6 py-4 font-medium">提交时间</th>
              <th className="px-6 py-4 font-medium">状态</th>
              <th className="px-6 py-4 font-medium">总得分</th>
              <th className="px-6 py-4 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {assignment.submissions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  暂无学生提交作业
                </td>
              </tr>
            )}
            {assignment.submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">
                  {sub.student.name || sub.student.email}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {sub.updatedAt.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  {sub.status === "COMPLETED" ? (
                    <span className="flex items-center text-emerald-600 bg-emerald-100 px-2 py-1 rounded w-fit text-xs font-bold">
                      <CheckCircle className="w-3 h-3 mr-1" /> 已批改
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-600 bg-amber-100 px-2 py-1 rounded w-fit text-xs font-bold">
                      <Clock className="w-3 h-3 mr-1" /> 待人工批阅
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-lg">
                  {sub.totalScore !== null ? sub.totalScore : "-"}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    asChild
                    variant={sub.status === "COMPLETED" ? "outline" : "default"}
                    size="sm"
                  >
                    <Link
                      href={`/dashboard/courses/${courseId}/assignments/${assignmentId}/submissions/${sub.id}`}
                    >
                      {sub.status === "COMPLETED" ? "查看批改" : "进入批改"}
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
