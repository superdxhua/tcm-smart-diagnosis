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
  // 🎯 如果是静态资源请求，直接返回 404，不交给 NestJS 处理
  if (req.path.match(/\.(png|jpg|jpeg|gif|svg|ico|json|css|js|woff|woff2|ttf|eot|map)$/i)) {
    console.log('静态资源请求，返回 404:', req.path);
    res.status(404).send('Not found');
    return;
  }

  // 如果应用还没有启动，先启动
  if (!app) {
    try {
      // 创建 NestJS 应用
      app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log'],
      });

      // 🎯 设置全局路由前缀，与 main.ts 保持一致
      app.setGlobalPrefix('api');

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
