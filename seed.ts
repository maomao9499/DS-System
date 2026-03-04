import "dotenv/config"; // <--- 【关键修复】确保第一时间加载 .env
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({ connectionString: process.env.DATABASE_URL }),
  ),
});

async function main() {
  console.log("开始注入测试数据...");

  const hashedPassword = await bcrypt.hash("123456", 10);

  const student = await prisma.user.upsert({
    where: { email: "student@test.com" },
    update: {},
    create: {
      email: "student@test.com",
      name: "测试学生",
      password: hashedPassword,
      role: "STUDENT",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@test.com" },
    update: {},
    create: {
      email: "teacher@test.com",
      name: "王老师",
      password: hashedPassword,
      role: "TEACHER",
    },
  });

  console.log("✅ 测试账号注入成功！");
  console.log(`学生账号: ${student.email} / 123456`);
  console.log(`老师账号: ${teacher.email} / 123456`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
