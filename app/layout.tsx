// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next"; // 全局引入 Vercel Analytics 访客分析
// 配置基础字体
const inter = Inter({ subsets: ["latin"] });

// 网站的基础 SEO 元数据
export const metadata: Metadata = {
  title: "数据科学+ 微专业平台",
  description: "农业类数据分析与建模的一体化教学支持平台",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background font-sans antialiased`}
      >
        {/* 包裹 ThemeProvider，配置默认跟随系统 */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
          {modal}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
