import { prisma as db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LearnCourseOverviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        take: 1, // 只取第一节课用于“开始学习”按钮
      },
    },
  });

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold tracking-tight">
        {course?.title}
      </h1>

      <div className="prose dark:prose-invert max-w-none text-muted-foreground">
        <p>{course?.description || "这门课的老师很神秘，什么都没写..."}</p>
      </div>

      <div className="pt-6 border-t">
        {course?.lessons && course.lessons.length > 0 ? (
          <Button asChild size="lg">
            <Link
              href={`/dashboard/learn/${courseId}/lessons/${course.lessons[0].id}`}
            >
              开始学习：{course.lessons[0].title}
            </Link>
          </Button>
        ) : (
          <Button disabled size="lg" variant="secondary">
            课程内容还在快马加鞭准备中...
          </Button>
        )}
      </div>
    </div>
  );
}
