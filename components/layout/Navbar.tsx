import Link from "next/link";
import { Menu, X } from "lucide-react"; // 添加 X 图标

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NavLinks } from "./NavLinks"; // 引入客户端组件

const routes = [
  { href: "/courses", label: "课程体系" },
  { href: "/platform", label: "数据实训" },
  { href: "/projects", label: "成果展示" },
  { href: "/members", label: "团队成员" },
];

export async function Navbar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const role = (session?.user?.role || "STUDENT") as "TEACHER" | "STUDENT";

  const dashboardLinks =
    role === "TEACHER"
      ? [
          { href: "/dashboard", label: "教学看板" },
          { href: "/dashboard/courses", label: "课程管理" },
          { href: "/dashboard/students", label: "学生管理" },
          { href: "/dashboard/aichat", label: "AI 助手" },
          { href: "/dashboard/datasets", label: "实训数据分发" },
        ]
      : [
          { href: "/dashboard", label: "学习看板" },
          { href: "/dashboard/my-courses", label: "我的课程" },
          { href: "/dashboard/aichat", label: "AI 助手" },
          { href: "/dashboard/lab", label: "数据实训室" },
        ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        {/* 左侧区域：Logo & PC端导航 */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-tight">
              数据科学<span className="text-primary">+</span>
            </span>
          </Link>
          {/* PC端可折叠导航 - 客户端组件 */}
          <NavLinks />
        </div>

        {/* 右侧区域：主题切换 & 登录按钮 & 移动端菜单 */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <ThemeToggle />

          {/* 【PC 端动态切换】 */}
          <div className="hidden sm:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium hover:underline text-muted-foreground"
                >
                  工作区
                </Link>
                <LogoutButton variant="outline" showIcon={false} />
              </>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/login">登录</Link>
              </Button>
            )}
          </div>

          {/* 【移动端导航 (Sheet)】 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 sm:w-75">
              <SheetHeader className="flex items-center justify-between">
                <SheetTitle className="text-left">数据科学+</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                    <span className="sr-only">关闭菜单</span>
                  </Button>
                </SheetClose>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {/* 公共页面路由 */}
                {routes.map((route) => (
                  <SheetClose asChild key={route.href}>
                    <Link
                      href={route.href}
                      className="text-base font-medium text-muted-foreground hover:text-foreground"
                    >
                      {route.label}
                    </Link>
                  </SheetClose>
                ))}
                {/* 工作区导航 (仅登录后显示，与桌面端 Sidebar 一致) */}
                {isLoggedIn && (
                  <>
                    <div className="mt-2 border-t" />
                    {dashboardLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className="text-base font-medium text-muted-foreground hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </>
                )}
                {/* 手机端登录/登出 */}
                <div className="mt-4 pt-4 border-t flex flex-col gap-3">
                  {isLoggedIn ? (
                    <SheetClose asChild>
                      <div>
                        <LogoutButton variant="outline" className="w-full" />
                      </div>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Button asChild className="w-full">
                        <Link href="/login">登录</Link>
                      </Button>
                    </SheetClose>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
