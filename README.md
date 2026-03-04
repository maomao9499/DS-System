# “数据科学+”微专业平台开发架构方案

**“前期 Next.js 全栈一把梭，主攻 MVP (最小可行性产品)，预留未来 Go 后端剥离空间”**的务实路线。

这次的重点是：**用 Next.js 的 App Router 统管前后端，利用 Server Actions 处理业务逻辑，结合 ORM 快速打通数据库，同时依靠优秀的目录规范保证代码的健壮性和可扩展性。**

“数据科学+”平台全栈开发思路：

### 1. 核心开发理念 (Updated)

- **敏捷全栈 (Agile Fullstack):** 抛弃初期跨语言联调的负担。使用 Next.js 14/15 的 Server Components 负责服务端渲染与数据直出，使用 Server Actions 替代传统的 API Routes 处理表单提交和数据库修改操作。
- **解耦式架构预留 (Future-Proof):** 虽然现在是“一把梭”，但我们要把**数据库操作**和**核心业务逻辑**严格封装在 `lib/` 或 `actions/` 目录下。这样未来如果遇到性能瓶颈需要引入 Go，前端只需将调用本地函数改为发起 Fetch 请求即可，UI 层几乎零重构。
- **体验优先 (UX First):** 充分利用 App Router 的平行路由 (Parallel Routes) 和拦截路由 (Intercepting Routes) 实现优雅的无刷新登录弹窗；结合 Shadcn/ui 打造极具现代感的数据看板外壳。
- **类型绝对安全 (End-to-End Type Safety):** 结合 TypeScript、Zod (数据校验) 和 ORM (数据库类型生成)，实现从数据库模型到前端 UI 组件的全链路类型安全。

### 2. 精简版技术栈选型 (MVP Tech Stack)

- **全栈框架:** Next.js 14/15 (App Router 模式)
- **UI 生态:** Tailwind CSS + Shadcn/ui (无头组件库，极致定制化)
- **数据库 & ORM:** \* **ORM:** Prisma (上手极快，模型直观，极度适合快速迭代的 MVP) 或 Drizzle (更轻量，SQL 语义强)。推荐先用 Prisma。
  - **数据库:** PostgreSQL (推荐，配合 Vercel Postgres 或 Supabase 免费层极度丝滑，复杂查询能力强) 或 MySQL。
- **鉴权体系:** Auth.js (原 Next-Auth v5) - 完美适配 App Router，支持 GitHub/Google 第三方登录及账号密码登录。
- **数据校验:** Zod - 用于表单验证和 API 传参校验。

### 3. 全新开发阶段规划 (Roadmap)

#### 阶段 0: 基础设施与“外壳”搭建 (UI Shell)

- **目标:** 跑通项目骨架，确立整站的视觉风格。
- **行动:**
  1. 初始化 Next.js + TS + Tailwind 项目。
  2. 安装并配置 Shadcn/ui（引入基础的 Button, Input, Card, Dialog 组件）。
  3. **构建全局布局 (Layout):** 实现响应式的 Navbar（导航栏）和 Footer（页脚）。
  4. **构建 Dashboard 布局:** 利用嵌套路由实现侧边栏 (Sidebar) 结构。
  5. 定义暗黑/明亮模式切换 (Next-themes)。

#### 阶段 1: 门户公开页与路由魔法 (Public & Routing)

- **目标:** 完成无状态的公开展示页，以及极佳体验的登录交互。
- **行动:**
  1. 开发静态的首页 (Hero 区域、核心特性介绍)。
  2. 开发课程列表页前台 UI。
  3. **高光时刻:** 利用 `@modal` 平行路由和 `(..)` 拦截路由，实现官网级别的登录弹窗。用户点击登录，URL 改变，但在当前页面弹出 Modal；如果用户直接复制 URL 访问或刷新，则渲染为一个完整的独立登录页面。

#### 阶段 2: 数据层与鉴权打通 (DB & Auth)

- **目标:** 连接数据库，实现真正的用户注册/登录/会话保持。
- **行动:**
  1. 配置 Prisma schema，定义 `User` 模型。
  2. 集成 Next-Auth，配置 JWT 策略和 Prisma Adapter。
  3. 在 Navbar 中动态读取会话状态（未登录显示“登录”按钮，已登录显示用户头像及 Dropdown Menu）。
  4. 使用 Next.js Middleware 配置全局路由守卫（保护 `/dashboard` 等隐私路由）。

#### 阶段 3: 核心业务逻辑实现 (Server Actions)

- **目标:** 实现课程数据动态化和作业系统 CRUD。
- **行动:**
  1. 使用 Prisma 设计 `Course`, `Assignment`, `Submission` 数据库模型。
  2. 编写 Server Actions：`createAssignment()`, `submitHomework()` 等后端逻辑。
  3. 前端表单结合 `react-hook-form` 和 Zod 进行客户端校验，校验通过后直接调用 Server Actions 进行数据入库。
  4. 在 Server Components 中直接 `await prisma.course.findMany()` 获取数据并渲染到页面。

#### 阶段 4: 部署与体验打磨 (Deploy)

- 部署到 Vercel (最无脑、最丝滑的 Next.js 托管平台)。
- 优化加载状态：使用 `loading.tsx` 添加骨架屏 (Skeleton)。

---

### 4. 健壮的项目目录结构规范 (App Router + Fullstack)

这个结构为你未来的扩展（比如引入复杂的业务逻辑或替换后端）打下了坚实的基础：

Plaintext

```
/
├── app/                      # Next.js App Router 核心目录
│   ├── (auth)/               # 路由组: 认证相关 (不影响 URL 路径)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/          # 路由组: 需要鉴权的管理控制台
│   │   ├── layout.tsx        # Dashboard 专用的侧边栏布局
│   │   ├── dashboard/page.tsx
│   │   └── homework/page.tsx
│   ├── @modal/               # 平行路由: 用于全局拦截弹窗
│   │   ├── (.)login/page.tsx # 拦截路由: 登录模态框组件
│   │   └── default.tsx       # 默认回退状态
│   ├── api/                  # API 路由 (如果需要提供给第三方，或者供 Webhook 使用)
│   │   └── auth/[...nextauth]/route.ts
│   ├── layout.tsx            # Root 全局布局 (Navbar, Footer, 字体, Providers)
│   └── page.tsx              # 官网首页
│
├── actions/                  # 🌟 核心业务逻辑层 (Server Actions) - 未来可平替为 Go API
│   ├── auth.ts               # 登录注册相关的服务端逻辑
│   ├── user.ts               # 获取用户信息、更新资料
│   └── course.ts             # 课程增删改查逻辑
│
├── components/               # 纯 UI 组件层
│   ├── ui/                   # Shadcn/ui 生成的基础组件库
│   ├── layout/               # 布局组件 (Navbar, Sidebar)
│   └── business/             # 复用的业务组件 (CourseCard)
│
├── lib/                      # 核心工具与实例层
│   ├── db.ts                 # Prisma/Drizzle 数据库单例初始化
│   ├── utils.ts              # Tailwind 合并等基础工具函数 (cn)
│   └── validations/          # 🌟 Zod Schema 校验层 (共享给前端表单和后端 Action)
│       └── auth.schema.ts
│
├── prisma/                   # ORM 配置目录 (如果选 Prisma)
│   └── schema.prisma         # 数据库结构定义
│
└── middleware.ts             # 全局中间件 (用于鉴权路由拦截)
```
