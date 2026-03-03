/**
 * 数字张仲景 - 五维一体输出方案
 * 输出内容：辨证结论 + 推荐经方 + 煎服法说明 + 调护建议 + 预警提示
 */

import { InferenceResult, FormulaRecommendation } from '../tcm-inference/hybrid-inference-engine';
import { SafetyCheckResult } from '../tcm-safety/external-knowledge-service';
import { CLASSIC_FORMULAS_DB } from '../tcm-knowledge/classic-formulas-db';

// 临时定义 - 避免编译错误
const HERB_DATABASE: Record<string, any> = {};

// ============================================
// 类型定义
// ============================================
export interface FiveDimensionalOutput {
  diagnosis: DiagnosisOutput; // 维度1：辨证结论
  formula: FormulaOutput; // 维度2：推荐经方
  instructions: InstructionsOutput; // 维度3：煎服法说明
  care: CareOutput; // 维度4：调护建议
  warnings: WarningsOutput; // 维度5：预警提示
  metadata: {
    evidenceLevel: 'A' | 'B' | 'C';
    confidence: number;
    generatedAt: Date;
    systemVersion: string;
  };
}

export interface DiagnosisOutput {
  primarySyndrome: string; // 主要证候
  meridian: string; // 六经归属
  nature: string; // 八纲属性
  keySigns: string[]; // 决定性指征
  tongue?: string; // 舌象
  pulse?: string; // 脉象
  diseaseEvolution: string[]; // 病势推演
  confidence: { level: 'high' | 'medium' | 'low'; value: number }; // 诊断置信度
  evidenceLevel: 'A' | 'B' | 'C'; // 证据等级
  classicReference: string; // 经典条文引用
}

export interface FormulaOutput {
  primaryFormula: FormulaRecommendation; // 主方
  alternativeFormulas: FormulaRecommendation[]; // 替代方剂
  modification: {
    condition: string; // 加减条件
    additions: Array<{ herb: string; dosage: string; reason: string }>; // 加药
    subtractions: Array<{ herb: string; reason: string }>; // 减药
  }[];
  herbSafety: Array<{
    herb: string;
    safetyRating: 'A' | 'B' | 'C' | 'D';
    dosageWarning?: string;
    toxicityInfo?: string;
  }>;
  totalCost: number; // 预估费用（元）
  preparationTime: string; // 煮药时间
}

export interface InstructionsOutput {
  preparation: {
    waterAmount: string; // 用水量
    boilingTime: string; // 煮药时间
    specialProcessing: Array<{ herb: string; method: string }>; // 特殊炮制方法
  };
  administration: {
    dosagePerServing: string; // 每次用量
    dailyDoses: number; // 每日次数
    timing: string; // 服用时机
    duration: string; // 服用周期
  };
  contraindications: string[]; // 禁忌
  drugInteractions: string[]; // 药物相互作用
  storage: string; // 贮存方法
}

export interface CareOutput {
  dietaryAdvice: {
    recommended: string[]; // 推荐食物
    avoided: string[]; // 忌口食物
    mealTiming: string; // 饮食时机
  };
  lifestyleAdvice: {
    rest: string; // 休息建议
    exercise: string; // 运动建议
    emotion: string; // 情绪调护
    environment: string; // 环境调节
  };
  selfMonitoring: {
    symptoms: string[]; // 需监测的症状
    frequency: string; // 监测频率
    redFlags: string[]; // 危险信号
  };
  followUp: {
    timing: string; // 复诊时机
    conditions: string[]; // 复诊条件
  };
}

export interface WarningsOutput {
  riskLevel: '低' | '中' | '高' | '极高'; // 风险等级
  immediateAttention: string[]; // 立即关注事项
  contraindications: string[]; // 禁忌证
  sideEffects: string[]; // 可能的副作用
  emergency: {
    conditions: string[]; // 紧急情况
    actions: string[]; // 应对措施
    contact: string; // 联系方式
  };
  legalDisclaimer: string; // 法律免责声明
}

