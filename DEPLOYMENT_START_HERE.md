# 🚀 部署开始！您的快速部署指南

## ✅ 部署准备已完成

### 已自动完成的准备工作

1. ✅ **JWT Secret 已生成**
   - 已保存在 `.jwt_secret` 文件中
   - 生成值：`d9d090349fd94264e1a768711553413ee69927809b78382413ed23e2b674a985`
   - 此值需要在 Render 环境变量中配置

2. ✅ **环境变量模板已创建**
   - 文件：`.env.local.example`
   - 包含所有需要配置的环境变量

3. ✅ **GitHub Actions 工作流已创建**
   - 文件：`.github/workflows/keep-alive.yml`
   - 功能：每 10 分钟自动 Ping 后端，避免冷启动

4. ✅ **Git 仓库已初始化**
   - 仓库已准备好提交代码
   - `.gitignore` 已更新

5. ✅ **配置文件已验证**
   - `vercel.json` ✅ 正确
   - `package.json` ✅ 正确
   - `server/package.json` ✅ 正确

## 📋 下一步操作（5 个步骤）

### 步骤 1：获取 API 密钥（10 分钟）

您需要获取以下 API 密钥：

#### 1.1 Supabase 密钥

**访问**：https://supabase.com

**操作步骤**：
1. 注册/登录 Supabase
2. 创建新项目（或使用现有项目）
3. 等待项目初始化完成（约 2-3 分钟）
4. 进入 **Settings** → **API**
5. 复制以下两个值：

```
Project URL
（示例：https://xxxxxxxx.supabase.co）

Service Role Key
（示例：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...）
```

**保存到记事本**，稍后在 Render 配置时会用到。

#### 1.2 Coze AI 密钥

**访问**：https://www.coze.cn

**操作步骤**：
1. 注册/登录 Coze
2. 进入 **开发** → **API 管理**
3. 点击 **创建 Token**（或复制现有 Token）
4. 复制以下两个值：

```
Personal Access Token
（示例：pat_xxxxxxxxxxxxxxxxxxxxxx）

Secret Key
（示例：xxxxxxxxxxxxxxxxxxxxx）
```

**保存到记事本**，稍后在 Render 配置时会用到。

#### 1.3 JWT Secret（已生成）

**已自动生成**：
```
JWT Secret
d9d090349fd94264e1a768711553413ee69927809b78382413ed23e2b674a985
```

**已保存在**：`.jwt_secret` 文件中

### 步骤 2：创建 GitHub 仓库（5 分钟）

#### 2.1 在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `tcm-smart-diagnosis`
   - **Description**: `中医智能健康小程序`
   - **Visibility**: 选择 **Private**（私有）
3. 点击 **"Create repository"**

#### 2.2 推送代码到 GitHub

在项目根目录 `/workspace/projects` 执行以下命令：

```bash
# 添加所有文件
git add .

# 提交代码
git commit -m "准备部署到 Vercel + Render

- 优化部署配置
- 添加环境变量模板
- 创建 GitHub Actions 工作流
- 修复免费期限显示（3天）
- 配置新加坡区域部署"

# 添加远程仓库（替换 YOUR_USERNAME 为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/tcm-smart-diagnosis.git

# 推送代码
git branch -M main
git push -u origin main
```

**注意**：
- 将 `YOUR_USERNAME` 替换为您的实际 GitHub 用户名
- 如果遇到认证问题，可能需要使用 GitHub Personal Access Token

### 步骤 3：部署后端到 Render（15 分钟）

#### 3.1 登录 Render

1. 访问 https://dashboard.render.com
2. 使用 GitHub 账号登录
3. 点击 **"New +"** → **"Web Service"**

#### 3.2 连接 GitHub 仓库

1. 在 "Connect a repository" 中找到 `tcm-smart-diagnosis`
2. 点击 **"Connect"**
3. 授予 Render 访问权限

#### 3.3 配置基本信息

**Name**:
```
tcm-smart-diagnosis-api
```

