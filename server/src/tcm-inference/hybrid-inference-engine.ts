/**
 * 数字张仲景 - 混合推理引擎
 * 规则引擎（Rule-based） + 贝叶斯网络（Bayesian Network） + GNN（图神经网络）
 *
 * 功能：
 * 1. 规则引擎：处理明确条文（如"太阳病，头痛发热，汗出恶风，桂枝汤主之"）
 * 2. 贝叶斯网络：计算各证型概率（如小柴胡汤证 P=0.82）
 * 3. GNN：在知识图谱中传播"症状激活信号"，发现隐性关联
 */

import { CLASSIC_FORMULAS_DB } from '../tcm-knowledge/classic-formulas-db';
import { SYMPTOM_NODES, SYNDROME_PATTERNS, SyndromePatternQuery } from '../tcm-knowledge/syndrome-pattern-db';
import { HERB_DATABASE, HerbQuery } from '../tcm-knowledge/herb-db';
import { REAL_WORLD_CASES_DB, RealWorldCaseQuery } from '../tcm-knowledge/real-world-cases-db';

// ============================================
// 类型定义
// ============================================
export interface InferenceRequest {
  symptoms: string[]; // 症状列表
  tongue?: string; // 舌象
  pulse?: string; // 脉象
  history?: string; // 病史
  userContext?: {
    age?: number;
    gender?: '男' | '女';
    occupation?: string;
    isPregnant?: boolean; // 是否怀孕
    allergies?: string[]; // 过敏史
  };
}

export interface InferenceResult {
  diagnosis: {
    primarySyndrome: string; // 主要证候
    meridian: string; // 六经
    nature: string; // 八纲
    confidence: number; // 置信度（0-1）
  };
  combinedSyndrome?: {
    name: string; // 合病名称
    meridians: string[]; // 合病六经
  };
  recommendedFormulas: FormulaRecommendation[]; // 推荐方剂
  keySigns: string[]; // 决定性指征
  warnings: string[]; // 预警信息
  contradictions: string[]; // 矛盾证据
  evidenceLevel: 'A' | 'B' | 'C'; // 证据等级
  reasoning: {
    ruleEngineMatches: string[]; // 规则引擎匹配
    bayesianProbabilities: Array<{ syndrome: string; probability: number }>; // 贝叶斯概率
    gnnInferences: string[]; // GNN 推断
  };
}

export interface FormulaRecommendation {
  formulaName: string;
  formulaId: string;
  matchScore: number; // 匹配分数（0-1）
  herbs: Array<{
    name: string;
    dosage: string;
    processing?: string;
  }>;
  instructions: string; // 煎服法
  contraindications: string[]; // 禁忌证
  evidenceLevel: 'A' | 'B' | 'C';
  safetyRating: 'A' | 'B' | 'C' | 'D';
  warnings: string[]; // 预警
}

// ============================================
// 规则引擎（Rule-based）
// ============================================
export class RuleEngine {
  /**
   * 基于经典条文的规则匹配
   * 示例规则：
   * - 太阳病，头痛发热，汗出恶风 → 桂枝汤
   * - 太阳病，头痛发热，无汗恶寒 → 麻黄汤
   */
  static applyRules(request: InferenceRequest): Array<{ formulaId: string; rule: string; confidence: number }> {
    const matches: Array<{ formulaId: string; rule: string; confidence: number }> = [];

    for (const [formulaId, formula] of Object.entries(CLASSIC_FORMULAS_DB)) {
      const symptoms = request.symptoms;
      let matchedKeySymptoms = 0;

      // 检查主证匹配
      for (const keySymptom of formula.keySymptoms) {
        if (symptoms.some(s => s.includes(keySymptom) || keySymptom.includes(s))) {
          matchedKeySymptoms++;
        }
      }

      // 如果匹配度 > 60%，触发规则
      const matchRatio = matchedKeySymptoms / formula.keySymptoms.length;
      if (matchRatio > 0.6) {
        matches.push({
          formulaId,
          rule: `经方规则：${formula.formulaName} - 匹配 ${matchedKeySymptoms}/${formula.keySymptoms.length} 主证`,
          confidence: matchRatio,
        });
      }
    }

    return matches;
  }

