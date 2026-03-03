import { Injectable } from '@nestjs/common'

/**
 * 方证评分接口
 */
export interface FormulaScore {
  formula: any
  similarityScore: number      // 语义相似度 (0-1)
  symptomMatchScore: number    // 症状匹配度 (0-1)
  meridianMatchScore: number   // 六经匹配度 (0-1)
  treatmentMatchScore: number  // 治法匹配度 (0-1)
  constitutionScore: number    // 体质匹配度 (0-1)
  evidenceScore: number        // 证据强度 (0-1)
  totalScore: number           // 综合评分 (0-1)
  matchReasons: string[]       // 匹配理由
  evidenceSources: string[]    // 证据来源
}

/**
 * 智能推荐引擎
 *
 * 功能：
 * 1. 多维度评分（症状、体质、证据等）
 * 2. 动态权重调整
 * 3. Top-K 排序
 */
@Injectable()
export class RecommendationEngineService {
  /**
   * 默认权重配置
   */
  private readonly defaultWeights = {
    similarityScore: 0.30,      // 语义相似度权重 30%
    symptomMatchScore: 0.25,    // 症状匹配度权重 25%
    meridianMatchScore: 0.20,   // 六经匹配度权重 20%
    treatmentMatchScore: 0.15,  // 治法匹配度权重 15%
    constitutionScore: 0.10     // 体质匹配度权重 10%
  }

  /**
   * 体质禁忌规则
   */
  private readonly constitutionContraindications = {
    阳虚: ['清热', '泻火', '凉血'],
    阴虚: ['温里', '回阳', '燥湿'],
    气虚: ['破气', '泻下', '清热'],
    血虚: ['破血', '逐瘀', '利水'],
    痰湿: ['滋腻', '收涩'],
    湿热: ['温补', '滋腻']
  }

  /**
   * 推荐方证
   *
   * @param candidates 候选方证列表
   * @param userSymptoms 用户症状
   * @param constitution 体质
   * @param options 选项（权重调整等）
   * @returns 推荐的方证列表（已排序）
   */
  async recommend(
    candidates: Array<{
      formula: any
      similarityScore: number
      ruleMatchScore: number
      knowledgeScore: number
      matchReasons: string[]
    }>,
    userSymptoms: string[],
    constitution?: string,
    options?: {
      weights?: Partial<typeof this.defaultWeights>
      topK?: number
    }
  ): Promise<FormulaScore[]> {
    try {
      console.log('[RecommendationEngine] 开始推荐方证')
      console.log(`[RecommendationEngine] 候选方证数量: ${candidates.length}`)

      // 使用自定义权重或默认权重
      const weights = { ...this.defaultWeights, ...options?.weights }

      // 对每个候选方证进行评分
      const scoredCandidates = await Promise.all(
        candidates.map((candidate) =>
          this.scoreFormula(candidate, userSymptoms, weights, constitution)
        )
      )

      // 过滤掉有体质禁忌的方证
      const filteredCandidates = scoredCandidates.filter((candidate) => {
        if (constitution && this.hasContraindication(candidate.formula, constitution)) {
          console.log(
            `[RecommendationEngine] ${candidate.formula.formula} 被排除：体质禁忌 (${constitution})`
          )
          return false
        }
        return true
      })

      console.log(`[RecommendationEngine] 过滤后方证数量: ${filteredCandidates.length}`)

      // 按综合评分排序
      filteredCandidates.sort((a, b) => b.totalScore - a.totalScore)

      // 返回 Top-K 结果
      const topK = options?.topK || 5
      const recommendations = filteredCandidates.slice(0, topK)

      console.log(
        `[RecommendationEngine] 最终推荐 ${recommendations.length} 个方证:`,
        recommendations.map((r) => `${r.formula.formula} (${(r.totalScore * 100).toFixed(0)}%)`)
      )

      return recommendations
    } catch (error) {
      console.error('[RecommendationEngine] 推荐失败:', error)
      throw new Error(`推荐失败: ${error}`)
    }
  }

  /**
   * 对单个方证进行评分
   *
   * @param candidate 候选方证
   * @param userSymptoms 用户症状
   * @param constitution 体质
   * @param weights 权重配置
   * @returns 评分结果
   */
  private async scoreFormula(
    candidate: {
      formula: any
      similarityScore: number
      ruleMatchScore: number
      knowledgeScore: number
      matchReasons: string[]
    },
    userSymptoms: string[],
    weights: any,
    constitution?: string
  ): Promise<FormulaScore> {
    const formula = candidate.formula

    // 1. 语义相似度（已由智能匹配服务计算）
    const similarityScore = candidate.similarityScore

    // 2. 症状匹配度（基于规则引擎的分数）
    const symptomMatchScore = candidate.ruleMatchScore

    // 3. 六经匹配度（基于方证的六经是否匹配）
    const meridianMatchScore = 0.8 // 假设智能匹配已经按六经筛选过

    // 4. 治法匹配度（基于知识图谱的置信度）
    const treatmentMatchScore = candidate.knowledgeScore

    // 5. 体质匹配度
    const constitutionScore = constitution ? this.calculateConstitutionScore(formula, constitution) : 0.5

    // 6. 证据强度（基于经典条文、现代研究等）
    const evidenceScore = this.calculateEvidenceScore(formula)

    // 7. 计算综合评分
    const totalScore =
      weights.similarityScore * similarityScore +
      weights.symptomMatchScore * symptomMatchScore +
      weights.meridianMatchScore * meridianMatchScore +
      weights.treatmentMatchScore * treatmentMatchScore +
      weights.constitutionScore * constitutionScore +
      (weights.evidenceScore || 0) * evidenceScore

    // 8. 生成证据来源
    const evidenceSources = this.generateEvidenceSources(formula)

    return {
      formula,
      similarityScore,
      symptomMatchScore,
      meridianMatchScore,
      treatmentMatchScore,
      constitutionScore,
      evidenceScore,
      totalScore,
      matchReasons: candidate.matchReasons,
      evidenceSources
    }
  }

