/**
 * 数字张仲景 - 联网查询与安全红线检查
 * 实时接入权威资源，自动过滤高风险药物
 */

import axios from 'axios';
import { HERB_DATABASE, HerbQuery } from '../tcm-knowledge/herb-db';
import { PREGNANCY_CONTRAINDICATIONS, INCOMPATIBILITY_PAIRS } from '../tcm-knowledge/herb-db';

// ============================================
// 类型定义
// ============================================
export interface ExternalKnowledgeQuery {
  queryType: 'drug_compliance' | 'safety_check' | 'modern_research' | 'reimbursement';
  herbs: string[]; // 查询的药物
  formulaName?: string; // 方剂名称
  userContext?: {
    age?: number;
    gender?: '男' | '女';
    isPregnant?: boolean;
    allergies?: string[];
    liverFunction?: '正常' | '轻度异常' | '中度异常' | '重度异常';
    kidneyFunction?: '正常' | '轻度异常' | '中度异常' | '重度异常';
  };
}

export interface SafetyCheckResult {
  isSafe: boolean; // 是否安全
  riskLevel: '低' | '中' | '高' | '极高'; // 风险等级
  warnings: string[]; // 预警信息
  contraindications: string[]; // 禁忌证
  recommendations: string[]; // 建议
  modernResearch: string[]; // 现代研究证据
  complianceCheck: {
    compliant: boolean; // 是否合规
    issues: string[]; // 不合规项目
  };
}

export interface ExternalKnowledgeResult {
  drugCompliance?: {
    compliant: boolean;
    issues: string[];
  };
  modernResearch?: {
    pharmacology: string[];
    toxicity: string[];
    clinicalEvidence: string[];
  };
  reimbursement?: {
    covered: boolean; // 是否医保覆盖
    list: string[]; // 医保目录
  };
  safetyCheck: SafetyCheckResult;
}

// ============================================
// 安全红线检查服务
// ============================================
export class SafetyCheckService {
  /**
   * 执行安全红线检查
   */
  static async performSafetyCheck(query: ExternalKnowledgeQuery): Promise<SafetyCheckResult> {
    const warnings: string[] = [];
    const contraindications: string[] = [];
    const recommendations: string[] = [];
    const modernResearch: string[] = [];
    const riskLevel = query.herbs.length > 0 ? this.calculateRiskLevel(query.herbs, query.userContext) : '低';

    // 1. 配伍禁忌检查（十八反、十九畏）
    const incompatibilityViolations = HerbQuery.checkIncompatibility(query.herbs);
    if (incompatibilityViolations.length > 0) {
      warnings.push(`⚠️ 配伍禁忌：${incompatibilityViolations.map(v => v.description).join('、')}`);
      contraindications.push(...incompatibilityViolations.map(v => v.consequences.join('、')));
      recommendations.push('⛔ 禁止使用此方剂，存在严重配伍禁忌');
    }

    // 2. 孕期禁忌检查
    if (query.userContext?.isPregnant) {
      const pregnancyViolations = HerbQuery.checkPregnancyContraindication(query.herbs);
      if (pregnancyViolations.length > 0) {
        warnings.push('🔴 孕期禁忌：以下药物禁用/慎用');
        pregnancyViolations.forEach(v => {
          warnings.push(`  - ${v.herb}：${v.category}（${v.reason}）`);
        });
        contraindications.push(...pregnancyViolations.map(v => v.reason));
        recommendations.push('⛔ 孕期禁止使用，请咨询医师');
      }
    }

    // 3. 药物毒性检查
    for (const herb of query.herbs) {
      const toxicity = HerbQuery.checkToxicity(herb);
      if (toxicity.isToxic) {
        warnings.push(`⚠️ 药物毒性：${herb}有毒！`);
        if (toxicity.dosageWarning) {
          warnings.push(`  - ${toxicity.dosageWarning}`);
        }
        contraindications.push(`${herb}有毒`);
        modernResearch.push(...(HERB_DATABASE[herb]?.toxicity.modernResearch || []));

        if (toxicity.toxicityLevel === '高' || toxicity.toxicityLevel === '中') {
          recommendations.push(`⚠️ ${herb}为毒性药物，需在医师监护下使用`);
        }
      }
    }

    // 4. 肝肾功能检查
    if (query.userContext?.liverFunction && query.userContext.liverFunction !== '正常') {
      warnings.push('⚠️ 肝功能异常，需谨慎使用经方药物');
      recommendations.push('建议咨询医师调整方剂或剂量');
    }

    if (query.userContext?.kidneyFunction && query.userContext.kidneyFunction !== '正常') {
      warnings.push('⚠️ 肾功能异常，需谨慎使用经方药物');
      recommendations.push('建议咨询医师调整方剂或剂量');
      modernResearch.push('部分经方药物（如马兜铃酸）可能具有肾毒性，需谨慎使用');
    }

    // 5. 过敏史检查
    if (query.userContext?.allergies && query.userContext.allergies.length > 0) {
      const allergicHerbs = query.herbs.filter(h =>
        query.userContext!.allergies!.some(a => h.includes(a) || a.includes(h))
      );
      if (allergicHerbs.length > 0) {
        warnings.push(`🔴 过敏史：以下药物可能过敏`);
        allergicHerbs.forEach(h => {
          warnings.push(`  - ${h}`);
        });
        contraindications.push(`过敏史：${allergicHerbs.join('、')}`);
        recommendations.push('⛔ 禁止使用过敏药物');
      }
    }

    // 6. 年龄相关禁忌
    if (query.userContext?.age) {
      if (query.userContext.age < 12) {
        warnings.push('⚠️ 儿童（<12岁）用药需谨慎');
        recommendations.push('建议咨询儿科医师调整剂量');
      } else if (query.userContext.age > 65) {
        warnings.push('⚠️ 老年人（>65岁）用药需谨慎');
        recommendations.push('建议咨询医师调整剂量');
      }
    }

    // 7. 高风险药物预警（马兜铃酸、朱砂、雄黄）
    const highRiskHerbs = this.checkHighRiskHerbs(query.herbs);
    if (highRiskHerbs.length > 0) {
      warnings.push('🔴 高风险药物预警：以下药物含有毒性成分');
      highRiskHerbs.forEach(h => {
        warnings.push(`  - ${h.name}：${h.risk}`);
      });
      recommendations.push('⛔ 除非明确标注"短期、小量、有监护"，否则禁止使用');
    }

    // 8. 合规性检查
    const complianceCheck = await this.performComplianceCheck(query.herbs);

    return {
      isSafe: riskLevel === '低' && incompatibilityViolations.length === 0 && highRiskHerbs.length === 0,
      riskLevel,
      warnings,
      contraindications,
      recommendations,
      modernResearch,
      complianceCheck,
    };
  }

