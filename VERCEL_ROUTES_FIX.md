# Vercel 路由配置修复说明

## 问题描述

### Vercel 日志显示的错误
```
FEB 23 22:54:10.46
GET
401
zhongyi-smart-eekropuyf-superdxhuas-projects.vercel.app
/icons/icon-512x512.png
```

### 问题分析

**原因**：`/icons/icon-512x512.png` 是静态文件（PWA 图标），不应该返回 401 Unauthorized 错误。

**根本原因**：之前的 `vercel.json` 配置中，`rewrites` 规则将所有请求（包括静态文件）都重写到了 `index.html`：

```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/api"
  },
  {
    "source": "/(.*)",
    "destination": "/index.html"  // ❌ 这会匹配所有请求，包括静态文件
  }
]
```

这导致：
1. 静态文件请求（`/icons/icon-512x512.png`）被错误地重写为 `index.html`
2. 如果有认证中间件，可能会要求认证，返回 401

---

## 解决方案

### 使用 `routes` 配置替代 `rewrites`

`routes` 配置比 `rewrites` 更灵活，支持 `handle: "filesystem"`，它会先检查文件是否存在。

### 新的配置（vercel.json）

```json
{
  "version": 2,
  "name": "tcm-smart-diagnosis-frontend",
  "buildCommand": "npm install && npm run build:web && cd server && npm install && npm run build",
  "outputDirectory": "dist-web",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": null,
  "cleanUrls": true,
  "trailingSlash": false,
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30,
      "includeFiles": [
        "server/dist/**"
      ]
    },
    "api/health.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 10
    }
  },
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
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-Requested-With, Accept, Origin"
        },
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Max-Age",
          "value": "86400"
        }
      ]
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 路由规则详解

#### 规则 1: API 请求
```json
{
  "src": "/api/(.*)",
  "dest": "/api"
}
```
- **匹配**：所有 `/api/*` 请求
- **目的**：路由到 Serverless Functions（`api/index.ts`）
- **示例**：
  - `/api/auth/login` → `api/index.ts`
  - `/api/health` → `api/health.ts`

#### 规则 2: 文件系统检查
```json
{
  "handle": "filesystem"
}
```
- **匹配**：检查文件是否存在于 `dist-web` 目录
- **目的**：如果文件存在，直接提供静态文件
- **示例**：
  - `/icons/icon-512x512.png` → `dist-web/icons/icon-512x512.png` ✅
  - `/js/vendors-legacy.09925192.js` → `dist-web/js/vendors-legacy.09925192.js` ✅
  - `/login` → 文件不存在，继续下一个规则

#### 规则 3: SPA 路由 fallback
```json
{
  "src": "/(.*)",
  "dest": "/index.html"
}
```
- **匹配**：所有其他请求（文件不存在的请求）
- **目的**：返回 `index.html`，让前端路由处理
- **示例**：
  - `/login` → `dist-web/index.html`（前端路由处理）
  - `/patients` → `dist-web/index.html`（前端路由处理）
  - `/record-detail/123` → `dist-web/index.html`（前端路由处理）

---

## 工作流程

### 静态文件请求
```
用户请求: /icons/icon-512x512.png
  ↓
规则 1: 不匹配（不是 /api/*）
  ↓
规则 2: 文件系统检查
  ↓
✅ 文件存在 → 直接返回静态文件
```

### API 请求
```
用户请求: /api/auth/login
  ↓
规则 1: ✅ 匹配（/api/*）
  ↓
✅ 路由到 api/index.ts
```

### SPA 路由请求
```
用户请求: /login
  ↓
规则 1: 不匹配（不是 /api/*）
  ↓
规则 2: 文件系统检查
  ↓
❌ 文件不存在
  ↓
规则 3: ✅ 匹配
  ↓
✅ 返回 index.html（前端路由处理）
```

---

## 关键配置说明

### `cleanUrls: true`
- 自动去除 `.html` 扩展名
- 例如：`/login.html` → `/login`

### `trailingSlash: false`
- 不自动添加 `/`
- 例如：`/login` 不会变成 `/login/`

### `functions.includeFiles`
- 确保 `server/dist/**` 目录被包含在部署中
- API 需要这些编译后的文件才能运行

---

## 测试验证

### 1. 静态文件测试
```bash
curl -I https://tcmsmarthealth.com/icons/icon-512x512.png
```
**预期结果**：
```
HTTP/2 200
Content-Type: image/png
Content-Length: ...
```

### 2. API 测试
```bash
curl -I https://tcmsmarthealth.com/api/health
```
**预期结果**：
```
HTTP/2 200
Content-Type: application/json
```

### 3. SPA 路由测试
```bash
curl -I https://tcmsmarthealth.com/login
```
**预期结果**：
```
HTTP/2 200
Content-Type: text/html
```

---

## 对比：修复前后

### 修复前（❌ 有问题）
```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/api"
  },
  {
    "source": "/(.*)",
    "destination": "/index.html"  // ❌ 匹配所有请求
  }
]
```

**问题**：
- `/icons/icon-512x512.png` → 重写到 `/index.html` ❌
- 返回 401 Unauthorized ❌

### 修复后（✅ 正确）
```json
"routes": [
  {
    "src": "/api/(.*)",
    "dest": "/api"
  },
  {
    "handle": "filesystem"  // ✅ 先检查文件是否存在
  },
  {
    "src": "/(.*)",
    "dest": "/index.html"  // ✅ 只在文件不存在时匹配
  }
]
```

**结果**：
- `/icons/icon-512x512.png` → 文件存在，直接返回 ✅
- `/api/auth/login` → 路由到 API ✅
- `/login` → 返回 `index.html`（前端路由）✅

---

## 下一步

1. **推送代码到 Git**
   ```bash
   git add vercel.json
   git commit -m "fix: 修复 Vercel 路由配置，解决静态文件 401 错误"
   git push
   ```

2. **等待 Vercel 自动部署**
   - 通常需要 1-3 分钟

3. **验证修复结果**
   ```bash
   # 测试静态文件
   curl -I https://tcmsmarthealth.com/icons/icon-512x512.png

   # 测试 API
   curl -I https://tcmsmarthealth.com/api/health

   # 测试登录
   curl -X POST https://tcmsmarthealth.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"123456"}'
   ```

4. **检查 Vercel 日志**
   - 登录 Vercel Dashboard
   - 查看 Functions 日志
   - 确认不再有 401 错误

---

## 参考资料

- [Vercel Routes Configuration](https://vercel.com/docs/configuration/project/routes)
- [Vercel Rewrites Configuration](https://vercel.com/docs/configuration/project/rewrites)
- [SPA Fallback](https://vercel.com/docs/guides/nextjs/spa-fallback)
