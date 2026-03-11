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

  const role = session.user.role;

  const sidebarLinks =
    role === "TEACHER"
      ? [
          { href: "/dashboard", label: "教学看板" },
          { href: "/dashboard/courses", label: "课程管理" },
          { href: "/dashboard/students", label: "学生管理" },
          {
            href: "/dashboard/datasets",
            label: "实训数据分发",
          },
        ]
      : [
          { href: "/dashboard", label: "学习看板" },
          { href: "/dashboard/my-courses", label: "我的课程" },
          { href: "/dashboard/lab", label: "数据实训室" },
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
