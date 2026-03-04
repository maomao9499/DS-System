// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Database,
  LayoutDashboard,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";

import { auth } from "@/lib/auth"; // 引入我们配置好的 auth 函数
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/LogoutButton"; // 退出登录按钮

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. 在服务端直接获取用户会话
  const session = await auth();

  // 再次校验（虽然中间件拦过了，但双重保险是好习惯）
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role; // "TEACHER" | "STUDENT"

  // 2. 根据角色定义侧边栏菜单
  const sidebarLinks =
    role === "TEACHER"
      ? [
          { href: "/dashboard", icon: LayoutDashboard, label: "教学看板" },
          { href: "/dashboard/courses", icon: BookOpen, label: "课程管理" },
          { href: "/dashboard/students", icon: Users, label: "学生作业批改" },
          {
            href: "/dashboard/datasets",
            icon: Database,
            label: "实训数据分发",
          },
        ]
      : [
          { href: "/dashboard", icon: LayoutDashboard, label: "学习看板" },
          { href: "/dashboard/my-courses", icon: BookOpen, label: "我的课程" },
          { href: "/dashboard/lab", icon: Database, label: "数据实训室" },
        ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* 左侧边栏 (PC端) */}
      <aside className="hidden w-64 flex-col border-r bg-muted/20 p-6 md:flex">
        <div className="mb-8 flex items-center gap-2 font-bold text-xl tracking-tight">
          数据科学<span className="text-primary">+</span> 工作区
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <link.icon className="h-5 w-5 text-muted-foreground" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* 底部用户信息与退出按钮 */}
        <div className="mt-auto flex flex-col gap-4 border-t pt-4">
          <div className="flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-muted-foreground" />
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">
                {session.user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {role === "TEACHER" ? "教师" : "学生"}
              </span>
            </div>
          </div>
          {/* 加入退出登录按钮 */}
          <LogoutButton
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          />
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <main className="flex-1 p-6 md:p-8">
        {/* 这里渲染 dashboard 具体的子页面 */}
        {children}
      </main>
    </div>
  );
}
