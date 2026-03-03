import { Injectable, BadRequestException } from '@nestjs/common';
import { LLMClient, Message } from 'coze-coding-dev-sdk';
import { createLLMClient } from '../utils/llm-helper';

/**
 * 症状提取服务
 * 使用 Qwen 大模型从用户自然语言输入中提取结构化症状
 */
@Injectable()
export class SymptomExtractionService {
  private llmClient: LLMClient;

  constructor() {
    this.llmClient = createLLMClient();
  }

  /**
   * 从用户输入中提取症状
   * @param userInput 用户自然语言输入（如"我最近发热、头痛、无汗"）
   * @param context 上下文信息（可选，如之前的症状、诊断结果）
   * @returns 提取的结构化症状信息
   */
  async extractSymptoms(
    userInput: string,
    context?: {
      previousSymptoms?: string[];
      currentDiagnosis?: string;
      sessionContext?: string;
    }
  ): Promise<{
    symptoms: string[];
    extractedText: string;
    confidence: number;
    missedSymptoms?: string[];
    suggestedQuestions?: string[];
  }> {
    console.log('开始症状提取:', { userInput, context });

    try {
      // 构建系统提示词
      const systemPrompt = `你是一个专业的中医症状提取助手。你的任务是从用户的自然语言描述中提取出所有相关的中医症状信息。

请遵循以下规则：
1. 提取用户提到的所有症状，包括身体感觉、疼痛部位、功能异常等
2. 识别症状的属性（如疼痛性质、持续时间、诱发因素等）
3. 识别相关的阴性症状（如用户明确表示"无汗"、"口不渴"等）
4. 忽略非症状信息（如情绪表达、时间描述等）
5. 识别可能与诊断相关的关键信息（如诱因、加重因素等）

请以 JSON 格式返回，格式如下：
{
  "symptoms": ["症状1", "症状2", "症状3"],
  "extractedText": "从用户输入中提取的关键文本",
  "confidence": 0.95,
  "missedSymptoms": ["需要进一步询问的症状1", "需要进一步询问的症状2"],
  "suggestedQuestions": ["问题1", "问题2", "问题3"]
}

其中：
- symptoms：提取到的症状列表
- extractedText：从用户输入中提取的与症状相关的关键文本片段
- confidence：症状提取的置信度（0-1）
- missedSymptoms：基于当前症状判断，可能遗漏的症状（用于进一步问询）
- suggestedQuestions：建议继续询问的问题（基于症状不完整的情况）`;

      // 构建用户提示词
      let userPrompt = `用户输入：${userInput}`;

      if (context) {
        if (context.previousSymptoms && context.previousSymptoms.length > 0) {
          userPrompt += `\n\n已记录的症状：${context.previousSymptoms.join('、')}`;
        }
        if (context.currentDiagnosis) {
          userPrompt += `\n\n当前诊断：${context.currentDiagnosis}`;
        }
        if (context.sessionContext) {
          userPrompt += `\n\n会话上下文：${context.sessionContext}`;
        }
      }

      userPrompt += '\n\n请提取症状并提供建议。';

      const messages: Message[] = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ];

      // 调用 Qwen 大模型
      const response = await this.llmClient.invoke(messages, {
        // 千问大模型（通过 SDK 配置）
        temperature: 0.3, // 降低温度以提高准确性
      });

      console.log('症状提取原始响应:', response.content);

      // 解析 JSON 响应
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);

          console.log('症状提取成功:', {
            symptoms: result.symptoms,
            confidence: result.confidence,
            suggestedQuestions: result.suggestedQuestions,
          });

          return result;
        }
      } catch (e) {
        console.warn('解析 JSON 失败，尝试手动提取', e.message);
      }

      // 如果 JSON 解析失败，使用简单提取逻辑
      const symptoms = this.simpleExtractSymptoms(userInput);

      return {
        symptoms,
        extractedText: userInput,
        confidence: 0.7,
        missedSymptoms: [],
        suggestedQuestions: ['请详细描述症状的具体情况', '症状持续了多长时间？'],
      };
    } catch (error) {
      console.error('症状提取失败:', error);
      throw new BadRequestException('症状提取失败: ' + error.message);
    }
  }

  /**
   * 简单的症状提取逻辑（备用方案）
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
      '恶风', '恶寒', '恶热', '寒热往来', '五心烦热', '盗汗', '自汗',
    ];

    // 检查输入中是否包含这些关键词
    for (const keyword of symptomKeywords) {
      if (input.includes(keyword)) {
        symptoms.push(keyword);
      }
    }

    return symptoms;
  }

  /**
   * 生成下一个问询问题
   * @param currentSymptoms 当前已收集的症状
   * @param confidence 当前置信度
   * @param context 会话上下文
   * @returns 下一个问询问题
   */
  async generateNextQuestion(
    currentSymptoms: string[],
    confidence: number,
    context?: {
      diagnosis?: string;
      previousQuestions?: string[];
    }
  ): Promise<{
    question: string;
    questionType: 'symptom' | 'confirmation' | 'differentiation' | 'finish';
    priority: number;
  }> {
    console.log('生成下一个问询问题:', { currentSymptoms, confidence, context });

    try {
      // 如果置信度足够高，可以询问确认性问题
      if (confidence >= 0.85) {
        return {
          question: '根据您的症状描述，我的诊断是：' + (context?.diagnosis || '太阳病证型') + '。请问您还有其他不适吗？',
          questionType: 'confirmation',
          priority: 10,
        };
      }

      // 构建系统提示词
      const systemPrompt = `你是一个专业的中医问诊助手。你的任务是根据当前的症状信息，生成下一个合适的问询问题。

请遵循以下规则：
1. 选择最能帮助确诊的问题（优先问询关键症状）
2. 避免重复询问已确认的症状
3. 问题要简洁明了，易于用户理解
4. 根据置信度调整问题类型：
   - 低置信度（<0.7）：问询关键症状（symptom）
   - 中置信度（0.7-0.85）：问询鉴别性症状（differentiation）
   - 高置信度（>=0.85）：确认性问询（confirmation）
5. 优先级：
   - 10：必须询问
   - 5：建议询问
   - 1：可选询问

请以 JSON 格式返回，格式如下：
{
  "question": "问题内容",
  "questionType": "symptom | confirmation | differentiation | finish",
  "priority": 10
}`;

      // 构建用户提示词
      let userPrompt = `当前症状：${currentSymptoms.join('、')}\n`;
      userPrompt += `当前置信度：${confidence}\n`;

      if (context) {
        if (context.diagnosis) {
          userPrompt += `当前诊断：${context.diagnosis}\n`;
        }
        if (context.previousQuestions && context.previousQuestions.length > 0) {
          userPrompt += `已询问的问题：${context.previousQuestions.join('; ')}\n`;
        }
      }

      userPrompt += '\n请生成下一个问询问题。';

      const messages: Message[] = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ];

      // 调用 Qwen 大模型
      const response = await this.llmClient.invoke(messages, {
        temperature: 0.5,
      });

      console.log('生成问题原始响应:', response.content);

      // 解析 JSON 响应
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return result;
        }
      } catch (e) {
        console.warn('解析 JSON 失败，使用默认问题', e.message);
      }

      // 默认问题
      return {
        question: '请问您还有其他不适吗？',
        questionType: 'symptom',
        priority: 5,
      };
    } catch (error) {
      console.error('生成问询问题失败:', error);
      throw new BadRequestException('生成问询问题失败: ' + error.message);
    }
  }
}
