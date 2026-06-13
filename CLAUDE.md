# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack RBAC (Role-Based Access Control) management system template — **NestJS** backend + **Vue 3** frontend, with MySQL, Redis, and JWT authentication.

## Monorepo Structure

This is a **pnpm workspace monorepo**.

```
nest-vue-admin/
├── pnpm-workspace.yaml
├── package.json              — root workspace scripts
├── .npmrc                    — shamefully-hoist = true
├── .prettierrc               — shared Prettier (printWidth: 80, singleQuote, semi: false)
├── tsconfig.base.json        — shared TS options (experimentalDecorators, emitDecoratorMetadata, …)
├── eslint.config.js          — root shared ignores + prettier rule
├── apps/
│   ├── web/                  — Vue 3 + Element Plus + Pinia + Vite (package: v3-admin-vite)
│   └── server/               — NestJS + TypeORM + MySQL + Redis + JWT (package: server)
├── packages/
│   └── shared/               — @nest-vue-admin/shared (types-only)
└── docs/                     — init.sql, architecture notes (Chinese)
```

## Commands

### Root (workspace-level)

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start backend (:3000) and frontend (:3333) concurrently |
| `pnpm dev:web` | Start frontend dev server only |
| `pnpm dev:server` | Start backend dev server only |
| `pnpm build` | Build shared types, then backend, then frontend |
| `pnpm build:shared` | Build @nest-vue-admin/shared package only |
| `pnpm lint` | Run lint on all workspace packages |
| `pnpm test` | Run tests on all workspace packages |
| `pnpm test:web` | Run frontend tests (Vitest) |
| `pnpm test:server` | Run backend tests (Jest) |
| `pnpm format` | Format all files with Prettier |
| `pnpm clean` | Remove all dist/node_modules |
| `pnpm install` | Install all workspace dependencies (must run from root) |

All projects use **pnpm** (>=8). Run `pnpm install` from the root to set up the workspace. Each project can also be worked on independently: `cd apps/web && pnpm dev`.

> **Note**: The frontend package name is `v3-admin-vite`, the backend is `server`. Use these names with `pnpm --filter`, e.g. `pnpm --filter v3-admin-vite lint`.

### Frontend (`apps/web/`)

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start dev server on port 3333 (proxies /api → localhost:3000) |
| `pnpm build:prod` | Production build (type-check + vite build) |
| `pnpm build:stage` | Staging build |
| `pnpm preview:prod` | Build and preview production bundle |
| `pnpm lint` | Run ESLint (fix) + Prettier (write) |
| `pnpm test` | Run Vitest test suite |

### Backend (`apps/server/`)

| Command | What it does |
|---------|-------------|
| `pnpm run start:dev` | Dev mode with hot reload (NODE_ENV=development) |
| `pnpm run start:test` | Run with test environment config |
| `pnpm run start:prod` | Production mode |
| `pnpm run build` | Compile TypeScript |
| `pnpm run lint` | ESLint fix on src/ and test/ |
| `pnpm run format` | Prettier write on src/**/*.ts |
| `pnpm run test` | Run Jest unit tests (`*.spec.ts`) |
| `pnpm run test:e2e` | Run E2E tests (Jest config via `test/jest-e2e.json`) |

## Shared Types Package (`packages/shared/`)

`@nest-vue-admin/shared` is a types-only package — it has zero runtime code. It contains:

- **`ResourceType` enum** — the single source of truth: `MENU = '0'`, `PAGE = '1'`, `URL = '2'`. Both frontend and backend import from here. (Previously the frontend used `MODAL = '2'` — same value, wrong name.)
- **`ApiResponseData<T>`** — the API response envelope that both sides must conform to
- **`PaginationResponseData<T>`**, **`PaginationRequestData<T>`** — pagination contract types

Import in either project: `import { ResourceType } from '@nest-vue-admin/shared'`

tsconfig path aliases and vite resolve aliases are already configured in both projects. The types are also listed as `workspace:*` dependencies. Domain types (`User`, `Role`, `ResourceNode`) remain local to each project because they have different shapes (frontend uses plain interfaces, backend uses TypeORM entity classes with decorators).

## Architecture

