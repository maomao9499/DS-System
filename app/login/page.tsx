// app/login/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        &larr; 返回首页
      </Link>
      <Card className="w-[350px] sm:w-[400px]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl tracking-tight">欢迎回来</CardTitle>
          <CardDescription>登录你的数据科学+微专业账号</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Input id="email" type="email" placeholder="邮箱地址" />
          </div>
          <div className="grid gap-2">
            <Input id="password" type="password" placeholder="密码" />
          </div>
          <Button className="w-full">登录</Button>
        </CardContent>
      </Card>
    </div>
  );
}
