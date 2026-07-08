# Schedule Todo App 项目开发总任务书

你是一名资深全栈工程师。请从零开始开发一个“日程待办应用”，项目必须使用 Git 管理，并最终推送到我已经创建好的 GitHub 空仓库。

我的 GitHub 远程仓库地址是：

https://github.com/llkww/schedule-todo-app.git

请注意：

1. 不要要求我提供 GitHub 密码、Personal Access Token、SSH 私钥、验证码或任何敏感凭据。
2. 不要提交 `.env`、`node_modules`、`dist`、`build`、`coverage`、日志文件、本地数据库敏感文件或任何密钥。
3. 如果 `git push` 需要登录认证，请暂停，并提示我在本机完成 GitHub 登录。
4. 如果 Git 提交时提示缺少 `user.name` 或 `user.email`，请暂停，并提示我在本机配置 Git 用户信息。
5. 请实际创建完整项目代码，不要只输出说明、示例代码或伪代码。
6. 项目必须可以运行、可以测试、可以展示。
7. 开发过程中必须分阶段进行 Git commit，不允许只做一次最终 commit。
8. 前端 UI 必须高级、简约、现代、统一，不能只是默认浏览器样式或粗糙 demo。
9. 后端必须重视安全性、权限隔离、输入校验、密码安全和错误处理。
10. 最终 README 必须完整说明如何安装、启动、测试、初始化数据库和推送仓库。

---

# 一、项目目标

开发一个 Web 版日程待办管理系统，项目名称：

**Schedule Todo App**

该系统面向个人用户，用于管理日程、待办事项、重要事项、紧急事项和标签分类。

系统至少必须包含以下核心功能：

1. 用户注册
2. 用户登录
3. 用户退出登录
4. 日程 / 待办事项管理
5. 重要程度管理
6. 紧急程度管理
7. 标签管理
8. 搜索、筛选、排序
9. 重要-紧急四象限视图
10. 日历视图
11. 仪表盘统计
12. 用户个人设置
13. 安全认证与权限隔离
14. 完整 README
15. 自动化测试
16. 清晰 Git 提交记录
17. 最终推送到 GitHub 仓库

本项目重点考察：

1. 项目工程与质量
2. 安全性
3. UI 完成度
4. 文档完整性
5. Git 规范

因此请特别重视：

- 项目结构
- 代码规范
- 错误处理
- 输入校验
- 权限控制
- 密码安全
- Git 管理
- README 文档
- UI 设计系统
- 响应式适配
- 测试覆盖

---

# 二、推荐技术栈

请优先使用以下技术栈，保证项目易运行、易检查。

## 2.1 前端

- React
- TypeScript
- Vite
- React Router
- Axios 或 Fetch
- Tailwind CSS / CSS Modules / 普通 CSS 均可
- 表单校验
- lucide-react 或类似现代线性图标库
- date-fns 或类似日期处理库
- react-hot-toast / sonner 或类似 Toast 库

## 2.2 后端

- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite 作为默认开发数据库
- JWT 或 Session 认证
- bcrypt 或 argon2 用于密码哈希
- Zod 或 Joi 用于参数校验
- helmet
- express-rate-limit
- cors
- dotenv

## 2.3 测试

- Vitest 或 Jest
- Supertest
- React Testing Library

## 2.4 工程工具

- ESLint
- Prettier
- dotenv
- Git
- npm scripts

如果你认为其他技术栈更合适，也可以使用，但必须保证：

- 项目能一键安装依赖
- 项目能一键启动
- 数据库初始化清晰
- README 说明完整
- 安全要求全部满足
- 测试命令可执行
- Git 提交记录清晰
- UI 具有现代 SaaS 工具类应用质感

---

# 三、Git 与 GitHub 使用要求

项目开发必须严格使用 Git。

## 3.1 Git 初始化

如果当前目录还不是 Git 仓库，请执行：

    git init

## 3.2 `.gitignore`

创建 `.gitignore`，至少忽略：

- `node_modules`
- `.env`
- `.env.local`
- `.env.*.local`
- `dist`
- `build`
- `coverage`
- `*.log`
- `.DS_Store`
- 本地数据库临时文件
- SQLite 本地运行数据文件
- IDE 临时文件
- 缓存文件
- 密钥文件
- 临时导出文件

## 3.3 Commit 要求

创建合理的提交历史，不要只做一次最终提交。

每完成一个阶段就执行一次 Git commit。

commit message 使用清晰格式，例如：

- `chore: initialize project structure`
- `chore: configure eslint prettier and environment files`
- `feat: setup backend foundation with prisma`
- `feat: implement secure user authentication`
- `security: add password hashing and login rate limit`
- `feat: add schedule CRUD APIs`
- `feat: add importance and urgency matrix`
- `feat: implement label management`
- `feat: build design system and reusable UI components`
- `feat: build frontend dashboard`
- `feat: add calendar view`
- `test: add backend and frontend tests`
- `security: add validation and auth protection`
- `docs: complete README and usage guide`

最终请在 README 中说明主要 Git 提交节点。

## 3.4 禁止提交内容

不要提交以下内容：

- `.env`
- 密码
- token
- secret
- SSH 私钥
- GitHub 凭据
- `node_modules`
- `dist`
- `build`
- `coverage`
- 日志文件
- 本地数据库敏感文件

