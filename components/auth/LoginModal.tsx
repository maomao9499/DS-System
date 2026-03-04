"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginModal() {
  const router = useRouter();

  // 当弹窗状态改变（比如点击遮罩层关闭）时触发
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back(); // 关闭弹窗时，URL 回退
    }
  };

  return (
    <Dialog defaultOpen onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl tracking-tight">
            欢迎回来
          </DialogTitle>
          <DialogDescription>登录你的数据科学+微专业账号</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input id="email" type="email" placeholder="邮箱地址" />
          </div>
          <div className="grid gap-2">
            <Input id="password" type="password" placeholder="密码" />
          </div>
          <Button className="w-full">登录</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
