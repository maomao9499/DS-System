// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"; // 假设你的 auth.ts 在项目根目录。如果在 lib 下，请改成 "@/lib/auth"

export const { GET, POST } = handlers;
