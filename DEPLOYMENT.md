# Vercel 部署指南

本文档提供将前后端都部署到 Vercel 的完整指南。

## 📋 目录

- [准备工作](#准备工作)
- [部署步骤](#部署步骤)
- [环境变量配置](#环境变量配置)
- [验证部署](#验证部署)
- [常见问题](#常见问题)
- [迁移回国内平台](#迁移回国内平台)

---

## 准备工作

### 1. 创建 Vercel 账号

1. 访问 [Vercel 官网](https://vercel.com)
2. 使用 GitHub 账号登录
3. 创建新项目

### 2. 准备 Git 仓库

确保你的代码已经推送到 GitHub 仓库：

```bash
git add .
git commit -m "feat: 添加 Vercel Serverless 支持"
git push
```

---

## 部署步骤

### 步骤 1：导入项目到 Vercel

1. 登录 Vercel Dashboard
2. 点击 "Add New" → "Project"
3. 导入你的 GitHub 仓库

### 步骤 2：配置项目设置

在 "Configure Project" 页面：

#### Framework Preset
- **Framework Preset**: `Other`
- **Root Directory**: `/`（留空）

#### Build & Output Settings
- **Build Command**: `npm run build:web && npm run build:server`
- **Output Directory**: `dist-web`
- **Install Command**: `npm install --legacy-peer-deps`

#### Environment Variables
参考下方的 [环境变量配置](#环境变量配置)

### 步骤 3：部署项目

点击 "Deploy" 按钮，等待部署完成。

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
| `PROJECT_DOMAIN` | 前端域名（Vercel 环境下设为 `/`） | `/` |
| `VITE_SUPABASE_URL` | 前端 Supabase URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | 前端 Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIs...` |

### 可选变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `MERCHANT_QR_CODE` | 商户收款码 URL | `https://your-domain.com/qrcode.jpg` |
| `MERCHANT_NAME` | 商户名称 | `中医智能健康` |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |
| `STORAGE_ACCESS_KEY_ID` | S3 访问密钥 ID | `your_access_key_id` |
| `STORAGE_SECRET_ACCESS_KEY` | S3 访问密钥 | `your_secret_access_key` |
| `STORAGE_BUCKET` | S3 存储桶名称 | `your_bucket_name` |
| `STORAGE_REGION` | S3 区域 | `us-east-1` |
| `STORAGE_ENDPOINT` | S3 端点 | `https://s3.amazonaws.com` |

### 微信支付配置（如果使用）

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `WECHAT_PAY_APP_ID` | 微信应用 ID | `wx1234567890abcdef` |
| `WECHAT_PAY_MCH_ID` | 微信商户 ID | `1234567890` |
| `WECHAT_PAY_API_KEY` | 微信 API 密钥 | `32_character_api_key` |
| `WECHAT_PAY_NOTIFY_URL` | 微信支付回调 URL | `https://your-domain.com/api/payment/callback/wechat` |
| `WECHAT_PAY_API_URL` | 微信支付 API URL | `https://api.mch.weixin.qq.com` |

---

## 验证部署

### 1. 检查部署状态

在 Vercel Dashboard 中查看部署日志，确保没有错误。

### 2. 访问应用

部署成功后，你会获得一个类似 `https://tcm-smart-diagnosis.vercel.app` 的 URL。

访问以下 URL 测试：

- **前端**: `https://your-app.vercel.app/`
- **API 健康检查**: `https://your-app.vercel.app/api/health`
- **API 示例**: `https://your-app.vercel.app/api/version/check`

### 3. 测试功能

测试以下关键功能：

- ✅ 用户登录/注册
- ✅ AI 智能问询
- ✅ 处方生成
- ✅ 患者管理
- ✅ 病历记录

---

## 常见问题

### Q1: 部署失败，提示 "Build failed"

**解决方案**：

1. 检查 Build Command 是否正确：`npm run build:web && npm run build:server`
2. 检查 Install Command 是否正确：`npm install --legacy-peer-deps`
3. 查看部署日志，查找具体错误信息

### Q2: API 调用失败，提示 404 Not Found

**解决方案**：

1. 检查 `vercel.json` 中的重写规则是否正确
2. 确保 `server/api/[[...path]].ts` 文件存在
3. 检查 API 路径是否正确（应该以 `/api/` 开头）

### Q3: 环境变量未生效

**解决方案**：

1. 确保在 Vercel Dashboard 中正确配置了环境变量
2. 部署后需要重新构建才能应用新的环境变量
3. 检查变量名是否正确（大小写敏感）

### Q4: Serverless Function 超时

**解决方案**：

1. 检查 `vercel.json` 中的 `maxDuration` 设置（免费版最大 10 秒）
2. 优化 AI 调用逻辑，减少响应时间
3. 如果确实需要更长的时间，考虑升级到 Pro 计划

### Q5: 数据库连接失败

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

## 迁移回国内平台

如果需要将项目迁移回国内云平台（如阿里云、腾讯云），请参考以下步骤：

### 1. 准备迁移

- 备份数据库数据
- 下载所有文件（如果有对象存储）
- 准备国内云服务账号

### 2. 创建 Serverless 函数

参考 [迁移方案详解](#迁移方案详解) 中的内容。

### 3. 配置环境变量

在国内云平台的控制台中配置环境变量。

### 4. 测试部署

在新的平台上进行完整的功能测试。

### 5. DNS 切换

将域名解析指向新的服务器。

---

## 迁移方案详解

### 方案 A：迁移到阿里云 Serverless

```bash
# 安装阿里云 CLI
npm install -g @alicloud/fun

# 配置账号
fun config

# 部署
fun deploy
```

**阿里云配置文件**（`template.yml`）：

```yaml
ROSTemplateFormatVersion: '2015-09-01'
Transform: 'Aliyun::Serverless-2018-04-03'
Resources:
  MedicalAIService:
    Type: 'Aliyun::Serverless::Service'
    Properties:
      Description: 'Medical AI Service'
    MedicalAIFunction:
      Type: 'Aliyun::Serverless::Function'
      Properties:
        Description: 'Medical AI Function'
        Handler: 'index.handler'
        Runtime: 'nodejs14'
        Timeout: 10
        MemorySize: 1024
        CodeUri: './dist'
      Events:
        HttpEvent:
          Type: HTTP
          Properties:
            AuthType: ANONYMOUS
            Methods: ['GET', 'POST', 'PUT', 'DELETE']
            Path: '/api/{path*}'
```

### 方案 B：迁移到腾讯云 Serverless

```bash
# 安装腾讯云 CLI
npm install -g scf-cli

# 配置账号
scf configure

# 部署
scf deploy
```

---

## 联系与支持

如果遇到问题，请：

1. 查看 [Vercel 官方文档](https://vercel.com/docs)
2. 查看 [NestJS 文档](https://docs.nestjs.com/)
3. 查看 [Taro 文档](https://taro-docs.jd.com/)

---

## 更新日志

- **2026-02-21**: 初始版本，支持 Vercel Serverless 部署
