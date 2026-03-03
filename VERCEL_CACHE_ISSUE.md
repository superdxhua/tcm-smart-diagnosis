# Vercel 部署问题：构建缓存

## 问题描述

- ✅ 本地文件已删除（`server/_health.ts` 和 `server/api/_health.ts`）
- ✅ GitHub 仓库文件已删除
- ❌ Vercel 部署时仍然报错：`Cannot find module 'next/server'`

## 问题根源

**Vercel 使用了旧的构建缓存！**

Vercel 在构建时可能会使用缓存的代码，而不是最新的代码。这导致即使文件已在 GitHub 仓库中删除，Vercel 仍然尝试编译旧版本的文件。

## 解决方案

### 方案 1：在 Vercel Dashboard 中清理构建缓存（推荐）

1. 访问 Vercel Dashboard
   ```
   https://vercel.com/superdxhuas-projects/tcm-smart-diagnosis-backend/settings
   ```

2. 找到 "General" 设置
   - 在左侧菜单中，找到 "General" 选项

3. 找到 "Git Integration" 部分
   - 向下滚动，找到 "Git Integration" 部分

4. 点击 "Redeploy"
   - 点击 "Redeploy" 按钮

5. 选择 "Clear Build Cache"
   - 在弹出的对话框中，勾选 "Clear Build Cache" 选项
   - 点击 "Redeploy"

### 方案 2：在部署页面清理构建缓存

1. 访问部署页面
   ```
   https://vercel.com/superdxhuas-projects/tcm-smart-diagnosis-backend/deployments
   ```

2. 点击最新部署记录右侧的 "..." 按钮

3. 选择 "Redeploy"

4. 勾选 "Clear Build Cache"

5. 点击 "Redeploy"

### 方案 3：使用 Vercel CLI 清理缓存

1. 安装 Vercel CLI
   ```bash
   npm install -g vercel
   ```

2. 登录 Vercel
   ```bash
   vercel login
   ```

3. 清理构建缓存
   ```bash
   vercel build --force
   ```

## 预期结果

清理构建缓存后：
- ✅ Vercel 会使用最新的代码构建
- ✅ 不会尝试编译已删除的文件
- ✅ 构建应该能成功

## 待测试端点

部署成功后，请测试以下端点：

1. 根路径：`https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/`
2. API 入口：`https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/api/`
3. NestJS 健康检查：`https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/api/health`
