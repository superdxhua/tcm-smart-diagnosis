import { Injectable } from '@nestjs/common'
import { FormulaScore } from './recommendation-engine.service'

/**
 * 匹配理由接口
 */
export interface MatchReason {
  type: '主症匹配' | '病机吻合' | '治法对应' | '体质适配' | '证据支持'
  content: string
  evidence: string
  confidence: number
}

/**
 * 智能建议接口（双通道输出）
 */
export interface SmartRecommendation {
  // 用户通道：自然语言解释
  userChannel: {
    summary: string
    reasons: string[]
    advice: string[]
    warnings: string[]
  }

  // 系统通道：结构化数据
  systemChannel: {
    formula: string
    meridian: string
    syndrome: string
    treatmentMethod: string
    ingredients: string[]
    dosage: string
    instructions: string
    evidenceSources: string[]
    confidence: number
  }
}

/**
 * 证据溯源服务
 *
 * 功能：
 * 1. 生成详细的匹配理由
 * 2. 提取证据来源
 * 3. 构建可解释的推荐逻辑
 * 4. 生成自然语言解释和结构化方案
 */
@Injectable()
export class EvidenceTraceService {
  /**
   * 生成详细的匹配理由
   *
   * @param scoredFormula 评分后的方证
   * @param userSymptoms 用户症状
   * @param meridianSyndrome 六经证候
   * @returns 匹配理由列表
   */
  generateMatchReasons(
    scoredFormula: FormulaScore,
    userSymptoms: string[],
    meridianSyndrome: { meridian: string; syndrome: string }
  ): MatchReason[] {
    const reasons: MatchReason[] = []
    const formula = scoredFormula.formula

    // 1. 主症匹配理由
    if (scoredFormula.symptomMatchScore > 0.5) {
      const matchedSymptoms = this.getMatchedSymptoms(userSymptoms, formula.key_symptoms)
      if (matchedSymptoms.length > 0) {
        reasons.push({
          type: '主症匹配',
          content: `您的症状"${matchedSymptoms.join('、')}"与${formula.formula}的主症"${formula.key_symptoms.join('、')}"相匹配`,
          evidence: this.extractSymptomEvidence(formula),
          confidence: scoredFormula.symptomMatchScore
        })
      }
    }

    // 2. 病机吻合理由
    if (formula.mechanism && scoredFormula.meridianMatchScore > 0.5) {
      reasons.push({
        type: '病机吻合',
        content: `${formula.mechanism}`,
        evidence: this.extractMechanismEvidence(formula),
        confidence: scoredFormula.meridianMatchScore
      })
    }

    // 3. 治法对应理由
    if (formula.treatment_method && scoredFormula.treatmentMatchScore > 0.5) {
      reasons.push({
        type: '治法对应',
        content: `治法"${formula.treatment_method}"符合${meridianSyndrome.syndrome}的辨证`,
        evidence: this.extractTreatmentEvidence(formula),
        confidence: scoredFormula.treatmentMatchScore
      })
    }

    // 4. 体质适配理由
    if (scoredFormula.constitutionScore > 0.7) {
      reasons.push({
        type: '体质适配',
        content: `该方剂的治法适合您的体质特点`,
        evidence: this.extractConstitutionEvidence(formula),
        confidence: scoredFormula.constitutionScore
      })
    }

    // 5. 证据支持理由
    if (scoredFormula.evidenceScore > 0.5) {
      reasons.push({
        type: '证据支持',
        content: `有经典条文和临床经验支持`,
        evidence: this.extractClassicEvidence(formula),
        confidence: scoredFormula.evidenceScore
      })
    }

    return reasons
  }

  /**
   * 提取匹配的症状
   *
   * @param userSymptoms 用户症状
   * @param keySymptoms 方证主症
   * @returns 匹配的症状列表
   */
  private getMatchedSymptoms(userSymptoms: string[], keySymptoms: string[]): string[] {
    const matched: string[] = []

    for (const userSymptom of userSymptoms) {
      for (const keySymptom of keySymptoms) {
        // 精确匹配或包含匹配
        if (userSymptom === keySymptom || userSymptom.includes(keySymptom) || keySymptom.includes(userSymptom)) {
          if (!matched.includes(userSymptom)) {
            matched.push(userSymptom)
          }
          break
        }
      }
    }

    return matched
  }

