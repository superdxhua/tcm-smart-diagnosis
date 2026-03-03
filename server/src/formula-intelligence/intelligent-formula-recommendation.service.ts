import { Injectable } from '@nestjs/common'
import { IntelligentMatchingService } from './intelligent-matching.service'
import { RecommendationEngineService, FormulaScore } from './recommendation-engine.service'
import { EvidenceTraceService, MatchReason, SmartRecommendation } from './evidence-trace.service'

/**
 * 智能方证推荐请求接口
 */
export interface FormulaRecommendationRequest {
  userInput: string          // 用户症状描述
  constitution?: string      // 体质（可选）
  symptomSeverity?: 'mild' | 'moderate' | 'severe'  // 症状严重度（可选）
  topK?: number             // 返回前 K 个结果（默认 3）
}

/**
 * 智能方证推荐结果接口
 */
export interface FormulaRecommendationResponse {
  success: boolean
  recommendations: Array<{
    smartRecommendation: SmartRecommendation
    scoredFormula: FormulaScore
    matchReasons: MatchReason[]
  }>
  summary: {
    totalMatched: number
    topRecommendation: string
    confidence: number
  }
  debugInfo?: {
    userSymptoms: string[]
    meridianSyndrome: { meridian: string; syndrome: string }
    matchedCount: number
  }
}

/**
 * 智能方证推荐服务（综合服务）
 *
 * 功能：
 * 1. 整合智能匹配、推荐引擎、证据溯源等所有模块
 * 2. 提供统一的推荐入口
 * 3. 生成完整的推荐结果
 */
@Injectable()
export class IntelligentFormulaRecommendationService {
  constructor(
    private intelligentMatchingService: IntelligentMatchingService,
    private recommendationEngineService: RecommendationEngineService,
    private evidenceTraceService: EvidenceTraceService
  ) {}

  /**
   * 智能推荐方证
   *
   * @param request 推荐请求
   * @returns 推荐结果
   */
  async recommendFormulas(
    request: FormulaRecommendationRequest
  ): Promise<FormulaRecommendationResponse> {
    try {
      console.log('[IntelligentFormulaRecommendation] 开始智能推荐')
      console.log('[IntelligentFormulaRecommendation] 用户输入:', request.userInput)

      const {
        userInput,
        constitution,
        symptomSeverity = 'moderate',
        topK = 3
      } = request

      // Step 1: 提取用户症状
      const userSymptoms = await this.extractSymptoms(userInput)
      console.log('[IntelligentFormulaRecommendation] 用户症状:', userSymptoms)

      // Step 2: 推导六经证候
      const meridianSyndrome = await this.inferMeridianSyndrome(userSymptoms)
      console.log('[IntelligentFormulaRecommendation] 六经证候:', meridianSyndrome)

      // Step 3: 智能匹配（向量相似度 + 规则引擎 + 知识图谱）
      const candidates = await this.intelligentMatchingService.matchFormulas(
        userInput,
        constitution,
        topK * 2 // 获取更多候选，用于排序筛选
      )

      console.log(`[IntelligentFormulaRecommendation] 匹配到 ${candidates.length} 个候选方证`)

      if (candidates.length === 0) {
        return {
          success: false,
          recommendations: [],
          summary: {
            totalMatched: 0,
            topRecommendation: '暂无匹配方证',
            confidence: 0
          },
          debugInfo: {
            userSymptoms,
            meridianSyndrome,
            matchedCount: 0
          }
        }
      }

      // Step 4: 智能推荐排序（多维度评分 + 体质禁忌检查）
      const weights = this.recommendationEngineService.adjustWeights(
        userSymptoms,
        constitution,
        symptomSeverity
      )

      const recommendations = await this.recommendationEngineService.recommend(
        candidates,
        userSymptoms,
        constitution,
        { weights, topK }
      )

      console.log(`[IntelligentFormulaRecommendation] 推荐出 ${recommendations.length} 个方证`)

      // Step 5: 证据溯源（生成匹配理由和智能建议）
      const results = await Promise.all(
        recommendations.map(async (scoredFormula) => {
          // 生成详细的匹配理由
          const matchReasons = this.evidenceTraceService.generateMatchReasons(
            scoredFormula,
            userSymptoms,
            meridianSyndrome
          )

          // 生成智能建议（双通道输出）
          const smartRecommendation = this.evidenceTraceService.generateSmartRecommendation(
            scoredFormula,
            matchReasons,
            userSymptoms,
            constitution
          )

          return {
            smartRecommendation,
            scoredFormula,
            matchReasons
          }
        })
      )

      // Step 6: 生成摘要
      const summary = {
        totalMatched: candidates.length,
        topRecommendation: results[0]?.smartRecommendation.systemChannel.formula || '暂无推荐',
        confidence: results[0]?.scoredFormula.totalScore || 0
      }

      console.log('[IntelligentFormulaRecommendation] 推荐完成')
      console.log('[IntelligentFormulaRecommendation] 摘要:', summary)

      return {
        success: true,
        recommendations: results,
        summary,
        debugInfo: {
          userSymptoms,
          meridianSyndrome,
          matchedCount: candidates.length
        }
      }
    } catch (error) {
      console.error('[IntelligentFormulaRecommendation] 推荐失败:', error)
      throw new Error(`智能推荐失败: ${error}`)
    }
  }

