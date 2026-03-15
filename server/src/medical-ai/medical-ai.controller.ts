import { Controller, Post, Body, Req } from '@nestjs/common';
import { MedicalAiService } from './medical-ai.service';
import { HeaderUtils } from 'coze-coding-dev-sdk';

@Controller('tcm')
export class TcmController {
  constructor(private readonly medicalAiService: MedicalAiService) {}

  @Post('analyze')
  async analyze(@Body() body: any, @Req() req: any) {
    const rawCustomHeaders = HeaderUtils.extractForwardHeaders(req.headers);
    const customHeaders = Object.fromEntries(
      Object.entries(rawCustomHeaders).filter(([key]) => key.toLowerCase() !== 'authorization')
    );
    
    // 调用 chat 方法
    const result = await this.medicalAiService.chat(body.messages || []);
    return { success: true, data: result };
  }

  @Post('plan')
  async plan(@Body() body: any, @Req() req: any) {
    const rawCustomHeaders = HeaderUtils.extractForwardHeaders(req.headers);
    const customHeaders = Object.fromEntries(
      Object.entries(rawCustomHeaders).filter(([key]) => key.toLowerCase() !== 'authorization')
    );

    // 关键修复：拆分成三个参数传递
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