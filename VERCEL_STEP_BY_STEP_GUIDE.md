# 🎯 Vercel 部署分步操作指南（图文版）

## 第一步：创建新项目

### 1.1 找到"Add New"按钮

在 Vercel 控制台首页，找到左上角的 **"Add New..."** 按钮（通常在页面顶部，左侧菜单中）

### 1.2 点击"Project"

在弹出的菜单中，点击 **"Project"** 选项

---

## 第二步：导入 GitHub 仓库

### 2.1 选择你的 GitHub 仓库

你会看到你的 GitHub 仓库列表，找到 **"tcm-smart-diagnosis"** 仓库

### 2.2 点击"Import"

在仓库卡片上，点击右侧的 **"Import"** 按钮

---

## 第三步：配置项目

### 3.1 Project Name（项目名称）

默认会显示你的仓库名，可以修改或保持默认：

```
tcm-smart-diagnosis
```

### 3.2 Framework Preset（框架预设）

点击下拉菜单，选择 **"Other"**

**注意**：不要选择 Next.js、React 等选项，选择 "Other"

### 3.3 Root Directory（根目录）

保持默认（留空）

### 3.4 Build Command（构建命令）

删除默认内容，输入以下内容：

```
pnpm install && pnpm build:web
```

### 3.5 Output Directory（输出目录）

删除默认内容，输入以下内容：

```
dist/h5
```

### 3.6 Install Command（安装命令）

保持默认或输入：

```
pnpm install
```

### 3.7 Environment Variables（环境变量）

**如果暂时不需要连接后端，可以跳过这一步**

如果需要连接后端，点击 **"Environment Variables"** 旁边的 **"Add"** 按钮：

**Key**: `PROJECT_DOMAIN`
**Value**: `https://your-backend-api.com`（替换为你的后端地址）

---

## 第四步：开始部署

### 4.1 检查配置

确认所有配置无误：
- ✅ Project Name: `tcm-smart-diagnosis`
- ✅ Framework Preset: `Other`
- ✅ Build Command: `pnpm install && pnpm build:web`
- ✅ Output Directory: `dist/h5`
- ✅ Install Command: `pnpm install`

### 4.2 点击"Deploy"

找到页面底部的 **"Deploy"** 按钮，点击它

### 4.3 等待部署

部署过程通常需要 1-2 分钟，你会看到：

1. **Building...**（构建中）
   - 正在运行 `pnpm install`
   - 正在运行 `pnpm build:web`

2. **Deploying...**（部署中）
   - 正在上传文件
   - 正在部署到 CDN

3. **Ready**（完成）
   - 部署成功！

---

## 第五步：访问你的网站

### 5.1 查看部署成功信息

部署成功后，你会看到绿色的 **"Ready"** 标志

### 5.2 获取访问地址

在页面顶部，你会看到你的访问地址：

```
https://tcm-smart-diagnosis-xxxxx.vercel.app
```

（xxxxx 是随机生成的字符）

### 5.3 测试访问

**电脑访问**：
1. 点击访问地址
2. 确认页面正常显示

**手机访问**：
1. 复制访问地址
2. 发送到手机（微信、QQ、邮件等）
3. 在手机浏览器中打开
4. 添加到主屏幕（获得 APP 体验）

---

## 🔧 常见配置选项说明

### Override Build Command（覆盖构建命令）

如果默认构建命令不工作，可以尝试：

```bash
npm install && npm run build:web
```

或

```bash
yarn install && yarn build:web
```

### Override Install Command（覆盖安装命令）

如果默认安装命令不工作，可以尝试：

```bash
npm install
```

或

```bash
yarn install
```

---

## 📱 访问下载页面

部署成功后，访问以下地址：

**首页**：
```
https://tcm-smart-diagnosis-xxxxx.vercel.app
```

**下载页面**：
```
https://tcm-smart-diagnosis-xxxxx.vercel.app/pages/download/index
```

---

## 🎯 接下来可以做什么

### 1. 配置自定义域名（可选）

1. 在 Vercel 控制台找到你的项目
2. 点击 **"Settings"**
3. 点击 **"Domains"**
4. 输入你的域名，如：`tcm.yourclinic.com`
5. 按提示配置 DNS

### 2. 配置环境变量（如果需要）

1. 点击 **"Settings"**
2. 点击 **"Environment Variables"**
3. 添加需要的变量

### 3. 查看部署历史

1. 点击 **"Deployments"**
2. 查看所有部署记录
3. 可以回滚到之前的版本

### 4. 设置自动部署

**默认已启用**：
- 当你推送代码到 GitHub 时，Vercel 会自动重新部署
- 无需手动操作

---

## 🚨 部署失败怎么办？

### 检查构建日志

1. 在部署页面，点击 **"View Logs"**
2. 查看错误信息
3. 根据错误信息调整配置

### 常见错误

**错误 1：Build Command 失败**

**原因**：构建命令不正确

**解决方案**：
- 确认 Build Command 为：`pnpm install && pnpm build:web`
- 如果不工作，尝试：`npm install && npm run build:web`

**错误 2：Output Directory 不存在**

**原因**：输出目录路径错误

**解决方案**：
- 确认 Output Directory 为：`dist/h5`
- 如果不工作，尝试：`dist` 或 `build`

**错误 3：Install Command 失败**

**原因**：安装命令不正确

**解决方案**：
- 确认 Install Command 为：`pnpm install`
- 如果不工作，尝试：`npm install` 或 `yarn install`

---

## ✅ 部署成功标志

当看到以下内容，说明部署成功：

1. ✅ 页面显示绿色的 **"Ready"**
2. ✅ 可以访问公网地址
3. ✅ 页面正常显示
4. ✅ 没有错误日志

---

## 📞 需要帮助？

### 查看 Vercel 官方文档

- 部署指南：https://vercel.com/docs/deployments/overview
- 配置指南：https://vercel.com/docs/configuration
- 常见问题：https://vercel.com/docs/faqs

### 联系 Vercel 支持

- 帮助中心：https://vercel.com/help
- 社区论坛：https://vercel.com/forum

---

## 🎉 完成部署！

恭喜你完成了 Vercel 部署！

**立即访问你的网站**：https://tcm-smart-diagnosis-xxxxx.vercel.app

**分享给用户**：
- 电脑：直接发送链接
- 手机：发送链接，让用户添加到主屏幕

---

**祝你使用愉快！🚀**
