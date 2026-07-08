# Schedule Todo App

Schedule Todo App 是一个全栈个人日程待办管理系统，用于管理日程、待办事项、重要/紧急程度、标签分类、日历视图和重要-紧急四象限。

GitHub 仓库地址：

```text
https://github.com/llkww/schedule-todo-app.git
```

## 功能

- 用户注册、登录、退出和当前用户会话保持
- JWT 保护的日程 CRUD、完成/取消完成、批量删除已完成事项
- 重要程度、紧急程度、状态、标签、搜索、筛选、排序和分页
- 标签 CRUD、颜色选择、同一用户标签名唯一、删除标签时清理关联
- 仪表盘统计、今日任务、即将到期、最近创建、标签统计
- 重要-紧急四象限视图
- 月历视图和选中日期任务列表
- 智能日程助理：今日计划、优先级解释、冲突建议、自然语言任务草稿、今日/本周总结
- 个人设置：修改用户名、修改密码、退出登录
- 统一 API 响应、错误处理、输入校验和权限隔离
- 现代 SaaS 风格前端 UI，包含 loading、empty、error、success 状态
- 后端和前端自动化测试

## 技术栈

- 前端：React、TypeScript、Vite、React Router、CSS variables、lucide-react、date-fns、sonner、Vitest、React Testing Library
- 后端：Node.js、Express、TypeScript、Prisma、SQLite、JWT、bcryptjs、Zod、helmet、cors、express-rate-limit、Supertest、Vitest
- 工程：npm workspaces、ESLint、Prettier、Git

## 项目结构

```text
client/
  src/components/      reusable UI and layout components
  src/context/         auth state
  src/pages/           app pages
  src/routes/          route guards
  src/services/        API clients
  src/styles/          design tokens and global component styles
server/
  prisma/              schema, migration, seed
  src/controllers/     request handlers
  src/middlewares/     auth, validation, errors, rate limiting
  src/routes/          REST route modules
  src/services/        business logic and Prisma access
  src/utils/           API response, errors, AI prompt and response parsing helpers
  src/validators/      Zod schemas
```

## 安装

```bash
npm install
```

等价脚本：

```bash
npm run install:all
```

Windows PowerShell 如果拦截 `npm.ps1`，可改用：

```powershell
npm.cmd install
```

## 环境变量

复制示例文件并设置至少 32 位的 `JWT_SECRET`：

```powershell
Copy-Item .env.example server/.env
```

`server/.env` 示例：

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_ORIGIN="http://localhost:5173"

AI_PROVIDER="deepseek"
DEEPSEEK_API_KEY=""
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-v4-flash"
AI_TIMEOUT_MS="20000"
AI_MAX_OUTPUT_TOKENS="1200"
```

前端默认请求 `http://localhost:3001/api`。如需覆盖，可在 `client/.env` 中设置：

```env
VITE_API_URL="http://localhost:3001/api"
```

不要提交真实 `.env` 文件。

## 智能日程助理

智能日程助理完全依赖 DeepSeek API，不提供规则模式降级。未配置 `DEEPSEEK_API_KEY` 时，前端会显示“智能日程助理未配置”，后端 AI 功能接口会返回 `AI_NOT_CONFIGURED`，不会尝试生成伪结果。

配置方式：

1. 复制 `server/.env.example` 到 `server/.env`。
2. 在 `server/.env` 中设置 `DEEPSEEK_API_KEY`。
3. 保持 `DEEPSEEK_BASE_URL="https://api.deepseek.com"`。
4. 默认模型为 `deepseek-v4-flash`，也可改为 `deepseek-v4-pro`。

安全注意：

- API Key 只能放在后端 `server/.env`，不要写入前端代码。
- `.env`、`server/.env`、`client/.env` 已被 `.gitignore` 忽略，不得提交 GitHub。
- 不要把 API Key 写入 README、测试、提交信息、截图或聊天消息。
- DeepSeek API 调用可能产生费用，请按 DeepSeek 账户计费规则确认。

隐私说明：