## 3.5 GitHub 远程仓库

项目完成并确认 `.gitignore` 正确后，请添加远程仓库：

    git remote add origin https://github.com/llkww/schedule-todo-app.git

将主分支命名为 `main`：

    git branch -M main

推送到远程仓库：

    git push -u origin main

推送前必须执行：

    git status

确认没有敏感文件即将被提交。

如果远程仓库已经存在 `origin`，请检查当前远程地址：

    git remote -v

如果 `origin` 不是：

    https://github.com/llkww/schedule-todo-app.git

请先说明情况，再决定是否修改 remote，不要盲目覆盖。

如果 push 需要登录认证，不要向我索要密码、Token 或 SSH 私钥，请暂停并提示：

> 需要你在本机完成 GitHub 登录认证后，再执行 git push。

---

# 四、高级 UI / UX 设计要求

本项目不仅要求功能完整，还要求前端界面具有现代、流行、高级、简约的视觉效果。请不要生成默认、粗糙、廉价、模板感很重的页面。前端 UI 应达到“可以作为课程项目展示或作品集截图展示”的水准。

## 4.1 总体视觉风格

请采用以下整体风格：

- 风格定位：现代 SaaS 工具类应用、轻量 Notion / Linear / Todoist / Cron Calendar 风格
- 关键词：高级简约、干净、克制、留白充足、层次清晰、轻微圆角、柔和阴影、低饱和配色
- 不要使用花哨渐变、大面积高饱和颜色、过多动画、廉价图标堆砌或杂乱卡片
- 整体应像一个成熟的效率工具，而不是学生随手写的 demo
- 优先保证信息密度、可读性和操作效率

## 4.2 设计系统文件

请在前端项目中建立清晰的设计系统。

建议创建：

- `client/src/styles/tokens.css`
- `client/src/styles/global.css`
- `client/src/styles/components.css`

或者使用 Tailwind CSS 时，在 `tailwind.config` 中统一配置设计 token。

必须定义并统一使用以下设计 token：

- color tokens
- typography tokens
- spacing scale
- border radius
- shadow
- z-index
- transition
- layout width
- responsive breakpoints

不要在各个组件里随意硬编码大量颜色、字号和间距。

## 4.3 色彩规范

请使用克制、专业的色彩方案。

推荐基础色：

- 页面背景：接近白色或浅灰，例如 `#F8FAFC` / `#F9FAFB`
- 主文本：深灰黑，例如 `#0F172A` / `#111827`
- 次级文本：灰色，例如 `#64748B` / `#6B7280`
- 边框：浅灰，例如 `#E5E7EB` / `#E2E8F0`
- 卡片背景：白色或轻微透明白
- 主色：蓝紫色、靛蓝色或蓝色系
- 成功色：低饱和绿色
- 警告色：低饱和橙色
- 危险色：低饱和红色

任务优先级颜色建议：

- 重要且紧急：红色系，但不要刺眼
- 重要不紧急：蓝色或紫色系
- 不重要但紧急：橙色或黄色系
- 不重要不紧急：灰色或绿色系

要求：

- 颜色必须统一通过 token 管理
- 标签颜色应柔和，不要使用刺眼纯色
- 文本与背景对比度要满足基本可读性
- 高优先级提示要明显，但不能破坏整体美观
- 不要让页面看起来像 Bootstrap 默认模板

## 4.4 字体与排版

请使用现代 Web 应用常见排版。

要求：

- 字体优先使用 system font stack，例如：
  - Inter
  - system-ui
  - -apple-system
  - BlinkMacSystemFont
  - "Segoe UI"
  - sans-serif
- 页面主标题清晰，字号约 24px-32px
- 二级标题约 18px-22px
- 正文约 14px-16px
- 辅助文字约 12px-14px
- 行高舒适，建议 1.5 左右
- 字重层级清楚：标题 600/700，正文 400/500
- 不要到处使用加粗
- 不要使用过小字体导致阅读困难

## 4.5 布局系统

整体布局采用专业后台 / SaaS 应用布局。

桌面端建议：

- 左侧固定 Sidebar
- 顶部 Header
- 主内容区域 max-width 控制
- 卡片式内容分区
- 仪表盘使用网格布局
- 日程列表使用卡片 + 表格混合展示
- 详情页采用左右分栏或信息卡片布局

移动端要求：

- Sidebar 折叠为顶部菜单或抽屉菜单
- 表格在移动端转为卡片
- 表单单列展示
- 按钮和输入框触控区域足够大
- 不出现横向溢出

间距规范：

- 使用 8px spacing system
- 页面外边距至少 24px
- 卡片内边距 16px-24px
- 卡片之间间距 16px-24px
- 表单项之间间距 12px-16px
- 不要让元素挤在一起

## 4.6 基础组件要求

请实现一套统一的基础组件，而不是每个页面重复写样式。

至少包括：

- Button
- Input
- Textarea
- Select
- Badge
- TagPill
- Card
- Modal
- ConfirmDialog
- Toast
- EmptyState
- LoadingSpinner 或 Skeleton
- PageHeader
- Sidebar
- Topbar
- StatCard
- TaskCard
- FilterBar
- CalendarCell
- PriorityBadge
- StatusBadge

