"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"; // 引入类似 VSCode 的暗色主题

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    // 使用 prose 类来自动美化排版，dark:prose-invert 适配暗黑模式
    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定义代码块的渲染方式，接入高亮
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus as any}
                language={match[1]}
                PreTag="div"
                className="rounded-md my-4"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              // 行内代码块的默认样式
              <code
                className="bg-muted text-primary px-1.5 py-0.5 rounded-md text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
          // 你还可以自定义表格等其他元素的样式
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full divide-y divide-border" {...props}>
                  {children}
                </table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
