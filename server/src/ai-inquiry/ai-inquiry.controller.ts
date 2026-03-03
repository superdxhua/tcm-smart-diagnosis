import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { AiInquiryService } from './ai-inquiry.service';
import {
  StartInquiryParams,
  StartInquiryResult,
  ContinueInquiryParams,
  ContinueInquiryResult,
  InquiryStatusResult,
  CompleteInquiryResult
} from './types';

@Controller('ai-inquiry')
export class AiInquiryController {
  constructor(private readonly aiInquiryService: AiInquiryService) {}

  /**
   * 开始问询
   * POST /api/ai-inquiry/start
   */
  @Post('start')
  @HttpCode(HttpStatus.OK)
  async startInquiry(@Body() params: StartInquiryParams) {
    try {
      const result = await this.aiInquiryService.startInquiry(params);
      return {
        code: 200,
        msg: 'success',
        data: result
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message,
        data: null
      };
    }
  }

  /**
   * 继续问询
   * POST /api/ai-inquiry/continue
   */
  @Post('continue')
  @HttpCode(HttpStatus.OK)
  async continueInquiry(@Body() params: ContinueInquiryParams) {
    try {
      const result = await this.aiInquiryService.continueInquiry(params);
      return {
        code: 200,
        msg: 'success',
        data: result
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message,
        data: null
      };
    }
  }

  /**
   * 完成问询，获取最终诊断
   * POST /api/ai-inquiry/complete
   */
  @Post('complete')
  @HttpCode(HttpStatus.OK)
  async completeInquiry(@Body() body: { sessionId: string }) {
    try {
      const result = await this.aiInquiryService.completeInquiry(body.sessionId);
      return {
        code: 200,
        msg: 'success',
        data: result
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message,
        data: null
      };
    }
  }

  /**
   * 获取问询状态
   * GET /api/ai-inquiry/status/:sessionId
   */
  @Get('status/:sessionId')
  async getInquiryStatus(@Param('sessionId') sessionId: string) {
    try {
      const result = await this.aiInquiryService.getInquiryStatus(sessionId);
      return {
        code: 200,
        msg: 'success',
        data: result
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message,
        data: null
      };
    }
  }
}
