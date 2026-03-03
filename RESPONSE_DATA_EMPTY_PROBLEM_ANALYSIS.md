# "响应数据为空"问题完整分析与解决方案

## 📋 问题描述

**现象**：访问 `www.zhongyihskhealth.com` 子域名时，前端提示"响应数据为空，请检查网络连接"

**影响范围**：
- ✅ 本地开发环境：正常工作
- ✅ Render 后端 API：正常运行
- ❌ Vercel 前端生产环境：无法连接后端

---

## 🔍 问题诊断过程

### 1. 检查 Render 后端 API ✅

**测试结果**：
```bash
curl https://tcm-smart-diagnosis-api.onrender.com/api/health
# 响应：{"status":"success","data":"2026-02-28T14:04:58.454Z"} ✅

curl https://tcm-smart-diagnosis-api.onrender.com/api/disease-categories
# 响应：{"code":200,"msg":"success","data":[...]} ✅
```

**结论**：Render 后端 API 完全正常运行，CORS 配置正确（`origin: true`）

---

### 2. 检查域名解析 ✅

**测试结果**：
```bash
nslookup www.zhongyihskhealth.com
# 解析结果：df752034ddc07555.vercel-dns-017.com ✅
```

**结论**：`www.zhongyihskhealth.com` 正确解析到 Vercel

---

### 3. 检查前端网络请求逻辑 ✅

**文件**：`src/network.ts`

**关键代码**：
```typescript
const createUrl = (url: string): string => {
    // 如果已经是完整 URL，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }
    // 如果 PROJECT_DOMAIN 为 "/"，使用相对路径（让 vite 代理处理）
    if (PROJECT_DOMAIN === '/') {
        return url
    }
    // 否则添加 PROJECT_DOMAIN 前缀
    return `${PROJECT_DOMAIN}${url}`
}
```

**结论**：网络请求逻辑正确，会根据 `PROJECT_DOMAIN` 变量拼接 URL

---

### 4. 检查环境变量配置 ⚠️

**文件**：`.env.production`

**配置内容**：
```bash
PROJECT_DOMAIN=https://tcm-smart-diagnosis-api.onrender.com
```

**文件**：`config/index.ts`

**注入逻辑**：
```typescript
defineConstants: {
  PROJECT_DOMAIN: JSON.stringify(
    process.env.PROJECT_DOMAIN ||
      process.env.COZE_PROJECT_DOMAIN_DEFAULT ||
      '',
  ),
  TARO_ENV: JSON.stringify(process.env.TARO_ENV),
},
```

**潜在问题**：
- ⚠️ `.env.production` 文件存在，但 Vercel 构建时可能不会自动读取
- ⚠️ 如果 `process.env.PROJECT_DOMAIN` 为 `undefined`，`PROJECT_DOMAIN` 会被注入为空字符串
- ⚠️ 空字符串 `""` 不等于 `"/"`，所以会拼接为 `${""}${url}` = `url`（相对路径）
- ⚠️ 相对路径 `/api/*` 在 Vercel 上无法工作，因为 Vercel 上没有后端服务

---

## 🎯 问题根源分析

### 根本原因

**Vercel 环境变量 `PROJECT_DOMAIN` 未正确设置**

### 详细解释

1. **本地开发环境**（正常工作）
   ```
   .env.local 或 .env
   PROJECT_DOMAIN=/
   ↓
   Vite 代理将 /api/* 代理到 http://localhost:3000/api/*
   ↓
   ✅ 正常工作
   ```

2. **Vercel 生产环境**（可能出现问题）
   ```
   Vercel Dashboard 环境变量
   PROJECT_DOMAIN = undefined（未设置）
   ↓
   config/index.ts 注入 PROJECT_DOMAIN = ""（空字符串）
   ↓
   createUrl("/api/health") = "" + "/api/health" = "/api/health"（相对路径）
   ↓
   浏览器请求：https://www.zhongyihskhealth.com/api/health
   ↓
   ❌ Vercel 上没有 /api/health 路由，返回 404 或无响应
   ```

