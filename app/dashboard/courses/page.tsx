import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/db";
import { redirect } from "next/navigation";
import { TeacherClient } from "../teacher-client"; // 引入我们之前写好的组件

export default async function TeacherCoursesPage() {
  const session = await auth();

  if (session?.user?.role !== "TEACHER") {
    redirect("/dashboard"); // 不是老师则踢回总看板
  }

  // 获取该老师创建的所有课程
  const courses = await db.course.findMany({
    where: { teacherId: session.user.id },
  });

  return (
    <div>
      <TeacherClient initialCourses={courses} />
    </div>
  );
}
