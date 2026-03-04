import { prisma as db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CourseCard } from "@/components/course/CourseCard";

export default async function CoursesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // 1. 获取所有已设为“公开/发布”的课程，并包含教师信息
  const courses = await db.course.findMany({
    where: { published: true },
    include: { teacher: true },
    orderBy: { createdAt: "desc" },
  });

  // 2. 如果用户已登录，获取他已选的课程 ID 列表，用于判断按钮状态
  let enrolledCourseIds: string[] = [];
  if (userId) {
    const enrollments = await db.enrollment.findMany({
      where: { studentId: userId },
      select: { courseId: true }, // 只需要查出 courseId
    });
    enrolledCourseIds = enrollments.map((e) => e.courseId);
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-8 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          课程广场
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          探索并加入由专业导师提供的数据科学实训课程。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses.length === 0 && (
          <div className="col-span-full py-12 text-center border rounded-xl bg-muted/20 border-dashed">
            <p className="text-muted-foreground">
              老师们正在疯狂备课中，暂时还没有公开的课程哦~
            </p>
          </div>
        )}

        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            isEnrolled={enrolledCourseIds.includes(course.id)}
          />
        ))}
      </div>
    </div>
  );
}
