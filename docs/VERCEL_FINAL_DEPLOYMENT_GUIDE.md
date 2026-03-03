# 🚀 Vercel 部署指南 - 生产环境最后一步

## 📋 前置条件检查清单

在开始部署前，请确认以下条件：

- [x] ✅ 代码已推送到 GitHub（50 个新提交）
- [x] ✅ Render 后端已部署并运行正常（`https://tcm-smart-diagnosis.onrender.com`）
- [x] ✅ Supabase 数据库已配置
- [x] ✅ 环境变量已配置（在 `.env` 中）
- [ ] ⚠️ **待执行：推送代码到 GitHub**
- [ ] ⚠️ **待执行：Vercel 部署或更新**

---

## 🔍 检查 GitHub 仓库状态

### 步骤 1：访问 GitHub 仓库

访问：https://github.com/superdxhua/tcm-smart-diagnosis

**检查要点**：
- 仓库是否存在
- 最后提交时间是否为今天
- 最新提交是否为：`docs: 更新部署指南，明确推送代码是必需步骤`

### 步骤 2：确认代码已推送

如果 GitHub 仓库的最新提交不是 `74753e3`，说明代码还未推送。

**请先执行推送**：参考 `docs/PUSH_TO_GITHUB_GUIDE.md`

---

## 🎯 Vercel 部署流程

### 场景 1：已有项目更新（推荐）⭐

如果 Vercel 上已有 `tcm-smart-diagnosis` 项目，直接更新即可。

#### 步骤 1：访问 Vercel 控制台

1. 访问：https://vercel.com/dashboard
2. 登录你的账户
3. 找到 `tcm-smart-diagnosis` 项目

#### 步骤 2：检查当前部署状态

**检查要点**：
- 当前部署的 Commit ID
- 构建状态（Success / Failed）
- 域名信息（例如：`tcm-smart-diagnosis.vercel.app`）

#### 步骤 3：重新部署

**方式 A：点击 "Redeploy" 按钮（最简单）**

1. 在项目页面，点击 **"Deployments"** 标签
2. 找到最新的部署记录
3. 点击右侧的 **"..."** 菜单
4. 选择 **"Redeploy"**

**方式 B：推送新提交触发自动部署**

1. 在本地推送到 GitHub
2. Vercel 会自动检测到新提交
3. 自动触发新的部署

#### 步骤 4：配置环境变量

1. 在项目页面，点击 **"Settings"** 标签
2. 点击 **"Environment Variables"**
3. 添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PROJECT_DOMAIN` | `https://tcm-smart-diagnosis.onrender.com` | 后端 API 地址 |
| `VITE_SUPABASE_URL` | 从 Supabase 获取 | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | 从 Supabase 获取 | Supabase 匿名密钥 |

4. 点击 **"Save"**

#### 步骤 5：重新部署以应用环境变量

配置环境变量后，需要重新部署才能生效：

1. 点击 **"Deployments"** 标签
2. 点击 **"Redeploy"**
3. 等待部署完成

---

### 场景 2：创建新项目（如果没有现有项目）

如果 Vercel 上没有 `tcm-smart-diagnosis` 项目，需要创建一个新项目。

#### 步骤 1：导入项目到 Vercel

1. 访问：https://vercel.com/dashboard
2. 点击 **"Add New..."** → **"Project"**
3. Vercel 会自动检测你的 GitHub 仓库
4. 找到 `tcm-smart-diagnosis` 仓库
5. 点击 **"Import"**

#### 步骤 2：配置构建设置

**Framework Preset**：
- 选择 **"Other"**

**Build and Output Settings**：
- **Root Directory**: `./`
- **Build Command**: `npm run build:web`
- **Output Directory**: `dist/h5`
- **Install Command**: `npm install --legacy-peer-deps`

#### 步骤 3：配置环境变量

在 **"Environment Variables"** 部分添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PROJECT_DOMAIN` | `https://tcm-smart-diagnosis.onrender.com` | 后端 API 地址 |
| `VITE_SUPABASE_URL` | 从 Supabase 获取 | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | 从 Supabase 获取 | Supabase 匿名密钥 |

#### 步骤 4：部署

1. 点击 **"Deploy"**
2. 等待构建完成（通常需要 2-5 分钟）
3. 部署成功后，会显示一个 `.vercel.app` 域名

#### 步骤 5：访问应用

复制 Vercel 提供的域名，例如：

```
https://tcm-smart-diagnosis.vercel.app
```

在浏览器中访问，验证应用是否正常运行。

---

## ✅ 部署验证清单

部署完成后，请验证以下项目：

### 基础功能验证

- [ ] 页面能正常加载（无白屏）
- [ ] 能正常登录/注册
- [ ] 能访问智能诊疗功能
- [ ] API 请求正常（网络请求无 404/500 错误）