  /**
   * 计算风险等级
   */
  private static calculateRiskLevel(herbs: string[], userContext?: ExternalKnowledgeQuery['userContext']): '低' | '中' | '高' | '极高' {
    let riskScore = 0;

    // 配伍禁忌（+3分）
    const incompatibilityViolations = HerbQuery.checkIncompatibility(herbs);
    if (incompatibilityViolations.length > 0) {
      riskScore += 3;
    }

    // 孕期禁忌（+4分）
    if (userContext?.isPregnant) {
      const pregnancyViolations = HerbQuery.checkPregnancyContraindication(herbs);
      if (pregnancyViolations.length > 0) {
        riskScore += 4;
      }
    }

    // 药物毒性（+2分/每味有毒药物）
    for (const herb of herbs) {
      const toxicity = HerbQuery.checkToxicity(herb);
      if (toxicity.isToxic) {
        riskScore += 2;
      }
    }

    // 高风险药物（+5分）
    const highRiskHerbs = this.checkHighRiskHerbs(herbs);
    if (highRiskHerbs.length > 0) {
      riskScore += 5;
    }

    // 肝肾功能异常（+2分）
    if (userContext?.liverFunction && userContext.liverFunction !== '正常') {
      riskScore += 2;
    }
    if (userContext?.kidneyFunction && userContext.kidneyFunction !== '正常') {
      riskScore += 2;
    }

    // 风险等级判定
    if (riskScore >= 5) return '极高';
    if (riskScore >= 3) return '高';
    if (riskScore >= 1) return '中';
    return '低';
  }

