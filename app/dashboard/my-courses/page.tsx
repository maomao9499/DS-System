import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CourseCard } from "@/components/course/CourseCard";

export default async function StudentMyCoursesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (session?.user?.role !== "STUDENT") {
    redirect("/dashboard");
  }

  // 查询学生已加入的课程
  const enrollments = await db.enrollment.findMany({
    where: { studentId: userId },
    include: { course: { include: { teacher: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">我的课程</h2>
        <p className="text-muted-foreground">这里是你已加入的所有实训课程。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {enrollments.map((e) => (
          <CourseCard
            key={e.id}
            course={{
              ...e.course,
              coverImage: e.course.coverImage ?? undefined,
              teacher: {
                ...e.course.teacher,
                name: e.course.teacher.name ?? "未知教师",
              },
            }}
            isEnrolled={true}
          />
        ))}

        {enrollments.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-full border border-dashed p-8 text-center rounded-lg">
            你还没有加入任何课程，请前往顶部导航栏的“课程体系”中发现好课！
          </p>
        )}
      </div>
    </div>
  );
}