### PWA 功能验证

- [ ] 在 Android 浏览器中打开，能看到"添加到主屏幕"提示
- [ ] 添加到主屏幕后，能以全屏模式打开
- [ ] 图标显示正常
- [ ] iOS 设备能通过 Safari 添加到主屏幕

### 网络请求验证

- [ ] 打开浏览器开发者工具（F12）
- [ ] 切换到 **"Network"** 标签
- [ ] 观察请求是否发送到正确的后端地址（`https://tcm-smart-diagnosis.onrender.com/api/...`）
- [ ] 检查是否有 CORS 错误

### 移动端验证

- [ ] 在手机浏览器中打开
- [ ] 页面布局是否正常
- [ ] 触摸交互是否流畅
- [ ] 键盘弹出时页面是否正常显示

---

## 🔧 常见问题排查

### 问题 1：构建失败

**症状**：
```
Error: Build failed
```

**解决方案**：
1. 检查 `Build Command` 是否为 `npm run build:web`
2. 检查 `Output Directory` 是否为 `dist/h5`
3. 检查 `Install Command` 是否为 `npm install --legacy-peer-deps`
4. 查看构建日志，定位具体错误

### 问题 2：部署后页面白屏

**症状**：
页面加载成功，但显示空白

**解决方案**：
1. 检查控制台是否有 JavaScript 错误
2. 检查 `PROJECT_DOMAIN` 环境变量是否正确配置
3. 检查网络请求是否成功（F12 → Network）
4. 清除浏览器缓存后重试

### 问题 3：API 请求 404 错误

**症状**：
```
GET https://tcm-smart-diagnosis.vercel.app/api/xxx 404 (Not Found)
```

**解决方案**：
1. 检查 `PROJECT_DOMAIN` 环境变量是否正确
2. 应该是 `https://tcm-smart-diagnosis.onrender.com`（后端地址）
3. 重新配置环境变量并重新部署

### 问题 4：CORS 错误

**症状**：
```
Access to fetch at 'https://tcm-smart-diagnosis.onrender.com/api/...' from origin 'https://tcm-smart-diagnosis.vercel.app' has been blocked by CORS policy
```

**解决方案**：
1. 检查后端 `main.ts` 中的 CORS 配置
2. 确认已添加 Vercel 域名到 CORS 白名单
3. 重新部署后端

### 问题 5：PWA 功能不生效

**症状**：
没有"添加到主屏幕"提示

**解决方案**：
1. 检查 `public/manifest.json` 是否存在
2. 检查 `index.html` 中是否引用了 manifest
3. 检查 PWA 图标是否生成（`public/icons/` 目录）
4. 清除浏览器缓存后重试

---

## 📊 部署成功后的架构

部署完成后，应用架构如下：

```
用户
  ↓
Vercel (前端 H5)
  - https://tcm-smart-diagnosis.vercel.app
  - 或自定义域名
  ↓
Render (后端 API)
  - https://tcm-smart-diagnosis.onrender.com
  ↓
Supabase (数据库)
  - 存储用户、病历、权限等数据
```

---

## 🎯 后续优化建议

部署成功后，可以考虑以下优化：

### 1. 自定义域名

1. 在 Vercel 项目中，点击 **"Settings"** → **"Domains"**
2. 添加自定义域名（例如：`tcm.yourdomain.com`）
3. 按照提示配置 DNS

### 2. CDN 加速

Vercel 默认提供全球 CDN，无需额外配置。

### 3. 性能监控

1. 在 Vercel 中启用 **"Analytics"**
2. 查看页面加载时间、用户访问量等数据

### 4. 错误监控

1. 集成 Sentry 或其他错误监控服务
2. 实时捕获和追踪线上错误

### 5. SEO 优化

1. 配置 `index.html` 中的 meta 标签
2. 添加 sitemap
3. 优化页面标题和描述

---

## 📞 部署完成检查清单

部署完成后，请确保：

- [x] ✅ 代码已推送到 GitHub
- [x] ✅ Vercel 项目已部署/更新
- [x] ✅ 环境变量已正确配置
- [x] ✅ 页面能正常加载
- [x] ✅ 基础功能正常（登录、诊疗等）
- [x] ✅ 网络请求正常（API 调用成功）
- [x] ✅ PWA 功能正常（能添加到主屏幕）
- [x] ✅ 移动端显示正常

---

## 🎉 部署完成！

恭喜！中医智能诊疗小程序已成功部署到生产环境！

**访问地址**：
- H5 版本：`https://tcm-smart-diagnosis.vercel.app`
- 后端 API：`https://tcm-smart-diagnosis.onrender.com`

**下一步**：
- 分享给用户使用
- 收集用户反馈
- 根据反馈优化功能

---

**如有任何问题，请参考部署文档或联系技术支持！** 🚀
