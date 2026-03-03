import { Injectable, BadRequestException } from '@nestjs/common';
import { LLMClient, Message } from 'coze-coding-dev-sdk';
import { createLLMClient } from '../utils/llm-helper';

/**
 * 自然语言生成服务
 * 使用 Qwen 大模型生成诊断解释、调护建议、用药指导等自然语言内容
 */
@Injectable()
export class NaturalLanguageGenerationService {
  private llmClient: LLMClient;

  constructor() {
    this.llmClient = createLLMClient();
  }

  /**
   * 生成诊断解释
   * @param diagnosis 诊断信息
   * @param symptoms 症状列表
   * @param formulaName 方剂名称
   * @returns 自然语言格式的诊断解释
   */
  async generateDiagnosisExplanation(
    diagnosis: {
      diagnosis: string;
      differentiation: string;
      treatmentPrinciple: string;
    },
    symptoms: string[],
    formulaName: string
  ): Promise<string> {
    console.log('生成诊断解释:', { diagnosis, symptoms, formulaName });

    try {
      const systemPrompt = `你是一个专业的中医诊疗助手。你的任务是为患者生成易于理解的诊断解释。

请遵循以下原则：
1. 使用通俗易懂的语言，避免过于专业的术语
2. 解释清楚病因病机，让患者理解为什么会得这个病
3. 说明辨证分型的依据
4. 解释治疗思路
5. 鼓励患者配合治疗

请以自然段落的形式输出，不要使用 JSON 格式。`;

      const userPrompt = `诊断：${diagnosis.diagnosis}
辨证分型：${diagnosis.differentiation}
治则：${diagnosis.treatmentPrinciple}
症状：${symptoms.join('、')}
处方：${formulaName}

请为患者生成详细的诊断解释。`;

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

      const response = await this.llmClient.invoke(messages, {
        temperature: 0.7,
      });

      console.log('诊断解释生成成功');
      return response.content;
    } catch (error) {
      console.error('生成诊断解释失败:', error);
      throw new BadRequestException('生成诊断解释失败: ' + error.message);
    }
  }

  /**
   * 生成调护建议
   * @param diagnosis 诊断信息
   * @param formulaName 方剂名称
   * @param lifestyleInfo 生活信息（可选）
   * @returns 自然语言格式的调护建议
   */
  async generateCareAdvice(
    diagnosis: {
      diagnosis: string;
      differentiation: string;
    },
    formulaName: string,
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
    console.log('生成调护建议:', { diagnosis, formulaName, lifestyleInfo });

    try {
      const systemPrompt = `你是一个专业的中医养生顾问。你的任务是为患者提供全面的调护建议。

请根据患者的诊断和体质特点，提供以下五个方面的建议：
1. 饮食调理建议（包括宜忌食物、饮食习惯）
2. 运动锻炼建议（包括适合的运动、注意事项）
3. 作息睡眠建议（包括睡眠时间、作息安排）
4. 情志调节建议（包括情绪管理、心理调适）
5. 综合调护建议（包括生活习惯、注意事项）

请以 JSON 格式返回，格式如下：
{
  "dietAdvice": "饮食调理建议",
  "exerciseAdvice": "运动锻炼建议",
  "sleepAdvice": "作息睡眠建议",
  "emotionAdvice": "情志调节建议",
  "generalAdvice": "综合调护建议"
}

每条建议要具体、实用、可操作。`;

      let userPrompt = `诊断：${diagnosis.diagnosis}\n`;
      userPrompt += `辨证分型：${diagnosis.differentiation}\n`;
      userPrompt += `处方：${formulaName}\n`;

      if (lifestyleInfo) {
        if (lifestyleInfo.diet) {
          userPrompt += `饮食情况：${lifestyleInfo.diet}\n`;
        }
        if (lifestyleInfo.exercise) {
          userPrompt += `运动情况：${lifestyleInfo.exercise}\n`;
        }
        if (lifestyleInfo.sleep) {
          userPrompt += `睡眠情况：${lifestyleInfo.sleep}\n`;
        }
        if (lifestyleInfo.emotion) {
          userPrompt += `情绪状况：${lifestyleInfo.emotion}\n`;
        }
      }

      userPrompt += '\n请提供调护建议。';

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

      const response = await this.llmClient.invoke(messages, {
        temperature: 0.7,
      });

      console.log('调护建议原始响应:', response.content);

      // 解析 JSON 响应
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          console.log('调护建议生成成功');
          return result;
        }
      } catch (e) {
        console.warn('解析 JSON 失败，返回默认建议', e.message);
      }

