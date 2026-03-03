import { Injectable, BadRequestException } from '@nestjs/common';
import { SearchClient, Config } from 'coze-coding-dev-sdk';
import { LLMClient, Message } from 'coze-coding-dev-sdk';
import { createLLMClient } from '../utils/llm-helper';

/**
 * 联网搜索增强服务
 * 搜索最新医学知识、文献、临床研究，辅助诊断和治疗方案生成
 */
@Injectable()
export class WebSearchEnhancementService {
  private searchClient: SearchClient;
  private llmClient: LLMClient;

  constructor() {
    this.searchClient = new SearchClient(new Config());
    this.llmClient = createLLMClient();
  }

  /**
   * 搜索最新医学文献
   * @param query 搜索关键词
   * @param timeRange 时间范围（如 "1m" 1个月, "1w" 1周）
   * @returns 搜索结果
   */
  async searchMedicalLiterature(
    query: string,
    timeRange: string = '1m'
  ): Promise<{
    results: Array<{
      title: string;
      url: string;
      snippet: string;
      publishTime?: string;
      source: string;
    }>;
    summary: string;
    totalCount: number;
  }> {
    console.log('搜索医学文献:', { query, timeRange });

    try {
      // 使用 advancedSearch 进行时间范围过滤
      const response = await this.searchClient.advancedSearch(query, {
        searchType: 'web',
        count: 10,
        timeRange,
        needSummary: true,
      });

      console.log('搜索结果数量:', response.web_items?.length || 0);

      const results = (response.web_items || []).map((item) => ({
        title: item.title,
        url: item.url || '',
        snippet: item.snippet,
        publishTime: item.publish_time,
        source: item.site_name || '',
      }));

      return {
        results,
        summary: response.summary || '',
        totalCount: results.length,
      };
    } catch (error) {
      console.error('搜索医学文献失败:', error);
      throw new BadRequestException('搜索医学文献失败: ' + error.message);
    }
  }

  /**
   * 搜索方剂相关研究
   * @param formulaName 方剂名称
   * @returns 搜索结果
   */
  async searchFormulaResearch(
    formulaName: string
  ): Promise<{
    clinicalStudies: Array<{
      title: string;
      url: string;
      summary: string;
    }>;
    mechanisms: Array<{
      title: string;
      url: string;
      summary: string;
    }>;
    safetyData: Array<{
      title: string;
      url: string;
      summary: string;
    }>;
    overallSummary: string;
  }> {
    console.log('搜索方剂研究:', formulaName);

    try {
      // 搜索临床研究
      const clinicalQuery = `${formulaName} 临床研究 随机对照试验`;
      const clinicalResponse = await this.searchClient.webSearch(
        clinicalQuery,
        5,
        true,
      );

      // 搜索药理机制
      const mechanismQuery = `${formulaName} 药理机制 有效成分`;
      const mechanismResponse = await this.searchClient.webSearch(
        mechanismQuery,
        5,
        true,
      );

      // 搜索安全性数据
      const safetyQuery = `${formulaName} 不良反应 安全性 副作用`;
      const safetyResponse = await this.searchClient.webSearch(safetyQuery, 5, true);

      return {
        clinicalStudies: (clinicalResponse.web_items || []).map((item) => ({
          title: item.title,
          url: item.url || '',
          summary: item.snippet,
        })),
        mechanisms: (mechanismResponse.web_items || []).map((item) => ({
          title: item.title,
          url: item.url || '',
          summary: item.snippet,
        })),
        safetyData: (safetyResponse.web_items || []).map((item) => ({
          title: item.title,
          url: item.url || '',
          summary: item.snippet,
        })),
        overallSummary:
          clinicalResponse.summary || mechanismResponse.summary || '',
      };
    } catch (error) {
      console.error('搜索方剂研究失败:', error);
      throw new BadRequestException('搜索方剂研究失败: ' + error.message);
    }
  }

