// middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
// 使用我们抽离的配置初始化 auth 中间件
export const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 设定需要保护的路由前缀
  const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedRoute && !isLoggedIn) {
    // 如果未登录且访问了受保护路由，重定向到首页并打开登录弹窗（或直接去 /login）
    return Response.redirect(new URL("/login", nextUrl));
  }
});

// 配置中间件匹配器（优化性能，不要拦截静态文件和图片）
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
