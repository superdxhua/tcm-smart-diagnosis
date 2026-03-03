# Vercel 部署问题：需要确认配置

## 问题描述

- ✅ 本地文件已删除（`server/_health.ts` 和 `server/api/_health.ts`）
- ✅ GitHub 仓库文件已删除
- ❌ Vercel 部署时仍然报错：`Cannot find module 'next/server'`
- ❌ 清理构建缓存后仍然报错

## 需要确认的配置

### 1. 检查 Vercel 项目的 Root Directory

请访问 Vercel Dashboard，确认后端项目的 Root Directory 设置：

1. 访问：
   ```
   https://vercel.com/superdxhuas-projects/tcm-smart-diagnosis-backend/settings
   ```

2. 找到 "General" 设置中的 "Root Directory" 字段

3. **请告诉我 Root Directory 设置是什么？**

   **应该是：** `server`

   **如果设置为空或其他值，可能会导致问题！**

---

### 2. 检查是否有多个 Vercel 项目

1. 访问 Vercel Dashboard：
   ```
   https://vercel.com/superdxhuas-projects
   ```

2. 查看项目列表

3. **请告诉我有哪些项目？**

   应该有：
   - `tcm-smart-diagnosis-frontend`（前端）
   - `tcm-smart-diagnosis-backend`（后端）

   如果有其他项目，可能会导致冲突！

---

### 3. 检查 Git 仓库的分支

1. 访问 GitHub 仓库：
   ```
   https://github.com/superdxhua/tcm-smart-diagnosis
   ```

2. 查看分支列表

3. **请告诉我有哪些分支？**

   应该有：
   - `main`（主分支）

   如果有其他分支，可能会导致 Vercel 使用错误的分支！

---

### 4. 检查最新的 Git 提交

1. 访问 GitHub 仓库的 commits 页面：
   ```
   https://github.com/superdxhua/tcm-smart-diagnosis/commits/main
   ```

2. 查看最新的提交

3. **请告诉我最新的提交是什么？**

   应该是：
   - `fix: 删除 Next.js 语法文件，避免 TypeScript 编译错误`

   如果不是，说明 Vercel 使用了错误的提交！

---

## 临时解决方案：重新创建 Vercel 项目

如果以上配置都正确，但问题仍然存在，可以尝试重新创建 Vercel 项目：

### 步骤 1：删除现有的后端项目

1. 访问 Vercel Dashboard：
   ```
   https://vercel.com/superdxhuas-projects/tcm-smart-diagnosis-backend/settings
   ```

2. 滚动到页面底部

3. 点击 "Delete Project"

4. 确认删除

### 步骤 2：重新创建后端项目

1. 访问 Vercel Dashboard：
   ```
   https://vercel.com/dashboard
   ```

2. 点击 "Add New" → "Project"

3. 选择你的 GitHub 仓库：`superdxhua/tcm-smart-diagnosis`

4. 配置项目：
   - **Project Name**: `tcm-smart-diagnosis-backend`
   - **Framework Preset**: `Other`
   - **Root Directory**: `server`
   - **Build Command**: `npx @nestjs/cli build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps --ignore-scripts`

5. 点击 "Deploy"

### 步骤 3：配置环境变量

1. 部署完成后，访问：
   ```
   https://vercel.com/superdxhuas-projects/tcm-smart-diagnosis-backend/settings/environment-variables
   ```

2. 添加以下环境变量：
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `COZE_WORKLOAD_IDENTITY_API_KEY`
   - `COZE_INTEGRATION_BASE_URL`
   - `COZE_INTEGRATION_MODEL_BASE_URL`
   - `S3_ENDPOINT`
   - `S3_ACCESS_KEY_ID`
   - `S3_SECRET_ACCESS_KEY`
   - `S3_BUCKET`
   - `S3_REGION`
   - `ALLOWED_ORIGINS`
   - `NODE_ENV`

3. 点击 "Redeploy"

---

## 预期结果

重新创建项目后：
- ✅ Vercel 会使用最新的代码
- ✅ 不会尝试编译已删除的文件
- ✅ 构建应该能成功

---

## 待测试端点

部署成功后，请测试以下端点：

1. 根路径：`https://tcm-smart-diagnosis-backend.vercel.app/`
2. API 入口：`https://tcm-smart-diagnosis-backend.vercel.app/api/`
3. NestJS 健康检查：`https://tcm-smart-diagnosis-backend.vercel.app/api/health`
