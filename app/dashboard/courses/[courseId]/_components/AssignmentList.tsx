"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Assignment } from "@prisma/client";

export function AssignmentList({
  courseId,
  initialAssignments,
}: {
  courseId: string;
  initialAssignments: Assignment[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">实训作业管理</h3>
        {/* 这里不再用 Dialog，而是直接跳转到独立的新建页面 */}
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/dashboard/courses/${courseId}/assignments/new`}>
            添加实训作业
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {initialAssignments.length === 0 && (
          <p className="text-sm text-muted-foreground italic border border-dashed p-4 rounded text-center">
            暂无实训作业，请点击右上角添加
          </p>
        )}
        {initialAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex items-center justify-between p-3 border rounded-md bg-card"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{assignment.title}</span>
              {!assignment.published && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  草稿
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="default" size="sm" asChild>
                <Link
                  href={`/dashboard/courses/${courseId}/assignments/${assignment.id}/submissions`}
                >
                  批改作业
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href={`/dashboard/courses/${courseId}/assignments/${assignment.id}`}
                >
                  编辑内容
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
