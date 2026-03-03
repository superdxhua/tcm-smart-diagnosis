/**
 * AI 问询集成服务
 * 集成高级 AI 问询系统与 Supabase 数据库
 * 实现问询-诊断-方案生成无缝对接
 */

import { Injectable, Logger } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import {
  TCMNLUService,
  BayesianInferenceService,
  ComplexInferenceService,
  ExpertFeedbackService,
  InferenceResult,
  NLUExtraction,
} from '../ai-inquiry/advanced/advanced-index';
import { SymptomExtractionService } from '../qwen-services/symptom-extraction.service';
import { NaturalLanguageGenerationService } from '../qwen-services/natural-language-generation.service';
import { WebSearchEnhancementService } from '../qwen-services/web-search-enhancement.service';

/**
 * 问询会话数据
 */
export interface InquirySession {
  id: string; // 会话ID
  userId: string; // 用户ID
  patientId?: string; // 患者ID
  sessionStart: Date;
  sessionEnd?: Date;
  symptoms: string[]; // 症状列表
  tongue?: string; // 舌诊
  pulse?: string; // 脉诊
  diagnosis?: any; // 诊断结果
  recommendedFormula?: any; // 推荐方剂
  diagnosisConfidence?: number; // 诊断置信度
  warnings: string[]; // 警告信息
  status: 'in_progress' | 'completed' | 'cancelled'; // 状态（英文，内部使用）
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 问询会话状态（数据库用）
 */
type DatabaseSessionStatus = '进行中' | '已完成' | '已取消';

/**
 * 方剂数据（来自数据库）
 */
export interface FormulaData {
  id: string;
  formulaName: string;
  source: string;
  chapter?: string;
  originalText?: string;
  mechanism?: string;
  treatmentMethod?: string;
  indications?: string[];
  contraindications?: string[];
  dosage?: string;
  instructions?: string;
  meridianCategory?: string;
  evidence_level?: 'A' | 'B' | 'C' | 'D';
}

/**
 * 肿瘤患者信息
 */
export interface TumorPatientInfo {
  constitution?: string; // 体质
  pathogenesis?: string; // 病机
  complication?: string; // 治疗并发症
  currentTreatment?: string; // 当前治疗方式（手术/化疗/放疗/靶向/免疫）
}

/**
 * 集成治疗方案
 */
export interface IntegratedTreatmentPlan {
  // 会话信息
  sessionId: string;
  userId: string;

  // 诊断结果（来自 AI 问询）
  inferenceResult: InferenceResult;
  nluExtraction: NLUExtraction;
  confidenceMetrics: any;

  // 推荐方剂（来自数据库）
  recommendedFormula: FormulaData;
  formulaMatchScore: number; // 方剂匹配度

  // 肿瘤患者特殊信息（如果是肿瘤患者）
  tumorInfo?: {
    constitution?: string;
    pathogenesis?: string;
    complication?: string;
    adjustedFormula?: FormulaData; // 调整后的方剂
    dosageAdjustment?: string; // 剂量调整
    drugInteractions?: any[]; // 药物相互作用
  };

  // 完整治疗方案
  diagnosis: string;
  differentiation: string;
  treatmentPrinciple: string;
  symptomAnalysis?: string;
  prescription: {
    formulaName: string;
    ingredients: any[];
    decoctionMethod: string;
    dosageMethod: string;
    precautions: string;
  };
  explanation: string;
  advice: string;
  warnings?: string[];

  // Qwen 增强内容（可选）
  diagnosisExplanation?: string; // 诊断解释
  careAdvice?: { // 调护建议
    dietAdvice: string;
    exerciseAdvice: string;
    sleepAdvice: string;
    emotionAdvice: string;
    generalAdvice: string;
  };
  medicationGuide?: { // 用药指导
    preparationGuide: string;
    dosageGuide: string;
    precautions: string;
    timeline: string;
  };
  symptomPrediction?: { // 症状改善预测
    predictions: any[];
    overallPrognosis: string;
    redFlags: string[];
  };
  formulaResearch?: { // 方剂研究
    clinicalStudies: any[];
    mechanisms: any[];
    safetyData: any[];
    overallSummary: string;
  };
  diseaseProgress?: { // 疾病最新进展
    latestResearch: any[];
    treatmentGuidelines: any[];
    expertOpinions: any[];
    overallSummary: string;
  };

  // 时间戳
  createdAt: Date;
}

@Injectable()
export class InquiryIntegrationService {
  private readonly logger = new Logger(InquiryIntegrationService.name);

