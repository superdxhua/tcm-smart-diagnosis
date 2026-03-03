/**
 * 顶级经方大师 - 合病/并病/坏病复杂推理引擎
 * 支持多经辨证、疾病传变预测
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  SyndromeOntology,
  EightGuides,
  SyndromeTransmission,
} from './ontology-types';
import {
  SYNDROME_ONTOLOGIES,
  SYMPTOM_ONTOLOGIES,
  KnowledgeGraphQuery,
} from './knowledge-graph';

export interface InferenceResult {
  syndromeId: string;
  name: string;
  type: '单经证' | '合病' | '并病' | '坏病';
  meridians: string[];
  confidence: number;
  evidence: string[];
  formula: string;
  alternativeFormulas: string[];
  mechanism: string;
  transmissionPrediction?: TransmissionPrediction[];
}

export interface TransmissionPrediction {
  to: string;
  toName: string;
  probability: number;
  triggers: string[];
  warningLevel: 'low' | 'medium' | 'high';
  recommendation: string;
}

@Injectable()
export class ComplexInferenceService {
  private readonly logger = new Logger(ComplexInferenceService.name);

  /**
   * 复杂推理：支持合病/并病/坏病
   * 1. 识别是否为合病（多经同时发病）
   * 2. 识别是否为并病（病邪传变）
   * 3. 识别是否为坏病（误治变证）
   */
  async inferComplexSyndrome(
    symptoms: string[],
    userHistory?: string[]
  ): Promise<InferenceResult> {
    this.logger.log(`开始复杂推理，症状: ${symptoms.join(', ')}`);

    // 1. 首先尝试合病推理（多经同时发病）
    const combinedSyndrome = await this.inferCombinedSyndrome(symptoms, userHistory);
    if (combinedSyndrome) {
      this.logger.log(`识别为合病: ${combinedSyndrome.name}`);
      return combinedSyndrome;
    }

    // 2. 尝试并病推理（病邪传变）
    const progressiveSyndrome = await this.inferProgressiveSyndrome(
      symptoms,
      userHistory
    );
    if (progressiveSyndrome) {
      this.logger.log(`识别为并病: ${progressiveSyndrome.name}`);
      return progressiveSyndrome;
    }

    // 3. 尝试坏病推理（误治变证）
    const mistreatmentSyndrome = await this.inferMistreatmentSyndrome(
      symptoms,
      userHistory
    );
    if (mistreatmentSyndrome) {
      this.logger.log(`识别为坏病: ${mistreatmentSyndrome.name}`);
      return mistreatmentSyndrome;
    }

    // 4. 默认：单经辨证
    return this.inferSingleMeridianSyndrome(symptoms);
  }

  /**
   * 合病推理（多经同时发病）
   * 如：太阳阳明合病、太阳少阳合病
   */
  private async inferCombinedSyndrome(
    symptoms: string[],
    userHistory?: string[]
  ): Promise<InferenceResult | null> {
    // 获取所有合病类型
    const combinedSyndromes = KnowledgeGraphQuery.findCombinedSyndromes('合病');

    // 对每个合病类型，计算匹配度
    const scored = combinedSyndromes.map(syndrome => {
      let score = 0;
      const evidence: string[] = [];

      // 检查主症匹配
      syndrome.keySymptoms.forEach(symptom => {
        if (symptoms.some(s => this.matchSymptom(s, symptom))) {
          score += 2;
          evidence.push(symptom);
        }
      });

      // 检查兼症匹配
      syndrome.supportingSymptoms.forEach(symptom => {
        if (symptoms.some(s => this.matchSymptom(s, symptom))) {
          score += 1;
          evidence.push(symptom);
        }
      });

      return { syndrome, score, evidence };
    });

    // 选择得分最高的
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];

    // 如果得分足够高，识别为合病
    if (best && best.score >= 4) {
      return {
        syndromeId: best.syndrome.id,
        name: best.syndrome.name,
        type: '合病',
        meridians: Array.isArray(best.syndrome.meridian)
          ? best.syndrome.meridian
          : [best.syndrome.meridian],
        confidence: Math.min(1, best.score / 8),
        evidence: best.evidence,
        formula: best.syndrome.formula,
        alternativeFormulas: best.syndrome.alternativeFormulas,
        mechanism: best.syndrome.mechanism,
        transmissionPrediction: this.predictTransmission(
          best.syndrome,
          symptoms,
          userHistory
        ),
      };
    }

    return null;
  }

  /**
   * 并病推理（病邪传变）
   * 如：太阳并病少阴（太阳表证未解，少阴阳虚已现）
   */
  private async inferProgressiveSyndrome(
    symptoms: string[],
    userHistory?: string[]
  ): Promise<InferenceResult | null> {
    // 获取所有并病类型
    const progressiveSyndromes =
      KnowledgeGraphQuery.findCombinedSyndromes('并病');

    // 对每个并病类型，计算匹配度
    const scored = progressiveSyndromes.map(syndrome => {
      let score = 0;
      const evidence: string[] = [];

      // 检查主症匹配
      syndrome.keySymptoms.forEach(symptom => {
        if (symptoms.some(s => this.matchSymptom(s, symptom))) {
          score += 2;
          evidence.push(symptom);
        }
      });

      // 检查兼症匹配
      syndrome.supportingSymptoms.forEach(symptom => {
        if (symptoms.some(s => this.matchSymptom(s, symptom))) {
          score += 1;
          evidence.push(symptom);
        }
      });

      // 检查是否有传变特征（如"发热+但欲寐"）
      if (this.checkTransmissionFeatures(symptoms, syndrome)) {
        score += 3;
        evidence.push('符合传变特征');
      }

      return { syndrome, score, evidence };
    });

    // 选择得分最高的
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];

    // 如果得分足够高，识别为并病
    if (best && best.score >= 5) {
      return {
        syndromeId: best.syndrome.id,
        name: best.syndrome.name,
        type: '并病',
        meridians: Array.isArray(best.syndrome.meridian)
          ? best.syndrome.meridian
          : [best.syndrome.meridian],
        confidence: Math.min(1, best.score / 10),
        evidence: best.evidence,
        formula: best.syndrome.formula,
        alternativeFormulas: best.syndrome.alternativeFormulas,
        mechanism: best.syndrome.mechanism,
        transmissionPrediction: this.predictTransmission(
          best.syndrome,
          symptoms,
          userHistory
        ),
      };
    }

    return null;
  }

  /**
   * 坏病推理（误治变证）
   * 如：误汗亡阳、误下伤脾
   */
  private async inferMistreatmentSyndrome(
    symptoms: string[],
    userHistory?: string[]
  ): Promise<InferenceResult | null> {
    // 如果没有误治史，不可能是坏病
    if (!userHistory || userHistory.length === 0) {
      return null;
    }

    const hasMistreatment = userHistory.some(
      h => h.includes('服') || h.includes('药') || h.includes('误')
    );

    if (!hasMistreatment) {
      return null;
    }

    // 获取所有坏病类型
    const mistreatmentSyndromes =
      KnowledgeGraphQuery.findCombinedSyndromes('坏病');

    // 对每个坏病类型，计算匹配度
    const scored = mistreatmentSyndromes.map(syndrome => {
      let score = 0;
      const evidence: string[] = [];

      // 检查主症匹配
      syndrome.keySymptoms.forEach(symptom => {
        if (symptoms.some(s => this.matchSymptom(s, symptom))) {
          score += 2;
          evidence.push(symptom);
        }
      });

      // 检查兼症匹配
      syndrome.supportingSymptoms.forEach(symptom => {
        if (symptoms.some(s => this.matchSymptom(s, symptom))) {
          score += 1;
          evidence.push(symptom);
        }
      });

      // 检查误治史匹配
      syndrome.transmission.forEach(trans => {
        if (
          userHistory &&
          userHistory.some(h =>
            trans.triggers.some(trigger => h.includes(trigger))
          )
        ) {
          score += 3;
          evidence.push(`误治史：${trans.triggers.join('、')}`);
        }
      });

      return { syndrome, score, evidence };
    });

    // 选择得分最高的
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];

    // 如果得分足够高，识别为坏病
    if (best && best.score >= 5) {
      return {
        syndromeId: best.syndrome.id,
        name: best.syndrome.name,
        type: '坏病',
        meridians: Array.isArray(best.syndrome.meridian)
          ? best.syndrome.meridian
          : [best.syndrome.meridian],
        confidence: Math.min(1, best.score / 10),
        evidence: best.evidence,
        formula: best.syndrome.formula,
        alternativeFormulas: best.syndrome.alternativeFormulas,
        mechanism: best.syndrome.mechanism,
        transmissionPrediction: this.predictTransmission(
          best.syndrome,
          symptoms,
          userHistory
        ),
      };
    }

    return null;
  }

  /**
   * 单经辨证（默认）
   */
  private inferSingleMeridianSyndrome(symptoms: string[]): InferenceResult {
    // 按六经计算症状得分
    const meridianScores: Record<string, number> = {
      太阳: 0,
      阳明: 0,
      少阳: 0,
      太阴: 0,
      少阴: 0,
      厥阴: 0,
    };

    symptoms.forEach(symptom => {
      const symptomOntology = Object.values(SYMPTOM_ONTOLOGIES).find(
        s => s.alias.includes(symptom) || s.name === symptom
      );

      if (symptomOntology) {
        symptomOntology.associatedMeridians.forEach(meridian => {
          meridianScores[meridian] += symptomOntology.probability[meridian] * 10;
        });
      }
    });

    // 选择得分最高的六经
    const topMeridian = Object.entries(meridianScores).sort(
      (a, b) => b[1] - a[1]
    )[0][0];

    // 找到该六经下的证候
    const syndromes = Object.values(SYNDROME_ONTOLOGIES).filter(
      s => s.type === '单经证' && s.meridian === topMeridian
    );

    // 选择匹配度最高的证候
    let bestSyndrome = syndromes[0];
    let bestScore = 0;
    const evidence: string[] = [];

    syndromes.forEach(syndrome => {
      let score = 0;
      syndrome.keySymptoms.forEach(symptom => {
        if (symptoms.some(s => this.matchSymptom(s, symptom))) {
          score += 2;
          if (!evidence.includes(symptom)) evidence.push(symptom);
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestSyndrome = syndrome;
      }
    });

    return {
      syndromeId: bestSyndrome?.id || '',
      name: bestSyndrome?.name || topMeridian + '病',
      type: '单经证',
      meridians: [topMeridian],
      confidence: Math.min(1, bestScore / 10),
      evidence,
      formula: bestSyndrome?.formula || '',
      alternativeFormulas: bestSyndrome?.alternativeFormulas || [],
      mechanism: bestSyndrome?.mechanism || '',
      transmissionPrediction: bestSyndrome
        ? this.predictTransmission(bestSyndrome, symptoms)
        : undefined,
    };
  }

  /**
   * 预测疾病传变
   */
  private predictTransmission(
    syndrome: SyndromeOntology,
    symptoms: string[],
    userHistory?: string[]
  ): TransmissionPrediction[] {
    if (!syndrome.transmission) return [];

    return syndrome.transmission.map(trans => {
      const targetSyndrome = SYNDROME_ONTOLOGIES[trans.to];
      const probability = trans.probability;

      // 根据误治史调整概率
      let adjustedProbability = probability;
      if (userHistory && userHistory.length > 0) {
        const hasMistreatment = userHistory.some(h =>
          trans.triggers.some(trigger => h.includes(trigger))
        );
        if (hasMistreatment) {
          adjustedProbability = Math.min(1, probability * 1.5);
        }
      }

      // 判断警告等级
      let warningLevel: 'low' | 'medium' | 'high' = 'low';
      let recommendation = '继续观察';

      if (adjustedProbability >= 0.7) {
        warningLevel = 'high';
        recommendation = `高风险！请警惕转为${targetSyndrome?.name}，如出现${trans.conditions.join('、')}症状，需立即就医。`;
      } else if (adjustedProbability >= 0.4) {
        warningLevel = 'medium';
        recommendation = `中风险！可能出现${targetSyndrome?.name}，注意观察${trans.conditions.join('、')}症状。`;
      }

      return {
        to: trans.to,
        toName: targetSyndrome?.name || trans.to,
        probability: adjustedProbability,
        triggers: trans.triggers,
        warningLevel,
        recommendation,
      };
    });
  }

  /**
   * 检查传变特征
   * 如"发热+但欲寐"提示太阳传少阴
   */
  private checkTransmissionFeatures(
    symptoms: string[],
    syndrome: SyndromeOntology
  ): boolean {
    // 太阳并病少阴：发热+但欲寐
    if (
      syndrome.id === 'syndrome_taiyang_bing_shaoyin' &&
      symptoms.some(s => this.matchSymptom(s, '发热')) &&
      symptoms.some(s => this.matchSymptom(s, '但欲寐'))
    ) {
      return true;
    }

    // 太阳并病少阴：发热+下利清谷
    if (
      syndrome.id === 'syndrome_taiyang_bing_shaoyin' &&
      symptoms.some(s => this.matchSymptom(s, '发热')) &&
      symptoms.some(s => this.matchSymptom(s, '下利清谷'))
    ) {
      return true;
    }

    return false;
  }

  /**
   * 症状匹配
   */
  private matchSymptom(userSymptom: string, targetSymptom: string): boolean {
    const symptomOntology = Object.values(SYMPTOM_ONTOLOGIES).find(
      s => s.name === targetSymptom || s.alias.includes(targetSymptom)
    );

    if (!symptomOntology) return false;

    return (
      userSymptom === symptomOntology.name ||
      symptomOntology.alias.some(a => userSymptom.includes(a) || a.includes(userSymptom))
    );
  }

  /**
   * 生成鉴别建议
   * 当存在多个可能的证候时，提供鉴别点
   */
  generateDifferentiationAdvice(
    result: InferenceResult,
    alternativeResults: InferenceResult[]
  ): string[] {
    const advice: string[] = [];

    if (alternativeResults.length === 0) return advice;

    const primarySyndrome = SYNDROME_ONTOLOGIES[result.syndromeId];
    if (!primarySyndrome) return advice;

    // 为每个替代证候生成鉴别建议
    alternativeResults.forEach(alt => {
      const altSyndrome = SYNDROME_ONTOLOGIES[alt.syndromeId];
      if (!altSyndrome) return;

      // 找到鉴别点
      const differentiationPoints = primarySyndrome.differentiationPoints.filter(
        point =>
          !altSyndrome.keySymptoms.includes(point) &&
          !altSyndrome.supportingSymptoms.includes(point)
      );

      if (differentiationPoints.length > 0) {
        advice.push(
          `鉴别${alt.name}：请确认是否${differentiationPoints[0]}。`
        );
      }
    });

    return advice;
  }
}
