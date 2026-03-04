// auth.ts
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// 扩展 NextAuth v5 的类型
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id?: string;
      email?: string;
      name?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

// 定义登录表单的校验规则
const loginSchema = z.object({
  email: z.string().email({ message: "无效的邮箱格式" }),
  password: z.string().min(6, { message: "密码至少需要6位" }),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // 先把基础配置展开
  providers: [
    CredentialsProvider({
      name: "账号密码",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      // 这个 authorize 函数就是处理登录验证的核心逻辑
      async authorize(credentials) {
        // 1. 验证输入格式是否安全
        const parsedCredentials = loginSchema.safeParse(credentials);
        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // 2. 去数据库查找用户
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        // 3. 校验密码哈希值
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
          // 验证通过，返回我们需要保存在 Session 中的用户信息
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role, // 把角色信息带上，后续按角色区分权限
          };
        }

        return null;
      },
    }),
  ],
  // 将策略设为 JWT，因为我们没用 PrismaAdapter 接管所有 session
  session: { strategy: "jwt" },
  callbacks: {
    // 每次生成 JWT Token 时触发，我们把用户 ID 和角色塞进去
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        (token as JWT & { role?: string }).role = user.role;
      }
      return token;
    },
    // 每次前端获取 Session 时触发，把 Token 里的角色透传给前端
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if ((token as JWT & { role?: string }).role && session.user) {
        session.user.role = (token as JWT & { role?: string }).role;
      }
      return session;
    },
  },
  // 自定义登录页面的路径，这样即使被鉴权中间件拦截，也会跳到我们自己写的弹窗或页面
  pages: {
    signIn: "/login",
  },
});