  constructor(
    private readonly nluService: TCMNLUService,
    private readonly bayesianInferenceService: BayesianInferenceService,
    private readonly complexInferenceService: ComplexInferenceService,
    private readonly expertFeedbackService: ExpertFeedbackService,
    private readonly symptomExtractionService: SymptomExtractionService,
    private readonly naturalLanguageGenerationService: NaturalLanguageGenerationService,
    private readonly webSearchEnhancementService: WebSearchEnhancementService,
  ) {}

  /**
   * 创建问询会话
   */
  async createInquirySession(
    userId: string,
    patientId?: string,
    mainComplaint?: string
  ): Promise<InquirySession> {
    this.logger.log(`创建问询会话: userId=${userId}, patientId=${patientId}`);

    const sessionId = crypto.randomUUID();
    const session: InquirySession = {
      id: sessionId,
      userId,
      patientId,
      sessionStart: new Date(),
      symptoms: mainComplaint ? [mainComplaint] : [],
      warnings: [],
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 保存到数据库（状态转换为中文）
    const statusMap: Record<string, DatabaseSessionStatus> = {
      'in_progress': '进行中',
      'completed': '已完成',
      'cancelled': '已取消',
    };

    const { data, error } = await getSupabaseClient()
      .from('inquiry_sessions')
      .insert({
        id: sessionId,
        user_id: userId,
        session_start: session.sessionStart,
        symptoms: session.symptoms,
        warnings: session.warnings,
        status: statusMap[session.status],
        created_at: session.createdAt,
        updated_at: session.updatedAt,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('保存问询会话失败:', error);
      throw error;
    }

    this.logger.log(`问询会话创建成功: ${sessionId}`);
    return session;
  }

  /**
   * 开始 AI 问询
   */
  async startInquiry(
    userId: string,
    patientId?: string,
    mainComplaint?: string,
    history?: string[],
    tumorInfo?: TumorPatientInfo
  ): Promise<{
    sessionId: string;
    firstQuestion: string;
    extractedSymptoms: NLUExtraction;
    inferenceResult: InferenceResult;
    confidenceMetrics: any;
  }> {
    this.logger.log(`开始 AI 问询: userId=${userId}, mainComplaint=${mainComplaint}`);

    // 1. 创建会话
    const session = await this.createInquirySession(userId, patientId, mainComplaint);

    // 2. 如果有主诉，进行 NLU 提取
    let extractedSymptoms: NLUExtraction = { symptoms: [] };
    if (mainComplaint) {
      extractedSymptoms = await this.nluService.parseUserInput(mainComplaint);

      // 更新会话症状
      session.symptoms = extractedSymptoms.symptoms.map(s => s.standardized);
      await this.updateSessionSymptoms(session.id, session.symptoms);
    }

    // 3. 贝叶斯推理
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

    // 4. 计算置信度
    const confidenceMetrics = this.bayesianInferenceService.calculateConfidenceMetrics(
      posteriorProbabilities,
      extractedSymptoms.symptoms.map(s => ({
        type: 'symptom',
        name: s.standardized,
        weight: s.confidence,
        source: 'user_input',
      }))
    );

    // 5. 复杂推理
    const inferenceResult = await this.complexInferenceService.inferComplexSyndrome(
      extractedSymptoms.symptoms.map(s => s.standardized),
      history || []
    );

    // 6. 更新会话诊断信息
    await this.updateSessionDiagnosis(
      session.id,
      inferenceResult,
      confidenceMetrics
    );

    // 7. 生成第一个问题
    const firstQuestion = this.generateFirstQuestion(inferenceResult, extractedSymptoms);

    // 8. 如果是肿瘤患者，保存肿瘤信息到会话
    if (tumorInfo) {
      await this.saveTumorInfo(session.id, tumorInfo);
    }

    return {
      sessionId: session.id,
      firstQuestion,
      extractedSymptoms,
      inferenceResult,
      confidenceMetrics,
    };
  }

  /**
   * 继续问询
   */
  async continueInquiry(
    sessionId: string,
    answer: string
  ): Promise<{
    newSymptoms: NLUExtraction;
    updatedConfidenceMetrics: any;
    updatedInferenceResult: InferenceResult;
    nextQuestion: string | null;
    isComplete: boolean;
    recommendedFormulas?: FormulaData[];
  }> {
    this.logger.log(`继续问询: sessionId=${sessionId}`);

    // 1. NLU 解析用户回答
    const newSymptoms = await this.nluService.parseUserInput(answer);

    // 2. 获取会话信息
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    // 3. 合并新旧症状
    const allSymptoms = [
      ...session.symptoms,
      ...newSymptoms.symptoms.map(s => s.standardized),
    ];
    await this.updateSessionSymptoms(sessionId, allSymptoms);

    // 4. 贝叶斯推理更新
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

    // 5. 计算更新后的置信度
    const updatedConfidenceMetrics =
      this.bayesianInferenceService.calculateConfidenceMetrics(
        posteriorProbabilities,
        allSymptoms.map(s => ({
          type: 'symptom',
          name: s,
          weight: 1.0,
          source: 'user_input',
        }))
      );

    // 6. 复杂推理更新
    const updatedInferenceResult =
      await this.complexInferenceService.inferComplexSyndrome(allSymptoms, []);

    // 7. 更新会话诊断信息
    await this.updateSessionDiagnosis(
      sessionId,
      updatedInferenceResult,
      updatedConfidenceMetrics
    );

    // 8. 判断是否完成
    const isComplete =
      updatedConfidenceMetrics.recommendation === 'high_confidence' ||
      updatedConfidenceMetrics.recommendation === 'contradictory';

    // 9. 生成下一个问题
    let nextQuestion: string | null = null;
    if (!isComplete) {
      nextQuestion = this.generateNextQuestion(updatedInferenceResult, newSymptoms);
    }

    // 10. 如果完成，推荐方剂
    let recommendedFormulas: FormulaData[] | undefined;
    if (isComplete) {
      recommendedFormulas = await this.recommendFormulas(
        updatedInferenceResult,
        allSymptoms
      );
    }

    return {
      newSymptoms,
      updatedConfidenceMetrics,
      updatedInferenceResult,
      nextQuestion,
      isComplete,
      recommendedFormulas,
    };
  }

  /**
   * 生成完整治疗方案
   */
  async generateTreatmentPlan(
    sessionId: string,
    tongue?: string,
    pulse?: string
  ): Promise<IntegratedTreatmentPlan> {
    this.logger.log(`生成治疗方案: sessionId=${sessionId}`);

    // 1. 获取会话信息
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('会话不存在');
    }

    // 2. 更新舌诊、脉诊信息
    if (tongue || pulse) {
      await getSupabaseClient()
        .from('inquiry_sessions')
        .update({
          tongue,
          pulse,
          updated_at: new Date(),
        })
        .eq('id', sessionId);
    }

    // 3. 从会话中获取诊断结果
    const inferenceResult = session.diagnosis as InferenceResult;
    const confidenceMetrics = session.diagnosisConfidence as any;

    // 4. 推荐方剂
    const recommendedFormulas = await this.recommendFormulas(
      inferenceResult,
      session.symptoms
    );

    if (!recommendedFormulas || recommendedFormulas.length === 0) {
      throw new Error('未找到合适的方剂');
    }

    const recommendedFormula = recommendedFormulas[0];

    // 5. 检查是否为肿瘤患者，获取肿瘤信息
    const tumorInfo = await this.getTumorInfo(sessionId);

    let finalFormula = recommendedFormula;
    let dosageAdjustment: string | undefined;
    let drugInteractions: any[] | undefined;

    if (tumorInfo) {
      // 根据肿瘤信息调整方剂
      const adjustedFormula = await this.adjustFormulaForTumor(
        recommendedFormula,
        tumorInfo
      );

      if (adjustedFormula) {
        finalFormula = adjustedFormula.formula;
        dosageAdjustment = adjustedFormula.dosageAdjustment;
        drugInteractions = adjustedFormula.drugInteractions;
      }
    }

    // 6. 生成完整治疗方案
    const treatmentPlan: IntegratedTreatmentPlan = {
      sessionId,
      userId: session.userId as string, // @ts-ignore

      // 诊断结果
      inferenceResult,
      nluExtraction: { symptoms: session.symptoms.map(s => ({
        standardized: s,
        confidence: 1.0,
        category: '主症' as const,
        original: s,
        alias: [],
      })) },
      confidenceMetrics,

      // 推荐方剂
      recommendedFormula: finalFormula,
      formulaMatchScore: 0.85, // 简化计算

      // 肿瘤患者特殊信息
      tumorInfo: tumorInfo ? {
        constitution: tumorInfo.constitution,
        pathogenesis: tumorInfo.pathogenesis,
        complication: tumorInfo.complication,
        adjustedFormula: finalFormula !== recommendedFormula ? finalFormula : undefined,
        dosageAdjustment,
        drugInteractions,
      } : undefined,

      // 完整治疗方案
      diagnosis: inferenceResult.name,
      differentiation: `${inferenceResult.meridians.join('+')}证`,
      treatmentPrinciple: finalFormula.treatmentMethod || '调和营卫',
      symptomAnalysis: `主症：${session.symptoms.join('、')}`,

      prescription: {
        formulaName: finalFormula.formulaName,
        ingredients: await this.getFormulaIngredients(finalFormula.id),
        decoctionMethod: finalFormula.instructions || '水煎服，每日1剂',
        dosageMethod: finalFormula.dosage || '每日1剂，分早晚两次温服',
        precautions: this.generatePrecautions(finalFormula),
      },

      explanation: finalFormula.mechanism || '根据辨证论治原则组方',
      advice: '建议清淡饮食，避免辛辣油腻。注意休息，保持心情舒畅。',
      warnings: confidenceMetrics.recommendation === 'low_confidence'
        ? ['诊断置信度较低，建议结合舌诊脉诊进一步确认']
        : [],

      createdAt: new Date(),
    };

    // 7. 保存治疗方案到会话
    await getSupabaseClient()
      .from('inquiry_sessions')
      .update({
        recommended_formula: {
          formulaName: finalFormula.formulaName,
          diagnosis: treatmentPlan.diagnosis,
          prescription: treatmentPlan.prescription,
        },
        diagnosis_confidence: confidenceMetrics.primarySyndrome?.confidence || 0,
        status: '已完成',
        session_end: new Date(),
        updated_at: new Date(),
      })
      .eq('id', sessionId);

    this.logger.log(`治疗方案生成成功: sessionId=${sessionId}`);
    return treatmentPlan;
  }

  /**
   * 推荐方剂（从数据库查询）
   */
  private async recommendFormulas(
    inferenceResult: InferenceResult,
    symptoms: string[],
    diseaseCategoryId?: string,
    patientType?: 'general' | 'chronic' | 'tumor'
  ): Promise<FormulaData[]> {
    const { formula, alternativeFormulas } = inferenceResult;

    // 根据患者类型选择不同的查询策略
    let formulas: FormulaData[] = [];

    if (patientType === 'tumor' && diseaseCategoryId) {
      // 肿瘤患者：优先查询肿瘤配置
      formulas = await this.recommendTumorFormulas(diseaseCategoryId, symptoms);
    } else if (patientType === 'chronic' && diseaseCategoryId) {
      // 慢性病患者：优先查询慢性病配置
      formulas = await this.recommendChronicDiseaseFormulas(diseaseCategoryId, symptoms);
    } else {
      // 通用患者：查询 AI 推荐的方剂
      const mainFormula = await this.getFormulaByName(formula);
      const alternatives = await Promise.all(
        alternativeFormulas.map(f => this.getFormulaByName(f))
      );
      formulas = [mainFormula, ...alternatives].filter(f => f !== undefined) as FormulaData[];
    }

    // 如果没有查到任何方剂，使用备用方案
    if (formulas.length === 0) {
      this.logger.warn('未查到方剂，使用备用方案');
      const mainFormula = await this.getFormulaByName(formula);
      if (mainFormula) {
        formulas = [mainFormula];
      }
    }

    // 根据症状匹配度和证据等级排序
    return formulas.sort((a, b) => {
      const aMatch = this.calculateFormulaMatchScore(a, symptoms);
      const bMatch = this.calculateFormulaMatchScore(b, symptoms);
      const aEvidence = this.getEvidenceScore(a.evidence_level);
      const bEvidence = this.getEvidenceScore(b.evidence_level);

      // 综合评分：症状匹配度占 70%，证据等级占 30%
      const aScore = aMatch * 0.7 + aEvidence * 0.3;
      const bScore = bMatch * 0.7 + bEvidence * 0.3;

      return bScore - aScore;
    });
  }

  /**
   * 推荐肿瘤患者方剂
   */
  private async recommendTumorFormulas(
    diseaseCategoryId: string,
    symptoms: string[]
  ): Promise<FormulaData[]> {
    const { data, error } = await getSupabaseClient()
      .from('tumor_formula_relations')
      .select(`
        *,
        formulas (*)
      `)
      .eq('disease_category_id', diseaseCategoryId);

    if (error) {
      this.logger.error('查询肿瘤方剂失败:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item.formulas,
      dosageAdjustment: item.dosage_adjustment,
      efficacyNotes: item.efficacy_notes,
    })).filter(f => f !== undefined);
  }

