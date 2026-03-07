/**
 * 数字张仲景 - 双通道输出机制
 * 患者通道（自然语言） + 系统通道（JSON/结构化）
 * 新增：证据溯源 + 冲突消解信息
 */

import { FiveDimensionalOutput } from '../tcm-output/five-dimensional-output-service';
import { InferenceResult } from '../tcm-inference/hybrid-inference-engine';
import { EvidenceTraceService, EvidenceChain } from './evidence-trace-service';

// ============================================
// 类型定义
// ============================================
export interface DualChannelOutput {
  patientChannel: PatientChannel; // 患者通道（自然语言）
  systemChannel: SystemChannel; // 系统通道（JSON/结构化）
  metadata: {
    generatedAt: Date;
    model: 'Qwen-Med-Jingfang';
    confidence: number;
  };
}

export interface PatientChannel {
  // 维度1：辨证结论
  diagnosis: {
    title: string; // 诊断标题
    description: string; // 详细描述（通俗易懂）
    keySigns: string[]; // 决定性指征（通俗描述）
    evidence: string; // 证据来源
  };
  // 维度2：推荐经方
  formula: {
    name: string; // 方剂名称
    description: string; // 方剂描述
    herbs: Array<{
      name: string;
      description: string; // 药物作用描述
    }>;
    instructions: string; // 煎服法（通俗描述）
  };
  // 维度3：调护建议
  care: {
    diet: {
      recommended: string[]; // 推荐食物
      avoided: string[]; // 忌口食物
    };
    lifestyle: string; // 生活方式建议
    monitoring: string; // 自我监测
  };
  // 维度4：预警提示
  warnings: string[]; // 预警信息（通俗易懂）
  // 维度5：证据溯源
  evidence: {
    diagnosisEvidence: string[]; // 诊断证据
    formulaEvidence: string[]; // 方剂证据
    overallConfidence: string; // 整体置信度
  };
  // 维度6：冲突消解
  conflictResolution?: {
    hasConflict: boolean; // 是否存在冲突
    conflictReport: string; // 冲突处理报告
  };
  // 维度7：免责声明
  disclaimer: string;
}

export interface SystemChannel {
  // 维度1：辨证结论
  diagnosis: {
    primarySyndrome: string; // 主要证候
    meridian: string; // 六经
    nature: string; // 八纲
    keySigns: string[]; // 决定性指征
    confidence: number; // 置信度
    evidenceLevel: 'A' | 'B' | 'C'; // 证据等级
    classicReference: string; // 经典条文引用
  };
  // 维度2：推荐经方
  formula: {
    formulaId: string; // 方剂ID
    formulaName: string; // 方剂名称
    matchScore: number; // 匹配分数
    herbs: Array<{
      name: string;
      dosage: string;
      processing?: string;
      safetyRating: 'A' | 'B' | 'C' | 'D';
    }>;
    instructions: {
      waterAmount: string;
      boilingTime: string;
      servingMethod: string;
    };
    contraindications: string[];
    evidenceLevel: 'A' | 'B' | 'C';
  };
  // 维度3：煎服法
  instructions: {
    preparation: {
      waterAmount: string;
      boilingTime: string;
      specialProcessing: Array<{ herb: string; method: string }>;
    };
    administration: {
      waterAmount: string;
      boilingTime: string;
      servingMethod: string;
    };
    storage: string;
  };
  // 维度4：调护建议
  care: {
    dietaryAdvice: {
      recommended: string[];
      avoided: string[];
    };
    lifestyleAdvice: {
      rest: string;
      exercise: string;
      emotion: string;
      environment: string;
    };
    selfMonitoring: {
      symptoms: string[];
      frequency: string;
      redFlags: string[];
    };
    followUp: {
      timing: string;
      conditions: string[];
    };
  };
  // 维度5：预警提示
  warnings: {
    riskLevel: '低' | '中' | '高' | '极高';
    immediateAttention: string[];
    contraindications: string[];
    sideEffects: string[];
    emergency: {
      conditions: string[];
      actions: string[];
      contact: string;
    };
  };
  // 维度6：证据溯源
  evidenceChain: EvidenceChain; // 证据链
  // 维度7：冲突消解
  conflictResolution?: {
    hasConflict: boolean; // 是否存在冲突
    resolutionResult: any; // 冲突消解结果
  };
  // 元数据
  metadata: {
    inferenceResult: InferenceResult;
    fiveDimensionalOutput: FiveDimensionalOutput;
  };
}

