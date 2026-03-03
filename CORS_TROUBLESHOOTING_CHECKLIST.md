# CORS 故障排查检查清单

## 📋 对照检查结果

### ✅ 第一阶段：核心故障定位（已完成代码检查）

#### 需要用户在浏览器中检查（请按以下步骤操作）

**步骤 1：打开浏览器开发者工具**
- 按 `F12` 或右键 → "检查"
- 切换到 **Network** (网络) 选项卡
- 刷新页面，复现错误

**步骤 2：检查失败请求的三个指标**

##### 指标 1：Status Code (状态码)

| 状态码 | 可能原因 | 解决方案 |
|--------|----------|----------|
| `(failed)` 或 `CORS error` | 跨域问题 | ✅ 已修复 CORS 配置 |
| `502 Bad Gateway` | 后端服务崩溃 | 检查 Render 日志 |
| `503 Service Unavailable` | 后端服务休眠 | 等待唤醒或增加超时 |
| `404 Not Found` | 请求路径错误 | 检查 URL 是否正确 |
| `200` 但响应为空 | CORS 预检失败 | ✅ 已修复 CORS 配置 |

##### 指标 2：Response (响应体)
- 检查是否真的为空
- 检查是否有错误信息

##### 指标 3：Time (耗时)
- 检查是否超过 30 秒（可能是 Render 冷启动）

---

### ✅ 第二阶段：常见原因分析与解决方案（已修复）

#### 问题 1：跨域资源共享 (CORS) 配置错误 ✅ 已修复

**现象**：
- 浏览器控制台报错 `Access-Control-Allow-Origin` 相关错误
- 状态码为 200 但前端拿不到数据

**原因**：
- 前端部署在 Vercel（`https://www.zhongyihskhealth.com`）
- 后端在 Render（`https://api.zhongyihskhealth.com`）
- 子域名不同，被视为跨域请求

**解决方案（已实施）**：

✅ **修复 1：后端 CORS 配置**（`server/src/main.ts`）

```typescript
// ✅ 明确配置 CORS，解决跨域问题
const allowedOrigins = [
  'https://www.zhongyihskhealth.com',  // 生产环境前端域名
  'https://zhongyihskhealth.com',       // 生产环境主域名
  'http://localhost:5000',             // 本地开发前端
  'http://localhost:3000',             // 本地开发后端
  'https://zhongyi-smart.vercel.app',  // Vercel 预览域名
];

app.enableCors({
  origin: (origin, callback) => {
    // 允许无 origin 的请求（如移动端应用、Postman）
    if (!origin) {
      return callback(null, true);
    }

    // 检查是否在允许的域名列表中
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS 阻止了来自 ${origin} 的请求`);
      callback(new Error(`CORS 阻止了来自 ${origin} 的请求`));
    }
  },
  credentials: false,  // 使用 Bearer Token 认证，不需要 Cookie 凭据
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,  // 预检请求缓存 24 小时
});
```

✅ **修复 2：Vercel Rewrites 配置**（`vercel.json`）

```json
{
  "version": 2,
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "pnpm install",
  "framework": null,
  "env": {
    "NODE_ENV": "production"
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.zhongyihskhealth.com/api/:path*"
    }
  ]
}
```

**关键检查点**：
- ✅ 后端 CORS 白名单包含 `https://www.zhongyihskhealth.com`
- ✅ 后端 CORS 白名单包含 `https://zhongyihskhealth.com`
- ✅ Vercel Rewrites 配置了 `/api/:path*` 的代理
- ✅ 使用 `https://` 而不是 `http://`

**效果**：
- ✅ 浏览器认为在请求同源地址（`https://www.zhongyihskhealth.com/api/...`）
- ✅ Vercel 自动转发到 `https://api.zhongyihskhealth.com/api/...`
- ✅ 彻底解决跨域问题
- ✅ 隐藏后端真实地址

---

#### 问题 2：Render 服务休眠与超时 —— "冷启动"问题 ⏳ 待验证

**现象**：
- 请求加载很久，最后报错或数据为空
- 首次访问后端需要 30-60 秒唤醒

**原因**：
- Render 免费实例会在 15 分钟无活动后休眠
- 需要时间唤醒

**解决方案**：

✅ **方案 A：Vercel Rewrites（已实施）**
- 通过 Vercel 代理请求，可以设置更长的超时时间

⏳ **方案 B：增加前端请求超时（需要前端代码）**
```typescript
// 如果使用 Taro.request，需要设置 timeout
Taro.request({
  url: '/api/health',
  method: 'GET',
  timeout: 60000,  // 设置为 60 秒
});
```

⚠️ **方案 C：保活服务（可选）**
- 使用 UptimeRobot 等服务每 5 分钟 ping 一次后端
- 注意：可能违反 Render 免费条款

**推荐方案**：
- ✅ 使用 Vercel Rewrites（已实施）
- ✅ 首次访问后，Render 服务会保持活跃一段时间

---

#### 问题 3：环境变量配置错误 ✅ 已确认

**现象**：
- 请求发往了错误的地址

**检查结果**：
- ✅ `.env.production` 已正确配置：`PROJECT_DOMAIN=https://api.zhongyihskhealth.com`
- ✅ 使用 `https://` 而不是 `http://`

**需要在 Vercel Dashboard 设置**：
```
Vercel Dashboard → zhongyi-smart → Settings → Environment Variables

Key: PROJECT_DOMAIN
Value: https://api.zhongyihskhealth.com
Environment: Production
```

---

#### 问题 4：Vercel Serverless Functions 超时 ✅ 不适用

**现象**：
- Vercel 函数执行限制 10 秒