  /**
   * 提取症状证据
   *
   * @param formula 方证
   * @returns 证据文本
   */
  private extractSymptomEvidence(formula: any): string {
    if (formula.original_text) {
      // 从经典条文中提取
      const match = formula.original_text.match(/[^。]+(?:头痛|发热|汗出|恶风|恶寒|脉浮|脉紧)[^。]*/)
      return match ? match[0] : formula.original_text
    }
    return '见经典条文'
  }

  /**
   * 提取病机证据
   *
   * @param formula 方证
   * @returns 证据文本
   */
  private extractMechanismEvidence(formula: any): string {
    if (formula.mechanism) {
      return formula.mechanism
    }
    return ''
  }

  /**
   * 提取治法证据
   *
   * @param formula 方证
   * @returns 证据文本
   */
  private extractTreatmentEvidence(formula: any): string {
    if (formula.treatment_method) {
      return `治法：${formula.treatment_method}`
    }
    return ''
  }

  /**
   * 提取体质证据
   *
   * @param formula 方证
   * @returns 证据文本
   */
  private extractConstitutionEvidence(formula: any): string {
    // 可以从方剂的适应症中提取体质相关信息
    if (formula.indications && formula.indications.length > 0) {
      return formula.indications.join('；')
    }
    return ''
  }

  /**
   * 提取经典证据
   *
   * @param formula 方证
   * @returns 证据文本
   */
  private extractClassicEvidence(formula: any): string {
    const evidences: string[] = []

    if (formula.source && formula.chapter) {
      evidences.push(`《${formula.source}》${formula.chapter}`)
    }

    if (formula.original_text) {
      evidences.push(`原文：${formula.original_text}`)
    }

    return evidences.join('\n')
  }

  /**
   * 生成智能建议（双通道输出）
   *
   * @param scoredFormula 评分后的方证
   * @param matchReasons 匹配理由
   * @param userSymptoms 用户症状
   * @param constitution 体质
   * @returns 智能建议
   */
  generateSmartRecommendation(
    scoredFormula: FormulaScore,
    matchReasons: MatchReason[],
    userSymptoms: string[],
    constitution?: string
  ): SmartRecommendation {
    const formula = scoredFormula.formula

    // 用户通道：自然语言解释
    const userChannel = {
      summary: this.generateSummary(formula, scoredFormula.totalScore),
      reasons: this.generateReasonsText(matchReasons),
      advice: this.generateAdvice(formula, scoredFormula),
      warnings: this.generateWarnings(formula, constitution)
    }

    // 系统通道：结构化数据
    const systemChannel = {
      formula: formula.formula,
      meridian: formula.meridian,
      syndrome: `${formula.meridian}证候`,
      treatmentMethod: formula.treatment_method,
      ingredients: formula.ingredients || [],
      dosage: formula.dosage || '请遵医嘱',
      instructions: formula.instructions || '水煎服',
      evidenceSources: scoredFormula.evidenceSources,
      confidence: scoredFormula.totalScore
    }

    return { userChannel, systemChannel }
  }

  /**
   * 生成摘要
   *
   * @param formula 方证
   * @param confidence 置信度
   * @returns 摘要文本
   */
  private generateSummary(formula: any, confidence: number): string {
    const confidenceText = confidence > 0.8 ? '高度推荐' : confidence > 0.6 ? '推荐' : '可考虑'

    return `根据您的症状，${confidenceText}使用${formula.formula}（${formula.meridian}）。该方剂的主治功能为${formula.treatment_method}，适合${formula.meridian}证候。`
  }

  /**
   * 生成理由文本
   *
   * @param matchReasons 匹配理由
   * @returns 理由文本列表
   */
  private generateReasonsText(matchReasons: MatchReason[]): string[] {
    return matchReasons.map((reason) => {
      return `【${reason.type}】${reason.content}\n${reason.evidence}`
    })
  }

