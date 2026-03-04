// app/page.tsx
import Link from "next/link";
import { ArrowRight, BookOpen, Database, LineChart } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* 1. Hero 区域 (Hero Section) 
        使用大留白和渐变文字吸引注意力，完美适配多端设备
      */}
      <section className="w-full px-4 py-24 md:py-32 lg:py-40 text-center">
        <div className="container mx-auto max-w-5xl flex flex-col items-center gap-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            数据驱动新农科 <br className="hidden sm:block" />
            <span className="text-primary">构建未来的教学支持平台</span>
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            专为“数据科学+”微专业打造的一体化平台。整合 R、Python、SAS
            主流工具，
            依托真实农业数据集开展实训，让数据清洗、建模与可视化触手可及。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            {/* Call to Action (CTA) 按钮 */}
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/courses">
                浏览课程体系 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/platform">进入数据实训</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. 核心特性介绍 (Features Section) 
        响应式 Grid 布局：手机端 1 列 (grid-cols-1)，平板/PC 端 3 列 (md:grid-cols-3)
      */}
      <section className="w-full bg-muted/40 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mx-auto max-w-5xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              三大核心支撑体系
            </h2>
            <p className="text-muted-foreground md:text-lg">
              覆盖教学、实训与成果展示，打造开放协同的微专业生态圈。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {/* 特性卡片 1：课程资源 */}
            <div className="flex flex-col items-start rounded-2xl bg-background p-6 shadow-sm ring-1 ring-border/50 transition-all hover:shadow-md">
              <div className="rounded-lg bg-primary/10 p-3 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">模块化课程资源</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                提供高质量课件、案例库与微课视频。内置 R、Python、SAS
                等工具操作指南，构建“模块化、可调用”的资源包。
              </p>
            </div>

            {/* 特性卡片 2：数据实训 */}
            <div className="flex flex-col items-start rounded-2xl bg-background p-6 shadow-sm ring-1 ring-border/50 transition-all hover:shadow-md">
              <div className="rounded-lg bg-primary/10 p-3 mb-4">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">沉浸式数据实训</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                提供真实农业图像、环境遥感等领域数据集。支持在线开展数据清洗、可视化与算法调试，形成数据驱动的实训模式。
              </p>
            </div>

            {/* 特性卡片 3：成果展示 */}
            <div className="flex flex-col items-start rounded-2xl bg-background p-6 shadow-sm ring-1 ring-border/50 transition-all hover:shadow-md">
              <div className="rounded-lg bg-primary/10 p-3 mb-4">
                <LineChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">成果追踪与归档</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                展示学生可视化报告与建模代码包。支持同行互评与导师点评，自动生成学习记录与推荐材料，助力升学与就业。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 简易页脚 (Footer)
        预留空间，让页面底部显得完整
      */}
      <footer className="w-full border-t py-6 md:py-8 mt-auto">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-8">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2026 数据科学+ 微专业教学支持平台. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">
              关于我们
            </Link>
            <Link href="#" className="hover:underline">
              联系方式
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
