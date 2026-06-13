# Server — NestJS 后端

基于 **NestJS** 的 RBAC 权限管理系统后端，提供 JWT 认证、资源级鉴权、用户/角色/资源管理、动态表单配置等 API。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | NestJS 9、TypeScript |
| 数据库 | MySQL (TypeORM)、Redis (缓存 + 刷新 Token) |
| 认证 | Passport (JWT + Local)、bcryptjs |
| 验证 | class-validator、class-transformer、Joi |
| 文档 | Swagger (`@nestjs/swagger`) |
| 测试 | Jest、Supertest |

## 项目结构

```
apps/server/
├── src/
│   ├── core/                  # 全局拦截器、过滤器、守卫
│   │   ├── interceptor/       # TransformInterceptor — 统一响应格式
│   │   └── filter/            # HttpExceptionFilter — 异常处理
│   ├── guards/                # AuthTokenGuard (JWT) + ResourceGuard (资源鉴权)
│   ├── decorators/            # @NoAuth、@Everyone、@Admin、@ResourceName
│   ├── modules/
│   │   ├── auth/              # 登录、登出、用户详情、Token 刷新
│   │   ├── user/              # 用户 CRUD、角色分配
│   │   ├── role/              # 角色 CRUD、资源分配
│   │   ├── resource/          # 资源树 CRUD（菜单/页面/接口）
│   │   ├── dictionary/        # 数据字典
│   │   ├── field/             # 动态表单/表格配置
│   │   └── example/           # CRUD 示例模块
│   ├── config/                # 环境变量 Joi 校验
│   └── utils/                 # 工具函数
├── test/                      # E2E & 单元测试
├── .env.development           # 开发环境变量
├── .env.test                  # 测试环境变量
└── .env.production            # 生产环境变量
```

## 快速开始

```bash
# 在项目根目录安装依赖
cd ../.. && pnpm install

# 配置环境变量（编辑 .env.development）
#   必填：MYSQL_*、REDIS_*、JWT_SECRET_KEY

# 初始化数据库
mysql -u root -p < ../../docs/init.sql

# 启动开发服务器（热更新）
pnpm dev:server
# 或在本目录直接启动
pnpm run start:dev
```

服务运行在 `http://localhost:3000`，Swagger 文档在 `http://localhost:3000/docs`。

## 命令

| 命令 | 说明 |
|------|------|
| `pnpm run start:dev` | 开发模式（NODE_ENV=development，热更新） |
| `pnpm run start:test` | 测试环境模式 |
| `pnpm run start:prod` | 生产环境模式 |
| `pnpm run build` | 编译 TypeScript |
| `pnpm run lint` | ESLint 检查并修复 (`src/` & `test/`) |
| `pnpm run format` | Prettier 格式化 |
| `pnpm run test` | 运行 Jest 单元测试 |
| `pnpm run test:e2e` | 运行 E2E 测试 |
| `pnpm run test:cov` | 运行测试并生成覆盖率报告 |

## 架构

### 请求处理流程

```
请求 → AuthTokenGuard (JWT 校验)
     → ResourceGuard (资源鉴权)
     → Controller (业务逻辑)
     → TransformInterceptor (封装响应为 { code, data, message })
     → 响应
```

异常经由 `HttpExceptionFilter` 统一转换为 `{ code, message, data }` 格式。

### 响应格式

所有接口返回统一结构：

```json
{
  "code": 200,
  "data": { … },
  "message": "请求成功"
}
```

- `code === 200`：请求成功
- `code === 401`：Token 过期（前端自动刷新）
- 其他 code：业务错误

### 认证流程

```
POST /api/auth/login (username + password)
  → LocalStrategy 校验（bcrypt 比对）
  → 返回 accessToken + refreshToken
  → 前端存储 Token 并在请求头携带 Authorization: Bearer <accessToken>

GET /api/auth/info
  → 返回用户详情、角色、资源树（前端据此生成路由）

GET /api/auth/refresh
  → 校验 refreshToken (Redis 中 30 天有效)
  → 返回新的 accessToken + refreshToken
```

### 权限控制

两个全局 Guard 按顺序应用于所有路由：

| Guard | 职责 | 跳过条件 |
|-------|------|---------|
| `AuthTokenGuard` | JWT Token 验证 | `@NoAuth()` |
| `ResourceGuard` | 验证用户资源树是否包含目标资源 | `@NoAuth()`、`@Everyone()`、管理员 |

装饰器：

| 装饰器 | 作用域 | 说明 |
|--------|--------|------|
| `@NoAuth()` | 方法/类 | 公开接口，无需认证 |
| `@Everyone()` | 方法 | 任意已登录用户可访问 |
| `@Admin()` | 方法 | 仅 `isAdmin: true` 的用户可访问 |
| `@ResourceName('xxx')` | 类 | 声明控制器资源名，配合 ResourceGuard 鉴权 |

### 数据模型

```
User ──M:N──> Role ──M:N──> Resource (自引用树)
```

- **User**：`isAdmin` 管理员标识，`@BeforeInsert` 自动 bcrypt 哈希密码
- **Role**：`isDefault` 默认角色（新用户自动分配）
- **Resource**：自引用树形结构，`type` 为 `MENU('0')` / `PAGE('1')` / `URL('2')`

### 缓存策略

- 用户详情缓存在 Redis 中（key: `user_detail_<id>`，24 小时 TTL）
- 用户信息更新或密码修改时自动清除缓存
- 刷新 Token 存储在 Redis 中（30 天 TTL）

### 额外模块

- **Dictionary**：键值对数据字典
- **Field**：动态表单/表格/按钮配置，以 JSON 存储在 MySQL 中，按 `fieldCode` 分组
- **Example**：标准 CRUD 示例模块，可作为新模块的模板

## 环境变量

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

# 应用
RBAC_APP_PORT=3000
```

按 `NODE_ENV` 加载对应 `.env.*` 文件，由 Joi schema 校验。

---

更多信息请参阅[项目根目录 README](../../README.md)和 [CLAUDE.md](../../CLAUDE.md)。