// ============================================
// 双通道输出服务
// ============================================
export class DualChannelOutputService {
  /**
   * 生成双通道输出
   */
  static async generateDualChannelOutput(
    inferenceResult: InferenceResult,
    fiveDimensionalOutput: FiveDimensionalOutput
  ): Promise<DualChannelOutput> {
    return {
      patientChannel: await this.generatePatientChannel(inferenceResult, fiveDimensionalOutput),
      systemChannel: await this.generateSystemChannel(inferenceResult, fiveDimensionalOutput),
      metadata: {
        generatedAt: new Date(),
        model: 'Qwen-Med-Jingfang',
        confidence: inferenceResult.diagnosis.confidence,
      },
    };
  }

  /**
   * 生成患者通道（自然语言）
   */
  private static async generatePatientChannel(
    inferenceResult: InferenceResult,
    fiveDimensionalOutput: FiveDimensionalOutput
  ): Promise<PatientChannel> {
    // 使用 Qwen 生成通俗易懂的自然语言
    const patientPrompt = `你是一位温和的经方医师，请将以下中医诊断结果转化为通俗易懂的语言，让普通患者能够理解。

诊断信息：
- 证候：${fiveDimensionalOutput.diagnosis.primarySyndrome}
- 六经：${fiveDimensionalOutput.diagnosis.meridian}
- 八纲：${fiveDimensionalOutput.diagnosis.nature}
- 决定性指征：${fiveDimensionalOutput.diagnosis.keySigns.join('、')}
- 推荐方剂：${fiveDimensionalOutput.formula.primaryFormula.formulaName}
- 药物：${fiveDimensionalOutput.formula.primaryFormula.herbs.map(h => h.name).join('、')}
- 煎服法：${fiveDimensionalOutput.instructions.preparation.boilingTime}
- 饮食建议：推荐 ${fiveDimensionalOutput.care.dietaryAdvice.recommended.join('、')}，忌口 ${fiveDimensionalOutput.care.dietaryAdvice.avoided.join('、')}
- 预警：${fiveDimensionalOutput.warnings.immediateAttention.join('；')}

请生成以下内容（使用 JSON 格式）：
{
  "diagnosis": {
    "title": "诊断标题（通俗）",
    "description": "详细描述（通俗易懂）",
    "keySigns": ["决定性指征（通俗描述）"],
    "evidence": "证据来源（通俗）"
  },
  "formula": {
    "name": "方剂名称",
    "description": "方剂描述（通俗易懂）",
    "herbs": [
      {"name": "药物名称", "description": "药物作用描述（通俗易懂）"}
    ],
    "instructions": "煎服法（通俗描述）"
  },
  "care": {
    "diet": {
      "recommended": ["推荐食物"],
      "avoided": ["忌口食物"]
    },
    "lifestyle": "生活方式建议（通俗）",
    "monitoring": "自我监测（通俗）"
  },
  "warnings": ["预警信息（通俗易懂）"],
  "disclaimer": "免责声明"
}`;

    // 这里应该调用 Qwen API，暂时返回模拟结果
    const patientChannel: PatientChannel = {
      diagnosis: {
        title: `您属于${fiveDimensionalOutput.diagnosis.meridian}病`,
        description: `${fiveDimensionalOutput.diagnosis.primarySyndrome}是中医常见的证候，主要表现为${fiveDimensionalOutput.diagnosis.keySigns.join('、')}等症状。这与您的症状描述高度吻合。`,
        keySigns: fiveDimensionalOutput.diagnosis.keySigns.map(sign => {
          const signMap: Record<string, string> = {
            发热: '身体发热',
            汗出: '出汗',
            恶寒: '怕冷',
            头痛: '头痛',
            口苦: '嘴里发苦',
            胸胁胀满: '胸口和两肋胀满',
            不欲饮食: '不想吃东西',
            下利清谷: '拉肚子，大便里有未消化的食物',
            脉微细: '脉搏细弱',
            但欲寐: '总想睡觉，精神萎靡',
          };
          return signMap[sign] || sign;
        }),
        evidence: fiveDimensionalOutput.diagnosis.classicReference,
      },
      formula: {
        name: fiveDimensionalOutput.formula.primaryFormula.formulaName,
        description: `${fiveDimensionalOutput.formula.primaryFormula.formulaName}是《${fiveDimensionalOutput.formula.primaryFormula.formulaId.includes('shanghan') ? '伤寒论' : '金匮要略'}》中的经典方剂，专门用于治疗${fiveDimensionalOutput.diagnosis.primarySyndrome}。`,
        herbs: fiveDimensionalOutput.formula.primaryFormula.herbs.map(herb => {
          const herbDescriptionMap: Record<string, string> = {
            桂枝: '桂枝能够发汗解表，温通经脉',
            芍药: '芍药能够养血敛阴，柔肝止痛',
            甘草: '甘草能够调和诸药，益气和中',
            生姜: '生姜能够温中散寒，止呕',
            大枣: '大枣能够补中益气，养血安神',
            麻黄: '麻黄能够发汗解表，宣肺平喘',
            杏仁: '杏仁能够止咳平喘',
            柴胡: '柴胡能够和解少阳，疏肝解郁',
            黄芩: '黄芩能够清热燥湿，泻火解毒',
            半夏: '半夏能够燥湿化痰，降逆止呕',
            附子: '附子能够回阳救逆，补火助阳',
            茯苓: '茯苓能够利水渗湿，健脾宁心',
            白术: '白术能够健脾益气，燥湿利水',
            大黄: '大黄能够泻下攻积，清热泻火',
            芒硝: '芒硝能够泻下软坚，清热泻火',
          };
          return {
            name: herb.name,
            description: herbDescriptionMap[herb.name] || '中药药材',
          };
        }),
        instructions: fiveDimensionalOutput.instructions.preparation.boilingTime.replace('煮取', '煮到还剩'),
      },
      care: {
        diet: {
          recommended: fiveDimensionalOutput.care.dietaryAdvice.recommended.map(food => {
            const foodMap: Record<string, string> = {
              生姜: '生姜',
              葱白: '葱白',
              粥: '粥',
              山药: '山药',
              茯苓: '茯苓',
              白扁豆: '白扁豆',
              薏米: '薏米',
            };
            return foodMap[food] || food;
          }),
          avoided: fiveDimensionalOutput.care.dietaryAdvice.avoided.map(food => {
            const foodMap: Record<string, string> = {
              生冷食物: '生冷食物（如冰激凌、生鱼片）',
              油腻食物: '油腻食物（如油炸食品、肥肉）',
              辛辣食物: '辛辣食物（如辣椒、花椒）',
              羊肉: '羊肉',
              狗肉: '狗肉',
            };
            return foodMap[food] || food;
          }),
        },
        lifestyle: `${fiveDimensionalOutput.care.lifestyleAdvice.rest}，${fiveDimensionalOutput.care.lifestyleAdvice.exercise}，${fiveDimensionalOutput.care.lifestyleAdvice.emotion}，${fiveDimensionalOutput.care.lifestyleAdvice.environment}。`,
        monitoring: `请${fiveDimensionalOutput.care.selfMonitoring.frequency}监测以下症状：${fiveDimensionalOutput.care.selfMonitoring.symptoms.join('、')}。如果出现${fiveDimensionalOutput.care.selfMonitoring.redFlags.join('、')}，请立即就医。`,
      },
      warnings: fiveDimensionalOutput.warnings.immediateAttention.map(warning => {
        const warningMap: Record<string, string> = {
          '🔴 高风险证型：少阴/厥阴病证，病情危重，建议及时就医或请专家会诊':
            '⚠️ 您的症状比较严重，属于高风险证型，建议尽快就医或请专家会诊',
          '⚠️ 方剂安全等级：C，使用前需咨询医师':
            '⚠️ 推荐的方剂含有一定的毒性药物，使用前务必咨询医师',
          '🔴 孕期特殊预警：请务必咨询医师，切勿自行服药':
            '⚠️ 如果您是孕妇，请务必咨询医师，切勿自行服药',
        };
        return warningMap[warning] || warning;
      }),
      disclaimer: '⚠️ 免责声明：本建议由AI辅助生成，仅供参考，不能替代执业中医师面诊。如症状加重或出现新的不适，请及时就医。',
      evidence: {
        diagnosisEvidence: [],
        formulaEvidence: [],
        overallConfidence: '90%',
      },
    };

    // 生成证据溯源
    const evidenceChain = await EvidenceTraceService.buildDiagnosisEvidenceChain(
      fiveDimensionalOutput.diagnosis.primarySyndrome,
      fiveDimensionalOutput.diagnosis.keySigns,
      fiveDimensionalOutput.diagnosis.meridian
    );

    const evidenceReport = EvidenceTraceService.generateEvidenceReportForPatient(evidenceChain);

    patientChannel.evidence = {
      diagnosisEvidence: evidenceReport.diagnosisEvidence,
      formulaEvidence: evidenceReport.formulaEvidence,
      overallConfidence: evidenceReport.overallConfidence,
    };

    return patientChannel;
  }

