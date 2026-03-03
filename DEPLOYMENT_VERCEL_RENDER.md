# Vercel + Render 免费部署完整指南

## 🎯 部署方案

- **前端**：Vercel（永久免费）
- **后端**：Render（永久免费，750 小时/月）
- **数据库**：Supabase（永久免费）
- **总费用**：$0/月

## 📋 部署前检查清单

### 必需准备

- [x] GitHub 账户（免费）
- [x] Vercel 账户（免费，已获得批准）
- [x] Render 账户（免费）
- [x] Supabase 账户（免费）
- [x] Coze API Key（用于 AI 功能）

### 项目配置检查

- [x] `vercel.json` 已配置
- [x] `package.json` 构建脚本正确
- [x] 环境变量配置文档齐全
- [x] 代码已提交到 GitHub

## 🚀 部署步骤

### 第一阶段：准备 GitHub 仓库（5 分钟）

#### 步骤 1.1：初始化 Git 仓库

```bash
# 在项目根目录执行
cd /workspace/projects

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "准备部署到 Vercel + Render

- 优化 vercel.json 配置
- 添加部署文档
- 修复免费期限显示（3天）
- 配置环境变量模板"
```

#### 步骤 1.2：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - Repository name: `tcm-smart-diagnosis`
   - Description: `中医智能健康小程序`
   - Public/Private: 选择 **Private**（推荐）
3. 点击 **"Create repository"**

#### 步骤 1.3：推送代码到 GitHub

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/tcm-smart-diagnosis.git

# 推送代码
git branch -M main
git push -u origin main
```

**注意**：将 `YOUR_USERNAME` 替换为您的 GitHub 用户名

### 第二阶段：部署前端到 Vercel（10 分钟）

#### 步骤 2.1：登录 Vercel

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 **"Add New..."** → **"Project"**

#### 步骤 2.2：导入 GitHub 仓库

1. 在 "Import Git Repository" 中找到 `tcm-smart-diagnosis`
2. 点击 **"Import"**

#### 步骤 2.3：配置项目设置

**Framework Preset**: `Other`

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

#### 步骤 2.4：配置环境变量

在 **Environment Variables** 中添加：

**必需**：
```
名称: PROJECT_DOMAIN
值: https://your-api.onrender.com
环境: Production, Preview, Development
```

**注意**：`your-api.onrender.com` 会在部署后端后获得，暂时可以先不设置，后端部署后再回来配置。

#### 步骤 2.5：开始部署

1. 点击 **"Deploy"**
2. 等待构建完成（约 2-3 分钟）
3. 构建成功后，您将获得 Vercel 预览地址：
   ```
   https://tcm-smart-diagnosis.vercel.app
   ```

#### 步骤 2.6：记录 Vercel 域名

请记录以下信息（后续会用到）：
```
Vercel Production URL: https://tcm-smart-diagnosis.vercel.app
```

### 第三阶段：部署后端到 Render（15 分钟）

#### 步骤 3.1：登录 Render

1. 访问 https://dashboard.render.com
2. 使用 GitHub 账号登录
3. 点击 **"New +"** → **"Web Service"**

#### 步骤 3.2：连接 GitHub 仓库

1. 在 "Connect a repository" 中找到 `tcm-smart-diagnosis`
2. 点击 **"Connect"**

#### 步骤 3.3：配置基本信息

**Name**:
```
tcm-smart-diagnosis-api
```

**Region**:
```
Singapore (推荐，访问速度快)
或
Oregon (美西)
```

#### 步骤 3.4：配置构建和运行

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
Free (默认)
```

#### 步骤 3.5：配置环境变量（重要！）

在 **Environment Variables** 部分添加以下变量：

**Supabase 配置**（必需）：
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Coze AI 配置**（必需）：
```
COZE_API_KEY=your_coze_api_key
COZE_API_SECRET=your_coze_api_secret
```

**JWT 配置**（必需）：
```
JWT_SECRET=your_random_secret_string_at_least_32_characters_long
```

**其他配置**（可选）：
```
NODE_ENV=production
PORT=3000
```

**如何获取这些值**：

##### Supabase 配置

1. 访问 https://supabase.com
2. 创建新项目（或使用现有项目）
3. 进入 **Settings** → **API**
4. 复制以下值：
   - **Project URL**: `SUPABASE_URL`
   - **service_role key**: `SUPABASE_SERVICE_ROLE_KEY`

##### Coze AI 配置

1. 访问 https://www.coze.cn
2. 进入 **开发** → **API 管理**
3. 创建或复制 API Key 和 Secret
4. 复制以下值：
   - **Personal Access Token**: `COZE_API_KEY`
   - **Secret Key**: `COZE_API_SECRET`

##### JWT Secret

生成一个随机字符串：
```bash
# 在终端执行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制生成的字符串作为 `JWT_SECRET`

#### 步骤 3.6：开始部署

1. 点击 **"Create Web Service"**
2. 等待构建完成（约 3-5 分钟）
3. 构建成功后，您将获得 Render 域名：
   ```
   https://tcm-smart-diagnosis-api.onrender.com
   ```

#### 步骤 3.7：记录 Render 域名

请记录以下信息：
```
Render API URL: https://tcm-smart-diagnosis-api.onrender.com
```

### 第四阶段：连接前后端（5 分钟）

#### 步骤 4.1：更新 Vercel 环境变量

1. 访问 Vercel Dashboard
2. 进入项目 **Settings** → **Environment Variables**
3. 找到 `PROJECT_DOMAIN` 变量
4. 更新值为：
   ```
   https://tcm-smart-diagnosis-api.onrender.com
   ```
5. 确保选择了所有环境（Production, Preview, Development）
6. 点击 **"Save"**

#### 步骤 4.2：重新部署 Vercel

1. 进入 Vercel 项目 Dashboard
2. 点击 **"Deployments"**
3. 点击最新的部署记录
4. 点击 **"Redeploy"**
5. 等待重新部署完成（约 1-2 分钟）

### 第五阶段：测试和验证（10 分钟）

#### 步骤 5.1：测试后端 API

在浏览器或使用 curl 测试：

```bash
# 测试健康检查
curl https://tcm-smart-diagnosis-api.onrender.com

