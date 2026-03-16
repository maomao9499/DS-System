import { generateObject } from "ai";
import { z } from "zod";
import { getActiveModel } from "../core/client";
import { getCodeAnalysisPrompt } from "../prompts/assignment";

// 定义业务入参类型
interface AnalyzeParams {
  questionContent: string;
  studentCode: string;
  executionOutput: string;
  standardAnswer?: string;
}

export async function analyzeSubmissionWithAI(params: AnalyzeParams) {
  const model = getActiveModel(); // 动态获取底层模型
  const prompt = getCodeAnalysisPrompt(
    params.questionContent,
    params.studentCode,
    params.executionOutput,
    params.standardAnswer,
  );

  try {
    // 强制 AI 返回我们期望的结构化数据 (Zod Schema)
    const { object } = await generateObject({
      model,
      schema: z.object({
        isCorrect: z.boolean().describe("学生的代码逻辑是否基本正确并满足题意"),
        suggestedScore: z.number().min(0).max(100).describe("建议的百分制分数"),
        feedback: z
          .string()
          .describe("给学生的详细评语，包含优点和改进建议，使用 Markdown 格式"),
        errorAnalysis: z
          .string()
          .optional()
          .describe("如果代码有报错或逻辑错误，给出具体的错误解释和修复指引"),
      }),
      prompt,
      temperature: 0.2, // 保持评分的客观和稳定性
    });

    return object;
  } catch (error) {
    console.error("AI Grading Error:", error);
    throw new Error("AI 分析过程中发生异常");
  }
}