3. **正确的 Vercel 生产环境**（应该这样）
   ```
   Vercel Dashboard 环境变量
   PROJECT_DOMAIN = https://tcm-smart-diagnosis-api.onrender.com
   ↓
   config/index.ts 注入 PROJECT_DOMAIN = "https://tcm-smart-diagnosis-api.onrender.com"
   ↓
   createUrl("/api/health") = "https://tcm-smart-diagnosis-api.onrender.com" + "/api/health"
   ↓
   浏览器请求：https://tcm-smart-diagnosis-api.onrender.com/api/health
   ↓
   ✅ Render 后端正常响应
   ```

---

## ✅ 解决方案

### 方案 1：在 Vercel Dashboard 中设置环境变量（推荐）

**步骤**：

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目：`tcm-smart-diagnosis`
3. 进入 **Settings** → **Environment Variables**
4. 添加环境变量：
   - **Key**: `PROJECT_DOMAIN`
   - **Value**: `https://tcm-smart-diagnosis-api.onrender.com`
   - **Environment**: Production（生产环境）
5. 点击 **Save**
6. 触发重新部署：
   - 进入 **Deployments**
   - 点击最新部署右侧的 **...** → **Redeploy**

**验证**：
```bash
# 重新部署后，打开浏览器控制台
# 访问 https://www.zhongyihskhealth.com
# 查看网络请求，应该看到：
# Request: https://tcm-smart-diagnosis-api.onrender.com/api/health ✅
# 而不是：
# Request: https://www.zhongyihskhealth.com/api/health ❌
```

---

### 方案 2：修改构建配置，强制使用 .env.production（备选）

**步骤**：

1. 修改 `config/index.ts`：
   ```typescript
   // 加载 .env.production 文件（强制）
   const envFile = path.resolve(__dirname, '../.env.production');
   dotenv.config({ path: envFile, override: true });

   export default defineConfig<'vite'>(async (merge, _env) => {
     // ...
     defineConstants: {
       PROJECT_DOMAIN: JSON.stringify(
         process.env.PROJECT_DOMAIN ||
           process.env.COZE_PROJECT_DOMAIN_DEFAULT ||
           'https://tcm-smart-diagnosis-api.onrender.com', // 兜底值
       ),
       TARO_ENV: JSON.stringify(process.env.TARO_ENV),
     },
   });
   ```

2. 提交代码并触发 Vercel 重新部署

**缺点**：
- 不符合最佳实践（环境变量应该通过平台配置，而不是硬编码）
- 降低了灵活性（每次更换后端地址都需要修改代码）

---

### 方案 3：使用 Vercel 的环境变量优先级（推荐作为补充）

**步骤**：

1. 确保 `.vercelignore` 中没有忽略 `.env.production`
2. 确保 `.gitignore` 中没有忽略 `.env.production`
3. 将 `.env.production` 提交到 Git（已包含敏感信息，需要确认安全性）
4. Vercel 会自动读取根目录的 `.env.production` 文件

**注意事项**：
- ⚠️ `.env.production` 包含敏感信息（API 密钥、JWT Secret 等）
- ⚠️ 提交到 Git 存在安全风险
- ⚠️ 不建议在生产环境中使用此方案

---

## 🧪 验证步骤

### 1. 检查 Vercel 环境变量

```bash
# 方法 1：通过 Vercel Dashboard 检查
# 1. 打开 Vercel Dashboard
# 2. 选择项目 → Settings → Environment Variables
# 3. 检查是否存在 PROJECT_DOMAIN 变量
# 4. 检查值是否为 https://tcm-smart-diagnosis-api.onrender.com

# 方法 2：通过 Vercel CLI 检查
vercel env ls
```

### 2. 检查前端构建产物

```bash
# 本地构建生产版本
npm run build:h5

# 检查构建产物中的 PROJECT_DOMAIN
grep -r "PROJECT_DOMAIN" dist-web/
# 应该看到：
# PROJECT_DOMAIN="https://tcm-smart-diagnosis-api.onrender.com"
# 而不是：
# PROJECT_DOMAIN=""  或  PROJECT_DOMAIN=undefined
```

### 3. 浏览器控制台验证

