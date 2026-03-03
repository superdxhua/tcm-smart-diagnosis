import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import * as express from 'express';
import { HttpStatusInterceptor } from '@/interceptors/http-status.interceptor';
import * as dotenv from 'dotenv';

// 检测是否在 Vercel 环境
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;

// 非生产环境下加载 .env 文件
if (!isVercel) {
  // 加载根目录的 .env 文件（不覆盖已存在的环境变量）
  const envPath = '/workspace/projects/.env';
  console.log('加载 .env 文件路径:', envPath);
  const configResult = dotenv.config({ path: envPath, override: false });
  if (configResult.error) {
    console.error('加载 .env 文件失败:', configResult.error);
  } else {
    console.log('.env 文件加载成功');
    console.log('COZE_INTEGRATION_BASE_URL:', process.env.COZE_INTEGRATION_BASE_URL);
    console.log('COZE_INTEGRATION_MODEL_BASE_URL:', process.env.COZE_INTEGRATION_MODEL_BASE_URL);
    console.log('COZE_WORKLOAD_IDENTITY_API_KEY:', process.env.COZE_WORKLOAD_IDENTITY_API_KEY ? '已配置' : '未配置');
    console.log('COZE_SUPABASE_URL:', process.env.COZE_SUPABASE_URL);
  }
} else {
  console.log('检测到 Vercel 环境，跳过 .env 文件加载');
}

function parsePort(): number {
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('-p');
  if (portIndex !== -1 && args[portIndex + 1]) {
    const port = parseInt(args[portIndex + 1], 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      return port;
    }
  }
  // ✅ 优先使用环境变量 PORT（Render/Cloudflare/Vercel 等平台提供）
  const envPort = process.env.PORT;
  if (envPort) {
    const port = parseInt(envPort, 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      console.log(`✅ 使用环境变量 PORT: ${envPort}`);
      return port;
    }
  }
  // 兜底：默认 3000（仅用于本地开发）
  return 3000;
}

/**
 * 创建 NestJS 应用实例
 * 导出此函数供 Vercel Serverless 适配器使用
 */
export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: isVercel ? ['error', 'warn'] : ['debug'],
  });

  // ✅ 明确配置 CORS，解决跨域问题
  const allowedOrigins = [
    'https://www.zhongyihskhealth.com',  // 生产环境前端域名
    'https://zhongyihskhealth.com',       // 生产环境主域名
    'http://localhost:5000',             // 本地开发前端
    'http://localhost:3000',             // 本地开发后端
    'https://zhongyi-smart.vercel.app',  // Vercel 预览域名
    // Coze 预览环境（使用通配符匹配所有 Coze 预览域名）
    /^https:\/\/[a-f0-9-]+\.dev\.coze\.site$/,  // Coze 开发环境
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // 允许无 origin 的请求（如移动端应用、Postman）
      if (!origin) {
        return callback(null, true);
      }

      // 检查是否在允许的域名列表中
      const isAllowed = allowedOrigins.some(allowed => {
        // 支持字符串匹配
        if (typeof allowed === 'string') {
          return origin === allowed;
        }
        // 支持正则表达式匹配
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });

      if (isAllowed) {
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
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 设置响应头，确保使用 UTF-8 编码
  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  // 全局拦截器：统一将 POST 请求的 201 状态码改为 200
  app.useGlobalInterceptors(new HttpStatusInterceptor());
  
  // 开启优雅关闭 Hooks (仅在非 Serverless 环境)
  if (!isVercel) {
    app.enableShutdownHooks();
  }

  return app;
}

/**
 * 启动服务器（仅在非 Vercel 环境下执行）
 */
async function startServer() {
  const app = await bootstrap();

  // 解析端口
  const port = parsePort();
  try {
    // ✅ 明确指定监听所有网络接口（0.0.0.0），确保 Render/云平台可以访问
    await app.listen(port, '0.0.0.0');
    console.log(`✅ Server running on http://0.0.0.0:${port}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Listening on all interfaces: 0.0.0.0:${port}`);
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ 端口 ${port} 被占用! 请运行 'npx kill-port ${port}' 然后重试。`);
      process.exit(1);
    } else {
      throw err;
    }
  }
  console.log(`✅ Application is running on: http://localhost:${port}`);
}

// 仅在非 Vercel 环境下启动服务器
if (!isVercel) {
  startServer();
}
