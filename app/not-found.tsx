import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hammer, ArrowLeft, Construction } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <Construction className="h-12 w-12 text-primary animate-pulse" />
        <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
          <Hammer className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <h1 className="mb-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
        该模块正在开发中.....
      </h1>

      <p className="mb-8 max-w-md text-muted-foreground leading-relaxed">
        抱歉，您访问的页面或功能尚在建设或打磨阶段。我们的工程师正在努力为您提供更完善的数据科学实训体验。
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回工作台
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    </div>
  );
}
