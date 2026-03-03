# 快速部署指南（5 分钟）

本指南帮助您在 5 分钟内完成部署。

---

## 🚀 快速开始

### 前置条件

- [ ] GitHub 账号
- [ ] Vercel 账号
- [ ] Render 账号
- [ ] Supabase 账号
- [ ] 代码已推送到 GitHub

---

## 📋 部署步骤（共 5 步）

### Step 1: 部署 Supabase（2 分钟）

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 **"New Project"**
3. 填写项目信息，点击 **"Create new project"**
4. 等待项目创建完成

**获取配置信息**：
- 进入 **Settings** → **API**
- 复制 `Project URL` 和 `anon public key`

### Step 2: 部署后端（1 分钟）

1. 访问 [Render](https://render.com/)
2. 点击 **"New +"** → **"Web Service"**
3. 选择 GitHub 仓库

**配置（关键）**：
```
Root Directory: server
Build Command: npm install && npx @nestjs/cli build
Start Command: node dist/main
```

**环境变量**：
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

4. 点击 **"Create Web Service"**
5. 等待部署完成，复制 API 域名（如 `https://tcm-api.onrender.com`）

### Step 3: 部署前端（1 分钟）

1. 访问 [Vercel](https://vercel.com/)
2. 点击 **"Add New..."** → **"Project"**
3. 选择 GitHub 仓库

**配置（关键）**：
```
Build Command: npm run build:web
Output Directory: dist/h5
Install Command: npm install --legacy-peer-deps
```

**环境变量**：
```
PROJECT_DOMAIN=https://your-api.onrender.com
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

4. 点击 **"Deploy"**
5. 等待部署完成，复制前端域名（如 `https://tcm.vercel.app`）

### Step 4: 创建管理员账号（30 秒）

1. 进入 Supabase SQL Editor
2. 执行以下 SQL：

```sql
INSERT INTO public.users (username, password, role)
VALUES ('admin', '$2b$10$YourHashedPassword', 'admin');
```

**生成密码哈希**：

```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('admin123', 10).then(hash => console.log(hash));
```

### Step 5: 验证部署（30 秒）

1. 访问前端域名
2. 使用管理员账号登录
3. 测试基本功能

---

## ✅ 完成！

您的应用已成功部署！

**访问地址**：
- 前端：`https://your-app.vercel.app`
- 后端：`https://your-api.onrender.com`

---

## 📝 注意事项

1. **环境变量必须正确配置**，否则无法连接数据库
2. **Root Directory 必须设置为 `server`**，否则后端无法构建
3. **Output Directory 必须是 `dist/h5`**，否则前端无法部署
4. **JWT_SECRET 必须保密**，不要泄露

---

## 🔧 常见错误

| 错误 | 解决方案 |
|-----|---------|
| Build failed | 检查 Root Directory 和 Build Command |
| Cannot connect to Supabase | 检查 SUPABASE_URL 和 SUPABASE_ANON_KEY |
| CORS error | 检查后端 CORS 配置 |

---

## 📞 需要帮助？

查看完整部署指南：`docs/DEPLOYMENT_GUIDE.md`

---

**最后更新**：2024-01-01
