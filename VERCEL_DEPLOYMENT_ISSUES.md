# Vercel 部署问题诊断与解决方案

## 问题现状

### 测试结果（2026-02-23）

1. **前端页面** ✅ 正常
   - URL: https://tcmsmarthealth.com/
   - 状态: HTTP 200
   - 结论: 前端页面可以正常访问

2. **OPTIONS 预检请求** ⚠️ 部分正常
   - URL: https://tcmsmarthealth.com/api/auth/login
   - 状态: HTTP 204 ✅
   - CORS 头:
     - ✅ Access-Control-Allow-Origin: *
     - ❌ 缺少 Access-Control-Allow-Methods
     - ❌ 缺少 Access-Control-Allow-Headers
     - ❌ 缺少 Access-Control-Allow-Credentials
   - 结论: OPTIONS 请求返回正确状态码，但缺少关键 CORS 头

3. **POST 登录请求** ❌ 异常
   - URL: https://tcmsmarthealth.com/api/auth/login
   - 状态: HTTP 405 (Method Not Allowed)
   - 响应: 空响应体
   - 结论: API 请求被拒绝，可能是路由配置问题

4. **健康检查 API** ❌ 异常
   - URL: https://tcmsmarthealth.com/api/health
   - 响应: 返回前端页面（index.html）
   - 结论: API 请求没有被正确路由到 Serverless Function

## 问题分析

### 根本原因
Vercel 上的 Serverless Functions **没有正确部署或路由到最新的代码**。

### 具体原因
1. **路由配置问题**
   - `vercel.json` 中的 `rewrites` 规则可能没有正确生效
   - `/api/*` 请求被错误地路由到前端页面（index.html）

2. **部署问题**
   - Vercel 可能还没有重新部署最新的代码
   - 或者部署过程中出现了错误，导致 API 没有正确加载

3. **文件引用问题**
   - `api/index.ts` 引用了 `../server/dist` 目录
   - 如果 `server/dist` 没有被正确包含在部署中，API 将无法工作

## 解决方案

### 方案 1: 等待 Vercel 重新部署（推荐）

**步骤：**

1. **推送最新代码到 Git**
   ```bash
   git add .
   git commit -m "fix: 修复 Vercel Serverless Functions 路由配置"
   git push
   ```

2. **等待 Vercel 自动部署**
   - Vercel 会在检测到代码推送后自动触发部署
   - 通常需要 1-3 分钟完成部署
   - 可以在 Vercel Dashboard 中查看部署进度

3. **验证部署**
   ```bash
   # 运行测试脚本
   bash server/scripts/test-vercel-deployment.sh
   ```

4. **如果还有问题，手动清除缓存并重新部署**
   - 登录 Vercel Dashboard
   - 进入项目 -> Deployments
   - 选择最新的部署
   - 点击 "Redeploy" 按钮
   - 等待部署完成

### 方案 2: 检查 Vercel Dashboard 配置

**步骤：**

1. **检查环境变量**
   - 登录 Vercel Dashboard
   - 进入项目 -> Settings -> Environment Variables
   - 确认以下变量已配置：
     - `COZE_SUPABASE_URL`
     - `COZE_SUPABASE_ANON_KEY`
     - `JWT_SECRET`
     - `WECHAT_APP_ID`（如需微信登录）
     - `WECHAT_SECRET`（如需微信登录）

2. **检查 Functions 日志**
   - 进入项目 -> Functions -> Logs
   - 查看是否有错误信息
   - 常见错误：
     - "Cannot find module '../server/dist/app.module'" → 文件引用问题
     - "Database connection failed" → 数据库连接问题
     - "Environment variable not set" → 环境变量未配置

3. **检查部署日志**
   - 进入项目 -> Deployments
   - 选择最新的部署
   - 查看 "Build Logs" 和 "Function Logs"
   - 查找错误信息和警告

### 方案 3: 本地验证配置

**步骤：**

1. **运行诊断脚本**
   ```bash
   cd /workspace/projects
   bash server/scripts/check-vercel-deployment.sh
   ```

2. **检查必要文件**
   - `api/index.ts` ✅
   - `api/health.ts` ✅
   - `vercel.json` ✅
   - `server/dist/app.module.js` ✅
   - `server/dist/interceptors/http-status.interceptor.js` ✅