组件要求：

- 所有按钮风格统一
- 按钮至少有 primary、secondary、ghost、danger 状态
- 表单输入框 focus 状态明显
- 禁用状态、loading 状态、错误状态必须有样式
- 卡片 hover 效果轻微，不要夸张
- 标签 badge 要有统一圆角和颜色规则
- Modal 和 ConfirmDialog 不能使用浏览器默认 confirm
- Toast 用于成功、失败和警告提示

## 4.7 页面级视觉要求

### 登录页 / 注册页

要求：

- 页面居中布局
- 左侧或背景可加入简洁的产品说明区域
- 登录卡片具有柔和阴影和圆角
- 表单简洁清晰
- 错误提示清楚但不刺眼
- 密码强度提示用细条或简洁文字展示
- 不要做成普通 HTML 表单样式

### 仪表盘

要求：

- 顶部有欢迎语和快速操作按钮
- 统计卡片要有清晰图标、数字和说明
- 今日任务、即将到期、最近创建任务应分区展示
- 四象限概览应具有清晰色块或卡片布局
- 整体应具有“效率工具首页”的感觉
- 信息密度适中，不要堆满屏幕

### 日程列表页

要求：

- 顶部有 PageHeader，包含标题、说明、新建按钮
- 筛选区设计为干净的 FilterBar
- 任务列表可以用卡片或表格，但必须美观
- 每个任务显示标题、时间、状态、重要/紧急、标签
- 高优先级任务有轻微强调
- 已完成任务文字可以降低透明度或使用删除线
- 过期任务应有明显但克制的提示
- 空状态应有图标、说明和新建按钮

### 日程详情页

要求：

- 使用卡片分区展示任务信息
- 显示标题、描述、时间、标签、状态、重要程度、紧急程度
- 提供编辑、删除、完成/取消完成操作
- 危险操作放在视觉上较弱但清晰的位置
- 页面不要显得空旷或粗糙

### 日程创建 / 编辑页

要求：

- 表单布局清晰
- 必填项有标识
- 日期时间选择体验良好
- 重要程度和紧急程度可使用 segmented control、radio card 或 select
- 标签多选要美观，已选标签用 TagPill 展示
- 保存按钮明确，取消按钮次要

### 标签管理页

要求：

- 标签以卡片或列表展示
- 每个标签显示颜色点、名称、关联任务数量
- 标签颜色选择器要简洁
- 删除前必须弹出 ConfirmDialog
- 标签为空时显示 EmptyState

### 四象限页面

要求：

- 四个象限应使用 2x2 网格
- 每个象限有标题、说明、任务数量和任务卡片
- 象限颜色轻微区分，但不能过于花哨
- 重要且紧急象限视觉优先级最高
- 支持点击任务进入详情
- 移动端四象限改为单列堆叠

### 日历视图页

要求：

- 月历网格整洁
- 今日日期突出显示
- 有任务的日期显示任务数量或小圆点
- 选中日期后右侧或下方显示当天任务
- 过期未完成任务有克制的危险提示
- 上个月 / 下个月切换按钮清晰
- 移动端日历不能横向溢出

### 个人设置页

要求：

- 分为基本信息、修改密码、安全提示几个区域
- 表单短小清晰
- 修改密码区域需要旧密码、新密码、确认新密码
- 退出登录按钮清晰但不刺眼

### 404 页面

要求：

- 简洁美观
- 有返回首页按钮
- 不要只显示纯文本 404

## 4.8 交互状态要求

每个核心页面都必须考虑以下状态：

- loading 状态
- empty 状态
- error 状态
- success 状态
- disabled 状态
- hover 状态
- focus 状态
- active 状态
- form validation 状态

要求：

- loading 不要只显示文字 Loading，可以使用 Skeleton 或 Spinner
- empty state 要有简洁说明和行动按钮
- error state 要说明问题并提供重试按钮
- 表单错误应显示在对应字段附近
- focus-visible 样式必须明显，方便键盘操作
- 所有可点击元素要有 hover 和 active 反馈

## 4.9 动效要求

请加入轻量、克制的动效。

允许：

- hover 阴影轻微变化
- 按钮点击轻微缩放或透明度变化
- Modal 淡入
- Toast 滑入
- 页面切换轻微 fade
- Skeleton loading

不允许：

- 大量炫酷动画
- 影响性能的复杂动效
- 让用户分心的动态背景
- 滥用渐变和阴影

动效时间建议：

- 150ms-250ms
- ease-out 或 ease-in-out

同时支持 `prefers-reduced-motion`，尊重用户减少动画的系统设置。

## 4.10 可访问性要求

请实现基本 accessibility。

要求：

- 表单 label 与 input 正确关联
- 按钮有可理解文本或 aria-label
- Modal 打开后焦点管理合理
- 键盘 Tab 顺序合理
- focus-visible 状态清晰
- 文本颜色对比度至少达到基本可读要求
- 不仅依赖颜色传达状态，还要有文字或图标辅助
- 可点击区域高度建议不低于 40px，移动端建议接近 44px
- 图片或图标必要时提供 aria-hidden 或 aria-label

## 4.11 图标要求

可以使用 lucide-react、heroicons 或类似现代线性图标库。

要求：

