# Vercel 部署指南

## 概述

本项目同时部署前端（Taro H5）和后端（NestJS Serverless Functions）到 Vercel。

## 部署步骤

### 1. 准备工作

确保已将代码推送到 Git 仓库（GitHub、GitLab 或 Bitbucket）。

### 2. 连接 Vercel

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入你的 Git 仓库
4. 选择项目根目录

### 3. 配置环境变量

在 Vercel 项目设置中，添加以下环境变量（Settings > Environment Variables）：

#### 前端配置
```
PROJECT_DOMAIN=/
```

#### 后端配置
```
COZE_SUPABASE_URL=https://br-zippy-kea-87a692a5.supabase2.aidap-global.cn-beijing.volces.com
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTEzNjMzMzIsInJvbGUiOiJhbm9uIn0.RS0wQLKj-8lsYE-Qek3ut9y9adM072H6gHepZ4xwk60

JWT_SECRET=ad5298de0ecab1330ca2a1c00d564ccfb46767d4c174410d817d9ef3fc600e12
JWT_EXPIRES_IN=7d

COZE_WORKLOAD_IDENTITY_API_KEY=cztei_qCNZrpasC9t4xrMAJa70H3fUOvYwB0VL0LYrEC2mWGPpbHAIHzMPDURIJntzh0EFe
COZE_INTEGRATION_BASE_URL=https://integration.coze.cn
COZE_INTEGRATION_MODEL_BASE_URL=https://integration.coze.cn/api/v3

NODE_ENV=production
```

#### 微信小程序配置（如需要）
```
WECHAT_APP_ID=your_wechat_appid_here
WECHAT_SECRET=your_wechat_secret_here
```

#### 微信支付配置（如需要）
```
WECHAT_PAY_APP_ID=wx1234567890abcdef
WECHAT_PAY_MCH_ID=1234567890
WECHAT_PAY_API_KEY=your_32_character_api_key_here
WECHAT_PAY_NOTIFY_URL=https://tcmsmarthealth.com/api/payment/callback/wechat
```

### 4. 配置构建设置

在 Vercel 项目设置中，确保以下配置正确：

#### Build & Development Settings
- **Framework Preset**: Other
- **Build Command**: `npm run build:web && cd server && npm run build`
- **Output Directory**: `dist-web`
- **Install Command**: `npm install --legacy-peer-deps`

### 5. 验证部署

部署完成后，访问你的 Vercel 域名（如 `https://tcmsmarthealth.com/`），检查：

1. ✅ 前端页面正常加载
2. ✅ 登录功能正常工作（使用管理员账号：admin / 123456）
3. ✅ API 请求返回正确响应
4. ✅ 数据库连接正常

### 6. 自定义域名（可选）

如果需要使用自定义域名：

1. 在 Vercel 项目设置中，进入 "Domains"
2. 添加你的域名（如 `tcmsmarthealth.com`）
3. 根据提示配置 DNS 记录
4. 等待 SSL 证书自动颁发

## 架构说明

### 前端
- **框架**: Taro 4 + React 18
- **构建输出**: `dist-web/`
- **部署**: Vercel Static Sites

### 后端
- **框架**: NestJS 10
- **运行时**: Node.js 20.x
- **部署**: Vercel Serverless Functions
- **入口**: `api/index.ts`

### 路由配置

Vercel 通过 `vercel.json` 配置路由重写：

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index.ts"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

这意味着：
- 所有 `/api/*` 请求会被路由到 `api/index.ts`（NestJS Serverless Function）
- 其他所有请求返回 `index.html`（前端 SPA）

## 常见问题

### 1. "failed to fetch" 错误

**原因**:
- 环境变量未正确配置
- API 路由配置错误
- CORS 配置问题

**解决方案**:
- 检查 Vercel 环境变量是否已正确设置
- 确保 `PROJECT_DOMAIN=/`（使用相对路径）
- 检查 `api/index.ts` 中的 CORS 配置

### 2. 登录失败

**原因**:
- 数据库连接问题
- 管理员账号未初始化

**解决方案**:
- 检查 `COZE_SUPABASE_URL` 和 `COZE_SUPABASE_ANON_KEY` 是否正确
- 运行初始化脚本创建管理员账号：
  ```bash
  cd server && node scripts/init-admin.js
  ```

### 3. 构建失败

**原因**:
- Node.js 版本不兼容
- 依赖安装失败

**解决方案**:
- 确保 Vercel 使用 Node.js 20.x（在 `vercel.json` 中配置）
- 使用 `--legacy-peer-deps` 标志安装依赖

### 4. API 超时

**原因**:
- Serverless Function 超时（默认 10 秒）
- 数据库查询慢

**解决方案**:
- 在 `vercel.json` 中增加超时时间：
  ```json
  {
    "functions": {
      "api/**/*.ts": {
        "runtime": "nodejs20.x",
        "maxDuration": 30
      }
    }
  }
  ```

## 监控和日志

### 查看部署日志
1. 进入 Vercel 项目 Dashboard
2. 点击 "Deployments"
3. 选择部署，查看 "Build Logs"

### 查看函数日志
1. 进入 Vercel 项目 Dashboard
2. 点击 "Functions"
3. 选择函数，查看 "Logs"

### 查看 API 请求日志
1. 进入 Vercel 项目 Dashboard
2. 点击 "Analytics"
3. 查看 "Logs"

## 更新部署

### 自动部署
- 每次推送到主分支（`main`/`master`）会自动触发部署

### 手动部署
1. 进入 Vercel 项目 Dashboard
2. 点击 "Deployments"
3. 点击右上角 "Redeploy"

## 环境变量管理

### 添加/修改环境变量
1. 进入 Vercel 项目 Settings > Environment Variables
2. 点击 "Add New" 或编辑现有变量
3. 保存后需要重新部署才能生效

### 环境变量优先级
Vercel 环境变量 > `.env.production` > `.env`

## 性能优化

### 前端优化
- 启用 Vercel Edge Network
- 配置 CDN 缓存
- 启用 Gzip/Brotli 压缩

### 后端优化
- 减少冷启动时间
- 优化数据库查询
- 使用 Redis 缓存（可选）

## 安全建议

1. **环境变量安全**
   - 不要将敏感信息提交到 Git
   - 使用 Vercel 的环境变量管理敏感信息
   - 定期轮换 JWT_SECRET

2. **HTTPS**
   - Vercel 自动提供免费 SSL 证书
   - 强制使用 HTTPS

3. **CORS**
   - 限制允许的源
   - 不要在生产环境使用 `origin: true`

4. **速率限制**
   - 在 NestJS 中添加速率限制中间件
   - 防止 API 滥用

## 支持

如有问题，请查看：
- [Vercel 官方文档](https://vercel.com/docs)
- [NestJS 文档](https://docs.nestjs.com/)
- [Taro 文档](https://taro-docs.jd.com/)
