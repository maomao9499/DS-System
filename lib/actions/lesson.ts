"use server";

import { prisma as db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. 创建新课时
export async function createLesson(courseId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "TEACHER") throw new Error("无权操作");

  // 校验课程是否属于该教师
  const courseOwner = await db.course.findUnique({
    where: { id: courseId, teacherId: session.user.id },
  });
  if (!courseOwner) throw new Error("无权操作此课程");

  const title = formData.get("title") as string;

  // 获取当前课程下最大的 position 以便排序
  const lastLesson = await db.lesson.findFirst({
    where: { courseId },
    orderBy: { position: "desc" },
  });
  const newPosition = lastLesson ? lastLesson.position + 1 : 1;

  const lesson = await db.lesson.create({
    data: {
      title,
      courseId,
      position: newPosition,
    },
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true, id: lesson.id };
}

// 2. 更新课时（保存 Markdown 内容）
export async function updateLesson(
  courseId: string,
  lessonId: string,
  formData: FormData,
) {
  const session = await auth();
  if (session?.user?.role !== "TEACHER") throw new Error("无权操作");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const isPublished = formData.get("isPublished") === "on";

  await db.lesson.update({
    where: { id: lessonId },
    data: { title, content, isPublished },
  });

  revalidatePath(`/dashboard/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true };
}
