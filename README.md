# Nest Vue Admin

基于 **NestJS + Vue 3** 的全栈 RBAC 用户权限管理系统模板，开箱即用。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3、TypeScript、Element Plus、Pinia、Vite |
| 后端 | NestJS、TypeORM、MySQL、Redis、Passport (JWT) |
| 共享 | pnpm workspace monorepo、共享类型包 (`@nest-vue-admin/shared`) |
| 工具 | ESLint (flat config)、Prettier、Vitest、Jest、Swagger |

## 项目结构

```
UAC-Template/
├── apps/
│   ├── web/                  # Vue 3 前端
│   └── server/               # NestJS 后端
├── packages/
│   └── shared/               # 共享类型 (@uac/shared)
├── docs/
│   └── init.sql              # 数据库初始化脚本
├── pnpm-workspace.yaml       # pnpm workspace 配置
├── package.json              # 根 workspace 脚本
├── tsconfig.base.json        # 共享 TypeScript 配置
├── eslint.config.js          # 共享 ESLint 配置
├── .prettierrc               # 共享 Prettier 配置
├── CLAUDE.md                 # Claude Code 指引
```

## 快速开始

### 前置条件

- **Node.js** >= 18
- **pnpm** >= 8
- **MySQL** (默认端口 3306)
- **Redis** (默认端口 6379)

### 安装 & 启动

```bash
# 1. 克隆项目
git clone <repo-url> && cd UAC-Template

# 2. 安装所有依赖
pnpm install

# 3. 初始化数据库
#    创建 MySQL 数据库，然后导入 docs/init.sql
#    mysql -u root -p < docs/init.sql

# 4. 配置环境变量
#    编辑 apps/server/.env.development 填入你的 MySQL 和 Redis 连接信息
#    默认配置即可运行（需要本地 MySQL 和 Redis）

# 5. 启动开发服务器（后端 + 前端同时启动）
pnpm dev
```

- 后端 API：http://localhost:3000/api
- Swagger 文档：http://localhost:3000/docs
- 前端页面：http://localhost:3333

## 命令参考

### Workspace 根目录

```bash
pnpm dev              # 同时启动前后端开发服务器
pnpm dev:web          # 仅启动前端 (:3333)
pnpm dev:server       # 仅启动后端 (:3000)
pnpm build            # 构建所有包（shared → server → web）
pnpm lint             # 所有项目代码检查
pnpm test             # 运行所有测试
pnpm format           # 统一格式化代码
```

### 前端 (`apps/web/`)

```bash
pnpm dev              # 开发模式
pnpm build:prod       # 生产构建
pnpm build:stage      # 测试环境构建
pnpm lint             # ESLint + Prettier 检查修复
pnpm test             # Vitest 单元测试
```

### 后端 (`apps/server/`)

```bash
pnpm run start:dev    # 开发模式（热更新）
pnpm run start:test   # 测试环境
pnpm run start:prod   # 生产环境
pnpm run build        # 编译
pnpm run lint         # ESLint 检查修复
pnpm run test         # Jest 单元测试
pnpm run test:e2e     # E2E 测试
pnpm run test:cov     # 测试覆盖率
```

## RBAC 权限模型

```
User ──many-to-many──> Role ──many-to-many──> Resource
```

- **User**：用户，支持管理员 (`isAdmin`) 标识
- **Role**：角色，可设置默认角色 (`isDefault`)，新用户自动分配
- **Resource**：资源/权限，自引用树形结构（父 → 子），三种类型：
  - `MENU ('0')`：菜单目录
  - `PAGE ('1')`：页面/组件
  - `URL ('2')`：接口地址

管理员 (`isAdmin: true`) 拥有所有权限，跳过资源级鉴权。

### 后端权限控制

两个全局 Guard 按顺序执行：

| Guard | 职责 |
|-------|------|
| `AuthTokenGuard` | JWT 验证，`@NoAuth()` 装饰的接口跳过 |
| `ResourceGuard` | 资源级鉴权，验证用户是否有权访问该资源 |

自定义装饰器：

| 装饰器 | 作用 |
|--------|------|
| `@NoAuth()` | 公开接口，无需登录 |
| `@Everyone()` | 任意已登录用户可访问 |
| `@Admin()` | 仅管理员可访问 |
| `@ResourceName('name')` | 声明该控制器对应的资源名，用于资源鉴权 |

### 前端路由权限

前端路由由后端的 Resource 树动态生成：用户登录后，前端获取用户的资源树，`permissionStore` 将其转换为 Vue Router 路由。菜单配置 (`MENU` 类型) 生成布局容器，页面配置 (`PAGE` 类型) 生成叶子路由。

## 环境变量

### 后端 (`apps/server/.env.*`)

```env
# 数据库
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=nestjs

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSPORT=123456

# JWT
JWT_SECRET_KEY=nestjs
JWT_ACCESS_TOKEN_TTL=1h
JWT_REFRESH_TOKEN_TTL=24h

# 应用端口
RBAC_APP_PORT=3000
```

配置文件按环境加载：`.env.development` / `.env.test` / `.env.production`。

### 前端 (`apps/web/.env.*`)

```env
VITE_APP_TITLE=管理平台
VITE_BASE_API=/api            # 开发时走 Vite 代理 → localhost:3000
VITE_ROUTER_HISTORY=hash      # 路由模式：hash | history
VITE_PUBLIC_PATH=/            # 部署路径
```

## API 规范

所有接口返回统一格式：

```json
{
  "code": 200,
  "data": { ... },
  "message": "请求成功"
}
```

- `code === 200` 表示成功
- `code === 401` 前端自动刷新 Token
- 其他 code 表示业务错误

主要接口：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/info` | 获取用户详情和权限 |
| GET | `/api/auth/refresh` | 刷新 Token |
| GET | `/api/user` | 用户列表（分页） |
| POST | `/api/user` | 创建用户 |
| GET | `/api/role` | 角色列表 |
| POST | `/api/role` | 创建角色 |
| GET | `/api/resource` | 资源树 |
| POST | `/api/resource` | 创建资源 |

完整接口文档：启动后端后访问 `http://localhost:3000/docs`。

## 动态表单/表格

后端 `Field` 实体支持以 JSON 格式存储表单、表格、按钮配置，按 `fieldCode` 分组（通常对应资源 ID）。前端通过 `useFormTable(fieldCode)` 动态拉取配置并渲染对应的表单和表格组件。（`BlFormCard`、`BlTableCard` 等）

## License

MIT © 2025 bulv
