import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { JingfangInquiryStrategyGenerator, InquiryResult } from './jingfang-inquiry-strategy-generator.service';

/**
 * 经方智能问询控制器
 * 基于六经辨证、动态辨证树、假象识别、语言风格转换
 */
@Controller('jingfang-inquiry')
export class JingfangInquiryController {
  constructor(
    private readonly jingfangInquiryStrategy: JingfangInquiryStrategyGenerator
  ) {}

  /**
   * 开始经方问询
   * POST /api/jingfang-inquiry/start
   */
  @Post('start')
  @HttpCode(HttpStatus.OK)
  async startInquiry(@Body() body: {
    userId: string;
    patientInfo: {
      name: string;
      age: number;
      gender: 'male' | 'female' | 'other';
    };
    chiefComplaint: string;
    additionalInfo?: string;
  }) {
    try {
      const result = await this.jingfangInquiryStrategy.startInquiry(
        body.userId,
        body.patientInfo,
        body.chiefComplaint,
        body.additionalInfo || ''
      );

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
   * 继续经方问询
   * POST /api/jingfang-inquiry/continue
   */
  @Post('continue')
  @HttpCode(HttpStatus.OK)
  async continueInquiry(@Body() body: {
    sessionId: string;
    answer: string;
  }) {
    try {
      const result = await this.jingfangInquiryStrategy.continueInquiry(
        body.sessionId,
        body.answer
      );

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
   * 完成经方问询，获取最终诊断和处方
   * POST /api/jingfang-inquiry/complete
   */
  @Post('complete')
  @HttpCode(HttpStatus.OK)
  async completeInquiry(@Body() body: { sessionId: string }) {
    try {
      const result = await this.jingfangInquiryStrategy.completeInquiry(body.sessionId);

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
   * GET /api/jingfang-inquiry/status/:sessionId
   */
  @Get('status/:sessionId')
  async getInquiryStatus(@Param('sessionId') sessionId: string) {
    try {
      const session = this.jingfangInquiryStrategy.getSessionStatus(sessionId);

      if (!session) {
        return {
          code: 404,
          msg: '问询会话不存在',
          data: null
        };
      }

      return {
        code: 200,
        msg: 'success',
        data: session
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
   * 删除问询会话
   * DELETE /api/jingfang-inquiry/:sessionId
   */
  @Post('delete')
  @HttpCode(HttpStatus.OK)
  async deleteSession(@Body() body: { sessionId: string }) {
    try {
      this.jingfangInquiryStrategy.deleteSession(body.sessionId);

      return {
        code: 200,
        msg: 'success',
        data: {
          message: '问询会话已删除'
        }
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
