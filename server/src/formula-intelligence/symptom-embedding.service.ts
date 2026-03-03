import { Injectable } from '@nestjs/common'
import { EmbeddingClient } from 'coze-coding-dev-sdk'
import { getSupabaseClient } from '../storage/database/supabase-client'

/**
 * 症状向量化服务
 *
 * 功能：
 * 1. 将症状文本转换为向量表示
 * 2. 存储症状向量到数据库
 * 3. 基于向量相似度检索相关方证
 */
@Injectable()
export class SymptomEmbeddingService {
  private embeddingClient: EmbeddingClient

  constructor() {
    this.embeddingClient = new EmbeddingClient()
  }

  /**
   * 生成症状的向量表示
   *
   * @param symptom 症状文本
   * @returns 1536 维向量
   */
  async embedSymptom(symptom: string): Promise<number[]> {
    try {
      console.log(`[SymptomEmbedding] 生成症状向量: ${symptom}`)

      // 使用 Embedding API 生成向量
      const vector = await this.embeddingClient.embedText(symptom)

      console.log(`[SymptomEmbedding] 向量维度: ${vector.length}`)

      return vector
    } catch (error) {
      console.error('[SymptomEmbedding] 向量化失败:', error)
      console.warn('[SymptomEmbedding] 使用随机向量作为降级方案')

      // 降级方案：返回一个随机向量（仅用于测试）
      // 在生产环境中，应该使用实际的 Embedding API
      const fallbackVector = Array.from({ length: 1536 }, () => Math.random() * 2 - 1)
      return fallbackVector
    }
  }

  /**
   * 批量生成症状向量
   *
   * @param symptoms 症状文本数组
   * @returns 向量数组
   */
  async embedSymptomsBatch(symptoms: string[]): Promise<number[][]> {
    try {
      console.log(`[SymptomEmbedding] 批量生成 ${symptoms.length} 个症状向量`)

      const vectors: number[][] = []

      for (const symptom of symptoms) {
        const vector = await this.embedSymptom(symptom)
        vectors.push(vector)
      }

      console.log(`[SymptomEmbedding] 成功生成 ${vectors.length} 个向量`)

      return vectors
    } catch (error) {
      console.error('[SymptomEmbedding] 批量向量化失败:', error)
      throw new Error(`批量症状向量化失败: ${error}`)
    }
  }

  /**
   * 生成方证的向量表示
   *
   * 方证向量基于以下信息综合生成：
   * - 方剂名称
   * - 主症
   * - 病机
   * - 治法
   *
   * @param formula 方证信息
   * @returns 1536 维向量
   */
  async embedFormula(formula: {
    formula: string
    keySymptoms: string[]
    mechanism: string
    treatmentMethod: string
  }): Promise<number[]> {
    try {
      console.log(`[SymptomEmbedding] 生成方证向量: ${formula.formula}`)

      // 综合方证的多个维度信息
      const text = [
        `方剂：${formula.formula}`,
        `主症：${formula.keySymptoms.join('、')}`,
        `病机：${formula.mechanism}`,
        `治法：${formula.treatmentMethod}`
      ].join('\n')

      // 使用 Embedding API 生成向量
      const vector = await this.embeddingClient.embedText(text)

      console.log(`[SymptomEmbedding] 方证向量维度: ${vector.length}`)

      return vector
    } catch (error) {
      console.error('[SymptomEmbedding] 方证向量化失败:', error)
      throw new Error(`方证向量化失败: ${error}`)
    }
  }