  /**
   * 搜索疾病最新进展
   * @param diseaseName 疾病名称
   * @returns 搜索结果
   */
  async searchDiseaseLatestProgress(
    diseaseName: string
  ): Promise<{
    latestResearch: Array<{
      title: string;
      url: string;
      summary: string;
      publishTime?: string;
    }>;
    treatmentGuidelines: Array<{
      title: string;
      url: string;
      summary: string;
    }>;
    expertOpinions: Array<{
      title: string;
      url: string;
      summary: string;
    }>;
    overallSummary: string;
  }> {
    console.log('搜索疾病最新进展:', diseaseName);

    try {
      // 搜索最新研究
      const researchQuery = `${diseaseName} 最新研究 突破 进展`;
      const researchResponse = await this.searchClient.advancedSearch(
        researchQuery,
        {
          searchType: 'web',
          count: 5,
          timeRange: '3m',
          needSummary: true,
        }
      );

      // 搜索诊疗指南
      const guidelineQuery = `${diseaseName} 诊疗指南 指南共识`;
      const guidelineResponse = await this.searchClient.webSearch(
        guidelineQuery,
        5,
        true
      );

      // 搜索专家观点
      const expertQuery = `${diseaseName} 专家观点 名医经验`;
      const expertResponse = await this.searchClient.webSearch(
        expertQuery,
        5,
        true
      );

      return {
        latestResearch: (researchResponse.web_items || []).map((item) => ({
          title: item.title,
          url: item.url || '',
          summary: item.snippet,
          publishTime: item.publish_time,
        })),
        treatmentGuidelines: (guidelineResponse.web_items || []).map(
          (item) => ({
            title: item.title,
            url: item.url || '',
            summary: item.snippet,
          })
        ),
        expertOpinions: (expertResponse.web_items || []).map((item) => ({
          title: item.title,
          url: item.url || '',
          summary: item.snippet,
        })),
        overallSummary: researchResponse.summary || guidelineResponse.summary || '',
      };
    } catch (error) {
      console.error('搜索疾病最新进展失败:', error);
      throw new BadRequestException('搜索疾病最新进展失败: ' + error.message);
    }
  }

