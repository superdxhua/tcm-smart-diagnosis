import { Injectable, Logger } from '@nestjs/common';
import {
  DIAGNOSTIC_TREE_NODES,
  DiagnosticTreeNode,
  MERIDIAN_SYNDROMES,
  FORMULA_EVIDENCES,
  MeridianSyndrome,
  FormulaEvidence
} from './meridian-knowledge-base';

/**
 * 六经概率状态
 */
export interface MeridianProbabilities {
  [meridianName: string]: number;
}

/**
 * 方剂确认状态
 */
export interface FormulaConfirmations {
  [formulaName: string]: boolean;
}

/**
 * 辨证结果
 */
export interface DiagnosticResult {
  currentMeridianProbabilities: MeridianProbabilities;
  confirmedFormulas: FormulaConfirmations;
  currentNodeId: string;
  isComplete: boolean;
  diagnosticPath: string[];
}

/**
 * 动态辨证树引擎
 * 基于六经辨证逻辑，实现条件跳转、证候权重机制
 */
@Injectable()
export class DynamicDiagnosticTreeEngine {
  private logger = new Logger(DynamicDiagnosticTreeEngine.name);

  /**
   * 初始化辨证树
   */
  initializeDiagnosticTree(): DiagnosticResult {
    const initialProbabilities: MeridianProbabilities = {};
    MERIDIAN_SYNDROMES.forEach(meridian => {
      initialProbabilities[meridian.name] = 0;
    });

    const initialConfirmations: FormulaConfirmations = {};
    FORMULA_EVIDENCES.forEach(formula => {
      initialConfirmations[formula.formulaName] = false;
    });

    return {
      currentMeridianProbabilities: initialProbabilities,
      confirmedFormulas: initialConfirmations,
      currentNodeId: 'root',
      isComplete: false,
      diagnosticPath: ['root']
    };
  }

  /**
   * 根据用户回答，更新辨证状态
   *
   * @param currentNodeId 当前节点ID
   * @param answer 用户回答
   * @param currentProbabilities 当前六经概率
   * @param currentConfirmations 当前方剂确认状态
   */
  async processAnswer(
    currentNodeId: string,
    answer: string,
    currentProbabilities: MeridianProbabilities,
    currentConfirmations: FormulaConfirmations,
    diagnosticPath: string[]
  ): Promise<DiagnosticResult> {
    this.logger.log(`处理用户回答：节点 ${currentNodeId}，回答 "${answer}"`);

    // 获取当前节点
    const currentNode = DIAGNOSTIC_TREE_NODES.get(currentNodeId);
    if (!currentNode) {
      throw new Error(`未找到辨证树节点：${currentNodeId}`);
    }

    // 查找匹配的分支（改进的逻辑：优先检查肯定/否定词，避免症状关键词干扰）
    // 使用评分机制而非 find，确保最匹配的分支被选中
    const scoredBranches = currentNode.branches.map(branch => {
      let score = 0;

      if (typeof branch.answer === 'string') {
        // 字符串形式：简单包含匹配
        if (answer.includes(branch.answer)) {
          score = 100;
        }
      } else {
        // 数组形式：使用评分机制
        const affirmativeKeywords = ['是', '有', '对'];
        const negativeKeywords = ['否', '没有', '无', '不'];

        // 判断答案中的主要情感倾向
        const hasAffirmative = affirmativeKeywords.some(k => answer.includes(k));
        const hasNegative = negativeKeywords.some(k => answer.includes(k));

        // 分支中的关键词也分为肯定/否定
        const branchHasAffirmative = branch.answer.some(a => affirmativeKeywords.includes(a));
        const branchHasNegative = branch.answer.some(a => negativeKeywords.includes(a));

        // 情感倾向一致性评分（高优先级）
        if (hasNegative && branchHasNegative) {
          score += 100; // 否定词匹配优先级最高
        } else if (hasAffirmative && branchHasAffirmative) {
          score += 80;  // 肯定词匹配优先级次之
        }

        // 症状关键词匹配（低优先级，但多个关键词可以累积）
        const keywordMatches = branch.answer.filter(a => answer.includes(a)).length;
        score += keywordMatches * 10;

        // 惩罚情感倾向不一致
        if (hasNegative && branchHasAffirmative) {
          score -= 50; // 答案是否定，但分支是肯定，大幅降低评分
        }
        if (hasAffirmative && branchHasNegative) {
          score -= 50; // 答案是肯定，但分支是否定，大幅降低评分
        }
      }

      return { branch, score };
    });

    // 选择评分最高的分支
    scoredBranches.sort((a, b) => b.score - a.score);
    const matchedBranch = scoredBranches[0].score > 0 ? scoredBranches[0].branch : null;

    if (!matchedBranch) {
      throw new Error(`未找到匹配的分支：${answer}`);
    }

    // 更新六经概率
    const newProbabilities = { ...currentProbabilities };
    if (matchedBranch.meridianAdjustments) {
      matchedBranch.meridianAdjustments.forEach(adjustment => {
        const current = newProbabilities[adjustment.meridian] || 0;
        newProbabilities[adjustment.meridian] = Math.min(100, Math.max(0, current + adjustment.delta));
        this.logger.log(`六经概率调整：${adjustment.meridian} ${current}% → ${newProbabilities[adjustment.meridian]}%`);
      });
    }

    // 确认方剂
    const newConfirmations = { ...currentConfirmations };
    if (matchedBranch.formulaConfirmations) {
      matchedBranch.formulaConfirmations.forEach(confirmation => {
        if (confirmation.confirmed) {
          newConfirmations[confirmation.formula] = true;
          this.logger.log(`方剂确认：${confirmation.formula}`);
        }
      });
    }

    // 获取下一个节点ID
    const nextNodeId = matchedBranch.nextNodeId;

    // 判断是否完成
    const isComplete = nextNodeId === 'complete';

    // 更新辨证路径
    const newDiagnosticPath = [...diagnosticPath, currentNodeId];

    return {
      currentMeridianProbabilities: newProbabilities,
      confirmedFormulas: newConfirmations,
      currentNodeId: nextNodeId === 'complete' ? currentNodeId : nextNodeId,
      isComplete,
      diagnosticPath: newDiagnosticPath
    };
  }

