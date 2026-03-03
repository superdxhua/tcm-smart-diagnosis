import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { LLMClient, Config } from 'coze-coding-dev-sdk'
import { createLLMClient } from '../utils/llm-helper'

@Injectable()
export class MedicationFeedbackService {
  private llmClient: LLMClient

  constructor() {
    this.llmClient = createLLMClient()
  }

  async findAll() {
    const supabase = getSupabaseClient()
    const result = await supabase
      .from('medication_feedback')
      .select('*')
      .order('feedback_date', { ascending: false })
    
    return result.data || []
  }

  async findOne(id: string) {
    const supabase = getSupabaseClient()
    const result = await supabase
      .from('medication_feedback')
      .select('*')
      .eq('id', id)
      .single()
    
    if (result.error || !result.data) {
      throw new NotFoundException('服药反馈记录不存在')
    }
    
    return result.data
  }

  async analyzeFeedback(recordId: string) {
    const supabase = getSupabaseClient()

    // 获取病历信息
    const recordResult = await supabase
      .from('patient_records')
      .select('*')
      .eq('id', recordId)
      .single()

    if (recordResult.error || !recordResult.data) {
      throw new NotFoundException('病历不存在')
    }

    const record = recordResult.data

    // 获取该病历的反馈
    const feedbackResult = await supabase
      .from('medication_feedback')
      .select('*')
      .eq('record_id', recordId)
      .order('feedback_date', { ascending: false })
      .limit(1)

    if (feedbackResult.error || !feedbackResult.data || feedbackResult.data.length === 0) {
      throw new NotFoundException('未找到反馈记录')
    }

    const feedback = feedbackResult.data[0]

    // 获取相似病历的成功案例
    const similarCasesResult = await supabase
      .from('medication_feedback')
      .select('*, patient_records!inner(*)')
      .eq('effectiveness', '非常有效')
      .order('feedback_date', { ascending: false })
      .limit(5)

    // 使用 AI 分析反馈
    const systemPrompt = `你是一位中医临床专家和系统分析师。你的任务是分析服药反馈，找出疗效不佳的原因，并提出改进建议。

输出格式要求为 JSON，包含以下字段：
- effectivenessAnalysis: 疗效分析（为什么有效或无效）
- problemIdentification: 问题识别（当前处方存在的问题）
- improvementSuggestions: 改进建议（具体的处方调整建议）
- learningPoints: 学习要点（从这次反馈中学到的经验）
- alternativePrescriptions: 备选处方（2-3个可能的替代方案）

请结合中医理论和临床经验，提供专业、实用的建议。`

    const userPrompt = `请分析以下病历和反馈信息：

病历信息：
- 主诉：${record.chief_complaint}
- 诊断：${record.diagnosis}
- 辨证：${record.differentiation}
- 治则：${record.treatment_principle}
- 处方：${record.prescription}

反馈信息：
- 满意度：${feedback.satisfaction}
- 疗效：${feedback.effectiveness}
- 不良反应：${feedback.side_effects}
- 备注：${feedback.notes}

${similarCasesResult.data && similarCasesResult.data.length > 0 ? 
  `参考成功案例：\n${similarCasesResult.data.map((f: any, i: number) => 
    `${i + 1}. ${f.patient_records.chief_complaint} - ${f.patient_records.prescription} - ${f.notes}`
  ).join('\n')}` : '暂无相似成功案例'}

请提供详细的分析和建议。`

    try {
      const response = await this.llmClient.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        // 千问大模型（通过 SDK 配置）
        temperature: 0.7
      })

