import { Injectable, Logger } from '@nestjs/common';
import { DynamicDiagnosticTreeEngine, DiagnosticResult } from './dynamic-diagnostic-tree.service';
import { ContradictionDetector } from './contradiction-detector.service';
import { LanguageStyleConverter } from './language-style-converter.service';
import { createLLMClient } from '@/utils/llm-helper';
import {
  MERIDIAN_SYNDROMES,
  FORMULA_EVIDENCES,
  SYMPTOM_WEIGHTS
} from './meridian-knowledge-base';

/**
 * 经方问询会话状态
 */
export interface JingfangInquirySession {
  sessionId: string;
  userId: string;
  patientInfo: {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
  };
  diagnosticState: DiagnosticResult;
  symptoms: string[];
  answers: string[];
  contradictionWarnings: string[];
  currentRound: number;
  status: 'initial' | 'in_progress' | 'needs_deep_inquiry' | 'complete';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 问询结果
 */
export interface InquiryResult {
  sessionId: string;
  question: string;
  questionType: 'determinant' | 'confirmatory' | 'differentiation' | 'followup';
  diagnosticState: DiagnosticResult;
  warningMessage?: string;
  followUpQuestions?: string[];
  isComplete: boolean;
}

/**
 * 经方问询策略生成器
 * 整合六经辨证、动态辨证树、假象识别、语言风格转换
 */
@Injectable()
export class JingfangInquiryStrategyGenerator {
  private logger = new Logger(JingfangInquiryStrategyGenerator.name);
  private sessions: Map<string, JingfangInquirySession> = new Map();
  private diagnosticTreeEngine: DynamicDiagnosticTreeEngine;
  private contradictionDetector: ContradictionDetector;
  private languageConverter: LanguageStyleConverter;
  private llmClient: any;

  constructor() {
    this.diagnosticTreeEngine = new DynamicDiagnosticTreeEngine();
    this.contradictionDetector = new ContradictionDetector();
    this.languageConverter = new LanguageStyleConverter();
    this.llmClient = createLLMClient();
  }

  /**
   * 开始经方问询
   */
  async startInquiry(
    userId: string,
    patientInfo: {
      name: string;
      age: number;
      gender: 'male' | 'female' | 'other';
    },
    chiefComplaint: string,
    additionalInfo: string = ''
  ): Promise<InquiryResult> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 初始化辨证树
    const diagnosticState = this.diagnosticTreeEngine.initializeDiagnosticTree();

    // 转换症状为古典术语
    const classicalSymptoms = this.languageConverter.convertSymptomList([chiefComplaint, additionalInfo].filter(s => s));

    // 创建会话
    const session: JingfangInquirySession = {
      sessionId,
      userId,
      patientInfo,
      diagnosticState,
      symptoms: classicalSymptoms,
      answers: [],
      contradictionWarnings: [],
      currentRound: 0,
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sessions.set(sessionId, session);

    // 获取第一个问题
    const question = this.diagnosticTreeEngine.getCurrentQuestion('root');

    // 检测假象
    const contradictionResult = await this.contradictionDetector.detectContradictions(classicalSymptoms, []);
    if (contradictionResult.hasContradiction) {
      session.contradictionWarnings.push(contradictionResult.warningMessage || '');
    }

    this.logger.log(`开始经方问询：${sessionId}，主诉 "${chiefComplaint}"`);

    return {
      sessionId,
      question: this.languageConverter.convertQuestionToClassical(question),
      questionType: 'determinant',
      diagnosticState,
      warningMessage: contradictionResult.warningMessage,
      followUpQuestions: contradictionResult.followUpQuestions,
      isComplete: false
    };
  }

