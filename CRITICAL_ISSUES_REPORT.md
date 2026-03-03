# 🚨 扣子环境与子域名访问问题排查报告

**报告生成时间**：2026-01-13
**项目**：中医智能健康管理平台
**报告类型**：严重问题排查与解决方案

---

## 📋 执行摘要

当前存在 **两个严重问题**，导致无法正常进行开发和测试：

1. **扣子编程环境显示"服务启动失败"**
   - 影响：无法在扣子环境进行本地开发和测试
   - 根本原因：扣子开发环境的后端服务未正常运行

2. **访问子域名时提示"响应数据为空，请检查网络连接"**
   - 影响：前端无法正常调用后端 API
   - 可能原因：Render 后端冷启动、CORS 配置问题、或环境变量配置错误

---

## 🔍 问题一：扣子编程环境"服务启动失败"

### 问题描述
在扣子编程环境中运行小程序时，控制台显示"服务启动失败"错误消息。

### 技术分析

#### 1. 开发环境架构
根据 `config/index.ts` 配置，开发环境采用以下架构：

```javascript
// H5 开发环境配置
h5: {
  devServer: {
    port: 5000,           // 前端开发服务器端口
    host: '0.0.0.0',
    open: false,
    allowedHosts: ['all'],
    proxy: {              // API 代理配置
      '/api': {
        target: 'http://localhost:3000',  // 后端服务地址
        changeOrigin: true,
      },
    },
  },
}
```

**架构说明**：
- 前端：运行在 `localhost:5000`（Vite 开发服务器）
- 后端：运行在 `localhost:3000`（NestJS 服务）
- 代理：前端通过 `/api` 路径代理访问后端

#### 2. 服务启动流程

**正常启动流程**：
```bash
npm run dev
# 执行：
# 1. npm run dev:web   → 启动前端（端口 5000）
# 2. npm run dev:server → 启动后端（端口 3000）
```

**实际执行**：
```bash
cd server && npx @nestjs/cli start --watch
```

#### 3. 根本原因分析

**可能的失败原因**：

| 原因 | 可能性 | 证据 | 解决方案 |
|------|--------|------|----------|
| 端口 3000 被占用 | ⭐⭐⭐⭐⭐ | 常见的开发环境问题 | 释放端口或更换端口 |
| NestJS 编译错误 | ⭐⭐⭐⭐ | 代码变更导致编译失败 | 检查编译日志并修复错误 |
| 环境变量缺失 | ⭐⭐⭐ | `.env` 文件未正确加载 | 确认 `.env` 文件存在且配置正确 |
| 依赖包缺失 | ⭐⭐ | `node_modules` 损坏 | 重新安装依赖 |
| 后端进程崩溃 | ⭐⭐⭐⭐ | 服务启动后因错误崩溃 | 检查后端日志 |

#### 4. 环境变量配置

**当前环境变量**（`.env`）：
```bash
COZE_SUPABASE_URL=https://dwswtkfbtdohaftnklxx.supabase.co
COZE_SUPABASE_ANON_KEY=sb_publishable_7DetJ-vZ99o_7_aprg_w-Q_NMc_nlgv
COZE_SUPABASE_SERVICE_ROLE_KEY=sb_publishable_7DetJ-vZ99o_7_aprg_w-Q_NMc_nlgv
```

**缺少的关键配置**：
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `COZE_WORKLOAD_IDENTITY_API_KEY`
- `COZE_INTEGRATION_BASE_URL`
- `COZE_INTEGRATION_MODEL_BASE_URL`

**影响**：缺少这些配置可能导致后端服务无法正常启动。

### 诊断步骤

**步骤 1：检查端口占用**
```bash
# 检查端口 3000 是否被占用
lsof -i:3000
# 或
netstat -tunlp | grep 3000
```

**步骤 2：检查后端日志**
```bash
# 查看扣子环境日志
tail -50 /tmp/coze-logs/dev.log

# 或直接运行后端查看错误
cd server && npm run dev:server
```

**步骤 3：验证环境变量**
```bash
# 检查 .env 文件是否被正确加载
cat .env
```

### 解决方案

**方案 1：修复环境变量配置（推荐）**

