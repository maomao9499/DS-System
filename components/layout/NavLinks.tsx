// components/layout/NavLinks.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const routes = [
  { href: "/courses", label: "课程体系" },
  { href: "/platform", label: "数据实训" },
  { href: "/projects", label: "成果展示" },
  { href: "/members", label: "团队成员" },
];

export function NavLinks() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="hidden md:flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8"
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {isOpen && (
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {route.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
