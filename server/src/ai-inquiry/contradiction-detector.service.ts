import { Injectable, Logger } from '@nestjs/common';
import { CONTRADICTION_RULES, ContradictionRule } from './meridian-knowledge-base';

/**
 * 假象检测结果
 */
export interface ContradictionDetectionResult {
  hasContradiction: boolean;
  contradictions: {
    rule: ContradictionRule;
    matchedIndicators: string[];
    confidence: number;
  }[];
  followUpQuestions: string[];
  warningMessage?: string;
}

/**
 * 假象识别器
 * 检测矛盾症状，识别真寒假热、真热假寒、瘀血内阻等复杂证型
 */
@Injectable()
export class ContradictionDetector {
  private logger = new Logger(ContradictionDetector.name);

  /**
   * 检测症状中的矛盾点
   *
   * @param symptoms 用户提供的症状列表
   * @param answers 用户回答的历史记录
   */
  async detectContradictions(
    symptoms: string[],
    answers: string[] = []
  ): Promise<ContradictionDetectionResult> {
    this.logger.log('开始检测症状矛盾点');

    const contradictions: ContradictionDetectionResult['contradictions'] = [];
    const allText = [...symptoms, ...answers].join('，');

    // 检测每种假象规则
    for (const rule of CONTRADICTION_RULES) {
      const matchedIndicators = this.matchIndicators(rule.keyIndicators, allText);

      if (matchedIndicators.length >= 2) { // 至少匹配2个关键指征
        const confidence = matchedIndicators.length / rule.keyIndicators.length;
        contradictions.push({
          rule,
          matchedIndicators,
          confidence: Math.round(confidence * 100)
        });
      }
    }

    const hasContradiction = contradictions.length > 0;

    // 提取追问问题
    const followUpQuestions: string[] = [];
    contradictions.forEach(c => {
      c.rule.followUpQuestions.forEach(q => {
        if (!followUpQuestions.includes(q)) {
          followUpQuestions.push(q);
        }
      });
    });

    // 生成警告信息
    let warningMessage: string | undefined = undefined;
    if (hasContradiction && contradictions.length > 0) {
      const ruleNames = contradictions.map(c => c.rule.name).join('、');
      warningMessage = `检测到症状存在矛盾，可能是：${ruleNames}。请详细回答以下问题以确认：`;
    }

    this.logger.log(`矛盾检测完成：发现 ${contradictions.length} 个潜在假象`);

    return {
      hasContradiction,
      contradictions,
      followUpQuestions,
      warningMessage: hasContradiction ? warningMessage : undefined
    };
  }

  /**
   * 检测特定假象（针对单个规则）
   */
  async detectSpecificContradiction(
    ruleName: string,
    symptoms: string[],
    answers: string[] = []
  ): Promise<ContradictionDetectionResult> {
    const rule = CONTRADICTION_RULES.find(r => r.name === ruleName);
    if (!rule) {
      throw new Error(`未找到假象规则：${ruleName}`);
    }

    const allText = [...symptoms, ...answers].join('，');
    const matchedIndicators = this.matchIndicators(rule.keyIndicators, allText);

    const hasContradiction = matchedIndicators.length >= 2;

    return {
      hasContradiction,
      contradictions: hasContradiction ? [{
        rule,
        matchedIndicators,
        confidence: Math.round((matchedIndicators.length / rule.keyIndicators.length) * 100)
      }] : [],
      followUpQuestions: rule.followUpQuestions,
      warningMessage: hasContradiction ? `疑似${ruleName}：${rule.description}` : undefined
    };
  }

  /**
   * 检测阴盛格阳（真寒假热）
   */
  async detectYinShengGeYang(
    symptoms: string[],
    answers: string[] = []
  ): Promise<boolean> {
    const result = await this.detectSpecificContradiction('阴盛格阳（真寒假热）', symptoms, answers);
    return result.hasContradiction;
  }

  /**
   * 检测阳盛格阴（真热假寒）
   */
  async detectYangShengGeYin(
    symptoms: string[],
    answers: string[] = []
  ): Promise<boolean> {
    const result = await this.detectSpecificContradiction('阳盛格阴（真热假寒）', symptoms, answers);
    return result.hasContradiction;
  }

  /**
   * 匹配关键指征
   */
  private matchIndicators(indicators: string[], text: string): string[] {
    const matched: string[] = [];
    const textLower = text.toLowerCase();

    for (const indicator of indicators) {
      // 模糊匹配
      if (textLower.includes(indicator.toLowerCase())) {
        matched.push(indicator);
      }
    }

    return matched;
  }

  /**
   * 验证回答是否解决矛盾
   */
  async verifyContradictionResolution(
    ruleName: string,
    followUpAnswers: string[]
  ): Promise<{ resolved: boolean; explanation: string }> {
    const rule = CONTRADICTION_RULES.find(r => r.name === ruleName);
    if (!rule) {
      throw new Error(`未找到假象规则：${ruleName}`);
    }

    const allAnswers = followUpAnswers.join('，');
    const matchedIndicators = this.matchIndicators(rule.keyIndicators, allAnswers);
    const matchRatio = matchedIndicators.length / rule.keyIndicators.length;

    const resolved = matchRatio >= 0.7; // 匹配70%以上认为解决

    const explanation = resolved
      ? `回答确认了${rule.name}的真实病机`
      : `回答尚不足以确认${rule.name}，需要更多信息`;

    return { resolved, explanation };
  }

  /**
   * 获取假象描述（用于用户说明）
   */
  getContradictionDescription(ruleName: string): string | null {
    const rule = CONTRADICTION_RULES.find(r => r.name === ruleName);
    if (!rule) {
      return null;
    }

    return `${rule.name}\n${rule.description}\n\n真实病机：${rule.trueSyndrome}`;
  }

  /**
   * 智能追问生成（基于假象识别）
   */
  async generateFollowUpQuestions(
    symptoms: string[],
    answers: string[] = []
  ): Promise<string[]> {
    const result = await this.detectContradictions(symptoms, answers);

    if (!result.hasContradiction) {
      return [];
    }

    // 优先追问置信度最高的假象
    const sortedContradictions = result.contradictions
      .sort((a, b) => b.confidence - a.confidence);

    const topContradiction = sortedContradictions[0];
    const questions = topContradiction.rule.followUpQuestions;

    this.logger.log(`生成追问问题（${topContradiction.rule.name}）：${questions.length} 个`);

    return questions;
  }
}