- 图标风格统一
- 不要混用多套图标风格
- 图标大小统一，例如 16px、18px、20px、24px
- 图标用于增强识别，不要过度装饰
- 统计卡片、导航菜单、空状态可以适当使用图标

## 4.12 深色模式

如果实现深色模式，请保证不是简单颜色反转。

要求：

- 使用 CSS variables 或 Tailwind dark mode
- 深色背景不要纯黑，建议使用 slate / zinc 系深色
- 卡片与背景要有层次
- 边框和文字对比清楚
- 标签颜色在深色模式下仍然可读
- 用户选择的主题应持久化保存

如果时间不足，深色模式可以作为可选增强，但浅色模式必须精致完整。

## 4.13 UI 技术建议

如果使用 Tailwind CSS，建议配合：

- `className` 组织清晰
- `cn` 工具函数
- CSS variables 管理主题色
- 可复用组件封装

如果使用普通 CSS / CSS Modules，建议：

- 使用 CSS variables
- 使用 BEM 或清晰命名
- 全局样式与组件样式分离
- 避免重复样式

可以使用以下库提升 UI 质量：

- lucide-react：图标
- clsx / classnames：条件类名
- date-fns：日期格式化
- react-hot-toast 或 sonner：Toast
- framer-motion：轻量动画，可选
- headless UI / radix-ui：无样式可访问组件，可选

不要为了 UI 引入过重依赖，优先保证项目可运行、代码清晰。

## 4.14 禁止事项

请避免以下问题：

- 页面像原生 HTML，缺少设计感
- 所有按钮都是浏览器默认样式
- 所有页面只有白底黑字
- 卡片阴影过重
- 渐变背景过度使用
- 颜色过多导致杂乱
- 表格在移动端溢出
- 没有 hover/focus 状态
- 没有 loading/empty/error 状态
- 不同页面间距、圆角、字体不一致
- 大量硬编码样式
- 使用 lorem ipsum
- 使用无意义占位内容
- 只完成首页好看，其他页面粗糙

## 4.15 UI 自检要求

前端开发完成后，请进行一次 UI 自检，并在最终输出中说明结果。

自检至少包括：

1. 所有页面是否视觉风格统一
2. 是否存在浏览器默认样式
3. 是否存在明显错位、溢出、遮挡
4. 是否支持桌面端和移动端
5. 是否有 loading、empty、error 状态
6. 表单错误提示是否清楚
7. 高优先级任务是否突出
8. 四象限页面是否直观
9. 日历页面是否清晰
10. 标签颜色是否协调
11. 深色模式如果实现，是否可读
12. 是否存在未替换的占位文本

---

# 五、功能需求

请实现以下功能，尽可能完整具体。

## 5.1 用户注册

注册页面字段：

- 用户名
- 邮箱
- 密码
- 确认密码

要求：

- 邮箱格式校验
- 密码强度校验
- 密码长度至少 8 位
- 密码至少包含字母和数字
- 两次密码必须一致
- 邮箱不能重复注册
- 用户名不能为空
- 后端必须再次校验所有参数
- 密码不能明文存储，必须使用 bcrypt 或 argon2 哈希
- 注册成功后可跳转登录页或自动登录
- 注册失败时给出合理错误提示
- 不允许通过错误信息泄露过多系统细节

## 5.2 用户登录

登录页面字段：

- 邮箱
- 密码

要求：

- 登录失败时不能泄露“邮箱是否存在”等敏感信息
- 返回统一提示，例如“邮箱或密码错误”
- 登录成功后进入首页 / 仪表盘
- 支持保持登录状态
- 支持退出登录
- 未登录用户不能访问日程管理页面
- 已登录用户访问登录 / 注册页时可自动跳转首页
- token 或 session 过期后应提示重新登录

## 5.3 用户认证与权限隔离

要求：

- 所有日程、标签、用户数据必须归属于当前登录用户
- 用户 A 不能读取、修改、删除用户 B 的任何数据
- 后端所有受保护接口必须验证身份
- 不允许仅靠前端隐藏按钮实现权限控制
- 后端所有资源查询必须加 userId 条件
- 更新和删除前必须验证资源归属
- 未认证访问受保护接口必须返回 401
- 越权访问必须返回 403 或 404

## 5.4 日程 / 待办事项管理

日程字段至少包括：

- id
- userId
- title
- description
- startTime
- endTime
- dueTime
- completed
- importance
- urgency
- status
- labels
- createdAt
- updatedAt

importance 可设计为：

- low
- medium
- high

urgency 可设计为：

- low
- medium
- high

status 可设计为：

- pending
- in_progress
- completed
- cancelled

要求实现：

- 创建日程
- 查看日程列表
- 查看日程详情
- 编辑日程
- 删除日程
- 标记完成 / 取消完成
- 批量删除已完成事项
- 按开始时间排序
- 按截止时间排序
- 按创建时间排序
- 按重要程度排序
- 按紧急程度排序
- 按状态筛选
- 按标签筛选
- 按关键词搜索标题和描述
- 按日期范围筛选
- 按是否完成筛选
- 按是否过期筛选
- 过期任务高亮显示
- 今日任务单独展示
- 即将到期任务展示
- 已完成任务和未完成任务区分显示
- 删除任务前需要确认
- 空任务列表需要显示友好提示

## 5.5 重要 / 紧急度管理

