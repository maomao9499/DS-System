import { streamText, UIMessage, convertToModelMessages } from "ai";
import { getActiveModel } from "@/lib/ai/core/client";



export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const model = getActiveModel();

  const modelMessages = await convertToModelMessages(messages);
  const result = streamText({
    model,
    messages: modelMessages,
    // 避免网络不可达时卡太久（当前日志显示 Google 连接 10s 超时 + 多次重试，最终耗时 ~37s）
    // 如果你在国内/受限网络环境无法访问 generativelanguage.googleapis.com，
    // 建议将 ACTIVE_AI_PROVIDER 切换到 qwen / deepseek / openai。
    maxRetries: 0,
    timeout: 15_000,
    onError: (error) => {
      console.error("[/api/chat] streamText error:", error);
    },
  });

  // `useChat()` 需要 UIMessage 流协议；否则前端收得到响应但不会更新 messages
  return result.toUIMessageStreamResponse();
}