  /**
   * 计算体质匹配度
   *
   * @param formula 方证
   * @param constitution 体质
   * @returns 体质匹配度 (0-1)
   */
  private calculateConstitutionScore(formula: any, constitution: string): number {
    const treatmentMethod = formula.treatment_method || ''

    // 如果有体质禁忌，返回 0
    if (this.hasContraindication(formula, constitution)) {
      return 0
    }

    // 根据体质和治法匹配度
    const constitutionTreatmentMap: Record<string, string[]> = {
      阳虚: ['温里', '回阳', '补火'],
      阴虚: ['清热', '养阴', '滋阴'],
      气虚: ['补益', '益气', '健脾'],
      血虚: ['养血', '补血', '和血'],
      痰湿: ['化饮', '燥湿', '祛痰'],
      湿热: ['清热', '燥湿', '利湿']
    }

    const suitableTreatments = constitutionTreatmentMap[constitution] || []

    for (const suitable of suitableTreatments) {
      if (treatmentMethod.includes(suitable)) {
        return 0.9
      }
    }

    return 0.5 // 默认中等匹配度
  }

  /**
   * 检查是否有体质禁忌
   *
   * @param formula 方证
   * @param constitution 体质
   * @returns 是否有禁忌
   */
  private hasContraindication(formula: any, constitution: string): boolean {
    const treatmentMethod = formula.treatment_method || ''
    const contraindications = this.constitutionContraindications[constitution] || []

    for (const contraindication of contraindications) {
      if (treatmentMethod.includes(contraindication)) {
        return true
      }
    }

    return false
  }

  /**
   * 计算证据强度
   *
   * @param formula 方证
   * @returns 证据强度 (0-1)
   */
  private calculateEvidenceScore(formula: any): number {
    let score = 0

    // 有经典条文
    if (formula.original_text && formula.original_text.length > 10) {
      score += 0.4
    }

    // 有明确的病机说明
    if (formula.mechanism && formula.mechanism.length > 20) {
      score += 0.2
    }

    // 有完整的组成药物
    if (formula.ingredients && formula.ingredients.length > 0) {
      score += 0.2
    }

    // 有明确的适应症
    if (formula.indications && formula.indications.length > 0) {
      score += 0.1
    }

    // 有禁忌症说明
    if (formula.contraindications && formula.contraindications.length > 0) {
      score += 0.1
    }

    return Math.min(score, 1.0)
  }

  /**
   * 生成证据来源
   *
   * @param formula 方证
   * @returns 证据来源列表
   */
  private generateEvidenceSources(formula: any): string[] {
    const sources: string[] = []

    // 经典条文来源
    if (formula.source && formula.chapter) {
      sources.push(`《${formula.source}》${formula.chapter}`)
    }

    // 现代研究（未来可添加）
    // if (formula.modern_research && formula.modern_research.length > 0) {
    //   sources.push('现代临床研究')
    // }

    return sources
  }

  /**
   * 动态调整权重
   *
   * 根据症状严重度、体质明确度等动态调整权重
   *
   * @param userSymptoms 用户症状
   * @param constitution 体质
   * @param symptomSeverity 症状严重度
   * @returns 调整后的权重
   */
  adjustWeights(
    userSymptoms: string[],
    constitution?: string,
    symptomSeverity?: 'mild' | 'moderate' | 'severe'
  ): typeof this.defaultWeights {
    const weights = { ...this.defaultWeights }

    // 如果症状严重，提高症状匹配度权重
    if (symptomSeverity === 'severe') {
      weights.symptomMatchScore = 0.35
      weights.meridianMatchScore = 0.20
      weights.treatmentMatchScore = 0.15
      weights.similarityScore = 0.20
      weights.constitutionScore = 0.10
    }

    // 如果体质明确，提高体质匹配度权重
    if (constitution) {
      weights.constitutionScore = 0.15
      weights.symptomMatchScore = 0.25
      weights.meridianMatchScore = 0.20
      weights.treatmentMatchScore = 0.15
      weights.similarityScore = 0.25
    }

    return weights
  }

  /**
   * 生成推荐理由
   *
   * @param scoredFormula 评分后的方证
   * @returns 推荐理由（自然语言）
   */
  generateRecommendationReason(scoredFormula: FormulaScore): string {
    const { formula, totalScore, matchReasons, evidenceSources } = scoredFormula

    let reason = `推荐方剂：${formula.formula}\n\n`

    // 添加推荐理由
    if (matchReasons.length > 0) {
      reason += '推荐理由：\n'
      matchReasons.forEach((r, i) => {
        reason += `${i + 1}. ${r}\n`
      })
      reason += '\n'
    }

    // 添加治法说明
    if (formula.treatment_method) {
      reason += `治法：${formula.treatment_method}\n\n`
    }

    // 添加主症
    if (formula.key_symptoms && formula.key_symptoms.length > 0) {
      reason += `主症：${formula.key_symptoms.join('、')}\n\n`
    }

    // 添加证据来源
    if (evidenceSources.length > 0) {
      reason += '证据来源：\n'
      evidenceSources.forEach((source) => {
        reason += `- ${source}\n`
      })
      reason += '\n'
    }

    // 添加推荐置信度
    reason += `推荐置信度：${(totalScore * 100).toFixed(0)}%`

    return reason
  }
}
