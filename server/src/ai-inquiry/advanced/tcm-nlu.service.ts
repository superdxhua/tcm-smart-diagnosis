/**
 * 顶级经方大师 - 中医 NLU（自然语言理解）模块
 * 症状术语标准化 + 语义理解
 */

import { Injectable, Logger } from '@nestjs/common';
import { SymptomOntology } from './ontology-types';
import { SYMPTOM_ONTOLOGIES } from './knowledge-graph';

export interface NLUResult {
  standardized: string; // 标准化术语
  confidence: number; // 标准化置信度
  category: '主症' | '兼症' | '舌象' | '脉象';
  original: string; // 原始输入
  alias: string[]; // 匹配的别名
}

export interface NLUExtraction {
  symptoms: NLUResult[];
  duration?: string;
  severity?: '轻' | '中' | '重';
  triggers?: string[]; // 触发因素（如误治）
  history?: string[]; // 病史
}

@Injectable()
export class TCMNLUService {
  private readonly logger = new Logger(TCMNLUService.name);

  /**
   * 主诉语义理解
   * 将用户的自然语言输入转换为结构化的症状数据
   */
  async parseUserInput(input: string): Promise<NLUExtraction> {
    this.logger.log(`解析用户输入: "${input}"`);

    const result: NLUExtraction = {
      symptoms: [],
    };

    // 1. 提取症状
    result.symptoms = await this.extractSymptoms(input);

    // 2. 提取病程
    result.duration = this.extractDuration(input);

    // 3. 提取严重程度
    result.severity = this.extractSeverity(input);

    // 4. 提取触发因素（如误治）
    result.triggers = this.extractTriggers(input);

    // 5. 提取病史
    result.history = this.extractHistory(input);

    this.logger.log(`解析结果: ${JSON.stringify(result, null, 2)}`);

    return result;
  }

  /**
   * 提取症状并标准化
   * 支持：同义词映射、部分匹配、语义推断
   */
  private async extractSymptoms(input: string): Promise<NLUResult[]> {
    const results: NLUResult[] = [];
    const sentences = this.splitIntoSentences(input);

    for (const sentence of sentences) {
      // 尝试精确匹配
      let matched = this.exactMatch(sentence);
      if (matched) {
        results.push(matched);
        continue;
      }

      // 尝试同义词匹配
      matched = this.aliasMatch(sentence);
      if (matched) {
        results.push(matched);
        continue;
      }

      // 尝试部分匹配
      matched = this.partialMatch(sentence);
      if (matched) {
        results.push(matched);
        continue;
      }

      // 尝试语义推断
      const inferred = await this.semanticInference(sentence);
      if (inferred) {
        results.push(inferred);
      }
    }

    // 去重
    const uniqueResults = this.deduplicateSymptoms(results);

    return uniqueResults;
  }

  /**
   * 精确匹配
   */
  private exactMatch(input: string): NLUResult | null {
    const symptom = Object.values(SYMPTOM_ONTOLOGIES).find(
      s => s.name === input.trim()
    );

    if (symptom) {
      return {
        standardized: symptom.name,
        confidence: 1.0,
        category: symptom.category,
        original: input,
        alias: [],
      };
    }

    return null;
  }

  /**
   * 同义词匹配
   */
  private aliasMatch(input: string): NLUResult | null {
    const symptom = Object.values(SYMPTOM_ONTOLOGIES).find(
      s => s.alias.some(a => input.includes(a))
    );

    if (symptom) {
      const matchedAlias = symptom.alias.find(a => input.includes(a));
      return {
        standardized: symptom.name,
        confidence: 0.9,
        category: symptom.category,
        original: input,
        alias: [matchedAlias!],
      };
    }

    return null;
  }

  /**
   * 部分匹配
   * 支持"发热三天" -> "发热"
   */
  private partialMatch(input: string): NLUResult | null {
    // 移除常见的修饰词
    const cleaned = input
      .replace(/(已经|有点|很|非常|特别|比较)\s*/g, '')
      .trim();

    const symptom = Object.values(SYMPTOM_ONTOLOGIES).find(
      s => cleaned.includes(s.name) || s.name.includes(cleaned)
    );

    if (symptom) {
      return {
        standardized: symptom.name,
        confidence: 0.8,
        category: symptom.category,
        original: input,
        alias: [],
      };
    }

    return null;
  }