**Region**:
```
Singapore (新加坡) ← 重要！选择新加坡以获得更快访问速度
```

**Branch**:
```
main
```

#### 3.4 配置构建和运行

**Root Directory**:
```
server
```

**Runtime**:
```
Node
```

**Build Command**:
```
npm install && npm run build
```

**Start Command**:
```
npm run start:prod
```

**Instance Type**:
```
Free (免费)
```

#### 3.5 配置环境变量（重要！）

在 **Environment Variables** 部分，点击 **"Add Environment Variable"**，逐个添加以下变量：

**1. SUPABASE_URL**
```
Key: SUPABASE_URL
Value: https://xxxxxxxx.supabase.co（从步骤 1.1 获取）
Type: Plain
Environment: Production
```

**2. SUPABASE_SERVICE_ROLE_KEY**
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（从步骤 1.1 获取）
Type: Plain
Environment: Production
```

**3. COZE_API_KEY**
```
Key: COZE_API_KEY
Value: pat_xxxxxxxxxxxxxxxxxxxxxx（从步骤 1.2 获取）
Type: Plain
Environment: Production
```

**4. COZE_API_SECRET**
```
Key: COZE_API_SECRET
Value: xxxxxxxxxxxxxxxxxxxxxx（从步骤 1.2 获取）
Type: Plain
Environment: Production
```

**5. JWT_SECRET**
```
Key: JWT_SECRET
Value: d9d090349fd94264e1a768711553413ee69927809b78382413ed23e2b674a985（已自动生成）
Type: Plain
Environment: Production
```

**6. NODE_ENV**（可选）
```
Key: NODE_ENV
Value: production
Type: Plain
Environment: Production
```

**7. PORT**（可选）
```
Key: PORT
Value: 3000
Type: Plain
Environment: Production
```

**注意**：所有环境变量都必须选择 **Environment: Production**

#### 3.6 开始部署

1. 检查所有配置是否正确
2. 点击 **"Create Web Service"**
3. 等待构建完成（约 3-5 分钟）
4. 构建成功后，您将看到绿色的 **"Live"** 状态

#### 3.7 记录 Render 域名

在 Render Dashboard 顶部，您会看到类似这样的地址：

```
https://tcm-smart-diagnosis-api.onrender.com
```

**复制这个地址**，保存到记事本，稍后在配置 Vercel 时会用到。

### 步骤 4：部署前端到 Vercel（10 分钟）

#### 4.1 登录 Vercel

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 **"Add New..."** → **"Project"**

#### 4.2 导入 GitHub 仓库

1. 在 "Import Git Repository" 中找到 `tcm-smart-diagnosis`
2. 点击 **"Import"**

#### 4.3 配置项目设置

**Framework Preset**:
```
Other
```

**Build Command**:
```
pnpm install && pnpm build:web
```

**Output Directory**:
```
dist-web
```

**Install Command**:
```
pnpm install
```

#### 4.4 配置环境变量

在 **Environment Variables** 部分，点击 **"Add Environment Variable"**：

**PROJECT_DOMAIN**
```
Name: PROJECT_DOMAIN
Value: https://tcm-smart-diagnosis-api.onrender.com（从步骤 3.7 获取）
Environment: Production, Preview, Development
```

**注意**：
- 将 `tcm-smart-diagnosis-api.onrender.com` 替换为您实际的 Render 域名
- 必须选择所有三个环境：Production, Preview, Development

#### 4.5 开始部署

1. 检查所有配置是否正确
2. 点击 **"Deploy"**
3. 等待构建完成（约 2-3 分钟）
4. 构建成功后，您将看到绿色的勾号

#### 4.6 记录 Vercel 域名

在 Vercel Dashboard 顶部，您会看到类似这样的地址：

```
https://tcm-smart-diagnosis.vercel.app
```

**复制这个地址**，这是您的前端访问地址。

### 步骤 5：测试部署（5 分钟）

#### 5.1 测试后端 API

在浏览器中访问以下 URL：

```
https://tcm-smart-diagnosis-api.onrender.com
```

**预期结果**：
```
{"status":"ok"}
```

或者使用 curl 命令测试：

```bash
curl https://tcm-smart-diagnosis-api.onrender.com
```

#### 5.2 测试前端

在浏览器中访问以下 URL：

```
https://tcm-smart-diagnosis.vercel.app
```

**预期结果**：
- ✅ 页面正常加载
- ✅ 样式显示正常
- ✅ 无控制台错误

#### 5.3 测试用户注册

1. 在前端页面，点击"注册"
2. 填写注册信息：
   - 用户名：testuser
   - 密码：123456
   - 角色：个体用户
3. 点击"注册"
4. 验证注册成功

#### 5.4 测试智能健康咨询

1. 使用注册的账号登录
2. 创建新患者
3. 填写症状信息
4. 点击"生成健康方案"
5. 等待 AI 处理
6. 查看生成的处方

## 🎉 部署完成！

### 访问地址

**前端**：
```
https://tcm-smart-diagnosis.vercel.app
```

**后端 API**：
```
https://tcm-smart-diagnosis-api.onrender.com
```

### 常用 API 端点

```
健康检查：https://tcm-smart-diagnosis-api.onrender.com
用户注册：https://tcm-smart-diagnosis-api.onrender.com/api/auth/register
用户登录：https://tcm-smart-diagnosis-api.onrender.com/api/auth/login
```

### 环境变量配置

**Vercel 环境变量**：
```
PROJECT_DOMAIN=https://tcm-smart-diagnosis-api.onrender.com
```

**Render 环境变量**：
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
COZE_API_KEY=your_coze_api_key
COZE_API_SECRET=your_coze_api_secret
JWT_SECRET=d9d090349fd94264e1a768711553413ee69927809b78382413ed23e2b674a985
NODE_ENV=production
PORT=3000
```

