/**
 * 数字张仲景 - 三重安全护栏
 * 输入过滤 + 输出审查 + 知识锚定
 */

// TODO: 知识库文件暂时移除，需要重新添加
// import { HERB_DATABASE, HerbQuery } from '../tcm-knowledge/herb-db';
// import { INCOMPATIBILITY_PAIRS, PREGNANCY_CONTRAINDICATIONS } from '../tcm-knowledge/herb-db';

// 临时空导出，避免编译错误
const HERB_DATABASE: any = {};
const INCOMPATIBILITY_PAIRS: any[] = [];
const PREGNANCY_CONTRAINDICATIONS: any[] = [];

// ============================================
// 类型定义
// ============================================
export interface SafetyCheck {
  passed: boolean;
  riskLevel: '低' | '中' | '高' | '极高';
  violations: SafetyViolation[];
  recommendations: string[];
}

export interface SafetyViolation {
  type: 'input' | 'output' | 'knowledge' | 'dosage' | 'incompatibility' | 'pregnancy' | 'toxicity';
  severity: '轻微' | '中度' | '严重' | '危险';
  message: string;
  details?: any;
}

// ============================================
// 护栏 1：输入过滤（Input Filter）
// ============================================
export class InputFilter {
  /**
   * 敏感词列表
   */
  private static readonly SENSITIVE_WORDS = [
    '自杀',
    '自残',
    '杀人',
    '伤害',
    '死亡',
    '毒药',
    '毒死',
    '毒害',
    '谋杀',
    '安乐死',
    '堕胎',
    '流产',
    '致幻',
    '麻醉',
    '毒品',
    '海洛因',
    '冰毒',
    '大麻',
    '摇头丸',
    '吗啡',
  ];

  /**
   * 医疗意图识别（非医疗咨询）
   */
  private static readonly NON_MEDICAL_INTENTS = [
    '如何杀人',
    '如何自杀',
    '如何制造毒品',
    '如何制造毒药',
    '如何致幻',
    '如何麻醉',
  ];

  /**
   * 检查输入是否安全
   */
  static async checkInputSafety(input: string): Promise<SafetyCheck> {
    const violations: SafetyViolation[] = [];

    // 检查敏感词
    for (const sensitiveWord of this.SENSITIVE_WORDS) {
      if (input.includes(sensitiveWord)) {
        violations.push({
          type: 'input',
          severity: '严重',
          message: `输入包含敏感词："${sensitiveWord}"`,
          details: { sensitiveWord },
        });
      }
    }

    // 检查非医疗意图
    for (const nonMedicalIntent of this.NON_MEDICAL_INTENTS) {
      if (input.includes(nonMedicalIntent)) {
        violations.push({
          type: 'input',
          severity: '危险',
          message: `检测到非医疗咨询意图："${nonMedicalIntent}"`,
          details: { intent: nonMedicalIntent },
        });
      }
    }

    // 检查是否为紧急情况
    if (this.isEmergencyInput(input)) {
      violations.push({
        type: 'input',
        severity: '严重',
        message: '检测到紧急情况，请立即就医或拨打急救电话',
        details: { isEmergency: true },
      });
    }

    return {
      passed: violations.length === 0,
      riskLevel: this.calculateRiskLevel(violations),
      violations,
      recommendations: this.getRecommendations(violations),
    };
  }