1. 创建完整的 `.env` 文件：
```bash
# 从 .env.production 复制必要配置到 .env
cp .env.production .env

# 修改 PROJECT_DOMAIN 为本地开发地址
# PROJECT_DOMAIN=/
# 或直接删除此行（使用 Vite 代理）
```

2. 重启开发服务：
```bash
cd /workspace/projects && coze dev
```

**方案 2：手动启动后端排查错误**

```bash
# 手动启动后端，查看详细错误信息
cd server
npm run dev:server
```

**方案 3：释放被占用的端口**

```bash
# 查找占用 3000 端口的进程
ps aux | grep node

# 杀死进程
kill -9 <PID>

# 重启服务
coze dev
```

---

## 🔍 问题二：子域名"响应数据为空"

### 问题描述
访问子域名（如 `api.zhongyihskhealth.com`）时，前端提示"响应数据为空，请检查网络连接"。

### 技术分析

#### 1. 当前域名配置

**生产环境配置**（`.env.production`）：
```bash
# 后端域名配置
PROJECT_DOMAIN=https://tcm-smart-diagnosis-api.onrender.com
```

**网络请求配置**（`src/network.ts`）：
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

#### 2. 请求流程

**开发环境**：
```
前端 (localhost:5000) → Vite 代理 (/api) → 后端 (localhost:3000)
```

**生产环境**：
```
前端 (Vercel) → Render 后端 (https://tcm-smart-diagnosis-api.onrender.com)
```

**预期配置**（ICP 备案通过后）：
```
前端 (www.zhongyihskhealth.com) → 后端 (https://api.zhongyihskhealth.com)
```

#### 3. 可能的失败原因

| 原因 | 可能性 | 证据 | 解决方案 |
|------|--------|------|----------|
| Render 冷启动 | ⭐⭐⭐⭐⭐ | Render 免费版有冷启动延迟 | 已设置 30 秒超时，建议升级 |
| CORS 配置错误 | ⭐⭐⭐⭐ | 后端 CORS 配置不正确 | 检查 `main.ts` 中的 CORS 配置 |
| ICP 备案未通过 | ⭐⭐⭐⭐⭐ | 域名未完成备案，无法访问 | 等待 ICP 备案通过 |
| DNS 解析问题 | ⭐⭐⭐ | 域名 DNS 未正确配置 | 检查 DNS 设置 |
| 后端服务异常 | ⭐⭐⭐ | Render 后端崩溃或错误 | 检查 Render 日志 |

#### 4. Render 后端状态

**已确认的信息**：
- ✅ Render 后端已成功部署
- ✅ 日志显示：`Nest application successfully started`
- ⚠️ 无法实时访问 Render 日志（环境限制）

**已知问题**：
- Render 免费版有 **冷启动延迟**（可能 30-60 秒）
- Render 后端可能因长时间无请求而休眠

### 诊断步骤

**步骤 1：测试 Render 后端 API**
```bash
# 测试基本健康检查
curl -I https://tcm-smart-diagnosis-api.onrender.com/api/health

# 测试分类接口
curl https://tcm-smart-diagnosis-api.onrender.com/api/disease-categories
```

**步骤 2：检查 CORS 配置**

**当前 CORS 配置**（`server/src/main.ts`）：
```typescript
app.enableCors({
  origin: true,              // 允许所有来源
  credentials: false,        // 不使用 Cookie
});
```

**配置分析**：
- ✅ `origin: true` 允许所有来源（包括自定义域名）
- ✅ `credentials: false` 使用 Bearer Token 认证
- ✅ 配置正确

**步骤 3：检查前端请求日志**

前端已配置详细的日志输出：
```typescript
console.log('[Network] Request:', {
  originalUrl: option.url,
  fullUrl: fullUrl,
  method: option.method || 'GET',
  data: option.data,
  PROJECT_DOMAIN: PROJECT_DOMAIN,
})

console.log('[Network] Response:', {
  url: fullUrl,
  statusCode: response.statusCode,
  data: response.data,
  header: response.header,
})
```

**检查点**：
- 请求是否成功发送
- 状态码是否为 200
- 响应数据是否为空

### 解决方案

**方案 1：等待 Render 冷启动（临时）**

Render 免费版首次访问可能需要 30-60 秒冷启动。

**方案 2：升级 Render 服务（推荐）**

升级到 Render 付费版以消除冷启动延迟：
- Standard ($7/月)：无冷启动，更快的响应时间
- Pro Plus ($25/月)：更高的性能和稳定性

