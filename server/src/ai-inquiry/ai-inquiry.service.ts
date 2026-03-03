import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  PatientInfo,
  InitialDiagnosisResult,
  InquirySession,
  StartInquiryParams,
  StartInquiryResult,
  ContinueInquiryParams,
  ContinueInquiryResult,
  InquiryStatusResult,
  CompleteInquiryResult,
  PossibleDisease,
  InquiryHistoryItem,
  DiagnosisUpdateResult
} from './types';
import { InitialDiagnosisAnalyzer } from './initial-diagnosis-analyzer.service';
import { InquiryStrategyGenerator } from './inquiry-strategy-generator.service';
import { DiseaseEliminationEngine } from './disease-elimination-engine.service';
import { InquiryScheduler } from './inquiry-scheduler.service';

/**
 * 存储问询会话（生产环境应该使用数据库）
 */
const sessions: Map<string, InquirySession> = new Map();

@Injectable()
export class AiInquiryService {
  private logger = new Logger(AiInquiryService.name);

  constructor(
    private readonly initialDiagnosisAnalyzer: InitialDiagnosisAnalyzer,
    private readonly inquiryStrategyGenerator: InquiryStrategyGenerator,
    private readonly diseaseEliminationEngine: DiseaseEliminationEngine,
    private readonly inquiryScheduler: InquiryScheduler
  ) {}

  /**
   * 开始问询
   */
  async startInquiry(params: StartInquiryParams): Promise<StartInquiryResult> {
    this.logger.log(`开始问询：用户 ${params.userId}，主诉 "${params.chiefComplaint}"`);

    const sessionId = uuidv4();

    try {
      // 步骤 1：初步诊断分析
      const initialDiagnosis = await this.initialDiagnosisAnalyzer.analyze(
        params.patientInfo,
        params.chiefComplaint,
        params.additionalInfo || ''
      );

      // 创建问询会话
      const session: InquirySession = {
        id: sessionId,
        userId: params.userId,
        patientInfo: params.patientInfo,
        chiefComplaint: params.chiefComplaint,
        additionalInfo: params.additionalInfo || '',
        possibleDiseases: initialDiagnosis.possibleDiseases,
        inquiryHistory: [],
        status: 'in_progress',
        currentRound: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 存储会话
      sessions.set(sessionId, session);

      this.logger.log(`问询会话创建成功：${sessionId}`);

      return {
        sessionId,
        initialDiagnosis,
        firstQuestion: initialDiagnosis.nextInquiry.question
      };
    } catch (error) {
      this.logger.error(`开始问询失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 继续问询
   */
  async continueInquiry(params: ContinueInquiryParams): Promise<ContinueInquiryResult> {
    this.logger.log(`继续问询：会话 ${params.sessionId}`);

    const session = sessions.get(params.sessionId);
    if (!session) {
      throw new Error('问询会话不存在');
    }

    try {
      // 获取上一个问题
      let lastQuestion = '';
      if (session.inquiryHistory.length > 0) {
        lastQuestion = session.inquiryHistory[session.inquiryHistory.length - 1].question;
      } else {
        // 使用第一个问题
        const initialDiagnosis = await this.initialDiagnosisAnalyzer.analyze(
          session.patientInfo,
          session.chiefComplaint,
          session.additionalInfo
        );
        lastQuestion = initialDiagnosis.nextInquiry.question;
      }

      // 步骤 1：根据回答更新诊断
      const diagnosisUpdate = await this.diseaseEliminationEngine.updateDiagnosis(
        lastQuestion,
        params.answer,
        session.possibleDiseases
      );

      // 更新可能的病症列表
      session.possibleDiseases = diagnosisUpdate.updatedDiseases.map(update => ({
        name: update.disease,
        probability: update.newProbability,
        keyFeatures: session.possibleDiseases.find(d => d.name === update.disease)?.keyFeatures || [],
        differentialQuestions: session.possibleDiseases.find(d => d.name === update.disease)?.differentialQuestions || []
      }));

      // 添加问询历史
      session.inquiryHistory.push({
        round: session.currentRound,
        question: lastQuestion,
        answer: params.answer,
        diagnosisUpdate
      });

      // 更新轮次
      session.currentRound++;
      session.updatedAt = new Date();

      // 步骤 2：判断是否应该继续问询
      const shouldContinue = this.inquiryScheduler.shouldContinueInquiry(
        session.possibleDiseases,
        session.currentRound
      );

      if (!shouldContinue) {
        // 完成问询，生成最终诊断
        this.logger.log(`问询完成：会话 ${params.sessionId}`);
        session.status = 'completed';

        return {
          nextQuestion: '问询已完成，请使用 /complete-inquiry 接口获取最终诊断',
          diagnosisUpdate,
          currentPossibilities: session.possibleDiseases,
          shouldContinue: false
        };
      }

      // 步骤 3：生成下一个问询策略
      const nextInquiry = await this.inquiryStrategyGenerator.generateStrategy(
        session.possibleDiseases,
        session.inquiryHistory
      );

      // 更新会话
      sessions.set(params.sessionId, session);

      this.logger.log(`生成下一个问题：${nextInquiry.question}`);

      return {
        nextQuestion: nextInquiry.question,
        diagnosisUpdate,
        currentPossibilities: session.possibleDiseases,
        shouldContinue: true
      };
    } catch (error) {
      this.logger.error(`继续问询失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 完成问询，获取最终诊断
   */
  async completeInquiry(sessionId: string): Promise<CompleteInquiryResult> {
    this.logger.log(`完成问询：会话 ${sessionId}`);

    const session = sessions.get(sessionId);
    if (!session) {
      throw new Error('问询会话不存在');
    }

    try {
      // 生成最终诊断
      const result = await this.inquiryScheduler.generateFinalDiagnosis(session);

      // 更新会话
      session.finalDiagnosis = result.finalDiagnosis;
      session.status = 'completed';
      session.updatedAt = new Date();

      sessions.set(sessionId, session);

      this.logger.log(`最终诊断生成完成：${result.finalDiagnosis.syndrome}`);

      return result;
    } catch (error) {
      this.logger.error(`完成问询失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 获取问询状态
   */
  async getInquiryStatus(sessionId: string): Promise<InquiryStatusResult> {
    const session = sessions.get(sessionId);
    if (!session) {
      throw new Error('问询会话不存在');
    }

    return {
      sessionId: session.id,
      status: session.status,
      currentRound: session.currentRound,
      possibleDiseases: session.possibleDiseases,
      inquiryHistory: session.inquiryHistory
    };
  }

  /**
   * 删除问询会话
   */
  async deleteSession(sessionId: string): Promise<void> {
    const deleted = sessions.delete(sessionId);
    if (!deleted) {
      throw new Error('问询会话不存在');
    }
    this.logger.log(`问询会话已删除：${sessionId}`);
  }
}
