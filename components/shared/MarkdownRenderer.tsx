"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;

            return !isInline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus as Record<string, React.CSSProperties>}
                language={match[1]}
                PreTag="div"
                className="rounded-md my-4"
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-muted text-primary px-1.5 py-0.5 rounded-md text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
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
