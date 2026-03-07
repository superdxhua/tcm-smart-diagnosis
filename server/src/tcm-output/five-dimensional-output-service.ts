// 五维输出服务
import { InferenceResult } from '../tcm-inference/hybrid-inference-engine';

export interface FiveDimensionalOutput {
  diagnosis: {
    primarySyndrome: string;
    meridian: string;
    nature: string;
    keySigns: string[];
    confidence: { value: number };
    evidenceLevel: 'A' | 'B' | 'C';
    classicReference: string;
  };
  formula: {
    primaryFormula: {
      formulaId: string;
      formulaName: string;
      matchScore: number;
      herbs: Array<{ name: string; dosage: string; processing?: string; safetyRating: 'A' | 'B' | 'C' | 'D' }>;
      instructions: { waterAmount: string; boilingTime: string; servingMethod: string };
      contraindications: string[];
      evidenceLevel: 'A' | 'B' | 'C';
    };
  };
  instructions: {
    preparation: { waterAmount: string; boilingTime: string; specialProcessing: Array<{ herb: string; method: string }> };
    administration: { waterAmount: string; boilingTime: string; servingMethod: string };
    storage: string;
  };
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
  warnings: {
    riskLevel: '中' | '高' | '低' | '极高';
    immediateAttention: string[];
    contraindications: string[];
    sideEffects: string[];
    emergency: {
      conditions: string[];
      actions: string[];
      contact: string;
    };
  };
}

export class FiveDimensionalOutputService {
  static generateOutput(inferenceResult: InferenceResult): FiveDimensionalOutput {
    // 基于推理结果生成模拟的五维输出
    // TODO: 实现真正的五维输出生成逻辑

    // 简单的辨证论治逻辑（基于症状关键词）
    const symptoms = (inferenceResult as any).symptoms || [];
    const symptomStr = symptoms.join('');

    let primarySyndrome = '太阳病';
    let meridian = '太阳经';
    let nature = '表寒实证';
    let formulaName = '麻黄汤';
    let formulaId = 'shanghan-mahuang';

    // 根据症状判断证型
    if (symptomStr.includes('发热') && symptomStr.includes('恶寒')) {
      primarySyndrome = '太阳病';
      meridian = '太阳经';
      nature = '表寒实证';
      formulaName = '麻黄汤';
      formulaId = 'shanghan-mahuang';
    } else if (symptomStr.includes('发热') && symptomStr.includes('汗出')) {
      primarySyndrome = '太阳病中风';
      meridian = '太阳经';
      nature = '表虚证';
      formulaName = '桂枝汤';
      formulaId = 'shanghan-guizhi';
    } else if (symptomStr.includes('口渴') && symptomStr.includes('发热')) {
      primarySyndrome = '阳明病';
      meridian = '阳明经';
      nature = '里热证';
      formulaName = '白虎汤';
      formulaId = 'shanghan-baihu';
    } else if (symptomStr.includes('腹泻') && symptomStr.includes('腹痛')) {
      primarySyndrome = '太阴病';
      meridian = '太阴经';
      nature = '里寒湿证';
      formulaName = '理中汤';
      formulaId = 'shanghan-lizhong';
    }

    return {
      diagnosis: {
        primarySyndrome,
        meridian,
        nature,
        keySigns: symptoms.length > 0 ? symptoms : ['发热', '恶寒', '无汗', '头痛'],
        confidence: { value: 85 },
        evidenceLevel: 'A',
        classicReference: `《伤寒论》第${Math.floor(Math.random() * 50 + 1)}条`,
      },
      formula: {
        primaryFormula: {
          formulaId,
          formulaName,
          matchScore: 0.85,
          herbs: [
            { name: '麻黄', dosage: '9g', safetyRating: 'B' },
            { name: '桂枝', dosage: '9g', safetyRating: 'A' },
            { name: '杏仁', dosage: '9g', safetyRating: 'A' },
            { name: '甘草', dosage: '6g', safetyRating: 'A' },
          ],
          instructions: { waterAmount: '2000ml', boilingTime: '30分钟', servingMethod: '分三次温服' },
          contraindications: ['阴虚自汗', '外感风热'],
          evidenceLevel: 'A',
        },
      },
      instructions: {
        preparation: {
          waterAmount: '2000ml',
          boilingTime: '30分钟',
          specialProcessing: [],
        },
        administration: {
          waterAmount: '2000ml',
          boilingTime: '30分钟',
          servingMethod: '分三次温服',
        },
        storage: '阴凉处保存',
      },
      care: {
        dietaryAdvice: {
          recommended: ['粥', '清淡易消化食物'],
          avoided: ['生冷', '油腻', '辛辣'],
        },
        lifestyleAdvice: {
          rest: '注意休息',
          exercise: '适当散步',
          emotion: '保持心情舒畅',
          environment: '避风保暖',
        },
        selfMonitoring: {
          symptoms: ['体温', '汗出', '食欲'],
          frequency: '每日两次',
          redFlags: ['高热不退', '呼吸困难', '皮疹'],
        },
        followUp: {
          timing: '3天后复诊',
          conditions: ['体温恢复正常', '症状减轻'],
        },
      },
      warnings: {
        riskLevel: '低',
        immediateAttention: ['如症状加重请立即就医'],
        contraindications: ['孕妇慎用', '体弱者减量'],
        sideEffects: ['少数可能出现胃部不适'],
        emergency: {
          conditions: ['高热', '呼吸困难', '意识模糊'],
          actions: ['立即就医', '停止服药'],
          contact: '120急救',
        },
      },
    };
  }
}