  /**
   * 推荐慢性病方剂
   */
  private async recommendChronicDiseaseFormulas(
    diseaseCategoryId: string,
    symptoms: string[]
  ): Promise<FormulaData[]> {
    const { data, error } = await getSupabaseClient()
      .from('v_chronic_disease_recommendations')
      .select('*')
      .eq('disease_category_id', diseaseCategoryId)
      .order('efficacy_score', { ascending: false })
      .limit(10);

    if (error) {
      this.logger.error('查询慢性病方剂失败:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      formulaName: item.formula_name,
      source: item.source,
      mechanism: item.mechanism,
      dosageAdjustment: item.dosage_adjustment,
      efficacyScore: item.efficacy_score,
      evidenceLevel: item.evidence_level,
    })).filter(f => f !== undefined);
  }

  /**
   * 根据疾病类型推荐方剂（增强版）
   */
  async recommendFormulasByDisease(
    diseaseCategoryId: string,
    symptoms: string[],
    options?: {
      evidenceLevel?: 'high' | 'medium' | 'low';
      limit?: number;
      includeChronic?: boolean;
      includeGeneral?: boolean;
    }
  ): Promise<FormulaData[]> {
    const opts = {
      evidenceLevel: 'medium',
      limit: 10,
      includeChronic: true,
      includeGeneral: true,
      ...options,
    };

    this.logger.log(`根据疾病推荐方剂: ${diseaseCategoryId}`, { symptoms, opts });

    // 查询方剂-疾病关联
    const { data, error } = await getSupabaseClient()
      .from('formula_disease_relations')
      .select(`
        *,
        formulas (*)
      `)
      .eq('disease_category_id', diseaseCategoryId)
      .order('efficacy_score', { ascending: false })
      .limit(opts.limit);

    if (error) {
      this.logger.error('查询方剂-疾病关联失败:', error);
      return [];
    }

    let formulas = (data || [])
      .filter(item => {
        // 过滤证据等级
        if (opts.evidenceLevel === 'high' && item.evidence_level !== 'high') return false;
        return true;
      })
      .map(item => ({
        ...item.formulas,
        efficacyScore: item.efficacy_score,
        evidenceLevel: item.evidence_level,
        clinicalCasesCount: item.clinical_cases_count,
        clinicalEffectiveness: item.clinical_effectiveness,
      }));

    // 如果启用，添加慢性病专用方剂
    if (opts.includeChronic) {
      const chronicFormulas = await this.recommendChronicDiseaseFormulas(diseaseCategoryId, symptoms);
      // 去重
      const existingIds = new Set(formulas.map(f => f.id));
      chronicFormulas.forEach(cf => {
        if (!existingIds.has(cf.id)) {
          formulas.push(cf);
        }
      });
    }

    // 根据症状匹配度排序
    return formulas.sort((a, b) => {
      const aMatch = this.calculateFormulaMatchScore(a, symptoms);
      const bMatch = this.calculateFormulaMatchScore(b, symptoms);
      const aEvidence = this.getEvidenceScore(a.evidenceLevel);
      const bEvidence = this.getEvidenceScore(b.evidence_level);

      // 综合评分
      const aScore = aMatch * 0.6 + aEvidence * 0.4;
      const bScore = bMatch * 0.6 + bEvidence * 0.4;

      return bScore - aScore;
    }).slice(0, opts.limit);
  }

