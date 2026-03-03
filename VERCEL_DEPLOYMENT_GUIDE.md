# 🚀 Vercel 部署完整指南

## 🎯 5 分钟快速部署

---

## 📋 前置条件

1. ✅ GitHub 账号（如果还没有，先注册）
2. ✅ 项目已上传到 GitHub
3. ✅ Vercel 账号（使用 GitHub 账号注册）

---

## 📝 第一步：上传项目到 GitHub

### 如果项目已经在 GitHub

跳过这一步，直接进行第二步。

### 如果项目不在 GitHub

#### 方法 A：使用 GitHub Desktop（推荐，简单）

1. **下载 GitHub Desktop**
   - 访问：https://desktop.github.com/
   - 下载并安装

2. **创建新仓库**
   - 打开 GitHub Desktop
   - 点击"File" → "New Repository"
   - 输入仓库名：`tcm-smart-diagnosis`
   - 选择项目路径：`/workspace/projects`
   - 点击"Create Repository"

3. **发布到 GitHub**
   - 点击"Publish Repository"
   - 选择"Publish to GitHub"
   - 输入仓库名：`tcm-smart-diagnosis`
   - 点击"Publish Repository"

#### 方法 B：使用命令行（适合有经验的开发者）

1. **在 GitHub 上创建新仓库**
   - 访问：https://github.com/new
   - 仓库名：`tcm-smart-diagnosis`
   - 选择 Public 或 Private
   - 点击"Create repository"

2. **初始化 Git 并推送**

