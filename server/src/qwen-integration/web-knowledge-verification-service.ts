/**
 * 数字张仲景 - 联网知识验证服务
 * 权威来源白名单机制：只接受来自权威来源的信息
 */

// ============================================
// 类型定义
// ============================================
export interface AuthoritativeSource {
  name: string; // 来源名称
  category: string; // 来源类别（药典、指南、期刊、政府机构）
  url?: string; // 官方网址
  description: string; // 描述
  credibility: number; // 可信度（0-1）
  lastVerified: Date; // 最后验证日期
}

export interface WebKnowledge {
  content: string; // 内容
  source: string; // 来源名称
  url?: string; // URL
  timestamp?: Date; // 时间戳
}

export interface VerificationResult {
  isAuthoritative: boolean; // 是否为权威来源
  source?: AuthoritativeSource; // 权威来源信息
  credibility: number; // 可信度（0-1）
  warnings: string[]; // 警告信息
  recommendation: '采纳' | '谨慎采纳' | '拒绝' | '待审核';
}

// ============================================
// 联网知识验证服务
// ============================================
export class WebKnowledgeVerificationService {
  // 权威来源白名单
  private static readonly AUTHORITATIVE_SOURCES: AuthoritativeSource[] = [
    // 国家药典
    {
      name: '国家药典',
      category: '药典',
      url: 'https://www.chp.org.cn',
      description: '中华人民共和国药典',
      credibility: 0.95,
      lastVerified: new Date(),
    },
    // 中医药学会指南
    {
      name: '中华中医药学会指南',
      category: '指南',
      url: 'https://www.cacm.org.cn',
      description: '中华中医药学会发布的诊疗指南',
      credibility: 0.9,
      lastVerified: new Date(),
    },
    // 国家卫健委
    {
      name: '国家卫健委',
      category: '政府机构',
      url: 'https://www.nhc.gov.cn',
      description: '国家卫生健康委员会',
      credibility: 0.95,
      lastVerified: new Date(),
    },
    // 核心期刊
    {
      name: '中国知网核心期刊',
      category: '期刊',
      url: 'https://www.cnki.net',
      description: '中国知网收录的核心期刊（中医类）',
      credibility: 0.85,
      lastVerified: new Date(),
    },
    // 万方数据库核心期刊
    {
      name: '万方数据库核心期刊',
      category: '期刊',
      url: 'https://www.wanfangdata.com.cn',
      description: '万方数据库收录的核心期刊（中医类）',
      credibility: 0.85,
      lastVerified: new Date(),
    },
    // 中医药管理局
    {
      name: '国家中医药管理局',
      category: '政府机构',
      url: 'https://www.satcm.gov.cn',
      description: '国家中医药管理局',
      credibility: 0.95,
      lastVerified: new Date(),
    },
  ];

  // 黑名单（拒绝来源）
  private static readonly BLACKLISTED_SOURCES: string[] = [
    '百度知道',
    '知乎',
    '小红书',
    '微博',
    '抖音',
    '快手',
    '微信公众号',
    '今日头条',
    '百家号',
    '网易号',
    '搜狐号',
    '腾讯号',
  ];

  /**
   * 验证知识来源
   */
  static async verifyWebKnowledge(webKnowledge: WebKnowledge): Promise<VerificationResult> {
    const warnings: string[] = [];

    // 1. 检查是否在黑名单中
    if (this.isBlacklisted(webKnowledge.source)) {
      return {
        isAuthoritative: false,
        credibility: 0,
        warnings: [`来源"${webKnowledge.source}"在黑名单中，拒绝采纳。`],
        recommendation: '拒绝',
      };
    }

    // 2. 检查是否在权威来源白名单中
    const authoritativeSource = this.findAuthoritativeSource(webKnowledge.source);

    if (!authoritativeSource) {
      return {
        isAuthoritative: false,
        credibility: 0.3,
        warnings: [`来源"${webKnowledge.source}"不在权威来源白名单中，建议谨慎采纳。`],
        recommendation: '谨慎采纳',
      };
    }

    // 3. 验证可信度
    if (authoritativeSource.credibility < 0.8) {
      warnings.push(`来源"${authoritativeSource.name}"可信度较低（${(authoritativeSource.credibility * 100).toFixed(0)}%），建议谨慎采纳。`);
      return {
        isAuthoritative: true,
        source: authoritativeSource,
        credibility: authoritativeSource.credibility,
        warnings,
        recommendation: '谨慎采纳',
      };
    }

    // 4. 高可信度来源
    return {
      isAuthoritative: true,
      source: authoritativeSource,
      credibility: authoritativeSource.credibility,
      warnings,
      recommendation: '采纳',
    };
  }

  /**
   * 检查是否在黑名单中
   */
  private static isBlacklisted(source: string): boolean {
    return this.BLACKLISTED_SOURCES.some(blacklisted =>
      source.includes(blacklisted)
    );
  }

  /**
   * 查找权威来源
   */
  private static findAuthoritativeSource(source: string): AuthoritativeSource | undefined {
    return this.AUTHORITATIVE_SOURCES.find(authoritative =>
      source.includes(authoritative.name)
    );
  }

  /**
   * 验证 URL 域名
   */
  static async verifyUrlDomain(url: string): Promise<boolean> {
    if (!url) return false;

    // 提取域名
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;

      // 检查是否在权威来源白名单中
      return this.AUTHORITATIVE_SOURCES.some(source =>
        source.url && domain.includes(new URL(source.url).hostname)
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * 添加权威来源（仅限管理员）
   */
  static async addAuthoritativeSource(source: AuthoritativeSource): Promise<boolean> {
    // 检查是否已存在
    const exists = this.AUTHORITATIVE_SOURCES.some(s =>
      s.name === source.name
    );

    if (exists) {
      return false;
    }

    // 添加到白名单
    this.AUTHORITATIVE_SOURCES.push({
      ...source,
      lastVerified: new Date(),
    });

    return true;
  }

  /**
   * 移除权威来源（仅限管理员）
   */
  static async removeAuthoritativeSource(sourceName: string): Promise<boolean> {
    const index = this.AUTHORITATIVE_SOURCES.findIndex(s =>
      s.name === sourceName
    );

    if (index === -1) {
      return false;
    }

    this.AUTHORITATIVE_SOURCES.splice(index, 1);
    return true;
  }

  /**
   * 获取权威来源列表
   */
  static getAuthoritativeSources(): AuthoritativeSource[] {
    return [...this.AUTHORITATIVE_SOURCES];
  }

  /**
   * 获取黑名单
   */
  static getBlacklistedSources(): string[] {
    return [...this.BLACKLISTED_SOURCES];
  }

  /**
   * 批量验证知识来源
   */
  static async verifyBatchWebKnowledge(
    webKnowledges: WebKnowledge[]
  ): Promise<VerificationResult[]> {
    return Promise.all(
      webKnowledges.map(knowledge => this.verifyWebKnowledge(knowledge))
    );
  }

  /**
   * 生成验证报告（面向患者）
   */
  static generateVerificationReportForPatient(
    webKnowledge: WebKnowledge,
    verificationResult: VerificationResult
  ): {
    title: string;
    source: string;
    credibility: string;
    recommendation: string;
    warnings: string[];
  } {
    return {
      title: '联网知识来源验证',
      source: verificationResult.source?.name || webKnowledge.source,
      credibility: `${(verificationResult.credibility * 100).toFixed(0)}%`,
      recommendation: verificationResult.recommendation,
      warnings: verificationResult.warnings,
    };
  }
}
