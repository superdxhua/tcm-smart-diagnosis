# Vercel Serverless Functions 后端部署指南

## 概述

本指南介绍如何将 NestJS 后端改造为 Vercel Serverless Functions，实现前后端统一部署到 Vercel。

## 架构对比

### 当前架构（传统）

```
前端 (Vercel) → API 请求 → 后端 (Render/Railway)
```

### 新架构（Vercel Functions）

```
前端 (Vercel) → Serverless Functions → Database (Supabase)
        ↓
    同一项目
```

## 优势

✅ **统一部署**：前后端一起部署，无需管理多个平台  
✅ **自动扩缩容**：Vercel 自动处理流量  
✅ **全球部署**：函数自动部署到全球边缘节点  
✅ **降低成本**：按需计费，无服务器成本  
✅ **简化运维**：无需管理服务器  

## 改造步骤

### 步骤 1：安装依赖

```bash
pnpm add -D @vercel/node
```

### 步骤 2：创建函数目录结构

```
api/
  auth/
    login.ts
    register.ts
  medical-ai/
    recommend.ts
    differentiate.ts
  patients/
    index.ts
    [id].ts
  ...
```

### 步骤 3：迁移控制器

以登录接口为例：

#### 原代码（NestJS）

```typescript
// server/src/auth/auth.controller.ts
@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() body: LoginRequest) {
    // 登录逻辑
  }
}
```

#### 新代码（Vercel Function）

```typescript
// api/auth/login.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AuthService } from '../../../server/src/auth/auth.service';

const authService = new AuthService();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS 处理
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ code: 405, msg: 'Method not allowed' });
  }

  try {
    const result = await authService.login(req.body);
    return res.status(200).json({ code: 200, msg: 'success', data: result });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({ code: 401, msg: error.message });
  }
}

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};
```

### 步骤 4：创建共享服务

```typescript
// api/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 步骤 5：迁移关键接口

#### API 路由映射

| NestJS 路由 | Vercel Function | 文件路径 |
|------------|----------------|---------|
| `POST /api/auth/login` | `/api/auth/login` | `api/auth/login.ts` |
| `POST /api/auth/register` | `/api/auth/register` | `api/auth/register.ts` |
| `POST /api/medical-ai/recommend` | `/api/medical-ai/recommend` | `api/medical-ai/recommend.ts` |
| `GET /api/patients` | `/api/patients` | `api/patients/index.ts` |
| `GET /api/patients/:id` | `/api/patients/[id]` | `api/patients/[id].ts` |

#### 动态路由示例

```typescript
// api/patients/[id].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ code: 404, msg: 'Patient not found' });
    }

    return res.status(200).json({ code: 200, msg: 'success', data });
  }

  return res.status(405).json({ code: 405, msg: 'Method not allowed' });
}
```

### 步骤 6：集成 LLM 服务

```typescript
// api/medical-ai/recommend.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { LLMClient } from 'coze-coding-dev-sdk';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ code: 405, msg: 'Method not allowed' });
  }

  const client = new LLMClient();

  try {
    const messages = [
      { role: 'system', content: '你是一位中医专家...' },
      { role: 'user', content: req.body.prompt },
    ];

    const response = await client.invoke(messages);

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: { recommendation: response },
    });
  } catch (error) {
    console.error('AI recommendation error:', error);
    return res.status(500).json({ code: 500, msg: 'AI service error' });
  }
}

export const config = {
  maxDuration: 60, // 最长执行时间 60 秒
};
```

### 步骤 7：配置环境变量

在 Vercel 项目设置中添加：

```bash
# Supabase 配置
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Coze LLM 配置
COZE_API_KEY=your_coze_api_key
COZE_API_SECRET=your_coze_api_secret

# 其他配置
JWT_SECRET=your_jwt_secret
```

### 步骤 8：更新前端配置

```typescript
// config/index.ts
h5: {
  publicPath: '/',
  devServer: {
    port: 5000,
    proxy: {
      '/api': {
        target: process.env.PROJECT_DOMAIN || '',
        changeOrigin: true,
      },
    },
  },
}
```

## 完整示例

### 认证模块

```typescript
// api/auth/login.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (!user) {
    return res.status(401).json({ code: 401, msg: '用户名或密码错误' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ code: 401, msg: '用户名或密码错误' });
  }

  // 查询用户权限
  const { data: permissions } = await supabase
    .from('user_permissions')
    .select('expires_at')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  const token = Buffer.from(JSON.stringify({
    userId: user.id,
    username: user.username,
    role: user.role,
  })).toString('base64');

  return res.status(200).json({
    code: 200,
    msg: 'success',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        expiresAt: permissions?.expires_at || null,
      },
    },
  });
}
```

## 性能优化

### 1. 启用缓存

```typescript
// api/lib/cache.ts
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 100, // 最多缓存 100 个结果
  ttl: 1000 * 60 * 5, // 5 分钟过期
});

export async function withCache<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key) as T | undefined;
  if (cached) return cached;

  const result = await fn();
  cache.set(key, result);
  return result;
}
```

### 2. 数据库连接池

```typescript
// api/lib/db-pool.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export { pool };
```

### 3. 请求限流

```typescript
// api/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 秒内最多 10 次请求
});

export async function checkRateLimit(ip: string) {
  const { success, remaining } = await ratelimit.limit(ip);
  return { success, remaining };
}
```

## 成本对比

### 传统部署

| 项目 | 月成本 |
|------|--------|
| 前端 | 免费 |
| 后端服务器 | $5-20/月 |
| 数据库 | 免费 |
| **总计** | **$5-20/月** |

### Vercel Functions

| 项目 | 月成本 |
|------|--------|
| Serverless Functions | 免费（100GB）|
| 数据库 | 免费 |
| **总计** | **$0/月** |

**节省**：$5-20/月

## 监控和日志

### Vercel Analytics

自动收集：
- 请求次数
- 响应时间
- 错误率

### 自定义日志

```typescript
console.log('[AUTH] User login:', { username, timestamp: Date.now() });
```

查看方式：
- Vercel Dashboard → Logs
- 实时日志流

## 故障排除

### 问题 1：函数超时

**原因**：函数执行时间超过限制（默认 10 秒）

**解决方案**：
```typescript
export const config = {
  maxDuration: 60, // 增加到 60 秒
};
```

### 问题 2：内存不足

**原因**：处理大量数据时内存超限

**解决方案**：
1. 使用流式处理
2. 增加内存限制（Pro 套餐）
3. 优化算法

### 问题 3：冷启动慢

**原因**：函数首次调用需要启动

**解决方案**：
1. 保持函数热度（定时 ping）
2. 使用 Vercel Edge Functions
3. 优化初始化代码

## 迁移检查清单

- [ ] 安装 @vercel/node
- [ ] 创建 api/ 目录结构
- [ ] 迁移所有控制器
- [ ] 创建共享服务
- [ ] 配置环境变量
- [ ] 测试所有接口
- [ ] 更新前端配置
- [ ] 部署到 Vercel
- [ ] 验证功能
- [ ] 监控性能

## 下一步

1. ✅ 完成接口迁移
2. ✅ 测试所有功能
3. ✅ 部署到 Vercel
4. ✅ 配置监控
5. ✅ 优化性能
6. ✅ 文档更新

## 参考资料

- [Vercel Serverless Functions 文档](https://vercel.com/docs/concepts/functions/serverless-functions)
- [NestJS 迁移指南](https://vercel.com/guides/deploying-a-nestjs-app-with-vercel)
- [Supabase 客户端库](https://supabase.com/docs/reference/javascript)
