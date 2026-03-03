# 🚀 Vercel 部署操作指南（已有项目）

## 📋 情况说明

如果 Vercel 上已经有 `tcm-smart-diagnosis` 或 `zhongyi-smart` 项目，直接使用现有项目即可，无需重新创建。

---

## 🔍 检查是否已有项目

### 方法 1：查看 Vercel Dashboard

1. 访问：https://vercel.com/dashboard
2. 查看项目列表中是否有以下项目之一：
   - `tcm-smart-diagnosis`
   - `zhongyi-smart`

### 方法 2：查看 Vercel 配置文件

项目中 `vercel.json` 显示的项目名称是：`zhongyi-smart`

---

## ✅ 如果已有项目，执行以下操作

### 步骤 1：进入项目设置

1. 在 Vercel Dashboard 中找到项目
2. 点击项目名称进入项目详情
3. 点击顶部的 **"Settings"** 标签

### 步骤 2：配置环境变量

1. 在左侧菜单中，找到 **"Environment Variables"**
2. 点击 **"Add New"** 按钮

#### 环境变量 1：NODE_ENV

- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environments**: 勾选 **Production**、**Preview**、**Development**
- 点击 **"Save"**

#### 环境变量 2：PROJECT_DOMAIN

- **Name**: `PROJECT_DOMAIN`
- **Value**: `https://tcm-smart-diagnosis-api.onrender.com`
- **Environments**: 勾选 **Production**、**Preview**、**Development**
- 点击 **"Save"**

### 步骤 3：配置构建设置（如需要）

1. 在左侧菜单中，找到 **"Build & Development Settings"**
2. 检查以下配置是否正确：

| 配置项 | 正确值 |
|--------|--------|
| **Build Command** | `npm install --legacy-peer-deps && npm run build:web` |
| **Install Command** | `npm install --legacy-peer-deps` |
| **Output Directory** | `dist-web` |

如果配置不正确，点击 **"Edit"** 修改，然后点击 **"Save"**。

### 步骤 4：重新部署项目

1. 点击顶部的 **"Deployments"** 标签
2. 找到最新的部署记录
3. 点击右侧的 **"..."** 菜单
4. 选择 **"Redeploy"**
5. 勾选 **"Clear build cache"**
6. 点击 **"Redeploy"** 按钮
7. 等待部署完成（1-3 分钟）

### 步骤 5：验证部署

部署完成后：

1. 点击部署记录中的 URL
2. 检查页面是否正常加载
3. 测试核心功能

---

## 🆕 如果没有项目，创建新项目

### 步骤 1：登录 Vercel

1. 访问：https://vercel.com
2. 使用 GitHub 账号登录

### 步骤 2：创建新项目

1. 点击右上角的 **"Add New"** 按钮
2. 选择 **"Project"**

### 步骤 3：导入 GitHub 仓库

1. 在 **"Import Git Repository"** 页面
2. 找到 `tcm-smart-diagnosis` 或 `superdxhua/tcm-smart-diagnosis` 仓库
3. 点击 **"Import"**

### 步骤 4：配置项目

#### 基本配置

| 配置项 | 值 |
|--------|-----|
| **Project Name** | `tcm-smart-diagnosis` 或 `zhongyi-smart` |
| **Framework Preset** | `Other` |
| **Root Directory** | `./` |

#### 构建配置

| 配置项 | 值 |
|--------|-----|
| **Build Command** | `npm install --legacy-peer-deps && npm run build:web` |
| **Install Command** | `npm install --legacy-peer-deps` |
| **Output Directory** | `dist-web` |

#### 环境变量

| 名称 | 值 | Environments |
|------|-----|-------------|
| `NODE_ENV` | `production` | Production, Preview, Development |
| `PROJECT_DOMAIN` | `https://tcm-smart-diagnosis-api.onrender.com` | Production, Preview, Development |

### 步骤 5：部署项目

1. 检查所有配置
2. 点击 **"Deploy"** 按钮
3. 等待部署完成（1-3 分钟）

---

## 🧪 验证部署

### 测试 1：访问首页

在浏览器中打开：
```
https://tcm-smart-diagnosis.vercel.app
```

或

```
https://zhongyi-smart.vercel.app
```

**预期结果**：
- ✅ 页面正常加载
- ✅ 显示首页内容

### 测试 2：测试用户注册

1. 访问注册页面
2. 填写注册信息
3. 点击注册

**预期结果**：
- ✅ 注册成功
- ✅ 自动跳转到首页

### 测试 3：测试智能诊疗

1. 登录后，点击"智能诊疗"
2. 输入症状描述
3. 开始 AI 问询

**预期结果**：
- ✅ AI 开始问询
- ✅ 能够回答问题

### 测试 4：测试充值功能

1. 登录后，点击"充值服务"
2. 选择套餐
3. 查看收款二维码

**预期结果**：
- ✅ 显示套餐列表
- ✅ 选择套餐后显示收款二维码

---

## 🔧 常见问题

### 问题 1：环境变量已存在但值不正确

**解决方案**：
1. 找到环境变量
2. 点击右侧的 **"Edit"** 按钮
3. 修改值
4. 点击 **"Save"**
5. 重新部署项目

### 问题 2：Output Directory 配置错误

**症状**：部署成功但访问显示 404

**解决方案**：
1. 进入 **"Settings"** → **"Build & Development Settings"**
2. 修改 **"Output Directory"** 为 `dist-web`
3. 重新部署项目

### 问题 3：构建失败

**症状**：部署失败，显示 Build Error

**解决方案**：
1. 检查 **"Build Command"** 是否正确
2. 确认包含 `--legacy-peer-deps`
3. 查看 Build Log 中的错误信息

---

## ✅ 完成标志

部署成功后，你应该能够：

- ✅ 访问 Vercel 提供的 URL
- ✅ 注册新用户
- ✅ 登录系统
- ✅ 使用智能诊疗功能
- ✅ 进行充值操作
- ✅ 访问管理员功能

---

## 📚 相关文档

- **Render 环境变量配置**: `docs/RENDER_ENV_VAR_CONFIG.md`
- **部署后访问指南**: `POST_DEPLOYMENT_ACCESS_GUIDE.md`
- **项目状态报告**: `PROJECT_STATUS_REPORT.md`

---

**操作完成后，请继续执行验证步骤**
