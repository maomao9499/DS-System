import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm"; // 引入抽离的表单

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        &larr; 返回首页
      </Link>
      <Card className="w-[350px] sm:w-[400px]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl tracking-tight">欢迎回来</CardTitle>
          <CardDescription>登录你的数据科学+微专业账号</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm /> {/* 同样直接使用 */}
        </CardContent>
      </Card>
    </div>
  );
}
