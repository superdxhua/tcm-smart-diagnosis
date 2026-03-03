/**
 * 数字张仲景 - Qwen 集成控制器
 */

import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { QwenIntegrationService } from './qwen.service';

@Controller('qwen')
export class QwenController {
  constructor(private readonly qwenService: QwenIntegrationService) {}

  /**
   * 路径: POST /api/qwen/chat
   * 描述: Qwen 多轮对话
   */
  @Post('chat')
  async chat(@Body() body: { message: string; conversationId?: string }) {
    console.log('[Qwen Controller] 收到对话请求:', body);

    try {
      const result = await this.qwenService.chat(body.message, body.conversationId);

      console.log('[Qwen Controller] 返回对话结果:', {
        conversationId: result.conversationId,
        responseLength: result.patientChannel.diagnosis.description.length,
        riskLevel: result.safetyCheck.overallRiskLevel,
      });

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('[Qwen Controller] 对话请求失败:', error);

      return {
        code: 500,
        msg: error.message || '对话请求失败',
        data: null,
      };
    }
  }

  /**
   * 路径: POST /api/qwen/interview
   * 描述: 结构化问诊（开始问诊）
   */
  @Post('interview')
  async startInterview(@Body() body: { userId: string }) {
    console.log('[Qwen Controller] 开始问诊:', body);

    try {
      const result = await this.qwenService.startStructuredInterview(body.userId);

      console.log('[Qwen Controller] 返回第一个问题:', {
        questionId: result.question.id,
        questionCategory: result.question.category,
      });

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('[Qwen Controller] 开始问诊失败:', error);

      return {
        code: 500,
        msg: error.message || '开始问诊失败',
        data: null,
      };
    }
  }

  /**
   * 路径: POST /api/qwen/interview/continue
   * 描述: 结构化问诊（继续问诊）
   */
  @Post('interview/continue')
  async continueInterview(@Body() body: { sessionId: string; answer: string; questionId: string }) {
    console.log('[Qwen Controller] 继续问诊:', body);

    try {
      const result = await this.qwenService.continueStructuredInterview(
        body.sessionId,
        body.answer,
        body.questionId
      );

      console.log('[Qwen Controller] 返回下一个问题:', {
        questionId: result.question.id,
        shouldTerminate: result.shouldTerminate,
      });

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('[Qwen Controller] 继续问诊失败:', error);

      return {
        code: 500,
        msg: error.message || '继续问诊失败',
        data: null,
      };
    }
  }

  /**
   * 路径: POST /api/qwen/diagnose
   * 描述: 生成诊断和治疗方案
   */
  @Post('diagnose')
  async diagnose(@Body() body: { sessionId: string }) {
    console.log('[Qwen Controller] 生成诊断:', body);

    try {
      const result = await this.qwenService.generateDiagnosis(body.sessionId);

      console.log('[Qwen Controller] 返回诊断结果:', {
        syndrome: result.systemChannel.diagnosis.primarySyndrome,
        formula: result.systemChannel.formula.formulaName,
        confidence: result.metadata.confidence,
        riskLevel: result.systemChannel.warnings.riskLevel,
      });

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('[Qwen Controller] 生成诊断失败:', error);

      return {
        code: 500,
        msg: error.message || '生成诊断失败',
        data: null,
      };
    }
  }

  /**
   * 路径: POST /api/qwen/safety-check
   * 描述: 三重安全检查
   */
  @Post('safety-check')
  async safetyCheck(@Body() body: { input: string; output: any }) {
    console.log('[Qwen Controller] 安全检查:', { input: body.input });

    try {
      const result = await this.qwenService.performSafetyCheck(body.input, body.output);

      console.log('[Qwen Controller] 安全检查结果:', {
        overallPassed: result.overallPassed,
        overallRiskLevel: result.overallRiskLevel,
        violations: result.inputSafety.violations.length + result.outputSafety.violations.length,
      });

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('[Qwen Controller] 安全检查失败:', error);

      return {
        code: 500,
        msg: error.message || '安全检查失败',
        data: null,
      };
    }
  }

  /**
   * 路径: GET /api/qwen/health
   * 描述: 健康检查
   */
  @Get('health')
  async healthCheck() {
    return {
      code: 200,
      msg: 'success',
      data: {
        status: 'healthy',
        model: 'Qwen-Med-Jingfang',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
