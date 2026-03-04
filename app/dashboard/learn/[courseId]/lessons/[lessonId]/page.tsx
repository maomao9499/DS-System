import { prisma as db } from "@/lib/db";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { lessonId } = await params;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId, isPublished: true },
  });

  if (!lesson) notFound();

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto">
      <div className="mb-10 pb-6 border-b">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {lesson.title}
        </h1>
      </div>

      {/* 调用我们在上一环节写好的带高亮的 Markdown 渲染器 */}
      <MarkdownRenderer content={lesson.content || "*本课时暂无文本内容*"} />

      {/* 底部可以预留“下一页”或“标记完成”的区域 */}
      <div className="mt-16 pt-8 border-t flex justify-between items-center text-sm text-muted-foreground">
        <p>太棒了！你已经看到了这里。</p>
        {/* 下一阶段可以把“标记已读”按钮做到这里 */}
      </div>
    </div>
  );
}
