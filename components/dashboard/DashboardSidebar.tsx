// components/dashboard/DashboardSidebar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  UserCircle,
  LayoutDashboard,
  BookOpen,
  Users,
  Database,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";

// 图标名称 → 组件映射
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  Users,
  Database,
};
interface SidebarLink {
  href: string;
  icon: string; // 改为字符串，后续通过 iconMap 获取组件
  label: string;
}

interface DashboardSidebarProps {
  links: SidebarLink[];
  userName: string;
  userRole: "TEACHER" | "STUDENT";
}

export function DashboardSidebar({
  links,
  userName,
  userRole,
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden flex-col border-r bg-muted/20 p-4 md:flex transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* 顶部：Logo + 折叠按钮 */}
      <div className="mb-6 flex items-center gap-2">
        {/* Logo 始终渲染，用 opacity + width 控制显隐 */}
        <div
          className={cn(
            "font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
          )}
        >
          数据科学<span className="text-primary">+</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 flex-shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* 导航链接 */}
      <nav className="flex flex-1 flex-col gap-2">
        {links.map((link) => {
          const Icon = iconMap[link.icon]; // 根据字符串获取组件
          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full gap-3",
                  collapsed ? "justify-center px-2" : "justify-start",
                )}
                title={collapsed ? link.label : undefined}
              >
                {Icon && (
                  <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-300",
                    collapsed
                      ? "max-w-0 opacity-0"
                      : "max-w-[200px] opacity-100",
                  )}
                >
                  {link.label}
                </span>{" "}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* 底部用户信息与退出按钮 */}
      <div className="mt-auto flex flex-col gap-3 border-t pt-4">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center",
          )}
        >
          <UserCircle className="h-8 w-8 text-muted-foreground flex-shrink-0" />
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{userName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {userRole === "TEACHER" ? "教师" : "学生"}
              </span>
            </div>
          )}
        </div>
        <LogoutButton
          variant="ghost"
          className={cn(
            "text-muted-foreground hover:text-foreground",
            collapsed ? "w-full justify-center px-2" : "w-full justify-start",
          )}
          showIcon={true}
          showText={!collapsed}
        />
      </div>
    </aside>
  );
}
