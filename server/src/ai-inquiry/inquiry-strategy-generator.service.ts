import { Injectable } from '@nestjs/common';
import { createLLMClient } from '@/utils/llm-helper';
import { PossibleDisease, InquiryQuestion, InquiryHistoryItem } from './types';

@Injectable()
export class InquiryStrategyGenerator {
  private client: any;

  constructor() {
    this.client = createLLMClient();
  }

  /**
   * 生成个性化问询策略
   * 根据当前可能的病症列表和问询历史，动态生成下一个最优问题
   *
   * @param possibleDiseases 当前可能的病症列表
   * @param inquiryHistory 问询历史
   */
  async generateStrategy(
    possibleDiseases: PossibleDisease[],
    inquiryHistory: InquiryHistoryItem[]
  ): Promise<InquiryQuestion> {
    // 过滤掉可能性 < 10% 的病症
    const activeDiseases = possibleDiseases.filter(d => d.probability >= 10);

    if (activeDiseases.length === 0) {
      throw new Error('没有足够可能的病症进行进一步问询');
    }

    // 如果只剩下一个高概率病症（>80%），不需要继续问询
    if (activeDiseases.length === 1 && activeDiseases[0].probability > 80) {
      throw new Error(`已确认诊断：${activeDiseases[0].name}（${activeDiseases[0].probability}%），无需继续问询`);
    }

    const systemPrompt = `你是一位经验丰富的中医专家。根据当前的病症可能性和问询历史，生成最优的下一个问询问题。

你的任务是：
1. 分析当前可能的病症列表，找到最需要鉴别的病症对
2. 设计一个能够明确区分这些病症的问题
3. 确保问题简洁、准确、易于理解
4. 避免重复问询历史中已经问过的问题

输出格式必须为JSON，包含以下字段：
{
  "question": "问询问题",
  "targetDiseases": [
    {
      "disease": "目标病症名称",
      "action": "confirm|eliminate"  // 该问题对该病症的作用
    }
  ],
  "diagnosticValue": "诊断价值说明",
  "priority": 优先级（0-100，数值越大越重要）
}

问询策略原则：
- 优先询问能够排除高概率病症的问题
- 如果两个病症可能性相近，优先询问能区分它们的问题
- 问题的诊断价值要明确，能够显著改变病症概率
- 避免模棱两可的问题`;

    // 构建问询历史摘要
    const historySummary = inquiryHistory.map((item, index) => {
      return `第${index + 1}轮：问"${item.question.substring(0, 30)}..."，答"${item.answer.substring(0, 30)}..."`;
    }).join('\n');

    // 构建当前病症状态
    const diseasesState = activeDiseases.map(d => {
      return `- ${d.name}：${d.probability}%`;
    }).join('\n');

    const userPrompt = `当前可能的病症：
${diseasesState}

问询历史：
${historySummary || '暂无'}

请生成下一个最优的问询问题。`;

    try {
      const response = await this.client.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        temperature: 0.7,
      });

      const result = this.parseAIResponse(response.content);

      // 验证数据完整性
      if (!result.question) {
        throw new Error('问询策略生成失败：未返回问题');
      }

      console.log('=== 生成问询策略 ===');
      console.log('问题:', result.question);
      console.log('目标病症:', result.targetDiseases.map(d => `${d.disease}(${d.action})`).join(', '));

      return result;
    } catch (error) {
      console.error('问询策略生成失败:', error);
      throw new Error(`问询策略生成失败：${error.message}`);
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