      // 解析 AI 返回的 JSON
      let analysis
      try {
        analysis = JSON.parse(response.content)
      } catch {
        // 如果解析失败，提取 JSON 代码块
        const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/)
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[1])
        } else {
          // 返回默认结构
          analysis = {
            effectivenessAnalysis: response.content,
            problemIdentification: '无法识别问题',
            improvementSuggestions: '建议咨询专业中医师',
            learningPoints: '需要更多数据进行分析',
            alternativePrescriptions: []
          }
        }
      }

      return {
        recordId,
        feedback,
        analysis,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('AI 分析失败:', error)
      throw new BadRequestException('分析失败，请稍后重试')
    }
  }

  async getLearningSummary() {
    const supabase = getSupabaseClient()

    // 获取所有反馈数据
    const feedbackResult = await supabase
      .from('medication_feedback')
      .select('*, patient_records(*)')
      .order('feedback_date', { ascending: false })
      .limit(100)

    const feedbacks = feedbackResult.data || []

    // 统计数据
    const stats = {
      total: feedbacks.length,
      effective: feedbacks.filter(f => f.effectiveness === '非常有效' || f.effectiveness === '有效').length,
      ineffective: feedbacks.filter(f => f.effectiveness === '无效' || f.effectiveness === '加重').length,
      averageSatisfaction: '0.00'
    }

    if (feedbacks.length > 0) {
      const satisfactionScores = {
        '非常满意': 5,
        '满意': 4,
        '一般': 3,
        '不满意': 2,
        '非常不满意': 1
      }
      const totalScore = feedbacks.reduce((sum, f) => sum + (satisfactionScores[f.satisfaction] || 3), 0)
      stats.averageSatisfaction = (totalScore / feedbacks.length).toFixed(2)
    }

    // 使用 AI 总结学习经验
    const systemPrompt = `你是一位中医临床专家和学习分析师。你的任务是从大量的服药反馈数据中总结经验，提炼出有效的处方规律和注意事项。

输出格式要求为 JSON，包含以下字段：
- successPatterns: 成功模式（疗效好的处方的共同特点）
- failurePatterns: 失败模式（疗效不佳的处方的共同问题）
- keyInsights: 关键洞察（从数据中发现的重要规律）
- recommendations: 改进建议（对未来处方的建议）
- topEffectivePrescriptions: 最有效的处方列表（按疗效排序）

请基于真实数据提供客观、专业的分析。`

    const effectiveCases = feedbacks.filter(f => f.effectiveness === '非常有效' || f.effectiveness === '有效')
    const ineffectiveCases = feedbacks.filter(f => f.effectiveness === '无效' || f.effectiveness === '加重')

    const userPrompt = `请总结以下反馈数据：

总体统计：
- 总反馈数：${stats.total}
- 有效案例：${stats.effective}
- 无效案例：${stats.ineffective}
- 平均满意度：${stats.averageSatisfaction}

有效案例摘要：
${effectiveCases.slice(0, 10).map((f, i) => 
  `${i + 1}. 诊断：${f.patient_records?.diagnosis} - 疗效：${f.effectiveness} - 备注：${f.notes?.substring(0, 50)}...`
).join('\n')}

无效案例摘要：
${ineffectiveCases.slice(0, 10).map((f, i) => 
  `${i + 1}. 诊断：${f.patient_records?.diagnosis} - 疗效：${f.effectiveness} - 备注：${f.notes?.substring(0, 50)}...`
).join('\n')}

请提供详细的学习总结。`

    try {
      const response = await this.llmClient.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        // 千问大模型（通过 SDK 配置）
        temperature: 0.7
      })

      let summary
      try {
        summary = JSON.parse(response.content)
      } catch {
        const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/)
        if (jsonMatch) {
          summary = JSON.parse(jsonMatch[1])
        } else {
          summary = {
            successPatterns: [],
            failurePatterns: [],
            keyInsights: response.content.substring(0, 500),
            recommendations: [],
            topEffectivePrescriptions: []
          }
        }
      }

      return {
        stats,
        summary,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('学习总结失败:', error)
      throw new BadRequestException('总结失败，请稍后重试')
    }
  }

  async optimizePrescription(data: {
    recordId: string;
    feedbackId: string;
    currentPrescription: string;
    feedbackData: any;
  }) {
    const supabase = getSupabaseClient()

    // 获取病历信息
    const recordResult = await supabase
      .from('patient_records')
      .select('*')
      .eq('id', data.recordId)
      .single()

    if (recordResult.error || !recordResult.data) {
      throw new NotFoundException('病历不存在')
    }

    const record = recordResult.data

    // 使用 AI 生成优化后的处方
    const systemPrompt = `你是一位经验丰富的中医临床专家。你的任务是根据用户反馈，优化处方，提高疗效。

输出格式要求为 JSON，包含以下字段：
- originalPrescription: 原处方（列出主要药物）
- problemsIdentified: 识别的问题（原处方存在的问题）
- optimizedPrescription: 优化处方（新的处方组成和用量）
- optimizationReason: 优化理由（为什么这样调整）
- alternativeOptions: 备选方案（2-3个不同的调整方向）
- expectedEffects: 预期效果（调整后预期达到的疗效）
- precautions: 注意事项（需要特别注意的问题）

**重要剂量标准**：
- 汉代一两折合现代9克（现代临床常用折中标准）
- 药物用量必须明确写出具体克数
- 对于毒性药物需严格控制剂量并标注注意事项

请结合用户反馈和中医理论，提供专业、安全的优化方案。`

    const userPrompt = `请优化以下处方：

用户信息：
- 主诉：${record.chief_complaint}
- 诊断：${record.diagnosis}
- 辨证：${record.differentiation}
- 治则：${record.treatment_principle}

当前处方：
${data.currentPrescription}

用户反馈：
- 疗效：${data.feedbackData.effectiveness}
- 满意度：${data.feedbackData.satisfaction}
- 不良反应：${data.feedbackData.sideEffects}
- 备注：${data.feedbackData.notes}

请基于以上信息，提供处方优化建议。`

    try {
      const response = await this.llmClient.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        // 千问大模型（通过 SDK 配置）
        temperature: 0.7
      })

      let optimization
      try {
        optimization = JSON.parse(response.content)
      } catch {
        const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/)
        if (jsonMatch) {
          optimization = JSON.parse(jsonMatch[1])
        } else {
          optimization = {
            originalPrescription: data.currentPrescription,
            problemsIdentified: '无法识别问题',
            optimizedPrescription: '建议咨询专业中医师',
            optimizationReason: response.content.substring(0, 300),
            alternativeOptions: [],
            expectedEffects: '待验证',
            precautions: '请遵医嘱'
          }
        }
      }

      // 保存优化建议到数据库
      const { data: savedOptimization, error } = await supabase
        .from('prescription_optimizations')
        .insert({
          id: crypto.randomUUID(),
          record_id: data.recordId,
          feedback_id: data.feedbackId,
          original_prescription: data.currentPrescription,
          optimized_prescription: JSON.stringify(optimization),
          optimization_reason: optimization.optimizationReason,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('保存优化建议失败:', error)
      }

      return {
        recordId: data.recordId,
        feedbackId: data.feedbackId,
        optimization,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('处方优化失败:', error)
      throw new BadRequestException('优化失败，请稍后重试')
    }
  }

  async create(data: any) {
    const supabase = getSupabaseClient()
    const { data: feedback, error } = await supabase
      .from('medication_feedback')
      .insert({
        id: crypto.randomUUID(),
        record_id: data.recordId,
        patient_id: data.patientId,
        patient_name: data.patientName,
        prescription: data.prescription,
        satisfaction: data.satisfaction,
        effectiveness: data.effectiveness,
        side_effects: data.sideEffects,
        feedback_date: data.feedbackDate,
        notes: data.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      throw new BadRequestException(error.message)
    }
    
    return feedback
  }

  async update(id: string, data: any) {
    const supabase = getSupabaseClient()
    const { data: feedback, error } = await supabase
      .from('medication_feedback')
      .update({
        satisfaction: data.satisfaction,
        effectiveness: data.effectiveness,
        side_effects: data.sideEffects,
        notes: data.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      throw new BadRequestException(error.message)
    }
    
    return feedback
  }

  async remove(id: string) {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('medication_feedback')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw new BadRequestException(error.message)
    }
    
    return { id }
  }
}
