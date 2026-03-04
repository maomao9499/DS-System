"use client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/LoginForm"; // 引入抽离的表单

export function LoginModal() {
  const router = useRouter();
  const handleOpenChange = (open: boolean) => {
    if (!open) router.back();
  };

  return (
    <Dialog defaultOpen onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-100">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl tracking-tight">
            欢迎回来
          </DialogTitle>
          <DialogDescription>登录你的数据科学+微专业账号</DialogDescription>
        </DialogHeader>
        <LoginForm /> {/* 直接使用 */}
      </DialogContent>
    </Dialog>
  );
}