请不要只做一个简单字段，要体现“重要-紧急”矩阵。

在前端首页或专门页面实现四象限视图。

第一象限：

- 重要且紧急
- 例如：必须立即完成的任务

第二象限：

- 重要但不紧急
- 例如：长期计划、学习、项目推进

第三象限：

- 不重要但紧急
- 例如：临时事务、提醒事项

第四象限：

- 不重要且不紧急
- 例如：低优先级事项

具体要求：

- 用户创建或编辑日程时可以设置重要程度和紧急程度
- 系统根据 importance 和 urgency 自动归类到不同象限
- 首页展示四象限任务数量
- 四象限页面展示对应任务列表
- 支持点击象限进入筛选后的任务列表
- 高重要 + 高紧急任务在 UI 上要有明显提示
- 四象限页面应有清晰的标题、说明和任务数量
- 每个象限内的任务可以点击进入详情页

## 5.6 标签管理

标签字段至少包括：

- id
- userId
- name
- color
- createdAt
- updatedAt

要求：

- 创建标签
- 编辑标签
- 删除标签
- 查看标签列表
- 标签名称不能为空
- 同一用户下标签名称不能重复
- 删除标签时，相关日程与该标签的关联应被正确处理
- 创建 / 编辑日程时可以选择多个标签
- 日程列表中显示标签名称和颜色
- 支持按标签筛选日程
- 标签颜色可从预设颜色中选择，也可以输入自定义颜色
- 标签颜色值需要校验，避免非法输入
- 标签删除前需要二次确认

## 5.7 首页 / 仪表盘

登录后进入仪表盘页面。

仪表盘至少展示：

- 今日待办数量
- 已完成数量
- 未完成数量
- 已过期数量
- 重要且紧急任务数量
- 最近 7 天任务数量
- 标签统计
- 四象限任务概览
- 最近创建的任务
- 即将到期任务
- 快速新建日程按钮
- 快速进入标签管理按钮
- 快速进入日历视图按钮

## 5.8 日历视图

请实现一个基础日历视图。

要求：

- 支持按月查看日程
- 支持切换上个月 / 下个月
- 日历中显示某天是否有任务
- 显示某天任务数量
- 点击日期查看当天任务
- 今日日期突出显示
- 过期未完成任务突出显示
- 可以从日历页面快速创建该日期的日程
- 日期为空时展示无任务提示

## 5.9 搜索与筛选

日程列表页面应支持组合筛选：

- 关键词搜索
- 状态筛选
- 重要程度筛选
- 紧急程度筛选
- 标签筛选
- 日期范围筛选
- 是否过期筛选
- 是否完成筛选

要求：

- 筛选条件应在 URL query 或页面状态中清晰维护
- 提供清空筛选按钮
- 提供空结果页面提示
- 提供加载状态
- 提供错误状态
- 支持分页
- 支持排序
- 筛选条件组合时不能互相覆盖

## 5.10 用户体验要求

前端页面至少包括：

- 登录页
- 注册页
- 首页 / 仪表盘
- 日程列表页
- 日程创建页
- 日程编辑页
- 日程详情页
- 标签管理页
- 四象限视图页
- 日历视图页
- 个人设置页
- 404 页面

整体 UI 要达到现代 SaaS 效率工具的完成度，不允许只实现功能、不做视觉设计。界面应高级简约、干净专业、信息层级清楚，适合作为课程项目展示截图。

通用 UI 要求：

- 布局清晰
- 有导航栏
- 有侧边栏或顶部菜单
- 有统一 PageHeader
- 有统一按钮、输入框、卡片、标签、弹窗、Toast、空状态组件
- 表单有错误提示
- 操作成功有 Toast 提示
- 删除操作需要 ConfirmDialog 确认
- 页面刷新后登录状态不应异常丢失
- 移动端有基本适配
- 按钮、输入框、列表、卡片样式统一
- 高优先级任务有视觉突出
- 已完成任务有明显完成样式
- 加载时显示 Skeleton 或 Spinner
- 请求失败时显示错误提示和重试按钮
- 无数据时显示 EmptyState
- 所有可点击元素有 hover、active、focus-visible 状态
- 所有页面避免浏览器默认样式
- 所有页面避免明显模板感和粗糙感

视觉要求：

- 使用统一设计 token
- 使用 8px spacing system
- 使用低饱和专业配色
- 使用轻微圆角和柔和阴影
- 使用现代线性图标
- 字体层级清楚
- 卡片、表格、表单、弹窗风格一致
- 页面留白充足，不要拥挤
- 颜色使用克制，不要花哨

响应式要求：

- 桌面端使用 Sidebar + Header + Content 布局
- 移动端 Sidebar 折叠为菜单或抽屉
- 表格在小屏幕下转换为卡片
- 表单在小屏幕下单列展示
- 日历和四象限在小屏幕下不能横向溢出

---

# 六、后端 API 设计

请设计 RESTful API。

至少包含以下接口。

## 6.1 认证相关

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## 6.2 日程相关

- `GET /api/schedules`
- `POST /api/schedules`
- `GET /api/schedules/:id`
- `PUT /api/schedules/:id`
- `PATCH /api/schedules/:id/complete`
- `DELETE /api/schedules/:id`
- `DELETE /api/schedules/completed`

