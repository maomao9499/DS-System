"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createLesson } from "@/lib/actions/lesson";
import { Lesson } from "@prisma/client";

export function LessonList({
  courseId,
  initialLessons,
}: {
  courseId: string;
  initialLessons: Lesson[];
}) {
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await createLesson(courseId, formData);
      setOpen(false);
    } catch (error) {
      alert("创建失败");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">实训课时管理</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              添加新课时
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新课时</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <Input
                name="title"
                placeholder="例如：第1讲 数据清洗基础"
                required
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "创建中..." : "确认添加"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-2">
        {initialLessons.length === 0 && (
          <p className="text-sm text-muted-foreground italic border border-dashed p-4 rounded text-center">
            暂无课时，请点击右上角添加
          </p>
        )}
        {initialLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between p-3 border rounded-md bg-card"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                章节 {lesson.position}:
              </span>
              <span className="text-sm">{lesson.title}</span>
              {!lesson.isPublished && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  草稿
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
              >
                编辑内容
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
