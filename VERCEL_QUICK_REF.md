# 🚀 Vercel 部署快速参考卡

---

## 📋 5 步快速部署

### 第 1 步：上传到 GitHub

```bash
# 初始化 Git
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/tcm-smart-diagnosis.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

### 第 2 步：导入到 Vercel

1. 访问：https://vercel.com/dashboard
2. 点击"Add New" → "Project"
3. 选择你的 GitHub 仓库
4. 点击"Import"

---

### 第 3 步：配置项目

**Project Name**：`tcm-smart-diagnosis`

**Build Command**：`pnpm install && pnpm build:web`

**Output Directory**：`dist/h5`

**Install Command**：`pnpm install`

---

### 第 4 步：部署

点击"Deploy"按钮，等待 1-2 分钟。

---

### 第 5 步：访问

**部署成功后，访问地址**：

- 首页：https://tcm-smart-diagnosis.vercel.app
- 下载页：https://tcm-smart-diagnosis.vercel.app/pages/download/index

---

## 📱 手机访问

### 快速访问步骤

1. 复制链接：`https://tcm-smart-diagnosis.vercel.app/pages/download/index`
2. 发送到手机（微信、QQ、邮件等）
3. 在手机浏览器中打开链接
4. 添加到主屏幕（获得 APP 体验）

### iPhone 添加到主屏幕

1. Safari 打开链接
2. 点击"分享"按钮
3. 点击"添加到主屏幕"
4. 点击"添加"

### Android 添加到主屏幕

1. Chrome 打开链接
2. 点击右上角菜单（三个点）
3. 点击"添加到主屏幕"
4. 点击"添加"

---

## 🔧 Vercel 配置

### 文件：vercel.json

```json
{
  "version": 2,
  "name": "tcm-smart-diagnosis",
  "buildCommand": "pnpm install && pnpm build:web",
  "outputDirectory": "dist/h5",
  "installCommand": "pnpm install",
  "framework": null
}
```

---

## 📊 部署后配置

### 环境变量（如果需要连接后端）

在 Vercel 控制台添加：

```
Key: PROJECT_DOMAIN
Value: https://your-backend-api.com
```

### 自定义域名（可选）

1. 购买域名
2. 在 Vercel 添加域名
3. 配置 DNS 记录
4. 等待 DNS 生效

---

## 🚨 常见问题

### 部署失败？

1. 检查 `Build Command` 是否为：`pnpm install && pnpm build:web`
2. 检查 `Output Directory` 是否为：`dist/h5`
3. 查看 Vercel 构建日志

### 无法访问？

1. 检查部署状态是否为 "Ready"
2. 检查防火墙设置
3. 尝试清除浏览器缓存

### 手机样式错乱？

1. 检查 viewport 设置
2. 检查响应式布局
3. 参考 `POST_DEPLOYMENT_ACCESS_GUIDE.md`

---

## 🎯 快速命令

### 安装 Vercel CLI

```bash
npm install -g vercel
```

### 登录 Vercel

```bash
vercel login
```

### 手动部署

```bash
vercel --prod
```

### 查看部署列表

```bash
vercel list
```

---

## 📚 详细文档

- **完整部署指南**：`VERCEL_DEPLOYMENT_GUIDE.md`
- **部署后访问指南**：`POST_DEPLOYMENT_ACCESS_GUIDE.md`
- **H5 快速启动**：`H5_QUICK_START.md`
- **手机访问配置**：`H5_MOBILE_ACCESS.md`

---

## 🌐 重要链接

- Vercel 官网：https://vercel.com
- Vercel 控制台：https://vercel.com/dashboard
- Vercel 文档：https://vercel.com/docs
- GitHub：https://github.com

---

## 📞 需要帮助？

### Vercel 支持

- 帮助中心：https://vercel.com/help
- 社区论坛：https://vercel.com/forum

### 项目文档

- README.md
- H5_QUICK_START.md
- POST_DEPLOYMENT_ACCESS_GUIDE.md

---

**祝你部署顺利！🚀**

**如有问题，参考详细文档或访问 Vercel 帮助中心。**
