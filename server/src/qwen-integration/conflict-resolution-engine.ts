/**
 * 数字张仲景 - 冲突消解引擎
 * 分层可信度加权模型：经典为体，现代为用；数据库为主，联网为辅；安全为先，疗效为要
 */

// ============================================
// 类型定义
// ============================================
export interface ConflictType {
  type: string;
  description: string;
  severity: '高' | '中' | '低';
  strategy: '数据库优先' | '联网优先' | '安全优先' | '拒绝采纳' | '待审核';
}

export interface DatabaseEvidence {
  source: '经典条文' | '专家共识' | '药典标准';
  content: string;
  reference: string;
  weight: number; // 0-1
  evidenceLevel: 'A' | 'B' | 'C';
}

export interface WebEvidence {
  source: string; // 来源名称
  url?: string;
  content: string;
  isAuthoritative: boolean; // 是否为权威来源
  weight: number; // 0-1
}

export interface ConflictResolutionResult {
  conflictType: ConflictType;
  databaseEvidence: DatabaseEvidence;
  webEvidence?: WebEvidence;
  resolution: '采纳数据库' | '采纳网络' | '拒绝采纳' | '待审核' | '警告提示';
  confidence: number; // 置信度（0-1）
  reasoning: string; // 决策理由
  safetyAlert?: string; // 安全警示
  userMessage: string; // 面向用户的说明
}

export interface ConflictResolutionConfig {
  principle: string; // 核心准则
  databaseWeight: number; // 数据库权重
  webWeight: number; // 联网权重
  authoritativeSources: string[]; // 权威来源白名单
  safetyThreshold: number; // 安全阈值
  evidenceLevels: Record<string, number>; // 证据等级权重
}

// ============================================
// 冲突消解引擎
// ============================================
export class ConflictResolutionEngine {
  // 冲突类型定义
  private static readonly CONFLICT_TYPES: Record<string, ConflictType> = {
    '经典条文 vs 网络传言': {
      type: '经典条文 vs 网络传言',
      description: '数据库中的经典条文与网络传言存在差异',
      severity: '高',
      strategy: '数据库优先',
    },
    '药典剂量 vs 网红偏方': {
      type: '药典剂量 vs 网红偏方',
      description: '药典标准剂量与网红偏方剂量存在差异',
      severity: '高',
      strategy: '安全优先',
    },
    '古籍记载 vs 现代研究': {
      type: '古籍记载 vs 现代研究',
      description: '古籍记载与现代药理研究存在差异',
      severity: '中',
      strategy: '安全优先',
    },
    '专家共识 vs 个别论文': {
      type: '专家共识 vs 个别论文',
      description: '专家共识与个别论文结论存在差异',
      severity: '中',
      strategy: '数据库优先',
    },
    '地域经验 vs 通用规范': {
      type: '地域经验 vs 通用规范',
      description: '地域经验与通用规范存在差异',
      severity: '低',
      strategy: '拒绝采纳',
    },
  };

  // 配置
  private static config: ConflictResolutionConfig = {
    principle: '经典为体，现代为用；数据库为主，联网为辅；安全为先，疗效为要',
    databaseWeight: 0.8,
    webWeight: 0.2,
    authoritativeSources: ['国家药典', '中华中医药学会指南', '国家卫健委', '中国知网核心期刊'],
    safetyThreshold: 0.7,
    evidenceLevels: {
      经典条文: 1.0,
      专家共识: 0.9,
      药典标准: 0.95,
      核心期刊: 0.7,
      网络传言: 0.0,
    },
  };

  /**
   * 消解冲突
   */
  static async resolveConflict(
    conflictType: string,
    databaseEvidence: DatabaseEvidence,
    webEvidence?: WebEvidence
  ): Promise<ConflictResolutionResult> {
    const type = this.CONFLICT_TYPES[conflictType];

    if (!type) {
      throw new Error(`未知的冲突类型: ${conflictType}`);
    }

    // 根据冲突类型应用不同的消解策略
    switch (type.strategy) {
      case '数据库优先':
        return this.resolveDatabasePriority(type, databaseEvidence, webEvidence);
      case '安全优先':
        return this.resolveSafetyPriority(type, databaseEvidence, webEvidence);
      case '拒绝采纳':
        return this.resolveRejectAdoption(type, databaseEvidence, webEvidence);
      case '待审核':
        return this.resolvePendingReview(type, databaseEvidence, webEvidence);
      default:
        return this.resolveDatabasePriority(type, databaseEvidence, webEvidence);
    }
  }

  /**
   * 策略1：数据库优先
   * 适用于：经典条文 vs 网络传言、专家共识 vs 个别论文
   */
  private static async resolveDatabasePriority(
    type: ConflictType,
    databaseEvidence: DatabaseEvidence,
    webEvidence?: WebEvidence
  ): Promise<ConflictResolutionResult> {
    // 检查联网证据是否为权威来源
    const isWebAuthoritative = webEvidence?.isAuthoritative || false;

    // 计算综合得分
    let combinedScore = this.config.databaseWeight * databaseEvidence.weight;

    if (webEvidence && isWebAuthoritative) {
      combinedScore += this.config.webWeight * webEvidence.weight;
    }

    const result: ConflictResolutionResult = {
      conflictType: type,
      databaseEvidence,
      webEvidence,
      resolution: '采纳数据库',
      confidence: databaseEvidence.weight,
      reasoning: `根据"${type.type}"冲突类型，依据核心准则"${this.config.principle}"，优先采纳数据库证据。`,
      userMessage: `依据${databaseEvidence.reference}，${databaseEvidence.content.substring(0, 50)}...`,
    };

    // 如果联网证据来自权威来源，可以记录但仍然优先数据库
    if (webEvidence && isWebAuthoritative) {
      result.reasoning += ` 虽然联网来源"${webEvidence.source}"提供了参考，但数据库证据权重更高。`;
    }

    return result;
  }

