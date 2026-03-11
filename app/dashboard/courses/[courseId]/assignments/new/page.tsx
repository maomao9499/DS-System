import { AssignmentEditor } from "@/components/assigments/AssignmentEditor";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewAssignmentPage(props: {
  params: Promise<{ courseId: string }>;
}) {
  const params = await props.params;
  const courseId = params.courseId;
  // 页面级别的权限校验（可选，双重保险）
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">作业配置工作台</h1>
        <p className="text-muted-foreground">
          为你的课程设计客观题与代码实训。
        </p>
      </div>

      {/* 引入我们刚才写的超大表单组件 */}
      <AssignmentEditor courseId={courseId} />
    </div>
  );
}