## 6.3 标签相关

- `GET /api/tags`
- `POST /api/tags`
- `PUT /api/tags/:id`
- `DELETE /api/tags/:id`

## 6.4 统计相关

- `GET /api/stats/dashboard`
- `GET /api/stats/matrix`
- `GET /api/stats/tags`

## 6.5 个人设置相关，可选但建议实现

- `GET /api/users/me`
- `PUT /api/users/me`
- `PUT /api/users/me/password`

## 6.6 API 要求

- API 返回格式统一
- 错误响应格式统一
- HTTP 状态码合理
- 所有输入必须后端校验
- 所有需要登录的接口必须鉴权
- 不允许用户操作不属于自己的资源
- 分页查询支持 `page` 和 `pageSize`
- 列表接口支持排序和筛选参数
- 不要把密码哈希返回给前端

统一响应格式示例：

成功：

    {
      "success": true,
      "data": {},
      "message": "success"
    }

失败：

    {
      "success": false,
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input"
      }
    }

---

# 七、数据库设计

请设计合理的数据模型，至少包括：

## 7.1 User

- id
- username
- email
- passwordHash
- createdAt
- updatedAt

## 7.2 Schedule

- id
- userId
- title
- description
- startTime
- endTime
- dueTime
- completed
- importance
- urgency
- status
- createdAt
- updatedAt

## 7.3 Tag

- id
- userId
- name
- color
- createdAt
- updatedAt

## 7.4 ScheduleTag

- scheduleId
- tagId

## 7.5 可选增强表：AuditLog

- id
- userId
- action
- entityType
- entityId
- createdAt

## 7.6 数据库要求

- User 和 Schedule 是一对多
- User 和 Tag 是一对多
- Schedule 和 Tag 是多对多
- email 唯一
- 同一用户下 tag name 唯一
- 删除用户时合理处理相关数据
- 删除标签时合理处理关联表
- Prisma migration 必须完整
- 数据库字段类型合理
- 枚举字段使用 enum 或严格校验
- createdAt 和 updatedAt 自动维护

---

# 八、安全要求

本项目重点考察安全，请务必认真实现。

## 8.1 密码安全

- 禁止明文存储密码
- 使用 bcrypt 或 argon2
- 设置合理的 hash cost
- 登录时使用安全比较方式
- 修改密码时需要验证旧密码
- 不要在日志中输出密码

## 8.2 身份认证安全

- 使用 JWT 时，secret 必须来自环境变量
- 不要把 secret 写死在代码中
- token 设置过期时间
- 前端不要在代码中硬编码密钥
- 如果使用 cookie，设置 httpOnly、sameSite、secure 等属性
- 如果使用 localStorage，需要在 README 中说明风险，并尽可能减少 XSS 风险
- 认证失败时返回统一错误格式

## 8.3 输入校验

- 前端校验只用于用户体验
- 后端必须使用 Zod / Joi 等统一校验
- 所有 API 参数都要校验
- 防止非法枚举值
- 防止空标题
- 防止超长标题
- 防止超长描述
- 防止非法颜色值
- 防止非法日期
- 防止 page、pageSize 等参数异常

## 8.4 权限控制

- 所有资源查询必须带 userId 限制
- 更新和删除前必须验证资源归属
- 不允许通过修改 id 访问他人数据
- 不能仅靠前端路由保护
- 后端必须强制鉴权

## 8.5 SQL 注入防护

- 使用 Prisma 或参数化查询
- 不拼接 SQL 字符串
- 搜索参数不能直接拼接进 SQL

## 8.6 XSS 防护

- React 默认转义文本
- 不使用 `dangerouslySetInnerHTML`
- 对用户输入进行长度限制
- 对错误提示进行安全显示
- 不渲染未经处理的 HTML

## 8.7 CSRF / CORS

- CORS 配置不要使用无限制通配
- 如果使用 cookie 认证，需要考虑 CSRF 防护
- 限制允许的 origin
- 在 `.env.example` 中提供 `FRONTEND_ORIGIN` 示例

## 8.8 暴力破解防护

- 登录接口增加简单限流
- 多次失败登录应短时间限制请求
- 错误提示不要泄露账号是否存在

## 8.9 安全响应头

- 使用 helmet 或类似中间件设置安全响应头

## 8.10 环境变量

- 使用 `.env`
- 提供 `.env.example`
- README 中说明如何配置
- 不提交真实 `.env`
- `JWT_SECRET` 必须从环境变量读取

## 8.11 错误处理

- 后端不要把 stack trace 返回给前端
- 生产环境错误信息应简洁
- 日志中不要输出密码、token、secret
- 使用统一错误处理中间件

---

# 九、工程质量要求

请保证项目结构清晰。

建议结构：

    project-root/
      client/
        src/
          components/
          pages/
          hooks/
          services/
          types/
          utils/
          routes/
          context/
          styles/
      server/
        src/
          controllers/
          routes/
          services/
          middlewares/
          validators/
          utils/
          config/
          types/
          app.ts
          server.ts
        prisma/
          schema.prisma
          migrations/
          seed.ts
      PROJECT_PROMPT.md
      AGENTS.md
      README.md
      .gitignore
      .env.example
      package.json

要求：

