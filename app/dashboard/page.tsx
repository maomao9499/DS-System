import { auth } from "@/lib/auth";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { ResourceChart } from "@/components/dashboard/ResourceChart";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user?.role || "STUDENT") as "TEACHER" | "STUDENT";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          欢迎回来, {session?.user?.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          {role === "TEACHER"
            ? "这里是您的教学控制台，您可以管理课程、批改作业以及分发数据集。"
            : "这里是您的学习看板，您可以继续学习课程或进入实训室进行数据分析。"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 h-80">
          <ActivityChart role={role} />
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 h-80">
          <ResourceChart role={role} />
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 h-80">
          <QuickActions role={role} />
        </div>
      </div>
    </div>
  );
}