```javascript
// 打开 https://www.zhongyihskhealth.com
// 打开浏览器控制台（F12）
// 查看网络请求（Network 标签）

// 正确情况（应该看到）：
// Request: https://tcm-smart-diagnosis-api.onrender.com/api/health
// Status: 200 OK
// Response: {"status":"success","data":"..."}

// 错误情况（不应该看到）：
// Request: https://www.zhongyihskhealth.com/api/health
// Status: 404 Not Found
// 或
// Status: (failed) net::ERR_CONNECTION_REFUSED
```

---

## 📊 问题总结

| 检查项 | 状态 | 说明 |
|--------|------|------|
| Render 后端 API | ✅ 正常 | https://tcm-smart-diagnosis-api.onrender.com/api/health 正常响应 |
| 域名解析 | ✅ 正常 | www.zhongyihskhealth.com 正确解析到 Vercel |
| CORS 配置 | ✅ 正常 | 后端设置 `origin: true` 允许所有来源 |
| 前端网络请求逻辑 | ✅ 正常 | `createUrl` 函数逻辑正确 |
| `.env.production` 文件 | ✅ 存在 | 包含正确的 `PROJECT_DOMAIN` 配置 |
| **Vercel 环境变量** | ⚠️ **未知** | **需要在 Vercel Dashboard 中手动设置** |

---

## 🚀 立即行动清单

### 必须完成（高优先级）

- [ ] **登录 Vercel Dashboard**
- [ ] **进入项目 Settings → Environment Variables**
- [ ] **添加环境变量 `PROJECT_DOMAIN=https://tcm-smart-diagnosis-api.onrender.com`**
- [ ] **触发 Vercel 重新部署**
- [ ] **在浏览器中测试 https://www.zhongyihskhealth.com**
- [ ] **打开浏览器控制台，检查网络请求是否指向 Render**

### 可选完成（低优先级）

- [ ] **添加调试页面，显示当前的 `PROJECT_DOMAIN` 值**
- [ ] **添加环境变量验证逻辑，在启动时检查关键配置**
- [ ] **编写自动化测试，验证前端网络请求**

---

## 💡 最佳实践建议

### 1. 环境变量管理

```bash
# .env.local（本地开发，不提交到 Git）
PROJECT_DOMAIN=/

# .env.production（生产环境，可提交到 Git，但需注意安全）
PROJECT_DOMAIN=https://tcm-smart-diagnosis-api.onrender.com

# Vercel Dashboard（推荐方式）
# 手动在 Vercel Dashboard 中设置环境变量
# 优先级最高，会覆盖 .env.production 中的值
```

### 2. 调试技巧

```typescript
// 在启动时打印环境变量
console.log('=== 环境变量检查 ===')
console.log('PROJECT_DOMAIN:', PROJECT_DOMAIN)
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('TARO_ENV:', process.env.TARO_ENV)

// 在 Network.request 中打印请求 URL
export const request: typeof Taro.request = option => {
    const fullUrl = createUrl(option.url)
    console.log('[Network] Request:', {
        originalUrl: option.url,
        fullUrl: fullUrl,
        PROJECT_DOMAIN: PROJECT_DOMAIN,
    })
    // ...
}
```

### 3. 错误处理

```typescript
// 添加网络请求错误处理
export const request: typeof Taro.request = option => {
    return Taro.request({
        // ...
    }).catch(error => {
        console.error('[Network] Request Failed:', {
            url: fullUrl,
            error: error,
            PROJECT_DOMAIN: PROJECT_DOMAIN,
        })
        Taro.showToast({
            title: '网络请求失败，请检查网络连接',
            icon: 'none'
        })
        throw error
    })
}
```

---

## 📞 技术支持

如果以上方案都无法解决问题，请提供以下信息：

1. Vercel Dashboard 环境变量截图（Settings → Environment Variables）
2. 浏览器控制台截图（Network 标签）
3. Vercel 部署日志（Deployments → 最新部署 → Logs）
4. 前端构建后的 `PROJECT_DOMAIN` 值（通过浏览器控制台查看）

---

**更新时间**：2026-02-28
**问题状态**：待解决（需要用户在 Vercel Dashboard 中设置环境变量）
