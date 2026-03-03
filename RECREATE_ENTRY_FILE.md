# 重新创建 NestJS 应用入口文件

## 问题根源

之前我们删除了所有 Serverless Function 文件，导致 Vercel 不知道如何启动 NestJS 应用。

**结果：**
- ✅ Vercel 构建成功
- ✅ 部署状态 Ready
- ❌ 连接超时（ERR_CONNECTION_TIMED_OUT）

**原因：**
NestJS 应用需要一个入口文件来处理 HTTP 请求，但是我们删除了所有入口文件。

---

## 解决方案

重新创建 `server/api/index.ts` 文件，作为 NestJS 应用的入口。

---

## 文件内容

```typescript
/**
 * Vercel Serverless Function - NestJS 应用入口
 * 这个文件启动 NestJS 应用并处理所有 API 请求
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

// 创建 NestJS 应用实例（全局变量，避免重复创建）
let app: any = null;

export default async function handler(req: any, res: any) {
  // 如果应用还没有启动，先启动
  if (!app) {
    try {
      // 创建 NestJS 应用
      app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log'],
      });

      // 配置全局验证管道
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        })
      );

      // 启用 CORS
      app.enableCors({
        origin: '*',
        credentials: true,
      });

      // 启动应用（使用 Vercel 提供的端口）
      await app.init();

      console.log('NestJS application started successfully');
    } catch (error) {
      console.error('Failed to start NestJS application:', error);
      res.status(500).json({
        error: 'Failed to start server',
        message: error.message,
      });
      return;
    }
  }

  // 使用 NestJS Express 实例处理请求
  try {
    const expressApp = app.getHttpAdapter().getInstance();
    return expressApp(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
```

---

## 手动创建步骤

### 步骤 1：访问 GitHub 仓库

```
https://github.com/superdxhua/tcm-smart-diagnosis
```

### 步骤 2：创建新文件

1. 点击 "Add file" → "Create new file"

2. 文件路径：`server/api/index.ts`

3. 粘贴上面的代码

4. 提交信息：
   ```
   fix: 重新创建 NestJS 应用入口文件，修复 Vercel 连接超时问题
   ```

5. 点击 "Commit changes"

---

## 完成后测试

### 步骤 1：等待 Vercel 自动部署

预计部署时间：1-2 分钟

### 步骤 2：测试 API 端点

#### 测试 1：健康检查端点
```
https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/api/health
```

**预期响应：**
```json
{
  "status": "ok",
  "message": "Service is healthy",
  "timestamp": "2024-02-22T...",
  "uptime": 123.456
}
```

#### 测试 2：版本端点
```
https://tcm-smart-diagnosis-backend-git-main-superdxhuas-projects.vercel.app/api/version
```

**预期响应：**
```json
{
  "name": "tcm-smart-diagnosis",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## 预期结果

| 项目 | 之前 | 现在 |
|------|------|------|
| 部署状态 | ✅ Ready | ✅ Ready |
| 连接状态 | ❌ 超时 | ✅ 正常 |
| 健康检查 | ❌ 不可访问 | ✅ 正常 |
| 版本端点 | ❌ 不可访问 | ✅ 正常 |

---

## 请告诉我

创建文件后，请告诉我：

1. ✅ 文件创建成功了吗？
2. ✅ Vercel 部署成功了吗？
3. ✅ API 端点能否正常访问？
4. ✅ 响应内容是什么？
