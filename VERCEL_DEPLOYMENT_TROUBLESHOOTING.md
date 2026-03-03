# Vercel 部署问题排查指南

## 当前状态

### 已修复的问题

1. **Serverless Function 语法错误**（2024-02-22）
   - 问题：使用了 Next.js 特定语法（`NextRequest`、`NextResponse`）
   - 解决：改用标准 Vercel Serverless Function 语法
   - 文件：`server/_health.ts`, `server/api/index.ts`, `server/api/_health.ts`

2. **部署配置错误**（2024-02-22）
   - 问题：`.vercelignore` 排除了 `package.json`
   - 解决：移除对 `package.json` 的排除

3. **网络连接超时**（2024-02-22）
   - 问题：`regions: ["sin1"]` 配置导致网络连接超时
   - 解决：移除 `regions` 配置，使用 Vercel 默认区域

### 当前待测试

重新部署后，需要测试以下端点：

1. 根路径：`https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/`
2. 健康检查：`https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/_health`
3. API 入口：`https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/api/`
4. API 健康检查：`https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/api/_health`

### 环境变量配置

已配置的环境变量：
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `JWT_EXPIRES_IN`
- ✅ `COZE_WORKLOAD_IDENTITY_API_KEY`
- ✅ `COZE_INTEGRATION_BASE_URL`
- ✅ `COZE_INTEGRATION_MODEL_BASE_URL`
- ✅ `S3_ENDPOINT`
- ✅ `S3_ACCESS_KEY_ID`（占位符）
- ✅ `S3_SECRET_ACCESS_KEY`（占位符）
- ✅ `S3_BUCKET`（占位符）
- ✅ `S3_REGION`
- ✅ `ALLOWED_ORIGINS`
- ✅ `NODE_ENV`

### Vercel 项目配置

**后端项目：**
- 项目名：`tcm-smart-diagnosis-backend`
- Root Directory：`server`
- Framework Preset：`Other`
- Build Command：`npx @nestjs/cli build`
- Output Directory：`dist`
- Install Command：`npm install --legacy-peer-deps --ignore-scripts`

**前端项目：**
- 项目名：`tcm-smart-diagnosis-frontend`
- Root Directory：空（根目录）
- Framework Preset：Vite
- Build Command：`npm run build:web`
- Output Directory：`dist-web`
- Install Command：`npm install --legacy-peer-deps`

### 下一步

1. 重新部署后端项目
2. 测试各个端点
3. 如果简化端点能访问，测试 NestJS 端点
4. 更新前端 `PROJECT_DOMAIN` 环境变量
5. 重新部署前端项目
6. 测试前端应用是否能正常连接后端