  /**
   * 获取证据等级评分
   */
  private getEvidenceScore(evidenceLevel?: string): number {
    const scores = {
      'high': 1.0,
      'medium': 0.7,
      'low': 0.4,
    };
    return scores[evidenceLevel as keyof typeof scores] || 0.5;
  }

  /**
   * 从数据库查询方剂
   */
  private async getFormulaByName(formulaName: string): Promise<FormulaData | undefined> {
    const { data, error } = await getSupabaseClient()
      .from('formulas')
      .select('*')
      .eq('formula_name', formulaName)
      .eq('is_active', true)
      .single();

    if (error) {
      this.logger.error(`查询方剂失败: ${formulaName}`, error);
      return undefined;
    }

    return data;
  }

  /**
   * 获取方剂组成
   */
  private async getFormulaIngredients(formulaId: string): Promise<any[]> {
    const { data, error } = await getSupabaseClient()
      .from('formula_symptoms')
      .select('*')
      .eq('formula_id', formulaId);

    if (error) {
      this.logger.error(`查询方剂组成失败: ${formulaId}`, error);
      return [];
    }

    return data.map(item => ({
      name: item.symptom_name || '',
      dosage: item.dosage || '9g',
      special: item.special_instructions || '',
    }));
  }

  /**
   * 计算方剂匹配度
   */
  private calculateFormulaMatchScore(formula: FormulaData, symptoms: string[]): number {
    if (!formula.indications || formula.indications.length === 0) {
      return 0.5;
    }

    let matchCount = 0;
    const indications = formula.indications || [];
    symptoms.forEach(symptom => {
      if (indications.some(ind => ind.includes(symptom))) {
        matchCount++;
      }
    });

    return matchCount / symptoms.length;
  }