  /**
   * 搜索药物相互作用
   * @param ingredients 药物列表
   * @returns 搜索结果
   */
  async searchDrugInteractions(
    ingredients: string[]
  ): Promise<{
    interactions: Array<{
      drugs: string[];
      description: string;
      severity: 'high' | 'medium' | 'low';
      reference: string;
    }>;
    summary: string;
  }> {
    console.log('搜索药物相互作用:', ingredients);

    if (ingredients.length < 2) {
      return {
        interactions: [],
        summary: '药物数量不足，无需检查相互作用',
      };
    }

    try {
      // 构建搜索查询
      const query = ingredients.join(' ') + ' 药物相互作用 禁忌配伍';
      const response = await this.searchClient.webSearch(query, 5, true);

      // 使用 LLM 提取结构化的相互作用信息
      const systemPrompt = `你是一个专业的中药学专家。请根据搜索结果，提取药物相互作用信息。

请以 JSON 格式返回，格式如下：
{
  "interactions": [
    {
      "drugs": ["药物1", "药物2"],
      "description": "相互作用描述",
      "severity": "high | medium | low",
      "reference": "参考文献或来源"
    }
  ],
  "summary": "总结"
}

严重程度分级：
- high：严重禁忌，不能同时使用
- medium：中等相互作用，需要调整剂量或注意
- low：轻微相互作用，影响较小`;

      let userPrompt = '搜索结果：\n';
      (response.web_items || []).forEach((item, index) => {
        userPrompt += `${index + 1}. ${item.title}\n`;
        userPrompt += `   ${item.snippet}\n\n`;
      });

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

      const llmResponse = await this.llmClient.invoke(messages, {
        temperature: 0.3,
      });

      console.log('药物相互作用提取原始响应:', llmResponse.content);

      // 解析 JSON 响应
      try {
        const jsonMatch = llmResponse.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          console.log('药物相互作用提取成功');
          return result;
        }
      } catch (e) {
        console.warn('解析 JSON 失败，返回空结果', e.message);
      }

      return {
        interactions: [],
        summary: '未发现明显的药物相互作用',
      };
    } catch (error) {
      console.error('搜索药物相互作用失败:', error);
      throw new BadRequestException('搜索药物相互作用失败: ' + error.message);
    }
  }

  /**
   * 综合搜索增强（用于诊断决策）
   * @param diagnosis 诊断信息
   * @param symptoms 症状列表
   * @returns 综合搜索结果
   */
  async comprehensiveSearchEnhancement(
    diagnosis: {
      diagnosis: string;
      differentiation: string;
    },
    symptoms: string[]
  ): Promise<{
    diagnosisEvidence: Array<{
      title: string;
      url: string;
      relevance: number;
    }>;
    treatmentOptions: Array<{
      title: string;
      url: string;
      summary: string;
    }>;
    latestResearch: Array<{
      title: string;
      url: string;
      publishTime?: string;
    }>;
    aiSummary: string;
  }> {
    console.log('综合搜索增强:', { diagnosis, symptoms });

    try {
      // 搜索诊断依据
      const diagnosisQuery = `${diagnosis.diagnosis} ${diagnosis.differentiation} 诊断依据 辨证要点`;
      const diagnosisResponse = await this.searchClient.webSearch(
        diagnosisQuery,
        5,
        true
      );

      // 搜索治疗方案
      const treatmentQuery = `${diagnosis.differentiation} 治疗方案 方剂 经验方`;
      const treatmentResponse = await this.searchClient.webSearch(
        treatmentQuery,
        5,
        true
      );

      // 搜索最新研究
      const researchQuery = `${diagnosis.diagnosis} 最新研究 中医临床研究`;
      const researchResponse = await this.searchClient.advancedSearch(
        researchQuery,
        {
          searchType: 'web',
          count: 5,
          timeRange: '6m',
          needSummary: true,
        }
      );

      // 使用 LLM 生成综合摘要
      const systemPrompt = `你是一个专业的中医循证医学专家。请根据搜索结果，为诊断提供循证医学支持。

请提供以下内容：
1. 诊断依据总结（支持当前诊断的证据）
2. 治疗方案建议（基于循证的治疗建议）
3. 最新研究进展（相关的最新研究）
4. 综合评估（诊断的可靠性、治疗的有效性等）

请以自然段落的形式输出，不要使用 JSON 格式。`;

      let userPrompt = `诊断：${diagnosis.diagnosis}\n`;
      userPrompt += `辨证分型：${diagnosis.differentiation}\n`;
      userPrompt += `症状：${symptoms.join('、')}\n\n`;

      userPrompt += '搜索结果：\n';
      userPrompt += '=== 诊断依据 ===\n';
      (diagnosisResponse.web_items || []).forEach((item) => {
        userPrompt += `- ${item.title}: ${item.snippet}\n`;
      });
      userPrompt += '\n=== 治疗方案 ===\n';
      (treatmentResponse.web_items || []).forEach((item) => {
        userPrompt += `- ${item.title}: ${item.snippet}\n`;
      });
      userPrompt += '\n=== 最新研究 ===\n';
      (researchResponse.web_items || []).forEach((item) => {
        userPrompt += `- ${item.title}: ${item.snippet}\n`;
      });

      userPrompt += '\n请提供综合评估。';

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

      const llmResponse = await this.llmClient.invoke(messages, {
        temperature: 0.6,
      });

      return {
        diagnosisEvidence: (diagnosisResponse.web_items || []).map((item) => ({
          title: item.title,
          url: item.url || '',
          relevance: item.rank_score || 0.5,
        })),
        treatmentOptions: (treatmentResponse.web_items || []).map((item) => ({
          title: item.title,
          url: item.url || '',
          summary: item.snippet,
        })),
        latestResearch: (researchResponse.web_items || []).map((item) => ({
          title: item.title,
          url: item.url || '',
          publishTime: item.publish_time,
        })),
        aiSummary: llmResponse.content,
      };
    } catch (error) {
      console.error('综合搜索增强失败:', error);
      throw new BadRequestException('综合搜索增强失败: ' + error.message);
    }
  }
}