- 智能日程助理会把生成建议所需的最小任务数据发送给 DeepSeek API。
- 发送字段包括任务标题、描述摘要、开始/结束/截止时间、完成状态、重要程度、紧急程度、状态、标签名、创建和更新时间。
- 不会发送密码、`passwordHash`、JWT、Authorization header、API Key、secret 或其他凭据。
- AI 返回内容只按普通文本渲染，不使用 HTML 注入。

功能入口：

- 侧边栏“智能规划”
- 页面路径：`/ai-planner`
- 仪表盘“智能今日建议”模块

AI 行为边界：

- 今日计划、优先级解释、时间冲突建议、自然语言任务草稿、任务总结都通过 DeepSeek API 生成。
- AI 不能直接创建、修改或删除数据库记录。
- 自然语言任务解析只生成草稿；用户点击“确认创建日程”后，才会调用普通日程创建接口。
- 时间冲突建议只返回调整建议，不会自动改动任务时间。
- 后端会对 AI 返回 JSON 做 Zod schema 校验，校验失败返回 `AI_RESPONSE_INVALID`。

## 数据库初始化

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

种子账号：

```text
email: demo@example.com
password: Demo123456
```

## 启动

同时启动前后端：

```bash
npm run dev
```

单独启动后端：

```bash
npm run dev:server
```

单独启动前端：

```bash
npm run dev:client
```

默认地址：

- API: `http://localhost:3001/api`
- Web: `http://localhost:5173`

## 测试与检查

```bash
npm test
npm run test:server
npm run test:client
npm run lint
npm run typecheck
npm run build
```

已覆盖：

- 注册、重复注册、登录成功、错误密码登录失败
- 未认证访问受保护接口
- 日程创建、列表、更新、完成、删除
- 标签创建、列表、更新、重复名失败、删除关联清理
- 用户所有权隔离和越权访问拒绝
- 非法 importance / urgency 拒绝、空标题拒绝
- 前端登录/注册表单校验、未登录重定向、核心页面渲染
- AI Planner 鉴权、未配置 Key、用户数据隔离、越权解释拒绝、非法 AI JSON/schema、安全草稿解析、总结和冲突建议
- 前端智能规划页面渲染、未配置提示、生成 loading、草稿确认创建和 AI 错误状态

AI 测试说明：

- 后端测试通过 mock `global.fetch` 模拟 DeepSeek OpenAI-compatible 响应。
- 测试不会真实调用 DeepSeek API，也不会读取或输出真实 API Key。
- 前端测试 mock `/api/ai/*` 响应，不依赖后端或真实模型。

## API 概览

认证：

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

日程：

- `GET /api/schedules`
- `POST /api/schedules`
- `GET /api/schedules/:id`
- `PUT /api/schedules/:id`
- `PATCH /api/schedules/:id/complete`
- `DELETE /api/schedules/:id`
- `DELETE /api/schedules/completed`

标签：

- `GET /api/tags`
- `POST /api/tags`
- `PUT /api/tags/:id`
- `DELETE /api/tags/:id`

统计：

- `GET /api/stats/dashboard`
- `GET /api/stats/matrix`
- `GET /api/stats/tags`

智能日程助理：

- `GET /api/ai/status`
- `POST /api/ai/plan/today`
- `POST /api/ai/explain/:scheduleId`
- `POST /api/ai/parse-task`
- `POST /api/ai/summary`
- `POST /api/ai/conflict-advice`

用户设置：

- `GET /api/users/me`
- `PUT /api/users/me`
- `PUT /api/users/me/password`

统一成功响应：

```json
{
  "success": true,
  "data": {},
  "message": "success"
}
```

统一错误响应：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

## 安全设计

