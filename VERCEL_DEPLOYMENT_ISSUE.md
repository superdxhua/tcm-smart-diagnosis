# Vercel 部署问题诊断

## 🔍 问题根源

### 当前 `vercel.json` 配置

```json
{
  "buildCommand": "npm run build:web",     // ⚠️ 只构建前端
  "outputDirectory": "dist-web",           // ⚠️ 只输出前端
}
```

**问题：**
1. ✅ 前端代码被构建到 `dist-web` 目录
2. ❌ 后端代码没有被编译
3. ❌ TypeScript 代码无法直接在 Node.js 环境中运行
4. ❌ `server/api/index.ts` 导入 `../src/app.module.ts` 失败

---

## ✅ 解决方案

### 方案 1：使用 `installCommand` 构建后端（推荐）

修改 `vercel.json`，在安装依赖时同时构建前端和后端：

```json
{
  "version": 2,
  "name": "tcm-smart-diagnosis-frontend",
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "npm install --legacy-peer-deps && cd server && npm install --legacy-peer-deps && npm run build",
  "framework": null,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/server/api/index.ts"
    },
    {
      "source": "/",
      "destination": "/index.html"
    },
    {
      "source": "/pages/(.*)",
      "destination": "/index.html"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**改动：**
- 修改 `installCommand`：
  - 安装前端依赖
  - 进入 `server` 目录
  - 安装后端依赖
  - 构建后端代码（TypeScript → JavaScript）

---

## ⚠️ 另一个问题：环境变量

### 当前代码问题

```typescript
// server/src/app.module.ts
import * as dotenv from 'dotenv';

dotenv.config({ path: '/workspace/projects/.env', override: true });
```

**问题：**
- `/workspace/projects/.env` 这个路径在 Vercel 上不存在
- Vercel 使用环境变量配置，不使用 `.env` 文件

**解决方案：**

修改 `server/src/app.module.ts`，移除 `.env` 文件加载：

```typescript
// server/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// ❌ 删除这一段
// import * as dotenv from 'dotenv';
// dotenv.config({ path: '/workspace/projects/.env', override: true });

// 直接导入模块
import { TcmModule } from './tcm/tcm.module';
// ... 其他导入
```

或者修改为不指定路径（只在本地开发时使用）：

```typescript
import * as dotenv from 'dotenv';

// 只在本地开发时加载 .env 文件
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
```

---

## 🎯 完整修复步骤

### 步骤 1：修改 `vercel.json`

1. 访问：https://github.com/superdxhua/tcm-smart-diagnosis
2. 找到 `vercel.json` 文件
3. 点击编辑（✏️）
4. 修改 `installCommand` 为：
   ```json
   "installCommand": "npm install --legacy-peer-deps && cd server && npm install --legacy-peer-deps && npm run build"
   ```
5. 提交信息：
   ```
   fix: 在 vercel.json 中添加后端构建命令
   ```

### 步骤 2：修改 `server/src/app.module.ts`

1. 找到 `server/src/app.module.ts` 文件
2. 点击编辑（✏️）
3. 删除或修改环境变量加载代码：

**删除方式：**
```typescript
// ❌ 删除这几行
import * as dotenv from 'dotenv';
dotenv.config({ path: '/workspace/projects/.env', override: true });
```

**修改方式（推荐）：**
```typescript
// ✅ 修改为只在本地开发时加载
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
```

4. 提交信息：
   ```
   fix: 移除生产环境中的 .env 文件加载
   ```

### 步骤 3：配置 Vercel 环境变量

1. 访问 Vercel Dashboard
2. 找到你的项目
3. 进入 Settings → Environment Variables
4. 添加以下环境变量（根据你的 `.env` 文件）：

例如：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `PROJECT_DOMAIN`
- 其他必要的环境变量

### 步骤 4：等待 Vercel 重新部署

预计部署时间：2-3 分钟（因为需要构建后端代码）

### 步骤 5：测试

```
https://tcm-smart-diagnosis-git-main-superdxhuas-projects.vercel.app/api/health
```

**预期响应：**

```json
{
  "status": "ok",
  "message": "Service is healthy",
  "timestamp": "2024-02-22T...",
  "uptime": 123.456
}
```

---

## 📋 请告诉我

1. 你是否愿意修改这两个文件？
2. 你的 `.env` 文件中有哪些环境变量？
3. Vercel Dashboard 是否已经配置了这些环境变量？
