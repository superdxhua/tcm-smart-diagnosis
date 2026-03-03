import { Injectable } from '@nestjs/common';
import { createLLMClient } from '@/utils/llm-helper';
import { PossibleDisease, DiagnosisUpdateResult, InquiryQuestion } from './types';

@Injectable()
export class DiseaseEliminationEngine {
  private client: any;

  constructor() {
    this.client = createLLMClient();
  }

  /**
   * 根据用户的回答更新病症可能性
   *
   * @param question 上一个问题
   * @param answer 用户回答
   * @param possibleDiseases 当前可能的病症列表
   */
  async updateDiagnosis(
    question: string,
    answer: string,
    possibleDiseases: PossibleDisease[]
  ): Promise<DiagnosisUpdateResult> {
    const systemPrompt = `你是一位经验丰富的中医专家。根据用户的回答，更新各个病症的可能性。

你的任务是：
1. 分析用户的回答与每个病症的关联性
2. 根据诊断学原理，调整每个病症的可能性评分
3. 说明每个调整的理由
4. 识别被排除的病症（可能性 <10%）或确认的病症（可能性 >80%）

输出格式必须为JSON，包含以下字段：
{
  "updatedDiseases": [
    {
      "disease": "病症名称",
      "oldProbability": 旧的可能性,
      "newProbability": 新的可能性,
      "reason": "更新理由"
    }
  ],
  "eliminatedDiseases": ["被排除的病症名称"],
  "confirmedDisease": "确认的病症名称（如果有）"
}

更新原则：
- 回答支持某个病症的特征 → 提高该病症可能性
- 回答与某个病症矛盾 → 降低该病症可能性
- 回答不明确 → 保持或轻微调整
- 所有调整要有中医诊断学依据
- 概率调整要合理，避免极端跳跃`;

    const diseasesState = possibleDiseases.map(d => {
      return `${d.name}：${d.probability}%`;
    }).join('\n');

    const userPrompt = `问题：${question}
回答：${answer}

当前可能的病症：
${diseasesState}

请根据回答更新病症可能性。`;

    try {
      const response = await this.client.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        temperature: 0.5, // 降低温度，保证推理更准确
      });

      const result = this.parseAIResponse(response.content);

      // 验证数据完整性
      if (!result.updatedDiseases || result.updatedDiseases.length === 0) {
        throw new Error('诊断更新失败：未返回更新后的病症');
      }

      // 更新 possibleDiseases 中的概率
      const updatedDiseases = result.updatedDiseases.map(update => {
        const disease = possibleDiseases.find(d => d.name === update.disease);
        if (!disease) {
          throw new Error(`未找到病症：${update.disease}`);
        }
        return {
          ...disease,
          probability: update.newProbability
        };
      });

      console.log('=== 诊断更新完成 ===');
      console.log('更新的病症:', result.updatedDiseases.map(d => `${d.disease}：${d.oldProbability}% → ${d.newProbability}%`).join(', '));

      return {
        updatedDiseases: result.updatedDiseases,
        eliminatedDiseases: result.eliminatedDiseases || [],
        confirmedDisease: result.confirmedDisease
      };
    } catch (error) {
      console.error('诊断更新失败:', error);
      throw new Error(`诊断更新失败：${error.message}`);
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
