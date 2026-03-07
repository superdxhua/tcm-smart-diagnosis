import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

// 简单的健康检查端点 - 不依赖 NestJS 应用
const healthCheckHandler = (req: any, res: any) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Health check endpoint working!'
  });
};

// 缓存 NestJS 应用实例
let cachedApp: INestApplication;

// 初始化 NestJS 应用
async function initApp() {
  if (cachedApp) {
    return cachedApp;
  }

  console.log('Initializing NestJS application...');

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: ['error', 'warn', 'log'],
    }
  );

  console.log('NestJS created, configuring CORS...');

  // 配置 CORS
  app.enableCors({
    origin: '*',
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  console.log('Initializing app...');
  await app.init();
  console.log('App initialized successfully');

  cachedApp = app;
  return app;
}

// Vercel Handler
export default async function handler(req: any, res: any) {
  console.log('Handler called:', req.method, req.url);

  // 健康检查端点 - 不需要初始化 NestJS
  if (req.url === '/api/health' || req.url === '/health' || req.url === '/api/test') {
    return healthCheckHandler(req, res);
  }

  try {
    console.log('Initializing NestJS for request:', req.url);
    const app = await initApp();
    console.log('Handling request with NestJS...');
    return app.getHttpAdapter().getInstance()(req, res);
  } catch (error) {
    console.error('===================');
    console.error('Handler error:', error);
    console.error('Error stack:', error.stack);
    console.error('===================');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).json({
      code: 500,
      msg: 'Internal Server Error',
      error: error.message,
      stack: error.stack
    });
  }
}
