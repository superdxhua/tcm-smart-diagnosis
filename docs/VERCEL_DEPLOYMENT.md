# Vercel 部署指南

## 快速开始

### 前提条件

1. ✅ 已获得 Vercel 账户
2. ✅ 已完成 Vercel 注册审核
3. ✅ 拥有 GitHub 账户（推荐）

### 步骤 1：推送代码到 GitHub

```bash
# 如果还没有 Git 仓库
cd /workspace/projects
git init
git add .
git commit -m "Initial commit for Vercel deployment"

# 创建 GitHub 仓库后，添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/tcm-smart-diagnosis.git
git branch -M main
git push -u origin main
```

### 步骤 2：在 Vercel 中创建项目

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New..."** → **"Project"**
3. 选择 **"Continue with GitHub"**（需要授权）
4. 选择 `tcm-smart-diagnosis` 仓库
5. 点击 **"Import"**

### 步骤 3：配置项目设置

#### 构建配置

```
Framework Preset: Other
Build Command: pnpm install && pnpm build:web
Output Directory: dist-web
Install Command: pnpm install
```

#### 环境变量配置

在 **Settings** → **Environment Variables** 中添加：

| 名称 | 值 | 环境 |
|------|-----|------|
| `PROJECT_DOMAIN` | `https://your-backend-domain.com` | Production, Preview, Development |
| `TARO_APP_WEAPP_APPID` | `your_wechat_appid`（可选） | All |

#### 区域配置（可选）

在 **Settings** → **Functions** → **Regions** 中选择：
- **Production**: `sin1`（新加坡）或 `hkg1`（香港）
- **Preview**: `sin1`（新加坡）

### 步骤 4：部署

点击 **"Deploy"** 按钮，Vercel 会自动：

1. 克隆代码
2. 安装依赖（`pnpm install`）
3. 构建项目（`pnpm build:web`）
4. 部署到 CDN
5. 分配域名

### 步骤 5：配置域名（可选）

#### 使用 Vercel 默认域名

部署完成后，您将获得：
- **Production**: `https://tcm-smart-diagnosis.vercel.app`
- **Preview**: `https://tcm-smart-diagnosis-git-branch-name.vercel.app`

#### 使用自定义域名

1. 在 **Settings** → **Domains** 中添加自定义域名
2. 配置 DNS 记录：
   ```
   Type: CNAME
   Name: @ 或 www
   Value: cname.vercel-dns.com
   ```
3. 等待 DNS 生效（通常 5-10 分钟）

## 后端部署选项

### 选项 1：部署到 Vercel Serverless Functions

#### 1. 创建 Serverless Functions 目录结构

```
/api/
  auth/
  medical-ai/
  patients/
  ...
```

#### 2. 修改后端代码

将 NestJS 控制器改为 Vercel Serverless Functions 格式：

```typescript
// api/auth/login.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 调用原有的业务逻辑
  const result = await handleLogin(req.body);

  return res.status(200).json(result);
}
```

#### 3. 修改前端 API 调用

在 `config/index.ts` 中：

```typescript
h5: {
  publicPath: '/',
  devServer: {
    port: 5000,
    proxy: {
      '/api': {
        target: process.env.PROJECT_DOMAIN || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
}
```

### 选项 2：部署到其他平台

#### Render.com（推荐）

1. 注册 [Render](https://render.com)
2. 创建 **Web Service**
3. 连接 GitHub 仓库
4. 配置：
   ```
   Build Command: cd server && npm install && npm run build
   Start Command: cd server && npm run start:prod
   Environment: Node
   Region: Singapore
   ```
5. 获取后端域名（如：`https://tcm-smart-diagnosis-api.onrender.com`）
6. 在 Vercel 环境变量中设置 `PROJECT_DOMAIN`

#### Railway.app

1. 注册 [Railway](https://railway.app)
2. 创建 **New Project** → **Deploy from GitHub repo**
3. 选择仓库
4. 配置环境变量
5. 获取后端域名

#### Supabase Edge Functions

如果您使用 Supabase，可以直接使用 Edge Functions：

```typescript
// supabase/functions/auth/login/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // 处理登录逻辑
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

## 常见问题

### Q1: 构建失败怎么办？

**原因**：可能是依赖安装或构建配置问题

**解决方案**：
1. 检查 Vercel 构建日志
2. 确认 `package.json` 中的脚本正确
3. 尝试在本地运行 `pnpm build:web` 验证

### Q2: API 请求失败

**原因**：`PROJECT_DOMAIN` 环境变量未配置或后端未部署

**解决方案**：
1. 确认后端已部署并可访问
2. 在 Vercel 环境变量中配置正确的 `PROJECT_DOMAIN`
3. 检查浏览器控制台的网络请求

### Q3: 页面空白或 404

**原因**：路由配置问题

**解决方案**：
1. 确认 `vercel.json` 中的 `rewrites` 配置正确
2. 检查 `dist-web` 目录是否包含 `index.html`
3. 清除浏览器缓存重新访问

### Q4: 如何配置 HTTPS？

**解决方案**：Vercel 默认自动配置 HTTPS，无需额外配置

### Q5: 如何查看构建日志？

1. 访问 Vercel Dashboard
2. 选择项目
3. 点击 **Deployments**
4. 选择具体的部署记录
5. 查看 **Build Logs** 或 **Function Logs**

## 性能优化

### 启用 Vercel 缓存

在 `vercel.json` 中添加：

```json
{
  "caching": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 压缩静态资源

Vercel 默认启用 gzip 和 brotli 压缩，无需额外配置。

### CDN 配置

Vercel 自动使用全球 CDN，无需额外配置。

## 监控和分析

### Vercel Analytics

1. 在项目设置中启用 **Analytics**
2. 查看访问量、性能指标、错误率

### 自定义监控

集成第三方监控工具：

```typescript
// src/app.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.NODE_ENV,
});
```

## 成本估算

### Vercel 免费套餐

- ✅ 100GB 带宽/月
- ✅ 100次构建/月
- ✅ 6小时构建时间/月
- ✅ 无限预览部署
- ✅ 全球 CDN
- ✅ 自动 HTTPS

### Pro 套餐（$20/月）

- 1TB 带宽/月
- 无限构建
- 优先支持
- 更多功能

### 推荐方案

**小型项目**：免费套餐
**中型项目**：Pro 套餐
**大型项目**：Enterprise 方案

## 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已创建
- [ ] 构建配置正确
- [ ] 环境变量已配置
- [ ] 后端 API 已部署
- [ ] PROJECT_DOMAIN 已设置
- [ ] 自定义域名已配置（可选）
- [ ] HTTPS 已启用（自动）
- - [ ] 构建成功
- [ ] 部署成功
- [ ] 页面可正常访问
- [ ] API 请求正常
- [ ] 性能监控已启用（可选）

## 下一步

1. ✅ 部署前端到 Vercel
2. ✅ 部署后端到 Render/Railway
3. ✅ 配置环境变量
4. ✅ 测试完整功能
5. ✅ 配置自定义域名
6. ✅ 启用监控和分析
7. ✅ 优化性能

## 需要帮助？

- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel 社区论坛](https://vercel.com/forum)
- [GitHub Issues](https://github.com/vercel/vercel/issues)

## 联系方式

如有问题，请通过以下方式联系：
- 创建 GitHub Issue
- 在 Vercel 社区论坛提问
- 查看 Vercel 官方文档
