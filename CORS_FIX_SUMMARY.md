# CORS 问题修复摘要

## 🚨 问题描述

前端提示"响应数据为空，请检查网络连接"，可能的原因：
1. ❌ CORS 配置错误
2. ❌ 后端服务休眠
3. ❌ 环境变量配置错误
4. ❌ 网络请求超时

## ✅ 已修复的内容

### 修复 1：后端 CORS 配置（server/src/main.ts）

**修改前**：
```typescript
app.enableCors({
  origin: true,  // ❌ 使用了通配符
  credentials: false,
});
```

**修改后**：
```typescript
// ✅ 明确配置 CORS，解决跨域问题
const allowedOrigins = [
  'https://www.zhongyihskhealth.com',  // 生产环境前端域名
  'https://zhongyihskhealth.com',       // 生产环境主域名
  'http://localhost:5000',             // 本地开发前端
  'http://localhost:3000',             // 本地开发后端
  'https://zhongyi-smart.vercel.app',  // Vercel 预览域名
];

app.enableCors({
  origin: (origin, callback) => {
    // 允许无 origin 的请求（如移动端应用、Postman）
    if (!origin) {
      return callback(null, true);
    }

    // 检查是否在允许的域名列表中
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS 阻止了来自 ${origin} 的请求`);
      callback(new Error(`CORS 阻止了来自 ${origin} 的请求`));
    }
  },
  credentials: false,  // 使用 Bearer Token 认证，不需要 Cookie 凭据
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,  // 预检请求缓存 24 小时
});
```

**关键改进**：
- ✅ 明确指定允许的域名列表
- ✅ 允许无 origin 的请求（移动端、Postman）
- ✅ 配置允许的 HTTP 方法
- ✅ 配置允许的请求头
- ✅ 设置预检请求缓存（24小时）

### 修复 2：Vercel Rewrites 配置（vercel.json）

**修改前**：
```json
{
  "version": 2,
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "pnpm install",
  "framework": null,
  "env": {
    "NODE_ENV": "production"
  }
}
```

**修改后**：
```json
{
  "version": 2,
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "pnpm install",
  "framework": null,
  "env": {
    "NODE_ENV": "production"
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.zhongyihskhealth.com/api/:path*"
    }
  ]
}
```

**关键改进**：
- ✅ 配置 `/api/:path*` 代理规则
- ✅ 前端请求同源地址（`/api/...`）
- ✅ Vercel 自动转发到后端（`https://api.zhongyihskhealth.com/api/...`）
- ✅ 彻底解决跨域问题
- ✅ 隐藏后端真实地址

### 修复 3：环境变量配置确认

**已确认**：
- ✅ `.env.production` 已正确配置：`PROJECT_DOMAIN=https://api.zhongyihskhealth.com`
- ✅ 使用 `https://` 而不是 `http://`

**需要在 Vercel Dashboard 设置**：
```
Key: PROJECT_DOMAIN
Value: https://api.zhongyihskhealth.com
Environment: Production
```

## 📋 需要你执行的操作

### 步骤 1：推送代码到 GitHub

```bash
git add server/src/main.ts vercel.json
git commit -m "fix: 修复 CORS 配置，添加 Vercel Rewrites 代理"
git push origin main
```

### 步骤 2：在 Vercel Dashboard 设置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到项目 `zhongyi-smart`
3. 进入 `Settings` → `Environment Variables`
4. 添加环境变量：
   - **Key**: `PROJECT_DOMAIN`
   - **Value**: `https://api.zhongyihskhealth.com`
   - **Environment**: Production
5. 点击 `Save`

### 步骤 3：触发 Vercel 重新部署

1. 在 Vercel Dashboard 中，进入 `Deployments` 标签
2. 找到最新的部署记录
3. 点击 `Redeploy` 按钮（三点菜单 → Redeploy）
4. 等待部署完成（约 1-3 分钟）

### 步骤 4：检查部署日志

1. 在 Vercel Dashboard 中，点击最新的部署记录
2. 查看完整的构建日志
3. 确认以下内容：
   - ✅ `pnpm install` 成功
   - ✅ `taro build --type h5` 成功
   - ✅ 部署状态显示 "Ready"
   - ✅ 没有 CORS 相关错误

### 步骤 5：验证网站