  /**
   * 生成完整的推荐报告（Markdown 格式）
   *
   * @param request 推荐请求
   * @returns 完整的推荐报告
   */
  async generateFullReport(
    request: FormulaRecommendationRequest
  ): Promise<string> {
    try {
      // 获取推荐结果
      const response = await this.recommendFormulas(request)

      if (!response.success || response.recommendations.length === 0) {
        return '# 推荐报告\n\n抱歉，未找到匹配的方证。建议您：\n1. 详细描述您的症状\n2. 提供更多症状信息\n3. 咨询专业中医师'
      }

      let report = '# 智能方证推荐报告\n\n'
      report += `生成时间：${new Date().toLocaleString('zh-CN')}\n\n`

      // 摘要
      report += '## 推荐摘要\n\n'
      report += `- 共匹配到 ${response.summary.totalMatched} 个方证\n`
      report += `- 首选推荐：${response.summary.topRecommendation}\n`
      report += `- 推荐置信度：${(response.summary.confidence * 100).toFixed(0)}%\n\n`

      // 调试信息
      if (response.debugInfo) {
        report += '## 诊断信息\n\n'
        report += `- 用户症状：${response.debugInfo.userSymptoms.join('、')}\n`
        report += `- 六经证候：${response.debugInfo.meridianSyndrome.syndrome}\n\n`
      }

      // 每个推荐的详细信息
      for (let i = 0; i < response.recommendations.length; i++) {
        const { smartRecommendation, scoredFormula, matchReasons } = response.recommendations[i]

        report += `---\n\n`
        report += `## 推荐 ${i + 1}：${smartRecommendation.systemChannel.formula}\n\n`
        report += `推荐置信度：${(smartRecommendation.systemChannel.confidence * 100).toFixed(0)}%\n\n`

        // 摘要
        report += '### 推荐摘要\n\n'
        report += `${smartRecommendation.userChannel.summary}\n\n`

        // 推荐理由
        report += '### 推荐理由\n\n'
        for (let j = 0; j < matchReasons.length; j++) {
          const reason = matchReasons[j]
          report += `#### ${j + 1}. ${reason.type}\n\n`
          report += `**内容**：${reason.content}\n\n`
          report += `**证据**：${reason.evidence}\n\n`
          report += `**置信度**：${(reason.confidence * 100).toFixed(0)}%\n\n`
        }

        // 使用建议
        report += '### 使用建议\n\n'
        smartRecommendation.userChannel.advice.forEach((advice) => {
          report += `- ${advice}\n`
        })
        report += '\n'

        // 注意事项
        report += '### 注意事项\n\n'
        smartRecommendation.userChannel.warnings.forEach((warning) => {
          report += `- ${warning}\n`
        })
        report += '\n'

        // 方剂详情
        report += '### 方剂详情\n\n'
        const sys = smartRecommendation.systemChannel
        report += `- **方剂名称**：${sys.formula}\n`
        report += `- **六经分类**：${sys.meridian}\n`
        report += `- **证候**：${sys.syndrome}\n`
        report += `- **治法**：${sys.treatmentMethod}\n`
        report += `- **剂量**：${sys.dosage}\n`
        report += `- **煎服法**：${sys.instructions}\n`

        if (sys.ingredients.length > 0) {
          report += `- **组成**：${sys.ingredients.join('、')}\n`
        }

        report += `\n- **推荐置信度**：${(sys.confidence * 100).toFixed(0)}%\n\n`

        // 证据来源
        if (sys.evidenceSources.length > 0) {
          report += '### 证据来源\n\n'
          sys.evidenceSources.forEach((source) => {
            report += `- ${source}\n`
          })
          report += '\n'
        }
      }

      // 免责声明
      report += '---\n\n'
      report += '## 免责声明\n\n'
      report += '1. 本建议仅供参考，不构成医疗诊断或处方建议\n'
      report += '2. 具体用药请务必咨询专业中医师\n'
      report += '3. 如症状加重或出现新的不适，请及时就医\n'
      report += '4. 孕妇、儿童、老年人及慢性病患者请在医师指导下用药\n'

      return report
    } catch (error) {
      console.error('[IntelligentFormulaRecommendation] 生成报告失败:', error)
      throw new Error(`生成报告失败: ${error}`)
    }
  }

