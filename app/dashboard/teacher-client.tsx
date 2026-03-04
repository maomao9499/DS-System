"use client";

import { useState } from "react";
import Link from "next/link"; // 引入 Link
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCourse } from "@/lib/actions/course";
import { Course } from "@prisma/client"; // 引入 Prisma 生成的类型

// 去掉 any，使用强类型 Course[]
export function TeacherClient({
  initialCourses,
}: {
  initialCourses: Course[];
}) {
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false); // 新增：控制弹窗的开闭状态

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await createCourse(formData);
      setOpen(false); // 创建成功后，关闭弹窗
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">教学工作台</h2>
        {/* 将 open 状态绑定到 Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>新建课程</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新课程</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <Input
                name="title"
                placeholder="课程名称（如：农业遥感数据处理）"
                required
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "创建中..." : "确认创建"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {initialCourses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 修复：包裹 Link 并使用 asChild，点击后即可跳转到详情页 */}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/courses/${course.id}`}>进入管理</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