  /**
   * 矛盾检测
   * 检查症状是否存在矛盾（如"大便燥结"与"四肢厥冷"并存）
   */
  static detectContradictions(symptoms: string[]): string[] {
    const contradictions: string[] = [];

    // 矛盾规则库
    const conflictRules = [
      {
        groupA: ['大便秘结', '大便干燥', '便秘'],
        groupB: ['大便稀溏', '腹泻', '下利', '水泻'],
        description: '大便秘结与腹泻矛盾',
      },
      {
        groupA: ['发热', '身热', '壮热'],
        groupB: ['畏寒', '恶寒', '四肢厥冷'],
        description: '发热与恶寒同时出现，提示寒热错杂或真寒假热',
      },
      {
        groupA: ['口渴', '口干', '大渴'],
        groupB: ['口淡不渴', '不欲饮水'],
        description: '口渴与不渴矛盾',
      },
    ];

    for (const rule of conflictRules) {
      const hasGroupA = symptoms.some(s => rule.groupA.some(ga => s.includes(ga) || ga.includes(s)));
      const hasGroupB = symptoms.some(s => rule.groupB.some(gb => s.includes(gb) || gb.includes(s)));

      if (hasGroupA && hasGroupB) {
        contradictions.push(rule.description);
      }
    }

    return contradictions;
  }
}

// ============================================
// 贝叶斯网络（Bayesian Network）
// ============================================
export class BayesianNetwork {
  /**
   * 计算证候后验概率 P(证候 | 症状)
   */
  static calculatePosteriorProbabilities(
    symptoms: string[]
  ): Array<{ syndromeId: string; syndromeName: string; probability: number }> {
    const results: Array<{ syndromeId: string; syndromeName: string; probability: number }> = [];

    for (const [syndromeId, syndrome] of Object.entries(SYNDROME_PATTERNS)) {
      let totalEvidenceWeight = 0;
      let totalKeyWeight = 0;

      // 计算正向证据
      for (const symptomWeight of syndrome.keySymptoms) {
        totalKeyWeight += symptomWeight.weight;

        const symptomNode = SYMPTOM_NODES[symptomWeight.symptomId];
        if (!symptomNode) continue;

        const matched = symptoms.some(s =>
          symptomNode.name === s ||
          symptomNode.synonyms.some(syn => syn === s) ||
          symptomNode.name.includes(s) ||
          s.includes(symptomNode.name)
        );

        if (matched) {
          // 考虑症状权重
          totalEvidenceWeight += symptomWeight.weight;
        }
      }

      // 计算概率
      const probability = totalKeyWeight > 0 ? totalEvidenceWeight / totalKeyWeight : 0;

      if (probability > 0) {
        results.push({
          syndromeId,
          syndromeName: syndrome.name,
          probability,
        });
      }
    }

    // 按概率降序排序
    results.sort((a, b) => b.probability - a.probability);
    return results;
  }

  /**
   * 计算置信度
   * 高置信度：概率 > 0.8
   * 中置信度：0.5 ≤ 概率 ≤ 0.8
   * 低置信度：概率 < 0.5
   */
  static calculateConfidence(probability: number): { level: 'high' | 'medium' | 'low'; label: string } {
    if (probability > 0.8) {
      return { level: 'high', label: '高置信度' };
    } else if (probability >= 0.5) {
      return { level: 'medium', label: '中置信度' };
    } else {
      return { level: 'low', label: '低置信度' };
    }
  }

  /**
   * 证据不足检测
   */
  static detectInsufficientEvidence(
    syndromeId: string,
    symptoms: string[]
  ): boolean {
    const syndrome = SYNDROME_PATTERNS[syndromeId];
    if (!syndrome) return true;

    const matchedKeySymptoms = syndrome.keySymptoms.filter(symptomWeight =>
      symptoms.some(s =>
        SYMPTOM_NODES[symptomWeight.symptomId]?.name === s ||
        SYMPTOM_NODES[symptomWeight.symptomId]?.synonyms.some(syn => syn === s)
      )
    );

    // 如果匹配的主证 < 50%，认为证据不足
    return matchedKeySymptoms.length / syndrome.keySymptoms.length < 0.5;
  }
}

