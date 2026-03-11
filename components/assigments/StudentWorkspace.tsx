"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import {
  Play,
  Send,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Terminal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer"; // 阶段 3.1 写的组件
import { usePyodide } from "@/lib/hooks/usePyodide"; // 上一步写的 Wasm 钩子
import { submitAssignmentAction } from "@/lib/actions/submission"; // 上一步写的提交 Action

export function StudentWorkspace({
  assignment,
  courseId,
}: {
  assignment: any;
  courseId: string;
}) {
  const router = useRouter();
  // const { toast } = useToast();

  // 核心状态：学生的作答记录。结构为 { [questionId]: answerValue }
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初始化 Pyodide Python 引擎
  const {
    isLoading: isPythonLoading,
    output,
    runPython,
    setOutput,
  } = usePyodide();

  const questions = assignment.questions || [];
  const currentQuestion = questions[currentIndex];

  // 初始化编程题的默认代码
  useEffect(() => {
    const initialAnswers: Record<string, any> = {};
    questions.forEach((q: any) => {
      if (q.type === "PROGRAMMING" && !initialAnswers[q.id]) {
        initialAnswers[q.id] = q.metadata?.initialCode || "# 在此编写代码\n";
      }
    });
    setAnswers(initialAnswers);
  }, [questions]);

  // 处理作答数据变更
  const handleAnswerChange = (val: any) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
  };

  // 运行 Python 代码
  const handleRunCode = async () => {
    const code = answers[currentQuestion.id];
    if (!code) {
      setOutput("没有可运行的代码");
      return;
    }
    await runPython(code);
  };

  // 提交作业
  const handleSubmit = async () => {
    if (!confirm("确定要提交作业吗？提交后客观题将自动判分。")) return;

    setIsSubmitting(true);
    try {
      // 格式化为后端需要的数组结构
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: qId,
        answer: ans,
      }));

      const res = await submitAssignmentAction(assignment.id, formattedAnswers);

      if (res.success) {
        alert("🎉 作业提交成功！");
        // 提交后跳回课程大纲页面
        router.push(`/dashboard/learn/${courseId}`);
        router.refresh();
      } else {
        alert("提交失败：" + res.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) return <div>题目加载失败</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-background overflow-hidden">
      {/* 左侧分屏：作业说明与题目渲染 (Markdown) */}
      <div className="w-1/2 h-full border-r overflow-y-auto p-6 space-y-8 bg-muted/10">
        <div>
          <h1 className="text-2xl font-bold mb-4">{assignment.title}</h1>
          {assignment.description && (
            <div className="prose prose-sm dark:prose-invert max-w-none mb-8 pb-8 border-b">
              <MarkdownRenderer content={assignment.description} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
              第 {currentIndex + 1} / {questions.length} 题
            </span>
            <span className="text-sm font-medium text-muted-foreground border border-border px-2 py-0.5 rounded">
              分值: {currentQuestion.score}
            </span>
            <span className="text-sm font-medium text-muted-foreground border border-border px-2 py-0.5 rounded">
              {currentQuestion.type === "PROGRAMMING"
                ? "👨‍💻 编程/主观"
                : "📝 客观题"}
            </span>
          </div>
          <div className="prose prose-base dark:prose-invert max-w-none">
            <MarkdownRenderer content={currentQuestion.content} />
          </div>
        </div>
      </div>

      {/* 右侧分屏：作答区与终端 */}
      <div className="w-1/2 h-full flex flex-col bg-background">
        {/* 动态作答区 */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
          {/* 1. 单选 / 多选 */}
          {(currentQuestion.type === "SINGLE_CHOICE" ||
            currentQuestion.type === "MULTIPLE_CHOICE") && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg mb-4">请选择你的答案：</h3>
              {currentQuestion.metadata?.options?.map(
                (opt: string, i: number) => {
                  const optLetter = String.fromCharCode(65 + i);
                  const currentAns = answers[currentQuestion.id] || [];
                  const isChecked =
                    currentQuestion.type === "SINGLE_CHOICE"
                      ? currentAns === optLetter
                      : currentAns.includes(optLetter);

                  return (
                    <label
                      key={i}
                      className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type={
                          currentQuestion.type === "SINGLE_CHOICE"
                            ? "radio"
                            : "checkbox"
                        }
                        className="mt-1 w-4 h-4 accent-primary"
                        checked={isChecked}
                        onChange={(e) => {
                          if (currentQuestion.type === "SINGLE_CHOICE") {
                            handleAnswerChange(optLetter);
                          } else {
                            const newAns = e.target.checked
                              ? [...currentAns, optLetter]
                              : currentAns.filter(
                                  (v: string) => v !== optLetter,
                                );
                            handleAnswerChange(newAns);
                          }
                        }}
                      />
                      <span className="font-bold text-primary">
                        {optLetter}.
                      </span>
                      <span className="flex-1">{opt}</span>
                    </label>
                  );
                },
              )}
            </div>
          )}

          {/* 2. 填空题 */}
          {currentQuestion.type === "FILL_BLANK" && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg mb-4">请输入你的答案：</h3>
              <Input
                placeholder="在此输入文本..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="max-w-md"
              />
            </div>
          )}

          {/* 3. 编程题 (Monaco Editor) */}
          {currentQuestion.type === "PROGRAMMING" && (
            <div className="flex-1 flex flex-col h-full border rounded-lg overflow-hidden">
              <div className="bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-700">
                <span className="text-slate-300 text-sm font-mono flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Python 3 (Pyodide)
                </span>
                <Button
                  size="sm"
                  onClick={handleRunCode}
                  disabled={isPythonLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs"
                >
                  {isPythonLoading ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 mr-1" />
                  )}
                  运行代码
                </Button>
              </div>

              <div className="flex-1 min-h-[300px]">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  theme="vs-dark" // 沉浸式暗黑风格
                  value={answers[currentQuestion.id] || ""}
                  onChange={(val) => handleAnswerChange(val)}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>

              {/* 代码输出终端终端 */}
              <div className="h-48 bg-[#1e1e1e] border-t border-slate-700 p-4 overflow-y-auto">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 block">
                  执行输出 Output
                </span>
                <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap">
                  {output || "点击上方「运行代码」查看结果..."}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 底部导航条 (上一题/下一题/提交) */}
        <div className="p-4 border-t bg-muted/20 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> 上一题
          </Button>

          <div className="flex gap-4">
            {currentIndex < questions.length - 1 ? (
              <Button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(questions.length - 1, prev + 1),
                  )
                }
              >
                下一题 <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground px-8"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                正式提交作业
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
