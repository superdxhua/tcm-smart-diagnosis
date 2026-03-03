# Render 项目诊断与修复指南

## 📋 项目信息

- **项目名称**：`tcm-smart-diagnosis-api`
- **状态**：未知（需要检查）
- **上次部署**：失败

---

## 🔍 第 1 步：检查项目状态

### 访问 Render Dashboard

1. 打开浏览器，访问：https://dashboard.render.com
2. 查找项目：`tcm-smart-diagnosis-api`
3. 点击进入项目详情页

### 检查项目状态

项目状态可能显示以下之一：

| 状态 | 含义 | 说明 |
|------|------|------|
| 🟢 **Live** | 运行中 | 项目正在运行，可以访问 |
| 🟡 **Building** | 构建中 | 项目正在构建，等待完成 |
| 🔴 **Error** | 错误 | 构建或运行失败 |
| ⚪ **Stopped** | 已停止 | 项目已手动停止 |
| 🟠 **Paused** | 已暂停 | 配额用尽或未付费 |

---

## 🔍 第 2 步：查看部署日志

### 如果状态是 "Error"（错误）

1. 点击项目名称进入详情页
2. 进入 "Deployments" 标签
3. 点击失败的部署记录
4. 查看 "Build Logs" 或 "Function Logs"

**常见错误及解决方案**：

#### 错误 1：Build Failed（构建失败）

**错误信息示例**：
```
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path /app/package.json
```

**原因**：
- Root Directory 配置错误
- package.json 文件路径不正确

**解决方案**：
1. 进入 "Settings" 标签
2. 找到 "Build & Deploy" 部分
3. 修改 "Root Directory"：
   - 如果代码在 `server/` 目录：设置为 `server`
   - 如果代码在根目录：设置为空或 `.`

---

#### 错误 2：Module not found（模块未找到）

**错误信息示例**：
```
Error: Cannot find module '@nestjs/core'
```

**原因**：
- `node_modules` 未正确安装
- `package.json` 缺少依赖

**解决方案**：
1. 检查 "Build Command" 是否为 `npm install`
2. 如果是，尝试修改为：
   - `npm ci`（使用 package-lock.json）
   - 或 `npm install && npm run build`

---

#### 错误 3：Port already in use（端口被占用）

**错误信息示例**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**原因**：
- 端口 3000 已被占用

**解决方案**：
1. 检查 `server/src/main.ts` 中的端口配置
2. 确保使用环境变量：
   ```typescript
   const port = process.env.PORT || 3000;
   await app.listen(port);
   ```
3. Render 会自动设置 `PORT` 环境变量

---

#### 错误 4：Environment variables not found（环境变量未找到）

**错误信息示例**：
```
Error: Supabase credentials not found
```

**原因**：
- 环境变量未配置

**解决方案**：
1. 进入 "Settings" 标签
2. 找到 "Environment Variables" 部分
3. 添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `COZE_SUPABASE_URL` | `https://br-zippy-kea-87a692a5.supabase2.aidap-global.cn-beijing.volces.com` |
| `COZE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTEzNjMzMzIsInJvbGUiOiJhbm9uIn0.RS0wQLKj-8lsYE-Qek3ut9y9adM072H6gHepZ4xwk60` |
| `JWT_SECRET` | `ad5298de0ecab1330ca2a1c00d564ccfb46767d4c174410d817d9ef3fc600e12` |
| `WECHAT_APP_ID` | `wxc9246b2c31d037f2` |
| `WECHAT_SECRET` | `ca48ca8fccf44ce3e1af8c4eae102a64` |
| `COZE_WORKLOAD_IDENTITY_API_KEY` | `cztei_qCNZrpasC9t4xrMAJa70H3fUOvYwB0VL0LYrEC2mWGPpbHAIHzMPDURIJntzh0EFe` |

---

#### 错误 5：Start command failed（启动命令失败）

**错误信息示例**：
```
Error: Command failed: npm run start:prod
```

**原因**：
- `package.json` 中没有 `start:prod` 脚本
- 启动命令错误

**解决方案**：
1. 检查 `server/package.json` 中的 `scripts` 部分
2. 确保有以下脚本之一：
   ```json
   {
     "scripts": {
       "start": "node dist/main.js",
       "start:prod": "node dist/main.js",
       "start:dev": "nest start",
       "build": "nest build"
     }
   }
   ```