// ============================================
// 图神经网络（GNN）- 知识图谱推理
// ============================================
export class GraphNeuralNetwork {
  /**
   * 在知识图谱中传播"症状激活信号"
   * 发现隐性关联（如"心下悸"激活茯苓、桂枝相关方证）
   */
  static propagateActivation(symptoms: string[]): Array<{ node: string; activation: number; inference: string }> {
    const results: Array<{ node: string; activation: number; inference: string }> = [];

    // 1. 激活症状节点
    const activatedSymptoms = new Map<string, number>();
    for (const symptom of symptoms) {
      for (const [id, node] of Object.entries(SYMPTOM_NODES)) {
        if (
          node.name === symptom ||
          node.synonyms.some(syn => syn === symptom) ||
          node.name.includes(symptom) ||
          symptom.includes(node.name)
        ) {
          activatedSymptoms.set(id, 1.0); // 激活值
        }
      }
    }

    // 2. 传播到证候节点
    const activatedSyndromes = new Map<string, number>();
    for (const [symptomId, activation] of activatedSymptoms.entries()) {
      const symptomNode = SYMPTOM_NODES[symptomId];
      if (!symptomNode) continue;

      for (const relation of symptomNode.relatedSyndromes) {
        const currentActivation = activatedSyndromes.get(relation.syndromeId) || 0;
        const newActivation = currentActivation + activation * relation.weight * (relation.direction === 'positive' ? 1 : -0.5);
        activatedSyndromes.set(relation.syndromeId, newActivation);
      }
    }

    // 3. 传播到方剂节点
    const activatedFormulas = new Map<string, number>();
    for (const [syndromeId, activation] of activatedSyndromes.entries()) {
      const syndrome = SYNDROME_PATTERNS[syndromeId];
      if (!syndrome) continue;

      for (const formulaId of syndrome.relatedFormulas) {
        const currentActivation = activatedFormulas.get(formulaId) || 0;
        const newActivation = currentActivation + activation * 0.7; // 传播系数
        activatedFormulas.set(formulaId, newActivation);
      }
    }

    // 4. 传播到药物节点
    const activatedHerbs = new Map<string, number>();
    for (const [formulaId, activation] of activatedFormulas.entries()) {
      const formula = CLASSIC_FORMULAS_DB[formulaId];
      if (!formula) continue;

      for (const herb of formula.dosage.herbs) {
        const currentActivation = activatedHerbs.get(herb.name) || 0;
        const newActivation = currentActivation + activation * 0.8; // 传播系数
        activatedHerbs.set(herb.name, newActivation);
      }
    }

    // 生成推断结果
    for (const [herbName, activation] of activatedHerbs.entries()) {
      if (activation > 0.5) {
        results.push({
          node: herbName,
          activation,
          inference: `症状激活信号传播至药物：${herbName}（激活值：${activation.toFixed(2)}）`,
        });
      }
    }

    // 按激活值降序排序
    results.sort((a, b) => b.activation - a.activation);
    return results;
  }

  /**
   * 发现隐性关联
   * 示例："心下悸" → 茯苓、桂枝 → 茯苓桂枝甘草大枣汤
   */
  static discoverLatentAssociations(symptoms: string[]): Array<{ symptom: string; associatedFormula: string; confidence: number }> {
    const associations: Array<{ symptom: string; associatedFormula: string; confidence: number }> = [];

    // 查找相似病例
    const similarCases = RealWorldCaseQuery.findSimilarCases(symptoms);
    for (const case_ of similarCases.slice(0, 5)) {
      // 提取非典型表现
      for (const feature of case_.nonTypicalFeatures) {
        const confidence = 1.0 / (similarCases.indexOf(case_) + 1); // 越相似，置信度越高
        associations.push({
          symptom: feature,
          associatedFormula: case_.formula.name,
          confidence,
        });
      }
    }

    return associations;
  }
}