  /**
   * 生成系统通道（结构化）
   */
  private static async generateSystemChannel(
    inferenceResult: InferenceResult,
    fiveDimensionalOutput: FiveDimensionalOutput
  ): Promise<SystemChannel> {
    // 生成证据溯源
    const evidenceChain = await EvidenceTraceService.buildDiagnosisEvidenceChain(
      fiveDimensionalOutput.diagnosis.primarySyndrome,
      fiveDimensionalOutput.diagnosis.keySigns,
      fiveDimensionalOutput.diagnosis.meridian
    );

    return {
      diagnosis: {
        primarySyndrome: fiveDimensionalOutput.diagnosis.primarySyndrome,
        meridian: fiveDimensionalOutput.diagnosis.meridian,
        nature: fiveDimensionalOutput.diagnosis.nature,
        keySigns: fiveDimensionalOutput.diagnosis.keySigns,
        confidence: fiveDimensionalOutput.diagnosis.confidence.value,
        evidenceLevel: fiveDimensionalOutput.diagnosis.evidenceLevel as 'A' | 'B' | 'C',
        classicReference: fiveDimensionalOutput.diagnosis.classicReference,
      },
      formula: {
        formulaId: fiveDimensionalOutput.formula.primaryFormula.formulaId,
        formulaName: fiveDimensionalOutput.formula.primaryFormula.formulaName,
        matchScore: fiveDimensionalOutput.formula.primaryFormula.matchScore,
        herbs: fiveDimensionalOutput.formula.primaryFormula.herbs.map(h => ({
          name: h.name,
          dosage: h.dosage,
          processing: h.processing,
          safetyRating: h.safetyRating as 'A' | 'B' | 'C' | 'D',
        })),
        instructions: {
          waterAmount: fiveDimensionalOutput.instructions.administration.waterAmount,
          boilingTime: fiveDimensionalOutput.instructions.administration.boilingTime,
          servingMethod: fiveDimensionalOutput.instructions.administration.servingMethod,
        },
        contraindications: fiveDimensionalOutput.formula.primaryFormula.contraindications,
        evidenceLevel: fiveDimensionalOutput.formula.primaryFormula.evidenceLevel as 'A' | 'B' | 'C',
      },
      instructions: {
        preparation: {
          waterAmount: fiveDimensionalOutput.instructions.preparation.waterAmount,
          boilingTime: fiveDimensionalOutput.instructions.preparation.boilingTime,
          specialProcessing: fiveDimensionalOutput.instructions.preparation.specialProcessing || [],
        },
        administration: {
          waterAmount: fiveDimensionalOutput.instructions.administration.waterAmount,
          boilingTime: fiveDimensionalOutput.instructions.administration.boilingTime,
          servingMethod: fiveDimensionalOutput.instructions.administration.servingMethod,
        },
        storage: fiveDimensionalOutput.instructions.storage,
      },
      care: {
        dietaryAdvice: fiveDimensionalOutput.care.dietaryAdvice,
        lifestyleAdvice: fiveDimensionalOutput.care.lifestyleAdvice,
        selfMonitoring: fiveDimensionalOutput.care.selfMonitoring,
        followUp: fiveDimensionalOutput.care.followUp,
      },
      warnings: {
        riskLevel: fiveDimensionalOutput.warnings.riskLevel as '低' | '中' | '高' | '极高',
        immediateAttention: fiveDimensionalOutput.warnings.immediateAttention,
        contraindications: fiveDimensionalOutput.warnings.contraindications,
        sideEffects: fiveDimensionalOutput.warnings.sideEffects,
        emergency: fiveDimensionalOutput.warnings.emergency,
      },
      evidenceChain,
      metadata: {
        inferenceResult,
        fiveDimensionalOutput,
      },
    };
  }
}