3. 如果没有，修改 "Start Command" 为：
   - `node dist/main.js`
   - 或 `npm run build && node dist/main.js`

---

#### 错误 6：TypeScript compilation failed（TypeScript 编译失败）

**错误信息示例**：
```
error TS2307: Cannot find module '@/network'
```

**原因**：
- TypeScript 路径别名未配置
- `tsconfig.json` 配置错误

**解决方案**：
1. 确保 `server/tsconfig.json` 中的 `paths` 配置正确：
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```
2. 确保 `package.json` 中有 `ts-node` 依赖

---

## 🔧 第 3 步：重新部署

### 方法 1：在 Dashboard 中重新部署（推荐）

1. 进入项目详情页
2. 点击右上角的 "Manual Deploy" 按钮
3. 选择分支（通常是 `main` 或 `master`）
4. 点击 "Deploy"
5. 等待部署完成（5-10 分钟）

### 方法 2：触发 GitHub Webhook

1. 在本地仓库中：
   ```bash
   git add .
   git commit -m "fix: 修复部署配置"
   git push origin main
   ```
2. Render 会自动检测到提交并重新部署

---

## ✅ 第 4 步：验证部署成功

### 检查项目状态

1. 刷新 Dashboard 页面
2. 确认状态为 🟢 **Live**
3. 点击项目名称获取 URL
4. URL 格式：`https://tcm-smart-diagnosis-api.onrender.com`

### 测试 API

```bash
# 测试健康检查
curl https://tcm-smart-diagnosis-api.onrender.com/api/health-records

# 测试登录 API
curl -X POST https://tcm-smart-diagnosis-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"password123"}'
```

**预期结果**：
- ✅ 响应状态码：200 或 401
- ✅ 响应时间：< 5 秒（首次可能有冷启动）
- ✅ 响应数据为 JSON 格式

---

## 🎯 完整配置清单

### Render Web Service 配置

**Basic Settings**：
- Name: `tcm-smart-diagnosis-api`
- Region: Singapore（推荐，离中国近）或 Oregon
- Branch: `main`

**Build & Deploy Settings**：
- Root Directory: `server`
- Build Command: `npm install && npm run build`
- Start Command: `node dist/main.js`

**Environment Variables**：
- `COZE_SUPABASE_URL`
- `COZE_SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `WECHAT_APP_ID`
- `WECHAT_SECRET`
- `COZE_WORKLOAD_IDENTITY_API_KEY`
- `COZE_INTEGRATION_BASE_URL`
- `COZE_INTEGRATION_MODEL_BASE_URL`
- `NODE_ENV=production`

**Instance**：
- Type: Free（开始时）或 Starter（付费后）
- Region: Singapore 或 Oregon

---

## 🚀 快速修复脚本

如果您的本地环境配置正确，可以运行以下脚本快速检查配置：

```bash
#!/bin/bash

echo "检查 Render 配置..."

# 检查 package.json
echo "1. 检查 package.json..."
if [ -f "server/package.json" ]; then
  echo "✅ package.json 存在"
  cat server/package.json | grep -A 10 '"scripts"'
else
  echo "❌ package.json 不存在"
fi

# 检查 tsconfig.json
echo "2. 检查 tsconfig.json..."
if [ -f "server/tsconfig.json" ]; then
  echo "✅ tsconfig.json 存在"
else
  echo "❌ tsconfig.json 不存在"
fi

# 检查 main.ts
echo "3. 检查 main.ts..."
if [ -f "server/src/main.ts" ]; then
  echo "✅ main.ts 存在"
  cat server/src/main.ts | grep "PORT"
else
  echo "❌ main.ts 不存在"
fi

echo "检查完成！"
```

---

## 📞 下一步行动

### 立即行动（今天）

1. **访问 Render Dashboard**
   - 检查项目状态
   - 查看部署日志

2. **记录错误信息**
   - 截图或复制错误日志
   - 告诉我具体错误

3. **根据错误修复**
   - 参考上述常见错误解决方案
   - 修改配置或代码

4. **重新部署**
   - 点击 "Manual Deploy"
   - 等待部署完成

5. **验证部署**
   - 测试 API
   - 确认功能正常

### 如果部署成功

1. **测试所有功能**（1-2 天）
2. **升级到 Starter 计划**（测试通过后）
3. **配置 DNS**（切换到 Render）

---

**请告诉我您在 Render Dashboard 上看到的错误信息，我会帮您具体解决！** 🚀