  /**
   * 检查是否为紧急情况
   */
  private static isEmergencyInput(input: string): boolean {
    const emergencyKeywords = [
      '呼吸困难',
      '意识模糊',
      '昏迷',
      '大出血',
      '剧烈疼痛',
      '胸痛',
      '心绞痛',
      '心肌梗死',
      '脑卒中',
      '中风',
      '癫痫',
      '抽搐',
      '休克',
      '高热不退',
      '超过40度',
      '血压过高',
      '血压过低',
      '心跳骤停',
    ];

    return emergencyKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * 计算风险等级
   */
  private static calculateRiskLevel(violations: SafetyViolation[]): '低' | '中' | '高' | '极高' {
    if (violations.some(v => v.severity === '危险')) return '极高';
    if (violations.some(v => v.severity === '严重')) return '高';
    if (violations.some(v => v.severity === '中度')) return '中';
    return '低';
  }

  /**
   * 获取建议
   */
  private static getRecommendations(violations: SafetyViolation[]): string[] {
    const recommendations: string[] = [];

    for (const violation of violations) {
      if (violation.type === 'input' && violation.severity === '危险') {
        recommendations.push('⚠️ 拒绝回答此问题，违反使用政策');
        recommendations.push('📞 请拨打心理健康热线：400-161-9995');
      } else if (violation.details?.isEmergency) {
        recommendations.push('🚨 请立即拨打 120 急救电话');
        recommendations.push('🏥 立即前往就近医院急诊科');
      } else {
        recommendations.push('⚠️ 请使用规范的医疗咨询语言');
      }
    }

    return recommendations;
  }
}

// ============================================
// 护栏 2：输出审查（Output Review）
// ============================================
export class OutputReview {
  /**
   * 检查输出是否安全
   */
  static async checkOutputSafety(output: any): Promise<SafetyCheck> {
    const violations: SafetyViolation[] = [];

    // 检查是否包含非经方药物
    if (output.formula?.herbs) {
      for (const herb of output.formula.herbs) {
        if (!this.isClassicHerb(herb.name)) {
          violations.push({
            type: 'output',
            severity: '严重',
            message: `输出包含非经方药物："${herb.name}"`,
            details: { herbName: herb.name },
          });
        }
      }
    }

    // 检查是否包含超纲处方
    if (output.formula?.herbs && output.formula?.herbs.length > 15) {
      violations.push({
        type: 'output',
        severity: '中度',
        message: `处方药物数量过多（${output.formula.herbs.length}味），超过经方常规范围`,
        details: { herbCount: output.formula.herbs.length },
      });
    }

    // 检查是否包含自行组合的方剂
    if (output.formula?.name && !this.isClassicFormula(output.formula.name)) {
      violations.push({
        type: 'output',
        severity: '严重',
        message: `输出包含非经典方剂："${output.formula.name}"`,
        details: { formulaName: output.formula.name },
      });
    }

    // 检查剂量是否超限
    if (output.formula?.herbs) {
      for (const herb of output.formula.herbs) {
        const dosageViolation = this.checkDosageLimit(herb.name, herb.dosage);
        if (dosageViolation) {
          violations.push(dosageViolation);
        }
      }
    }

    // 检查是否包含西药
    if (output.formula?.herbs) {
      for (const herb of output.formula.herbs) {
        if (this.isWesternMedicine(herb.name)) {
          violations.push({
            type: 'output',
            severity: '严重',
            message: `输出包含西药："${herb.name}"，超出经方范畴`,
            details: { herbName: herb.name },
          });
        }
      }
    }

    return {
      passed: violations.length === 0,
      riskLevel: this.calculateRiskLevel(violations),
      violations,
      recommendations: this.getRecommendations(violations),
    };
  }

  /**
   * 检查是否为经方药物
   */
  private static isClassicHerb(herbName: string): boolean {
    return Object.keys(HERB_DATABASE).some(
      key =>
        HERB_DATABASE[key].name === herbName ||
        HERB_DATABASE[key].aliases.some(alias => alias === herbName)
    );
  }

  /**
   * 检查是否为经典方剂
   */
  private static isClassicFormula(formulaName: string): boolean {
    const classicFormulas = [
      '桂枝汤',
      '麻黄汤',
      '大青龙汤',
      '小青龙汤',
      '葛根汤',
      '小柴胡汤',
      '大柴胡汤',
      '白虎汤',
      '白虎加人参汤',
      '大承气汤',
      '小承气汤',
      '调胃承气汤',
      '理中汤',
      '附子理中丸',
      '四逆汤',
      '真武汤',
      '半夏泻心汤',
      '生姜泻心汤',
      '甘草泻心汤',
      '乌梅丸',
      '黄连阿胶汤',
    ];

    return classicFormulas.some(formula => formulaName.includes(formula));
  }

