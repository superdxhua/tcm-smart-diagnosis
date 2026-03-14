 import { Controller, Post, Body } from '@nestjs/common';
import { AiTcmService } from './ai-tcm.service';

@Controller('ai-tcm')
export class AiTcmController {
  constructor(private readonly service: AiTcmService) {
    console.log('✅ [AiTcmController] 已成功实例化！');
  }

  @Post('inquiry')
  async inquiry(@Body() body: any) {
    console.log('[AiTcmController] 收到请求，准备调用 Service');
    
    // 调用 Service 获取 AI 回复
    const result = await this.service.conductInquiry(
      body.basicInfo || {},
      body.supplementaryInfo || '',
      body.dialogHistory || [],
      {}
    );
    
    return result;
  }
}