### Backend (NestJS)

**Global pipeline**: All routes are prefixed with `/api`. Every response passes through:
1. `TransformInterceptor` — wraps success responses as `{ data, code: 200, message: '请求成功' }`
2. `HttpExceptionFilter` — converts exceptions to `{ data, message, code: <http_status> }`

The frontend's axios layer expects this exact `code === 200` convention.

**Authentication & Authorization** (two global guards applied to every route):

1. `AuthTokenGuard` — JWT validation via Passport. Routes decorated with `@NoAuth()` skip this guard.
2. `ResourceGuard` — Resource-level access control. Checks whether the authenticated user's resource tree contains the route's declared resource name. Bypassed by `@NoAuth()`, `@Everyone()`, and admin users (`isAdmin: true`).

**Decorators for access control** (in `decorators/`):
- `@NoAuth()` — public endpoint, no token required
- `@Everyone()` — any authenticated user can access
- `@Admin()` — only admin users (isAdmin = true)
- `@ResourceName('name')` — class-level decorator; the `ResourceGuard` checks that the user's resource tree contains a node matching this name

**Auth flow**: `POST /api/auth/login` (LocalStrategy, username+password, bcrypt comparison) → returns accessToken + refreshToken → `GET /api/auth/info` returns user detail with resource tree → `GET /api/auth/refresh` refreshes tokens.

**Token management**: Refresh tokens stored in Redis (30-day TTL). Passwords auto-hashed via TypeORM `@BeforeInsert`.

**RBAC data model** (TypeORM entities):
- `User` ↔ `Role` (many-to-many, junction: `user_role`)
- `Role` ↔ `Resource` (many-to-many, junction: `role_resource`)
- `Resource` is self-referencing (`parent`/`children`) forming a tree — used for menus/navigation
- `Resource.type` enum: `MENU('0')`, `PAGE('1')`, `URL('2')`

**Caching**: User detail is cached in Redis (key: `user_detail_<id>`, 24h TTL). Cache is invalidated on profile updates and password changes.

**Config**: `.env.<NODE_ENV>` files, validated by Joi schema (`JWT_SECRET_KEY`, `MYSQL_*`, `REDIS_*`, etc.). Database uses `synchronize: true` (auto-sync entities in dev).

**Additional modules**: `dictionary` (key-value data dictionary), `field` (dynamic form/table configuration stored as JSON in MySQL, keyed by `fieldCode`), `example` (demonstration CRUD module).

### Frontend (Vue 3)

**Route system** (`router/`):
- `constantRoutes` — always-present routes: login, 404, 403, dashboard (`/`), redirect
- `asyncRoutes` — admin-only routes (currently just a catch-all ErrorPage)
- Dynamic routes are generated at runtime from the backend resource tree (see `store/modules/permission.ts` → `convertResourcesToRoutes()`). Resources of type MENU become layout wrappers with children; PAGE resources become leaf routes with lazy-loaded components.
- `flatMultiLevelRoutes()` — flattens 3+ level nested routes to 2 levels (required for keep-alive to work with Element Plus tabs)
- Route modes: hash or history, controlled by `VITE_ROUTER_HISTORY` env var
- Config: `src/config/route.ts` controls `async` (dynamic routes on/off), `defaultRoles`, `thirdLevelRouteCache`

**Auth flow on the frontend** (`router/permission.ts` guard):
1. No token → redirect to `/login` (unless path is in whiteList)
2. Has token, going to `/login` → redirect to `/`
3. Has token, user info not loaded → call `userStore.getInfo()` → `permissionStore.setRoutes()` generates dynamic routes from resource tree → add routes to router

**API layer** (`utils/service.ts`):
- Axios instance with request interceptor (attaches `Bearer <token>`) and response interceptor
- Response convention: `code === 200` = success, `code === 401` = token expired (triggers refresh queue)
- Token refresh uses a queue pattern — concurrent 401s are queued and retried after a single refresh call succeeds
- All API function files live in `api/<domain>/index.ts` with corresponding types in `api/<domain>/types/`

