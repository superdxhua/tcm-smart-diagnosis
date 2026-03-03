# Vercel 配置问题分析

## 🔍 当前 `vercel.json` 配置

```json
{
  "version": 2,
  "name": "tcm-smart-diagnosis-frontend",  // ⚠️ 只有前端
  "buildCommand": "npm run build:web",     // ⚠️ 只构建前端
  "outputDirectory": "dist-web",           // ⚠️ 只输出前端
  "rewrites": [
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
      "destination": "/index.html"         // ⚠️ 所有路由都重写到前端！
    }
  ]
}
```

---

## ❌ 问题分析

### 当前配置导致的问题

1. **所有请求都被前端重写规则拦截**
   - 即使访问 `/api/health`
   - 也会被重写到 `/index.html`
   - 返回的是前端 HTML 页面，不是后端 JSON

2. **缺少后端 API 配置**
   - 没有 `builds` 或 `functions` 配置
   - 没有 `/api/*` 路由的专用处理
   - Vercel 不知道如何处理后端请求

3. **命名问题**
   - `name` 是 `tcm-smart-diagnosis-frontend`
   - 说明这是专门配置为前端项目

---

## ✅ 正确的配置方式

### 方案 1：使用 `rewrites` 配置后端路由（推荐）

```json
{
  "version": 2,
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "npm install --legacy-peer-deps",

  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/server/api/index.ts"  // 🎯 后端 API 路由
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

### 方案 2：使用 `functions` 配置（高级）

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist-web/**",
      "use": "@vercel/static"
    }
  ],
  "functions": {
    "server/api/index.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

---

## 🔧 修复步骤

### 步骤 1：修改 `vercel.json`

在 GitHub 上修改 `vercel.json` 文件，**添加 `/api/*` 路由配置**：

```json
{
  "version": 2,
  "name": "tcm-smart-diagnosis",
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "npm install --legacy-peer-deps",

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

### 步骤 2：提交并等待部署

修改后，Vercel 会自动重新部署。

### 步骤 3：测试

1. 前端页面：
   ```
   https://tcm-smart-diagnosis-git-main-superdxhuas-projects.vercel.app/
   ```
   应该返回前端 HTML 页面

2. 后端 API：
   ```
   https://tcm-smart-diagnosis-git-main-superdxhuas-projects.vercel.app/api/health
   ```
   应该返回 JSON 数据

---

## 📋 请告诉我

修改完成后，请告诉我：

1. ✅ `vercel.json` 修改成功了吗？
2. ✅ Vercel 重新部署成功了吗？
3. ✅ 前端页面能正常访问吗？
4. ✅ 后端 API 能正常访问吗？