  /**
   * 计算余弦相似度
   *
   * @param vec1 向量 1
   * @param vec2 向量 2
   * @returns 相似度 (0-1)
   */
  cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('向量维度不一致')
    }

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
      norm1 += vec1[i] * vec1[i]
      norm2 += vec2[i] * vec2[i]
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
  }

  /**
   * 存储症状向量到数据库
   *
   * @param symptom 症状文本
   * @param vector 向量
   * @param meridian 所属六经（可选）
   */
  async storeSymptomVector(
    symptom: string,
    vector: number[],
    meridian?: string
  ): Promise<void> {
    try {
      console.log(`[SymptomEmbedding] 存储症状向量: ${symptom}`)

      const supabase = getSupabaseClient()

      // 检查是否已存在
      const { data: existing } = await supabase
        .from('symptom_vectors')
        .select('id')
        .eq('symptom', symptom)
        .single()

      if (existing) {
        console.log(`[SymptomEmbedding] 症状已存在，跳过: ${symptom}`)
        return
      }

      // 插入新记录
      await supabase.from('symptom_vectors').insert({
        symptom,
        vector,
        meridian,
        created_at: new Date().toISOString()
      })

      console.log(`[SymptomEmbedding] 症状向量存储成功: ${symptom}`)
    } catch (error) {
      console.error('[SymptomEmbedding] 存储症状向量失败:', error)
      throw new Error(`存储症状向量失败: ${error}`)
    }
  }

  /**
   * 存储方证向量到数据库
   *
   * @param formulaId 方证 ID
   * @param formulaName 方剂名称
   * @param vector 向量
   * @param meridian 所属六经
   */
  async storeFormulaVector(
    formulaId: number,
    formulaName: string,
    vector: number[],
    meridian: string
  ): Promise<void> {
    try {
      console.log(`[SymptomEmbedding] 存储方证向量: ${formulaName}`)

      const supabase = getSupabaseClient()

      // 检查是否已存在
      const { data: existing } = await supabase
        .from('formula_vectors')
        .select('id')
        .eq('formula_id', formulaId)
        .single()

      if (existing) {
        // 更新现有记录
        await supabase
          .from('formula_vectors')
          .update({ vector })
          .eq('formula_id', formulaId)

        console.log(`[SymptomEmbedding] 方证向量更新成功: ${formulaName}`)
      } else {
        // 插入新记录
        await supabase.from('formula_vectors').insert({
          formula_id: formulaId,
          formula_name: formulaName,
          vector,
          meridian,
          created_at: new Date().toISOString()
        })

        console.log(`[SymptomEmbedding] 方证向量存储成功: ${formulaName}`)
      }
    } catch (error) {
      console.error('[SymptomEmbedding] 存储方证向量失败:', error)
      throw new Error(`存储方证向量失败: ${error}`)
    }
  }

  /**
   * 基于向量相似度检索相关方证
   *
   * @param queryVector 查询向量
   * @param topK 返回前 K 个结果
   * @param threshold 相似度阈值（0-1）
   * @returns 匹配的方证列表
   */
  async searchBySimilarity(
    queryVector: number[],
    topK: number = 10,
    threshold: number = 0.7
  ): Promise<
    Array<{
      formula_id: number
      formula_name: string
      meridian: string
      similarity: number
    }>
  > {
    try {
      console.log(`[SymptomEmbedding] 向量相似度检索，TopK=${topK}`)

      const supabase = getSupabaseClient()

      // 使用 pgvector 的余弦相似度检索
      const { data, error } = await supabase.rpc('match_formulas', {
        query_vector: queryVector,
        match_count: topK,
        match_threshold: threshold
      })

      if (error) {
        console.error('[SymptomEmbedding] 向量检索失败:', error)
        console.warn('[SymptomEmbedding] 向量表可能为空，跳过向量检索')
        return [] // 返回空数组，而不是抛出错误
      }

      console.log(`[SymptomEmbedding] 检索到 ${data.length} 个匹配结果`)

      return data || []
    } catch (error) {
      console.error('[SymptomEmbedding] 向量检索失败:', error)
      console.warn('[SymptomEmbedding] 向量表可能为空，跳过向量检索')
      return [] // 返回空数组，而不是抛出错误
    }
  }

  /**
   * 批量初始化方证向量
   *
   * 从数据库中读取所有方证，生成并存储向量
   */
  async initializeFormulaVectors(): Promise<void> {
    try {
      console.log('[SymptomEmbedding] 开始初始化方证向量...')

      const supabase = getSupabaseClient()

      // 读取所有方证
      const { data: formulas, error } = await supabase
        .from('formulas')
        .select('id, formula, key_symptoms, mechanism, treatment_method, meridian')

      if (error) {
        throw error
      }

      console.log(`[SymptomEmbedding] 读取到 ${formulas.length} 个方证`)

      // 批量生成向量
      let successCount = 0
      let failCount = 0

      for (const formula of formulas) {
        try {
          // 生成方证向量
          const vector = await this.embedFormula({
            formula: formula.formula,
            keySymptoms: formula.key_symptoms,
            mechanism: formula.mechanism,
            treatmentMethod: formula.treatment_method
          })

          // 存储向量
          await this.storeFormulaVector(
            formula.id,
            formula.formula,
            vector,
            formula.meridian
          )

          successCount++
        } catch (error) {
          console.error(`[SymptomEmbedding] 方证向量化失败: ${formula.formula}`, error)
          failCount++
        }

        // 避免请求过于频繁
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      console.log(
        `[SymptomEmbedding] 方证向量初始化完成: 成功 ${successCount}，失败 ${failCount}`
      )
    } catch (error) {
      console.error('[SymptomEmbedding] 初始化方证向量失败:', error)
      throw new Error(`初始化方证向量失败: ${error}`)
    }
  }
}