- 前后端职责清晰
- 后端分层明确：route、controller、service、validator、middleware
- 前端组件复用合理
- TypeScript 类型完整
- 不要堆在一个大文件里
- 命名清晰
- 删除无用代码
- 统一格式化
- 统一错误处理
- 统一 API 请求封装
- 统一认证状态管理
- 提供 loading / error / empty 状态
- 代码中关键复杂逻辑要有简洁注释
- npm scripts 清晰
- README 中命令必须和 package.json 一致

---

# 十、测试要求

请至少实现以下测试。

## 10.1 后端测试

- 用户注册成功
- 邮箱重复注册失败
- 密码错误登录失败
- 登录成功
- 未登录访问日程接口失败
- 创建日程成功
- 获取当前用户自己的日程
- 用户不能访问他人日程
- 创建标签成功
- 同一用户标签重名失败
- 删除标签后关联关系正确处理
- 非法 importance 被拒绝
- 非法 urgency 被拒绝
- 空标题被拒绝

## 10.2 前端测试

- 登录表单校验
- 注册表单校验
- 日程列表渲染
- 创建日程表单渲染
- 标签管理页面渲染
- 未登录跳转登录页
- 仪表盘页面渲染
- 四象限页面渲染

## 10.3 安全测试或校验

- 密码不会明文出现在数据库
- 未认证请求被拒绝
- 越权访问被拒绝
- 非法 importance / urgency 被拒绝
- 空标题被拒绝
- 用户不能访问他人标签
- 用户不能修改他人日程

---

# 十一、README 要求

请写完整 `README.md`，至少包括：

1. 项目简介
2. 功能列表
3. 技术栈
4. 项目结构
5. 安装依赖
6. 环境变量说明
7. 数据库初始化
8. 启动前端
9. 启动后端
10. 一键启动方式
11. 运行测试
12. API 接口说明
13. 安全设计说明
14. UI 设计说明
15. Git 使用与主要提交记录说明
16. 默认测试账号或种子数据说明
17. GitHub 仓库地址
18. 常见问题
19. 后续可改进方向

README 中必须说明如何从零运行项目，例如：

    npm install
    npm run install:all
    npm run db:migrate
    npm run db:seed
    npm run dev
    npm test

具体命令请根据你实际项目配置编写，必须保证可执行。

README 中必须写明 GitHub 仓库地址：

    https://github.com/llkww/schedule-todo-app.git

---

# 十二、页面与交互细节

## 12.1 登录页

- 邮箱输入框
- 密码输入框
- 登录按钮
- 跳转注册链接
- 错误提示
- loading 状态
- 现代简洁登录卡片

## 12.2 注册页

- 用户名输入框
- 邮箱输入框
- 密码输入框
- 确认密码输入框
- 注册按钮
- 跳转登录链接
- 密码强度提示
- 表单校验提示

## 12.3 仪表盘

- 统计卡片
- 今日任务
- 即将到期
- 四象限概览
- 标签统计
- 快速新建按钮

## 12.4 日程列表页

- 搜索框
- 筛选栏
- 排序选择
- 任务卡片 / 表格
- 编辑按钮
- 删除按钮
- 完成按钮
- 分页
- 空状态提示

## 12.5 日程表单页

- 标题
- 描述
- 开始时间
- 结束时间
- 截止时间
- 重要程度
- 紧急程度
- 状态
- 标签多选
- 保存按钮
- 取消按钮

## 12.6 标签管理页

- 标签列表
- 新建标签
- 编辑标签
- 删除标签
- 标签颜色选择

## 12.7 四象限页面

- 四个区域分别展示任务
- 每个区域展示任务数量
- 任务可以点击进入详情
- 高优先级任务突出显示

## 12.8 日历页面

- 月视图
- 日期格子
- 当天任务数量
- 点击日期查看任务
- 快速创建日程

## 12.9 个人设置页

- 展示当前用户信息
- 修改用户名
- 修改密码
- 退出登录

## 12.10 404 页面

- 简洁美观
- 返回首页按钮
- 不要只显示纯文本 404

---

# 十三、可选增强功能

在核心功能完成后，请尽量加入以下增强功能：

1. 深色模式
2. 个人设置页面
3. 修改用户名
4. 修改密码
5. 任务归档
6. 软删除 / 回收站
7. 任务备注
8. 任务重复规则，例如每天、每周、每月
9. 任务提醒时间
10. 导出任务为 JSON / CSV
11. 标签颜色自定义
12. 拖拽调整任务状态
13. 键盘快捷键
14. 最近操作记录
15. 简单审计日志

如果时间不足，必须优先完成核心功能、安全要求、测试、UI 基础质量和 README。

---

# 十四、验收标准

项目完成后必须满足：

1. 可以正常注册、登录、退出
2. 登录后可以创建、查看、编辑、删除日程
3. 可以设置重要程度和紧急程度
4. 可以通过四象限查看任务
5. 可以创建、编辑、删除标签
6. 可以给日程绑定多个标签
7. 可以按标签筛选日程
8. 用户之间数据完全隔离
9. 密码不会明文存储
10. 未登录不能访问受保护页面和接口
11. 后端接口有参数校验
12. 前端页面有现代、简约、统一、美观的 UI
13. 前端页面不是浏览器默认样式
14. README 完整
15. 测试可以运行
16. Git 提交记录清晰
17. 项目没有明显安全漏洞
18. 启动命令清晰可用
19. `.gitignore` 正确
20. GitHub 远程仓库配置正确
21. 项目已推送到：

    https://github.com/llkww/schedule-todo-app.git

