# Vercel 环境变量配置指南

## 问题描述

用户访问子域名网址时，登录功能报错："响应数据为空，请检查网络连接"。

## 根本原因

前端代码在构建时需要将 `PROJECT_DOMAIN` 环境变量硬编码到 JavaScript 代码中。如果 Vercel 上没有正确配置环境变量，或者构建时没有加载到正确的环境变量，会导致：

1. `PROJECT_DOMAIN` 为 `undefined`
2. 网络请求 URL 变成 `undefined/api/auth/login`
3. 请求失败，返回空响应

## 解决方案

### 方案 1：在 Vercel 上配置环境变量（推荐）

#### 步骤 1：登录 Vercel Dashboard

访问 https://vercel.com/dashboard

#### 步骤 2：选择项目

选择 `zhongyi-smart`（前端项目）

#### 步骤 3：进入 Settings > Environment Variables

1. 点击项目名称
2. 进入 `Settings` 标签
3. 选择 `Environment Variables`

#### 步骤 4：添加环境变量

添加以下环境变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `PROJECT_DOMAIN` | `https://api.zhongyihskhealth.com` | Production |
| `COZE_SUPABASE_URL` | `https://br-zippy-kea-87a692a5.supabase2.aidap-global.cn-beijing.volces.com` | Production |
| `COZE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTEzNjMzMzIsInJvbGUiOiJhbm9uIn0.RS0wQLKj-8lsYE-Qek3ut9y9adM072H6gHepZ4xwk60` | Production |
| `WECHAT_APP_ID` | `wxc9246b2c31d037f2` | Production |
| `WECHAT_SECRET` | `ca48ca8fccf44ce3e1af8c4eae102a64` | Production |
| `JWT_SECRET` | `ad5298de0ecab1330ca2a1c00d564ccfb46767d4c174410d817d9ef3fc600e12` | Production |
| `JWT_EXPIRES_IN` | `7d` | Production |
| `COZE_WORKLOAD_IDENTITY_API_KEY` | `cztei_qCNZrpasC9t4xrMAJa70H3fUOvYwB0VL0LYrEC2mWGPpbHAIHzMPDURIJntzh0EFe` | Production |
| `COZE_INTEGRATION_BASE_URL` | `https://integration.coze.cn` | Production |
| `COZE_INTEGRATION_MODEL_BASE_URL` | `https://integration.coze.cn/api/v3` | Production |

#### 步骤 5：重新部署

1. 进入 `Deployments` 标签
2. 点击最新的部署
3. 点击右上角的 `...` 菜单
4. 选择 `Redeploy`

### 方案 2：使用 Vercel CLI 重新部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 设置环境变量
vercel env add PROJECT_DOMAIN production
# 输入：https://api.zhongyihskhealth.com

# 部署
vercel --prod
```

### 方案 3：手动设置环境变量文件

如果无法在 Vercel Dashboard 上配置，可以创建 `.env.production` 文件，并确保它被 Git 追踪：

```bash
# 确保 .env.production 存在
cat .env.production

# 确保包含以下内容
PROJECT_DOMAIN=https://api.zhongyihskhealth.com
COZE_SUPABASE_URL=https://br-zippy-kea-87a692a5.supabase2.aidap-global.cn-beijing.volces.com
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTEzNjMzMzIsInJvbGUiOiJhbm9uIn0.RS0wQLKj-8lsYE-Qek3ut9y9adM072H6gHepZ4xwk60
# ... 其他环境变量
```

### 方案 4：使用调试页面排查

我已经创建了一个调试页面 `pages/debug/index`，可以帮助您检查环境配置：

1. 访问调试页面（在小程序或 H5 中）
2. 点击"检查环境配置"按钮
3. 查看 `PROJECT_DOMAIN` 是否正确

如果 `PROJECT_DOMAIN` 显示为 `undefined` 或空字符串，说明环境变量配置有问题。

## 验证步骤

### 1. 检查构建日志

在 Vercel Dashboard > Deployments 中查看最新的构建日志，确认是否正确加载了环境变量：

```
[Config] 加载环境变量文件: /vercel/path/to/.env.production
[Config] PROJECT_DOMAIN: https://api.zhongyihskhealth.com
[Config] NODE_ENV: production
```

### 2. 检查浏览器控制台

打开浏览器开发者工具（F12），查看 Console 标签：

```
[Network] Request: {
  originalUrl: '/api/auth/login',
  fullUrl: 'https://api.zhongyihskhealth.com/api/auth/login',
  method: 'POST',
  data: { username: '...', password: '...' },
  PROJECT_DOMAIN: 'https://api.zhongyihskhealth.com'
}
```

如果 `fullUrl` 显示为 `undefined/api/auth/login`，说明环境变量配置有问题。

### 3. 测试 API 是否可访问

使用 curl 或 Postman 测试 API 是否可访问：

```bash
curl -X POST https://api.zhongyihskhealth.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"password123"}'
```

如果 API 返回正常，说明后端没有问题，问题在于前端配置。

## 常见问题

### Q1: 为什么本地开发正常，但在 Vercel 上部署后失败？

**A**: 本地开发时使用 `.env.local` 文件，但 Vercel 部署时使用 `.env.production` 文件或 Vercel Dashboard 中配置的环境变量。如果 Vercel 上没有配置环境变量，构建时 `PROJECT_DOMAIN` 会是 `undefined`。

### Q2: 为什么需要在 Vercel 上配置环境变量？

**A**: 前端代码在构建时需要将环境变量硬编码到 JavaScript 代码中（通过 `defineConstants`）。如果构建时环境变量不存在，代码中的 `PROJECT_DOMAIN` 就会是 `undefined`。

### Q3: 为什么不使用运行时环境变量？

**A**: 前端 JavaScript 运行在浏览器中，无法直接访问服务器环境变量。必须在构建时将环境变量嵌入代码中。

### Q4: 如何验证环境变量是否正确配置？

**A**:
1. 使用调试页面 `pages/debug/index` 检查
2. 查看浏览器控制台日志
3. 查看构建日志

## 推荐做法

1. ✅ **在 Vercel Dashboard 上配置所有必需的环境变量**
2. ✅ **使用调试页面验证配置**
3. ✅ **查看构建日志确认环境变量已加载**
4. ✅ **重新部署后测试登录功能**
5. ✅ **设置环境变量后，确保重新部署**

## 联系支持

如果以上方案都无法解决问题，请联系技术支持，并提供以下信息：

1. 访问的子域名网址
2. 浏览器控制台的完整错误日志
3. 调试页面的环境信息截图
4. Vercel 构建日志

---

**最后更新时间**: 2025-01-13