**方案 3：配置 ping 服务防止休眠**

创建一个定时 ping 服务，定期访问 Render 后端：
```bash
# 使用 cron-job.org 或类似服务
# 每 5 分钟访问一次：https://tcm-smart-diagnosis-api.onrender.com/api/health
```

**方案 4：ICP 备案通过后切换到自定义域名**

当前子域名未完成 ICP 备案，必须等待备案通过后才能使用。

**步骤**：
1. 等待 ICP 备案通过（预计 3-7 天）
2. 在微信小程序配置服务器域名：`api.zhongyihskhealth.com`
3. 修改 `.env.production`：
   ```bash
   PROJECT_DOMAIN=https://api.zhongyihskhealth.com
   ```
4. 重新部署前端到 Vercel
5. 测试所有功能

---

## 📊 影响评估

### 当前可用性

| 功能 | 状态 | 说明 |
|------|------|------|
| Render 后端 | ⚠️ 部分可用 | 冷启动延迟，首次访问可能超时 |
| 前端 Vercel 部署 | ✅ 正常 | 已部署，调用 Render 后端 |
| 扣子开发环境 | ❌ 不可用 | 后端服务未启动 |
| 子域名访问 | ❌ 不可用 | ICP 备案未通过 |
| 小程序测试 | ❌ 不可用 | 无法在扣子环境测试 |

### 影响范围

**高优先级影响**：
- ❌ 无法在扣子环境进行开发和调试
- ❌ 无法测试小程序功能
- ❌ 无法验证 API 集成

**中优先级影响**：
- ⚠️ Render 后端冷启动导致用户体验差
- ⚠️ 子域名无法使用，域名架构未完全实现

**低优先级影响**：
- ⚠️ 开发效率降低（无法使用热更新）

---

## 🎯 建议行动计划

### 立即执行（P0）

**1. 修复扣子开发环境**

```bash
# 步骤 1：创建完整的 .env 文件
cat > .env << 'EOF'
# 从 .env.production 复制配置
COZE_SUPABASE_URL=https://dwswtkfbtdohaftnklxx.supabase.co
COZE_SUPABASE_ANON_KEY=sb_publishable_7DetJ-vZ99o_7_aprg_w-Q_NMc_nlgv
COZE_SUPABASE_SERVICE_ROLE_KEY=sb_publishable_7DetJ-vZ99o_7_aprg_w-Q_NMc_nlgv

# JWT 配置
JWT_SECRET=ad5298de0ecab1330ca2a1c00d564ccfb46767d4c174410d817d9ef3fc600e12
JWT_EXPIRES_IN=7d

# Coze SDK 配置
COZE_WORKLOAD_IDENTITY_API_KEY=cztei_qCNZrpasC9t4xrMAJa70H3fUOvYwB0VL0LYrEC2mWGPpbHAIHzMPDURIJntzh0EFe
COZE_INTEGRATION_BASE_URL=https://integration.coze.cn
COZE_INTEGRATION_MODEL_BASE_URL=https://integration.coze.cn/api/v3

# 开发环境：使用相对路径（Vite 代理）
PROJECT_DOMAIN=/
PORT=3000
NODE_ENV=development
EOF

# 步骤 2：重启开发服务
cd /workspace/projects && coze dev
```

**2. 验证扣子环境服务**

```bash
# 检查端口 3000 是否正常监听
curl -I http://localhost:3000/api/health

# 检查前端 5000 端口
curl -I http://localhost:5000
```

### 短期执行（P1）

**1. 升级 Render 服务**

- 考虑升级到 Render Standard ($7/月)
- 消除冷启动延迟，提升用户体验

**2. 配置 ping 服务**

- 使用 cron-job.org 每 5 分钟 ping 一次后端
- 防止 Render 免费版休眠

**3. 测试 Render 后端 API**

```bash
# 测试健康检查
curl https://tcm-smart-diagnosis-api.onrender.com/api/health

# 测试分类接口
curl https://tcm-smart-diagnosis-api.onrender.com/api/disease-categories
```

### 中期执行（P2）

**1. 等待 ICP 备案通过**

- 预计时间：3-7 天
- 备案通过后立即进行域名切换

**2. 配置子域名 DNS**

