// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }
  // 添加类型断言，因为前面已校验登录
  const role = (session.user.role || "STUDENT") as "TEACHER" | "STUDENT";

  const sidebarLinks =
    role === "TEACHER"
      ? [
          { href: "/dashboard", icon: "LayoutDashboard", label: "教学看板" },
          { href: "/dashboard/courses", icon: "BookOpen", label: "课程管理" },
          { href: "/dashboard/students", icon: "Users", label: "学生管理" },
          { href: "dashboard/aichat", icon: "MessageSquare", label: "AI 助手" },
          {
            href: "/dashboard/datasets",
            icon: "Database",
            label: "实训数据分发",
          },
        ]
      : [
          { href: "/dashboard", icon: "LayoutDashboard", label: "学习看板" },
          {
            href: "/dashboard/my-courses",
            icon: "BookOpen",
            label: "我的课程",
          },
          { href: "dashboard/aichat", icon: "MessageSquare", label: "AI 助手" },
          { href: "/dashboard/lab", icon: "Database", label: "数据实训室" },
        ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* 可折叠侧边栏 */}
      <DashboardSidebar
        links={sidebarLinks}
        userName={session.user.name || "用户"}
        userRole={role}
      />

      {/* 右侧主内容区 */}
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
