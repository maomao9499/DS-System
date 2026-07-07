# “数据科学+”微专业教学平台

## 一、项目概述

“数据科学+”微专业教学平台是一款面向农业院校的全栈教学管理系统，支持**课程管理**、**在线数据科学实验（浏览器内 Python 运行）**、**AI 辅助教学与作业批改**、**多题型实训作业系统**四大核心能力。

平台采用 **Next.js 16 App Router 全栈架构**，以 Server Actions 承载业务逻辑，Prisma ORM 对接 PostgreSQL，Auth.js 管理身份认证，AI SDK 统一接入多厂商大模型，最终通过 Docker Compose 一键部署。

---

## 二、技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **全栈框架** | Next.js 16.1.6 (App Router) | Server Components + Server Actions + Route Handlers |
| **语言** | TypeScript 5 (strict) | 全链路类型安全 |
| **UI 框架** | Tailwind CSS v4 + shadcn/ui (new-york) | 原子化 CSS + 无头组件库，支持暗黑/明亮模式 |
| **表单/校验** | react-hook-form + zod | 客户端校验 + 服务端校验共用 Schema |
| **图表** | ECharts 6 + echarts-for-react | 教学看板数据可视化 |
| **代码编辑器** | @monaco-editor/react | 在线编程环境（Monaco 编辑器） |
| **浏览器 Python** | Pyodide (Wasm) | 无需后端，浏览器内执行 Python 代码 |
| **Markdown** | react-markdown + remark-gfm + react-syntax-highlighter | 实训指导书渲染 + 代码高亮 |
| **认证** | Auth.js v5 (next-auth) | JWT 策略 + Credentials 邮箱密码登录 |
| **ORM** | Prisma 7.4.2 + @prisma/adapter-pg | 类型安全的数据库访问层 |
| **数据库** | PostgreSQL 16 | 通过 pg 连接池直连 |
| **AI 集成** | Vercel AI SDK v6 | 统一接入 OpenAI / Google Gemini / DeepSeek / Qwen |
| **部署** | Docker + Nginx + docker-compose | 三容器编排，Nginx 反向代理 |

---

## 三、系统架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                     Nginx (Port 80)                      │
│              反向代理 · 静态资源缓存 · WS 升级              │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                 Next.js Server (Port 3000)               │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Server   │  │    Server     │  │   Route Handlers  │  │
│  │ Components│  │   Actions     │  │   (API Routes)    │  │
│  │           │  │               │  │                   │  │
│  │ SSR 直出  │  │ createCourse  │  │ /api/auth/[...]   │  │
│  │ Prisma    │  │ submitAssign  │  │ /api/chat (AI流)  │  │
│  │ 直查渲染  │  │ gradeSubmiss  │  │                   │  │
│  └──────────┘  └──────┬───────┘  └──────────────────┘  │
│                       │                                 │
│              ┌────────▼────────┐                        │
│              │   Prisma ORM    │                        │
│              │  (Adapter: pg)  │                        │
│              └────────┬────────┘                        │
└───────────────────────┼─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  PostgreSQL 16                           │
│          User · Course · Lesson · Assignment             │
│          Question · Submission · Enrollment              │
└─────────────────────────────────────────────────────────┘
```

### 3.2 请求处理流程

```
浏览器 → Nginx (:80) → Next.js (:3000)
                         │
                         ├─ 公开页面: Server Component 直接 Prisma 查询 → SSR HTML
                         │
                         ├─ 表单提交: Client Component → Server Action → Prisma 写入
                         │                                       → revalidatePath 刷新缓存
                         │
                         ├─ AI 对话: useChat Hook → /api/chat (streamText) → SSE 流式响应
                         │
                         └─ AI 批改: Server Action → generateObject (Zod Schema) → 结构化评分