  /**
   * 策略2：安全优先
   * 适用于：药典剂量 vs 网红偏方、古籍记载 vs 现代研究
   */
  private static async resolveSafetyPriority(
    type: ConflictType,
    databaseEvidence: DatabaseEvidence,
    webEvidence?: WebEvidence
  ): Promise<ConflictResolutionResult> {
    // 提取数据库证据中的安全信息
    const isSafetyRelated = databaseEvidence.content.includes('毒性') ||
                          databaseEvidence.content.includes('禁忌') ||
                          databaseEvidence.content.includes('剂量');

    const result: ConflictResolutionResult = {
      conflictType: type,
      databaseEvidence,
      webEvidence,
      resolution: '采纳数据库',
      confidence: databaseEvidence.weight,
      reasoning: `根据"${type.type}"冲突类型，依据核心准则"安全为先"，优先采纳数据库证据以确保用药安全。`,
      safetyAlert: '⚠️ 用药安全第一，请勿自行调整剂量或更换药物。',
      userMessage: `依据${databaseEvidence.reference}，${databaseEvidence.content.substring(0, 50)}...`,
    };

    // 特殊处理：古籍记载 vs 现代研究
    if (type.type === '古籍记载 vs 现代研究') {
      if (webEvidence?.isAuthoritative) {
        result.reasoning = `根据"${type.type}"冲突类型，依据核心准则"继承不泥古"，现代药理研究证实古籍记载存在安全隐患，优先采纳现代研究。`;
        result.resolution = '采纳网络';
        result.confidence = webEvidence.weight;
        result.safetyAlert = '🔴 古籍记载与现代研究存在冲突，现代药理证实存在安全隐患，请勿按照古籍记载使用。';
        result.userMessage = `依据${webEvidence.source}，${webEvidence.content.substring(0, 50)}...`;
      }
    }

    return result;
  }

  /**
   * 策略3：拒绝采纳
   * 适用于：地域经验 vs 通用规范
   */
  private static async resolveRejectAdoption(
    type: ConflictType,
    databaseEvidence: DatabaseEvidence,
    webEvidence?: WebEvidence
  ): Promise<ConflictResolutionResult> {
    return {
      conflictType: type,
      databaseEvidence,
      webEvidence,
      resolution: '拒绝采纳',
      confidence: 0.95,
      reasoning: `根据"${type.type}"冲突类型，依据核心准则"保障普适安全性"，拒绝采纳地域经验，默认使用通用规范。`,
      safetyAlert: '⚠️ 地域经验仅供参考，不可作为普适标准。如需使用，请咨询当地医师并做好风险评估。',
      userMessage: `依据${databaseEvidence.reference}，${databaseEvidence.content.substring(0, 50)}...`,
    };
  }

  /**
   * 策略4：待审核
   * 适用于：复杂冲突、证据不充分的情况
   */
  private static async resolvePendingReview(
    type: ConflictType,
    databaseEvidence: DatabaseEvidence,
    webEvidence?: WebEvidence
  ): Promise<ConflictResolutionResult> {
    return {
      conflictType: type,
      databaseEvidence,
      webEvidence,
      resolution: '待审核',
      confidence: 0.5,
      reasoning: `根据"${type.type}"冲突类型，证据不充分或存在争议，需要专家审核后才能确定采纳方案。`,
      safetyAlert: '⚠️ 存在争议，建议咨询专业医师后决定。',
      userMessage: `存在争议：${databaseEvidence.content.substring(0, 50)}...`,
    };
  }

  /**
   * 计算综合得分（分层可信度加权模型）
   */
  static calculateCombinedScore(
    databaseEvidence: DatabaseEvidence,
    webEvidence?: WebEvidence
  ): number {
    // 数据库证据权重 = 0.8（经典+专家共识）
    // 联网证据权重 = 0.2（仅限权威来源：药典、卫健委、核心期刊）
    let combinedScore = this.config.databaseWeight * databaseEvidence.weight;

    if (webEvidence && webEvidence.isAuthoritative) {
      combinedScore += this.config.webWeight * webEvidence.weight;
    }

    return combinedScore;
  }

  /**
   * 检查是否为权威来源
   */
  static isAuthoritativeSource(source: string): boolean {
    return this.config.authoritativeSources.some(authoritative =>
      source.includes(authoritative)
    );
  }

  /**
   * 获取证据等级权重
   */
  static getEvidenceLevelWeight(evidenceType: string): number {
    return this.config.evidenceLevels[evidenceType] || 0.5;
  }

  /**
   * 生成冲突消解报告（面向患者）
   */
  static generateConflictReportForPatient(result: ConflictResolutionResult): {
    title: string;
    explanation: string;
    source: string;
    confidence: string;
    safetyAlert?: string;
  } {
    return {
      title: `${result.conflictType.type}冲突处理`,
      explanation: result.reasoning,
      source: result.resolution === '采纳数据库'
        ? result.databaseEvidence.reference
        : result.webEvidence?.source || '未知来源',
      confidence: `${(result.confidence * 100).toFixed(0)}%`,
      safetyAlert: result.safetyAlert,
    };
  }
}
