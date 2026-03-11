import { Controller, Post, Body } from '@nestjs/common';
import { AiTcmService } from './ai-tcm.service';

@Controller('ai-tcm')
export class AiTcmController {
  constructor(private readonly aiTcmService: AiTcmService) {}

  // 接口 A：智能问询
  @Post('inquiry')
  async inquiry(
    @Body() body: { basicInfo: any, supplementaryInfo: string, dialogHistory: any[] }
  ) {
    const result = await this.aiTcmService.conductInquiry(
      body.basicInfo,
      body.supplementaryInfo,
      body.dialogHistory
    );
    return { code: 200, data: result };
  }

  // 接口 B：生成方案
  @Post('plan')
  async plan(
    @Body() body: { basicInfo: any, supplementaryInfo: string, inquiryTranscript: string }
  ) {
    const result = await this.aiTcmService.generatePlan(
      body.basicInfo,
      body.supplementaryInfo,
      body.inquiryTranscript
    );
    return { code: 200, data: result };
  }
}
