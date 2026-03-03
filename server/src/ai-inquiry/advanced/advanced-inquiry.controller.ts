/**
 * 顶级经方大师 - 高级问询控制器
 * 整合：贝叶斯推理、NLU、合病/并病/坏病推理、专家反馈
 */

import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import {
  BayesianInferenceService,
  TCMNLUService,
  ComplexInferenceService,
  ExpertFeedbackService,
  InferenceResult,
  NLUExtraction,
} from './advanced-index';
import {
  ExpertFeedback,
  ConfidenceMetrics,
} from './ontology-types';

/**
 * 开始高级问询
 */
interface StartAdvancedInquiryRequest {
  mainComplaint: string; // 主诉（自然语言）
  patientInfo: {
    gender: string;
    age: number;
    bodyType?: string;
  };
  history?: string[]; // 病史（如"服过退烧药"）
}

interface StartAdvancedInquiryResponse {
  sessionId: string;
  extractedSymptoms: NLUExtraction; // NLU提取结果
  confidenceMetrics: ConfidenceMetrics; // 置信度指标
  inferenceResult: InferenceResult; // 推理结果
  firstQuestion: string; // 第一个问题
  alternativeSyndromes: Array<{
    syndromeId: string;
    name: string;
    confidence: number;
  }>;
  transmissionPrediction?: Array<{
    to: string;
    probability: number;
    recommendation: string;
  }>;
  recommendation: string; // 总体建议
}

/**
 * 继续问询
 */
interface ContinueAdvancedInquiryRequest {
  sessionId: string;
  answer: string; // 用户回答（自然语言）
}

interface ContinueAdvancedInquiryResponse {
  sessionId: string;
  newSymptoms: NLUExtraction; // 新提取的症状
  updatedConfidenceMetrics: ConfidenceMetrics; // 更新后的置信度
  updatedInferenceResult: InferenceResult; // 更新后的推理结果
  nextQuestion: string | null; // 下一个问题
  isComplete: boolean; // 是否完成
  discriminationQuestions?: string[]; // 鉴别问题
}

/**
 * 提交专家反馈
 */
interface SubmitFeedbackRequest {
  sessionId: string;
  originalDiagnosis: string;
  expertDiagnosis: string;
  formula: string;
  outcome: 'effective' | 'ineffective' | 'partially_effective';
  feedbackDetails: {
    correctItems: string[];
    incorrectItems: string[];
    missingItems: string[];
    additionalNotes?: string;
  };
  expertId: string;
}

@Controller('advanced-inquiry')
export class AdvancedInquiryController {
  constructor(
    private readonly nluService: TCMNLUService,
    private readonly bayesianInferenceService: BayesianInferenceService,
    private readonly complexInferenceService: ComplexInferenceService,
    private readonly expertFeedbackService: ExpertFeedbackService,
  ) {}

  /**
   * 开始高级问询
   */
  @Post('start')
  async startAdvancedInquiry(
    @Body() request: StartAdvancedInquiryRequest
  ): Promise<StartAdvancedInquiryResponse> {
    // 1. NLU 解析主诉
    const extractedSymptoms = await this.nluService.parseUserInput(
      request.mainComplaint
    );

    // 2. 贝叶斯推理
    const priorProbabilities = this.initializePriorProbabilities();
    const posteriorProbabilities = await this.bayesianInferenceService.updatePosteriorProbabilities(
      extractedSymptoms.symptoms.map(s => ({
        type: 'symptom',
        name: s.standardized,
        weight: s.confidence,
        source: 'user_input',
      })),
      priorProbabilities
    );

    // 3. 计算置信度
    const confidenceMetrics = this.bayesianInferenceService.calculateConfidenceMetrics(
      posteriorProbabilities,
      extractedSymptoms.symptoms.map(s => ({
        type: 'symptom',
        name: s.standardized,
        weight: s.confidence,
        source: 'user_input',
      }))
    );

    // 4. 复杂推理（合病/并病/坏病）
    const inferenceResult = await this.complexInferenceService.inferComplexSyndrome(
      extractedSymptoms.symptoms.map(s => s.standardized),
      request.history
    );

    // 5. 生成第一个问题
    const firstQuestion = this.generateFirstQuestion(
      inferenceResult,
      extractedSymptoms
    );

    // 6. 生成替代证候列表
    const alternativeSyndromes = confidenceMetrics.alternativeSyndromes.slice(0, 3).map(alt => ({
      syndromeId: alt.syndromeId,
      name: alt.name,
      confidence: alt.confidence,
    }));

    // 7. 生成总体建议
    const recommendation = this.generateRecommendation(
      confidenceMetrics,
      inferenceResult
    );

    return {
      sessionId: `session-${Date.now()}`,
      extractedSymptoms,
      confidenceMetrics,
      inferenceResult,
      firstQuestion,
      alternativeSyndromes,
      transmissionPrediction: inferenceResult.transmissionPrediction,
      recommendation,
    };
  }

