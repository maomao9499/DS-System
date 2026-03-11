"use client";
import { useRouter } from "next/navigation"; // 新增导入
import { useState, useRef } from "react"; // 引入 useRef
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateLesson } from "@/lib/actions/lesson";
import { Lesson } from "@prisma/client";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud } from "lucide-react"; // 引入一个上传图标

export function LessonEditor({
  courseId,
  lesson,
}: {
  courseId: string;
  lesson: Lesson;
}) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(lesson.content || "");
  const fileInputRef = useRef<HTMLInputElement>(null); // 用于触发隐藏的文件上传框
  const router = useRouter(); // 新增

  // 处理文件上传并读取内容
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验文件类型
    if (!file.name.endsWith(".md") && file.type !== "text/markdown") {
      alert("请上传 .md 格式的 Markdown 文件！");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        // 将读取到的文本直接覆盖到编辑器内容中
        setContent(text);
        alert("文件导入成功！请预览效果并保存。");
      }
    };
    reader.readAsText(file);

    // 清空 input，允许重复上传同一个文件
    e.target.value = "";
  };

  async function onSubmit(formData: FormData) {
    setLoading(true);
    try {
      await updateLesson(courseId, lesson.id, formData);
      alert("课时内容保存成功！");
      router.back(); // 保存成功后返回上一页
    } catch (error) {
      console.error(error);
      alert("保存失败，请检查网络或权限");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">课时标题</label>
        <Input name="title" defaultValue={lesson.title} required />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end mb-2">
          <label className="text-sm font-medium">实训指导书内容</label>

          {/* 新增的导入按钮区域 */}
          <div>
            <input
              type="file"
              accept=".md"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              导入本地 .md 文件
            </Button>
          </div>
        </div>

        {/* 下面是你之前写好的 Tabs 组件代码，保持不变即可 */}
        <Tabs
          defaultValue="split"
          className="w-full border rounded-lg overflow-hidden bg-card"
        >
          {/* ... Tabs 的内容保持原样 ... */}
          <div className="border-b px-4 py-2 bg-muted/50 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="edit">专注编辑</TabsTrigger>
              <TabsTrigger value="split">分屏预览</TabsTrigger>
              <TabsTrigger value="preview">全屏预览</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="edit" className="p-0 m-0">
            <Textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[600px] border-0 rounded-none font-mono text-sm leading-relaxed resize-y p-6 focus-visible:ring-0"
              placeholder="请输入 Markdown 格式的实训内容..."
            />
          </TabsContent>

          <TabsContent value="split" className="p-0 m-0">
            <div className="grid grid-cols-2 divide-x h-[600px]">
              <Textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="h-full border-0 rounded-none font-mono text-sm leading-relaxed resize-none p-6 focus-visible:ring-0"
                placeholder="在此输入 Markdown..."
              />
              <div className="h-full overflow-y-auto p-6 bg-background">
                <MarkdownRenderer content={content || "*暂无内容*"} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="p-0 m-0">
            <div className="min-h-[600px] overflow-y-auto p-8 bg-background">
              <MarkdownRenderer content={content || "*暂无内容*"} />
            </div>
            <input type="hidden" name="content" value={content} />
          </TabsContent>
        </Tabs>
      </div>

      {/* 底部发布选项和保存按钮保持不变 */}
      <div className="flex items-center space-x-2 border p-4 rounded-lg bg-card shadow-sm">
        <input
          type="checkbox"
          name="isPublished"
          id="isPublished"
          defaultChecked={lesson.isPublished}
          className="h-4 w-4"
        />
        <label
          htmlFor="isPublished"
          className="text-sm font-medium cursor-pointer"
        >
          正式发布（勾选后，选课学生将可以阅读此实训内容）
        </label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? "保存中..." : "保存课时"}
        </Button>
      </div>
    </form>
  );
}
