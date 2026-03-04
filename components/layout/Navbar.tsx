import Link from "next/link";
import { Menu } from "lucide-react"; // 引入汉堡包图标

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { auth } from "@/lib/auth"; // <--- 引入 auth
import { LogoutButton } from "@/components/auth/LogoutButton"; // <--- 登出的按钮

// 将导航数据提取出来，方便 PC 端和移动端复用
const routes = [
  { href: "/courses", label: "课程体系" },
  { href: "/platform", label: "数据实训" },
  { href: "/projects", label: "成果展示" },
  { href: "/members", label: "团队成员" },
];

export async function Navbar() {
  const session = await auth(); // 获取当前用户的会话信息
  const isLoggedIn = !!session?.user; // 判断用户是否已登录
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

          {/* 【PC 端导航】只有在 md (768px) 以上才显示 */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 右侧区域：主题切换 & 登录按钮 & 移动端菜单 */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <ThemeToggle />

          {/* 【魔法发生在这里】PC 端动态渲染 登录登出按钮的动态切换 */}
          <div className="hidden sm:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium hover:underline text-muted-foreground"
                >
                  进入工作区
                </Link>
                <LogoutButton variant="outline" showIcon={false} />
              </>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/login">登录</Link>
              </Button>
            )}
          </div>

          {/* 【移动端导航 (Sheet)】只有在 md (768px) 以下才显示 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 sm:w-75">
              <SheetHeader>
                <SheetTitle className="text-left">数据科学+</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="text-base font-medium text-muted-foreground hover:text-foreground"
                  >
                    {route.label}
                  </Link>
                ))}
                {/* 手机端把登录按钮也放进抽屉里 */}
                {/* 【魔法发生在这里】移动端抽屉动态渲染 */}
                <div className="mt-4 pt-4 border-t sm:hidden flex flex-col gap-3">
                  {isLoggedIn ? (
                    <>
                      <Button asChild variant="default" className="w-full">
                        <Link href="/dashboard">进入工作区</Link>
                      </Button>
                      <LogoutButton variant="outline" className="w-full" />
                    </>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href="/login">立即登录</Link>
                    </Button>
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
