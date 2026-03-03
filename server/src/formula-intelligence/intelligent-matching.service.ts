import { Injectable } from '@nestjs/common'
import { getSupabaseClient } from '../storage/database/supabase-client'
import { SymptomEmbeddingService } from './symptom-embedding.service'

/**
 * 智能匹配服务
 *
 * 功能：
 * 1. 理解用户的症状描述
 * 2. 进行多维度检索（向量相似度、规则引擎、知识图谱）
 * 3. 返回候选方证列表
 */
@Injectable()
export class IntelligentMatchingService {
  constructor(
    private symptomEmbeddingService: SymptomEmbeddingService
  ) {}

  /**
   * 智能匹配方证
   *
   * @param userInput 用户的症状描述
   * @param constitution 体质（可选）
   * @param topK 返回前 K 个结果
   * @returns 候选方证列表
   */
  async matchFormulas(
    userInput: string,
    constitution?: string,
    topK: number = 10
  ): Promise<
    Array<{
      formula: any
      similarityScore: number
      ruleMatchScore: number
      knowledgeScore: number
      totalScore: number
      matchReasons: string[]
    }>
  > {
    try {
      console.log('[IntelligentMatching] 开始智能匹配方证')
      console.log('[IntelligentMatching] 用户输入:', userInput)

      // Step 1: 自然语言理解 - 提取症状
      const symptoms = await this.extractSymptoms(userInput)
      console.log('[IntelligentMatching] 提取到的症状:', symptoms)

      // Step 2: 推导六经证候
      const meridianSyndrome = await this.inferMeridianSyndrome(symptoms)
      console.log('[IntelligentMatching] 推导的六经证候:', meridianSyndrome)

      // Step 3: 向量相似度检索
      const vectorMatches = await this.vectorSimilaritySearch(userInput, topK * 2)
      console.log(`[IntelligentMatching] 向量检索到 ${vectorMatches.length} 个候选`)

      // Step 4: 规则引擎推理
      const ruleMatches = await this.ruleEngineMatch(symptoms, meridianSyndrome)
      console.log(`[IntelligentMatching] 规则引擎匹配到 ${ruleMatches.length} 个候选`)

      // Step 5: 知识图谱推理
      const knowledgeMatches = await this.knowledgeGraphInfer(symptoms, meridianSyndrome)
      console.log(`[IntelligentMatching] 知识图谱推导到 ${knowledgeMatches.length} 个候选`)

      // Step 6: 合并并排序候选方证
      const candidates = await this.mergeAndScoreCandidates({
        vectorMatches,
        ruleMatches,
        knowledgeMatches,
        symptoms,
        constitution
      })

      console.log(`[IntelligentMatching] 最终返回 ${candidates.slice(0, topK).length} 个候选`)

      return candidates.slice(0, topK)
    } catch (error) {
      console.error('[IntelligentMatching] 智能匹配失败:', error)
      throw new Error(`智能匹配失败: ${error}`)
    }
  }

  /**
   * 提取症状
   *
   * 使用简单的关键词匹配和正则表达式提取症状
   * （未来可升级为使用 Qwen 大模型进行 NER）
   *
   * @param userInput 用户输入
   * @returns 症状列表
   */
  private async extractSymptoms(userInput: string): Promise<string[]> {
    try {
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

      console.log(`[IntelligentMatching] 关键词匹配提取到 ${symptoms.length} 个症状`)

      return symptoms
    } catch (error) {
      console.error('[IntelligentMatching] 提取症状失败:', error)
      throw error
    }
  }

  /**
   * 推导六经证候
   *
   * 基于症状推导六经证候（太阳、阳明、少阳、太阴、少阴、厥阴）
   *
   * @param symptoms 症状列表
   * @returns 六经证候
   */
  private async inferMeridianSyndrome(
    symptoms: string[]
  ): Promise<{ meridian: string; syndrome: string }> {
    try {
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

      // 太阳病评分
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

      console.log(`[IntelligentMatching] 六经评分:`, scores)
      console.log(`[IntelligentMatching] 最佳匹配: ${bestMatch} (得分: ${maxScore})`)

      return {
        meridian: bestMatch,
        syndrome: `${bestMatch}证候`
      }
    } catch (error) {
      console.error('[IntelligentMatching] 推导六经证候失败:', error)
      throw error
    }
  }