// ============================================
// 五维一体输出服务
// ============================================
export class FiveDimensionalOutputService {
  /**
   * 生成五维一体输出
   */
  static generateOutput(
    inferenceResult: InferenceResult,
    safetyCheckResult?: SafetyCheckResult
  ): FiveDimensionalOutput {
    return {
      diagnosis: this.generateDiagnosisOutput(inferenceResult),
      formula: this.generateFormulaOutput(inferenceResult),
      instructions: this.generateInstructionsOutput(inferenceResult),
      care: this.generateCareOutput(inferenceResult),
      warnings: this.generateWarningsOutput(inferenceResult, safetyCheckResult),
      metadata: {
        evidenceLevel: inferenceResult.evidenceLevel,
        confidence: inferenceResult.diagnosis.confidence,
        generatedAt: new Date(),
        systemVersion: '数字张仲景 v1.0.0',
      },
    };
  }

  /**
   * 维度1：辨证结论
   */
  private static generateDiagnosisOutput(inferenceResult: InferenceResult): DiagnosisOutput {
    const syndromeName = inferenceResult.diagnosis.primarySyndrome;
    const meridian = inferenceResult.diagnosis.meridian;
    const nature = inferenceResult.diagnosis.nature;
    const confidence = inferenceResult.diagnosis.confidence;

    // 生成病势推演
    const diseaseEvolution = this.generateDiseaseEvolution(inferenceResult);

    // 生成经典条文引用
    const classicReference = this.generateClassicReference(syndromeName);

    return {
      primarySyndrome: syndromeName,
      meridian,
      nature,
      keySigns: inferenceResult.keySigns,
      tongue: inferenceResult.reasoning.ruleEngineMatches.join('、'),
      pulse: inferenceResult.reasoning.ruleEngineMatches.join('、'),
      diseaseEvolution,
      confidence: {
        level: confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low',
        value: confidence,
      },
      evidenceLevel: inferenceResult.evidenceLevel,
      classicReference,
    };
  }

  /**
   * 维度2：推荐经方
   */
  private static generateFormulaOutput(inferenceResult: InferenceResult): FormulaOutput {
    const primaryFormula = inferenceResult.recommendedFormulas[0];
    const alternativeFormulas = inferenceResult.recommendedFormulas.slice(1, 4);

    // 生成加减建议
    const modification = this.generateModifications(inferenceResult);

    // 生成药物安全信息
    const herbSafety = primaryFormula.herbs.map(herb => {
      const dosageRecommendation = this.getDosageRecommendation(herb.name);
      return {
        herb: herb.name,
        safetyRating: this.getSafetyRating(herb.name),
        dosageWarning: dosageRecommendation?.dosageWarning,
        toxicityInfo: this.getToxicityInfo(herb.name),
      };
    });

    // 预估费用
    const totalCost = this.estimateCost(primaryFormula);

    // 煮药时间
    const preparationTime = this.estimatePreparationTime(primaryFormula);

    return {
      primaryFormula,
      alternativeFormulas,
      modification,
      herbSafety,
      totalCost,
      preparationTime,
    };
  }

  /**
   * 维度3：煎服法说明
   */
  private static generateInstructionsOutput(inferenceResult: InferenceResult): InstructionsOutput {
    const primaryFormula = inferenceResult.recommendedFormulas[0];
    const formulaData = CLASSIC_FORMULAS_DB[primaryFormula.formulaId];

    return {
      preparation: {
        waterAmount: formulaData?.dosage.waterAmount || '7升（约700ml）',
        boilingTime: formulaData?.dosage.boilingTime || '煮取3升（约300ml）',
        specialProcessing: this.getSpecialProcessing(primaryFormula.herbs),
      },
      administration: {
        dosagePerServing: formulaData?.dosage.dosagePerServing || '100ml',
        dailyDoses: formulaData?.dosage.dailyDoses || 3,
        timing: this.getAdministrationTiming(primaryFormula.formulaName),
        duration: '3-7天（视病情调整）',
      },
      contraindications: primaryFormula.contraindications,
      drugInteractions: this.getDrugInteractions(primaryFormula.herbs),
      storage: '阴凉干燥处保存，防潮、防蛀',
    };
  }