  /**
   * 检查剂量是否超限
   */
  private static checkDosageLimit(herbName: string, dosage: string): SafetyViolation | null {
    const herb = (Object.values(HERB_DATABASE) as any[]).find(
      (h: any) => h.name === herbName || h.aliases?.some((alias: string) => alias === herbName)
    );

    if (!herb || !herb.toxicity?.isToxic) return null;

    // 提取剂量数值（简单实现）
    const dosageMatch = dosage.match(/(\d+)/);
    if (!dosageMatch) return null;

    const dosageValue = parseInt(dosageMatch[1], 10);

    if (dosageValue > (herb.dosage?.max || 0)) {
      return {
        type: 'dosage',
        severity: '严重',
        message: `${herbName}剂量超限：${dosageValue}g > ${herb.dosage?.max}g`,
        details: {
          herbName,
          dosage: dosageValue,
          maxDosage: herb.dosage?.max,
          toxicDosage: herb.dosage?.maxToxic,
        },
      };
    }

    return null;
  }

  /**
   * 检查是否为西药
   */
  private static isWesternMedicine(herbName: string): boolean {
    const westernMedicines = [
      '阿司匹林',
      '布洛芬',
      '对乙酰氨基酚',
      '青霉素',
      '头孢',
      '阿莫西林',
      '红霉素',
      '地塞米松',
      '强的松',
      '胰岛素',
      '二甲双胍',
    ];

    return westernMedicines.some(med => herbName.includes(med));
  }

  /**
   * 计算风险等级
   */
  private static calculateRiskLevel(violations: SafetyViolation[]): '低' | '中' | '高' | '极高' {
    if (violations.some(v => v.severity === '严重')) return '高';
    if (violations.some(v => v.severity === '中度')) return '中';
    return '低';
  }

  /**
   * 获取建议
   */
  private static getRecommendations(violations: SafetyViolation[]): string[] {
    const recommendations: string[] = [];

    for (const violation of violations) {
      if (violation.type === 'dosage') {
        recommendations.push(`⚠️ ${violation.message}`);
        recommendations.push('🔄 建议调整剂量至安全范围');
      } else if (violation.type === 'output') {
        recommendations.push(`⚠️ ${violation.message}`);
        recommendations.push('🔄 建议使用经典经方药物');
      }
    }

    return recommendations;
  }
}

// ============================================
// 护栏 3：知识锚定（Knowledge Anchoring）
// ============================================
export class KnowledgeAnchoring {
  /**
   * 检查知识是否锚定到经方知识库
   */
  static async checkKnowledgeAnchoring(output: any): Promise<SafetyCheck> {
    const violations: SafetyViolation[] = [];

    // 检查诊断是否锚定到证候
    if (output.diagnosis?.primarySyndrome) {
      const isAnchored = this.isSyndromeAnchored(output.diagnosis.primarySyndrome);
      if (!isAnchored) {
        violations.push({
          type: 'knowledge',
          severity: '中度',
          message: `诊断"${output.diagnosis.primarySyndrome}"未锚定到经方证候`,
          details: { syndrome: output.diagnosis.primarySyndrome },
        });
      }
    }

    // 检查方剂是否锚定到经方知识库
    if (output.formula?.formulaId) {
      const isAnchored = this.isFormulaAnchored(output.formula.formulaId);
      if (!isAnchored) {
        violations.push({
          type: 'knowledge',
          severity: '严重',
          message: `方剂"${output.formula.formulaId}"未锚定到经方知识库`,
          details: { formulaId: output.formula.formulaId },
        });
      }
    }

    // 检查证据是否可追溯
    if (!output.diagnosis?.classicReference) {
      violations.push({
        type: 'knowledge',
        severity: '中度',
        message: '诊断缺乏经典条文引用，证据不可追溯',
        details: { missingReference: true },
      });
    }

    return {
      passed: violations.length === 0,
      riskLevel: this.calculateRiskLevel(violations),
      violations,
      recommendations: this.getRecommendations(violations),
    };
  }