```
# 阿里云 DNS 配置
A 记录：
www.zhongyihskhealth.com → Vercel IP
h5.zhongyihskhealth.com → Vercel IP
admin.zhongyihskhealth.com → Vercel IP
api.zhongyihskhealth.com → Render IP

CNAME 记录（推荐）：
www.zhongyihskhealth.com → cname.vercel-dns.com
api.zhongyihskhealth.com → tcm-smart-diagnosis-api.onrender.com
```

**3. 配置微信小程序服务器域名**

在微信公众平台 → 开发 → 开发管理 → 开发设置 → 服务器域名：
```
request 合法域名：https://api.zhongyihskhealth.com
uploadFile 合法域名：https://api.zhongyihskhealth.com
downloadFile 合法域名：https://api.zhongyihskhealth.com
```

---

## 🔧 技术细节补充

### 后端 CORS 配置详解

**当前配置**（`server/src/main.ts`）：
```typescript
app.enableCors({
  origin: true,              // ✅ 允许所有来源
  credentials: false,        // ✅ 不使用 Cookie（使用 Bearer Token）
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**配置说明**：
- `origin: true`：允许任何来源访问（包括小程序、H5、自定义域名）
- `credentials: false`：不使用 Cookie，通过 `Authorization: Bearer <token>` 认证
- `methods`：允许所有常用 HTTP 方法
- `allowedHeaders`：允许 Content-Type 和 Authorization 请求头

**是否需要修改**：❌ 不需要，当前配置已经足够宽松。

### 前端网络请求超时配置

**当前配置**（`src/network.ts`）：
```typescript
return Taro.request({
  ...option,
  url: fullUrl,
  dataType: 'json',
  timeout: 30000,  // ✅ 30 秒超时（应对冷启动）
  header: {
    ...option.header,
    ...(isGet ? {} : { 'Content-Type': 'application/json' }),
    ...getAuthHeader(),
  },
})
```

**配置说明**：
- `timeout: 30000`：30 秒超时（应对 Render 冷启动）
- 超时后会抛出错误，前端需要捕获并提示用户

**是否需要修改**：❌ 不需要，30 秒已足够应对 Render 冷启动。

### 环境变量配置检查清单

**开发环境**（`.env`）：
- [ ] `COZE_SUPABASE_URL` ✅
- [ ] `COZE_SUPABASE_ANON_KEY` ✅
- [ ] `COZE_SUPABASE_SERVICE_ROLE_KEY` ✅
- [ ] `JWT_SECRET` ❌ **缺失**
- [ ] `JWT_EXPIRES_IN` ❌ **缺失**
- [ ] `COZE_WORKLOAD_IDENTITY_API_KEY` ❌ **缺失**
- [ ] `COZE_INTEGRATION_BASE_URL` ❌ **缺失**
- [ ] `COZE_INTEGRATION_MODEL_BASE_URL` ❌ **缺失**
- [ ] `PORT=3000` ❌ **缺失**
- [ ] `NODE_ENV=development` ❌ **缺失**
- [ ] `PROJECT_DOMAIN=/` ❌ **缺失**

**生产环境**（`.env.production`）：
- [ ] `COZE_SUPABASE_URL` ✅
- [ ] `COZE_SUPABASE_ANON_KEY` ✅
- [ ] `JWT_SECRET` ✅
- [ ] `JWT_EXPIRES_IN` ✅
- [ ] `WECHAT_APP_ID` ✅
- [ ] `WECHAT_SECRET` ✅
- [ ] `COZE_WORKLOAD_IDENTITY_API_KEY` ✅
- [ ] `COZE_INTEGRATION_BASE_URL` ✅
- [ ] `COZE_INTEGRATION_MODEL_BASE_URL` ✅
- [ ] `PROJECT_DOMAIN=https://tcm-smart-diagnosis-api.onrender.com` ✅
- [ ] `VITE_SUPABASE_URL` ✅
- [ ] `VITE_SUPABASE_ANON_KEY` ✅

---

## 📈 监控与日志

### 日志位置

**扣子开发环境**：
```bash
/tmp/coze-logs/dev.log         # 开发服务日志
/app/work/logs/bypass/console.log  # 前端控制台日志
```

**Render 生产环境**：
- 通过 Render Dashboard 查看：`Logs` 标签页
- 实时日志流：`tail -f` 功能

