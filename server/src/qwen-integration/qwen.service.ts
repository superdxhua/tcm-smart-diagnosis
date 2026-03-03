/**
 * 数字张仲景 - Qwen 集成服务
 */

import { Injectable } from '@nestjs/common';
import { HybridInferenceEngine } from '../tcm-inference/hybrid-inference-engine';
import { FiveDimensionalOutputService } from '../tcm-output/five-dimensional-output-service';
import { DualChannelOutputService, DualChannelOutput } from './dual-channel-output';
import { StructuredInterviewAgent, InterviewResponse } from './structured-interview-agent';
import { SafetyGuardrails, SafetyCheck } from './safety-guardrails';

// ============================================
// 类型定义
// ============================================
export interface ChatResponse {
  conversationId: string;
  patientChannel: any;
  systemChannel: any;
  safetyCheck: {
    inputSafety: SafetyCheck;
    outputSafety: SafetyCheck;
    knowledgeAnchoring: SafetyCheck;
    overallPassed: boolean;
    overallRiskLevel: '低' | '中' | '高' | '极高';
  };
}

export interface Conversation {
  id: string;
  userId?: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  symptoms: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Qwen 集成服务
// ============================================
@Injectable()
export class QwenIntegrationService {
  // 对话存储（生产环境应使用 Redis/数据库）
  private conversations: Map<string, Conversation> = new Map();

  /**
   * Qwen 多轮对话
   */
  async chat(message: string, conversationId?: string): Promise<ChatResponse> {
    console.log('[Qwen Service] 开始对话:', { message, conversationId });

    // 1. 输入安全检查
    const inputSafetyCheck = await this.performInputSafetyCheck(message);
    if (!inputSafetyCheck.passed) {
      throw new Error(`输入安全检查失败: ${inputSafetyCheck.violations.map(v => v.message).join('; ')}`);
    }

    // 2. 获取或创建对话
    let conversation = conversationId
      ? this.conversations.get(conversationId)
      : null;

    if (!conversation) {
      conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      conversation = {
        id: conversationId,
        userId: undefined,
        messages: [],
        symptoms: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.conversations.set(conversationId, conversation);
    }

    // 3. 提取症状（使用 Qwen）
    const symptoms = await this.extractSymptoms(message, conversation.messages);
    conversation.symptoms = [...conversation.symptoms, ...symptoms];

    // 4. 添加用户消息到对话历史
    conversation.messages.push({ role: 'user', content: message });
    conversation.updatedAt = new Date();

    // 5. 调用混合推理引擎
    const inferenceResult = await HybridInferenceEngine.inference({
      symptoms: conversation.symptoms,
      patientProfile: {
        age: 35, // 默认值，实际应从数据库获取
        gender: '男',
        isPregnant: false,
      },
      userDemographics: {},
    });

    // 6. 生成五维输出
    const fiveDimensionalOutput = FiveDimensionalOutputService.generateOutput(inferenceResult);

    // 7. 生成双通道输出
    const dualChannelOutput = await DualChannelOutputService.generateDualChannelOutput(
      inferenceResult,
      fiveDimensionalOutput
    );

    // 8. 输出安全检查
    const outputSafetyCheck = await SafetyGuardrails.performTripleSafetyCheck(
      message,
      dualChannelOutput.systemChannel
    );

    if (!outputSafetyCheck.overallPassed) {
      throw new Error(`输出安全检查失败: ${outputSafetyCheck.inputSafety.violations.map(v => v.message).join('; ')}`);
    }

    // 9. 添加助手响应到对话历史
    conversation.messages.push({
      role: 'assistant',
      content: dualChannelOutput.patientChannel.diagnosis.description,
    });

    // 10. 返回结果
    return {
      conversationId,
      patientChannel: dualChannelOutput.patientChannel,
      systemChannel: dualChannelOutput.systemChannel,
      safetyCheck: outputSafetyCheck,
    };
  }

  /**
   * 开始结构化问诊
   */
  async startStructuredInterview(userId: string): Promise<InterviewResponse> {
    console.log('[Qwen Service] 开始结构化问诊:', { userId });

    return await StructuredInterviewAgent.startInterview(userId);
  }

  /**
   * 继续结构化问诊
   */
  async continueStructuredInterview(
    sessionId: string,
    answer: string,
    questionId: string
  ): Promise<InterviewResponse> {
    console.log('[Qwen Service] 继续结构化问诊:', { sessionId, answer, questionId });

    return await StructuredInterviewAgent.continueInterview(sessionId, answer, questionId);
  }

  /**
   * 生成诊断和治疗方案
   */
  async generateDiagnosis(sessionId: string): Promise<DualChannelOutput> {
    console.log('[Qwen Service] 生成诊断:', { sessionId });

    // TODO: 从会话中收集的症状生成诊断
    // 暂时返回模拟数据
    const symptoms = ['发热', '恶寒', '无汗', '头痛'];

    const inferenceResult = await HybridInferenceEngine.inference({
      symptoms,
      userContext: {
        age: 35,
        gender: '男',
        isPregnant: false,
      },
    });

    const fiveDimensionalOutput = FiveDimensionalOutputService.generateOutput(inferenceResult);

    const dualChannelOutput = await DualChannelOutputService.generateDualChannelOutput(
      inferenceResult,
      fiveDimensionalOutput
    );

    return dualChannelOutput;
  }

  /**
   * 执行安全检查
   */
  async performSafetyCheck(input: string, output: any): Promise<{
    inputSafety: SafetyCheck;
    outputSafety: SafetyCheck;
    knowledgeAnchoring: SafetyCheck;
    overallPassed: boolean;
    overallRiskLevel: '低' | '中' | '高' | '极高';
  }> {
    return await SafetyGuardrails.performTripleSafetyCheck(input, output);
  }

  /**
   * 输入安全检查
   */
  private async performInputSafetyCheck(input: string): Promise<SafetyCheck> {
    const { InputFilter } = await import('./safety-guardrails');
    return await InputFilter.checkInputSafety(input);
  }

  /**
   * 提取症状（使用 Qwen）
   */
  private async extractSymptoms(
    message: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string[]> {
    // 使用 Qwen 提取症状
    const prompt = `你是一位中医医师，请从患者描述中提取症状关键词。

患者描述：${message}

请返回症状列表（JSON 格式）：
{
  "symptoms": ["症状1", "症状2", "症状3"]
}

注意：
1. 只提取症状关键词，不要包含病因、病史、情绪等
2. 使用中医术语，如"发热"、"汗出"、"恶寒"等
3. 不要编造不存在的症状
4. 如果患者描述中没有症状，返回空数组`;

    // 这里应该调用 Qwen API，暂时返回模拟结果
    const symptomsMap: Record<string, string[]> = {
      '我今天发烧了，身体发冷，不出汗': ['发热', '恶寒', '无汗'],
      '嘴里发苦，嗓子干，不想吃东西': ['口苦', '咽干', '不欲饮食'],
      '胸口胀满，想吐，心里烦躁': ['胸胁胀满', '心烦喜呕'],
      '拉肚子，大便里有未消化的食物': ['下利清谷'],
      '脉搏很细，总想睡觉，精神不好': ['脉微细', '但欲寐'],
    };

    for (const [pattern, symptoms] of Object.entries(symptomsMap)) {
      if (message.includes(pattern)) {
        return symptoms;
      }
    }

    return [];
  }
}