  /**
   * 维度4：调护建议
   */
  private static generateCareOutput(inferenceResult: InferenceResult): CareOutput {
    const meridian = inferenceResult.diagnosis.meridian;
    const nature = inferenceResult.diagnosis.nature;

    return {
      dietaryAdvice: this.getDietaryAdvice(meridian, nature),
      lifestyleAdvice: this.getLifestyleAdvice(meridian, nature),
      selfMonitoring: {
        symptoms: this.getSelfMonitoringSymptoms(meridian),
        frequency: '每日2-3次',
        redFlags: this.getRedFlags(meridian),
      },
      followUp: {
        timing: '服药3-5天后，或症状明显改善/加重时',
        conditions: [
          '症状完全消失，可停止服药',
          '症状无明显改善或加重，需复诊调整',
          '出现新的不适症状，需立即就医',
        ],
      },
    };
  }

  /**
   * 维度5：预警提示
   */
  private static generateWarningsOutput(
    inferenceResult: InferenceResult,
    safetyCheckResult?: SafetyCheckResult
  ): WarningsOutput {
    const primaryFormula = inferenceResult.recommendedFormulas[0];
    const riskLevel = safetyCheckResult?.riskLevel || '低';

    // 生成预警信息
    const warnings = [
      ...inferenceResult.warnings,
      ...(safetyCheckResult?.warnings || []),
    ];

    // 生成副作用
    const sideEffects = this.getSideEffects(primaryFormula.herbs);

    return {
      riskLevel,
      immediateAttention: warnings.filter(w => w.includes('🔴') || w.includes('⚠️')),
      contraindications: primaryFormula.contraindications,
      sideEffects,
      emergency: {
        conditions: [
          '出现高热神昏（>40℃）',
          '血压下降、心率过快/过慢',
          '呼吸困难、胸闷加重',
          '皮疹、瘙痒等过敏反应',
          '严重腹痛、呕吐、腹泻',
        ],
        actions: [
          '立即停止服药',
          '保存剩余药物和药渣',
          '携带药物和处方到医院就诊',
          '告知医师服用的是中药',
        ],
        contact: '拨打120急救电话，或前往就近医院急诊科',
      },
      legalDisclaimer:
        '本系统仅提供中医辨证参考，不能替代专业医师的诊断和治疗。用药前请务必咨询专业中医师，特别是孕妇、儿童、老年人及肝肾功能不全者。',
    };
  }

  // ============================================
  // 辅助方法
  // ============================================

  /**
   * 生成病势推演
   */
  private static generateDiseaseEvolution(inferenceResult: InferenceResult): string[] {
    const evolution: string[] = [];
    const meridian = inferenceResult.diagnosis.meridian;

    // 传变路径
    const transmissionPaths: Record<string, string[]> = {
      太阳: ['太阳 → 少阳', '太阳 → 阳明', '太阳 → 少阴'],
      少阳: ['少阳 → 阳明', '少阳 → 太阴'],
      阳明: ['阳明 → 太阴', '阳明 → 少阴'],
      太阴: ['太阴 → 少阴'],
      少阴: ['少阴 → 厥阴', '少阴 → 死亡'],
      厥阴: ['厥阴 → 恢复', '厥阴 → 死亡'],
    };

    if (transmissionPaths[meridian]) {
      evolution.push(`病势推演：${transmissionPaths[meridian].join(' → ')}`);
    }

    // 合病/并病
    if (inferenceResult.combinedSyndrome) {
      evolution.push(`当前为合病：${inferenceResult.combinedSyndrome.name}，需兼顾多经`);
    }

    return evolution;
  }