  /**
   * 继续问询
   */
  @Post('continue')
  async continueAdvancedInquiry(
    @Body() request: ContinueAdvancedInquiryRequest
  ): Promise<ContinueAdvancedInquiryResponse> {
    // 1. NLU 解析用户回答
    const newSymptoms = await this.nluService.parseUserInput(request.answer);

    // 2. 贝叶斯推理更新
    // 这里需要从 session 中获取之前的概率，暂时使用默认值
    const priorProbabilities = this.initializePriorProbabilities();
    const posteriorProbabilities = await this.bayesianInferenceService.updatePosteriorProbabilities(
      newSymptoms.symptoms.map(s => ({
        type: 'symptom',
        name: s.standardized,
        weight: s.confidence,
        source: 'user_input',
      })),
      priorProbabilities
    );

    // 3. 计算更新后的置信度
    const updatedConfidenceMetrics =
      this.bayesianInferenceService.calculateConfidenceMetrics(
        posteriorProbabilities,
        newSymptoms.symptoms.map(s => ({
          type: 'symptom',
          name: s.standardized,
          weight: s.confidence,
          source: 'user_input',
        }))
      );

    // 4. 复杂推理更新
    const updatedInferenceResult =
      await this.complexInferenceService.inferComplexSyndrome(
        newSymptoms.symptoms.map(s => s.standardized)
      );

    // 5. 判断是否完成
    const isComplete =
      updatedConfidenceMetrics.recommendation === 'high_confidence' ||
      updatedConfidenceMetrics.recommendation === 'contradictory';

    // 6. 生成下一个问题
    let nextQuestion: string | null = null;
    if (!isComplete) {
      nextQuestion = this.generateNextQuestion(
        updatedInferenceResult,
        newSymptoms
      );
    }

    // 7. 生成鉴别问题
    const discriminationQuestions =
      this.bayesianInferenceService.generateDiscriminationQuestions(
        posteriorProbabilities,
        newSymptoms.symptoms.map(s => s.standardized)
      );

    return {
      sessionId: request.sessionId,
      newSymptoms,
      updatedConfidenceMetrics,
      updatedInferenceResult,
      nextQuestion,
      isComplete,
      discriminationQuestions,
    };
  }

  /**
   * 提交专家反馈
   */
  @Post('feedback')
  async submitFeedback(
    @Body() request: SubmitFeedbackRequest
  ): Promise<{ success: boolean; feedbackId: string }> {
    const feedback: ExpertFeedback = {
      sessionId: request.sessionId,
      originalDiagnosis: request.originalDiagnosis,
      expertDiagnosis: request.expertDiagnosis,
      formula: request.formula,
      outcome: request.outcome,
      feedbackDetails: request.feedbackDetails,
      timestamp: new Date(),
      expertId: request.expertId,
    };

    return this.expertFeedbackService.submitFeedback(feedback);
  }

  /**
   * 获取反馈统计
   */
  @Get('feedback/statistics')
  async getFeedbackStatistics(
    @Param('expertId') expertId?: string
  ): Promise<{
    totalFeedbacks: number;
    effectiveRate: number;
    commonMistakes: string[];
    topCorrectDiagnoses: string[];
  }> {
    return this.expertFeedbackService.getFeedbackStatistics(expertId);
  }

  /**
   * 初始化先验概率
   */
  private initializePriorProbabilities(): Record<string, number> {
    return {
      syndrome_taiyang_zhongfeng: 0.1,
      syndrome_taiyang_shaohan: 0.1,
      syndrome_yangming_fushi: 0.1,
      syndrome_shaoyang: 0.1,
      syndrome_taiyin: 0.1,
      syndrome_shaoyin_wangyang: 0.1,
      syndrome_taiyang_yangming_hebing: 0.05,
      syndrome_taiyang_shaoyang_hebing: 0.05,
      syndrome_yangming_shaoyang_hebing: 0.05,
      syndrome_taiyang_bing_shaoyin: 0.05,
      syndrome_wuhan_wangyang: 0.05,
      syndrome_wuxia_shangpi: 0.05,
    };
  }

  /**
   * 生成第一个问题
   */
  private generateFirstQuestion(
    inferenceResult: InferenceResult,
    extractedSymptoms: NLUExtraction
  ): string {
    // 如果是合病，询问主要症状
    if (inferenceResult.type === '合病') {
      return `您除了${extractedSymptoms.symptoms[0]?.standardized || '上述症状'}，还有其他不适吗？`;
    }

    // 如果是并病，询问传变症状
    if (inferenceResult.type === '并病') {
      return `您是否感觉病情有变化，比如${inferenceResult.evidence[0] || '其他症状'}加重？`;
    }

    // 默认：询问关键鉴别点
    const keySymptoms = inferenceResult.evidence.filter(s => s);
    if (keySymptoms.length > 0) {
      return `关于${keySymptoms[0]}，能否详细描述一下？`;
    }

    return '能否详细描述一下您的主要症状？';
  }

  /**
   * 生成下一个问题
   */
  private generateNextQuestion(
    inferenceResult: InferenceResult,
    extractedSymptoms: NLUExtraction
  ): string | null {
    // 如果有未确认的鉴别点，询问
    if (inferenceResult.evidence.length < 3) {
      return '您还有其他症状吗？';
    }

    return null;
  }

  /**
   * 生成总体建议
   */
  private generateRecommendation(
    confidenceMetrics: ConfidenceMetrics,
    inferenceResult: InferenceResult
  ): string {
    switch (confidenceMetrics.recommendation) {
      case 'high_confidence':
        return `辨证结果明确：${inferenceResult.name}（${inferenceResult.formula}）。建议在医师指导下使用。`;

      case 'moderate_confidence':
        return `辨证结果较为明确：${inferenceResult.name}（${inferenceResult.formula}）。建议补充以下信息以确认：${confidenceMetrics.primarySyndrome.evidence.map(e => e.name).join('、')}。`;

      case 'low_confidence':
        return `辨证结果不明确。当前证据指向${inferenceResult.name}，但置信度较低。建议面诊或提供更多信息。`;

      case 'contradictory':
        return `症状存在矛盾，无法准确辨证。建议面诊或提供更详细的病史。`;

      case 'insufficient_evidence':
        return `信息不足，无法进行有效辨证。建议提供更多症状信息。`;

      default:
        return '建议面诊或咨询专业医师。';
    }
  }
}
