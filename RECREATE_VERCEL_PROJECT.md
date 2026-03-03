# 重新创建 Vercel 项目指南

## 为什么需要重新创建项目？

Vercel 仍然使用旧代码，即使清理构建缓存后也不行。重新创建项目可以确保 Vercel 使用最新的代码。

---

## 完整步骤

### 步骤 1：删除现有的后端项目

1. 访问 Vercel 设置：
   ```
   https://vercel.com/superdxhuas-projects/tcm-smart-diagnosis-backend/settings
   ```

2. 滚动到页面最底部

3. 点击 **"Delete Project"** 按钮（红色按钮）

4. 在确认对话框中，输入项目名称：`tcm-smart-diagnosis-backend`

5. 点击 **"Delete"** 确认删除

---

### 步骤 2：重新创建后端项目

1. 访问 Vercel Dashboard：
   ```
   https://vercel.com/dashboard
   ```

2. 点击 **"Add New"** → **"Project"**

3. 在仓库列表中找到并选择：`superdxhua/tcm-smart-diagnosis`

4. 点击 **"Import"**

5. 配置项目：
   - **Project Name**: `tcm-smart-diagnosis-backend`
   - **Framework Preset**: `Other`
   - **Root Directory**: `server` ← **重要！**
   - **Build Command**: `npx @nestjs/cli build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps --ignore-scripts`

6. 点击 **"Deploy"**

7. 等待部署完成（约 1-2 分钟）

---

### 步骤 3：配置环境变量

部署完成后，需要配置环境变量：

1. 访问环境变量设置：
   ```
   https://vercel.com/superdxhuas-projects/tcm-smart-diagnosis-backend/settings/environment-variables
   ```

2. 点击 **"Add New"** 添加以下环境变量：

   | 变量名 | 值 |
   |--------|-----|
   | `DATABASE_URL` | 你的 Supabase 数据库 URL |
   | `JWT_SECRET` | 你的 JWT 密钥 |
   | `JWT_EXPIRES_IN` | `7d` |
   | `COZE_WORKLOAD_IDENTITY_API_KEY` | 你的 Coze API Key |
   | `COZE_INTEGRATION_BASE_URL` | Coze 集成基础 URL |
   | `COZE_INTEGRATION_MODEL_BASE_URL` | Coze 模型基础 URL |
   | `S3_ENDPOINT` | `https://s3.amazonaws.com` |
   | `S3_ACCESS_KEY_ID` | 你的 AWS Access Key |
   | `S3_SECRET_ACCESS_KEY` | 你的 AWS Secret Key |
   | `S3_BUCKET` | 你的 S3 Bucket 名称 |
   | `S3_REGION` | `us-east-1` |
   | `ALLOWED_ORIGINS` | `*` |
   | `NODE_ENV` | `production` |

3. 添加完所有环境变量后，点击 **"Redeploy"**

---

## 测试端点

部署成功后，请测试以下端点：

1. **根路径**：`https://tcm-smart-diagnosis-backend.vercel.app/`
2. **API 入口**：`https://tcm-smart-diagnosis-backend.vercel.app/api/`
3. **NestJS 健康检查**：`https://tcm-smart-diagnosis-backend.vercel.app/api/health`

## 预期结果

- ✅ 构建成功，无 TypeScript 错误
- ✅ 无 runtime 配置错误
- ✅ 根路径和 API 入口能正常访问
- ✅ 响应时间在 1-2 秒内
