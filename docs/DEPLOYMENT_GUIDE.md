# 生产环境部署指南

本文档详细说明如何将中医智能诊疗小程序部署到生产环境。

---

## 📋 部署架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    用户访问层                             │
│  H5网页 | 微信小程序 | Android APP | iOS APP              │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼────────┐
│   Vercel       │      │    Render       │
│  (前端 H5)     │◄────►│   (后端 API)    │
│  - dist/h5     │      │  - NestJS       │
└────────────────┘      └────────┬───────┘
                                 │
                          ┌──────▼────────┐
                          │   Supabase    │
                          │  (数据库)     │
                          │  - PostgreSQL │
                          │  - Storage    │
                          └───────────────┘
```

---

## 🎯 部署目标

| 组件 | 平台 | 用途 | 成本 |
|-----|------|------|------|
| **前端 H5** | Vercel | H5 网页访问 | 免费 |
| **前端 小程序** | 微信开发者工具 | 小程序上传发布 | 免费 |
| **后端 API** | Render | REST API 服务 | 免费 |
| **数据库** | Supabase | PostgreSQL 数据库 | 免费 |

**总成本**：$0/月（免费方案）

---

## 📦 前置准备

### 1. 账号注册

**必需账号**：

- [Vercel](https://vercel.com/) - 前端部署
- [Render](https://render.com/) - 后端部署
- [Supabase](https://supabase.com/) - 数据库服务
- [GitHub](https://github.com/) - 代码托管

### 2. 工具安装

**本地开发环境**：

```bash
# Node.js 18+ (必需)
node --version  # 应该 >= 18.0.0

# Git (必需)
git --version

# npm 或 pnpm (推荐使用 npm，避免 pnpm 兼容性问题)
npm --version
```

### 3. 代码准备

**推送到 GitHub**：

```bash
# 1. 初始化 Git 仓库（如果还没有）
git init

# 2. 添加远程仓库
git remote add origin https://github.com/your-username/tcm-ai-clinic.git

# 3. 提交代码
git add .
git commit -m "feat: 准备生产环境部署"

# 4. 推送到 GitHub
git push -u origin main
```

**重要**：确保 `.gitignore` 已配置正确，避免将敏感信息上传：

```
# .gitignore
.env
.env.local
node_modules
dist/
*.log
.DS_Store
```

---

## 🗄️ 第一步：部署 Supabase 数据库

### 1.1 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 **"New Project"**
3. 填写项目信息：
   - **Name**: `tcm-ai-clinic`（或自定义名称）
   - **Database Password**: 设置强密码（务必保存！）
   - **Region**: 选择离用户最近的区域（推荐：`Southeast Asia (Singapore)`）
4. 点击 **"Create new project"**
5. 等待项目创建完成（约 2-5 分钟）

### 1.2 获取 Supabase 配置信息

**获取 API URL 和 Key**：

1. 进入项目 Dashboard
2. 点击左侧菜单 **Settings** → **API**
3. 记录以下信息：
   ```
   Project URL: https://xxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**重要**：
- ⚠️ **service_role key** 拥有最高权限，切勿泄露！
- ✅ 前端使用 **anon public key**
- ✅ 后端使用 **service_role key**

### 1.3 创建数据库表

**方法 1：使用 SQL 脚本（推荐）**

1. 进入 Supabase Dashboard
2. 点击左侧菜单 **SQL Editor**
3. 点击 **"New query"**
4. 复制并执行以下 SQL 脚本：

