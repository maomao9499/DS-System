import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// 1. 初始化 OpenAI
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. 初始化 Google (Gemini)
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// 2. 初始化 通义千问 (复用 OpenAI SDK 格式)
const qwen = createOpenAI({
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.QWEN_API_KEY,
});

// 3. 初始化 DeepSeek (复用 OpenAI 的客户端，修改 BaseURL)
const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// 导出所有支持的模型字典 (预设默认调用的具体模型版本)
export const aiProviders = {
  openai: openai("gpt-4o"),
  google: google("gemini-3-flash-preview"),
  deepseek: deepseek("deepseek-coder"), // 专为代码场景优化的模型
  // 千问常用模型：qwen-plus, qwen-max, qwen-turbo
  qwen: qwen("qwen-plus"),
};

export type SupportedProviders = keyof typeof aiProviders;
