// 混合推理引擎
// 基于症状进行中医辨证论治

export interface InferenceResult {
  symptoms: string[];
  diagnosis: {
    confidence: number;
  };
}

export class HybridInferenceEngine {
  static async inference(params: {
    symptoms: string[];
    patientProfile?: {
      age?: number;
      gender?: string;
      isPregnant?: boolean;
    };
    userContext?: any;
  }): Promise<InferenceResult> {
    const { symptoms, patientProfile } = params;

    // 如果没有症状，返回默认值
    if (!symptoms || symptoms.length === 0) {
      return {
        symptoms: [],
        diagnosis: { confidence: 0 },
      };
    }

    // 简单的辨证论治逻辑（基于症状关键词匹配）
    let syndrome = '太阳病';
    let confidence = 75;

    const symptomStr = symptoms.join('');

    // 太阳病：发热、恶寒、无汗、头痛
    if (symptomStr.includes('发热') && symptomStr.includes('恶寒') && symptomStr.includes('无汗')) {
      syndrome = '太阳病（表实证）';
      confidence = 90;
    }
    // 太阳病中风：发热、汗出、恶风
    else if (symptomStr.includes('发热') && symptomStr.includes('汗出') && symptomStr.includes('恶风')) {
      syndrome = '太阳病中风（表虚证）';
      confidence = 85;
    }
    // 少阳病：口苦、咽干、胸胁胀满
    else if (symptomStr.includes('口苦') && (symptomStr.includes('咽干') || symptomStr.includes('胸胁'))) {
      syndrome = '少阳病';
      confidence = 80;
    }
    // 阳明病：发热、口渴、便秘
    else if (symptomStr.includes('发热') && symptomStr.includes('口渴') && symptomStr.includes('便秘')) {
      syndrome = '阳明病';
      confidence = 85;
    }
    // 太阴病：腹泻、腹痛、食欲不振
    else if (symptomStr.includes('腹泻') && symptomStr.includes('腹痛')) {
      syndrome = '太阴病';
      confidence = 80;
    }
    // 少阴病：脉微细、但欲寐、畏寒
    else if (symptomStr.includes('脉微细') || (symptomStr.includes('但欲寐') && symptomStr.includes('畏寒'))) {
      syndrome = '少阴病';
      confidence = 75;
    }
    // 厥阴病：寒热错杂
    else if (symptomStr.includes('上热') && symptomStr.includes('下寒')) {
      syndrome = '厥阴病';
      confidence = 70;
    }

    // 根据患者体质调整置信度
    if (patientProfile?.isPregnant) {
      confidence = Math.max(confidence - 10, 50); // 孕妇降低置信度
    }
    if (patientProfile?.age && patientProfile.age > 60) {
      confidence = Math.max(confidence - 5, 50); // 老年人降低置信度
    }

    return {
      symptoms,
      diagnosis: { confidence },
    };
  }
}
