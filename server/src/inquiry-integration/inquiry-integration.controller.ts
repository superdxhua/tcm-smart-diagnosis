/**
 * AI 问询集成控制器
 * 提供完整的问询-诊断-方案生成 API
 */

import { Controller, Post, Get, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { InquiryIntegrationService, IntegratedTreatmentPlan, TumorPatientInfo } from './inquiry-integration.service';

/**
 * 开始问询请求
 */
interface StartInquiryRequest {
  userId: string;
  patientId?: string;
  mainComplaint?: string;
  history?: string[];
  tumorInfo?: TumorPatientInfo;
}

/**
 * 继续问询请求
 */
interface ContinueInquiryRequest {
  sessionId: string;
  answer: string;
}

/**
 * 生成方案请求
 */
interface GeneratePlanRequest {
  sessionId: string;
  tongue?: string;
  pulse?: string;
}

/**
 * 开始问询响应
 */
interface StartInquiryResponse {
  sessionId: string;
  firstQuestion: string;
  extractedSymptoms: any;
  inferenceResult: any;
  confidenceMetrics: any;
}

/**
 * 继续问询响应
 */
interface ContinueInquiryResponse {
  newSymptoms: any;
  updatedConfidenceMetrics: any;
  updatedInferenceResult: any;
  nextQuestion: string | null;
  isComplete: boolean;
  recommendedFormulas?: any[];
}

@Controller('inquiry-integration')
export class InquiryIntegrationController {
  constructor(
    private readonly integrationService: InquiryIntegrationService,
  ) {}

  /**
   * 开始问询
   * POST /api/inquiry-integration/start
   */
  @Post('start')
  async startInquiry(
    @Body() request: StartInquiryRequest
  ): Promise<StartInquiryResponse> {
    const { userId, patientId, mainComplaint, history, tumorInfo } = request;

    if (!userId) {
      throw new HttpException(
        { code: 400, msg: '用户ID不能为空' },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const result = await this.integrationService.startInquiry(
        userId,
        patientId,
        mainComplaint,
        history,
        tumorInfo
      );

      return {
        code: 200,
        msg: 'success',
        data: result,
      } as any;
    } catch (error) {
      console.error('开始问询失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '开始问询失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 继续问询
   * POST /api/inquiry-integration/continue
   */
  @Post('continue')
  async continueInquiry(
    @Body() request: ContinueInquiryRequest
  ): Promise<ContinueInquiryResponse> {
    const { sessionId, answer } = request;

    if (!sessionId) {
      throw new HttpException(
        { code: 400, msg: '会话ID不能为空' },
        HttpStatus.BAD_REQUEST
      );
    }

    if (!answer) {
      throw new HttpException(
        { code: 400, msg: '回答内容不能为空' },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const result = await this.integrationService.continueInquiry(
        sessionId,
        answer
      );

      return {
        code: 200,
        msg: 'success',
        data: result,
      } as any;
    } catch (error) {
      console.error('继续问询失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '继续问询失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 生成治疗方案
   * POST /api/inquiry-integration/generate-plan
   */
  @Post('generate-plan')
  async generateTreatmentPlan(
    @Body() request: GeneratePlanRequest
  ): Promise<any> {
    const { sessionId, tongue, pulse } = request;

    if (!sessionId) {
      throw new HttpException(
        { code: 400, msg: '会话ID不能为空' },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const plan = await this.integrationService.generateTreatmentPlan(
        sessionId,
        tongue,
        pulse
      );

      return {
        code: 200,
        msg: 'success',
        data: plan,
      };
    } catch (error) {
      console.error('生成治疗方案失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '生成治疗方案失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 获取会话信息
   * GET /api/inquiry-integration/session/:sessionId
   */
  @Get('session/:sessionId')
  async getSession(
    @Param('sessionId') sessionId: string
  ): Promise<any> {
    try {
      const session = await this.integrationService.getSession(sessionId);

      if (!session) {
        throw new HttpException(
          { code: 404, msg: '会话不存在' },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        code: 200,
        msg: 'success',
        data: session,
      };
    } catch (error) {
      console.error('获取会话失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '获取会话失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========== Qwen 大模型集成接口 ==========

  /**
   * 使用 Qwen 提取症状
   * POST /api/inquiry-integration/extract-symptoms
   */
  @Post('extract-symptoms')
  async extractSymptomsWithQwen(
    @Body('userInput') userInput: string,
    @Body('sessionId') sessionId?: string
  ): Promise<any> {
    if (!userInput) {
      throw new HttpException(
        { code: 400, msg: '用户输入不能为空' },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const result = await this.integrationService.extractSymptomsWithQwen(
        userInput,
        sessionId
      );

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('症状提取失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '症状提取失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 生成诊断解释
   * POST /api/inquiry-integration/diagnosis-explanation
   */
  @Post('diagnosis-explanation')
  async generateDiagnosisExplanation(
    @Body('sessionId') sessionId: string
  ): Promise<any> {
    if (!sessionId) {
      throw new HttpException(
        { code: 400, msg: '会话ID不能为空' },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const explanation = await this.integrationService.generateDiagnosisExplanationWithQwen(sessionId);

      return {
        code: 200,
        msg: 'success',
        data: { explanation },
      };
    } catch (error) {
      console.error('生成诊断解释失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '生成诊断解释失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 生成调护建议
   * POST /api/inquiry-integration/care-advice
   */
  @Post('care-advice')
  async generateCareAdvice(
    @Body('sessionId') sessionId: string,
    @Body('lifestyleInfo') lifestyleInfo?: {
      diet?: string;
      exercise?: string;
      sleep?: string;
      emotion?: string;
    }
  ): Promise<any> {
    if (!sessionId) {
      throw new HttpException(
        { code: 400, msg: '会话ID不能为空' },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const advice = await this.integrationService.generateCareAdviceWithQwen(
        sessionId,
        lifestyleInfo
      );

      return {
        code: 200,
        msg: 'success',
        data: advice,
      };
    } catch (error) {
      console.error('生成调护建议失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '生成调护建议失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 生成用药指导
   * POST /api/inquiry-integration/medication-guide
   */
  @Post('medication-guide')
  async generateMedicationGuide(
    @Body('sessionId') sessionId: string
  ): Promise<any> {
    if (!sessionId) {
      throw new HttpException(
        { code: 400, msg: '会话ID不能为空' },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const guide = await this.integrationService.generateMedicationGuideWithQwen(sessionId);

      return {
        code: 200,
        msg: 'success',
        data: guide,
      };
    } catch (error) {
      console.error('生成用药指导失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '生成用药指导失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 搜索方剂研究
   * GET /api/inquiry-integration/formula-research/:formulaName
   */
  @Get('formula-research/:formulaName')
  async searchFormulaResearch(
    @Param('formulaName') formulaName: string
  ): Promise<any> {
    try {
      const result = await this.integrationService.searchFormulaResearchWithWebSearch(
        formulaName
      );

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('搜索方剂研究失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '搜索方剂研究失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 搜索疾病最新进展
   * GET /api/inquiry-integration/disease-progress/:diagnosis
   */
  @Get('disease-progress/:diagnosis')
  async searchDiseaseProgress(
    @Param('diagnosis') diagnosis: string
  ): Promise<any> {
    try {
      const result = await this.integrationService.searchDiseaseProgressWithWebSearch(
        decodeURIComponent(diagnosis)
      );

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('搜索疾病最新进展失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '搜索疾病最新进展失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 生成增强版治疗方案
   * POST /api/inquiry-integration/enhanced-plan
   */
  @Post('enhanced-plan')
  async generateEnhancedTreatmentPlan(
    @Body('sessionId') sessionId: string,
    @Body('options') options?: {
      includeDiagnosisExplanation?: boolean;
      includeCareAdvice?: boolean;
      includeMedicationGuide?: boolean;
      includeSymptomPrediction?: boolean;
      includeResearchSearch?: boolean;
    }
  ): Promise<any> {
    if (!sessionId) {
      throw new HttpException(
        { code: 400, msg: '会话ID不能为空' },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const plan = await this.integrationService.generateEnhancedTreatmentPlan(
        sessionId,
        options
      );

      return {
        code: 200,
        msg: 'success',
        data: plan,
      };
    } catch (error) {
      console.error('生成增强版治疗方案失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '生成增强版治疗方案失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
