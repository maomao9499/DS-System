import { prisma as db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LessonEditor } from "./_components/LessonEditor";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const session = await auth();

  // 必须 await params 才能拿到动态路由参数
  const { courseId, lessonId } = await params;

  // 1. 校验课程归属权
  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  if (!course || course.teacherId !== session?.user?.id) {
    redirect("/dashboard");
  }

  // 2. 获取课时数据
  const lesson = await db.lesson.findUnique({
    where: {
      id: lessonId,
      courseId: courseId, // 确保这个课时确实属于这个课程
    },
  });

  if (!lesson) notFound();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* 顶部导航面包屑 */}
      <Link
        href={`/dashboard/courses/${courseId}`}
        className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        返回课程大纲
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          编辑课时：{lesson.title}
        </h1>
        <p className="text-muted-foreground mt-2">
          在此编写实训指导书。你可以使用 Markdown 语法来排版代码块和数据公式。
        </p>
      </div>

      <div className="border-t pt-6">
        <LessonEditor courseId={courseId} lesson={lesson} />
      </div>
    </div>
  );
}