## 💰 成本总结

| 项目 | 月费用 | 年费用 |
|------|--------|--------|
| Vercel 前端 | **$0** | **$0** |
| Render 后端 | **$0** | **$0** |
| Supabase 数据库 | **$0** | **$0** |
| **总计** | **$0/月** | **$0/年** |

**完全免费！** 🎉

## 📊 性能指标

**预期访问速度**：
- 新加坡到中国：100-200ms
- 首次加载：< 3 秒
- API 响应：< 2 秒
- 冷启动时间：< 30 秒（仅首次）

## 🔧 优化功能

- ✅ GitHub Actions 定时 Ping（每 10 分钟）
- ✅ 自动避免冷启动
- ✅ 自动构建和部署
- ✅ 实时日志监控

## 📝 下一步

1. ✅ 分享应用给测试用户
2. ✅ 收集用户反馈
3. ✅ 监控应用性能
4. ✅ 持续优化功能
5. ✅ 3 个月后评估是否迁移到国内

## 🆘 需要帮助？

如果遇到问题，请：

1. 查看 [DEPLOYMENT_VERCEL_RENDER.md](./DEPLOYMENT_VERCEL_RENDER.md) 详细指南
2. 查看 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) 检查清单
3. 查看 [DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md) 快速参考
4. 检查平台日志（Vercel Dashboard / Render Dashboard）

## 🎯 关键提醒

### ⚠️ 重要注意事项

1. **选择新加坡区域**：在 Render 部署时，必须选择 **Singapore** 区域，以获得更好的访问速度
2. **环境变量配置**：所有环境变量都必须正确配置，否则应用无法正常运行
3. **API 密钥安全**：不要将 API 密钥泄露给他人
4. **监控日志**：定期查看 Render 和 Vercel 日志，及时发现问题

### ✅ 成功标志

部署成功后，您应该能够：

- ✅ 访问前端页面（https://tcm-smart-diagnosis.vercel.app）
- ✅ 注册新用户
- ✅ 登录系统
- ✅ 创建患者
- ✅ 生成健康方案
- ✅ 查看病历

---

**开始部署吧！祝您部署顺利！** 🚀

**预计总耗时：45 分钟 - 1 小时**
