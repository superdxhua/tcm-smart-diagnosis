# 方案 1 手动执行指南

## 由于 Git 推送失败，需要手动在 GitHub 上删除文件

### 删除文件清单

需要删除以下文件：

1. `server/index.ts`
2. `server/api/index.ts`
3. `server/api/[[...path]].ts`
4. `server/api/` 目录

---

## 详细步骤

### 步骤 1：删除 server/index.ts

1. 访问：`https://github.com/superdxhua/tcm-smart-diagnosis/tree/main/server`
2. 找到 `index.ts` 文件
3. 点击文件名进入文件页面
4. 点击右上角的 "..."
5. 选择 "Delete file"
6. 在提交信息框中输入：
   ```
   refactor: 删除所有 Serverless Function 文件，只保留 NestJS 应用
   ```
7. 点击 "Commit changes" 按钮

---

### 步骤 2：删除 server/api/index.ts

1. 访问：`https://github.com/superdxhua/tcm-smart-diagnosis/tree/main/server/api`
2. 找到 `index.ts` 文件
3. 点击文件名进入文件页面
4. 点击右上角的 "..."
5. 选择 "Delete file"
6. 在提交信息框中输入：
   ```
   refactor: 删除所有 Serverless Function 文件，只保留 NestJS 应用
   ```
7. 点击 "Commit changes" 按钮

---

### 步骤 3：删除 server/api/[[...path]].ts

1. 访问：`https://github.com/superdxhua/tcm-smart-diagnosis/tree/main/server/api`
2. 找到 `[[...path]].ts` 文件
3. 点击文件名进入文件页面
4. 点击右上角的 "..."
5. 选择 "Delete file"
6. 在提交信息框中输入：
   ```
   refactor: 删除所有 Serverless Function 文件，只保留 NestJS 应用
   ```
7. 点击 "Commit changes" 按钮

---

### 步骤 4：删除 server/api/ 目录

1. 访问：`https://github.com/superdxhua/tcm-smart-diagnosis/tree/main/server`
2. 找到 `api` 目录
3. 点击目录名进入目录页面
4. 确认目录为空（应该没有任何文件）
5. 点击右上角的 "..."
6. 选择 "Delete file"（删除空目录）
7. 在提交信息框中输入：
   ```
   refactor: 删除所有 Serverless Function 文件，只保留 NestJS 应用
   ```
8. 点击 "Commit changes" 按钮

---

## 验证删除成功

1. 访问：`https://github.com/superdxhua/tcm-smart-diagnosis`
2. 查看最新的提交是否为：`refactor: 删除所有 Serverless Function 文件，只保留 NestJS 应用`
3. 确认 `server` 目录中没有 `index.ts` 文件
4. 确认 `server` 目录中没有 `api` 目录

---

## 等待 Vercel 自动部署

删除文件后，Vercel 会自动检测并部署。

访问 Vercel 部署页面：
```
https://vercel.com/superdxhuas-projects/tcm-smart-diagnosis-backend/deployments
```

等待部署完成（约 1-2 分钟）。

---

## 测试部署结果

部署完成后，测试以下端点：

1. **根路径**：`https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/`
2. **API 健康检查**：`https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/api/health`
3. **API 版本**：`https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/api/version`

---

## 预期结果

| 端点 | 预期响应 |
|------|---------|
| 根路径 `/` | 404 或 NestJS App Controller 响应 |
| `/api/health` | 200 OK + 健康检查信息 |
| `/api/version` | 200 OK + 版本信息 |

---

## 如果部署仍然失败

如果删除文件后部署仍然失败，请执行方案 2：重新创建 Vercel 项目。

详细步骤请参考：`RECREATE_VERCEL_PROJECT.md`