```sql
-- ========================================
-- 用户表
-- ========================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 用户权限表
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  authorized_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 病历表
-- ========================================
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  patient_name VARCHAR(100),
  age INTEGER,
  gender VARCHAR(10),
  chief_complaint TEXT,
  present_illness TEXT,
  past_history TEXT,
  diagnosis TEXT,
  prescription TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 充值订单表
-- ========================================
CREATE TABLE IF NOT EXISTS public.recharge_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) DEFAULT 'generic',
  status VARCHAR(20) DEFAULT 'pending',
  screenshot_url VARCHAR(512),
  audit_status VARCHAR(20) DEFAULT 'pending',
  audit_remark TEXT,
  audited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  audited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 创建索引（提高查询性能）
-- ========================================
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_user_id ON public.medical_records(user_id);
CREATE INDEX IF NOT EXISTS idx_recharge_orders_user_id ON public.recharge_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_recharge_orders_order_no ON public.recharge_orders(order_no);
CREATE INDEX IF NOT EXISTS idx_recharge_orders_audit_status ON public.recharge_orders(audit_status);

-- ========================================
-- 启用行级安全策略（可选，生产环境推荐）
-- ========================================
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
```

5. 点击 **"Run"** 执行脚本
6. 确认所有表创建成功

**方法 2：手动创建（不推荐）**

如果 SQL 脚本执行失败，可以手动在 **Table Editor** 中创建表，但非常耗时。

### 1.4 配置存储桶

1. 进入 Supabase Dashboard
2. 点击左侧菜单 **Storage**
3. 点击 **"New bucket"**
4. 创建以下存储桶：

| 桶名 | 用途 | 访问策略 |
|-----|------|---------|
| `screenshots` | 充值截图 | Public |
| `avatars` | 用户头像 | Public |
| `prescriptions` | 处方图片 | Public |

**配置截图存储桶**（示例）：

1. 点击 **screenshots** 桶
2. 点击 **"Edit"**
3. 设置 **Public Bucket** 为启用
4. 保存

### 1.5 创建管理员账号

1. 进入 **SQL Editor**
2. 执行以下脚本：

```sql
-- 创建管理员账号（密码：admin123，请修改！）
INSERT INTO public.users (username, password, role)
VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'admin');

-- 查看管理员账号
SELECT * FROM public.users WHERE role = 'admin';
```

**注意**：密码需要使用 bcrypt 哈希，可以通过 Node.js 生成：

```javascript
// 生成 bcrypt 哈希
const bcrypt = require('bcrypt');
bcrypt.hash('admin123', 10).then(hash => console.log(hash));
```

---

## 🚀 第二步：部署后端（Render）

### 2.1 创建 Render 账号

