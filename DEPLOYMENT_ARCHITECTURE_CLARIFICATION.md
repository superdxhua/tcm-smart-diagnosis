# 部署架构澄清：前端与后端的分工

## 🏗️ 项目架构

### 项目组成

这是一个**全栈项目**，包含两个部分：

```
tcm-smart-diagnosis/
├── src/           # 前端代码（Taro 框架）
│   ├── pages/     # 小程序页面
│   ├── network.ts # 网络请求封装
│   └── ...
└── server/        # 后端代码（NestJS 框架）
    ├── src/
    │   ├── main.ts
    │   ├── controllers/
    │   └── services/
    └── package.json
```

---

## 🚀 部署架构

### 前端部署：Vercel

**部署内容**：
- Taro 编译后的 H5 静态文件（HTML、CSS、JS）
- 小程序代码（编译后上传到微信小程序后台）

**部署方式**：
```bash
# 构建前端
npm run build:web

# 部署到 Vercel
git push origin main
# Vercel 自动检测并部署
```

**环境变量**：
- `PROJECT_DOMAIN`：前端需要这个变量来拼接 API 请求 URL
- 这个变量在 Vercel Dashboard 中设置，构建时注入到前端代码

**示例**：
```typescript
// src/network.ts
const createUrl = (url: string): string => {
    if (PROJECT_DOMAIN === '/') {
        return url  // 本地开发，使用 Vite 代理
    }
    return `${PROJECT_DOMAIN}${url}`  // 生产环境，拼接完整 URL
}

// 如果 PROJECT_DOMAIN = https://api.zhongyihskhealth.com
// createUrl('/api/health') = https://api.zhongyihskhealth.com/api/health
```

---

### 后端部署：Render

**部署内容**：
- NestJS 服务器（Node.js）
- API 接口（/api/*）
- 数据库连接（Supabase）

**部署方式**：
```bash
# 构建后端
cd server && npm run build

# 部署到 Render
git push origin main
# Render 自动检测并部署
```

**环境变量**：
- `COZE_SUPABASE_URL`
- `COZE_SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `PORT`（Render 自动提供）

**监听端口**：
- Render 提供 `PORT` 环境变量（通常是 10000）
- 后端监听 `0.0.0.0:${PORT}`

---

## 📊 数据流向

### 用户访问流程

```
用户访问 www.zhongyihskhealth.com
  ↓
Vercel 返回前端静态文件（HTML、CSS、JS）
  ↓
前端代码运行在浏览器中
  ↓
前端调用 API：Network.request({ url: '/api/health' })
  ↓
createUrl 函数拼接 URL
  ↓
如果 PROJECT_DOMAIN = https://api.zhongyihskhealth.com
  ↓
完整 URL = https://api.zhongyihskhealth.com/api/health
  ↓
浏览器发送 HTTP 请求到 Render
  ↓
Render 后端返回数据
  ↓
前端渲染页面
```

---

## 🔧 环境变量设置位置

### 前端环境变量（在 Vercel 中设置）

**位置**：Vercel Dashboard → Settings → Environment Variables

**变量**：
- `PROJECT_DOMAIN`：前端用于拼接 API URL
- `COZE_SUPABASE_URL`：前端连接数据库（可选）
- `COZE_SUPABASE_ANON_KEY`：前端连接数据库（可选）

**注入方式**：
```typescript
// config/index.ts
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify(
    process.env.PROJECT_DOMAIN ||
      process.env.COZE_PROJECT_DOMAIN_DEFAULT ||
      '',
  ),
}
```

**构建时**：
- Vercel 读取环境变量
- 注入到前端代码中
- 前端代码运行时使用这个变量

---

### 后端环境变量（在 Render 中设置）

**位置**：Render Dashboard → Environment Variables

**变量**：
- `COZE_SUPABASE_URL`：数据库连接
- `COZE_SUPABASE_ANON_KEY`：数据库密钥
- `JWT_SECRET`：JWT 签名密钥
- `PORT`：Render 自动提供
- `NODE_ENV`：环境标识

**使用方式**：
```typescript
// server/src/main.ts
const supabaseUrl = process.env.COZE_SUPABASE_URL
const port = process.env.PORT || 3000
```

---

## 🤔 为什么要在 Vercel（前端）设置 PROJECT_DOMAIN？

### 原因

1. **前端代码需要知道后端 API 的地址**
   - 前端代码运行在浏览器中
   - 需要拼接完整的 API URL
   - 不能使用相对路径（因为后端不在同一域名）

2. **PROJECT_DOMAIN 是前端构建时注入的**
   - 在 Vercel 构建前端时
   - 将环境变量注入到前端代码中
   - 前端代码运行时使用这个值

3. **后端不需要 PROJECT_DOMAIN**
   - 后端只负责提供 API
   - 不需要知道自己的地址
   - 只需要监听端口即可

### 示例对比

#### 本地开发

```typescript
// .env.local
PROJECT_DOMAIN=/

// config/index.ts
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('/')
}

// src/network.ts
createUrl('/api/health') = '/api/health'
// 浏览器请求：http://localhost:5000/api/health
// Vite 代理到：http://localhost:3000/api/health
```

#### 生产环境（当前问题）

```typescript
// Vercel Dashboard 环境变量
PROJECT_DOMAIN = （未设置）

// config/index.ts
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('')  // 空字符串
}

// src/network.ts
createUrl('/api/health') = '' + '/api/health' = '/api/health'
// 浏览器请求：https://www.zhongyihskhealth.com/api/health
// ❌ Vercel 上没有 /api/health 路由，返回 404
```

#### 生产环境（修复后）

```typescript
// Vercel Dashboard 环境变量
PROJECT_DOMAIN = https://api.zhongyihskhealth.com

// config/index.ts
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify('https://api.zhongyihskhealth.com')
}

// src/network.ts
createUrl('/api/health') = 'https://api.zhongyihskhealth.com' + '/api/health'
// 浏览器请求：https://api.zhongyihskhealth.com/api/health
// ✅ Render 后端正常响应
```

---

## ✅ 总结

### Vercel 的角色

- ✅ 部署前端静态文件（HTML、CSS、JS）
- ✅ 设置前端环境变量（PROJECT_DOMAIN）
- ✅ 将环境变量注入到前端代码中

### Render 的角色

- ✅ 部署后端 API 服务器（NestJS）
- ✅ 设置后端环境变量（数据库密钥、JWT 密钥等）
- ✅ 监听端口，响应 API 请求

### 为什么要在 Vercel（前端）设置 PROJECT_DOMAIN？

- ✅ 前端代码需要知道后端 API 的地址
- ✅ PROJECT_DOMAIN 是前端构建时注入的
- ✅ 前端代码运行在浏览器中，需要拼接完整的 API URL
- ✅ 后端不需要 PROJECT_DOMAIN，只提供 API 服务

---

## 🎯 正确的操作

### 在 Vercel Dashboard 中设置（前端）

1. 登录 Vercel Dashboard
2. 选择项目：`zhongyi-smart`
3. 进入 **Settings** → **Environment Variables**
4. 添加/更新：
   - **Key**: `PROJECT_DOMAIN`
   - **Value**: `https://api.zhongyihskhealth.com`
   - **Environment**: Production
5. 触发重新部署

### 在 Render Dashboard 中设置（后端）

后端已经在 Render 上正常运行，无需额外配置。

---

**更新时间**：2026-02-28