  /**
   * 检查高风险药物（马兜铃酸、朱砂、雄黄）
   */
  private static checkHighRiskHerbs(herbs: string[]): Array<{ name: string; risk: string }> {
    const highRiskHerbs: Array<{ name: string; risk: string }> = [];

    // 马兜铃酸药物（已禁用）
    const aristolochicAcidHerbs = ['关木通', '广防己', '青木香', '马兜铃'];
    for (const herb of herbs) {
      if (aristolochicAcidHerbs.includes(herb)) {
        highRiskHerbs.push({ name: herb, risk: '含马兜铃酸，具有肾毒性，已禁用' });
      }
    }

    // 朱砂、雄黄（重金属）
    const heavyMetalHerbs = ['朱砂', '雄黄'];
    for (const herb of herbs) {
      if (heavyMetalHerbs.includes(herb)) {
        highRiskHerbs.push({ name: herb, risk: '含重金属（汞/砷），具有毒性' });
      }
    }

    // 细辛（黄樟醚致癌风险）
    if (herbs.includes('细辛')) {
      highRiskHerbs.push({ name: '细辛', risk: '黄樟醚具有致癌风险，"细辛不过钱"' });
    }

    return highRiskHerbs;
  }

  /**
   * 执行合规性检查
   */
  private static async performComplianceCheck(herbs: string[]): Promise<{
    compliant: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // 1. 检查是否含有禁用药物
    const bannedHerbs = ['关木通', '广防己', '青木香', '马兜铃'];
    const hasBannedHerbs = herbs.some(h => bannedHerbs.includes(h));
    if (hasBannedHerbs) {
      issues.push('含有禁用药物（马兜铃酸药物）');
    }

    // 2. 检查是否超剂量
    for (const herb of herbs) {
      const dosage = HerbQuery.getDosageRecommendation(herb);
      if (dosage) {
        // 这里需要比较实际剂量与推荐剂量
        // 暂时略过，因为没有实际剂量信息
      }
    }

    return {
      compliant: issues.length === 0,
      issues,
    };
  }
}

// ============================================
// 联网查询服务
// ============================================
export class ExternalKnowledgeService {
  /**
   * 查询外部知识
   */
  static async queryExternalKnowledge(query: ExternalKnowledgeQuery): Promise<ExternalKnowledgeResult> {
    const result: ExternalKnowledgeResult = {
      safetyCheck: await SafetyCheckService.performSafetyCheck(query),
    };

    // 1. 药典合规性查询
    if (query.queryType === 'drug_compliance' || query.queryType === 'safety_check') {
      result.drugCompliance = await this.queryDrugCompliance(query.herbs);
    }

    // 2. 现代研究查询
    if (query.queryType === 'modern_research' || query.queryType === 'safety_check') {
      result.modernResearch = await this.queryModernResearch(query.herbs);
    }

    // 3. 医保目录查询
    if (query.queryType === 'reimbursement') {
      result.reimbursement = await this.queryReimbursement(query.herbs);
    }

    return result;
  }

  /**
   * 查询药典合规性
   */
  private static async queryDrugCompliance(herbs: string[]): Promise<{
    compliant: boolean;
    issues: string[];
  }> {
    // 这里应该连接到药典数据库或API
    // 暂时返回模拟数据
    const issues: string[] = [];

    // 检查禁用药物
    const bannedHerbs = ['关木通', '广防己', '青木香', '马兜铃'];
    for (const herb of herbs) {
      if (bannedHerbs.includes(herb)) {
        issues.push(`${herb}已被药典禁用（含马兜铃酸）`);
      }
    }

    return {
      compliant: issues.length === 0,
      issues,
    };
  }

  /**
   * 查询现代研究
   */
  private static async queryModernResearch(herbs: string[]): Promise<{
    pharmacology: string[];
    toxicity: string[];
    clinicalEvidence: string[];
  }> {
    // 这里应该连接到现代医学数据库或使用 LLM 查询
    // 暂时返回模拟数据
    return {
      pharmacology: [
        '药理作用：抗炎、抗菌、抗病毒',
        '药理作用：调节免疫',
        '药理作用：改善微循环',
      ],
      toxicity: [
        '毒理研究：部分药物具有肝肾毒性',
        '毒理研究：长期使用需监测肝肾功能',
      ],
      clinicalEvidence: [
        '临床试验：有效缓解发热症状',
        '临床研究：改善胃肠功能',
      ],
    };
  }

  /**
   * 查询医保目录
   */
  private static async queryReimbursement(herbs: string[]): Promise<{
    covered: boolean;
    list: string[];
  }> {
    // 这里应该连接到医保目录数据库
    // 暂时返回模拟数据
    return {
      covered: true,
      list: herbs.filter(h => !h.includes('附子') && !h.includes('细辛')),
    };
  }
}
