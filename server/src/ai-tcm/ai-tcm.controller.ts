import { Controller, Post, Body, Req } from '@nestjs/common'; // 引入 Req
import { AiTcmService } from './ai-tcm.service';
import { HeaderUtils } from 'coze-coding-dev-sdk'; // 引入扣子的工具类

@Controller('ai-tcm')
export class AiTcmController {
  constructor(private readonly service: AiTcmService) {}

  @Post('inquiry')
  async inquiry(
    @Req() req: any, // 获取完整请求对象
    @Body() body: any,
  ) {
    // === 关键修复：使用扣子编程推荐的方式提取 Headers ===
    const rawCustomHeaders = HeaderUtils.extractForwardHeaders(req.headers);
    const customHeaders = Object.fromEntries(
      Object.entries(rawCustomHeaders).filter(([key]) => key.toLowerCase() !== 'authorization')
    );
    
    console.log('【AiTcmController】提取到的 customHeaders:', Object.keys(customHeaders).join(', '));

    return this.service.conductInquiry(
      body.basicInfo,
      body.supplementaryInfo,
      body.dialogHistory,
      customHeaders
    );
  }

  @Post('plan')
  async plan(
    @Req() req: any,
    @Body() body: any,
  ) {
    const rawCustomHeaders = HeaderUtils.extractForwardHeaders(req.headers);
    const customHeaders = Object.fromEntries(
      Object.entries(rawCustomHeaders).filter(([key]) => key.toLowerCase() !== 'authorization')
    );

    return this.service.generatePlan(
      body.basicInfo,
      body.supplementaryInfo,
      body.inquiryTranscript,
      customHeaders
    );
  }
}