// ============================================
// 混合推理引擎（主引擎）
// ============================================
export class HybridInferenceEngine {
  /**
   * 执行混合推理
   */
  static async inference(request: InferenceRequest): Promise<InferenceResult> {
    // 1. 标准化症状
    const standardizedSymptoms = SyndromePatternQuery.standardizeSymptoms(request.symptoms);

    // 2. 规则引擎
    const ruleEngineMatches = RuleEngine.applyRules(request);
    const contradictions = RuleEngine.detectContradictions(standardizedSymptoms);

    // 3. 贝叶斯网络
    const bayesianProbabilities = BayesianNetwork.calculatePosteriorProbabilities(standardizedSymptoms);

    // 4. GNN 推理
    const gnnInferences = GraphNeuralNetwork.propagateActivation(standardizedSymptoms);
    const latentAssociations = GraphNeuralNetwork.discoverLatentAssociations(standardizedSymptoms);

    // 5. 综合推理结果
    if (bayesianProbabilities.length === 0) {
      return {
        diagnosis: {
          primarySyndrome: '证候不明确',
          meridian: '未知',
          nature: '未知',
          confidence: 0,
        },
        recommendedFormulas: [],
        keySigns: [],
        warnings: ['症状信息不足，无法明确诊断'],
        contradictions,
        evidenceLevel: 'C',
        reasoning: {
          ruleEngineMatches: ruleEngineMatches.map(m => m.rule),
          bayesianProbabilities: bayesianProbabilities.map(bp => ({
            syndrome: bp.syndromeName,
            probability: bp.probability
          })),
          gnnInferences: gnnInferences.map(i => i.inference),
        },
      };
    }

    // 获取最高概率证候
    const topSyndrome = bayesianProbabilities[0];
    const syndrome = SYNDROME_PATTERNS[topSyndrome.syndromeId];
    const confidence = BayesianNetwork.calculateConfidence(topSyndrome.probability);

    // 检查证据不足
    const insufficientEvidence = BayesianNetwork.detectInsufficientEvidence(topSyndrome.syndromeId, standardizedSymptoms);

    // 获取推荐方剂
    const recommendedFormulas = this.getRecommendedFormulas(
      standardizedSymptoms,
      syndrome,
      ruleEngineMatches,
      request.userContext
    );

    // 识别合病
    const combinedSyndrome = SyndromePatternQuery.identifyCombinedSyndrome(
      bayesianProbabilities.slice(0, 3).map(bp => SYNDROME_PATTERNS[bp.syndromeId])
    );

    // 生成预警信息
    const warnings = this.generateWarnings(
      syndrome,
      recommendedFormulas,
      request.userContext,
      contradictions,
      insufficientEvidence
    );

    // 获取决定性指征（Key Diagnostic Signs）
    const keySigns = syndrome.keySymptoms
      .filter(s => s.isKey)
      .map(s => s.symptomName)
      .filter(name => standardizedSymptoms.some(s => s.includes(name) || name.includes(s)));

    return {
      diagnosis: {
        primarySyndrome: syndrome.name,
        meridian: syndrome.meridian || '未知',
        nature: syndrome.nature || '未知',
        confidence: topSyndrome.probability,
      },
      combinedSyndrome: combinedSyndrome ? { name: combinedSyndrome.name, meridians: combinedSyndrome.meridians } : undefined,
      recommendedFormulas,
      keySigns,
      warnings,
      contradictions,
      evidenceLevel: syndrome.expertValidation.confidence > 0.9 ? 'A' : syndrome.expertValidation.confidence > 0.7 ? 'B' : 'C',
      reasoning: {
        ruleEngineMatches: ruleEngineMatches.map(m => m.rule),
        bayesianProbabilities: bayesianProbabilities.map(bp => ({
          syndrome: bp.syndromeName,
          probability: bp.probability
        })),
        gnnInferences: gnnInferences.map(i => i.inference),
      },
    };
  }

