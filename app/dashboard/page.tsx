// app/dashboard/page.tsx
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;

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

      {/* 预留数据图表位置 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center justify-center h-40">
          <span className="text-muted-foreground">ECharts 图表预留位 1</span>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center justify-center h-40">
          <span className="text-muted-foreground">ECharts 图表预留位 2</span>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center justify-center h-40">
          <span className="text-muted-foreground">快速操作区</span>
        </div>
      </div>
    </div>
  );
}