  /**
   * 语义推断（需要 LLM）
   * 如"拉肚子像水一样" -> "下利清谷"
   */
  private async semanticInference(input: string): Promise<NLUResult | null> {
    // 简化版：使用规则映射
    const semanticRules: Record<string, { standardized: string; confidence: number }> = {
      '拉肚子': { standardized: '下利清谷', confidence: 0.7 },
      '拉稀': { standardized: '下利清谷', confidence: 0.7 },
      '腹泻': { standardized: '下利清谷', confidence: 0.7 },
      '大便稀': { standardized: '下利清谷', confidence: 0.7 },
      '肚子咕噜响': { standardized: '肠鸣', confidence: 0.6 },
      '一阵冷一阵热': { standardized: '往来寒热', confidence: 0.8 },
      '寒热交替': { standardized: '往来寒热', confidence: 0.8 },
      '怕风吹就冷': { standardized: '恶风', confidence: 0.7 },
      '风吹就冷': { standardized: '恶风', confidence: 0.7 },
      '便秘': { standardized: '大便秘结', confidence: 0.8 },
      '拉不出': { standardized: '大便秘结', confidence: 0.7 },
      '排便困难': { standardized: '大便秘结', confidence: 0.7 },
      '肚子胀': { standardized: '腹胀满痛', confidence: 0.6 },
      '腹胀': { standardized: '腹胀满痛', confidence: 0.6 },
      '想睡觉': { standardized: '但欲寐', confidence: 0.7 },
      '精神萎靡': { standardized: '但欲寐', confidence: 0.6 },
      '嗜睡': { standardized: '但欲寐', confidence: 0.7 },
      '脉搏微弱': { standardized: '脉微细', confidence: 0.7 },
      '脉弱': { standardized: '脉微细', confidence: 0.6 },
      '浑身酸痛': { standardized: '身痛', confidence: 0.7 },
      '全身疼痛': { standardized: '身痛', confidence: 0.7 },
      '骨节疼痛': { standardized: '身痛', confidence: 0.7 },
    };

    for (const [pattern, result] of Object.entries(semanticRules)) {
      if (input.includes(pattern)) {
        return {
          standardized: result.standardized,
          confidence: result.confidence,
          category: '主症',
          original: input,
          alias: [pattern],
        };
      }
    }

    return null;
  }

  /**
   * 提取病程
   * 如"发烧三天" -> "三天"
   */
  private extractDuration(input: string): string | undefined {
    const durationPatterns = [
      /(\d+)天/,
      /(\d+)日/,
      /(\d+)小时/,
      /今天/,
      /昨天/,
      /前天/,
      /刚才/,
      /最近/,
      /有一段时间/,
    ];

    for (const pattern of durationPatterns) {
      const match = input.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return undefined;
  }

  /**
   * 提取严重程度
   * 如"非常痛" -> "重"
   */
  private extractSeverity(input: string): '轻' | '中' | '重' | undefined {
    const severityPatterns: Record<string, '轻' | '中' | '重'> = {
      很重: '重',
      非常: '重',
      特别: '重',
      严重: '重',
      剧烈: '重',
      很: '中',
      比较重: '中',
      稍微: '轻',
      有点: '轻',
      轻微: '轻',
      一点: '轻',
    };

    for (const [pattern, severity] of Object.entries(severityPatterns)) {
      if (input.includes(pattern)) {
        return severity;
      }
    }

    return undefined;
  }

  /**
   * 提取触发因素（如误治）
   * 如"服了退烧药后" -> "服退烧药"
   */
  private extractTriggers(input: string): string[] {
    const triggers: string[] = [];

    const triggerPatterns = [
      /服了?(.*)药/,
      /吃(?:了|过)(.*)药/,
      /打(?:了|过)针/,
      /挂(?:了|过)点滴/,
      /误治/,
      /误汗/,
      /误下/,
    ];

    for (const pattern of triggerPatterns) {
      const match = input.match(pattern);
      if (match) {
        triggers.push(match[0]);
      }
    }

    return triggers;
  }

  /**
   * 提取病史
   * 如"以前有过" -> "有既往史"
   */
  private extractHistory(input: string): string[] {
    const history: string[] = [];

    const historyPatterns = [
      /以前/,
      /曾经/,
      /之前/,
      /以往/,
      /既往/,
      /老毛病/,
    ];

    for (const pattern of historyPatterns) {
      if (pattern.test(input)) {
        history.push(input.match(pattern)![0]);
      }
    }

    return history;
  }

  /**
   * 将输入分割成句子
   */
  private splitIntoSentences(input: string): string[] {
    // 按标点符号分割
    const sentences = input.split(/[，。！？、；：,;?!]/).filter(s => s.trim());

    // 按空格分割
    const words = input.split(/\s+/).filter(s => s.trim());

    // 合并
    const all = [...sentences, ...words];

    // 去重
    return Array.from(new Set(all));
  }

  /**
   * 去重症状
   * 保留置信度最高的
   */
  private deduplicateSymptoms(symptoms: NLUResult[]): NLUResult[] {
    const map = new Map<string, NLUResult>();

    symptoms.forEach(s => {
      const existing = map.get(s.standardized);
      if (!existing || s.confidence > existing.confidence) {
        map.set(s.standardized, s);
      }
    });

    return Array.from(map.values());
  }

  /**
   * 生成标准化建议
   * 当置信度<0.8时，提示用户确认
   */
  generateClarificationQuestion(symptom: NLUResult): string | null {
    if (symptom.confidence >= 0.8) return null;

    const clarifications: Record<string, string> = {
      下利清谷: '您说的"拉肚子"是指大便清稀如水，伴有未消化的食物吗？',
      腹胀满痛: '您说的"肚子胀"是指腹部胀满伴有疼痛吗？',
      恶风: '您说的"怕风吹"是指遇到风就感到寒冷吗？',
      但欲寐: '您说的"想睡觉"是指精神萎靡、总是想睡觉吗？',
    };

    return clarifications[symptom.standardized] || null;
  }
}