  /**
   * 向量相似度检索
   *
   * @param userInput 用户输入
   * @param topK 返回前 K 个结果
   * @returns 向量匹配结果
   */
  private async vectorSimilaritySearch(
    userInput: string,
    topK: number = 10
  ): Promise<Array<{ formula: any; similarity: number }>> {
    try {
      // 生成用户输入的向量
      const userVector = await this.symptomEmbeddingService.embedSymptom(userInput)

      // 使用向量相似度检索
      const matches = await this.symptomEmbeddingService.searchBySimilarity(
        userVector,
        topK,
        0.6 // 降低阈值以获取更多候选
      )

      // 查询完整的方证信息
      const supabase = getSupabaseClient()
      const formulaIds = matches.map((m) => m.formula_id)

      const { data: formulas, error } = await supabase
        .from('formulas')
        .select('*')
        .in('id', formulaIds)

      if (error) {
        throw error
      }

      // 匹配方证信息
      const results = matches.map((match) => {
        const formula = formulas.find((f) => f.id === match.formula_id)
        return {
          formula,
          similarity: match.similarity
        }
      })

      return results.filter((r) => r.formula !== undefined) as Array<{
        formula: any
        similarity: number
      }>
    } catch (error) {
      console.error('[IntelligentMatching] 向量相似度检索失败:', error)
      console.warn('[IntelligentMatching] 向量检索功能暂不可用，跳过')
      // 不抛出错误，返回空数组，让后续的规则引擎和知识图谱推理继续执行
      return []
    }
  }

  /**
   * 规则引擎匹配
   *
   * 基于中医辨证规则的匹配
   *
   * @param symptoms 症状列表
   * @param meridianSyndrome 六经证候
   * @returns 规则匹配结果
   */
  private async ruleEngineMatch(
    symptoms: string[],
    meridianSyndrome: { meridian: string; syndrome: string }
  ): Promise<Array<{ formula: any; score: number }>> {
    try {
      const supabase = getSupabaseClient()

      // 根据六经证候查询方证
      const { data: formulas, error } = await supabase
        .from('formulas')
        .select('*')
        .eq('meridian', meridianSyndrome.meridian)

      if (error) {
        console.error('[IntelligentMatching] 规则引擎查询失败:', error)
        throw error
      }

      console.log(`[IntelligentMatching] 查询到 ${formulas?.length || 0} 个${meridianSyndrome.meridian}方证`)

      // 计算每个方证的症状匹配度
      const results = formulas.map((formula) => {
        const keySymptoms = formula.key_symptoms || []
        let matchCount = 0

        for (const symptom of symptoms) {
          // 检查症状是否匹配
          for (const keySymptom of keySymptoms) {
            if (keySymptom.includes(symptom) || symptom.includes(keySymptom)) {
              matchCount++
              break
            }
          }
        }

        const score = keySymptoms.length > 0 ? matchCount / keySymptoms.length : 0

        return {
          formula,
          score
        }
      })

      // 过滤掉得分过低的方证
      return results.filter((r) => r.score > 0.2)
    } catch (error) {
      console.error('[IntelligentMatching] 规则引擎匹配失败:', error)
      throw error
    }
  }

  /**
   * 知识图谱推理
   *
   * 基于症状和六经证候的推理
   *
   * @param symptoms 症状列表
   * @param meridianSyndrome 六经证候
   * @returns 知识图谱推理结果
   */
  private async knowledgeGraphInfer(
    symptoms: string[],
    meridianSyndrome: { meridian: string; syndrome: string }
  ): Promise<Array<{ formula: any; confidence: number }>> {
    try {
      const supabase = getSupabaseClient()

      // 根据治法查询方证（六经 → 治法 → 方剂）
      const { data: treatmentMethods, error } = await supabase
        .from('treatment_methods')
        .select('*')
        .eq('meridian', meridianSyndrome.meridian)

      if (error) {
        throw error
      }

      // 查询使用这些治法的方证
      const treatmentMethodNames = treatmentMethods.map((tm) => tm.method)
      const { data: formulas, error: formulaError } = await supabase
        .from('formulas')
        .select('*')
        .in('treatment_method', treatmentMethodNames)
        .eq('meridian', meridianSyndrome.meridian)

      if (formulaError) {
        throw formulaError
      }

      // 计算置信度（基于治法匹配度和六经匹配度）
      const results = formulas.map((formula) => {
        const confidence = formula.meridian === meridianSyndrome.meridian ? 0.8 : 0.5

        return {
          formula,
          confidence
        }
      })

      return results
    } catch (error) {
      console.error('[IntelligentMatching] 知识图谱推理失败:', error)
      throw error
    }
  }