  /**
   * 生成经典条文引用
   */
  private static generateClassicReference(syndromeName: string): string {
    const references: Record<string, string> = {
      '太阳中风': '《伤寒论》第12条：太阳中风，阳浮而阴弱，阳浮者，热自发；阴弱者，汗自出。啬啬恶寒，淅淅恶风，翕翕发热，鼻鸣干呕者，桂枝汤主之。',
      '太阳表实': '《伤寒论》第35条：太阳病，头痛发热，身疼腰痛，骨节疼痛，恶风无汗而喘者，麻黄汤主之。',
      '少阳火郁': '《伤寒论》第96条：伤寒五六日中风，往来寒热，胸胁苦满，嘿嘿不欲饮食，心烦喜呕，或胸中烦而不呕，或渴，或腹中痛，或胁下痞硬，或心下悸、小便不利，或不渴、身有微热，或咳者，小柴胡汤主之。',
      '阳明实证': '《伤寒论》第208条：阳明病，脉迟，虽汗出不恶寒者，其身必重，短气腹满而喘，有潮热者，此外欲解，可攻里也。手足濈然汗出者，此大便已鞕也，大承气汤主之。',
      '太阴湿盛': '《伤寒论》第273条：太阴之为病，腹满而吐，食不下，自利益甚，时腹自痛。若下之，必胸下结鞕。',
      '少阴阳虚': '《伤寒论》第323条：少阴病，脉微细，但欲寐也。',
      '少阴阴虚': '《伤寒论》第303条：少阴病，得之二三日以上，心中烦，不得卧，黄连阿胶汤主之。',
    };

    return references[syndromeName] || '参考《伤寒论》相关条文';
  }

  /**
   * 生成加减建议
   */
  private static generateModifications(inferenceResult: InferenceResult): Array<{
    condition: string;
    additions: Array<{ herb: string; dosage: string; reason: string }>;
    subtractions: Array<{ herb: string; reason: string }>;
  }> {
    const primaryFormula = inferenceResult.recommendedFormulas[0];
    const formulaData = CLASSIC_FORMULAS_DB[primaryFormula.formulaId];

    if (!formulaData || !formulaData.modifications) {
      return [];
    }

    return formulaData.modifications.map(mod => ({
      condition: mod.condition,
      additions: mod.addition.map(herb => ({
        herb,
        dosage: '9g', // 默认剂量
        reason: `针对"${mod.condition}"症状`,
      })),
      subtractions: (mod.removal || []).map(herb => ({
        herb,
        reason: `针对"${mod.condition}"症状`,
      })),
    }));
  }

  /**
   * 获取特殊炮制方法
   */
  private static getSpecialProcessing(herbs: Array<{ name: string; dosage: string; processing?: string }>): Array<{
    herb: string;
    method: string;
  }> {
    const specialProcessing: Array<{ herb: string; method: string }> = [];

    for (const herb of herbs) {
      if (herb.processing) {
        specialProcessing.push({
          herb: herb.name,
          method: herb.processing,
        });
      }
    }

    return specialProcessing;
  }

  /**
   * 获取服用时机
   */
  private static getAdministrationTiming(formulaName: string): string {
    const timings: Record<string, string> = {
      桂枝汤: '温服，服后啜热稀粥一碗，助药力发汗',
      麻黄汤: '温服，覆被取微汗',
      小柴胡汤: '每日3次，饭前服用',
      白虎汤: '每日3次，饭后服用',
      大承气汤: '温服，得下后停服',
      四逆汤: '温服，每日2次',
      真武汤: '每日3次，饭前服用',
    };

    return timings[formulaName] || '每日3次，饭前服用';
  }

  /**
   * 获取药物相互作用
   */
  private static getDrugInteractions(herbs: Array<{ name: string }>): string[] {
    const interactions: string[] = [];

    // 附子与贝母、瓜蒌、白及、白蔹（十八反）
    if (herbs.some(h => h.name.includes('附子'))) {
      interactions.push('附子不宜与贝母、瓜蒌、白及、白蔹同用（十八反）');
    }

    // 甘草与甘遂、大戟、海藻、芫花（十八反）
    if (herbs.some(h => h.name.includes('甘草'))) {
      interactions.push('甘草不宜与甘遂、大戟、海藻、芫花同用（十八反）');
    }

    // 人参与藜芦（十八反）
    if (herbs.some(h => h.name.includes('人参'))) {
      interactions.push('人参不宜与藜芦同用（十八反）');
    }

    return interactions;
  }

