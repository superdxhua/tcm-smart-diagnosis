import { Injectable } from '@nestjs/common';
import { createLLMClient } from '@/utils/llm-helper';
import { PatientInfo, InitialDiagnosisResult, PossibleDisease, InquiryQuestion } from './types';

@Injectable()
export class InitialDiagnosisAnalyzer {
  private client: any;

  constructor() {
    this.client = createLLMClient();
  }

  /**
   * 根据用户输入进行初步诊断分析
   * @param patientInfo 患者基本信息
   * @param chiefComplaint 主诉
   * @param additionalInfo 补充信息
   */
  async analyze(
    patientInfo: PatientInfo,
    chiefComplaint: string,
    additionalInfo: string = ''
  ): Promise<InitialDiagnosisResult> {
    const systemPrompt = `你是一位经验丰富的中医专家。根据用户提供的主诉和基本信息，进行初步诊断分析。

你的任务是：
1. 列出3-5个可能的病症（证型）
2. 为每个病症设定可能性评分（0-100，总和不超过100）
3. 分析每个病症的关键特征
4. 设计针对这些病症的鉴别问题

输出格式必须为JSON，包含以下字段：
{
  "possibleDiseases": [
    {
      "name": "病症名称",
      "probability": 可能性评分,
      "keyFeatures": ["关键特征1", "关键特征2"],
      "differentialQuestions": ["鉴别问题1", "鉴别问题2"]
    }
  ],
  "nextInquiry": {
    "question": "最关键的鉴别问题",
    "targetDiseases": ["目标病症1", "目标病症2"],
    "diagnosticValue": "诊断价值说明"
  }
}

注意事项：
- 病症命名要准确（如：少阳头痛、风热感冒、脾胃虚弱证等）
- 可能性评分要合理（最可能的病症分数最高）
- 鉴别问题要有明确的诊断价值
- 问题要简洁明了，用户容易理解`;

    const userPrompt = `患者信息：
- 姓名：${patientInfo.name}
- 年龄：${patientInfo.age}岁
- 性别：${patientInfo.gender === 'male' ? '男' : patientInfo.gender === 'female' ? '女' : '其他'}
- 主诉：${chiefComplaint}
${additionalInfo ? `- 补充信息：${additionalInfo}` : ''}

请进行初步诊断分析。`;

    try {
      const response = await this.client.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        temperature: 0.7,
      });

      // 解析 AI 返回的 JSON
      const result = this.parseAIResponse(response.content);

      // 验证数据完整性
      if (!result.possibleDiseases || result.possibleDiseases.length === 0) {
        throw new Error('初步诊断分析失败：未返回可能的病症');
      }

      if (!result.nextInquiry || !result.nextInquiry.question) {
        throw new Error('初步诊断分析失败：未返回下一步问询建议');
      }

      console.log('=== 初步诊断分析完成 ===');
      console.log('可能的病症:', result.possibleDiseases.map(d => `${d.name}(${d.probability}%)`).join(', '));
      console.log('下一步问询:', result.nextInquiry.question);

      return result;
    } catch (error) {
      console.error('初步诊断分析失败:', error);
      throw new Error(`初步诊断分析失败：${error.message}`);
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
