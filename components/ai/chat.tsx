"use client";

import { useChat } from "@ai-sdk/react";
import { Bot, Send, User, Trash2, Square, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function AIChat() {
  const [input, setInput] = useState("");

  const { messages, stop, setMessages, sendMessage, status } = useChat();

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput("");
    await sendMessage({ text: currentInput });
  };

  // 【核心修复】：兼容纯文本流！如果没有 parts，就直接读取 content
  const getMessageText = (m: (typeof messages)[number]) => {
    // 1. 如果有 parts 且不为空，优先解析 parts（兼容未来升级）
    if (m.parts && m.parts.length > 0) {
      return m.parts
        .filter(
          (p): p is Extract<(typeof m.parts)[number], { type: "text" }> =>
            p.type === "text",
        )
        .map((p) => p.text)
        .join("");
    }
    // 2. 兼容部分版本/历史消息结构：可能仍存在 content 字段
    const maybeContent =
      "content" in m ? (m as unknown as { content?: unknown }).content : undefined;
    return typeof maybeContent === "string" ? maybeContent : "";
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input && input.trim() !== "" && !isLoading) {
        handleSubmit();
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Bot className="w-5 h-5 mr-2 text-primary" />
          <h2 className="text-sm font-semibold">AI 助手 (DS-Tutor)</h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-muted"
            title="清空对话"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full space-y-4 opacity-70">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm max-w-[200px]">
              你好！我是你的数据科学助手，有什么可以帮你的吗？
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={`text-sm p-3.5 rounded-xl max-w-[85%] overflow-hidden shadow-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-muted border border-border/50 rounded-tl-none text-foreground"
              }`}
            >
              {m.role === "user" ? (
                <div className="whitespace-pre-wrap">{getMessageText(m)}</div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {getMessageText(m)}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {m.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="text-sm p-3.5 rounded-xl bg-muted border border-border/50 rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary/70" />
              <span className="text-muted-foreground font-medium">
                思考中...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      <div className="p-4 border-t bg-background/95 backdrop-blur z-10">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex items-end gap-2 relative"
        >
          <textarea
            className="flex min-h-[44px] max-h-[160px] w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            value={input}
            placeholder="问我关于代码的问题 (Enter 发送，Shift+Enter 换行)..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
          />

          {isLoading ? (
            <button
              type="button"
              onClick={() => stop()}
              className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground h-[44px] w-[44px] shrink-0"
              title="停止生成"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input || input.trim() === ""}
              className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-[44px] w-[44px] shrink-0 active:scale-95"
            >
              <Send className="w-[18px] h-[18px] ml-[2px]" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
