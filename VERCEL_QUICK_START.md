# Vercel 快速部署指南

## 🚀 5分钟快速部署

### 前提条件

✅ 已获得 Vercel 账户  
✅ 已有 GitHub 账户

### 步骤 1：推送到 GitHub

```bash
# 在项目根目录执行
git add .
git commit -m "准备部署到 Vercel"
git push origin main
```

### 步骤 2：在 Vercel 创建项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 **"Add New..."** → **"Project"**
3. 选择 GitHub 仓库
4. 点击 **"Import"**

### 步骤 3：配置环境变量

在项目设置中添加：

**必需**：
```
PROJECT_DOMAIN=https://your-backend-domain.com
```

**可选**：
```
TARO_APP_WEAPP_APPID=your_appid
```

### 步骤 4：部署

点击 **"Deploy"**，等待 2-3 分钟。

### 步骤 5：访问

部署完成后，您将获得：
```
https://tcm-smart-diagnosis.vercel.app
```

## 📦 配置详情

项目已预配置 `vercel.json`：

```json
{
  "buildCommand": "pnpm install && pnpm build:web",
  "outputDirectory": "dist-web",
  "regions": ["sin1"]
}
```

## 🔧 后端部署

推荐使用 **Render.com** 或 **Railway.app**：

### Render.com（推荐）

1. 注册 [render.com](https://render.com)
2. 创建 **Web Service**
3. 连接 GitHub 仓库
4. 配置：
   - **Build**: `cd server && npm install && npm run build`
   - **Start**: `cd server && npm run start:prod`
5. 获取域名，设置到 Vercel 的 `PROJECT_DOMAIN`

### Railway.app

1. 注册 [railway.app](https://railway.app)
2. 创建新项目 → 从 GitHub 部署
3. 自动配置环境变量
4. 获取后端域名

## 🎯 后端部署选项对比

| 平台 | 免费套餐 | 推荐指数 | 配置难度 |
|------|---------|---------|---------|
| Render.com | ✅ 750小时/月 | ⭐⭐⭐⭐⭐ | 简单 |
| Railway.app | ✅ $5 试用额度 | ⭐⭐⭐⭐ | 简单 |
| Vercel Functions | ✅ 100GB | ⭐⭐⭐ | 中等 |
| Supabase Edge | ✅ 500k 请求/月 | ⭐⭐⭐⭐ | 中等 |

## ⚡ 快速测试

部署完成后，访问以下 URL 测试：

1. **前端页面**：
   ```
   https://your-domain.vercel.app
   ```

2. **API 测试**：
   ```bash
   curl https://your-backend-domain.com/api/health
   ```

## 🐛 常见问题

### 1. 构建失败

检查 `package.json` 中的脚本：
```json
{
  "scripts": {
    "build:web": "taro build --type h5"
  }
}
```

### 2. API 404

确认 `PROJECT_DOMAIN` 环境变量已正确设置。

### 3. 页面空白

检查 `vercel.json` 中的路由配置。

## 📊 性能优化

Vercel 自动优化：
- ✅ 全球 CDN
- ✅ 自动压缩
- ✅ HTTP/2
- ✅ 图片优化

## 💰 成本估算

**Vercel 免费套餐**：
- 100GB 带宽/月
- 100 次构建/月
- 完全满足小型项目

**后端（Render 免费套餐）**：
- 750 小时/月
- 足够日常使用

## 📝 完整文档

详细部署指南请查看：
[docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md)

## 🎉 完成！

恭喜！您的中医智能诊疗小程序已成功部署到 Vercel！

**下一步**：
- 配置自定义域名
- 启用监控和分析
- 优化性能
- 推广应用