```bash
cd /workspace/projects

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/tcm-smart-diagnosis.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

## 🌐 第二步：注册 Vercel

1. **访问 Vercel**
   - 网址：https://vercel.com/

2. **注册账号**
   - 点击"Sign Up"
   - 选择"Continue with GitHub"
   - 授权 Vercel 访问你的 GitHub

3. **完成注册**
   - 输入用户名
   - 选择团队（个人）
   - 点击"Continue"

---

## 🚀 第三步：导入项目到 Vercel

1. **登录 Vercel**
   - 网址：https://vercel.com/dashboard

2. **导入项目**
   - 点击"Add New" → "Project"
   - 在"Import Git Repository"中找到你的项目
   - 点击"Import"

3. **配置项目**

**Project Name**：
```
tcm-smart-diagnosis
```

**Framework Preset**：
```
选择 "Other"
```

**Build Command**：
```
pnpm install && pnpm build:web
```

**Output Directory**：
```
dist/h5
```

**Install Command**：
```
pnpm install
```

**Environment Variables**（可选，如果需要连接后端）：
```
PROJECT_DOMAIN=http://your-backend-server.com
```

4. **部署**
   - 点击"Deploy"
   - 等待 1-2 分钟
   - 部署成功！

---

## ✨ 第四步：访问你的网站

### 部署成功后，你会得到一个地址：

```
https://tcm-smart-diagnosis.vercel.app
```

### 访问首页：
```
https://tcm-smart-diagnosis.vercel.app
```

### 访问下载页面：
```
https://tcm-smart-diagnosis.vercel.app/pages/download/index
```

### 手机访问：
直接在手机浏览器输入上述地址即可！

---

## 🔧 第五步：配置自定义域名（可选）

### 方法 A：使用 Vercel 子域名（免费）

1. 在 Vercel 控制台找到你的项目
2. 点击"Settings"
3. 点击"Domains"
4. 输入你想要的子域名，如：
   ```
   my-tcm-app.vercel.app
   ```
5. 点击"Add"

### 方法 B：使用自己的域名（需要购买域名）

1. **购买域名**
   - 推荐平台：阿里云、腾讯云、Namecheap、GoDaddy

2. **在 Vercel 添加域名**
   - 点击"Settings" → "Domains"
   - 输入你的域名，如：`tcm-diagnosis.com`
   - 点击"Add"

3. **配置 DNS**
   - Vercel 会显示需要添加的 DNS 记录
   - 在域名注册商处添加这些记录
   - 等待 DNS 生效（通常 10 分钟 - 24 小时）

4. **自动 HTTPS**
   - Vercel 会自动配置 HTTPS 证书
   - 等待证书生成（通常几分钟）

---

## 🔄 自动部署

### 触发自动部署的方式

1. **推送到 GitHub**
   - 当你推送代码到 GitHub 时，Vercel 会自动重新部署

2. **推送标签**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   - Vercel 会为每个标签创建一个生产部署

3. **手动触发**
   - 在 Vercel 控制台点击"Redeploy"

### 查看部署日志

1. 在 Vercel 控制台找到你的项目
2. 点击"Deployments"
3. 点击任意部署记录
4. 查看"Build Logs"

---

## 📱 手机访问

### 访问步骤

1. **手机打开浏览器**
   - iPhone：Safari
   - Android：Chrome

2. **输入地址**
   ```
   https://tcm-smart-diagnosis.vercel.app/pages/download/index
   ```

3. **添加到主屏幕**（获得 APP 体验）

**iPhone（Safari）**：
- 点击底部的"分享"按钮
- 点击"添加到主屏幕"
- 点击"添加"

**Android（Chrome）**：
- 点击浏览器菜单（三个点）
- 点击"添加到主屏幕"
- 点击"添加"

---

## 💡 常见问题

### Q1: 构建失败怎么办？

**A**: 检查以下几点：

1. **Build Command 是否正确**
   - 应该是：`pnpm install && pnpm build:web`

2. **Output Directory 是否正确**
   - 应该是：`dist/h5`

3. **查看构建日志**
   - 在 Vercel 控制台点击"Deployments"
   - 点击失败的部署
   - 查看"Build Logs"

### Q2: 如何连接后端 API？

**A**: 在环境变量中配置：

1. 在 Vercel 控制台找到你的项目
2. 点击"Settings" → "Environment Variables"
3. 添加变量：
   ```
   Key: PROJECT_DOMAIN
   Value: http://your-backend-server.com
   ```
4. 重新部署

### Q3: 如何隐藏敏感信息？

**A**: 使用环境变量

1. 不要在代码中直接写入敏感信息
2. 使用环境变量：
   ```typescript
   const apiUrl = process.env.PROJECT_DOMAIN || 'http://localhost:3000'
   ```
3. 在 Vercel 中配置环境变量

### Q4: 如何优化性能？

**A**: Vercel 默认已经做了很多优化：

1. **CDN 加速**：全球节点自动加速
2. **图片优化**：自动优化图片
3. **缓存策略**：自动配置缓存
4. **压缩**：自动压缩资源

### Q5: 如何监控访问数据？

**A**: 使用 Vercel Analytics

1. 在 Vercel 控制台找到你的项目
2. 点击"Analytics"
3. 查看：
   - 访问量
   - 性能指标
   - 错误日志

---

## 📊 部署后的配置

### 更新项目中的 API 地址

如果你需要连接后端，修改 `src/network/index.ts`：

```typescript
export const API_BASE_URL = process.env.PROJECT_DOMAIN || 'http://localhost:3000'
```

### 配置环境变量

在 Vercel 控制台添加：

```
PROJECT_DOMAIN=https://your-backend-api.com
```

### 测试后端连接

部署后，测试 API 是否正常：

```javascript
// 在浏览器控制台运行
fetch('https://your-backend-api.com/api/tcm')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

---

## 🎉 完成部署

### 部署成功标志

当你看到以下内容，说明部署成功：

- ✅ Vercel 控制台显示绿色的 "Ready"
- ✅ 可以访问公网地址
- ✅ 页面正常显示
- ✅ 手机可以访问

### 分享链接

**给用户的链接**：
- 首页：https://tcm-smart-diagnosis.vercel.app
- 下载页面：https://tcm-smart-diagnosis.vercel.app/pages/download/index

**给开发者的链接**：
- GitHub 仓库：https://github.com/你的用户名/tcm-smart-diagnosis
- Vercel 控制台：https://vercel.com/dashboard

---

## 🚀 下一步优化

### 1. 添加自定义域名

- 让网站看起来更专业
- 更容易记忆

### 2. 配置 HTTPS

- Vercel 自动配置
- 无需手动操作

### 3. 添加分析

- 使用 Vercel Analytics
- 监控访问量和性能

### 4. 配置 CI/CD

- 自动测试
- 自动部署

---

## 📞 需要帮助？

### Vercel 文档
- 官方文档：https://vercel.com/docs
- 部署指南：https://vercel.com/docs/deployments/overview
- 配置指南：https://vercel.com/docs/configuration

### 常见问题
- FAQ：https://vercel.com/docs/faqs
- 社区论坛：https://vercel.com/forum

---

**恭喜！你已经成功部署到 Vercel！🎉**

**立即访问你的网站：https://tcm-smart-diagnosis.vercel.app**