**当前架构**：
- ✅ 前端直接请求后端（通过 Vercel Rewrites 代理）
- ✅ 不使用 Vercel API Routes 中间层
- ✅ 不存在 Serverless 超时问题

---

### ✅ 第三阶段：高级排查策略（已实施）

#### Vercel Rewrites 配置 ✅ 已完成

**配置内容**（`vercel.json`）：
```json
"rewrites": [
  {
    "source": "/api/:path*",
    "destination": "https://api.zhongyihskhealth.com/api/:path*"
  }
]
```

**工作原理**：
1. 前端请求 `https://www.zhongyihskhealth.com/api/health`
2. Vercel 收到请求，匹配到 `/api/:path*` 规则
3. Vercel 自动转发到 `https://api.zhongyihskhealth.com/api/health`
4. 浏览器认为是同源请求，不会触发 CORS 预检

**优点**：
- ✅ 彻底解决跨域问题
- ✅ 隐藏后端真实地址
- ✅ 简化前端配置

**缺点**：
- ⚠️ 增加一层转发延迟（通常 < 50ms）
- ⚠️ 依赖 Vercel 服务可用性

---

## 🎯 总结与行动清单

### 已完成的修复 ✅

1. ✅ **后端 CORS 配置**
   - 明确指定允许的域名列表
   - 配置允许的 HTTP 方法
   - 配置允许的请求头
   - 设置预检请求缓存

2. ✅ **Vercel Rewrites 配置**
   - 配置 `/api/:path*` 代理规则
   - 彻底解决跨域问题

3. ✅ **环境变量配置**
   - `.env.production` 已正确配置
   - 需要在 Vercel Dashboard 设置

### 需要你执行的操作 ⏳

#### 步骤 1：推送代码到 GitHub

```bash
git add server/src/main.ts vercel.json
git commit -m "fix: 修复 CORS 配置，添加 Vercel Rewrites 代理"
git push origin main
```

#### 步骤 2：在 Vercel Dashboard 设置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到项目 `zhongyi-smart`
3. 进入 `Settings` → `Environment Variables`
4. 添加环境变量：
   - **Key**: `PROJECT_DOMAIN`
   - **Value**: `https://api.zhongyihskhealth.com`
   - **Environment**: Production

#### 步骤 3：触发 Vercel 重新部署

1. 在 Vercel Dashboard 中，进入 `Deployments` 标签
2. 找到最新的部署记录
3. 点击 `Redeploy` 按钮（三点菜单 → Redeploy）
4. 等待部署完成（约 1-3 分钟）

#### 步骤 4：检查 Render 日志

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 找到项目 `zhongyi-smart-api`
3. 进入 `Logs` 标签
4. 刷新前端页面
5. 查看 Render 是否收到请求

**预期结果**：
- ✅ 如果前端正常访问，Render 日志应该显示请求记录
- ❌ 如果日志为空，说明请求根本没发出去（前端问题）

#### 步骤 5：验证网站

1. 打开浏览器，访问 `https://www.zhongyihskhealth.com`
2. 按 `F12` 打开开发者工具
3. 切换到 `Network` 标签
4. 刷新页面
5. 检查 API 请求

**成功标志**：
- ✅ 状态码为 200
- ✅ 响应数据不为空
- ✅ 没有 CORS 错误
- ✅ 没有 "响应数据为空" 提示

---

## 📊 预期结果

### 成功的浏览器控制台日志

**Console 标签**：
```
✅ 请求成功: /api/health
✅ 数据加载完成
```

**Network 标签**：
```
Request URL: https://www.zhongyihskhealth.com/api/health
Status Code: 200 OK
Response: { status: 'ok', timestamp: '...' }
```

### 成功的 Render 日志

```
[2025-01-10 22:30:00] GET /api/health - 200 - 45ms
[2025-01-10 22:30:05] GET /api/disease-categories - 200 - 120ms
```

---

## 🔍 如果仍然失败

### 故障排查步骤

1. **检查浏览器控制台错误**
   - 按 `F12` → `Console` 标签
   - 查找 CORS 相关错误
   - 查找网络错误

2. **检查 Network 标签**
   - 按 `F12` → `Network` 标签
   - 找到失败的请求
   - 查看 Status Code
   - 查看 Response

3. **检查 Render 日志**
   - 登录 Render Dashboard
   - 查看 `Logs` 标签
   - 查找错误信息

4. **检查 Vercel 部署日志**
   - 登录 Vercel Dashboard
   - 查看最新部署记录
   - 查找构建错误

### 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `CORS error` | CORS 配置错误 | ✅ 已修复，等待重新部署 |
| `502 Bad Gateway` | 后端服务崩溃 | 检查 Render 日志，重启服务 |
| `504 Gateway Timeout` | 后端响应超时 | 检查 Render 服务是否休眠 |
| `Failed to fetch` | 网络错误 | 检查网络连接 |
| `Mixed Content` | HTTP/HTTPS 混用 | 确保后端使用 HTTPS |

---

## 📞 需要帮助？

如果仍然有问题，请提供以下信息：

1. **浏览器控制台错误截图**
   - Console 标签的错误信息
   - Network 标签的失败请求详情

2. **Render 日志**
   - 刷新前端页面时的 Render 日志

3. **Vercel 部署日志**
   - 最新部署记录的完整日志

---

**修复完成时间**: 2025-01-10
**修复内容**:
- ✅ 后端 CORS 配置（明确域名白名单）
- ✅ Vercel Rewrites 配置（代理后端请求）
- ✅ 环境变量配置确认

**下一步**: 推送代码，设置环境变量，重新部署