  /**
   * 合并并排序候选方证
   *
   * @param matches 各种匹配结果
   * @param symptoms 症状列表
   * @param constitution 体质
   * @returns 排序后的候选方证
   */
  private async mergeAndScoreCandidates(matches: {
    vectorMatches: Array<{ formula: any; similarity: number }>
    ruleMatches: Array<{ formula: any; score: number }>
    knowledgeMatches: Array<{ formula: any; confidence: number }>
    symptoms: string[]
    constitution?: string
  }): Promise<
    Array<{
      formula: any
      similarityScore: number
      ruleMatchScore: number
      knowledgeScore: number
      totalScore: number
      matchReasons: string[]
    }>
  > {
    try {
      // 合并所有候选方证
      const candidatesMap = new Map<number, any>()

      // 添加向量匹配结果
      for (const match of matches.vectorMatches) {
        if (match.formula && !candidatesMap.has(match.formula.id)) {
          candidatesMap.set(match.formula.id, {
            formula: match.formula,
            similarityScore: match.similarity,
            ruleMatchScore: 0,
            knowledgeScore: 0
          })
        } else if (match.formula && candidatesMap.has(match.formula.id)) {
          const candidate = candidatesMap.get(match.formula.id)!
          candidate.similarityScore = Math.max(candidate.similarityScore, match.similarity)
        }
      }

      // 添加规则匹配结果
      for (const match of matches.ruleMatches) {
        if (!candidatesMap.has(match.formula.id)) {
          candidatesMap.set(match.formula.id, {
            formula: match.formula,
            similarityScore: 0,
            ruleMatchScore: match.score,
            knowledgeScore: 0
          })
        } else {
          const candidate = candidatesMap.get(match.formula.id)!
          candidate.ruleMatchScore = Math.max(candidate.ruleMatchScore, match.score)
        }
      }

      // 添加知识图谱推理结果
      for (const match of matches.knowledgeMatches) {
        if (!candidatesMap.has(match.formula.id)) {
          candidatesMap.set(match.formula.id, {
            formula: match.formula,
            similarityScore: 0,
            ruleMatchScore: 0,
            knowledgeScore: match.confidence
          })
        } else {
          const candidate = candidatesMap.get(match.formula.id)!
          candidate.knowledgeScore = Math.max(candidate.knowledgeScore, match.confidence)
        }
      }

      // 计算综合评分
      const candidates = Array.from(candidatesMap.values()).map((candidate) => {
        // 综合评分公式（可调整权重）
        const totalScore =
          0.4 * candidate.similarityScore +
          0.35 * candidate.ruleMatchScore +
          0.25 * candidate.knowledgeScore

        // 生成匹配理由
        const matchReasons: string[] = []

        if (candidate.similarityScore > 0.7) {
          matchReasons.push(`症状语义高度相似 (相似度: ${(candidate.similarityScore * 100).toFixed(0)}%)`)
        } else if (candidate.similarityScore > 0.5) {
          matchReasons.push(`症状语义较为相似 (相似度: ${(candidate.similarityScore * 100).toFixed(0)}%)`)
        }

        if (candidate.ruleMatchScore > 0.7) {
          matchReasons.push(`主症高度匹配 (匹配度: ${(candidate.ruleMatchScore * 100).toFixed(0)}%)`)
        } else if (candidate.ruleMatchScore > 0.4) {
          matchReasons.push(`主症部分匹配 (匹配度: ${(candidate.ruleMatchScore * 100).toFixed(0)}%)`)
        }

        if (candidate.knowledgeScore > 0.7) {
          matchReasons.push(`治法符合六经辨证 (置信度: ${(candidate.knowledgeScore * 100).toFixed(0)}%)`)
        }

        return {
          ...candidate,
          totalScore,
          matchReasons
        }
      })

      // 按综合评分排序
      candidates.sort((a, b) => b.totalScore - a.totalScore)

      return candidates
    } catch (error) {
      console.error('[IntelligentMatching] 合并候选方证失败:', error)
      throw error
    }
  }
}
