/**
 * 顶级经方大师 - 贝叶斯网络推理引擎
 * 基于概率论的动态辨证推理
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  BayesianNode,
  BayesianEdge,
  BayesianNetwork,
  SyndromeOntology,
  SymptomOntology,
  ConfidenceMetrics,
  EvidenceItem,
  RecommendationType,
} from './ontology-types';
import {
  SYNDROME_ONTOLOGIES,
  SYMPTOM_ONTOLOGIES,
} from './knowledge-graph';

@Injectable()
export class BayesianInferenceService {
  private readonly logger = new Logger(BayesianInferenceService.name);

  /**
   * 构建贝叶斯网络
   * 节点类型：症状节点、证候节点、方剂节点
   */
  buildBayesianNetwork(): BayesianNetwork {
    const nodes: BayesianNode[] = [];
    const edges: BayesianEdge[] = [];

    // 1. 创建证候节点（父节点）
    Object.entries(SYNDROME_ONTOLOGIES).forEach(([id, syndrome]) => {
      nodes.push({
        id,
        type: 'syndrome',
        name: syndrome.name,
        parents: [],
        children: syndrome.keySymptoms,
        priorProbability: 0.5, // 默认先验概率
      });
    });

    // 2. 创建症状节点（子节点）
    Object.entries(SYMPTOM_ONTOLOGIES).forEach(([symptomId, symptom]) => {
      // 找到关联的证候作为父节点
      const parentSyndromes = Object.entries(SYNDROME_ONTOLOGIES)
        .filter(([_, syndrome]) =>
          syndrome.keySymptoms.includes(symptom.name) ||
          syndrome.supportingSymptoms.includes(symptom.name)
        )
        .map(([id]) => id);

      nodes.push({
        id: symptomId,
        type: 'symptom',
        name: symptom.name,
        parents: parentSyndromes,
        children: [],
        conditionalProbabilities: this.calculateConditionalProbabilities(
          symptom,
          parentSyndromes
        ),
      });

      // 创建边
      parentSyndromes.forEach(parentId => {
        edges.push({
          from: parentId,
          to: symptomId,
          type: 'causal',
          weight: symptom.probability[
            this.findMeridianBySyndrome(parentId) || '太阳'
          ],
        });
      });
    });

    return {
      nodes,
      edges,
      inferenceEngine: 'bayesian',
    };
  }

  /**
   * 计算条件概率 P(症状 | 证候)
   * 使用症状在各六经中的出现概率
   */
  private calculateConditionalProbabilities(
    symptom: SymptomOntology,
    parentSyndromes: string[]
  ): Record<string, number> {
    const conditionalProbs: Record<string, number> = {};

    parentSyndromes.forEach(syndromeId => {
      const meridian = this.findMeridianBySyndrome(syndromeId);
      if (meridian) {
        conditionalProbs[syndromeId] = symptom.probability[meridian] || 0.5;
      } else {
        conditionalProbs[syndromeId] = 0.5;
      }
    });

    return conditionalProbs;
  }

  /**
   * 根据证候ID找到对应的六经
   */
  private findMeridianBySyndrome(syndromeId: string): string | null {
    const syndrome = SYNDROME_ONTOLOGIES[syndromeId];
    if (!syndrome) return null;

    if (typeof syndrome.meridian === 'string') {
      return syndrome.meridian;
    } else if (Array.isArray(syndrome.meridian)) {
      return syndrome.meridian[0]; // 对于合病，返回第一个六经
    }

    return null;
  }

  /**
   * 贝叶斯推理：更新证候后验概率
   * P(证候 | 症状) = P(症状 | 证候) * P(证候) / P(症状)
   */
  async updatePosteriorProbabilities(
    symptoms: EvidenceItem[],
    priorProbabilities: Record<string, number>
  ): Promise<Record<string, number>> {
    this.logger.log('开始贝叶斯推理...');

    const posteriorProbabilities: Record<string, number> = { ...priorProbabilities };

    // 对每个证候进行贝叶斯更新
    Object.entries(SYNDROME_ONTOLOGIES).forEach(([syndromeId, syndrome]) => {
      let likelihood = 1; // 似然度 P(症状 | 证候)
      let evidenceCount = 0;

      symptoms.forEach(evidence => {
        const symptom = Object.values(SYMPTOM_ONTOLOGIES).find(
          s => s.alias.includes(evidence.name) || s.name === evidence.name
        );

        if (symptom) {
          // P(症状 | 证候)
          const meridian = typeof syndrome.meridian === 'string'
            ? syndrome.meridian
            : (Array.isArray(syndrome.meridian) ? syndrome.meridian[0] : null);

          const conditionalProb = meridian
            ? symptom.probability[meridian] || 0.5
            : 0.5;

          // 如果该症状是主症，增加权重
          const isKeySymptom = syndrome.keySymptoms.includes(symptom.name);
          const weight = isKeySymptom ? 1.5 : 1.0;

          likelihood *= Math.pow(conditionalProb, weight * evidence.weight);
          evidenceCount++;
        }
      });

      // 应用贝叶斯公式
      const prior = priorProbabilities[syndromeId] || 0.1;
      const posterior = likelihood * prior;

      // 归一化（简化版）
      posteriorProbabilities[syndromeId] = Math.min(1, posterior);

      this.logger.log(
        `证候 ${syndrome.name}: 先验=${(prior * 100).toFixed(1)}%, ` +
        `似然度=${likelihood.toFixed(3)}, 后验=${(posterior * 100).toFixed(1)}%`
      );
    });

    return posteriorProbabilities;
  }

  /**
   * 计算置信度和不确定性
   */
  calculateConfidenceMetrics(
    posteriorProbabilities: Record<string, number>,
    symptoms: EvidenceItem[]
  ): ConfidenceMetrics {
    // 按概率排序
    const sorted = Object.entries(posteriorProbabilities)
      .sort((a, b) => b[1] - a[1]);

    const [topSyndromeId, topProbability] = sorted[0];
    const [secondSyndromeId, secondProbability] = sorted[1] || ['', 0];

    const topSyndrome = SYNDROME_ONTOLOGIES[topSyndromeId];

    // 计算不确定性
    // 不确定性 = 1 - (最高概率 - 第二高概率)
    const probabilityGap = topProbability - secondProbability;
    const uncertainty = 1 - probabilityGap;

    // 收集证据
    const evidence = symptoms.map(s => ({
      ...s,
      weight: this.calculateEvidenceWeight(s.name, topSyndromeId),
    }));

    // 生成替代证候列表
    const alternativeSyndromes = sorted.slice(1, 5).map(([id, prob]) => ({
      syndromeId: id,
      name: SYNDROME_ONTOLOGIES[id]?.name || id,
      confidence: prob,
      uncertainty: 1 - prob,
      evidence: symptoms.map(s => ({
        ...s,
        weight: this.calculateEvidenceWeight(s.name, id),
      })),
    }));

    // 判断推荐类型
    let recommendation: RecommendationType;
    if (topProbability >= 0.8) {
      recommendation = 'high_confidence';
    } else if (topProbability >= 0.6) {
      recommendation = 'moderate_confidence';
    } else if (topProbability < 0.4) {
      recommendation = 'insufficient_evidence';
    } else {
      recommendation = 'low_confidence';
    }

    // 检查矛盾证据
    const hasContradictoryEvidence = this.checkContradictoryEvidence(
      symptoms,
      topSyndromeId
    );
    if (hasContradictoryEvidence) {
      recommendation = 'contradictory';
    }

    return {
      primarySyndrome: {
        syndromeId: topSyndromeId,
        name: topSyndrome?.name || topSyndromeId,
        confidence: topProbability,
        uncertainty,
        evidence,
      },
      alternativeSyndromes,
      recommendation,
    };
  }

  /**
   * 计算证据权重
   * 主症权重更高，支持性症状权重较低
   */
  private calculateEvidenceWeight(
    symptomName: string,
    syndromeId: string
  ): number {
    const syndrome = SYNDROME_ONTOLOGIES[syndromeId];
    if (!syndrome) return 0.5;

    if (syndrome.keySymptoms.includes(symptomName)) {
      return 1.0; // 主症权重
    } else if (syndrome.supportingSymptoms.includes(symptomName)) {
      return 0.5; // 兼症权重
    } else {
      return 0.2; // 不相关症状
    }
  }

  /**
   * 检查矛盾证据
   * 例如：桂枝汤证（有汗）但用户说"无汗"
   */
  private checkContradictoryEvidence(
    symptoms: EvidenceItem[],
    syndromeId: string
  ): boolean {
    const syndrome = SYNDROME_ONTOLOGIES[syndromeId];
    if (!syndrome) return false;

    // 检查是否有矛盾症状
    const contradictoryPairs: Record<string, string[]> = {
      '桂枝汤': ['无汗', '脉浮紧'],
      '麻黄汤': ['汗出', '脉浮缓'],
      '大承气汤': ['下利', '腹泻'],
      '四逆汤': ['发热', '不恶寒'],
    };

    const requiredSymptoms = contradictoryPairs[syndrome.formula];
    if (!requiredSymptoms) return false;

    const userSymptoms = symptoms.map(s => s.name.toLowerCase());

    return requiredSymptoms.some(s =>
      userSymptoms.some(us => us.includes(s.toLowerCase()))
    );
  }

  /**
   * 生成鉴别性问题
   * 当两个证候概率接近时，主动问出鉴别点
   */
  generateDiscriminationQuestions(
    posteriorProbabilities: Record<string, number>,
    currentSymptoms: string[]
  ): string[] {
    const questions: string[] = [];

    // 找到概率最高的两个证候
    const sorted = Object.entries(posteriorProbabilities)
      .sort((a, b) => b[1] - a[1]);

    if (sorted.length < 2) return questions;

    const [firstId, firstProb] = sorted[0];
    const [secondId, secondProb] = sorted[1];

    // 如果两个证候概率接近（差距<20%），需要鉴别
    if (firstProb - secondProb < 0.2) {
      const firstSyndrome = SYNDROME_ONTOLOGIES[firstId];
      const secondSyndrome = SYNDROME_ONTOLOGIES[secondId];

      if (firstSyndrome && secondSyndrome) {
        // 找到鉴别点
        const discriminationPoints = firstSyndrome.differentiationPoints.filter(
          point => !currentSymptoms.some(s => s.includes(point))
        );

        if (discriminationPoints.length > 0) {
          questions.push(
            `为了进一步区分，请问您${discriminationPoints[0]}吗？`
          );
        }
      }
    }

    return questions;
  }

  /**
   * 预测疾病传变
   * 基于当前证候，预测可能的传变路径
   */
  predictTransmission(
    currentSyndromeId: string,
    userHistory?: string[]
  ): Array<{
    to: string;
    probability: number;
    triggers: string[];
  }> {
    const currentSyndrome = SYNDROME_ONTOLOGIES[currentSyndromeId];
    if (!currentSyndrome || !currentSyndrome.transmission) return [];

    const predictions = currentSyndrome.transmission.map(trans => ({
      to: trans.to,
      probability: trans.probability,
      triggers: trans.triggers,
    }));

    // 如果有用户病史，调整概率
    if (userHistory && userHistory.length > 0) {
      predictions.forEach(pred => {
        // 如果用户有误治史（如"服退烧药"），增加传变概率
        if (userHistory.some(h => h.includes('服') || h.includes('药'))) {
          pred.probability = Math.min(1, pred.probability * 1.3);
        }
      });
    }

    return predictions.sort((a, b) => b.probability - a.probability);
  }
}