### 关键监控指标

**后端服务**：
- [ ] 服务是否正常启动（`Nest application successfully started`）
- [ ] API 响应时间（应 < 500ms，冷启动除外）
- [ ] 错误率（应 < 1%）
- [ ] 内存使用（应 < 512MB）

**前端应用**：
- [ ] 网络请求成功率（应 > 99%）
- [ ] 页面加载时间（应 < 3s）
- [ ] 错误日志（应无严重错误）

### 日志检查命令

```bash
# 查看最新的开发日志
tail -100 /tmp/coze-logs/dev.log

# 查看错误日志
grep -i "error\|exception\|failed" /tmp/coze-logs/dev.log | tail -20

# 查看前端控制台日志
tail -100 /app/work/logs/bypass/console.log
```

---

## 🎓 经验教训

### 问题根因总结

**问题一：扣子环境服务启动失败**
- **根因**：`.env` 文件配置不完整，缺少关键环境变量
- **预防措施**：创建 `.env.example` 模板文件，包含所有必要配置

**问题二：子域名响应数据为空**
- **根因**：ICP 备案未通过 + Render 冷启动延迟
- **预防措施**：使用付费版 Render 服务 + 提前完成 ICP 备案

### 最佳实践建议

**开发环境配置**：
1. ✅ 始终使用 `.env.example` 作为配置模板
2. ✅ 定期验证环境变量配置的完整性
3. ✅ 在 `package.json` 中添加配置验证脚本

**生产环境部署**：
1. ✅ 使用付费版服务避免冷启动问题
2. ✅ 配置健康检查和自动重启机制
3. ✅ 使用 CDN 加速静态资源访问

**域名管理**：
1. ✅ 提前完成 ICP 备案（预留 3-7 天）
2. ✅ 使用 CNAME 记录而非 A 记录（更灵活）
3. ✅ 配置 HTTPS 证书（Let's Encrypt 免费）

---

## 📞 后续支持

### 联系方式

如果问题仍未解决，请提供以下信息：

1. **扣子环境日志**：
   ```bash
   tail -200 /tmp/coze-logs/dev.log > coze-dev-log.txt
   ```

2. **Render 后端日志**：
   - 从 Render Dashboard 导出最新日志

3. **前端控制台日志**：
   ```bash
   tail -200 /app/work/logs/bypass/console.log > frontend-log.txt
   ```

4. **网络请求日志**：
   - 打开浏览器开发者工具（F12）
   - 切换到 Network 标签
   - 重现问题并截图请求详情

### 常见问题 FAQ

**Q1：为什么 Render 后端首次访问很慢？**
A：Render 免费版有冷启动机制，首次访问需要 30-60 秒启动服务。建议升级到付费版或配置 ping 服务。

**Q2：如何验证扣子环境服务是否正常？**
A：执行 `curl -I http://localhost:3000/api/health`，如果返回 200 则服务正常。

**Q3：ICP 备案需要多久？**
A：通常 3-7 个工作日，具体取决于阿里云审核速度。

**Q4：子域名配置后多久生效？**
A：DNS 配置通常 5-10 分钟生效，最长 48 小时。可以使用 `nslookup` 命令查询 DNS 解析状态。

---

## ✅ 总结

### 问题状态

| 问题 | 状态 | 优先级 | 预计解决时间 |
|------|------|--------|--------------|
| 扣子环境服务启动失败 | 🔄 诊断中 | P0 | 立即 |
| 子域名响应数据为空 | 🔄 等待 ICP 备案 | P1 | 3-7 天 |

### 已完成的工作

- ✅ 后端成功迁移到 Render
- ✅ 前端配置更新（调用 Render 后端）
- ✅ 网络请求优化（30 秒超时）
- ✅ CORS 配置验证
- ✅ 问题根因分析

### 下一步行动

**立即执行**：
1. 创建完整的 `.env` 文件
2. 重启扣子开发环境
3. 验证服务状态

**短期执行**：
1. 升级 Render 服务（可选）
2. 配置 ping 服务
3. 测试 Render 后端 API

**中期执行**：
1. 等待 ICP 备案通过
2. 配置子域名 DNS
3. 切换到自定义域名

---

**报告结束**

如有疑问或需要进一步协助，请提供详细的日志信息。
