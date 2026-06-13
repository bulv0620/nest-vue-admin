# Web — Vue 3 前端

基于 **Vue 3** 的 RBAC 权限管理系统中后台前端，提供动态路由、权限指令、动态表单/表格、多主题/布局等能力。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3、TypeScript |
| 构建 | Vite |
| UI | Element Plus、@element-plus/icons-vue |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| HTTP | Axios（拦截器、Token 自动刷新） |
| 编辑器 | Monaco Editor |
| 工具库 | dayjs、lodash-es、xe-utils、mitt |
| 测试 | Vitest、Vue Test Utils |
| 样式 | Sass |
| 代码规范 | ESLint (flat config)、Prettier |

## 项目结构

```
apps/web/
├── src/
│   ├── api/                   # API 接口层（按模块分目录，含 types）
│   ├── components/
│   │   ├── BulvComponent/     # 自定义组件库
│   │   │   ├── BlFormCard     # 动态表单
│   │   │   ├── BlTableCard    # 动态表格
│   │   │   ├── BlDialog       # 对话框封装
│   │   │   ├── BlSelect / BlSelectSpan  # 增强选择器
│   │   │   ├── BlIcon / BlIconInput     # 图标及选择器
│   │   │   └── BlCodeEditor   # Monaco 代码编辑器
│   │   └── …                  # 其他通用组件
│   ├── config/                # 应用配置（路由模式、布局等）
│   ├── directives/            # v-permission、v-dialog-drag 等自定义指令
│   ├── hooks/                 # 组合式函数（useFormTable 等）
│   ├── layout/                # 布局组件（LeftMode / LeftTopMode / TopMode）
│   ├── router/                # 路由配置、权限守卫、动态路由生成
│   ├── store/                 # Pinia 状态管理
│   │   └── modules/           # user、permission、app、settings、tags-view、dictionary
│   ├── styles/                # 全局样式、主题（dark / dark-blue）
│   ├── utils/                 # 工具函数（service.ts — Axios 实例等）
│   └── views/                 # 页面视图
├── tests/                     # Vitest 测试用例
├── types/                     # TypeScript 类型声明
├── .env                       # 默认环境变量
├── .env.staging               # 测试环境变量
├── vite.config.ts             # Vite 配置（代理、别名、插件）
└── vitest.config.ts           # Vitest 配置
```

## 快速开始

```bash
# 在项目根目录安装依赖
cd ../.. && pnpm install

# 启动开发服务器
pnpm dev:web
# 或在本目录直接启动
pnpm dev
```

开发服务器运行在 `http://localhost:3333`，请求 `/api/*` 自动代理到后端 `http://localhost:3000`。

## 命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动 Vite 开发服务器 (:3333) |
| `pnpm build:prod` | 类型检查 + 生产环境构建 |
| `pnpm build:stage` | 类型检查 + 测试环境构建 |
| `pnpm preview:prod` | 生产构建并本地预览 |
| `pnpm preview:stage` | 测试环境构建并本地预览 |
| `pnpm lint` | ESLint 修复 + Prettier 格式化 |
| `pnpm test` | 运行 Vitest 单元测试 |

## 架构

### 路由系统

```
constantRoutes（始终存在）
  ├── /login          # 登录页
  ├── /404            # 404 页面
  ├── /403            # 403 无权限
  ├── /               # 首页（重定向到 /dashboard）
  └── /redirect       # 重定向辅助页

asyncRoutes（动态生成）
  └── 用户登录后，permissionStore 将后端返回的 Resource 树转换为 Vue Router 路由
     ├── MENU 资源 → 布局容器路由
     └── PAGE 资源 → 叶子路由（懒加载组件）
```

路由守卫 (`router/permission.ts`)：
1. 无 Token → 跳转 `/login`（白名单除外）
2. 有 Token 且前往 `/login` → 重定向到 `/`
3. 有 Token 但用户信息未加载 → 调用 `getInfo()` → `setRoutes()` → 动态添加路由

路由支持 **hash** 和 **history** 两种模式，通过 `VITE_ROUTER_HISTORY` 环境变量切换。

### 状态管理

| Store | 职责 |
|-------|------|
| `user` | accessToken、refreshToken、userInfo（含资源树） |
| `permission` | 将资源树转换为 Vue Router 动态路由 |
| `app` | 侧边栏状态、设备类型、布局状态 |
| `settings` | 主题、标签缓存、布局模式等持久化配置 |
| `tags-view` | 已打开的页面标签 |
| `dictionary` | 数据字典缓存 |

### HTTP 请求

Axios 实例 (`utils/service.ts`)：
- **请求拦截器**：自动附加 `Authorization: Bearer <token>`
- **响应拦截器**：`code === 200` 成功；`code === 401` 触发 Token 刷新队列（并发 401 排队，一次刷新后批量重试）

### 动态表单/表格

```
useFormTable(fieldCode)
  → 请求后端 Field 配置（按 fieldCode 获取）
  → 按 fieldGroup 拆分为 form / table / button 三组
  → BlFormCard + BlTableCard 渲染对应组件
```

### 权限指令

- `v-permission="['admin']"` — 用户角色不匹配时移除 DOM 元素
- `v-dialog-drag` — 使 Element Plus 对话框可拖拽

### 布局与主题

支持三种布局模式：`LeftMode`（侧边栏）、`LeftTopMode`（侧边栏+顶栏）、`TopMode`（顶栏）。

内置 `dark` 和 `dark-blue` 两套暗色主题，通过 CSS 变量实现。

## 环境变量

```env
# 应用标题
VITE_APP_TITLE=管理平台

# API 代理（开发环境走 Vite proxy → localhost:3000）
VITE_BASE_API=/api

# 路由模式：hash | history
VITE_ROUTER_HISTORY=hash

# 静态资源部署路径
VITE_PUBLIC_PATH=/
```

配置文件按环境加载：`.env`（默认）/ `.env.staging` / `.env.production`。

## Git 提交规范

| 类型 | 说明 |
|------|------|
| `feat` | 新增功能 |
| `fix` | 修复 Bug |
| `perf` | 性能优化 |
| `style` | 代码风格变更（不影响运行结果） |
| `refactor` | 重构 |
| `revert` | 撤销变更 |
| `test` | 测试相关 |
| `docs` | 文档和注释 |
| `chore` | 依赖更新/脚手架配置等 |
| `workflow` | 工作流改进 |
| `ci` | CI/CD 相关 |
| `types` | 类型定义 |
| `wip` | 开发中 |

---

更多信息请参阅[项目根目录 README](../../README.md)和 [CLAUDE.md](../../CLAUDE.md)。
