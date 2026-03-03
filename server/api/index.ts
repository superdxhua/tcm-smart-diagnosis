import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../dist/app.module';
import { HttpStatusInterceptor } from '../dist/interceptors/http-status.interceptor';

// 缓存 NestJS 应用实例（用于热重载）
let cachedApp: INestApplication;

// 初始化应用
async function initApp() {
  if (cachedApp) {
    return cachedApp;
  }

  // 创建新的应用实例
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: ['error', 'warn', 'log'],
    }
  );

  // 配置 CORS - 使用 Bearer Token 认证，不需要 credentials
  app.enableCors({
    origin: (origin) => {
      // 允许的来源白名单
      const allowedOrigins = [
        'https://www.zhongyihskhealth.com',
        'https://zhongyihskhealth.com',
        'http://localhost:3000',
        'http://localhost:5000',
      ];

      // 允许白名单内的来源
      if (origin && allowedOrigins.includes(origin)) {
        return origin;
      }

      // 允许无 origin 的请求（如移动应用、Server-to-Server）
      if (!origin) {
        return '*';
      }

      // 其他来源拒绝
      return false;
    },
    credentials: false,  // 使用 Bearer Token，不需要 Cookie 凭据
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    preflightContinue: false, // 不让 NestJS 处理 OPTIONS，让 Express 处理
    optionsSuccessStatus: 204, // OPTIONS 请求返回 204
  });

  // Vercel Serverless 中不需要设置全局前缀
  // 因为请求已经被路由到 /api/index.ts

  // 配置解析器
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CORS 白名单配置（备用中间件）
  const allowedOrigins = [
    'https://www.zhongyihskhealth.com',
    'https://zhongyihskhealth.com',
    'http://localhost:3000',
    'http://localhost:5000',
  ];

  // 添加自定义中间件处理 OPTIONS 预检请求和 CORS
  // 注意：这个中间件是备用方案，NestJS 的 app.enableCors 已经配置了 CORS
  // 这里只处理 OPTIONS 预检请求的快速响应
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    // 动态设置 CORS 响应头
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    // 移除 credentials 头，使用 Bearer Token 认证不需要 Cookie 凭据
    // res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 小时

    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  });

  // 全局拦截器
  app.useGlobalInterceptors(new HttpStatusInterceptor());

  // 验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // 等待应用初始化
  await app.init();

  // 缓存应用实例
  cachedApp = app;

  return app;
}

export default async function handler(req: any, res: any) {
  try {
    console.log('API Request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
    });

    console.log('Initializing NestJS application...');

    // 初始化应用
    const app = await initApp();

    console.log('NestJS application initialized successfully');

    // 处理请求
    return app.getHttpAdapter().getInstance()(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).json({
      code: 500,
      msg: 'Internal Server Error',
      error: error.message,
      stack: error.stack
    });
  }
}