1. 访问 [Render](https://render.com/)
2. 使用 GitHub 账号登录
3. 点击 **"New +"** → **"Web Service"**

### 2.2 配置 Web Service

**基本信息**：

```
Name: tcm-ai-clinic-api
Region: Singapore (推荐亚洲用户)
Branch: main
```

**构建配置（CRITICAL）**：

```
Root Directory: server
Build Command: npm install && npx @nestjs/cli build
Start Command: node dist/main
```

**重要说明**：
- ✅ **Root Directory 必须设置为 `server`**
- ✅ **Build Command 必须包含 `npm install`**
- ✅ **Start Command 必须是 `node dist/main`**

**实例类型**：

```
Type: Free (免费)
Instance: nano (0.1 CPU, 256MB RAM)
```

**环境变量（Environment Variables）**：

在 **Environment** 部分添加以下变量：

| 变量名 | 值 | 说明 |
|-------|---|------|
| `NODE_ENV` | `production` | 生产环境 |
| `PORT` | `3000` | 端口 |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase service role key |
| `JWT_SECRET` | `your-secret-key` | JWT 密钥（随机生成） |
| `PROJECT_DOMAIN` | `your-app-name.onrender.com` | Render 自动分配的域名 |

**生成 JWT_SECRET**：

```bash
# 生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**PROJECT_DOMAIN 填写说明**：

点击 **"Create Web Service"** 后，Render 会自动生成域名（如 `tcm-ai-clinic-api.onrender.com`），复制这个域名填入 `PROJECT_DOMAIN`。

### 2.3 部署后端

1. 点击 **"Create Web Service"**
2. 等待构建完成（约 3-5 分钟）
3. 查看部署日志，确认无错误

**常见构建错误**：

| 错误 | 原因 | 解决方案 |
|-----|------|---------|
| `Cannot find module` | `package.json` 不在 server 目录 | 设置 Root Directory 为 `server` |
| `npm install failed` | 依赖安装失败 | 重新触发部署，或修改 Build Command |
| `Build failed` | TypeScript 编译错误 | 本地先运行 `npm run build` 检查 |

### 2.4 验证后端部署

1. 在 Render Dashboard 中点击 **"URL"**（如 `https://tcm-ai-clinic-api.onrender.com`）
2. 测试 API 是否正常：

```bash
# 测试健康检查接口
curl https://tcm-ai-clinic-api.onrender.com/api/health

# 测试用户登录
curl -X POST https://tcm-ai-clinic-api.onrender.com/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**预期响应**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "eyJhbGc...",
    "user": { "id": "...", "username": "admin" }
  }
}
```

### 2.5 配置 CORS（重要）

Render 默认允许所有域名访问，但建议明确配置：

在 `server/src/main.ts` 中确认 CORS 配置：

```typescript
app.enableCors({
  origin: '*',  // 允许所有域名（开发环境）
  // origin: ['https://your-vercel-domain.vercel.app'],  // 生产环境限制
  credentials: true,
})
```

---

## 🌐 第三步：部署前端 H5（Vercel）

### 3.1 创建 Vercel 账号

1. 访问 [Vercel](https://vercel.com/)
2. 使用 GitHub 账号登录
3. 点击 **"Add New..."** → **"Project"**

### 3.2 导入 GitHub 仓库

1. 选择您的 GitHub 仓库
2. 点击 **"Import"**

### 3.3 配置构建设置

**Framework Preset**：

```
Framework: Other
```

**Build and Output Settings**：

```
Root Directory: ./
Build Command: npm run build:web
Output Directory: dist/h5
Install Command: npm install --legacy-peer-deps
```

**重要说明**：
- ✅ **Output Directory 必须是 `dist/h5`**
- ✅ **Build Command 必须是 `npm run build:web`**
- ✅ **Install Command 添加 `--legacy-peer-deps`**（避免依赖冲突）

### 3.4 配置环境变量

在 **Environment Variables** 部分添加：

| 变量名 | 值 | 说明 |
|-------|---|------|
| `PROJECT_DOMAIN` | `https://your-api.onrender.com` | 后端 API 域名 |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase URL |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase anon key |

**注意**：
- `PROJECT_DOMAIN` 必须是完整的 URL（带 `https://`）
- 只填后端的域名，不要带 `/api` 前缀

### 3.5 部署前端

1. 点击 **"Deploy"**
2. 等待构建完成（约 2-3 分钟）
3. 获取部署后的域名（如 `https://tcm-ai-clinic.vercel.app`）

### 3.6 验证前端部署

1. 访问部署后的域名
2. 确认页面正常加载
3. 测试登录功能：
   - 输入用户名：`admin`
   - 输入密码：`admin123`
   - 点击登录，确认能正常跳转

### 3.7 配置 Vercel 代理（可选）

Vercel 默认配置了 API 代理，确认 `vercel.json` 存在：

```json
{
  "version": 2,
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist/h5",
  "installCommand": "npm install --legacy-peer-deps",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-api.onrender.com/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type,Authorization" }
      ]
    }
  ]
}
```

---

## 📱 第四步：部署微信小程序

### 4.1 准备小程序账号

**必需条件**：

- 已认证的微信小程序账号（企业账号）
- 小程序 AppID
- 小程序 AppSecret

### 4.2 配置小程序信息

**修改 `project.config.json`**：

```json
{
  "appid": "your-appid-here",
  "projectname": "中医智能诊疗好帮手",
  "description": "基于 AI 的中医智能诊疗小程序"
}
```

### 4.3 配置服务器域名

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入 **开发** → **开发管理** → **开发设置**
3. 配置服务器域名：

```
request 合法域名：https://your-api.onrender.com
uploadFile 合法域名：https://your-api.onrender.com
downloadFile 合法域名：https://your-api.onrender.com
```

### 4.4 构建小程序代码

```bash
# 构建小程序版本
npm run build:weapp

# 构建产物在 dist/weapp 目录
```

### 4.5 上传小程序

1. 打开微信开发者工具
2. 导入项目（选择 `dist/weapp` 目录）
3. 点击 **"上传"**
4. 填写版本号和备注
5. 登录微信公众平台，提交审核
6. 审核通过后发布

---

## 🔄 第五步：配置环境变量（本地开发）

### 5.1 创建 `.env` 文件

在项目根目录创建 `.env` 文件：

```bash
# .env
NODE_ENV=development

# Supabase 配置
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# 后端配置
PORT=3000
JWT_SECRET=your-secret-key-here

# 前端配置
PROJECT_DOMAIN=http://localhost:3000

# 商户收款码配置
MERCHANT_QR_CODE=https://your-qr-code-url.com/qr.png
MERCHANT_NAME=商户名称
```

### 5.2 提交环境变量到生产环境

**重要**：不要将 `.env` 文件上传到 GitHub！

**生产环境环境变量**：

在 Vercel 和 Render 的 Dashboard 中配置环境变量，参考前面的步骤。

---

## 🌍 第六步：配置自定义域名（可选）

### 6.1 配置 Vercel 域名

1. 进入 Vercel Dashboard
2. 选择项目 → **Settings** → **Domains**
3. 添加自定义域名（如 `www.your-domain.com`）
4. 按照提示配置 DNS 记录

### 6.2 配置 Render 域名

1. 进入 Render Dashboard
2. 选择项目 → **Settings** → **Custom Domains**
3. 添加自定义域名（如 `api.your-domain.com`）
4. 配置 DNS 记录

### 6.3 更新前端配置

在 Vercel 中更新 `PROJECT_DOMAIN` 环境变量：

```
PROJECT_DOMAIN=https://api.your-domain.com
```

---

## ✅ 第七步：验证与测试

### 7.1 检查服务状态

**后端服务检查**：

```bash
# 检查后端健康状态
curl https://your-api.onrender.com/api/health

# 检查用户登录
curl -X POST https://your-api.onrender.com/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**前端服务检查**：

1. 访问前端域名
2. 测试登录功能
3. 测试核心功能（如智能诊疗、充值等）

### 7.2 测试充值流程

**完整流程测试**：

1. 登录普通用户账号
2. 进入充值页面
3. 选择套餐
4. 扫描收款码付款
5. 上传转账截图
6. 登录管理员账号
7. 进入订单审核页面
8. 审核通过/拒绝
9. 确认用户权限更新

### 7.3 检查日志

**Render 日志**：

1. 进入 Render Dashboard
2. 选择项目 → **Logs**
3. 查看实时日志，确认无错误

**Vercel 日志**：

1. 进入 Vercel Dashboard
2. 选择项目 → **Deployments**
3. 点击最新部署 → **Logs**
4. 查看构建和运行日志

---

## 🔧 第八步：监控与维护

### 8.1 监控服务状态

**Render 监控**：

- 自动监控 CPU、内存、网络
- 发送邮件告警
- 免费版有重启限制（15 分钟无流量会休眠）

**Vercel 监控**：

- 自动监控构建状态
- 提供性能分析
- 免费版无限流量

### 8.2 定期备份

**Supabase 备份**：

- Supabase 免费版每天自动备份
- 可以手动导出数据

**备份命令**：

```sql
-- 导出所有表数据
SELECT * FROM public.users;
SELECT * FROM public.medical_records;
SELECT * FROM public.recharge_orders;
```

### 8.3 更新应用

**更新后端**：

```bash
# 1. 修改代码
git add .
git commit -m "fix: 修复某个bug"
git push

# 2. Render 自动检测到推送，自动重新部署
# 3. 等待部署完成
```

**更新前端**：

```bash
# 1. 修改代码
git add .
git commit -m "feat: 新增某个功能"
git push

# 2. Vercel 自动检测到推送，自动重新部署
# 3. 等待部署完成
```

---

## ⚠️ 常见问题排查

### 问题 1：后端构建失败

**错误信息**：`Build failed`

**可能原因**：
- Root Directory 配置错误
- Build Command 错误
- 依赖安装失败

**解决方案**：
1. 检查 Root Directory 是否为 `server`
2. 检查 Build Command 是否为 `npm install && npx @nestjs/cli build`
3. 本地先运行 `npm run build` 确认无错误

### 问题 2：前端无法访问后端 API

**错误信息**：`Network Error` 或 `CORS Error`

**可能原因**：
- PROJECT_DOMAIN 配置错误
- 后端 CORS 未配置
- 环境变量未设置

**解决方案**：
1. 检查 Vercel 中的 `PROJECT_DOMAIN` 是否正确
2. 检查后端 CORS 配置
3. 确认环境变量已正确配置

### 问题 3：Supabase 连接失败

**错误信息**：`Supabase connection error`

**可能原因**：
- SUPABASE_URL 或 SUPABASE_KEY 错误
- 网络问题

**解决方案**：
1. 检查 Supabase URL 和 Key 是否正确
2. 确认 Supabase 服务正常
3. 检查防火墙设置

### 问题 4：小程序无法上传图片

**错误信息**：`uploadFile:fail`

**可能原因**：
- 服务器域名未配置
- 文件太大

**解决方案**：
1. 在微信公众平台配置服务器域名
2. 检查文件大小是否超过限制

---

## 📊 部署检查清单

### 部署前检查

- [ ] 代码已推送到 GitHub
- [ ] `.gitignore` 已配置正确
- [ ] Supabase 项目已创建
- [ ] 数据库表已创建
- [ ] 管理员账号已创建
- [ ] 存储桶已配置

### 后端部署检查

- [ ] Render Web Service 已创建
- [ ] Root Directory 配置为 `server`
- [ ] Build Command 配置正确
- [ ] Start Command 配置正确
- [ ] 环境变量已配置
- [ ] 后端服务正常启动
- [ ] API 接口可以正常访问

### 前端部署检查

- [ ] Vercel 项目已创建
- [ ] Output Directory 配置为 `dist/h5`
- [ ] Build Command 配置正确
- [ ] 环境变量已配置
- [ ] 前端页面正常加载
- [ ] 可以正常登录

### 小程序部署检查

- [ ] 小程序 AppID 已配置
- [ ] 服务器域名已配置
- [ ] 小程序代码已构建
- [ ] 小程序已上传
- [ ] 小程序已提交审核

### 最终验证检查

- [ ] H5 网页可以正常访问
- [ ] 小程序可以正常使用
- [ ] 登录功能正常
- [ ] 充值功能正常
- [ ] 管理员审核功能正常
- [ ] 所有 API 接口正常

---

## 📞 技术支持

**常见问题**：
- 查看 `docs/FAQ.md`
- 查看 [Render 文档](https://render.com/docs)
- 查看 [Vercel 文档](https://vercel.com/docs)
- 查看 [Supabase 文档](https://supabase.com/docs)

---

## 🎉 部署完成

恭喜！您的应用已成功部署到生产环境！

**部署后的访问地址**：

- **H5 网页**：`https://your-app.vercel.app`
- **后端 API**：`https://your-api.onrender.com`
- **小程序**：微信搜索小程序名称

**下一步**：

1. 向用户推广您的应用
2. 监控服务状态
3. 收集用户反馈
4. 持续优化功能

---

**最后更新**：2024-01-01
**文档版本**：v1.0.0