  /**
   * 获取会话信息
   */
  async getSession(sessionId: string): Promise<InquirySession | null> {
    const { data, error } = await getSupabaseClient()
      .from('inquiry_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      this.logger.error(`查询会话失败: ${sessionId}`, error);
      return null;
    }

    // 状态转换（中文 -> 英文）
    const statusMap: Record<DatabaseSessionStatus, string> = {
      '进行中': 'in_progress',
      '已完成': 'completed',
      '已取消': 'cancelled',
    };

    // 转换 snake_case 到 camelCase
    return {
      id: data.id,
      userId: data.user_id,
      patientId: data.patient_id,
      sessionStart: data.session_start,
      sessionEnd: data.session_end,
      symptoms: data.symptoms || [],
      tongue: data.tongue,
      pulse: data.pulse,
      diagnosis: data.diagnosis,
      recommendedFormula: data.recommended_formula,
      diagnosisConfidence: data.diagnosis_confidence,
      warnings: data.warnings || [],
      status: statusMap[data.status as DatabaseSessionStatus] as any,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * 更新会话症状
   */
  private async updateSessionSymptoms(sessionId: string, symptoms: string[]): Promise<void> {
    await getSupabaseClient()
      .from('inquiry_sessions')
      .update({
        symptoms,
        updated_at: new Date(),
      })
      .eq('id', sessionId);
  }

  /**
   * 更新会话诊断信息
   */
  private async updateSessionDiagnosis(
    sessionId: string,
    inferenceResult: InferenceResult,
    confidenceMetrics: any
  ): Promise<void> {
    await getSupabaseClient()
      .from('inquiry_sessions')
      .update({
        diagnosis: inferenceResult,
        diagnosis_confidence: confidenceMetrics.primarySyndrome?.confidence || 0,
        updated_at: new Date(),
      })
      .eq('id', sessionId);
  }

  /**
   * 保存肿瘤信息
   */
  private async saveTumorInfo(sessionId: string, tumorInfo: TumorPatientInfo): Promise<void> {
    // 保存到健康记录或其他表中
    const session = await this.getSession(sessionId);
    if (!session) return;

    const { error } = await getSupabaseClient()
      .from('health_records')
      .insert({
        user_id: session.userId,
        record_type: 'tumor',
        record_data: tumorInfo,
        created_at: new Date(),
      });

    if (error) {
      this.logger.error('保存肿瘤信息失败:', error);
    }
  }

  /**
   * 获取肿瘤信息
   */
  private async getTumorInfo(sessionId: string): Promise<TumorPatientInfo | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    // 从健康记录中查询
    const { data, error } = await getSupabaseClient()
      .from('health_records')
      .select('record_data')
      .eq('user_id', session.userId as unknown as string)
      .eq('record_type', 'tumor')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return null;
    }

    return data.record_data as TumorPatientInfo;
  }

