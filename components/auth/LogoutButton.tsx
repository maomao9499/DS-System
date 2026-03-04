// components/auth/LogoutButton.tsx
"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
  showIcon?: boolean;
}

export function LogoutButton({
  variant = "outline",
  className,
  showIcon = true,
}: LogoutButtonProps) {
  return (
    // 调用 signOut 并指定退出后跳转回首页 ('/')
    <Button
      variant={variant}
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      退出登录
    </Button>
  );
}
