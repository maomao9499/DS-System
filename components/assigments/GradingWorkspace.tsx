"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { Check, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { gradeSubmissionAction } from "@/lib/actions/submission";

export function GradingWorkspace({ submission }: { submission: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 提取需要老师打分的记录状态 (仅限 PROGRAMMING 题)
  const [manualScores, setManualScores] = useState<Record<string, number>>({});
  const [teacherFeedback, setTeacherFeedback] = useState(
    submission.teacherFeedback || "",
  );

  const assignment = submission.assignment;
  const questions = assignment.questions;
  const answers = submission.answers as any[];

  // 提交批改
  const handleSaveGrading = async () => {
    setIsSubmitting(true);
    try {
      const res = await gradeSubmissionAction(
        submission.id,
        manualScores,
        teacherFeedback,
      );
      if (res.success) {
        alert("批改保存成功！");
        router.push(
          `/dashboard/courses/${assignment.courseId}/assignments/${assignment.id}/submissions`,
        );
        router.refresh();
      } else {
        alert("保存失败：" + res.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* 左侧：题目与学生作答情况 */}
      <div className="w-2/3 h-full border-r overflow-y-auto p-6 space-y-8 bg-muted/10">
        <h2 className="text-2xl font-bold mb-6 border-b pb-4">学生答卷分析</h2>

        {questions.map((q: any, index: number) => {
          const studentAnsObj =
            answers.find((a) => a.questionId === q.id) || {};
          const studentAnswer = studentAnsObj.answer;
          const isObjCorrect = studentAnsObj.isCorrect;

          return (
            <div key={q.id} className="bg-card border rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg">
                  第 {index + 1} 题 (
                  {q.type === "PROGRAMMING" ? "主观编程题" : "客观题"})
                </span>
                <span className="text-muted-foreground text-sm">
                  满分: {q.score}分
                </span>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                <MarkdownRenderer content={q.content} />
              </div>

              <div className="bg-muted p-4 rounded-md mt-4 space-y-4">
                <div className="font-medium text-sm text-muted-foreground">
                  学生的作答：
                </div>

                {/* 针对不同题型渲染不同的答案展示 */}
                {q.type === "PROGRAMMING" ? (
                  <div className="h-64 border border-slate-700 rounded overflow-hidden">
                    <Editor
                      height="100%"
                      defaultLanguage="python"
                      theme="vs-dark"
                      value={studentAnswer || "未作答"}
                      options={{ readOnly: true, minimap: { enabled: false } }} // 老师端代码框为只读！
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-background border rounded">
                    <span className="font-mono">
                      {Array.isArray(studentAnswer)
                        ? studentAnswer.join(", ")
                        : studentAnswer || "未作答"}
                    </span>
                    {isObjCorrect ? (
                      <span className="text-emerald-600 flex items-center font-bold">
                        <Check className="w-4 h-4 mr-1" /> 正确 (+{q.score}分)
                      </span>
                    ) : (
                      <span className="text-destructive flex items-center font-bold">
                        <X className="w-4 h-4 mr-1" /> 错误 (0分)
                      </span>
                    )}
                  </div>
                )}

                {/* 如果是客观题，可以展示标准答案供老师参考 */}
                {q.type !== "PROGRAMMING" && q.metadata?.correct && (
                  <div className="text-sm text-emerald-600 mt-2">
                    标准答案：
                    {Array.isArray(q.metadata.correct)
                      ? q.metadata.correct.join(", ")
                      : q.metadata.correct}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 右侧：打分与评语面板 */}
      <div className="w-1/3 h-full flex flex-col bg-background border-l">
        <div className="p-6 border-b bg-muted/20">
          <h3 className="text-xl font-bold flex items-center">
            批改面板
            {submission.status === "COMPLETED" && (
              <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                已批改
              </span>
            )}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* 主观题打分区 */}
          <div className="space-y-4">
            <h4 className="font-bold border-l-4 border-primary pl-2">
              主观题人工打分
            </h4>
            {questions
              .filter((q: any) => q.gradingType === "MANUAL_REVIEW")
              .map((q: any, i: number) => {
                // 读取已有的分数或老师当前输入的分数
                const existingScore =
                  answers.find((a) => a.questionId === q.id)?.score || 0;
                const currentInputScore =
                  manualScores[q.id] !== undefined
                    ? manualScores[q.id]
                    : existingScore;

                return (
                  <div
                    key={q.id}
                    className="flex justify-between items-center p-3 border rounded bg-muted/30"
                  >
                    <span className="text-sm font-medium line-clamp-1 w-2/3">
                      题 {i + 1} (满分 {q.score})
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={q.score}
                        value={currentInputScore}
                        onChange={(e) =>
                          setManualScores({
                            ...manualScores,
                            [q.id]: Number(e.target.value),
                          })
                        }
                        className="w-20 text-center font-bold text-primary"
                      />
                      <span className="text-sm">分</span>
                    </div>
                  </div>
                );
              })}
            {questions.filter((q: any) => q.gradingType === "MANUAL_REVIEW")
              .length === 0 && (
              <p className="text-sm text-muted-foreground">
                本次作业无主观题，已由系统全自动判分。
              </p>
            )}
          </div>

          {/* 总体评语区 */}
          <div className="space-y-4">
            <h4 className="font-bold border-l-4 border-primary pl-2">
              给学生的总体评语
            </h4>
            <Textarea
              placeholder="写下你的批改意见、代码优化建议等..."
              className="min-h-[150px]"
              value={teacherFeedback}
              onChange={(e) => setTeacherFeedback(e.target.value)}
            />
          </div>
        </div>

        {/* 底部操作区 */}
        <div className="p-4 border-t bg-muted/20">
          <Button
            onClick={handleSaveGrading}
            disabled={isSubmitting}
            className="w-full h-12 text-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSubmitting ? "保存中..." : "保存批改并发布成绩"}
          </Button>
        </div>
      </div>
    </div>
  );
}