```

### 3.3 路由设计

| URL | 说明 | 鉴权 |
|-----|------|------|
| `/` | 公开首页 (Hero + 特性介绍) | 无 |
| `/courses` | 公开课程目录 | 无 |
| `/login` | 登录页（直接访问→全页；导航→弹窗） | 反向拦截 |
| `/dashboard` | 工作区首页（看板 + 统计） | 需登录 |
| `/dashboard/my-courses` | 学生：我的课程列表 | 学生 |
| `/dashboard/courses` | 教师：课程管理 | 教师 |
| `/dashboard/courses/[id]` | 教师：课程编辑器（课时/作业管理） | 教师 |
| `/dashboard/learn/[id]` | 学生：课程学习视图 | 学生 |
| `/dashboard/aichat` | AI 教学助手对话 | 需登录 |

**路由特性：**
- **平行路由**: `@modal/(.)login` 拦截路由实现无刷新登录弹窗（URL 变为 `/login` 但页面不跳转，而是弹出 Dialog）
- **鉴权守卫**: `proxy.ts` 中间件保护 `/dashboard/*`，dashboard layout 二次校验 session + 角色

---

## 四、项目目录结构

```
DS-System/
├── app/                           # Next.js App Router 核心
│   ├── layout.tsx                 # 根布局（Navbar + ThemeProvider + Analytics）
│   ├── page.tsx                   # 公开首页
│   ├── globals.css                # Tailwind + CSS 变量
│   ├── @modal/                    # 平行路由：登录弹窗
│   │   ├── (.)login/page.tsx      #   拦截路由 → LoginModal
│   │   └── default.tsx            #   默认空状态
│   ├── login/page.tsx             # 独立登录页
│   ├── courses/page.tsx           # 公开课程目录
│   ├── dashboard/                 # 鉴权工作区
│   │   ├── layout.tsx             #   角色侧边栏 + 二次鉴权
│   │   ├── page.tsx               #   教学/学习看板
│   │   ├── aichat/page.tsx        #   AI 助手页
│   │   ├── my-courses/page.tsx    #   学生课程列表
│   │   ├── courses/               #   教师课程管理
│   │   │   └── [courseId]/        #     课程编辑器
│   │   │       ├── _components/   #       路由级组件
│   │   │       ├── assignments/[assignmentId]/
│   │   │       └── lessons/[lessonId]/
│   │   └── learn/[courseId]/      #   学生学习视图
│   └── api/
│       ├── auth/[...nextauth]/    #   Auth.js 路由处理
│       └── chat/route.ts          #   AI 流式对话端点
│
├── components/                    # UI 组件层
│   ├── ui/                        #   shadcn 基础组件
│   ├── layout/                    #   布局组件 (Navbar, NavLinks)
│   ├── auth/                      #   认证组件 (LoginForm, LoginModal, LogoutButton)
│   ├── course/                    #   课程卡片
│   ├── dashboard/                 #   看板组件 (Sidebar, Charts, QuickActions)
│   ├── ai/chat.tsx                #   AI 对话客户端
│   ├── assigments/                #   作业组件 (编辑器/作答/批改)
│   └── shared/                    #   通用组件 (MarkdownRenderer, ThemeToggle)
│
├── lib/                           # 核心业务与工具层
│   ├── db.ts                      #   Prisma 单例 (pg adapter)
│   ├── auth.ts                    #   NextAuth 配置 (Credentials + JWT + 角色注入)
│   ├── utils.ts                   #   cn() 工具函数
│   ├── actions/                   #   Server Actions（核心业务逻辑）
│   │   ├── course.ts              #     课程 CRUD + 选课
│   │   ├── lesson.ts              #     课时管理
│   │   ├── assignment.ts          #     作业/题目管理
│   │   └── submission.ts          #     提交 + 自动评分 + 教师批阅
│   ├── ai/                        #   AI 集成层
│   │   ├── core/
│   │   │   ├── providers.ts       #     多厂商注册表
│   │   │   └── client.ts          #     getActiveModel() 适配器
│   │   ├── prompts/assignment.ts  #     评分 Prompt 模板
│   │   └── services/gradeService.ts #   AI 结构化评分服务
│   └── hooks/usePyodide.ts        #   浏览器 Python Wasm 引擎
│
├── prisma/                        # 数据库
│   ├── schema.prisma              #   数据模型定义
│   └── migrations/                #   迁移文件
│
├── scripts/
│   └── docker-entrypoint.sh       # Docker 启动脚本（migrate → start）
├── nginx/conf.d/default.conf      # Nginx 反向代理配置
├── Dockerfile                     # 多阶段构建（deps → builder → runner）
├── docker-compose.yml             # 三容器编排（db + app + nginx）
├── proxy.ts                       # 路由守卫中间件
├── seed.ts                        # 测试数据种子脚本
├── auth.config.ts                 # NextAuth 基础配置（signIn 页面等）
├── next.config.ts                 # Next.js 配置（standalone 输出）
└── package.json                   # 依赖与脚本
```

---

## 五、核心模块详解

### 5.1 认证鉴权体系

**两层防护：**

1. **中间件层** (`proxy.ts`)：拦截所有非静态请求，未登录访问 `/dashboard/*` → 重定向至 `/login`；已登录访问 `/login` → 重定向至 `/dashboard`
2. **Layout 层** (`app/dashboard/layout.tsx`)：Server Component 调用 `auth()` 二次校验 session，注入角色信息，渲染角色专属侧边栏

**角色权限：**

| 功能 | STUDENT | TEACHER |
|------|---------|---------|
| 浏览公开课程 | ✓ | ✓ |
| 选课/学习/提交作业 | ✓ | ✗ |
| 创建/编辑课程 | ✗ | ✓ |
| 创建课时/作业 | ✗ | ✓ |
| AI 助手对话 | ✓ | ✓ |
| 批改作业 | ✗ | ✓ |

**登录方式：** 邮箱 + 密码（Credentials Provider），密码 bcrypt 加密存储，JWT 策略维持会话。

### 5.2 AI 多模型适配层

采用**适配器模式**统一接入多个大模型厂商，通过环境变量 `ACTIVE_AI_PROVIDER` 一键切换：

```typescript
// lib/ai/core/client.ts
getActiveModel() → 根据 ACTIVE_AI_PROVIDER 返回对应模型实例
```

| 提供商 | 模型 | 环境变量 |
|--------|------|----------|
| Google | gemini-3-flash-preview | `GOOGLE_GENERATIVE_AI_API_KEY` |
| DeepSeek | deepseek-v4-pro | `DEEPSEEK_API_KEY` |
| OpenAI | gpt-4o | `OPENAI_API_KEY` |
| Qwen (DashScope) | qwen-plus | `QWEN_API_KEY` |

**两个 AI 使用场景：**

1. **AI 教学助手** (`/api/chat`)：流式对话（SSE），学生可随时提问，15s 超时 + 0 重试以应对受限网络
2. **AI 作业批改** (`gradeService.ts`)：`generateObject` + Zod Schema 强制结构化输出（isCorrect / suggestedScore / feedback / errorAnalysis），temperature=0.2 保持评分客观稳定

### 5.3 在线 Python 实验环境

`usePyodide` Hook 动态加载 Pyodide Wasm 引擎（CDN），在浏览器内执行 Python 代码：

- **无需后端**：Python 运行完全在浏览器 Wasm 沙箱中完成
- **输出捕获**：重定向 stdout/stderr 到 UI 输出面板
- **安全性**：代码不经过服务器，天然隔离

### 5.4 实训作业系统

#### 题目类型

| 类型 | 枚举值 | 判分方式 |
|------|--------|----------|
| 单选题 | `SINGLE_CHOICE` | AUTO_STRICT（自动比对） |
| 多选题 | `MULTIPLE_CHOICE` | AUTO_STRICT（自动比对） |
| 填空题 | `FILL_BLANK` | AUTO_STRICT（自动比对） |
| 编程题 | `PROGRAMMING` | MANUAL_REVIEW（AI 辅助 + 教师批阅） |

#### 提交状态流转

```
PENDING（未提交）
  → 学生提交 → AUTO_GRADED（机评完成，含主观题则待人评）
  → 教师批阅 → COMPLETED（最终得分已出）
```

#### `Question.metadata` 多态 JSON 结构

```json
// 选择题:
{ "options": ["A. 选项1", "B. 选项2"], "correct": ["A"] }

// 填空题:
{ "correct": ["pandas", "numpy"] }

// 编程题:
{ "initialCode": "def solution():\n    pass", "testCases": [{"input": "1", "expected": "2"}] }
```

---

## 六、数据模型

```
User ──┬── Course (TeacherCourses)    教师创建的课程
       ├── Enrollment                   学生选课记录
       └── Submission                   学生作业提交

Course ──┬── Enrollment                 选课记录
         ├── Lesson                     课时（按 position 排序）
         └── Assignment                 作业

Assignment ──┬── Question               题目（按 order 排序）
              └── Submission            提交记录

Question.metadata (JSON): 多态存储选项/正确答案/测试用例/初始代码
Submission.answers (JSON):   学生作答详情 [{questionId, answer, score, isCorrect}]
```

**核心约束：**
- `Enrollment`: `@@unique([studentId, courseId])` 防止重复选课
- `Submission`: `@@unique([studentId, assignmentId])` 一个学生一个作业一条提交
- `Lesson → Course`, `Assignment → Course`, `Question → Assignment`: 级联删除 (`onDelete: Cascade`)

---

## 七、部署指南

### 7.1 Docker Compose 部署（推荐）

适用于 Linux 服务器或本地生产环境，一键启动 PostgreSQL + Next.js + Nginx 三容器：

**前置要求：** Docker 20.10+、docker-compose 2.0+

```bash
# 1. 配置环境变量
cp .env.example .env   # 编辑 .env，填入 AI API Key 等

# 2. 启动所有服务
docker-compose up -d

# 3. 注入测试账号（可选）
docker-compose exec app npx tsx seed.ts

# 4. 验证
curl http://localhost
```

**服务拓扑：**

```
                   ┌──────────────┐
     :80  ←─────── │    nginx     │   反向代理 + 静态缓存
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
     :3000 (内网)   │     app      │   Next.js standalone
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
     :5432 (内网)   │      db      │   PostgreSQL 16
                   └──────────────┘
```

**关键配置说明：**
- `AUTH_URL=http://localhost` — 生产环境需改为实际域名
- 校园网部署：数据库端口不对外暴露（`ports` 已注释），仅 nginx 80 端口对外
- 本地开发直连：取消 `docker-compose.yml` 中 app 的 `ports: "3000:3000"` 注释

### 7.2 本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 配置 .env（DATABASE_URL 指向本地或远端 PostgreSQL）

# 3. 数据库迁移
npx prisma migrate deploy

# 4. 注入种子数据
npx tsx seed.ts

# 5. 启动开发服务器
pnpm dev          # → http://localhost:3000

# 6. 生产构建
pnpm build && pnpm start
```

### 7.3 环境变量一览

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✓ | PostgreSQL 连接字符串 |
| `AUTH_SECRET` | ✓ | NextAuth JWT 签名密钥 (`openssl rand -base64 32`) |
| `AUTH_URL` | - | 生产部署域名（Docker 中必须设置） |
| `ACTIVE_AI_PROVIDER` | - | 激活的 AI 厂商：`google` / `deepseek` / `openai` / `qwen` |
| `DEEPSEEK_API_KEY` | - | DeepSeek API Key（默认提供商） |
| `OPENAI_API_KEY` | - | OpenAI API Key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | - | Google Gemini API Key |
| `QWEN_API_KEY` | - | 通义千问 (DashScope) API Key |

---

## 八、测试账号

种子脚本 (`seed.ts`) 会创建两个测试账号，密码均为 `123456`：

| 邮箱 | 角色 | 密码 |
|------|------|------|
| `student@test.com` | STUDENT | 123456 |
| `teacher@test.com` | TEACHER | 123456 |

```bash
# 注入种子数据
npx tsx seed.ts
```

---

## 九、扩展说明

### 后端演进路径

当前 Server Actions 承载所有业务逻辑。未来如需引入 Go 后端：

1. Server Actions 函数签名保持不变，内部改为 `fetch()` 调用 Go API
2. `lib/actions/` 目录从业务逻辑层变为 API 调用适配层
3. 前端 UI 层零改动

### 中间件文件说明

路由守卫文件名为 `proxy.ts` 而非 Next.js 默认的 `middleware.ts`。如果发现路由守卫不生效，将其重命名为 `middleware.ts` 即可激活。

---

## 十、开发理念

- **敏捷全栈**：初期 Server Components + Server Actions 一把梭，避免跨语言联调
- **解耦式架构预留**：业务逻辑封装在 `lib/actions/`，未来可平替为 Go API
- **体验优先**：平行路由 + 拦截路由实现无刷新登录弹窗，shadcn/ui 暗黑模式
- **类型绝对安全**：TypeScript + Zod + Prisma，从数据库到 UI 全链路类型覆盖