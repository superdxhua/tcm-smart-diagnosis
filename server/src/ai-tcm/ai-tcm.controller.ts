import { Controller, Post, Body, Req } from '@nestjs/common';
import { AiTcmService } from './ai-tcm.service';

@Controller('ai-tcm')
export class AiTcmController {
  constructor(private readonly service: AiTcmService) {
    // DeepSeek 建议：添加启动日志，验证控制器是否被加载
    console.log('✅ [AiTcmController] 已成功实例化！路由 /ai-tcm 已注册。');
  }

  @Post('inquiry')
  async inquiry(
    @Req() req: any,
    @Body() body: any,
  ) {
    console.log('[AiTcmController] 收到 inquiry 请求');
    return this.service.conductInquiry(
      body.basicInfo,
      body.supplementaryInfo,
      body.dialogHistory,
      {}
    );
  }

  @Post('plan')
  async plan(
    @Req() req: any,
    @Body() body: any,
  ) {
    return this.service.generatePlan(
      body.basicInfo,
      body.supplementaryInfo,
      body.inquiryTranscript,
      {}
    );
  }
}