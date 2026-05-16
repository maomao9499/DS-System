"use client";

import Link from "next/link";
import {
  BookOpen,
  MessageSquare,
  Database,
  Users,
  GraduationCap,
  FileText,
} from "lucide-react";

interface QuickAction {
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface QuickActionsProps {
  role: "TEACHER" | "STUDENT";
}

export function QuickActions({ role }: QuickActionsProps) {
  const actions: QuickAction[] =
    role === "TEACHER"
      ? [
          {
            href: "/dashboard/courses",
            label: "课程管理",
            icon: <BookOpen className="h-4 w-4" />,
            color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          },
          {
            href: "/dashboard/students",
            label: "学生管理",
            icon: <Users className="h-4 w-4" />,
            color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          },
          {
            href: "/dashboard/datasets",
            label: "数据分发",
            icon: <Database className="h-4 w-4" />,
            color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          },
          {
            href: "/dashboard/aichat",
            label: "AI 助手",
            icon: <MessageSquare className="h-4 w-4" />,
            color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
          },
          {
            href: "/dashboard/courses",
            label: "批改作业",
            icon: <FileText className="h-4 w-4" />,
            color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
          },
        ]
      : [
          {
            href: "/dashboard/my-courses",
            label: "我的课程",
            icon: <BookOpen className="h-4 w-4" />,
            color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          },
          {
            href: "/dashboard/lab",
            label: "数据实训室",
            icon: <GraduationCap className="h-4 w-4" />,
            color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          },
          {
            href: "/dashboard/aichat",
            label: "AI 助手",
            icon: <MessageSquare className="h-4 w-4" />,
            color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
          },
          {
            href: "/dashboard/lab",
            label: "开始实训",
            icon: <Database className="h-4 w-4" />,
            color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          },
        ];

  return (
    <div className="flex flex-col h-full">
      <div className="text-sm font-semibold mb-3">快捷操作</div>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Link key={action.label} href={action.href}>
            <div className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-md ${action.color}`}
              >
                {action.icon}
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
