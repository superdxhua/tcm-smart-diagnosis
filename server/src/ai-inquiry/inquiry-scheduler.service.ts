import { Injectable, Logger } from '@nestjs/common';
import { createLLMClient } from '@/utils/llm-helper';
import { InquirySession, PossibleDisease, CompleteInquiryResult } from './types';

@Injectable()
export class InquiryScheduler {
  private client: any;
  private logger = new Logger(InquiryScheduler.name);

  constructor() {
    this.client = createLLMClient();
  }

  /**
   * 判断是否应该继续问询
   */
  shouldContinueInquiry(possibleDiseases: PossibleDisease[], currentRound: number): boolean {
    // 最多问询 10 轮
    if (currentRound >= 10) {
      this.logger.warn(`已达到最大问询轮次（${currentRound}轮）`);
      return false;
    }

    // 过滤掉可能性 < 10% 的病症
    const activeDiseases = possibleDiseases.filter(d => d.probability >= 10);

    // 如果没有可能的病症，停止问询
    if (activeDiseases.length === 0) {
      this.logger.warn('没有足够可能的病症，停止问询');
      return false;
    }

    // 如果只剩下一个高概率病症（>80%），停止问询
    if (activeDiseases.length === 1 && activeDiseases[0].probability > 80) {
      this.logger.log(`已确认诊断：${activeDiseases[0].name}（${activeDiseases[0].probability}%）`);
      return false;
    }

    // 如果只剩 1-2 个病症且概率差异不大（<20%），可以停止问询
    if (activeDiseases.length <= 2) {
      const sortedDiseases = [...activeDiseases].sort((a, b) => b.probability - a.probability);
      const probabilityDiff = sortedDiseases[0].probability - sortedDiseases[sortedDiseases.length - 1].probability;
      if (probabilityDiff < 20 && currentRound >= 5) {
        this.logger.log(`病症概率差异较小（${probabilityDiff}%），停止问询`);
        return false;
      }
    }

    return true;
  }

  /**
   * 生成最终诊断和处方建议
   */
  async generateFinalDiagnosis(session: InquirySession): Promise<CompleteInquiryResult> {
    const systemPrompt = `你是一位经验丰富的中医专家。根据问询过程和最终可能的病症，生成最终诊断和处方建议。

你的任务是：
1. 综合分析所有问询信息，确定最终诊断（证型）
2. 说明诊断依据
3. 提供治疗建议
4. 如有必要，提供处方建议

输出格式必须为JSON，包含以下字段：
{
  "finalDiagnosis": {
    "syndrome": "证型名称",
    "probability": 诊断可能性（0-100）,
    "reasoning": "诊断依据（简明扼要）",
    "recommendation": "治疗建议（简明扼要）"
  },
  "prescriptionRecommendation": {
    "formula": "方剂名称（如果需要）",
    "herbs": ["药材1", "药材2"],
    "dosage": "用量说明",
    "instructions": "服用说明"
  }
}

注意事项：
- 诊断要准确，符合中医辨证论治原则
- 处方要合理，药材配伍要恰当
- 用量要安全，避免使用剧毒药材
- 处方可选，如果没有明确的处方需求，可以不提供`;

    // 构建问询过程摘要
    const inquirySummary = session.inquiryHistory.map((item, index) => {
      return `第${index + 1}轮：问"${item.question}"，答"${item.answer}"`;
    }).join('\n');

    // 构建最终病症状态
    const diseasesState = session.possibleDiseases
      .filter(d => d.probability >= 10)
      .map(d => {
        return `${d.name}：${d.probability}%`;
      }).join('\n');

    const userPrompt = `患者信息：
- 姓名：${session.patientInfo.name}
- 年龄：${session.patientInfo.age}岁
- 性别：${session.patientInfo.gender === 'male' ? '男' : session.patientInfo.gender === 'female' ? '女' : '其他'}
- 主诉：${session.chiefComplaint}
${session.additionalInfo ? `- 补充信息：${session.additionalInfo}` : ''}

问询过程：
${inquirySummary}

最终可能的病症：
${diseasesState}

请生成最终诊断和治疗建议。`;

    try {
      const response = await this.client.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        temperature: 0.6,
      });

      const result = this.parseAIResponse(response.content);

      // 验证数据完整性
      if (!result.finalDiagnosis) {
        throw new Error('最终诊断生成失败：未返回诊断结果');
      }

      console.log('=== 最终诊断生成完成 ===');
      console.log('证型:', result.finalDiagnosis.syndrome);
      console.log('可能性:', result.finalDiagnosis.probability + '%');
      console.log('诊断依据:', result.finalDiagnosis.reasoning);
      console.log('治疗建议:', result.finalDiagnosis.recommendation);
      if (result.prescriptionRecommendation) {
        console.log('处方:', result.prescriptionRecommendation.formula);
      }

      return result;
    } catch (error) {
      console.error('最终诊断生成失败:', error);
      throw new Error(`最终诊断生成失败：${error.message}`);
    }
  }

  /**
   * 解析 AI 返回的 JSON
   */
  private parseAIResponse(content: string): any {
    try {
      // 尝试直接解析 JSON
      return JSON.parse(content);
    } catch (error) {
      // 如果直接解析失败，尝试提取 JSON 代码块
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // 如果还是失败，尝试提取大括号内容
      const braceMatch = content.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        return JSON.parse(braceMatch[0]);
      }

      throw new Error('无法解析 AI 返回的 JSON');
    }
  }
}
