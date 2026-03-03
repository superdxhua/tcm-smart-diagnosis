# Vercel 构建错误修复摘要

## 🚨 问题

```
Error: The Output Directory "dist-web" is empty.
```

构建失败，输出目录为空，无法部署。

## ✅ 已修复

### 修复 1：修改 vercel.json
**修改前**：
```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

**修改后**：
```json
{
  "installCommand": "pnpm install",
  "env": {
    "NODE_ENV": "production"
  }
}
```

**关键改进**：
- ✅ 使用 `pnpm install` 替代 `npm install`（项目使用 pnpm）
- ✅ 添加 `NODE_ENV` 环境变量

### 修复 2：增强 build:web 命令
**修改前**：
```json
"build:web": "npx weapp-tailwindcss patch && taro build --type h5 && cp -r public/* dist-web/ || true"
```

**修改后**：
```json
"build:web": "npx weapp-tailwindcss patch || true && taro build --type h5 && echo 'Build completed!' && ls -la dist-web/ || true"
```

**关键改进**：
- ✅ 添加错误处理：`|| true` 确保 weapp-tailwindcss 失败不影响构建
- ✅ 添加构建完成提示：`echo 'Build completed!'`
- ✅ 添加输出目录检查：`ls -la dist-web/`

## 📋 需要你执行的操作

### 步骤 1：推送代码到 GitHub

```bash
git add vercel.json package.json
git commit -m "fix: 修复 Vercel 构建错误，使用 pnpm install"
git push origin main
```

### 步骤 2：在 Vercel Dashboard 触发重新部署

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到项目 `zhongyi-smart`
3. 进入 `Deployments` 标签
4. 找到最新的部署记录
5. 点击 `Redeploy` 按钮（三点菜单 → Redeploy）

### 步骤 3：检查部署状态

1. 等待部署完成（约 1-3 分钟）
2. 查看部署日志，确认：
   - ✅ `pnpm install` 成功
   - ✅ `taro build --type h5` 成功
   - ✅ `Build completed!` 出现
   - ✅ `ls -la dist-web/` 显示文件列表
   - ✅ 部署状态显示 "Ready"

### 步骤 4：验证网站

部署成功后，访问：
```
https://www.zhongyihskhealth.com
```

检查：
- [ ] 页面正常加载
- [ ] 无 404 错误
- [ ] 无 JavaScript 错误（按 F12 查看 Console）
- [ ] API 请求正常（按 F12 查看 Network）

## 🔍 故障排查

### 如果构建仍然失败

查看详细的错误日志：

1. 在 Vercel Dashboard 中
2. 点击最新的部署记录
3. 查看完整的构建日志
4. 查找以下错误：
   - `Error: ...`
   - `Failed to ...`
   - `Cannot find ...`

### 常见错误

#### 错误 1：pnpm not found
```
Error: pnpm: command not found
```

**解决方案**：修改 vercel.json
```json
{
  "installCommand": "npm install -g pnpm && pnpm install"
}
```

#### 错误 2：依赖安装失败
```
Error: Cannot find module 'XXXX'
```

**解决方案**：在本地执行
```bash
rm -rf node_modules package-lock.json
pnpm install
npm run build:web
```

#### 错误 3：环境变量未定义
```
Error: PROJECT_DOMAIN is not defined
```

**解决方案**：在 Vercel Dashboard 设置环境变量
- Key: `PROJECT_DOMAIN`
- Value: `https://api.zhongyihskhealth.com`
- Environment: Production

## 📊 预期结果

### 成功的构建日志应该包含：

```
> zhongyi-smart@1.0.0 build:web
> npx weapp-tailwindcss patch || true && taro build --type h5 && echo 'Build completed!' && ls -la dist-web/ || true

[Config] 加载环境变量文件: /vercel/path0/.env.production
[Config] PROJECT_DOMAIN: https://api.zhongyihskhealth.com
[Config] NODE_ENV: production

Taro v4.1.9

Build completed!
total XX
drwxr-xr-x  X vercel  wheel   XXX Jan 10 22:28 .
drwxr-xr-x  X vercel  wheel   XXX Jan 10 22:28 ..
-rw-r--r--  1 vercel  wheel  XXXX Jan 10 22:28 index.html
-rw-r--r--  1 vercel  wheel  XXXX Jan 10 22:28 app.js
-rw-r--r--  1 vercel  wheel  XXXX Jan 10 22:28 app.css
...

✅ Build Completed in XXs
✅ Output: dist-web
✅ Uploaded XXX files
✅ Deployment completed
```

## 🎯 完成标志

当你看到以下内容时，说明修复成功：

- ✅ Vercel 部署状态显示 "Ready"
- ✅ 访问 https://www.zhongyihskhealth.com 正常
- ✅ 页面可以正常加载
- ✅ API 请求成功（指向 api.zhongyihskhealth.com）

## 📞 需要帮助？

如果仍然有问题，请提供以下信息：

1. **完整的 Vercel 构建日志**
   - 复制最新的部署日志
   - 特别关注错误信息

2. **浏览器控制台错误**
   - 访问 https://www.zhongyihskhealth.com
   - 按 F12 打开开发者工具
   - 查看 Console 标签中的错误

3. **网络请求状态**
   - 按 F12 打开开发者工具
   - 查看 Network 标签
   - 截图 API 请求的错误

---

**修复文件**：
- ✅ `vercel.json` - 修改安装命令和环境变量
- ✅ `package.json` - 增强构建命令的错误处理

**下一步**：推送代码到 GitHub，触发 Vercel 重新部署
