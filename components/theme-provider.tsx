"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// 提取出属性类型，兼容 React 18+
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
