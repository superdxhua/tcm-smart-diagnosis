# 后端 API 超时问题诊断

## 问题描述

访问 `https://zhongyi-smart.vercel.app/api/health` 时，请求超时（超过 2 分钟）。

## 可能原因

### 1. 环境变量缺失

**问题**：`getSupabaseClient()` 需要以下环境变量：
- `COZE_SUPABASE_URL`
- `COZE_SUPABASE_ANON_KEY`

如果这些变量未在 Vercel Dashboard 中配置，会导致应用初始化失败。

**解决方案**：
1. 访问 Vercel Dashboard：https://vercel.com/superdxhuas-projects/zhongyi-smart/settings/environment-variables
2. 添加以下环境变量：
   - `COZE_SUPABASE_URL`：Supabase 项目 URL
   - `COZE_SUPABASE_ANON_KEY`：Supabase 匿名访问密钥

### 2. Python 环境变量加载脚本超时

**问题**：`supabase-client.ts` 中的 `loadEnv()` 函数会尝试使用 Python 脚本加载环境变量：

```typescript
const pythonCode = `
import os
import sys
try:
    from coze_workload_identity import Client
    ...
`;
const output = execSync(`python3 -c '${pythonCode}'`, {
  encoding: 'utf-8',
  timeout: 10000,  // 10 秒超时
});
```

在 Vercel Serverless 环境中，Python 可能不可用或 `coze_workload_identity` 库未安装，导致超时。

**解决方案**：
修改 `supabase-client.ts`，在 Vercel 环境中跳过 Python 脚本加载：

```typescript
function loadEnv(): void {
  if (envLoaded || (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY)) {
    return;
  }

  try {
    // 尝试从 dotenv 加载
    try {
      require('dotenv').config();
      if (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY) {
        envLoaded = true;
        return;
      }
    } catch {
      // dotenv not available
    }

    // 在 Vercel 环境中，跳过 Python 脚本加载
    if (process.env.VERCEL) {
      console.log('[SupabaseClient] Vercel 环境，跳过 Python 脚本加载');
      return;
    }

    // 本地环境使用 Python 脚本加载
    const pythonCode = `
import os
import sys
try:
    from coze_workload_identity import Client
    client = Client()
    env_vars = client.get_project_env_vars()
    client.close()
    for env_var in env_vars:
        print(f"{env_var.key}={env_var.value}")
except Exception as e:
    print(f"# Error: {e}", file=sys.stderr)
`;

    const output = execSync(`python3 -c '${pythonCode.replace(/'/g, "'\"'\"'")}'`, {
      encoding: 'utf-8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      const eqIndex = line.indexOf('=');
      if (eqIndex > 0) {
        const key = line.substring(0, eqIndex);
        let value = line.substring(eqIndex + 1);
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }

    envLoaded = true;
  } catch (error) {
    console.error('[SupabaseClient] 加载环境变量失败:', error.message);
    // 在 Vercel 环境中，环境变量应该从 Dashboard 读取
    if (!process.env.VERCEL) {
      throw error;
    }
  }
}
```

### 3. 数据库连接超时

**问题**：Supabase 数据库连接可能超时，导致应用初始化失败。

**解决方案**：
检查 `COZE_SUPABASE_URL` 是否正确，并确保 Supabase 数据库可以访问。

### 4. 应用初始化超时

**问题**：NestJS 应用初始化时加载了太多模块，导致超时。

**解决方案**：
检查 Vercel Function 的超时配置（默认 10 秒），可以尝试：
1. 减少模块数量
2. 延长超时时间（Vercel Pro 计划支持更长的超时时间）

## 诊断步骤

### 1. 检查环境变量

访问 Vercel Dashboard：https://vercel.com/superdxhuas-projects/zhongyi-smart/settings/environment-variables

确认以下环境变量已配置：
- `COZE_SUPABASE_URL`
- `COZE_SUPABASE_ANON_KEY`
- `DATABASE_URL`（如果使用）
- `JWT_SECRET`（如果需要）

### 2. 查看 Vercel 部署日志

访问：https://vercel.com/superdxhuas-projects/zhongyi-smart/deployments

查看最新的部署日志，检查是否有以下错误：
- `COZE_SUPABASE_URL is not set`
- `COZE_SUPABASE_ANON_KEY is not set`
- Python 脚本执行超时
- 数据库连接失败

### 3. 测试前端页面

访问：https://zhongyi-smart.vercel.app/

检查前端页面是否正常加载。如果前端正常，说明 Vercel 部署没有问题，问题出在后端 API 上。

### 4. 查看控制台错误

在浏览器控制台中查看错误信息，可能有以下错误：
- `ERR_CONNECTION_TIMED_OUT`
- `504 Gateway Timeout`
- `500 Internal Server Error`

## 修复建议

### 优先级 1：配置环境变量

1. 访问 Vercel Dashboard
2. 添加 `COZE_SUPABASE_URL` 和 `COZE_SUPABASE_ANON_KEY`
3. 重新部署

### 优先级 2：修改 `supabase-client.ts`

按照上面的代码修改 `server/src/storage/database/supabase-client.ts`，在 Vercel 环境中跳过 Python 脚本加载。

### 优先级 3：简化应用初始化

如果上述步骤仍然无法解决问题，可以考虑：
1. 延迟加载数据库模块（只在需要时连接）
2. 使用懒加载模式加载部分模块
3. 分离健康检查端点（不依赖数据库）

## 健康检查端点优化建议

当前健康检查端点可能依赖数据库，建议创建一个简单的健康检查端点，不依赖任何服务：

**`api/health.ts`**：

```typescript
export default async function handler(req: any, res: any) {
  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({
      status: 'ok',
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
    });
  }
}
```

这样可以在不依赖数据库的情况下测试 API 是否正常响应。