- 密码使用 bcryptjs，cost 为 12，只存储 `passwordHash`
- JWT secret 来自环境变量，token 有过期时间
- 所有受保护 API 使用 `Authorization: Bearer <token>`
- 日程、标签、用户设置全部按 token 中的当前用户 ID 查询和修改
- AI Planner 接口全部需要登录，且只读取当前用户自己的日程和标签
- AI prompt 只包含最小必要任务字段，不包含密码、token、API Key、secret 或 Authorization header
- AI 返回结果必须通过 Zod schema 校验，非法 JSON 或结构不符会返回统一错误
- AI 不直接写数据库；自然语言解析只返回草稿，用户确认后走普通日程创建接口
- 用户不能读取、修改、删除或绑定其他用户的日程和标签
- Zod 校验所有请求体、参数和查询参数，拒绝非法枚举、非法颜色、空标题、超长文本和异常分页
- Prisma ORM 防止 SQL 注入，不拼接 SQL 查询
- React 不使用 `dangerouslySetInnerHTML`，用户文本按普通文本渲染
- helmet 设置安全响应头
- CORS 使用 `FRONTEND_ORIGIN` 限制来源
- 登录、注册、修改密码接口有限流
- 统一错误处理中间件不向前端返回 stack trace
- 请求 JSON body 限制为 100kb
- `.gitignore` 排除 `.env`、数据库文件、构建产物、coverage、日志、密钥和 `node_modules`
- 前端 token 存在 localStorage；README 明确此策略的 XSS 风险，项目通过 React 默认转义、输入长度限制和不渲染 HTML 降低风险

## UI 设计

- 使用 `client/src/styles/tokens.css` 管理颜色、字体、间距、圆角、阴影、动效、z-index 和布局宽度
- 浅色现代 SaaS 风格，低饱和配色，强调可读性和效率工具质感
- 统一组件：Button、Input、Textarea、Select、Badge、TagPill、Card、Modal、ConfirmDialog、EmptyState、Loading、PageHeader、Sidebar、Topbar、StatCard、TaskCard、FilterBar、CalendarCell、PriorityBadge、StatusBadge
- 页面覆盖登录、注册、仪表盘、日程列表、日程详情、日程创建/编辑、标签、四象限、日历、设置、404
- 智能规划页面覆盖服务状态、今日计划、冲突建议、自然语言草稿和任务总结
- 每个数据页包含 loading、empty、error 状态
- 表单字段有 label、错误提示和可见 focus 状态
- 删除使用自定义 ConfirmDialog，不使用浏览器默认 confirm
- 移动端折叠侧边栏、单列表单、单列四象限和无横向溢出布局

## Git 提交摘要

主要提交节点：

- `chore: initialize project structure`
- `feat: setup backend foundation with prisma`
- `feat: implement secure user authentication`
- `feat: implement schedule management APIs`
- `feat: implement tag management APIs`
- `feat: add dashboard and matrix statistics APIs`
- `feat: add user settings APIs`
- `feat: build design system and reusable UI components`
- `feat: build authentication pages`
- `feat: build schedule management UI`
- `feat: build tag management UI`
- `feat: add dashboard matrix and calendar views`
- `security: harden validation authentication and headers`
- `test: add core backend and frontend tests`
- `docs: complete project documentation`
- `chore: prepare DeepSeek environment config`
- `feat: add DeepSeek AI planner service`
- `feat: build AI planner frontend page`
- `test: add AI planner coverage`
- `docs: document DeepSeek AI planner setup`

## 常见问题

- `JWT_SECRET must be at least 32 characters`：检查 `server/.env` 是否存在且 secret 足够长。
- 前端请求失败：确认后端在 `3001` 端口运行，`FRONTEND_ORIGIN` 与前端地址一致。
- Prisma 找不到数据库：先运行 `npm run db:migrate`。
- 智能日程助理显示未配置：确认 `server/.env` 存在，并设置了 `DEEPSEEK_API_KEY`。
- AI 接口返回 `AI_RESPONSE_INVALID`：模型返回内容不是合法 JSON 或不符合后端 schema，可稍后重试或调整模型。
- AI 接口返回超时：可适当提高 `AI_TIMEOUT_MS`，同时确认网络和 DeepSeek 服务可用。
- PowerShell 无法运行 `npm`：使用 `npm.cmd` 或调整本机执行策略。

## 后续改进

- 深色模式
- 软删除/回收站
- 重复任务规则
- CSV/JSON 导出
- 审计日志页面
- 拖拽调整状态
- 更完整的 E2E 测试