如果由于认证问题无法推送，请明确说明，并告诉我需要在本机执行哪些命令。

---

# 十五、开发执行顺序

请按以下顺序开发。

## 第一阶段：项目初始化

- 初始化 Git
- 创建前后端目录
- 配置 TypeScript
- 配置 ESLint / Prettier
- 创建 `.gitignore`
- 创建 `.env.example`
- 创建 README 初稿
- 完成第一次 commit

建议 commit：

    chore: initialize project structure

## 第二阶段：后端基础

- 搭建 Express 服务
- 配置 Prisma
- 设计数据库模型
- 完成 migration
- 添加统一错误处理
- 添加统一响应格式
- 完成 commit

建议 commit：

    feat: setup backend foundation with prisma

## 第三阶段：认证系统

- 注册
- 登录
- 退出
- 当前用户信息
- 密码哈希
- token / session 认证
- 鉴权中间件
- 登录限流
- 完成 commit

建议 commit：

    feat: implement secure user authentication

## 第四阶段：日程 API

- CRUD
- 完成状态切换
- 筛选
- 排序
- 分页
- 权限隔离
- 完成 commit

建议 commit：

    feat: implement schedule management APIs

## 第五阶段：标签 API

- 标签 CRUD
- 标签唯一性
- 日程标签关联
- 删除标签处理
- 完成 commit

建议 commit：

    feat: implement tag management APIs

## 第六阶段：统计 API

- 仪表盘统计
- 四象限统计
- 标签统计
- 完成 commit

建议 commit：

    feat: add dashboard and matrix statistics APIs

## 第六点五阶段：前端设计系统与 UI 基础组件

在开发具体页面前，先完成前端设计系统和基础组件。

必须完成：

- 创建全局样式和设计 token
- 定义颜色、字体、间距、圆角、阴影、断点
- 创建 Button、Input、Textarea、Select、Card、Badge、TagPill、Modal、ConfirmDialog、Toast、EmptyState、Loading、PageHeader、Sidebar、Topbar 等基础组件
- 配置图标库，例如 lucide-react
- 建立统一页面布局组件 AppLayout
- 建立受保护页面布局 ProtectedLayout
- 完成浅色模式基础视觉风格
- 可选实现深色模式
- 写一个简单的 UI 预览页面或在仪表盘中验证组件风格

建议 commit：

    feat: build design system and reusable UI components

## 第七阶段：前端认证页面

- 登录页
- 注册页
- 路由守卫
- 认证状态管理
- 完成 commit

建议 commit：

    feat: build authentication pages

## 第八阶段：前端日程功能

- 日程列表
- 日程详情
- 新建日程
- 编辑日程
- 删除日程
- 完成状态切换
- 搜索筛选排序
- 完成 commit

建议 commit：

    feat: build schedule management UI

## 第九阶段：前端标签功能

- 标签列表
- 创建标签
- 编辑标签
- 删除标签
- 标签筛选
- 完成 commit

建议 commit：

    feat: build tag management UI

## 第十阶段：仪表盘、四象限、日历

- 仪表盘统计
- 四象限视图
- 日历视图
- 今日任务
- 过期任务
- 完成 commit

建议 commit：

    feat: add dashboard matrix and calendar views

## 第十一阶段：安全加固

- helmet
- CORS 限制
- 输入校验
- 错误隐藏
- 资源归属检查
- 登录限流
- 检查敏感信息
- 检查 `.gitignore`
- 完成 commit

建议 commit：

    security: harden validation authentication and headers

## 第十二阶段：测试与文档

- 添加后端测试
- 添加前端测试
- 完成 README
- 检查运行命令
- 完成 commit

建议 commit：

    test: add core backend and frontend tests

    docs: complete project documentation

## 第十三阶段：GitHub 推送

在确认项目完成、测试通过、`.gitignore` 正确后，执行：

    git status

确认没有敏感文件后，执行：

    git remote add origin https://github.com/llkww/schedule-todo-app.git

如果 origin 已存在，先执行：

    git remote -v

确认远程地址是否正确。

然后执行：

    git branch -M main

最后执行：

    git push -u origin main

如果 push 需要认证，请暂停，不要索要我的密码、Token 或 SSH 私钥，并提示我在本机完成 GitHub 登录认证。

---

# 十六、最终输出要求

完成开发后，请输出以下内容：

1. 项目完成情况总结
2. 已实现功能列表
3. 安全措施列表
4. 工程质量措施列表
5. UI 完成度说明
6. 响应式适配说明
7. 可访问性说明
8. 测试情况
9. 如何启动项目
10. 如何初始化数据库
11. 如何运行测试
12. Git commit 简要记录
13. GitHub 远程仓库地址
14. 是否已成功 push
15. 如果 push 失败，失败原因和我需要执行的命令
16. 仍可改进的地方

请务必实际创建代码文件，不要只输出说明。项目必须能运行，不能留下大量 TODO、空函数或未实现页面。最终项目应体现完整性、工程质量、安全性和 UI 完成度。