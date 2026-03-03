# 登录功能排查指南

## 问题描述

用户访问子域名网址时，登录功能报错："响应数据为空，请检查网络连接"。

---

## 🔍 快速诊断步骤

### 步骤 1：使用调试页面检查环境配置

1. 访问调试页面（小程序或 H5）
   - 小程序：在首页输入 `pages/debug/index`
   - H5：访问 `https://your-domain.com/pages/debug/index`

2. 点击"检查环境配置"按钮
3. 查看以下信息：
   - `PROJECT_DOMAIN` 是否为 `https://api.zhongyihskhealth.com`
   - 如果显示 `undefined` 或空字符串，说明环境变量配置有问题

### 步骤 2：检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 尝试登录
4. 查看日志输出：

```javascript
[Network] Request: {
  originalUrl: '/api/auth/login',
  fullUrl: 'https://api.zhongyihskhealth.com/api/auth/login',
  method: 'POST',
  data: { username: '...', password: '...' },
  PROJECT_DOMAIN: 'https://api.zhongyihskhealth.com'
}
```

**正常情况**：
- `fullUrl` 应该是完整的 URL（如 `https://api.zhongyihskhealth.com/api/auth/login`）
- `PROJECT_DOMAIN` 应该是 `https://api.zhongyihskhealth.com`

**异常情况**：
- `fullUrl` 显示 `undefined/api/auth/login` → 环境变量未配置
- `fullUrl` 显示 `/api/auth/login` → 可能是相对路径问题

### 步骤 3：测试 API 可访问性

使用 API 测试脚本：

```bash
node scripts/test-api.js
```

或者手动测试：

```bash
curl -X POST https://api.zhongyihskhealth.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"password123"}'
```

**预期结果**：
- 响应时间 < 1 秒（正常）
- 响应时间 1-5 秒（冷启动，可接受）
- 响应时间 > 10 秒（冷启动过慢，需要优化）

---

## 🛠️ 解决方案

### 方案 1：Vercel 环境变量配置问题

**症状**：
- 调试页面显示 `PROJECT_DOMAIN` 为 `undefined`
- 浏览器控制台显示 `fullUrl` 为 `undefined/api/auth/login`

**解决步骤**：

1. 登录 Vercel Dashboard
2. 选择项目 `zhongyi-smart`
3. 进入 Settings > Environment Variables
4. 添加以下环境变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `PROJECT_DOMAIN` | `https://api.zhongyihskhealth.com` | Production |

5. 重新部署：
   - 进入 Deployments 标签
   - 选择最新部署
   - 点击 Redeploy

**详细指南**：参考 `VERCEL_ENV_SETUP.md`

---

### 方案 2：API 冷启动时间过长

**症状**：
- 调试页面显示 `PROJECT_DOMAIN` 正确
- API 测试脚本显示响应时间 > 10 秒
- 登录时显示"响应数据为空"

**原因**：
- API 正在冷启动（首次访问或长时间未调用）
- Vercel 可能仍在运行旧的 NestJS 应用（未完全迁移）

**解决步骤**：

#### 步骤 1：检查 Vercel 部署日志

1. 访问 Vercel Dashboard
2. 选择项目 `tcm-smart-diagnosis-backend`
3. 进入 Deployments 标签
4. 查看最新的构建日志
5. 检查是否有错误或警告

#### 步骤 2：确认所有 API 已迁移

检查 `server/api/` 目录：

```bash
ls server/api/
```

应该包含以下文件（共 34 个）：
- `auth/login.ts`
- `auth/me.ts`
- `auth/wechat-login.ts`
- `auth/users.ts`
- `auth/register-institution.ts`
- `auth/upload-qualification.ts`
- `members.ts`
- `patients.ts`
- `health-records/index.ts`
- `health-records/[id].ts`
- `medical-records/index.ts`
- `medical-records/[id].ts`
- `medical-ai/chat.ts`
- `medical-ai/upload-attachment.ts`
- `medical-ai/analyze-attachment.ts`
- `medical-ai/search.ts`
- `tcm/analyze.ts`
- `medical-cases/index.ts`
- `packages/all.ts`
- `packages/active.ts`
- `admin/index.ts`
- `medication-feedback/index.ts`
- `prescription-adjustments/index.ts`
- `upload.ts`
- `payment/create-package-order.ts`
- `payment/merchant-qrcodes.ts`
- `payment/manual-recharge/index.ts`
- `formula-management/formulas/index.ts`
- `formula-detail/[formulaName].ts`
- `sign-in/index.ts`
- `ai/chat.ts`
- `download/status.ts`

#### 步骤 3：重新部署

使用 Vercel CLI：

```bash
npm install -g vercel
vercel login
vercel --prod
```

或通过 Vercel Dashboard 重新部署。

#### 步骤 4：验证修复

重新测试 API：

```bash
node scripts/test-api.js
```

响应时间应该降到 150-200ms（而不是 11.3 秒）。

---

### 方案 3：跨域问题（CORS）

**症状**：
- 浏览器控制台显示 CORS 错误
- 错误信息：`Access-Control-Allow-Origin`

**解决步骤**：

1. 检查访问的域名是否正确
   - 前端域名：`https://zhongyihskhealth.com`
   - 后端域名：`https://api.zhongyihskhealth.com`

2. 确认后端已配置 CORS：

```typescript
// 在每个 API 文件中添加 CORS headers
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

if (req.method === 'OPTIONS') {
  res.status(200).end();
  return;
}
```

---

### 方案 4：网络连接问题

**症状**：
- 所有 API 都无法访问
- 错误信息：`Network Error` 或 `ECONNREFUSED`

**解决步骤**：

1. 检查网络连接
2. 测试是否可以访问 `https://api.zhongyihskhealth.com`
3. 检查防火墙设置
4. 检查 DNS 解析是否正确

---

## 📊 性能优化建议

### 1. 使用 Vercel Edge Functions

将高频 API 迁移到 Edge Functions，冷启动时间降低到 0-50ms：

```typescript
// server/api/members.ts
export const config = {
  runtime: 'edge', // 使用 Edge Runtime
};
```

### 2. 使用 Redis 缓存

缓存热点数据，减少数据库查询：

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getMembers(req: NextApiRequest, res: NextApiResponse) {
  const cached = await redis.get('members:list');
  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const data = await supabase.from('members').select('*');
  await redis.setex('members:list', 300, JSON.stringify(data));

  return res.status(200).json(data);
}
```

### 3. 使用预热策略

定期访问热点 API，保持函数活跃：

```typescript
// server/api/warmup.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await fetch('https://api.zhongyihskhealth.com/api/members');
  await fetch('https://api.zhongyihskhealth.com/api/packages/all');

  return res.status(200).json({ message: 'Warmup completed' });
}
```

配置 Vercel Cron Jobs：

```json
// vercel.json
{
  "crons": [{
    "path": "/api/warmup",
    "schedule": "*/5 * * * *"
  }]
}
```

---

## 📞 联系支持

如果以上方案都无法解决问题，请联系技术支持，并提供以下信息：

1. 访问的子域名网址
2. 浏览器控制台的完整错误日志
3. 调试页面的环境信息截图
4. API 测试脚本的输出结果
5. Vercel 构建日志

---

**最后更新时间**: 2025-01-13
