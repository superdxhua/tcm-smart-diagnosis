import { Controller, Post, Body, UseGuards, Request, Req } from '@nestjs/common';
import { MedicalAiService } from './medical-ai.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { HeaderUtils } from 'coze-coding-dev-sdk';

/**
 * TCM 健康方案生成 Controller
 * 处理 /api/tcm/analyze 请求
 */
@Controller('tcm')
export class TcmController {
  constructor(private readonly medicalAiService: MedicalAiService) {}

  /**
   * 生成健康方案
   * POST /api/tcm/analyze
   */
  @Post('analyze')
  async generateHealthPlan(@Req() req: any, @Body() body: {
    messages?: Array<{ role: string; content: string }>;
    consultationHistory?: Array<{ role: string; content: string }>;
    userInfo?: {
      patientName?: string;
      age?: number;
      gender?: string;
      chiefComplaint?: string;
    };
  }) {
    try {
      console.log('=== 接收到生成方案请求 ===');
      console.log('请求体:', JSON.stringify(body, null, 2));

      // 提取问询历史（兼容两种参数名）
      const consultationHistory = body.messages || body.consultationHistory || [];
      const userInfo = body.userInfo || {};

      console.log('问询历史长度:', consultationHistory.length);
      console.log('用户信息:', JSON.stringify(userInfo));

      // 调用 Service 生成方案
      const result = await this.medicalAiService.generateHealthPlan({
        consultationHistory,
        userInfo,
      });

      console.log('=== 生成方案成功 ===');

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('=== 生成方案失败 ===');
      console.error('错误详情:', error);

      return {
        code: 500,
        msg: error.message || '生成方案失败',
        data: null,
      };
    }
  }
}