  /**
   * 获取饮食建议
   */
  private static getDietaryAdvice(meridian: string, nature: string): {
    recommended: string[];
    avoided: string[];
    mealTiming: string;
  } {
    const recommendations: Record<string, { recommended: string[]; avoided: string[]; mealTiming: string }> = {
      太阳: {
        recommended: ['生姜', '葱白', '粥', '清淡易消化的食物'],
        avoided: ['生冷食物', '油腻食物', '辛辣食物'],
        mealTiming: '服药后啜热稀粥，助药力',
      },
      阳明: {
        recommended: ['绿豆汤', '冬瓜', '苦瓜', '新鲜蔬菜水果'],
        avoided: ['辛辣食物', '油腻食物', '羊肉、狗肉等温性食物'],
        mealTiming: '饭后服用，避免空腹',
      },
      少阳: {
        recommended: ['清淡饮食', '蔬菜水果', '菊花茶'],
        avoided: ['辛辣食物', '油腻食物', '烟酒'],
        mealTiming: '饭前服用',
      },
      太阴: {
        recommended: ['山药', '茯苓', '白扁豆', '薏米'],
        avoided: ['生冷食物', '油腻食物', '甜腻食物'],
        mealTiming: '饭后服用，温服',
      },
      少阴: {
        recommended: ['羊肉', '生姜', '胡椒', '温热性食物'],
        avoided: ['生冷食物', '寒凉性食物'],
        mealTiming: '饭前服用，温服',
      },
      厥阴: {
        recommended: ['清淡饮食', '蔬菜水果'],
        avoided: ['辛辣食物', '油腻食物', '烟酒'],
        mealTiming: '饭后服用',
      },
    };

    return recommendations[meridian] || {
      recommended: ['清淡饮食', '蔬菜水果'],
      avoided: ['辛辣食物', '油腻食物'],
      mealTiming: '饭后服用',
    };
  }

  /**
   * 获取生活方式建议
   */
  private static getLifestyleAdvice(meridian: string, nature: string): {
    rest: string;
    exercise: string;
    emotion: string;
    environment: string;
  } {
    const advice: Record<string, { rest: string; exercise: string; emotion: string; environment: string }> = {
      太阳: {
        rest: '卧床休息，避免劳累',
        exercise: '暂停运动，待康复后恢复',
        emotion: '保持心情舒畅，避免焦虑',
        environment: '注意保暖，避免受风',
      },
      阳明: {
        rest: '适当休息，避免过度劳累',
        exercise: '轻度运动，如散步',
        emotion: '保持心情平和',
        environment: '保持环境凉爽通风',
      },
      少阳: {
        rest: '保证充足睡眠',
        exercise: '适度运动，如太极、八段锦',
        emotion: '调节情绪，避免肝气郁结',
        environment: '保持环境安静、舒适',
      },
      太阴: {
        rest: '避免过度劳累',
        exercise: '轻度运动，如散步',
        emotion: '保持心情舒畅',
        environment: '保持环境温暖、干燥',
      },
      少阴: {
        rest: '保证充足休息',
        exercise: '暂停运动，待康复后恢复',
        emotion: '保持心情平静',
        environment: '注意保暖，避免受寒',
      },
      厥阴: {
        rest: '保证充足休息',
        exercise: '轻度运动，如太极',
        emotion: '调节情绪，避免愤怒、抑郁',
        environment: '保持环境安静、舒适',
      },
    };

    return advice[meridian] || {
      rest: '适当休息',
      exercise: '轻度运动',
      emotion: '保持心情舒畅',
      environment: '保持环境舒适',
    };
  }

