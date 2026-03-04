import { prisma as db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronLeft } from "lucide-react";

export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  const { courseId } = await params;

  if (!session?.user) redirect("/login");

  // 1. 鉴权：只有选了这门课的学生（或者课程的老师）才能进入
  const isTeacher = session.user.role === "TEACHER";

  if (!isTeacher) {
    const enrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id!,
          courseId: courseId,
        },
      },
    });
    if (!enrollment) redirect("/dashboard"); // 没选课，踢回看板
  }

  // 2. 获取课程信息及已发布的课时大纲
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        where: { isPublished: true }, // 学生只能看到已发布的课时
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) redirect("/dashboard");

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-8">
      {/* 抵消 dashboard layout 自带的 p-8 padding，实现全屏沉浸感 */}

      {/* 左侧：章节目录侧边栏 */}
      <aside className="w-72 border-r bg-muted/10 overflow-y-auto hidden md:flex flex-col">
        <div className="p-4 border-b bg-background">
          <Link
            href="/dashboard"
            className="flex items-center text-xs text-muted-foreground hover:text-primary mb-3"
          >
            <ChevronLeft className="w-3 h-3 mr-1" /> 返回看板
          </Link>
          <h2 className="font-bold leading-tight">{course.title}</h2>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">
            课时目录
          </div>
          {course.lessons.length === 0 && (
            <p className="text-sm text-muted-foreground px-2">
              老师还没发布任何内容哦~
            </p>
          )}
          {course.lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/dashboard/learn/${courseId}/lessons/${lesson.id}`}
              className="flex items-center gap-3 p-2.5 text-sm rounded-md hover:bg-muted transition-colors"
            >
              <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate">{lesson.title}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* 右侧：主内容区 */}
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