  /**
   * 生成使用建议
   *
   * @param formula 方证
   * @param scoredFormula 评分结果
   * @returns 建议文本列表
   */
  private generateAdvice(formula: any, scoredFormula: FormulaScore): string[] {
    const advice: string[] = []

    // 剂量建议
    if (formula.dosage) {
      advice.push(`剂量：${formula.dosage}`)
    }

    // 煎服法建议
    if (formula.instructions) {
      advice.push(`煎服法：${formula.instructions}`)
    }

    // 适应症建议
    if (formula.indications && formula.indications.length > 0) {
      advice.push(`适应症：${formula.indications.slice(0, 3).join('、')}`)
    }

    // 置信度建议
    if (scoredFormula.totalScore > 0.8) {
      advice.push('该方剂与您的症状高度匹配，建议优先考虑')
    } else if (scoredFormula.totalScore > 0.6) {
      advice.push('该方剂与您的症状较为匹配，可作为备选方案')
    } else {
      advice.push('该方剂与您的症状部分匹配，建议结合其他方案综合考虑')
    }

    return advice
  }

  /**
   * 生成注意事项
   *
   * @param formula 方证
   * @param constitution 体质
   * @returns 注意事项文本列表
   */
  private generateWarnings(formula: any, constitution?: string): string[] {
    const warnings: string[] = []

    // 禁忌症提醒
    if (formula.contraindications && formula.contraindications.length > 0) {
      warnings.push(`禁忌：${formula.contraindications.join('、')}`)
    }

    // 体质提醒
    if (constitution) {
      warnings.push(`您的体质为${constitution}，使用本方剂时请注意观察身体反应`)
    }

    // 一般提醒
    warnings.push('本建议仅供参考，具体用药请遵医嘱')
    warnings.push('如症状加重或出现新的不适，请及时就医')

    return warnings
  }

  /**
   * 生成完整的推荐报告
   *
   * @param scoredFormula 评分后的方证
   * @param matchReasons 匹配理由
   * @param userSymptoms 用户症状
   * @param constitution 体质
   * @returns 完整的推荐报告（Markdown 格式）
   */
  generateFullRecommendationReport(
    scoredFormula: FormulaScore,
    matchReasons: MatchReason[],
    userSymptoms: string[],
    constitution?: string
  ): string {
    const recommendation = this.generateSmartRecommendation(
      scoredFormula,
      matchReasons,
      userSymptoms,
      constitution
    )

    let report = '# 方剂推荐报告\n\n'

    // 摘要
    report += `## 推荐摘要\n\n${recommendation.userChannel.summary}\n\n`

    // 推荐理由
    report += '## 推荐理由\n\n'
    recommendation.userChannel.reasons.forEach((reason, index) => {
      report += `${index + 1}. ${reason}\n\n`
    })

    // 使用建议
    report += '## 使用建议\n\n'
    recommendation.userChannel.advice.forEach((advice) => {
      report += `- ${advice}\n`
    })
    report += '\n'

    // 注意事项
    report += '## 注意事项\n\n'
    recommendation.userChannel.warnings.forEach((warning) => {
      report += `- ${warning}\n`
    })
    report += '\n'

    // 方剂详情
    report += '## 方剂详情\n\n'
    report += `- **方剂名称**：${recommendation.systemChannel.formula}\n`
    report += `- **六经分类**：${recommendation.systemChannel.meridian}\n`
    report += `- **证候**：${recommendation.systemChannel.syndrome}\n`
    report += `- **治法**：${recommendation.systemChannel.treatmentMethod}\n`
    report += `- **剂量**：${recommendation.systemChannel.dosage}\n`
    report += `- **煎服法**：${recommendation.systemChannel.instructions}\n`

    if (recommendation.systemChannel.ingredients.length > 0) {
      report += `- **组成**：${recommendation.systemChannel.ingredients.join('、')}\n`
    }

    report += `\n- **推荐置信度**：${(recommendation.systemChannel.confidence * 100).toFixed(0)}%\n`

    // 证据来源
    if (recommendation.systemChannel.evidenceSources.length > 0) {
      report += '\n## 证据来源\n\n'
      recommendation.systemChannel.evidenceSources.forEach((source) => {
        report += `- ${source}\n`
      })
    }

    return report
  }
}
