import { prisma as db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TerminalSquare, BookOpen, ChevronRight } from "lucide-react"; // 引入一些图标让页面更好看

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
      assignments: {
        where: { published: true }, // 核心：只查出老师已发布的作业
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-12">
      {/* 顶部：课程标题与简介 */}
      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight">
          {course?.title}
        </h1>
        <div className="prose dark:prose-invert max-w-none text-muted-foreground text-lg">
          <p>{course?.description || "这门课的老师很神秘，什么都没写..."}</p>
        </div>
      </div>

      {/* 理论课入口 */}
      <div className="pt-6 border-t">
        {course?.lessons && course.lessons.length > 0 ? (
          <Button asChild size="lg" className="text-base px-8">
            <Link
              href={`/dashboard/learn/${courseId}/lessons/${course.lessons[0].id}`}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              开始学习：{course.lessons[0].title}
            </Link>
          </Button>
        ) : (
          <Button disabled size="lg" variant="secondary">
            课程内容还在快马加鞭准备中...
          </Button>
        )}
      </div>

      {/* 核心新增：实训作业挑战区块 */}
      <div className="pt-10 space-y-6">
        <div className="flex items-center gap-2">
          <TerminalSquare className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">实训作业与挑战</h2>
        </div>

        {course?.assignments && course.assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.assignments.map((assignment, index) => (
              <div
                key={assignment.id}
                className="group relative border p-6 rounded-xl bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg line-clamp-2">
                      {assignment.title}
                    </h3>
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                      Mission {index + 1}
                    </span>
                  </div>
                  {/* 如果有简介，简单截断显示 */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                    测试你的数据分析与编程能力。
                  </p>
                </div>

                <Button
                  asChild
                  variant="secondary"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  <Link
                    href={`/dashboard/learn/${courseId}/assignments/${assignment.id}`}
                  >
                    进入实训室 <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed p-10 rounded-xl text-center bg-muted/10">
            <TerminalSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              目前还没有发布实训作业哦，先去学习理论课吧！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