      // 默认建议
      return {
        dietAdvice: '建议饮食清淡，忌辛辣刺激性食物',
        exerciseAdvice: '适量运动，避免过度劳累',
        sleepAdvice: '保证充足睡眠，作息规律',
        emotionAdvice: '保持心情舒畅，避免过度焦虑',
        generalAdvice: '注意保暖，避免受凉',
      };
    } catch (error) {
      console.error('生成调护建议失败:', error);
      throw new BadRequestException('生成调护建议失败: ' + error.message);
    }
  }

  /**
   * 生成用药指导
   * @param prescription 处方信息
   * @param dosage 用法用量
   * @returns 自然语言格式的用药指导
   */
  async generateMedicationGuide(
    prescription: {
      formulaName: string;
      ingredients: Array<{ name: string; dosage: string; special?: string }>;
    },
    dosage: {
      decoctionMethod: string;
      dosageMethod: string;
      precautions: string;
    }
  ): Promise<{
    preparationGuide: string;
    dosageGuide: string;
    precautions: string;
    timeline: string;
  }> {
    console.log('生成用药指导:', { prescription, dosage });

    try {
      const systemPrompt = `你是一个专业的中医用药指导顾问。你的任务是为患者提供详细的用药指导。

请提供以下四个方面的指导：
1. 药物制备方法（包括浸泡、煎煮、过滤等步骤）
2. 用法用量指导（包括服用时间、剂量、频次）
3. 注意事项（包括禁忌、副作用、注意事项）
4. 用药时间安排（包括整个疗程的时间安排）

请以 JSON 格式返回，格式如下：
{
  "preparationGuide": "药物制备方法",
  "dosageGuide": "用法用量指导",
  "precautions": "注意事项",
  "timeline": "用药时间安排"
}

每条指导要详细、准确、易于理解。`;

      let userPrompt = `方剂：${prescription.formulaName}\n`;
      userPrompt += '药物组成：\n';

      prescription.ingredients.forEach((ing, index) => {
        userPrompt += `  ${index + 1}. ${ing.name} ${ing.dosage}`;
        if (ing.special) {
          userPrompt += `（${ing.special}）`;
        }
        userPrompt += '\n';
      });

      userPrompt += `\n煎服方法：${dosage.decoctionMethod}\n`;
      userPrompt += `服用方法：${dosage.dosageMethod}\n`;
      userPrompt += `注意事项：${dosage.precautions}\n`;

      userPrompt += '\n请提供详细的用药指导。';

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

      const response = await this.llmClient.invoke(messages, {
        temperature: 0.5,
      });

      console.log('用药指导原始响应:', response.content);

      // 解析 JSON 响应
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          console.log('用药指导生成成功');
          return result;
        }
      } catch (e) {
        console.warn('解析 JSON 失败，返回默认指导', e.message);
      }

      // 默认指导
      return {
        preparationGuide: '将药物加水浸泡30分钟，大火煮沸后小火煎煮20分钟，过滤取汁。',
        dosageGuide: '每日1剂，分2次服用，早晚各一次。',
        precautions: '服药期间忌辛辣刺激性食物，孕妇慎用。',
        timeline: '连续服用7天为一个疗程，根据病情调整。',
      };
    } catch (error) {
      console.error('生成用药指导失败:', error);
      throw new BadRequestException('生成用药指导失败: ' + error.message);
    }
  }

  /**
   * 生成症状改善预测
   * @param diagnosis 诊断信息
   * @param formulaName 方剂名称
   * @param days 预测天数
   * @returns 预测结果
   */
  async generateSymptomImprovementPrediction(
    diagnosis: {
      diagnosis: string;
      differentiation: string;
    },
    formulaName: string,
    days: number = 7
  ): Promise<{
    predictions: Array<{
      day: number;
      expectedImprovements: string[];
      milestones: string[];
    }>;
    overallPrognosis: string;
    redFlags: string[];
  }> {
    console.log('生成症状改善预测:', { diagnosis, formulaName, days });

    try {
      const systemPrompt = `你是一个专业的中医预后评估专家。你的任务是根据诊断和处方，预测患者的症状改善情况。

请提供以下内容：
1. 逐日/逐阶段的症状改善预测（包括预期改善的症状、重要里程碑）
2. 整体预后评估
3. 需要警惕的红灯信号（症状加重或出现新症状时需要立即就医的情况）

请以 JSON 格式返回，格式如下：
{
  "predictions": [
    {
      "day": 1,
      "expectedImprovements": ["预期改善的症状1", "预期改善的症状2"],
      "milestones": ["重要里程碑1"]
    }
  ],
  "overallPrognosis": "整体预后评估",
  "redFlags": ["红灯信号1", "红灯信号2"]
}

预测要科学、客观、不过度乐观。`;

      let userPrompt = `诊断：${diagnosis.diagnosis}\n`;
      userPrompt += `辨证分型：${diagnosis.differentiation}\n`;
      userPrompt += `处方：${formulaName}\n`;
      userPrompt += `预测天数：${days}天\n`;

      userPrompt += '\n请预测症状改善情况。';

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

      const response = await this.llmClient.invoke(messages, {
        temperature: 0.6,
      });

      console.log('症状改善预测原始响应:', response.content);

      // 解析 JSON 响应
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          console.log('症状改善预测生成成功');
          return result;
        }
      } catch (e) {
        console.warn('解析 JSON 失败，返回默认预测', e.message);
      }

      // 默认预测
      return {
        predictions: Array.from({ length: days }, (_, i) => ({
          day: i + 1,
          expectedImprovements: ['症状逐渐改善'],
          milestones: i === days - 1 ? ['症状明显改善'] : [],
        })),
        overallPrognosis: '预后良好，按时服药可望痊愈',
        redFlags: ['症状加重', '出现新症状', '高热不退'],
      };
    } catch (error) {
      console.error('生成症状改善预测失败:', error);
      throw new BadRequestException('生成症状改善预测失败: ' + error.message);
    }
  }
}