  /**
   * 继续经方问询
   */
  async continueInquiry(
    sessionId: string,
    answer: string
  ): Promise<InquiryResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`问询会话不存在：${sessionId}`);
    }

    this.logger.log(`继续经方问询：${sessionId}，回答 "${answer}"`);

    // 标准化用户回答
    const standardizedAnswer = this.languageConverter.standardizeUserAnswer(answer);
    session.answers.push(standardizedAnswer);

    // 更新辨证状态
    session.diagnosticState = await this.diagnosticTreeEngine.processAnswer(
      session.diagnosticState.currentNodeId,
      standardizedAnswer,
      session.diagnosticState.currentMeridianProbabilities,
      session.diagnosticState.confirmedFormulas,
      session.diagnosticState.diagnosticPath
    );

    session.currentRound++;
    session.updatedAt = new Date();

    // 判断是否完成
    if (session.diagnosticState.isComplete) {
      session.status = 'complete';
      this.sessions.set(sessionId, session);

      return {
        sessionId,
        question: '辨证完成，请使用 /complete-inquiry 接口获取最终诊断和处方建议',
        questionType: 'determinant',
        diagnosticState: session.diagnosticState,
        isComplete: true
      };
    }

    // 检测是否需要深度问询
    const needsDeepInquiry = this.diagnosticTreeEngine.needsDeepInquiry(
      session.diagnosticState.currentMeridianProbabilities
    );

    if (needsDeepInquiry && session.currentRound > 3) {
      session.status = 'needs_deep_inquiry';
      const deepInquiryNodeId = this.diagnosticTreeEngine.getNextDeepInquiryNode(
        session.diagnosticState.currentMeridianProbabilities
      );

      if (deepInquiryNodeId) {
        session.diagnosticState.currentNodeId = deepInquiryNodeId;
        this.sessions.set(sessionId, session);

        const question = this.diagnosticTreeEngine.getCurrentQuestion(deepInquiryNodeId);

        return {
          sessionId,
          question: this.languageConverter.convertQuestionToClassical(question),
          questionType: 'differentiation',
          diagnosticState: session.diagnosticState,
          isComplete: false
        };
      }
    }

    // 检测假象
    const contradictionResult = await this.contradictionDetector.detectContradictions(
      session.symptoms,
      session.answers
    );

    if (contradictionResult.hasContradiction && !session.contradictionWarnings.includes(contradictionResult.warningMessage || '')) {
      session.contradictionWarnings.push(contradictionResult.warningMessage || '');
      this.sessions.set(sessionId, session);

      return {
        sessionId,
        question: '检测到症状存在矛盾，需要进一步确认以排除假象',
        questionType: 'followup',
        diagnosticState: session.diagnosticState,
        warningMessage: contradictionResult.warningMessage,
        followUpQuestions: contradictionResult.followUpQuestions,
        isComplete: false
      };
    }

    // 获取下一个问题
    const nextQuestion = this.diagnosticTreeEngine.getCurrentQuestion(
      session.diagnosticState.currentNodeId
    );

    // 获取当前节点信息
    const currentNode = this.diagnosticTreeEngine.getCurrentNode(
      session.diagnosticState.currentNodeId
    );

    this.sessions.set(sessionId, session);

    return {
      sessionId,
      question: this.languageConverter.convertQuestionToClassical(nextQuestion),
      questionType: currentNode?.type || 'determinant',
      diagnosticState: session.diagnosticState,
      isComplete: false
    };
  }

  /**
   * 完成问询，获取最终诊断和处方
   */
  async completeInquiry(sessionId: string): Promise<{
    finalDiagnosis: {
      syndrome: string;
      probability: number;
      description: string;
      location: string;
      nature: string;
      keyFeatures: string[];
    };
    confirmedFormula: {
      formulaName: string;
      source: string;
      indication: string;
      dosage: string;
      instructions: string;
    } | null;
    alternativeFormulas: {
      formulaName: string;
      source: string;
      indication: string;
    }[];
    reasoning: string;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`问询会话不存在：${sessionId}`);
    }

    this.logger.log(`完成经方问询：${sessionId}`);

    // 获取最可能的六经病证
    const mostLikely = this.diagnosticTreeEngine.getMostLikelyMeridian(
      session.diagnosticState.currentMeridianProbabilities
    );

    if (!mostLikely) {
      throw new Error('无法确定明确的六经病证');
    }

    // 获取确认的方剂
    const confirmedFormulas = this.diagnosticTreeEngine.getConfirmedFormulas(
      session.diagnosticState.confirmedFormulas
    );

    // 选择权重最高的方剂
    const confirmedFormula = confirmedFormulas.length > 0
      ? confirmedFormulas.sort((a, b) => b.weight - a.weight)[0]
      : null;

    // 获取备选方剂
    const alternativeFormulas = FORMULA_EVIDENCES
      .filter(f => f.meridianSyndrome === mostLikely.meridian && !confirmedFormulas.some(c => c.formulaName === f.formulaName))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map(f => ({
        formulaName: f.formulaName,
        source: f.source,
        indication: f.indication
      }));

    // 生成诊断推理
    const reasoning = await this.generateDiagnosticReasoning(session, mostLikely, confirmedFormula);

    // 生成用量说明
    let dosage = '';
    let instructions = '';

    if (confirmedFormula) {
      const dosageResult = await this.generateDosageInstructions(confirmedFormula.formulaName, session.patientInfo);
      dosage = dosageResult.dosage;
      instructions = dosageResult.instructions;
    }

    return {
      finalDiagnosis: {
        syndrome: mostLikely.meridian,
        probability: mostLikely.probability,
        description: mostLikely.details.description,
        location: mostLikely.details.location,
        nature: mostLikely.details.nature,
        keyFeatures: mostLikely.details.keySymptoms
      },
      confirmedFormula: confirmedFormula ? {
        formulaName: confirmedFormula.formulaName,
        source: confirmedFormula.source,
        indication: confirmedFormula.indication,
        dosage,
        instructions
      } : null,
      alternativeFormulas,
      reasoning
    };
  }

  /**
   * 生成诊断推理（使用 AI）
   */
  private async generateDiagnosticReasoning(
    session: JingfangInquirySession,
    mostLikely: any,
    confirmedFormula: any
  ): Promise<string> {
    const systemPrompt = `你是一位经验丰富的经方医学专家。请根据问询过程，生成诊断推理说明。

输出格式必须为JSON，包含以下字段：
{
  "reasoning": "诊断推理说明（100-200字）"
}

推理要点：
- 说明六经辨证依据（恶寒发热、汗出与否、口渴等关键症状）
- 说明方证对应依据（经方的主证匹配）
- 说明病机分析（病位、病性、病势）`;

    const symptomSummary = session.symptoms.join('，');
    const answerSummary = session.answers.join('；');

    const userPrompt = `患者信息：
- 姓名：${session.patientInfo.name}
- 年龄：${session.patientInfo.age}岁
- 性别：${session.patientInfo.gender === 'male' ? '男' : session.patientInfo.gender === 'female' ? '女' : '其他'}
- 主诉：${symptomSummary}

问询过程：
${answerSummary}

最终诊断：${mostLikely.meridian}（${mostLikely.probability}%）
确认方剂：${confirmedFormula ? confirmedFormula.formulaName : '未确认'}

请生成诊断推理说明。`;

    try {
      const response = await this.llmClient.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        temperature: 0.5,
      });

      const result = this.parseAIResponse(response.content);
      return result.reasoning || '基于六经辨证和方证对应原则，结合患者症状和问询过程，确定诊断。';
    } catch (error) {
      this.logger.error('生成诊断推理失败:', error);
      return `患者症状符合${mostLikely.meridian}的特征，经辨证论治，确认${mostLikely.meridian}诊断。${confirmedFormula ? `方证对应${confirmedFormula.formulaName}。` : ''}`;
    }
  }

  /**
   * 生成用量说明（使用 AI）
   */
  private async generateDosageInstructions(
    formulaName: string,
    patientInfo: { age: number; gender: string }
  ): Promise<{ dosage: string; instructions: string }> {
    const systemPrompt = `你是一位经验丰富的经方医学专家。请根据方剂名称和患者信息，生成用量和服用说明。

输出格式必须为JSON，包含以下字段：
{
  "dosage": "用量说明（如：麻黄9g，桂枝6g）",
  "instructions": "服用说明（如：水煎服，每日1剂，温服）"
}

用量原则：
- 成人常用量：每味药3-15g
- 老人、儿童减量
- 有毒药物严格控制用量
- 根据体质调整`;

    const userPrompt = `方剂：${formulaName}
患者：${patientInfo.age}岁，${patientInfo.gender === 'male' ? '男' : '女'}

请生成用量和服用说明。`;

    try {
      const response = await this.llmClient.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        temperature: 0.3,
      });

      const result = this.parseAIResponse(response.content);
      return {
        dosage: result.dosage || '遵医嘱',
        instructions: result.instructions || '遵医嘱'
      };
    } catch (error) {
      this.logger.error('生成用量说明失败:', error);
      return {
        dosage: '遵医嘱',
        instructions: '遵医嘱'
      };
    }
  }

  /**
   * 解析 AI 返回的 JSON
   */
  private parseAIResponse(content: string): any {
    try {
      return JSON.parse(content);
    } catch (error) {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      const braceMatch = content.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        return JSON.parse(braceMatch[0]);
      }
      throw new Error('无法解析 AI 返回的 JSON');
    }
  }

  /**
   * 获取会话状态
   */
  getSessionStatus(sessionId: string): JingfangInquirySession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * 删除会话
   */
  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.logger.log(`删除问询会话：${sessionId}`);
  }
}