**State management** (Pinia stores in `store/modules/`):
- `user` — accessToken, refreshToken, userInfo (includes resources tree)
- `permission` — converts user's resource tree into Vue Router routes
- `app` — sidebar, device, layout state
- `settings` — theme, tags-view caching, layout mode
- `tags-view` — open page tabs
- `dictionary` — data dictionary cache

**Dynamic Form/Table system** (`hooks/useFormTable.ts`):
- Backend `Field` entity stores form/table/button configurations as JSON, keyed by `fieldCode` (typically a resource ID)
- `useFormTable(id)` fetches field config, splits by `fieldGroup` ('form' | 'table' | 'button'), and returns reactive options for rendering dynamic forms and tables
- Used with `BlFormCard`, `BlFormTableItem`, `BlTableCard` components

**Custom components** (`components/BulvComponent/`):
- `BlFormCard` + `BlFormTableItem` — dynamic form based on field configuration
- `BlTableCard` — dynamic table with select, pagination
- `BlDialog` — reusable dialog wrapper
- `BlSelect` / `BlSelectSpan` — enhanced select components
- `BlIcon` / `BlIconInput` — icon display and icon-picker input
- `BlCodeEditor` — Monaco Editor wrapper

**Directives**:
- `v-permission` — removes element if user lacks role (usage: `v-permission="['admin']"`)
- `v-dialog-drag` — makes Element Plus dialogs draggable

**Themes**: Dark and dark-blue themes via CSS variables in `styles/theme/`, registered in `styles/theme/register.scss`. Layout supports 3 modes (LeftMode, LeftTopMode, TopMode).

## Database Setup

The seed SQL is in `docs/init.sql`. The backend uses `synchronize: true` in development (auto-creates/alters tables from entities). Required services: MySQL and Redis.

## Key File Relationships

When modifying one side, check the corresponding code on the other side:

| Frontend | Backend | Relationship |
|----------|---------|-------------|
| `src/api/resource/types/resource.ts` | `modules/resource/entities/resource.entity.ts` | Resource type definitions — both import `ResourceType` from `@nest-vue-admin/shared` |
| `src/store/modules/permission.ts` | `modules/auth/auth.service.ts` (getUserDetail) | Frontend converts backend resource tree → Vue Router routes |
| `src/utils/service.ts` | `core/interceptor/transform/transform.interceptor.ts` | API response envelope contract: `{ code, data, message }` |
| `src/router/permission.ts` | `guards/access-token.guard.ts` + `guards/resource.guard.ts` | Auth flow: frontend guard ↔ backend guards |
| `src/api/login/index.ts` | `modules/auth/auth.controller.ts` | Auth endpoints: login, info, refresh |
| `src/hooks/useFormTable.ts` | `modules/field/field.service.ts` | Dynamic form/table config by `fieldCode` |

## Path Aliases

Both projects use path aliases configured in tsconfig — always use these, not relative imports:

- **apps/web**: `@/` → `src/`, `@nest-vue-admin/shared` → `packages/shared/src`
- **apps/server**: `@nest-vue-admin/shared` → `packages/shared/src` (also uses `src/` prefix for absolute imports within server)

Vite also has the `@nest-vue-admin/shared` alias in `vite.config.ts` — if imports from shared package fail at build time, check both tsconfig paths AND vite resolve alias.

## Known Quirks

- **`vue-tsc --noEmit` fails on node_modules types** — The `@vitejs/plugin-vue-jsx` and `@vitejs/plugin-vue` `.d.ts` files have syntax errors with vue-tsc 3.x. The Vite build itself works fine. Skip type-check in CI if needed, or upgrade vue-tsc when a compatible version is available.
- **`nest build` doesn't support TS 5.x `ignoreDeprecations: true`** — The NestJS CLI 9.x bundles an older TypeScript. The server tsconfig omits `ignoreDeprecations` entirely to support both `nest build` and `ts-jest`.
- **Server `@nestjs/microservices` peer dep mismatch** — The dependency is at v11 while `@nestjs/core` is v9. This is pre-existing and harmless (the microservices module isn't used). If upgrading NestJS to v10/v11, resolve this.
- **Notify component tests fail** — `tests/components/Notify.test.ts` needs `jsdom` environment configured in Vitest (`vitest.config.ts`). Currently the test environment lacks `document`.
