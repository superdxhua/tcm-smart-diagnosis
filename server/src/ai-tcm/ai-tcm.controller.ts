import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AiTcmService } from './ai-tcm.service';

@Controller('ai-tcm')
export class AiTcmController {
  constructor(private readonly service: AiTcmService) {}

  @Post('inquiry')
  async inquiry(
    @Body() body: any,
    @Headers() headers: any, // 获取所有请求头
  ) {
    // 提取 customHeaders（过滤掉 host 等无关字段）
    const customHeaders = { ...headers };
    delete customHeaders['host'];
    delete customHeaders['content-length'];
    delete customHeaders['content-type'];

    return this.service.conductInquiry(
      body.basicInfo,
      body.supplementaryInfo,
      body.dialogHistory,
      customHeaders // 传给 Service
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