  /**
   * 根据肿瘤信息调整方剂
   */
  private async adjustFormulaForTumor(
    formula: FormulaData,
    tumorInfo: TumorPatientInfo
  ): Promise<{
    formula: FormulaData;
    dosageAdjustment?: string;
    drugInteractions?: any[];
  } | null> {
    // 从肿瘤数据库查询相关调整方案
    const { data, error } = await getSupabaseClient()
      .from('tumor_formula_relations')
      .select('*, formulas(*)')
      .eq('formula_id', formula.id);

    if (error || !data || data.length === 0) {
      return null;
    }

    // 根据体质、病机、并发症匹配
    const matched = data.find(item => {
      if (tumorInfo.constitution && item.constitution_id !== tumorInfo.constitution) {
        return false;
      }
      if (tumorInfo.pathogenesis && item.pathogenesis_id !== tumorInfo.pathogenesis) {
        return false;
      }
      if (tumorInfo.complication && item.complication_id !== tumorInfo.complication) {
        return false;
      }
      return true;
    });

    if (!matched) {
      return null;
    }

    // 查询调整后的方剂
    // 这里简化处理，实际可能需要查询 special_adjustments 表
    return {
      formula: formula,
      dosageAdjustment: matched.dosage_adjustment,
    };
  }

  /**
   * 生成注意事项
   */
  private generatePrecautions(formula: FormulaData): string {
    const precautions: string[] = [];

    if (formula.contraindications && formula.contraindications.length > 0) {
      precautions.push(`禁忌：${formula.contraindications.join('、')}`);
    }

    precautions.push('服药期间忌食生冷、油腻、辛辣之物');
    precautions.push('孕妇慎用，需在医师指导下使用');

    return precautions.join('\n');
  }

