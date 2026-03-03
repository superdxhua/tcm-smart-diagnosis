# Vercel 一体化部署架构说明

## 架构概述

前端和后端部署在**同一个 Vercel 项目** `zhongyi-smart`（prj_6SNjA9HMONCFXeCO21sU6P0K23RX）下。

## 部署流程

### 1. 构建阶段（根目录 vercel.json）

```json
{
  "buildCommand": "npm install && npm run build:web && cd server && npm install && npm run build",
  "outputDirectory": "dist-web"
}
```

**构建步骤**：
1. 安装根目录依赖：`npm install`
2. 构建前端：`npm run build:web` → 输出到 `dist-web/`
3. 安装后端依赖：`cd server && npm install`
4. 构建后端：`npm run build` → 输出到 `server/dist/`

### 2. 部署结构

**前端静态文件**：
- 目录：`dist-web/`
- 访问：`/` → 返回 `index.html`
- 路由：SPA 路由，所有非 API 请求返回 `index.html`

**后端 API**：
- 入口：`api/index.ts`（Vercel Function）
- 代码：`server/dist/app.module`（编译后的 NestJS 应用）
- 访问：`/api/*` → 由 `api/index.ts` 处理

### 3. 路由配置（根目录 vercel.json）

```json
"routes": [
  {
    "src": "/api/(.*)",
    "dest": "/api/$1"
  },
  {
    "src": "/(.*\\.(png|jpg|...))",
    "dest": "/$1"
  },
  {
    "handle": "filesystem"
  },
  {
    "src": "/(.*)",
    "dest": "/index.html"
  }
]
```

**路由规则**：
1. `/api/*` → 转发到 `api/` 目录下的 Vercel Functions
2. 静态文件（图片、CSS、JS）→ 直接返回
3. 文件系统匹配 → 尝试返回对应文件
4. 其他路由 → 返回 `index.html`（SPA 路由）

## 后端工作原理

### api/index.ts（Vercel Function 入口）

```typescript
import { AppModule } from '../server/dist/app.module';

export default async function handler(req: any, res: any) {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(express()));
  return app.getHttpAdapter().getInstance()(req, res);
}
```

**工作流程**：
1. Vercel 接收 `/api/*` 请求
2. 路由到 `api/index.ts` 的 `handler` 函数
3. `handler` 初始化 NestJS 应用（导入 `server/dist/app.module`）
4. NestJS 处理请求并返回响应

## 为什么之前报错 `weapp-tw: command not found`？

**原因**：
- `server/package.json` 中有错误的 `bin` 字段：
  ```json
  "bin": {
    "weapp-tw": "./bin/weapp-tw"
  }
  ```
- Vercel 在构建时尝试执行 `npm run build`，npm 检查 `bin` 字段
- `weapp-tw` 是前端 Tailwind CSS 的补丁工具，不应该出现在后端 `package.json` 中

**解决方案**：
- 从 `server/package.json` 中删除 `bin` 字段（已完成）

## 部署检查清单

### 1. 检查构建日志

访问 Vercel Dashboard 查看部署日志：
https://vercel.com/superdxhuas-projects/zhongyi-smart/deployments

**预期结果**：
- ✅ 前端构建成功：`Build output: dist-web/`
- ✅ 后端构建成功：`Build output: server/dist/`
- ❌ 无 `weapp-tw: command not found` 错误

### 2. 检查前端页面

访问：https://zhongyi-smart.vercel.app/

**预期结果**：
- 页面正常加载
- 静态资源（CSS、JS、图片）正常加载

### 3. 检查后端 API

访问：https://zhongyi-smart.vercel.app/api/health

**预期结果**：
```json
{
  "status": "ok",
  "message": "API is healthy"
}
```

### 4. 检查其他 API 端点

访问：https://zhongyi-smart.vercel.app/api/version

**预期结果**：
```json
{
  "version": "1.0.0",
  "name": "tcm-smart-diagnosis-api"
}
```

## 关键配置文件

### 根目录 vercel.json

```json
{
  "version": 2,
  "name": "zhongyi-smart",
  "buildCommand": "npm install && npm run build:web && cd server && npm install && npm run build",
  "outputDirectory": "dist-web",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    ...
  ]
}
```

### api/index.ts

```typescript
import { AppModule } from '../server/dist/app.module';

export default async function handler(req: any, res: any) {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(express()));
  return app.getHttpAdapter().getInstance()(req, res);
}
```

### server/vercel.json（可选，可以删除）

```json
{
  "version": 2,
  "buildCommand": "npx @nestjs/cli build",
  "outputDirectory": "dist"
}
```

**注意**：`server/vercel.json` 在一体化部署中**不会被使用**，因为构建命令由根目录 `vercel.json` 统一管理。

## 常见问题

### 1. 后端构建失败

**症状**：`Cannot find module '../server/dist/app.module'`

**原因**：后端构建失败，`server/dist/` 目录不存在

**解决方案**：
- 检查 `server/package.json` 中的构建脚本
- 确保依赖安装成功：`cd server && npm install`

### 2. 前端构建失败

**症状**：前端页面 404

**原因**：前端构建失败，`dist-web/` 目录不存在

**解决方案**：
- 检查 `package.json` 中的 `build:web` 脚本
- 确保前端依赖安装成功

### 3. API 请求 404

**症状**：`/api/health` 返回 404

**原因**：
- `api/index.ts` 不存在或路径错误
- 路由配置错误

**解决方案**：
- 检查 `api/index.ts` 文件是否存在
- 检查 `vercel.json` 中的路由配置

## 总结

**一体化部署的核心**：
1. 根目录 `vercel.json` 统一管理构建和路由
2. `api/index.ts` 作为 Vercel Function 入口，导入 `server/dist/app.module`
3. 前端和后端共享同一个 Vercel 项目
4. 不需要为后端创建独立的 Vercel 项目

**错误的配置**：
- ❌ `server/.vercel/project.json`（会导致后端变成独立项目）
- ❌ 在 Vercel Dashboard 中设置后端项目的 Root Directory（会覆盖一体化部署配置）

**正确的配置**：
- ✅ 根目录 `vercel.json` 统一管理构建
- ✅ `api/index.ts` 导入编译后的 NestJS 应用
- ✅ 删除 `server/.vercel/` 目录（如果有）
