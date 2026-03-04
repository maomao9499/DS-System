"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateCourse } from "@/lib/actions/course";
import { Course } from "@prisma/client"; // 引入类型

// 修复 any
export function CourseEditor({ course }: { course: Course }) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    try {
      await updateCourse(course.id, formData);
      alert("课程更新成功"); // 暂用 alert 替代，你可以换成 toast
    } catch (error) {
      alert("更新失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-6 max-w-4xl">
      <div className="space-y-2">
        <label className="text-sm font-medium">课程名称</label>
        <Input name="title" defaultValue={course.title} required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">课程描述 (支持 Markdown)</label>
        <Textarea
          name="description"
          defaultValue={course.description || ""}
          rows={10}
          placeholder="介绍这门课的实训目标和数据集..."
        />
      </div>

      <div className="flex items-center space-x-2 border p-4 rounded-lg bg-card">
        <input
          type="checkbox"
          name="published"
          id="published"
          defaultChecked={course.published}
          className="h-4 w-4"
        />
        <label htmlFor="published" className="text-sm font-medium">
          公开课（勾选后学生可在课程广场看到此课）
        </label>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "保存中..." : "保存修改"}
      </Button>
    </form>
  );
}
