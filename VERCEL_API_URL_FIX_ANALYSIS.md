# Vercel 部署 API 请求 URL 配置问题分析报告

## 🎯 问题分析

经过深入排查，发现 **前端 API 请求 URL 配置** 存在以下问题：

### 问题 1：环境变量加载错误

**现状**：
- `.env.local` 文件被 `.gitignore` 忽略
- `.env.production` 文件中 `PROJECT_DOMAIN=/`
- `config/index.ts` 优先加载 `.env.local`，不存在时使用 `process.env.PROJECT_DOMAIN`

**问题**：
- Vercel 构建时没有 `.env.local` 文件
- `config/index.ts` 中加载 `.env.local` 失败，但不抛出错误
- `PROJECT_DOMAIN` 最终被设置为空字符串 `''`

**代码位置**：`config/index.ts`

```typescript
// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });  // ← 问题：硬编码 .env.local

// ...
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify(
    process.env.PROJECT_DOMAIN ||
      process.env.COZE_PROJECT_DOMAIN_DEFAULT ||
      '',  // ← 最终设置为空字符串
  ),
  // ...
}
```

---

### 问题 2：vercel.json 路由配置错误

**现状**：
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api"  // ← 错误：不完整的路由
    },
    // ...
  ]
}
```

**问题**：
- `"dest": "/api"` 指向一个目录，而不是函数文件
- 导致 `/api/*` 请求无法正确路由到 `api/index.ts` 函数

**正确写法**：
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"  // ← 正确：指向函数文件
    },
    // ...
  ]
}
```

---

### 问题 3：vercel.json CORS headers 配置冲突

**现状**：
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"  // ← 问题：仍然设置了 credentials
        }
      ]
    }
  ]
}
```

**问题**：
- 与之前修复的 CORS 配置冲突
- 覆盖了代码中的 CORS 配置
- `Access-Control-Allow-Credentials: true` + 前端无法设置 credentials → CORS 失败

---

### 问题 4：后端函数执行超时

**现状**：
```json
{
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30  // ← 最大执行时间 30 秒
    },
    "api/health.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 10  // ← 最大执行时间 10 秒
    }
  }
}
```

**可能问题**：
- 冷启动 + 复杂逻辑可能超过 30 秒
- 超时后返回 502/504
- 浏览器报 "Failed to fetch"

---

## 🔍 问题验证

### 验证 1：检查环境变量加载

在 Vercel Dashboard 中查看构建日志：
```
加载 .env 文件路径: /workspace/projects/.env
```

**预期**：
- 加载根目录的 `.env` 文件
- 但 `.env` 中 `PROJECT_DOMAIN=/` 是错误的

**实际**：
- 应该在生产环境中加载 `.env.production` 或 Vercel 环境变量

---

### 验证 2：检查前端请求 URL

**方法**：
1. 打开浏览器开发者工具
2. 切换到 Network 面板
3. 执行登录操作
4. 查看登录请求的 Request URL

**预期**：
- 如果 `PROJECT_DOMAIN` 为 `''`
- 请求 URL 为 `https://tcmsmarthealth.com/api/login`（前端域名）
- 但实际应该路由到 `api/index.ts` 函数

---

### 验证 3：检查 Vercel 函数执行时间

**方法**：
1. 访问 Vercel Dashboard
2. 切换到 Functions 标签
3. 查看 `api/index.ts` 函数的 Execution Duration

**预期**：
- 如果超过 30 秒，会导致超时
- 返回 502/504 错误

---

## ✅ 修复方案

### 修复 1：修改环境变量加载逻辑

**文件**：`config/index.ts`

**修改前**：
```typescript
// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
```

**修改后**：
```typescript
// 根据环境加载不同的环境变量文件
const envFile = process.env.NODE_ENV === 'production'
  ? path.resolve(__dirname, '../.env.production')
  : path.resolve(__dirname, '../.env.local');

dotenv.config({ path: envFile });
```

---

### 修复 2：修改 vercel.json 路由配置

**文件**：`vercel.json`

**修改前**：
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api"
    },
    // ...
  ]
}
```

**修改后**：
```json
{
  "routes": [
    {
      "src": "/api/health",
      "dest": "/api/health.ts"
    },
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "src": "/(.*\\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2|ttf|eot|json|xml|txt))",
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
}
```

---

### 修复 3：移除 vercel.json CORS headers 配置

**文件**：`vercel.json`

**修改前**：
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        }
      ]
    }
  ]
}
```

**修改后**：
```json
{
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
    }
    // ← 移除 CORS headers，由代码中的 CORS 配置处理
  ]
}
```

---

### 修复 4：增加后端函数执行超时时间

**文件**：`vercel.json`

**修改前**：
```json
{
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30
    }
  }
}
```

**修改后**：
```json
{
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 60  // ← 增加到 60 秒
    },
    "api/health.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 10
    }
  }
}
```

---

## 📋 修改文件清单

### 修改的文件

1. ✅ `config/index.ts`
   - 修改环境变量加载逻辑
   - 根据环境加载不同的环境变量文件

2. ✅ `vercel.json`
   - 修复路由配置
   - 移除 CORS headers
   - 增加函数执行超时时间

### 新建的文件

3. ✅ `VERCEL_API_URL_FIX_ANALYSIS.md` - 本文档

---

## 🧪 测试步骤

### 1. 本地测试

```bash
# 1. 安装依赖
npm install

# 2. 构建生产版本
npm run build:web

# 3. 检查构建输出
ls -la dist-web/

# 4. 启动本地服务器
cd dist-web && python3 -m http.server 8000

# 5. 浏览器访问
open http://localhost:8000

# 6. 测试登录功能
# - 打开开发者工具
# - 查看请求 URL 是否正确
```

---

### 2. Vercel 测试

```bash
# 1. 提交代码
git add .
git commit -m "fix: 修复 Vercel 部署 API 请求 URL 配置问题"
git push

# 2. 等待 Vercel 部署完成

# 3. 浏览器访问
open https://tcmsmarthealth.com

# 4. 测试登录功能
# - 打开开发者工具
# - 查看 Network 面板
# - 确认请求 URL 和响应状态
```

---

### 3. 函数执行时间检查

```bash
# 1. 访问 Vercel Dashboard
# https://vercel.com/dashboard

# 2. 选择项目
# https://vercel.com/dashboard/projects

# 3. 切换到 Functions 标签

# 4. 查看 api/index.ts 函数的 Execution Duration

# 5. 如果超过 60 秒，需要优化函数逻辑
```

---

## 📊 预期效果

### 修复前

```
PROJECT_DOMAIN: '' (空字符串)
Request URL: https://tcmsmarthealth.com/api/login (前端域名)
Result: 404 或 Failed to fetch
```

### 修复后

```
PROJECT_DOMAIN: '/' (相对路径)
Request URL: https://tcmsmarthealth.com/api/login (正确路由到函数)
Result: 200 OK (登录成功)
```

---

## 🎯 关键要点

1. **环境变量加载要分环境**
   - 开发环境：`.env.local`
   - 生产环境：`.env.production`

2. **vercel.json 路由要正确**
   - API 路由必须指向函数文件
   - 不能只指向目录

3. **CORS 配置要统一**
   - 不要在 vercel.json 和代码中同时配置
   - 避免配置冲突

4. **函数执行时间要合理**
   - 根据实际需要设置超时时间
   - 优化函数启动速度

---

## 📚 参考资源

- [Vercel: Routes](https://vercel.com/docs/configuration#project/routes)
- [Vercel: Headers](https://vercel.com/docs/configuration#project/headers)
- [Vercel: Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Vercel: Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

**分析完成时间**：2026-02-24 09:30
**分析状态**：✅ 完成
**待修复**：是
