"use server";

import { prisma as db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createCourse(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "TEACHER") throw new Error("无权操作");

  const title = formData.get("title") as string;

  const course = await db.course.create({
    data: {
      title,
      teacherId: session.user.id!,
    },
  });

  revalidatePath("/dashboard");
  return course;
}

// lib/actions/course.ts

export async function enrollCourse(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("请先登录");

  await db.enrollment.create({
    data: {
      studentId: session.user.id,
      courseId: courseId,
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/courses");
}

export async function updateCourse(courseId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "TEACHER") throw new Error("无权操作");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const published = formData.get("published") === "on";

  await db.course.update({
    where: { id: courseId, teacherId: session.user.id }, // 确保只能修改自己的课程
    data: {
      title,
      description,
      published,
    },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true };
}