  /**
   * 获取自我监测症状
   */
  private static getSelfMonitoringSymptoms(meridian: string): string[] {
    const symptoms: Record<string, string[]> = {
      太阳: ['体温', '出汗情况', '头痛', '全身酸痛'],
      阳明: ['体温', '口渴程度', '大便情况', '腹胀情况'],
      少阳: ['寒热往来', '口苦', '胸胁胀满', '食欲'],
      太阴: ['大便情况', '腹胀', '食欲', '腹痛'],
      少阴: ['精神状态', '体温', '四肢温度', '大便情况'],
      厥阴: ['精神状态', '体温', '头痛', '腹痛'],
    };

    return symptoms[meridian] || ['体温', '精神状态', '食欲'];
  }

  /**
   * 获取危险信号（红旗）
   */
  private static getRedFlags(meridian: string): string[] {
    const redFlags: Record<string, string[]> = {
      太阳: ['体温持续升高超过39℃', '呼吸困难', '意识模糊'],
      阳明: ['体温持续升高超过40℃', '意识模糊', '腹痛加剧'],
      少阳: ['体温持续升高', '腹痛加剧', '呕吐不止'],
      太阴: ['腹痛加剧', '呕吐不止', '脱水症状'],
      少阴: ['体温下降但精神萎靡', '呼吸困难', '意识模糊'],
      厥阴: ['意识模糊', '呼吸困难', '剧烈头痛'],
    };

    return redFlags[meridian] || ['体温持续升高', '意识模糊', '呼吸困难'];
  }

  /**
   * 获取副作用
   */
  private static getSideEffects(herbs: Array<{ name: string }>): string[] {
    const sideEffects: string[] = [];

    for (const herb of herbs) {
      if (herb.name.includes('附子')) {
        sideEffects.push('口舌麻木、心悸、血压升高（附子中毒症状）');
      }
      if (herb.name.includes('细辛')) {
        sideEffects.push('头痛、呕吐、呼吸困难（细辛中毒症状）');
      }
      if (herb.name.includes('麻黄')) {
        sideEffects.push('心悸、失眠、出汗过多（麻黄副作用）');
      }
      if (herb.name.includes('大黄')) {
        sideEffects.push('腹痛、腹泻、电解质紊乱（大黄副作用）');
      }
    }

    return sideEffects.length > 0 ? sideEffects : ['可能出现轻微胃肠不适'];
  }

  /**
   * 预估费用
   */
  private static estimateCost(formula: FormulaRecommendation): number {
    // 简单估算：每味药平均5元
    return formula.herbs.length * 5;
  }

  /**
   * 预估煮药时间
   */
  private static estimatePreparationTime(formula: FormulaRecommendation): string {
    if (formula.herbs.some(h => h.name.includes('附子'))) {
      return '60分钟（附子先煎60分钟）';
    } else if (formula.herbs.some(h => h.name.includes('麻黄'))) {
      return '40分钟（麻黄先煎20分钟）';
    } else {
      return '30分钟';
    }
  }

  /**
   * 获取剂量建议
   */
  private static getDosageRecommendation(herbName: string): {
    dosageWarning?: string;
  } | null {
    const herb = Object.values(HERB_DATABASE).find((h: any) =>
      h.name === herbName || h.aliases.some((a: string) => a === herbName)
    );

    if (!herb || !herb.toxicity?.isToxic) return null;

    return {
      dosageWarning: `${herbName}有毒！日常用量：${herb.dosage.min}-${herb.dosage.max}g，中毒剂量：>${herb.dosage.maxToxic}g。`,
    };
  }

  /**
   * 获取安全等级
   */
  private static getSafetyRating(herbName: string): 'A' | 'B' | 'C' | 'D' {
    const herb = Object.values(HERB_DATABASE).find((h: any) =>
      h.name === herbName || h.aliases.some((a: string) => a === herbName)
    );

    return herb?.safetyRating || 'B';
  }

  /**
   * 获取毒性信息
   */
  private static getToxicityInfo(herbName: string): string | undefined {
    const herb = Object.values(HERB_DATABASE).find((h: any) =>
      h.name === herbName || h.aliases.some((a: string) => a === herbName)
    );

    if (!herb || !herb.toxicity?.isToxic) return undefined;

    return herb.toxicity.toxicSymptoms?.join('、');
  }
}
