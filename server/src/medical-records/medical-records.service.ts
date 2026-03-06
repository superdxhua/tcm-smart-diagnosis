import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { createLLMClient } from '../utils/llm-helper';

@Injectable()
export class MedicalRecordsService {
  private llmClient: LLMClient

  constructor() {
    this.llmClient = createLLMClient()
  }

  // 创建档案（直接插入健康记录）
  async createHealthRecord(recordData: any) {
    const supabase = getSupabaseClient();

    // 直接插入健康记录
    const { data, error } = await supabase
      .from('health_records')
      .insert({
        member_id: recordData.member_id,
        consultant_id: recordData.consultant_id || null,
        visit_number: recordData.visit_number,
        chief_complaint: recordData.chief_complaint,
        history: recordData.history || null,
        past_history: recordData.past_history || null,
        analysis_result: recordData.analysis_result || null,
        differentiation: recordData.differentiation || null,
        treatment_principle: recordData.treatment_principle || null,
        health_plan: recordData.health_plan,
        advice: recordData.advice || null,
        status: recordData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('创建健康记录失败:', error);
      throw new BadRequestException(error.message);
    }

    return data;
  }

  // 获取档案详情
  async getHealthRecordById(recordId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('id', recordId)
      .single();

    if (error || !data) {
      throw new NotFoundException('档案不存在');
    }

    return data;
  }

  // 获取用户的所有档案（过滤孤儿记录）
  async getMemberHealthRecords(memberId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('member_id', memberId)
      .eq('is_orphaned', false)  // 只返回非孤儿记录
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data || [];
  }

  // 更新病历
  async updateMedicalRecord(recordId: string, updates: any) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('patient_records')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  // 删除病历
  async deleteMedicalRecord(recordId: string) {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('patient_records')
      .delete()
      .eq('id', recordId);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: '病历删除成功' };
  }

  // 归档病历
  async archiveMedicalRecord(recordId: string) {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('patient_records')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', recordId);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: '病历已归档' };
  }

  // 复诊分析 - 查询用户历史病历并提供优化建议
  async analyzeFollowUp(patientId: string, currentSymptoms: string) {
    const supabase = getSupabaseClient();

    // 获取用户所有历史病历
    const { data: records, error } = await supabase
      .from('patient_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error || !records || records.length === 0) {
      throw new NotFoundException('用户暂无历史病历');
    }

    // 获取最近的病历（复诊前的病历）
    const recentRecords = records.slice(0, Math.min(5, records.length));

    // 获取最近的用药反馈
    const recentRecordId = recentRecords[0].id;
    const { data: feedbacks } = await supabase
      .from('medication_feedback')
      .select('*')
      .eq('record_id', recentRecordId)
      .order('feedback_date', { ascending: false })
      .limit(3);

    // 检查是否存在未解决的问题
    const ineffectiveRecords = recentRecords.filter((record: any) => {
      const recordFeedbacks = feedbacks?.filter((f: any) => f.record_id === record.id);
      if (recordFeedbacks && recordFeedbacks.length > 0) {
        return recordFeedbacks.some((f: any) =>
          f.effectiveness === '无效' || f.effectiveness === '加重' || f.satisfaction === '不满意' || f.satisfaction === '非常不满意'
        );
      }
      return false;
    });

    // 构建历史病历摘要
    const historySummary = recentRecords.map((record: any, index: number) => {
      const recordFeedbacks = feedbacks?.filter((f: any) => f.record_id === record.id);
      const latestFeedback = recordFeedbacks && recordFeedbacks.length > 0 ? recordFeedbacks[0] : null;

      return {
        index: index + 1,
        date: record.created_at,
        visitNumber: record.visit_number,
        chiefComplaint: record.chief_complaint,
        diagnosis: record.diagnosis,
        differentiation: record.differentiation,
        prescription: record.prescription,
        feedback: latestFeedback ? {
          effectiveness: latestFeedback.effectiveness,
          satisfaction: latestFeedback.satisfaction,
          sideEffects: latestFeedback.side_effects,
          notes: latestFeedback.notes
        } : null
      };
    });

    // 识别未解决的问题
    const unresolvedIssues = ineffectiveRecords.map((record: any) => {
      const recordFeedbacks = feedbacks?.filter((f: any) => f.record_id === record.id);
      const latestFeedback = recordFeedbacks && recordFeedbacks.length > 0 ? recordFeedbacks[0] : null;

      return {
        recordId: record.id,
        chiefComplaint: record.chief_complaint,
        diagnosis: record.diagnosis,
        prescription: record.prescription,
        feedback: latestFeedback
      };
    });

    // 使用 AI 分析并提供优化建议
    const systemPrompt = `你是一位经验丰富的中医临床专家。你的任务是分析用户的历史病历和当前症状，识别未解决的问题，并提供针对性的优化治疗方案。

输出格式要求为 JSON，包含以下字段：
- patientHistorySummary: 用户病史摘要（简要总结用户的诊疗历史）
- unresolvedProblems: 未解决的问题（列出之前诊疗中未解决的问题）
- currentSymptomsAnalysis: 当前症状分析（分析当前症状与之前的关系）
- optimizationStrategy: 优化策略（针对未解决问题的治疗策略）
- recommendedPrescription: 推荐处方（基于历史和当前症状优化的处方）
- dosageAdjustments: 剂量调整建议（如果需要调整剂量）
- precautions: 注意事项（需要特别注意的事项）
- followUpPlan: 随访计划（建议的随访时间和注意事项）

请严格按照中医理论和临床实践，提供专业、安全、有效的建议。如果需要调整处方，请说明调整的理由。`;

    const userPrompt = `请分析以下用户信息并进行复诊优化：

用户基本信息：
- 用户ID：${patientId}
- 总就诊次数：${records.length}
- 当前症状：${currentSymptoms}

历史病历记录：
${JSON.stringify(historySummary, null, 2)}

未解决的问题：
${unresolvedIssues.length > 0 ? JSON.stringify(unresolvedIssues, null, 2) : '暂无未解决问题'}

请提供详细的复诊分析和优化建议。`;

    try {
      const response = await this.llmClient.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        model: 'qwen-plus',
        temperature: 0.7
      });

      // 解析 AI 返回的 JSON
      let analysis;
      try {
        analysis = JSON.parse(response.content);
      } catch {
        // 如果解析失败，提取 JSON 代码块
        const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[1]);
        } else {
          // 返回默认结构
          analysis = {
            patientHistorySummary: response.content.substring(0, 500),
            unresolvedProblems: unresolvedIssues,
            currentSymptomsAnalysis: '基于当前症状需要进一步分析',
            optimizationStrategy: '建议结合当前症状和历史处方进行综合评估',
            recommendedPrescription: recentRecords[0].prescription,
            dosageAdjustments: [],
            precautions: [],
            followUpPlan: '建议定期随访，根据症状变化调整治疗方案'
          };
        }
      }

      return {
        patientId,
        historySummary,
        unresolvedIssues,
        currentSymptoms,
        analysis,
        visitCount: records.length,
        lastVisitDate: recentRecords[0].created_at
      };
    } catch (error) {
      console.error('复诊分析失败:', error);
      throw new BadRequestException('分析失败，请稍后重试');
    }
  }
}