  /**
   * 检查证候是否锚定
   */
  private static isSyndromeAnchored(syndromeName: string): boolean {
    const classicSyndromes = [
      '太阳中风',
      '太阳表实',
      '阳明实证',
      '少阳火郁',
      '太阴湿盛',
      '少阴阳虚',
      '少阴阴虚',
      '厥阴病',
    ];

    return classicSyndromes.some(syndrome => syndromeName.includes(syndrome));
  }

  /**
   * 检查方剂是否锚定
   */
  private static isFormulaAnchored(formulaId: string): boolean {
    const classicFormulaIds = [
      'guizhi_tang',
      'mahuang_tang',
      'xiaochaihu_tang',
      'dachaihu_tang',
      'baihu_tang',
      'dachengqi_tang',
      'lizhong_tang',
      'sini_tang',
      'zhenwu_tang',
    ];

    return classicFormulaIds.includes(formulaId);
  }

  /**
   * 计算风险等级
   */
  private static calculateRiskLevel(violations: SafetyViolation[]): '低' | '中' | '高' | '极高' {
    if (violations.some(v => v.severity === '严重')) return '高';
    if (violations.some(v => v.severity === '中度')) return '中';
    return '低';
  }

  /**
   * 获取建议
   */
  private static getRecommendations(violations: SafetyViolation[]): string[] {
    const recommendations: string[] = [];

    for (const violation of violations) {
      if (violation.type === 'knowledge') {
        recommendations.push(`⚠️ ${violation.message}`);
        recommendations.push('🔄 建议使用经方知识库中的证候和方剂');
        recommendations.push('🔄 建议提供经典条文引用');
      }
    }

    return recommendations;
  }
}

// ============================================
// 三重安全护栏（主服务）
// ============================================
export class SafetyGuardrails {
  /**
   * 执行三重安全检查
   */
  static async performTripleSafetyCheck(input: string, output: any): Promise<{
    inputSafety: SafetyCheck;
    outputSafety: SafetyCheck;
    knowledgeAnchoring: SafetyCheck;
    overallPassed: boolean;
    overallRiskLevel: '低' | '中' | '高' | '极高';
  }> {
    // 1. 输入过滤
    const inputSafety = await InputFilter.checkInputSafety(input);

    // 2. 输出审查
    const outputSafety = await OutputReview.checkOutputSafety(output);

    // 3. 知识锚定
    const knowledgeAnchoring = await KnowledgeAnchoring.checkKnowledgeAnchoring(output);

    // 计算整体风险等级
    const overallRiskLevel = this.calculateOverallRiskLevel([
      inputSafety,
      outputSafety,
      knowledgeAnchoring,
    ]);

    // 计算是否通过
    const overallPassed =
      inputSafety.passed && outputSafety.passed && knowledgeAnchoring.passed;

    return {
      inputSafety,
      outputSafety,
      knowledgeAnchoring,
      overallPassed,
      overallRiskLevel,
    };
  }

  /**
   * 计算整体风险等级
   */
  private static calculateOverallRiskLevel(safetyChecks: SafetyCheck[]): '低' | '中' | '高' | '极高' {
    const riskLevels = safetyChecks.map(check => check.riskLevel);

    if (riskLevels.includes('极高')) return '极高';
    if (riskLevels.includes('高')) return '高';
    if (riskLevels.includes('中')) return '中';
    return '低';
  }
}
