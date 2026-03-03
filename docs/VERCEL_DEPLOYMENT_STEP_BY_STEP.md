# 在 Vercel 部署前端 - 完整指南

## 📋 前置条件

在开始部署之前，请确保已完成：

- [x] 代码已推送到 GitHub（如果未完成，请先执行 `git push origin main`）
- [x] 后端 API 已部署到 Render
- [x] Render 环境变量已配置完成

## 🚀 部署步骤

### 步骤 1：登录 Vercel

1. 访问：https://vercel.com
2. 点击右上角的 **"Login"**
3. 使用 GitHub 账号登录（推荐）
4. 点击 **"Continue with GitHub"**
5. 授权 Vercel 访问你的 GitHub 账号

### 步骤 2：创建新项目

1. 登录后，点击右上角的 **"Add New"** 按钮
2. 选择 **"Project"**

### 步骤 3：导入 GitHub 仓库

1. 在 **"Import Git Repository"** 页面
2. 找到 `tcm-smart-diagnosis` 仓库
3. 如果没找到，点击 **"View All"** 搜索
4. 点击仓库右侧的 **"Import"** 按钮

### 步骤 4：配置项目

在 **"Configure Project"** 页面，填写以下信息：

#### 4.1 项目名称

**Project Name**:
```
tcm-smart-diagnosis
```

#### 4.2 构建配置

**Framework Preset**:
```
Other
```

**Root Directory**:
```
./
```

**Build Command**:
```
npm install --legacy-peer-deps && npm run build:web
```

**Install Command**:
```
npm install --legacy-peer-deps
```

**Output Directory**:
```
dist-web
```

### 步骤 5：配置环境变量

在 **"Environment Variables"** 部分，添加以下环境变量：

#### 环境变量 1：NODE_ENV

- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environment**: Production, Preview, Development
- 点击 **"Add"**

#### 环境变量 2：PROJECT_DOMAIN

- **Name**: `PROJECT_DOMAIN`
- **Value**: `https://tcm-smart-diagnosis-api.onrender.com`
- **Environment**: Production, Preview, Development
- 点击 **"Add"**

### 步骤 6：部署项目

1. 检查所有配置是否正确
2. 点击页面底部的 **"Deploy"** 按钮
3. 等待部署完成（通常需要 1-3 分钟）

### 步骤 7：查看部署结果

部署完成后，你会看到：

- ✅ **Deployed Successfully**: 部署成功
- 📦 **Deployment URL**: `https://tcm-smart-diagnosis.vercel.app`
- 🔗 **Live URL**: `https://tcm-smart-diagnosis.vercel.app`

---

## 🧪 验证部署

### 测试 1：访问首页

在浏览器中打开：
```
https://tcm-smart-diagnosis.vercel.app
```

**预期结果**：
- 页面正常加载
- 显示首页内容
- 没有 404 或 500 错误

### 测试 2：测试用户注册

1. 访问注册页面：`https://tcm-smart-diagnosis.vercel.app/pages/register/index`
2. 填写注册信息：
   - 用户名：`testuser123`
   - 密码：`123456`
   - 确认密码：`123456`
   - 角色：选择"个体用户"
3. 点击"注册"按钮

**预期结果**：
- 注册成功
- 自动跳转到首页
- 显示用户信息

### 测试 3：测试智能诊疗

1. 登录后，点击"智能诊疗"
2. 输入症状描述
3. 开始 AI 问询

**预期结果**：
- AI 开始问询
- 能够回答问题
- 能够生成诊断和处方

### 测试 4：测试充值功能

1. 登录后，点击"充值服务"
2. 选择套餐
3. 查看收款二维码

**预期结果**：
- 显示套餐列表
- 选择套餐后显示收款二维码
- 收款码可以正常显示

---

## 🔧 故障排除

### 问题 1：部署失败 - Build Error

**错误信息**：
```
Build failed: Error: Cannot find module
```

**解决方案**：
1. 检查 `Build Command` 是否正确
2. 确认 `Install Command` 包含 `--legacy-peer-deps`
3. 查看 Build Log 中的详细错误信息

### 问题 2：部署失败 - Output Directory Error

**错误信息**：
```
Output directory not found: dist/h5
```

**解决方案**：
1. 确认 `Output Directory` 设置为 `dist-web`（不是 `dist/h5`）
2. 重新部署项目

### 问题 3：前端无法连接后端

**错误信息**：
```
Network Error: Failed to fetch
```

**解决方案**：
1. 检查 `PROJECT_DOMAIN` 环境变量是否正确
2. 确认后端 API 正常运行
3. 打开浏览器开发者工具，查看 Network 请求
4. 检查 CORS 配置

### 问题 4：页面 404 Not Found

**错误信息**：
```
404 Not Found
```

**解决方案**：
1. 确认 `Output Directory` 正确
2. 检查路由配置
3. 查看 Vercel 日志

### 问题 5：资源加载失败

**错误信息**：
```
Failed to load resource: the server responded with a status of 404
```

**解决方案**：
1. 检查 `public/icons/` 目录是否存在
2. 确认 `public/manifest.json` 文件存在
3. 重新部署项目

---

## 📊 部署后配置

### 配置自定义域名（可选）

#### 步骤 1：购买域名

推荐平台：
- 阿里云：https://wanwang.aliyun.com/
- 腾讯云：https://dnspod.cloud.tencent.com/
- Namecheap：https://www.namecheap.com/

#### 步骤 2：在 Vercel 添加域名

1. 访问 Vercel Dashboard
2. 找到 `tcm-smart-diagnosis` 项目
3. 点击 **"Settings"**
4. 点击 **"Domains"**
5. 输入你的域名（例如：`tcm.yourclinic.com`）
6. 点击 **"Add"**

#### 步骤 3：配置 DNS

Vercel 会显示需要添加的 DNS 记录：

```
Type: CNAME
Name: tcm
Value: cname.vercel-dns.com
```

在域名注册商处添加此记录。

#### 步骤 4：等待 DNS 生效

DNS 生效通常需要：
- 最快：10 分钟
- 通常：1-2 小时
- 最慢：24 小时

### 配置监控（可选）

#### 步骤 1：启用 Analytics

1. 访问 Vercel Dashboard
2. 找到 `tcm-smart-diagnosis` 项目
3. 点击 **"Analytics"**
4. 点击 **"Enable Analytics"**

#### 步骤 2：查看访问数据

- 访问量统计
- 用户地理分布
- 页面访问数据

---

## ✅ 部署成功标志

部署成功后，你应该能够：

- ✅ 访问 `https://tcm-smart-diagnosis.vercel.app`
- ✅ 注册新用户
- ✅ 登录系统
- ✅ 使用智能诊疗功能
- ✅ 进行充值操作
- ✅ 访问管理员功能（使用管理员账号）

---

## 🎯 下一步

部署成功后：

1. **分享链接**：将 Vercel URL 分享给用户
2. **配置域名**：可选，配置自定义域名
3. **监控性能**：查看 Analytics 了解访问情况
4. **收集反馈**：收集用户反馈，持续优化

---

## 📚 相关文档

- **Vercel 部署完整指南**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **部署后访问指南**: `POST_DEPLOYMENT_ACCESS_GUIDE.md`
- **Render 环境变量配置**: `docs/RENDER_ENV_VAR_CONFIG.md`
- **项目状态报告**: `PROJECT_STATUS_REPORT.md`

---

**部署完成后，请继续执行下一步：验证部署**