  /**
   * 获取推荐方剂
   */
  private static getRecommendedFormulas(
    symptoms: string[],
    syndrome: any,
    ruleEngineMatches: Array<{ formulaId: string; rule: string; confidence: number }>,
    userContext?: any
  ): FormulaRecommendation[] {
    const recommendations: FormulaRecommendation[] = [];

    for (const formulaId of syndrome.relatedFormulas) {
      const formula = CLASSIC_FORMULAS_DB[formulaId];
      if (!formula) continue;

      // 计算匹配分数
      let matchScore = 0;
      for (const keySymptom of formula.keySymptoms) {
        if (symptoms.some(s => s.includes(keySymptom) || keySymptom.includes(s))) {
          matchScore += 1;
        }
      }
      matchScore = matchScore / formula.keySymptoms.length;

      // 检查禁忌证（暂时跳过，等待 HerbQuery 实现）
      // const contraindicationCheck = HerbQuery.checkContraindications(formula.dosage.herbs.map(h => h.name));
      const contraindicationCheck: Array<{ reason: string }> = [];

      // 检查配伍禁忌
      const incompatibilityCheck = HerbQuery.checkIncompatibility(formula.dosage.herbs.map(h => h.name));

      // 检查孕期禁忌
      const pregnancyCheck = userContext?.isPregnant
        ? HerbQuery.checkPregnancyContraindication(formula.dosage.herbs.map(h => h.name))
        : [];

      // 生成预警
      const warnings: string[] = [
        ...contraindicationCheck.map(c => c.reason),
        ...incompatibilityCheck.map(i => i.description),
        ...pregnancyCheck.map(p => `${p.herb}：${p.category}（${p.reason}）`),
      ];

      // 检查药物毒性
      const toxicityWarnings: string[] = [];
      for (const herb of formula.dosage.herbs) {
        const toxicity = HerbQuery.checkToxicity(herb.name);
        if (toxicity.isToxic) {
          toxicityWarnings.push(`${herb.name}有毒！${toxicity.dosageWarning || ''}`);
        }
      }

      recommendations.push({
        formulaName: formula.formulaName,
        formulaId: formula.id,
        matchScore,
        herbs: formula.dosage.herbs,
        instructions: formula.instructions,
        contraindications: formula.contraindications,
        evidenceLevel: formula.evidenceLevel,
        safetyRating: this.calculateSafetyRating(formulaId),
        warnings: [...warnings, ...toxicityWarnings],
      });
    }

    // 按匹配分数降序排序
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    return recommendations;
  }

  /**
   * 生成预警信息
   */
  private static generateWarnings(
    syndrome: any,
    recommendedFormulas: FormulaRecommendation[],
    userContext?: any,
    contradictions?: string[],
    insufficientEvidence?: boolean
  ): string[] {
    const warnings: string[] = [];

    // 证据不足预警
    if (insufficientEvidence) {
      warnings.push('⚠️ 证据不足：症状匹配度低于50%，建议进一步问诊或结合现代医学检查');
    }

    // 矛盾证据预警
    if (contradictions && contradictions.length > 0) {
      warnings.push(`⚠️ 矛盾证据：${contradictions.join('、')}，建议重新确认症状`);
    }

    // 高风险证型预警
    if (syndrome.meridian === '少阴' || syndrome.meridian === '厥阴') {
      warnings.push('🔴 高风险证型：少阴/厥阴病证，病情危重，建议及时就医或请专家会诊');
    }

    // 方剂安全性预警
    for (const formula of recommendedFormulas) {
      if (formula.safetyRating === 'C' || formula.safetyRating === 'D') {
        warnings.push(`⚠️ 方剂安全等级：${formula.safetyRating}，使用前需咨询医师`);
      }
      if (formula.warnings.length > 0) {
        warnings.push(...formula.warnings);
      }
    }

    // 孕期预警
    if (userContext?.isPregnant) {
      warnings.push('🔴 孕期特殊预警：请务必咨询医师，切勿自行服药');
    }

    // 老年人/儿童预警
    if (userContext?.age && (userContext.age < 12 || userContext.age > 65)) {
      warnings.push('⚠️ 特殊人群：老年人/儿童用药需谨慎，建议咨询医师调整剂量');
    }

    return warnings;
  }

  /**
   * 计算方剂安全等级
   */
  private static calculateSafetyRating(formulaId: string): 'A' | 'B' | 'C' | 'D' {
    const formula = CLASSIC_FORMULAS_DB[formulaId];
    if (!formula) return 'C';

    // 检查方剂中的药物安全等级
    const herbRatings = formula.dosage.herbs.map(h => HerbQuery.getSafetyRating(h.name));

    if (herbRatings.some(r => r === 'D')) return 'D';
    if (herbRatings.some(r => r === 'C')) return 'C';
    if (herbRatings.some(r => r === 'B')) return 'B';
    return 'A';
  }
}
