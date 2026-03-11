"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import {
  createAssignmentAction,
  updateAssignmentAction,
} from "@/lib/actions/assignment"; // 引入刚刚写的 Server Action
// 1. 定义 Zod 校验 Schema
const questionSchema = z.object({
  type: z.enum([
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "FILL_BLANK",
    "PROGRAMMING",
  ]),
  content: z.string().min(1, "题干不能为空"),
  score: z.coerce.number().min(1, "分值必须大于0"),
  // 根据题型，metadata 里的内容是多变的，我们暂时用 any 或放宽校验
  metadata: z.any(),
});

const assignmentSchema = z.object({
  title: z.string().min(1, "作业标题不能为空"),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, "至少需要添加一道题目"),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;
type AssignmentInitialData = AssignmentFormValues & { id?: string };

export function AssignmentEditor({
  courseId,
  initialData,
}: {
  courseId: string;
  initialData?: AssignmentInitialData;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 2. 初始化 react-hook-form
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    // 核心魔法：如果有 initialData 就用它，没有就用空模板
    defaultValues: initialData || {
      title: "",
      description: "",
      questions: [
        {
          type: "SINGLE_CHOICE",
          content: "",
          score: 10,
          metadata: { options: ["", "", "", ""], correct: [] },
        },
      ],
    },
  });

  // 3. 使用 useFieldArray 处理动态增删题目
  const { fields, append, remove } = useFieldArray({
    name: "questions",
    control: form.control,
  });

  // 2. 修改提交表单处理函数：智能判断是 Create 还是 Update
  const onSubmit = async (data: AssignmentFormValues) => {
    setIsSubmitting(true);
    try {
      let result;
      if (initialData?.id) {
        // 如果有 id，说明是编辑模式
        result = await updateAssignmentAction(initialData.id, courseId, data);
      } else {
        // 否则是新建模式
        result = await createAssignmentAction(courseId, data);
      }

      if (result.success) {
        router.push(`/dashboard/courses/${courseId}`);
        router.refresh();
      } else {
        alert("操作失败: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("发生异常错误");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8 max-w-4xl mx-auto pb-20"
    >
      {/* 顶部：作业基础信息 */}
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? "编辑实训作业" : "新建实训作业"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">作业标题</label>
            <Input
              {...form.register("title")}
              placeholder="例如：期中实训 - 泰坦尼克号数据清洗"
              className="mt-1"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">
              作业说明 (支持 Markdown)
            </label>
            <Textarea
              {...form.register("description")}
              placeholder="写下本次作业的总体要求..."
              className="mt-1 min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* 核心：动态题目列表 */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          题目列表{" "}
          <span className="text-sm font-normal text-muted-foreground">
            (共 {fields.length} 题)
          </span>
        </h3>

        {fields.map((field, index) => {
          // 获取当前这道题的题型（用于动态渲染下半部分）
          const currentType = form.watch(`questions.${index}.type`);

          return (
            <Card
              key={field.id}
              className="relative border-l-4 border-l-primary shadow-sm group"
            >
              {/* 删除按钮 (Hover 时显示) */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -right-3 -top-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="mt-2 text-muted-foreground cursor-grab">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  <div className="flex-1 space-y-4">
                    {/* 题目配置行：题型选择 + 分值 */}
                    <div className="flex gap-4 items-center">
                      <span className="font-bold text-lg w-8">
                        #{index + 1}
                      </span>
                      <Select
                        value={currentType}
                        onValueChange={(val: any) => {
                          form.setValue(`questions.${index}.type`, val);
                          // 切换题型时，重置 metadata
                          if (val === "PROGRAMMING") {
                            form.setValue(`questions.${index}.metadata`, {
                              initialCode: "# 在此编写你的代码\n",
                              testCases: [],
                            });
                          } else if (val === "FILL_BLANK") {
                            form.setValue(`questions.${index}.metadata`, {
                              correct: [""],
                            });
                          } else {
                            form.setValue(`questions.${index}.metadata`, {
                              options: ["", "", "", ""],
                              correct: [],
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="选择题型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SINGLE_CHOICE">单选题</SelectItem>
                          <SelectItem value="MULTIPLE_CHOICE">
                            多选题
                          </SelectItem>
                          <SelectItem value="FILL_BLANK">填空题</SelectItem>
                          <SelectItem value="PROGRAMMING">
                            编程/主观题
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2 ml-auto">
                        <label className="text-sm text-muted-foreground">
                          分值
                        </label>
                        <Input
                          type="number"
                          {...form.register(`questions.${index}.score`)}
                          className="w-20"
                        />
                      </div>
                    </div>

                    {/* 题干输入框 */}
                    <div>
                      <Textarea
                        {...form.register(`questions.${index}.content`)}
                        placeholder="请输入题干内容 (支持 Markdown)..."
                        className="min-h-[80px]"
                      />
                    </div>

                    {/* =========== 根据题型动态渲染的内容区域 =========== */}
                    <div className="bg-muted/50 p-4 rounded-md border border-border/50">
                      {/* 1. 单选/多选 */}
                      {(currentType === "SINGLE_CHOICE" ||
                        currentType === "MULTIPLE_CHOICE") && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">
                            配置选项与正确答案{" "}
                            <span className="text-primary">
                              (勾选左侧框即设为正确答案)
                            </span>
                            ：
                          </p>
                          {[0, 1, 2, 3].map((optIndex) => {
                            // 生成 A, B, C, D
                            const optionLetter = String.fromCharCode(
                              65 + optIndex,
                            );
                            // 实时获取当前的正确答案数组
                            const currentCorrect =
                              form.watch(
                                `questions.${index}.metadata.correct`,
                              ) || [];
                            const isChecked =
                              currentCorrect.includes(optionLetter);

                            return (
                              <div
                                key={optIndex}
                                className="flex gap-3 items-center"
                              >
                                {/* 原生复选框/单选框，比引入复杂组件更好控制状态 */}
                                <input
                                  type={
                                    currentType === "SINGLE_CHOICE"
                                      ? "radio"
                                      : "checkbox"
                                  }
                                  className="w-5 h-5 cursor-pointer accent-primary"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    if (currentType === "SINGLE_CHOICE") {
                                      // 单选：直接覆盖为唯一答案
                                      form.setValue(
                                        `questions.${index}.metadata.correct`,
                                        [optionLetter],
                                      );
                                    } else {
                                      // 多选：追加或移除
                                      if (checked) {
                                        form.setValue(
                                          `questions.${index}.metadata.correct`,
                                          [...currentCorrect, optionLetter],
                                        );
                                      } else {
                                        form.setValue(
                                          `questions.${index}.metadata.correct`,
                                          currentCorrect.filter(
                                            (v: string) => v !== optionLetter,
                                          ),
                                        );
                                      }
                                    }
                                  }}
                                />
                                <span className="w-6 text-sm text-center font-bold">
                                  {optionLetter}
                                </span>
                                <Input
                                  {...form.register(
                                    `questions.${index}.metadata.options.${optIndex}`,
                                  )}
                                  placeholder={`选项 ${optionLetter} 的内容`}
                                  className="flex-1 bg-background"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {/* 2. 填空题 */}
                      {currentType === "FILL_BLANK" && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">
                            设定标准答案（可设置多个同义词）：
                          </p>
                          <Input
                            {...form.register(
                              `questions.${index}.metadata.correct.0`,
                            )}
                            placeholder="例如：数据清洗 (如果有多个正确表述，用逗号分隔)"
                            className="bg-background"
                          />
                        </div>
                      )}

                      {/* 3. 编程题 */}
                      {currentType === "PROGRAMMING" && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">
                            提供给学生的初始代码模板：
                          </p>
                          <Textarea
                            {...form.register(
                              `questions.${index}.metadata.initialCode`,
                            )}
                            placeholder="import pandas as pd&#10;&#10;def analyze_data():&#10;    pass"
                            className="bg-slate-900 text-slate-50 font-mono min-h-[150px]"
                          />
                          <p className="text-xs text-muted-foreground">
                            * 注意：自动化测试用例 (Test Cases)
                            的沙箱断言配置，我们将在后续 Monaco Editor
                            集成时单独完善。
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 底部操作区 */}
      <div className="flex gap-4 items-center">
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed border-2"
          onClick={() =>
            append({
              type: "SINGLE_CHOICE",
              content: "",
              score: 10,
              metadata: { options: ["", "", "", ""], correct: [] },
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> 添加新题目
        </Button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t flex justify-end z-50">
        <div className="container max-w-4xl flex justify-end gap-4 pr-8">
          <Button type="button" variant="ghost">
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />{" "}
            {isSubmitting ? "保存中..." : "保存并发布作业"}
          </Button>
        </div>
      </div>
    </form>
  );
}