1. 打开浏览器，访问 `https://www.zhongyihskhealth.com`
2. 按 `F12` 打开开发者工具
3. 切换到 `Network` 标签
4. 刷新页面
5. 检查 API 请求

**成功标志**：
- ✅ 状态码为 200
- ✅ 响应数据不为空
- ✅ 没有 CORS 错误
- ✅ 没有 "响应数据为空" 提示

### 步骤 6：检查 Render 日志

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 找到项目 `zhongyi-smart-api`
3. 进入 `Logs` 标签
4. 刷新前端页面
5. 查看 Render 是否收到请求

**预期结果**：
- ✅ 如果前端正常访问，Render 日志应该显示请求记录
- ❌ 如果日志为空，说明请求根本没发出去（前端问题）

## 🎯 工作原理

### 修复后的请求流程

```
浏览器
  ↓ 请求: https://www.zhongyihskhealth.com/api/health
Vercel (同源，无 CORS 问题)
  ↓ 代理: https://api.zhongyihskhealth.com/api/health
Render 后端
  ↓ 响应: { status: 'ok', ... }
Vercel (转发响应)
  ↓ 响应: { status: 'ok', ... }
浏览器 (成功接收)
```

### 为什么能解决 CORS 问题？

1. **浏览器视角**：
   - 请求的是 `https://www.zhongyihskhealth.com/api/health`
   - 这是同源请求（前端也在 `www.zhongyihskhealth.com`）
   - 不会触发 CORS 预检（OPTIONS 请求）

2. **Vercel 视角**：
   - 收到 `/api/:path*` 的请求
   - 根据 `vercel.json` 的 `rewrites` 配置
   - 自动转发到 `https://api.zhongyihskhealth.com/api/:path*`
   - 返回后端的响应

3. **后端视角**：
   - 收到来自 Vercel 的请求
   - 检查 CORS 配置（允许 `www.zhongyihskhealth.com`）
   - 返回响应

## 📊 预期结果

### 成功的浏览器控制台

**Console 标签**：
```
✅ 请求成功: /api/health
✅ 数据加载完成
```

**Network 标签**：
```
Request URL: https://www.zhongyihskhealth.com/api/health
Status Code: 200 OK
Response: { status: 'ok', timestamp: '...' }
```

### 成功的 Render 日志

```
[2025-01-10 22:30:00] GET /api/health - 200 - 45ms
[2025-01-10 22:30:05] GET /api/disease-categories - 200 - 120ms
```

## 🔍 如果仍然失败

### 故障排查步骤

1. **检查浏览器控制台错误**
   - 按 `F12` → `Console` 标签
   - 查找 CORS 相关错误
   - 查找网络错误

2. **检查 Network 标签**
   - 按 `F12` → `Network` 标签
   - 找到失败的请求
   - 查看 Status Code
   - 查看 Response

3. **检查 Render 日志**
   - 登录 Render Dashboard
   - 查看 `Logs` 标签
   - 查找错误信息

4. **检查 Vercel 部署日志**
   - 登录 Vercel Dashboard
   - 查看最新部署记录
   - 查找构建错误

### 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `CORS error` | CORS 配置错误 | ✅ 已修复，等待重新部署 |
| `502 Bad Gateway` | 后端服务崩溃 | 检查 Render 日志，重启服务 |
| `504 Gateway Timeout` | 后端响应超时 | 检查 Render 服务是否休眠，等待唤醒 |
| `Failed to fetch` | 网络错误 | 检查网络连接 |
| `Mixed Content` | HTTP/HTTPS 混用 | 确保后端使用 HTTPS |

## 📞 需要帮助？

如果仍然有问题，请提供以下信息：

1. **浏览器控制台错误截图**
   - Console 标签的错误信息
   - Network 标签的失败请求详情

2. **Render 日志**
   - 刷新前端页面时的 Render 日志

3. **Vercel 部署日志**
   - 最新部署记录的完整日志

---

**修复完成时间**: 2025-01-10
**修复文件**:
- ✅ `server/src/main.ts` - 后端 CORS 配置
- ✅ `vercel.json` - Vercel Rewrites 配置
- ✅ `CORS_TROUBLESHOOTING_CHECKLIST.md` - 详细排查指南

**下一步**: 推送代码，设置环境变量，重新部署
