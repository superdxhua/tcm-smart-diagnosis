import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AiTcmService } from './ai-tcm.service';

@Controller('ai-tcm')
export class AiTcmController {
  constructor(private readonly service: AiTcmService) {}

  @Post('inquiry')
  async inquiry(
    @Body() body: any,
    @Headers() headers: any,
  ) {
    // 提取 customHeaders
    const customHeaders = { ...headers };
    delete customHeaders['host'];
    delete customHeaders['content-length'];
    delete customHeaders['content-type'];

    return this.service.conductInquiry(
      body.basicInfo,
      body.supplementaryInfo,
      body.dialogHistory,
      customHeaders
    );
  }

  @Post('plan')
  async plan(
    @Body() body: any,
    @Headers() headers: any,
  ) {
    const customHeaders = { ...headers };
    delete customHeaders['host'];
    delete customHeaders['content-length'];
    delete customHeaders['content-type'];

    return this.service.generatePlan(
      body.basicInfo,
      body.supplementaryInfo,
      body.inquiryTranscript,
      customHeaders
    );
  }
}