# 测试用户注册
curl -X POST https://tcm-smart-diagnosis-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456",
    "role": "individual"
  }'
```

**预期结果**：
- 健康检查：返回 `{ "status": "ok" }`
- 注册：返回用户信息和 token

#### 步骤 5.2：测试前端

1. 访问 Vercel 部署地址：
   ```
   https://tcm-smart-diagnosis.vercel.app
   ```

2. 测试功能：
   - ✅ 页面正常加载
   - ✅ 用户注册功能正常
   - ✅ 用户登录功能正常
   - ✅ 智能健康咨询功能正常
   - ✅ AI 问询功能正常

#### 步骤 5.3：测试完整流程

1. **注册新用户**
   - 点击"扫码注册"或"手机号注册"
   - 填写注册信息
   - 提交注册

2. **登录系统**
   - 使用注册的账号登录
   - 验证登录成功

3. **创建患者**
   - 进入"患者管理"
   - 点击"添加患者"
   - 填写患者信息
   - 保存

4. **生成健康方案**
   - 选择患者
   - 填写症状信息
   - 点击"生成健康方案"
   - 等待 AI 处理
   - 查看生成的处方

5. **查看病历**
   - 进入"病历管理"
   - 查看已创建的病历
   - 验证数据正确保存

## 🔧 故障排除

### 问题 1：Vercel 构建失败

**错误信息**：`Build failed`

**解决方案**：
1. 检查 Vercel 构建日志
2. 确认 `package.json` 中的脚本正确
3. 尝试在本地运行 `pnpm build:web` 验证
4. 检查依赖是否完整

### 问题 2：Render 构建失败

**错误信息**：`Build failed` 或 `Start command failed`

**解决方案**：
1. 检查 Render 构建日志
2. 确认 `Root Directory` 设置为 `server`
3. 验证 `package.json` 中的脚本：
   ```json
   {
     "scripts": {
       "build": "nest build",
       "start:prod": "node dist/main"
     }
   }
   ```
4. 检查环境变量是否正确配置

### 问题 3：前端无法连接后端

**错误信息**：`Network Error` 或 `502 Bad Gateway`

**解决方案**：
1. 确认 `PROJECT_DOMAIN` 环境变量正确
2. 测试后端 API 是否可访问：
   ```bash
   curl https://your-api.onrender.com/api/health
   ```
3. 检查 Render 日志是否有错误
4. 确认 CORS 配置正确

### 问题 4：AI 功能无响应

**错误信息**：`AI service error` 或 `timeout`

**解决方案**：
1. 检查 Coze API Key 是否正确
2. 验证 API Key 是否有足够的权限
3. 检查 Render 日志中的 AI 调用错误
4. 确认网络连接正常

### 问题 5：数据库连接失败

**错误信息**：`Database connection failed`

**解决方案**：
1. 确认 Supabase URL 和 Key 正确
2. 验证 Supabase 项目是否正常
3. 检查 Supabase 日志
4. 确认数据库表结构正确

## 📊 监控和维护

### 查看日志

#### Vercel 日志

1. 访问 Vercel Dashboard
2. 进入项目
3. 点击 **"Deployments"**
4. 选择部署记录
5. 点击 **"Logs"**

#### Render 日志

1. 访问 Render Dashboard
2. 进入服务
3. 点击 **"Logs"**
4. 实时查看日志流

### 自动化维护

#### 定时 Ping（避免冷启动）

创建 GitHub Actions 工作流：

文件：`.github/workflows/keep-alive.yml`

```yaml
name: Keep Render Warm

on:
  schedule:
    - cron: '*/10 * * * *'  # 每 10 分钟执行一次

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping API
        run: |
          curl https://tcm-smart-diagnosis-api.onrender.com/api/health
```

提交并推送：

```bash
git add .github/workflows/keep-alive.yml
git commit -m "添加定时 Ping 避免冷启动"
git push origin main
```

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

### 环境变量配置

**Vercel 环境变量**：
```
PROJECT_DOMAIN=https://tcm-smart-diagnosis-api.onrender.com
```

**Render 环境变量**：
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
COZE_API_KEY=your_coze_api_key
COZE_API_SECRET=your_coze_api_secret
JWT_SECRET=your_jwt_secret
```

### 下一步

1. ✅ 分享应用给用户
2. ✅ 收集用户反馈
3. ✅ 监控应用性能
4. ✅ 持续优化功能
5. ✅ 推广应用

## 💰 成本总结

| 项目 | 月费用 | 年费用 |
|------|--------|--------|
| Vercel 前端 | $0 | $0 |
| Render 后端 | $0 | $0 |
| Supabase 数据库 | $0 | $0 |
| **总计** | **$0** | **$0** |

**完全免费！** 🎉

## 📚 相关文档

- [Vercel 完整部署指南](./VERCEL_DEPLOYMENT.md)
- [Vercel 快速开始](./VERCEL_QUICK_START.md)
- [部署后访问指南](./POST_DEPLOYMENT_ACCESS_GUIDE.md)
- [Render 官方文档](https://render.com/docs)

## 🆘 需要帮助？

- 查看 Vercel 和 Render 官方文档
- 检查 GitHub Issues
- 查看 FAQ 部分
- 联系技术支持

---

**祝部署顺利！** 🚀