  /**
   * 提取症状（复用 IntelligentMatchingService 的私有方法）
   *
   * @param userInput 用户输入
   * @returns 症状列表
   */
  private async extractSymptoms(userInput: string): Promise<string[]> {
    // 常见症状关键词库
    const symptomKeywords = [
      '头痛', '发热', '恶寒', '恶风', '汗出', '无汗', '自汗', '盗汗',
      '脉浮', '脉紧', '脉缓', '脉弦', '脉沉', '脉数', '脉弱',
      '口渴', '口干', '口苦', '口淡',
      '恶心', '呕吐', '干呕',
      '腹痛', '腹胀', '腹泻', '便秘',
      '咳嗽', '气喘', '痰多', '痰少',
      '小便不利', '小便清长', '小便短赤',
      '身痛', '身重', '乏力',
      '失眠', '多梦', '嗜睡',
      '面红', '面白', '面黄',
      '舌红', '舌淡', '舌胖', '舌瘦',
      '舌苔白', '舌苔黄', '舌苔腻',
      '心烦', '心悸',
      '胁痛', '胸痛'
    ]

    // 提取匹配的症状
    const symptoms: string[] = []

    for (const keyword of symptomKeywords) {
      if (userInput.includes(keyword)) {
        symptoms.push(keyword)
      }
    }

    return symptoms
  }

  /**
   * 推导六经证候（复用 IntelligentMatchingService 的私有方法）
   *
   * @param symptoms 症状列表
   * @returns 六经证候
   */
  private async inferMeridianSyndrome(
    symptoms: string[]
  ): Promise<{ meridian: string; syndrome: string }> {
    // 太阳病症状
    const taiyangSymptoms = ['恶风', '汗出', '恶寒', '无汗', '头痛', '脉浮', '身痛']
    // 阳明病症状
    const yangmingSymptoms = ['发热', '口渴', '汗出', '便秘', '腹满', '脉洪']
    // 少阳病症状
    const shaoyangSymptoms = ['口苦', '咽干', '目眩', '往来寒热', '胸胁苦满', '脉弦']
    // 太阴病症状
    const taiyinSymptoms = ['腹泻', '腹胀', '食欲不振', '呕吐', '脉弱', '舌淡']
    // 少阴病症状
    const shaoyinSymptoms = ['脉微细', '但欲寐', '手足冷', '下利', '小便清']
    // 厥阴病症状
    const jueyinSymptoms = ['消渴', '气上撞心', '心中疼热', '饥而不欲食', '吐蛔']

    // 计算各六经的匹配度
    const scores = {
      太阳病: 0,
      阳明病: 0,
      少阳病: 0,
      太阴病: 0,
      少阴病: 0,
      厥阴病: 0
    }

    symptoms.forEach((symptom) => {
      if (taiyangSymptoms.includes(symptom)) {
        scores.太阳病++
      }
      if (yangmingSymptoms.includes(symptom)) {
        scores.阳明病++
      }
      if (shaoyangSymptoms.includes(symptom)) {
        scores.少阳病++
      }
      if (taiyinSymptoms.includes(symptom)) {
        scores.太阴病++
      }
      if (shaoyinSymptoms.includes(symptom)) {
        scores.少阴病++
      }
      if (jueyinSymptoms.includes(symptom)) {
        scores.厥阴病++
      }
    })

    // 找出得分最高的六经
    let maxScore = 0
    let bestMatch = '太阳病'

    for (const [meridian, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score
        bestMatch = meridian
      }
    }

    // 如果没有匹配到任何症状，默认太阳病
    if (maxScore === 0) {
      bestMatch = '太阳病'
    }

    return {
      meridian: bestMatch,
      syndrome: `${bestMatch}证候`
    }
  }
}
