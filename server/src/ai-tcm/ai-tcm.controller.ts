 import { Controller, Post, Body } from '@nestjs/common';

@Controller('ai-tcm')
export class AiTcmController {
  constructor() {
    console.log('✅ [AiTcmController] 空壳版已实例化！');
  }

  @Post('inquiry')
  async inquiry(@Body() body: any) {
    console.log('[AiTcmController] 收到请求，直接返回成功');
    return { message: '路由通了！', data: 'DeepSeek 方案生效' };
  }
}