  /**
   * 获取当前节点的问询问题
   */
  getCurrentQuestion(nodeId: string): string {
    const node = DIAGNOSTIC_TREE_NODES.get(nodeId);
    if (!node) {
      throw new Error(`未找到辨证树节点：${nodeId}`);
    }
    return node.question;
  }

  /**
   * 获取当前节点信息
   */
  getCurrentNode(nodeId: string): DiagnosticTreeNode | null {
    return DIAGNOSTIC_TREE_NODES.get(nodeId) || null;
  }

  /**
   * 模糊匹配分支
   */
  private fuzzyMatchBranch(
    branches: DiagnosticTreeNode['branches'],
    answer: string
  ): DiagnosticTreeNode['branches'][0] | null {
    const answerLower = answer.toLowerCase();

    // 尝试关键词匹配
    for (const branch of branches) {
      const answers = typeof branch.answer === 'string' ? [branch.answer] : branch.answer;
      for (const a of answers) {
        const aLower = a.toLowerCase();
        // 检查答案是否包含关键词
        if (answerLower.includes(aLower) || aLower.includes(answerLower)) {
          return branch;
        }
      }
    }

    // 如果没有匹配，返回第一个分支（降级策略）
    this.logger.warn(`模糊匹配失败，使用第一个分支`);
    return branches.length > 0 ? branches[0] : null;
  }

  /**
   * 计算最可能的六经病证
   */
  getMostLikelyMeridian(probabilities: MeridianProbabilities): {
    meridian: string;
    probability: number;
    details: MeridianSyndrome;
  } | null {
    let maxProb = 0;
    let maxMeridian: string | null = null;

    for (const [meridianName, prob] of Object.entries(probabilities)) {
      if (prob > maxProb) {
        maxProb = prob;
        maxMeridian = meridianName;
      }
    }

    if (!maxMeridian || maxProb < 30) {
      return null;
    }

    const details = MERIDIAN_SYNDROMES.find(m => m.name === maxMeridian);
    return {
      meridian: maxMeridian,
      probability: maxProb,
      details: details!
    };
  }

  /**
   * 获取确认的方剂列表
   */
  getConfirmedFormulas(confirmations: FormulaConfirmations): FormulaEvidence[] {
    const confirmedFormulas: FormulaEvidence[] = [];
    for (const [formulaName, confirmed] of Object.entries(confirmations)) {
      if (confirmed) {
        const formula = FORMULA_EVIDENCES.find(f => f.formulaName === formulaName);
        if (formula) {
          confirmedFormulas.push(formula);
        }
      }
    }
    return confirmedFormulas;
  }

  /**
   * 检查是否需要深度问询
   */
  needsDeepInquiry(probabilities: MeridianProbabilities): boolean {
    // 如果有两个或更多六经概率相近（差异 < 20%），需要深度问询
    const sortedProbs = Object.values(probabilities)
      .filter(p => p > 0)
      .sort((a, b) => b - a);

    if (sortedProbs.length < 2) {
      return false;
    }

    const diff = sortedProbs[0] - sortedProbs[1];
    return diff < 20 && sortedProbs[0] > 30;
  }

  /**
   * 获取下一个推荐问询节点（深度问询）
   */
  getNextDeepInquiryNode(probabilities: MeridianProbabilities): string | null {
    // 找出概率最高的两个六经
    const sortedMeridians = Object.entries(probabilities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    if (sortedMeridians.length < 2) {
      return null;
    }

    const [meridian1, meridian2] = sortedMeridians;

    // 根据六经组合，返回不同的鉴别节点
    const key = [meridian1[0], meridian2[0]].sort().join('-');

    const deepInquiryMap: Record<string, string> = {
      '太阳病-阳明病': 'fever_check',
      '太阳病-少阳病': 'other_symptoms',
      '太阳病-太阴病': 'taiyin_check',
      '太阳病-少阴病': 'shaoyin_check',
      '阳明病-少阳病': 'shaoyang_check',
      '阳明病-太阴病': 'yangming_check',
      '少阳病-太阴病': 'other_symptoms',
      '少阳病-少阴病': 'shaoyin_check',
      '太阴病-少阴病': 'shaoyin_check',
    };

    return deepInquiryMap[key] || null;
  }
}
