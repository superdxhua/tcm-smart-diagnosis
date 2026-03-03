# 后端 Vercel 部署指南

本文档提供将 NestJS 后端部署到 Vercel Serverless Functions 的完整指南。

## 📋 目录

- [准备工作](#准备工作)
- [部署步骤](#部署步骤)
- [环境变量配置](#环境变量配置)
- [验证部署](#验证部署)
- [常见问题](#常见问题)
- [性能优化](#性能优化)

---

## 准备工作

### 1. 确认前端已部署

确保前端 H5 应用已经部署在 Vercel 上，并获得以下信息：
- 前端域名：`https://your-frontend.vercel.app`

### 2. 准备 Git 仓库

确保你的代码已经推送到 GitHub 仓库，后端代码在 `server` 目录中。

---

## 部署步骤

### 方案 A：使用独立的 Vercel 项目（推荐）

#### 步骤 1：创建新的 Vercel 项目

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 点击 "Add New" → "Project"
3. 导入你的 GitHub 仓库

#### 步骤 2：配置项目设置

在 "Configure Project" 页面：

**Root Directory**：
- **Root Directory**: `server`（重要！）

**Framework Preset**：
- **Framework Preset**: `Other`

**Build & Output Settings**：
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install --legacy-peer-deps`

#### 步骤 3：配置环境变量

参考下方的 [环境变量配置](#环境变量配置)

#### 步骤 4：部署项目

点击 "Deploy" 按钮，等待部署完成。

### 方案 B：使用子域名（高级）

如果你希望后端使用子域名（如 `api.yourdomain.com`），可以：

1. 在 Vercel Dashboard 中配置自定义域名
2. 设置 CNAME 记录指向 Vercel
3. 更新前端的 `PROJECT_DOMAIN` 环境变量

---

## 环境变量配置

在 Vercel Dashboard 的 **Settings → Environment Variables** 中配置以下变量：

### 必需变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `COZE_SUPABASE_URL` | Supabase 项目 URL | `https://your-project.supabase.co` |
| `COZE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIs...` |
| `COZE_WORKLOAD_IDENTITY_API_KEY` | Coze API 密钥 | `cztei_xxxxx` |
| `COZE_INTEGRATION_BASE_URL` | Coze 集成基础 URL | `https://integration.coze.cn` |
| `COZE_INTEGRATION_MODEL_BASE_URL` | Coze 模型基础 URL | `https://integration.coze.cn/api/v3` |
| `JWT_SECRET` | JWT 密钥（生成随机字符串） | `your_random_secret_here` |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |
| `MERCHANT_QR_CODE` | 商户收款码 URL | `https://your-domain.com/qrcode.jpg` |
| `MERCHANT_NAME` | 商户名称 | `中医智能健康` |

### 可选变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `STORAGE_ACCESS_KEY_ID` | S3 访问密钥 ID | `your_access_key_id` |
| `STORAGE_SECRET_ACCESS_KEY` | S3 访问密钥 | `your_secret_access_key` |
| `STORAGE_BUCKET` | S3 存储桶名称 | `your_bucket_name` |
| `STORAGE_REGION` | S3 区域 | `us-east-1` |
| `STORAGE_ENDPOINT` | S3 端点 | `https://s3.amazonaws.com` |
| `LOG_LEVEL` | 日志级别 | `info` |

### 微信支付配置（如果使用）

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `WECHAT_PAY_APP_ID` | 微信应用 ID | `wx1234567890abcdef` |
| `WECHAT_PAY_MCH_ID` | 微信商户 ID | `1234567890` |
| `WECHAT_PAY_API_KEY` | 微信 API 密钥 | `32_character_api_key` |
| `WECHAT_PAY_NOTIFY_URL` | 微信支付回调 URL | `https://your-backend.vercel.app/api/payment/callback/wechat` |
| `WECHAT_PAY_API_URL` | 微信支付 API URL | `https://api.mch.weixin.qq.com` |

---

## 更新前端配置

部署后端后，需要更新前端配置以使用新的后端地址。

### 方案 A：使用相对路径（推荐，同域部署）

如果前端和后端在同一个 Vercel 项目中，前端可以使用相对路径：

1. 在前端 Vercel 项目的环境变量中设置：
   - `PROJECT_DOMAIN` = `/`

2. 前端会自动使用 `/api/*` 路径调用后端 API

### 方案 B：使用完整域名

如果后端部署在独立的 Vercel 项目中：

1. 在前端 Vercel 项目的环境变量中设置：
   - `PROJECT_DOMAIN` = `https://your-backend.vercel.app`

2. 前端会使用 `https://your-backend.vercel.app/api/*` 路径调用后端 API

---

## 验证部署

### 1. 检查部署状态

在 Vercel Dashboard 中查看部署日志，确保没有错误。

### 2. 测试 API 接口

使用 curl 或 Postman 测试以下接口：

```bash
# 健康检查
curl https://your-backend.vercel.app/api/health

# 版本检查
curl https://your-backend.vercel.app/api/version/check

# 示例：获取套餐列表
curl https://your-backend.vercel.app/api/packages/active
```

### 3. 测试前端集成

在前端应用中测试：

- ✅ 用户登录/注册
- ✅ AI 智能问询
- ✅ 处方生成
- ✅ 患者管理
- ✅ 病历记录

---

## 常见问题

### Q1: 部署失败，提示 "Build failed"

**解决方案**：

1. 检查 Root Directory 是否设置为 `server`
2. 检查 Build Command 是否为 `npm run build`
3. 检查 Install Command 是否为 `npm install --legacy-peer-deps`
4. 查看部署日志，查找具体错误信息

### Q2: API 调用失败，提示 404 Not Found

**解决方案**：

1. 检查 `server/vercel.json` 中的重写规则是否正确
2. 确保 `server/api/[[...path]].ts` 文件存在
3. 检查 API 路径是否正确（应该以 `/api/` 开头）

### Q3: CORS 错误

**解决方案**：

1. 检查 `server/vercel.json` 中的 CORS headers 配置
2. 确保前端的 `PROJECT_DOMAIN` 配置正确
3. 如果使用跨域，检查后端的 `app.enableCors()` 配置

### Q4: Serverless Function 超时

**解决方案**：

1. 检查 `server/vercel.json` 中的 `maxDuration` 设置（免费版最大 10 秒）
2. 优化 AI 调用逻辑，减少响应时间
3. 如果确实需要更长的时间，考虑升级到 Pro 计划

### Q5: 环境变量未生效

**解决方案**：

1. 确保在 Vercel Dashboard 中正确配置了环境变量
2. 部署后需要重新构建才能应用新的环境变量
3. 检查变量名是否正确（大小写敏感）

### Q6: 数据库连接失败

**解决方案**：

1. 确保 `COZE_SUPABASE_URL` 和 `COZE_SUPABASE_ANON_KEY` 配置正确
2. 检查 Supabase 项目是否正常运行
3. 查看部署日志中的详细错误信息

---

## 性能优化

### 1. 减少冷启动时间

- 使用 Vercel Pro 计划（$20/月）获得更快的冷启动
- 启用 Edge Functions（适合无状态计算）

### 2. 优化 API 响应时间

- 减少 AI 调用的复杂度
- 使用缓存策略
- 优化数据库查询

### 3. 监控和分析

- 在 Vercel Dashboard 中查看 Analytics
- 使用 Vercel Logs 查看详细日志
- 配置错误监控（如 Sentry）

---

## 架构说明

### Vercel Serverless Functions 架构

```
前端（已部署）
  ↓
Vercel Frontend (H5)
  ↓
相对路径调用 /api/*
  ↓
Vercel Serverless Functions (NestJS)
  ↓
Supabase 数据库
  ↓
Coze AI 服务
```

### 请求流程

1. 用户在前端应用中发起请求
2. 前端调用 `/api/xxx` 路径
3. Vercel 将请求路由到 Serverless Function
4. NestJS 处理请求并返回响应
5. 前端接收响应并更新 UI

---

## 成本估算

### Vercel 免费计划（推荐初期）

- **每月调用次数**: 10,000 次
- **执行时间**: 100 小时/月
- **内存**: 1024 MB
- **单次执行时间**: 10 秒
- **成本**: $0/月

### 适用用户量

- **月活用户**: 250-500 人
- **日活用户**: 10-25 人
- **并发峰值**: 1-5 人

### Vercel Pro 计划

- **每月调用次数**: 100,000 次
- **执行时间**: 1,000 小时/月
- **内存**: 1024 MB
- **单次执行时间**: 10 秒
- **成本**: $20/月

### 适用用户量

- **月活用户**: 2,500-5,000 人
- **日活用户**: 100-200 人
- **并发峰值**: 5-15 人

---

## 监控与日志

### 1. 查看 Serverless Logs

在 Vercel Dashboard 中：

1. 进入你的项目
2. 点击 "Logs" 标签
3. 选择 "Serverless Function" 日志
4. 查看实时日志和错误信息

### 2. 监控 API 性能

在 Vercel Dashboard 中：

1. 点击 "Analytics" 标签
2. 查看 API 响应时间
3. 查看错误率
4. 查看调用量趋势

### 3. 配置告警

1. 进入项目设置
2. 配置错误告警
3. 配置性能告警
4. 配置调用量告警

---

## 回滚策略

如果部署出现问题，可以快速回滚：

1. 进入 Vercel Dashboard
2. 进入项目 → Deployments
3. 找到之前的成功部署版本
4. 点击 "..." → "Promote to Production"

---

## 联系与支持

如果遇到问题，请：

1. 查看 [Vercel Serverless Functions 文档](https://vercel.com/docs/concepts/functions/serverless-functions)
2. 查看 [NestJS 文档](https://docs.nestjs.com/)
3. 查看 [Vercel 部署文档](./DEPLOYMENT.md)

---

## 更新日志

- **2026-02-21**: 初始版本，支持后端部署到 Vercel Serverless Functions