  /**
   * 生成第一个问题
   */
  private generateFirstQuestion(
    inferenceResult: InferenceResult,
    extractedSymptoms: NLUExtraction
  ): string {
    if (inferenceResult.type === '合病') {
      return `您除了${extractedSymptoms.symptoms[0]?.standardized || '上述症状'}，还有其他不适吗？`;
    }

    if (inferenceResult.type === '并病') {
      return `您是否感觉病情有变化，比如${inferenceResult.evidence[0] || '其他症状'}加重？`;
    }

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
    if (inferenceResult.evidence.length < 3) {
      return '您还有其他症状吗？';
    }

    return null;
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

  // ========== Qwen 大模型集成方法 ==========

  /**
   * 使用 Qwen 提取症状（增强版）
   */
  async extractSymptomsWithQwen(
    userInput: string,
    sessionId?: string
  ): Promise<{
    symptoms: string[];
    extractedText: string;
    confidence: number;
    missedSymptoms?: string[];
    suggestedQuestions?: string[];
  }> {
    this.logger.log(`使用 Qwen 提取症状: ${userInput.substring(0, 50)}...`);

    try {
      // 获取会话上下文（如果有）
      let context;
      if (sessionId) {
        const session = await this.getSession(sessionId);
        if (session) {
          context = {
            previousSymptoms: session.symptoms,
            currentDiagnosis: session.diagnosis?.differentiation,
            sessionContext: `会话ID: ${sessionId}, 开始时间: ${session.sessionStart}`,
          };
        }
      }

      // 调用症状提取服务
      const result = await this.symptomExtractionService.extractSymptoms(
        userInput,
        context
      );

      this.logger.log(`Qwen 症状提取成功: ${result.symptoms.join(', ')}`);
      return result;
    } catch (error) {
      this.logger.error('Qwen 症状提取失败，使用备用方案:', error);
      // 备用方案：使用简单的关键词提取
      return {
        symptoms: this.simpleExtractSymptoms(userInput),
        extractedText: userInput,
        confidence: 0.6,
        suggestedQuestions: ['请详细描述症状的具体情况'],
      };
    }
  }

  /**
   * 生成诊断解释（使用 Qwen）
   */
  async generateDiagnosisExplanationWithQwen(
    sessionId: string
  ): Promise<string> {
    this.logger.log(`使用 Qwen 生成诊断解释: ${sessionId}`);

    try {
      const session = await this.getSession(sessionId);
      if (!session || !session.diagnosis) {
        throw new Error('会话或诊断信息不存在');
      }

      const explanation = await this.naturalLanguageGenerationService.generateDiagnosisExplanation(
        {
          diagnosis: session.diagnosis.syndrome || '待定',
          differentiation: session.diagnosis.differentiation || '待定',
          treatmentPrinciple: session.diagnosis.treatmentPrinciple || '待定',
        },
        session.symptoms,
        session.recommendedFormula?.formulaName || '待定'
      );

      this.logger.log('诊断解释生成成功');
      return explanation;
    } catch (error) {
      this.logger.error('生成诊断解释失败:', error);
      throw error;
    }
  }

  /**
   * 生成调护建议（使用 Qwen）
   */
  async generateCareAdviceWithQwen(
    sessionId: string,
    lifestyleInfo?: {
      diet?: string;
      exercise?: string;
      sleep?: string;
      emotion?: string;
    }
  ): Promise<{
    dietAdvice: string;
    exerciseAdvice: string;
    sleepAdvice: string;
    emotionAdvice: string;
    generalAdvice: string;
  }> {
    this.logger.log(`使用 Qwen 生成调护建议: ${sessionId}`);

    try {
      const session = await this.getSession(sessionId);
      if (!session || !session.diagnosis) {
        throw new Error('会话或诊断信息不存在');
      }

      const advice = await this.naturalLanguageGenerationService.generateCareAdvice(
        {
          diagnosis: session.diagnosis.syndrome || '待定',
          differentiation: session.diagnosis.differentiation || '待定',
        },
        session.recommendedFormula?.formulaName || '待定',
        lifestyleInfo
      );

      this.logger.log('调护建议生成成功');
      return advice;
    } catch (error) {
      this.logger.error('生成调护建议失败:', error);
      throw error;
    }
  }

  /**
   * 生成用药指导（使用 Qwen）
   */
  async generateMedicationGuideWithQwen(
    sessionId: string
  ): Promise<{
    preparationGuide: string;
    dosageGuide: string;
    precautions: string;
    timeline: string;
  }> {
    this.logger.log(`使用 Qwen 生成用药指导: ${sessionId}`);

    try {
      const session = await this.getSession(sessionId);
      if (!session || !session.recommendedFormula) {
        throw new Error('会话或处方信息不存在');
      }

      const guide = await this.naturalLanguageGenerationService.generateMedicationGuide(
        {
          formulaName: session.recommendedFormula.formulaName,
          ingredients: session.recommendedFormula.ingredients || [],
        },
        {
          decoctionMethod: session.recommendedFormula.decoctionMethod || '待定',
          dosageMethod: session.recommendedFormula.dosageMethod || '待定',
          precautions: session.recommendedFormula.precautions || '待定',
        }
      );

      this.logger.log('用药指导生成成功');
      return guide;
    } catch (error) {
      this.logger.error('生成用药指导失败:', error);
      throw error;
    }
  }

  /**
   * 搜索方剂研究（使用联网搜索）
   */
  async searchFormulaResearchWithWebSearch(
    formulaName: string
  ): Promise<{
    clinicalStudies: any[];
    mechanisms: any[];
    safetyData: any[];
    overallSummary: string;
  }> {
    this.logger.log(`搜索方剂研究: ${formulaName}`);

    try {
      const result = await this.webSearchEnhancementService.searchFormulaResearch(
        formulaName
      );

      this.logger.log('方剂研究搜索成功');
      return result;
    } catch (error) {
      this.logger.error('搜索方剂研究失败:', error);
      throw error;
    }
  }

  /**
   * 搜索疾病最新进展（使用联网搜索）
   */
  async searchDiseaseProgressWithWebSearch(
    diagnosis: string
  ): Promise<{
    latestResearch: any[];
    treatmentGuidelines: any[];
    expertOpinions: any[];
    overallSummary: string;
  }> {
    this.logger.log(`搜索疾病最新进展: ${diagnosis}`);

    try {
      const result = await this.webSearchEnhancementService.searchDiseaseLatestProgress(
        diagnosis
      );

      this.logger.log('疾病最新进展搜索成功');
      return result;
    } catch (error) {
      this.logger.error('搜索疾病最新进展失败:', error);
      throw error;
    }
  }

  /**
   * 生成增强版治疗方案（集成所有 Qwen 服务）
   */
  async generateEnhancedTreatmentPlan(
    sessionId: string,
    options?: {
      includeDiagnosisExplanation?: boolean;
      includeCareAdvice?: boolean;
      includeMedicationGuide?: boolean;
      includeSymptomPrediction?: boolean;
      includeResearchSearch?: boolean;
    }
  ): Promise<IntegratedTreatmentPlan & {
    diagnosisExplanation?: string;
    careAdvice?: any;
    medicationGuide?: any;
    symptomPrediction?: any;
    formulaResearch?: any;
    diseaseProgress?: any;
  }> {
    this.logger.log(`生成增强版治疗方案: ${sessionId}`);

    // 先生成基础治疗方案
    const basePlan = await this.generateTreatmentPlan(sessionId);

    // 默认选项
    const opts = {
      includeDiagnosisExplanation: true,
      includeCareAdvice: true,
      includeMedicationGuide: true,
      includeSymptomPrediction: false,
      includeResearchSearch: false,
      ...options,
    };

    // 生成诊断解释
    if (opts.includeDiagnosisExplanation && basePlan.recommendedFormula) {
      basePlan.diagnosisExplanation = await this.generateDiagnosisExplanationWithQwen(sessionId);
    }

    // 生成调护建议
    if (opts.includeCareAdvice) {
      basePlan.careAdvice = await this.generateCareAdviceWithQwen(sessionId);
    }

    // 生成用药指导
    if (opts.includeMedicationGuide) {
      basePlan.medicationGuide = await this.generateMedicationGuideWithQwen(sessionId);
    }

    // 搜索方剂研究
    if (opts.includeResearchSearch && basePlan.recommendedFormula) {
      basePlan.formulaResearch = await this.searchFormulaResearchWithWebSearch(
        basePlan.recommendedFormula.formulaName
      );
    }

    // 搜索疾病进展
    if (opts.includeResearchSearch && basePlan.diagnosis) {
      basePlan.diseaseProgress = await this.searchDiseaseProgressWithWebSearch(
        basePlan.diagnosis
      );
    }

    this.logger.log('增强版治疗方案生成成功');
    return basePlan as any;
  }

  /**
   * 简单的症状提取（备用方案）
   */
  private simpleExtractSymptoms(input: string): string[] {
    const symptoms: string[] = [];

    // 常见症状关键词
    const symptomKeywords = [
      '发热', '头痛', '身痛', '无汗', '恶寒', '自汗', '盗汗', '口渴', '口不渴',
      '咳嗽', '喘息', '气短', '胸闷', '心悸', '失眠', '多梦', '纳呆', '恶心',
      '呕吐', '腹痛', '腹泻', '便秘', '小便不利', '小便频数', '尿赤', '水肿',
      '面色红', '面色白', '面色黄', '面色晦暗', '舌红', '舌淡', '舌胖', '舌瘦',
      '苔黄', '苔白', '苔腻', '脉浮', '脉沉', '脉数', '脉迟', '脉弦', '脉细',
    ];

    for (const keyword of symptomKeywords) {
      if (input.includes(keyword)) {
        symptoms.push(keyword);
      }
    }

    return symptoms;
  }
}
