// components/auth/LogoutButton.tsx
"use client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost" | "link";
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export function LogoutButton({
  variant = "outline",
  className,
  showIcon = true,
  showText = true,
}: LogoutButtonProps) {
  return (
    <Button
      variant={variant}
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {showText && <span>退出登录</span>}
    </Button>
  );
}
