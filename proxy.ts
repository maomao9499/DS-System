// middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
// 使用我们抽离的配置初始化 auth 中间件
export const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 定义两类特殊的路由前缀
  const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = nextUrl.pathname.startsWith("/login"); // 后续如果有 /register 也可以加进来

  if (isProtectedRoute && !isLoggedIn) {
    // 如果未登录且访问了受保护路由，重定向到首页并打开登录弹窗（或直接去 /login）
    return Response.redirect(new URL("/login", nextUrl));
  }

  // 2. 拦截已登录用户：已登录且试图访问登录页 -> 护送回工作区 (或首页)
  if (isAuthRoute && isLoggedIn) {
    // 这里重定向到 /dashboard 体验最好，当然你改成 "/" 也可以
    return Response.redirect(new URL("/dashboard", nextUrl));
  }
});

// 配置中间件匹配器（优化性能，不要拦截静态文件和图片）
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