3. **检查配置**
   - `vercel.json` 中的 `functions` 配置
   - `vercel.json` 中的 `rewrites` 配置
   - `vercel.json` 中的 `headers` 配置

## 预期结果

### 部署成功后的测试结果

1. **OPTIONS 预检请求**
   ```bash
   curl -X OPTIONS https://tcmsmarthealth.com/api/auth/login \
     -H "Origin: https://tcmsmarthealth.com" \
     -H "Access-Control-Request-Method: POST"
   ```
   预期响应：
   ```http
   HTTP/2 204
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
   Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
   Access-Control-Allow-Credentials: true
   Access-Control-Max-Age: 86400
   ```

2. **POST 登录请求**
   ```bash
   curl -X POST https://tcmsmarthealth.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"123456"}'
   ```
   预期响应：
   ```json
   {
     "code": 200,
     "msg": "success",
     "data": {
       "token": "...",
       "user": {
         "id": "...",
         "username": "admin",
         "role": "admin",
         "isActive": true
       }
     }
   }
   ```

3. **健康检查 API**
   ```bash
   curl https://tcmsmarthealth.com/api/health
   ```
   预期响应：
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "method": "GET",
     "url": "/api/health",
     "environment": {
       "node_env": "production",
       "region": "hkg1",
       "function_name": "api/health.ts"
     }
   }
   ```

## 常见问题排查

### 问题 1: 405 Method Not Allowed

**原因：** API 请求被错误地路由到前端页面

**解决：**
1. 检查 `vercel.json` 中的 `rewrites` 配置
2. 确保 `/api/*` 规则在前端路由规则之前
3. 重新部署并等待生效

### 问题 2: Cannot find module

**原因：** `server/dist` 目录没有被包含在部署中

**解决：**
1. 检查 `vercel.json` 中的 `includeFiles` 配置
2. 确保 `server/dist/**` 被包含
3. 重新部署

### 问题 3: Database connection failed

**原因：** 数据库环境变量未配置或连接失败

**解决：**
1. 检查 Vercel Dashboard 中的环境变量
2. 验证数据库连接字符串是否正确
3. 检查数据库是否可访问

### 问题 4: CORS 跨域错误

**原因：** CORS 响应头未正确设置

**解决：**
1. 检查 `api/index.ts` 中的 CORS 配置
2. 检查 `vercel.json` 中的 `headers` 配置
3. 确保 OPTIONS 请求返回 204 状态码

## 技术细节

### Vercel Serverless Functions 工作原理

1. **文件结构**
   ```
   /workspace/projects/
   ├── api/
   │   ├── index.ts          # NestJS 应用入口
   │   └── health.ts         # 健康检查 API
   ├── server/
   │   └── dist/             # NestJS 编译输出
   │       ├── app.module.js
   │       └── ...
   ├── dist-web/             # 前端构建输出
   └── vercel.json           # Vercel 配置
   ```

2. **路由规则**
   - `/api/*` → Serverless Function (`api/index.ts`)
   - `/api/health` → Serverless Function (`api/health.ts`)
   - `/*` → 前端静态文件 (`dist-web/index.html`)

3. **NestJS 应用初始化**
   - `api/index.ts` 导入 `server/dist/app.module`
   - 使用 `ExpressAdapter` 创建应用
   - 配置 CORS 中间件
   - 缓存应用实例（用于性能优化）

4. **CORS 处理**
   - OPTIONS 预检请求由 Express 中间件处理
   - 返回 204 状态码和必要的 CORS 头
   - 实际请求自动添加 CORS 头

## 总结

**当前状态：**
- ✅ 前端页面正常
- ⚠️ API 配置正确，但 Vercel 部署可能还未生效

**下一步：**
1. 推送最新代码到 Git
2. 等待 Vercel 自动部署（1-3 分钟）
3. 运行测试脚本验证部署结果
4. 如果还有问题，检查 Vercel Dashboard 日志

**预期时间：**
- 自动部署：1-3 分钟
- 手动重新部署：2-5 分钟（包括清除缓存）

**联系支持：**
如果问题持续存在，请提供以下信息：
1. Vercel Dashboard 中的部署日志
2. Functions 日志中的错误信息
3. 测试脚本的完整输出
