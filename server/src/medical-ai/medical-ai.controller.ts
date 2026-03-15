import { Controller, Post, Body, Req } from '@nestjs/common';
import { MedicalAiService } from './medical-ai.service';
import { HeaderUtils } from 'coze-coding-dev-sdk'; 

@Controller('tcm')
export class TcmController {
  constructor(private readonly medicalAiService: MedicalAiService) {}

  @Post('analyze')
  async analyze(@Body() body: any, @Req() req: any) {
    // ... 保持不变 ...
  }
  
  @Post('plan')
  async plan(@Body() body: any, @Req() req: any) {
    // 提取 Headers (保留原有逻辑)
    const rawCustomHeaders = HeaderUtils.extractForwardHeaders(req.headers);
    const customHeaders = Object.fromEntries(
      Object.entries(rawCustomHeaders).filter(([key]) => key.toLowerCase() !== 'authorization')
    );

    // 修改这里：传入三个参数
    const result = await this.medicalAiService.generateHealthPlan(
      body.basicInfo || {},
      body.supplementaryInfo || '',
      body.inquiryTranscript || ''
    );

    return {
      success: true,
      data: result
    };
  }
}