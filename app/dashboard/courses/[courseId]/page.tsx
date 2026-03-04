import { prisma as db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { CourseEditor } from "./_components/CourseEditor";
import { LessonList } from "./_components/LessonList"; // 新增引入
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  const { courseId } = await params;

  // 连带 lessons 一起查询出来，按 position 升序排序
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) notFound();

  if (course.teacherId !== session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <Link
        href="/dashboard"
        className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        返回看板
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          课程管理：{course.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：课程基础信息编辑 */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold border-b pb-2">基础信息</h3>
          <CourseEditor course={course} />
        </div>

        {/* 右侧：课时大纲管理 */}
        <div className="space-y-4">
          {/* 传入 lessons 数据 */}
          <LessonList courseId={course.id} initialLessons={course.lessons} />
        </div>
      </div>
    </div>
  );
}
