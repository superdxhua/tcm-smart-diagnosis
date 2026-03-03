import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { LLMService } from '../llm/llm.service';
import {
  CreateMedicalCaseDto,
  UpdateMedicalCaseDto,
  MatchCasesDto,
  RecommendPrescriptionDto,
  CaseFeedbackDto,
} from './medical-cases.interfaces';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class MedicalCasesService {
  private readonly logger = new Logger(MedicalCasesService.name);

  constructor(
    private readonly llmService: LLMService,
  ) {}

  /**
   * 创建医案
   */
  async createCase(dto: CreateMedicalCaseDto) {
    const client = getSupabaseClient();
    const caseId = uuidv4();

    const { data, error } = await client
      .from('medical_cases')
      .insert({
        id: caseId,
        doctor_name: dto.doctorName,
        doctor_era: dto.doctorEra,
        patient_gender: dto.patientGender,
        patient_age: dto.patientAge,
        main_symptoms: dto.mainSymptoms,
        current_illness: dto.currentIllness,
        past_history: dto.pastHistory,
        tongue: dto.tongue,
        pulse: dto.pulse,
        diagnosis: dto.diagnosis,
        prescription_name: dto.prescriptionName,
        prescription_composition: dto.prescriptionComposition,
        prescription_dosage: dto.prescriptionDosage,
        prescription_usage: dto.prescriptionUsage,
        treatment_result: dto.treatmentResult,
        notes: dto.notes,
        source: dto.source,
        tags: dto.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      this.logger.error('创建医案失败', error);
      throw new Error('创建医案失败');
    }

    // 创建后自动分析
    this.analyzeCase(caseId).catch((err) => {
      this.logger.warn('自动分析医案失败', err);
    });

    return { code: 200, msg: 'success', data };
  }

  /**
   * 获取医案列表
   */
  async getCasesList(page = 1, pageSize = 20, search?: string, doctorName?: string) {
    const client = getSupabaseClient();

    let query = client
      .from('medical_cases')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(
        `main_symptoms.ilike.%${search}%,diagnosis.ilike.%${search}%,prescription_name.ilike.%${search}%`,
      );
    }

    if (doctorName) {
      query = query.eq('doctor_name', doctorName);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    if (!query || typeof query.range !== 'function') {
      this.logger.error('Supabase 查询对象无效');
      throw new Error('Supabase 查询对象无效');
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      this.logger.error('获取医案列表失败', error);
      throw new Error('获取医案列表失败');
    }

    return {
      code: 200,
      msg: 'success',
      data: {
        list: data || [],
        total: count || 0,
        page,
        pageSize,
      },
    };
  }

  /**
   * 获取医案详情
   */
  async getCaseDetail(id: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('medical_cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('获取医案详情失败', error);
      throw new Error('医案不存在');
    }

    return { code: 200, msg: 'success', data };
  }

  /**
   * 更新医案
   */
  async updateCase(id: string, dto: UpdateMedicalCaseDto) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('medical_cases')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('更新医案失败', error);
      throw new Error('更新医案失败');
    }

    return { code: 200, msg: 'success', data };
  }

  /**
   * 删除医案
   */
  async deleteCase(id: string) {
    const client = getSupabaseClient();
    const { error } = await client
      .from('medical_cases')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('删除医案失败', error);
      throw new Error('删除医案失败');
    }

    return { code: 200, msg: 'success', data: null };
  }

  /**
   * AI分析医案（提取诊断规律）
   */
  async analyzeCase(caseId: string) {
    const client = getSupabaseClient();
    // 获取医案详情
    const { data: caseData, error } = await client
      .from('medical_cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error || !caseData) {
      throw new Error('医案不存在');
    }

    // 使用AI分析医案
    const prompt = `请分析以下中医医案，提取关键信息：

医生：${caseData.doctor_name}
年代：${caseData.doctor_era || '未知'}
主诉：${caseData.main_symptoms}
现病史：${caseData.current_illness || '无'}
既往史：${caseData.past_history || '无'}
舌象：${caseData.tongue || '未记录'}
脉象：${caseData.pulse || '未记录'}
诊断：${caseData.diagnosis}
方名：${caseData.prescription_name || '未记录'}
组成：${caseData.prescription_composition || '未记录'}
治疗结果：${caseData.treatment_result || '未记录'}

请以JSON格式返回以下信息：
{
  "symptomKeywords": ["症状关键词1", "症状关键词2", ...],
  "diagnosisPattern": "诊断模式（如：太阳病、少阳病、阳明病等）",
  "keyFeatures": ["关键特征1", "关键特征2", ...],
  "treatmentLogic": "治疗逻辑",
  "effectivenessScore": 0.95
}`;

    try {
      const response = await this.llmService.chat(
        prompt,
        [],
      );

      // 解析AI响应
      const analysis = JSON.parse(response.content);

      // 更新医案的AI分析结果
      await client
        .from('medical_cases')
        .update({
          symptom_keywords: analysis.symptomKeywords || [],
          diagnosis_pattern: analysis.diagnosisPattern || '',
          effectiveness_score: analysis.effectivenessScore || 0.9,
        })
        .eq('id', caseId);

      this.logger.log(`医案 ${caseId} 分析成功`);
      return { code: 200, msg: 'success', data: analysis };
    } catch (err) {
      this.logger.error('AI分析医案失败', err);
      throw new Error('AI分析医案失败');
    }
  }

  /**
   * 匹配相似医案
   */
  async matchSimilarCases(dto: MatchCasesDto) {
    const limit = dto.limit || 5;

    // 先用AI提取症状关键词
    const keywordPrompt = `请从以下用户症状中提取关键词（返回JSON数组格式）：

症状：${dto.symptoms}
${dto.tongue ? `舌象：${dto.tongue}` : ''}
${dto.pulse ? `脉象：${dto.pulse}` : ''}

请返回JSON数组格式：
["关键词1", "关键词2", "关键词3", ...]`;

    let keywords: string[] = [];
    try {
      const keywordResponse = await this.llmService.chat(
        keywordPrompt,
        [],
      );
      keywords = JSON.parse(keywordResponse.content);
    } catch (err) {
      // 如果AI提取失败，使用简单的分词
      keywords = dto.symptoms.split(/[，。、；；\s]+/).filter((k) => k.length > 1);
    }

    this.logger.log(`提取症状关键词：${keywords.join(', ')}`);

    const supabase = getSupabaseClient();

    // 查询包含这些关键词的医案
    const { data, error } = await supabase
      .from('medical_cases')
      .select('*')
      .or(
        keywords
          .map((keyword) => `main_symptoms.ilike.%${keyword}%`)
          .join(','),
      )
      .order('effectiveness_score', { ascending: false })
      .limit(limit * 2); // 多取一些，再用AI排序

    if (error) {
      this.logger.error('匹配医案失败', error);
      throw new Error('匹配医案失败');
    }

    // 使用AI计算相似度并排序
    const matchPrompt = `请计算以下用户与各个医案的相似度（0-1之间，1为最相似），按相似度排序：

用户症状：${dto.symptoms}
${dto.tongue ? `舌象：${dto.tongue}` : ''}
${dto.pulse ? `脉象：${dto.pulse}` : ''}

医案列表：
${data
  .map(
    (c, i) => `
${i + 1}. 医生：${c.doctor_name}
   主诉：${c.main_symptoms}
   舌象：${c.tongue || '未记录'}
   脉象：${c.pulse || '未记录'}
   诊断：${c.diagnosis}
   方名：${c.prescription_name || '未记录'}
`,
  )
  .join('\n')}

请返回JSON格式：
[
  {
    "caseId": "医案ID",
    "similarity": 0.95,
    "reason": "相似原因说明"
  },
  ...
]

只返回相似度前${limit}个医案。`;

    try {
      const matchResponse = await this.llmService.chat(
        matchPrompt,
        [],
      );

      const matches = JSON.parse(matchResponse.content);

      const supabase = getSupabaseClient();

      // 获取匹配到的医案详情
      const matchedCases = await Promise.all(
        matches.map(async (match: any) => {
          const { data: caseDetail } = await supabase
            .from('medical_cases')
            .select('*')
            .eq('id', match.caseId)
            .single();
          return {
            ...caseDetail,
            similarity: match.similarity,
            reason: match.reason,
          };
        }),
      );

      return {
        code: 200,
        msg: 'success',
        data: {
          keywords,
          cases: matchedCases,
        },
      };
    } catch (err) {
      this.logger.error('AI计算相似度失败，使用原始数据', err);
      // 失败时返回原始数据
      return {
        code: 200,
        msg: 'success',
        data: {
          keywords,
          cases: data.slice(0, limit),
        },
      };
    }
  }

  /**
   * AI问询参考医案（简化版，不包含完整处方）
   */
  async getInquiryReference(dto: MatchCasesDto) {
    const limit = dto.limit || 3;

    // 先用AI提取症状关键词
    const keywordPrompt = `请从以下用户症状中提取关键词（返回JSON数组格式）：

症状：${dto.symptoms}
${dto.tongue ? `舌象：${dto.tongue}` : ''}
${dto.pulse ? `脉象：${dto.pulse}` : ''}

请返回JSON数组格式：
["关键词1", "关键词2", "关键词3", ...]`;

    let keywords: string[] = [];
    try {
      const keywordResponse = await this.llmService.chat(
        keywordPrompt,
        [],
      );
      keywords = JSON.parse(keywordResponse.content);
    } catch (err) {
      // 如果AI提取失败，使用简单的分词
      keywords = dto.symptoms.split(/[，。、；；\s]+/).filter((k) => k.length > 1);
    }

    this.logger.log(`AI问询参考 - 提取症状关键词：${keywords.join(', ')}`);

    const supabase = getSupabaseClient();

    // 查询包含这些关键词的医案
    const { data, error } = await supabase
      .from('medical_cases')
      .select('*')
      .or(
        keywords
          .map((keyword) => `main_symptoms.ilike.%${keyword}%`)
          .join(','),
      )
      .order('effectiveness_score', { ascending: false })
      .limit(limit * 2);

    if (error) {
      this.logger.error('AI问询参考 - 查询医案失败', error);
      throw new Error('查询医案失败');
    }

    // 使用AI计算相似度并排序，返回简化版医案（不包含完整处方）
    const matchPrompt = `请计算以下用户与各个医案的相似度（0-1之间，1为最相似），按相似度排序。

用户症状：${dto.symptoms}
${dto.tongue ? `舌象：${dto.tongue}` : ''}
${dto.pulse ? `脉象：${dto.pulse}` : ''}

医案列表：
${data
  .map(
    (c, i) => `
${i + 1}. 医生：${c.doctor_name}
   主诉：${c.main_symptoms}
   舌象：${c.tongue || '未记录'}
   脉象：${c.pulse || '未记录'}
   诊断：${c.diagnosis}
   辨证：${c.differentiation || '未记录'}
   治则：${c.treatment_principle || '未记录'}
`,
  )
  .join('\n')}

请返回JSON格式：
[
  {
    "caseId": "医案ID",
    "similarity": 0.95,
    "reason": "相似原因说明"
  },
  ...

只返回相似度前${limit}个医案。`;

    try {
      const matchResponse = await this.llmService.chat(
        matchPrompt,
        [],
      );

      const matches = JSON.parse(matchResponse.content);

      const supabase = getSupabaseClient();

      // 获取匹配到的医案详情（简化版）
      const matchedCases = await Promise.all(
        matches.map(async (match: any) => {
          const { data: caseDetail } = await supabase
            .from('medical_cases')
            .select('*')
            .eq('id', match.caseId)
            .single();

          // 返回简化版医案信息，不包含完整处方
          return {
            id: caseDetail.id,
            doctorName: caseDetail.doctor_name,
            doctorEra: caseDetail.doctor_era,
            mainSymptoms: caseDetail.main_symptoms,
            diagnosis: caseDetail.diagnosis,
            differentiation: caseDetail.differentiation,
            treatmentPrinciple: caseDetail.treatment_principle,
            effectivenessScore: caseDetail.effectiveness_score,
            similarity: match.similarity,
            reason: match.reason,
          };
        }),
      );

      return {
        code: 200,
        msg: 'success',
        data: {
          keywords,
          cases: matchedCases,
        },
      };
    } catch (err) {
      this.logger.error('AI问询参考 - AI计算相似度失败，使用原始数据', err);
      // 失败时返回原始数据（简化版）
      return {
        code: 200,
        msg: 'success',
        data: {
          keywords,
          cases: data.slice(0, limit).map((c: any) => ({
            id: c.id,
            doctorName: c.doctor_name,
            doctorEra: c.doctor_era,
            mainSymptoms: c.main_symptoms,
            diagnosis: c.diagnosis,
            differentiation: c.differentiation,
            treatmentPrinciple: c.treatment_principle,
            effectivenessScore: c.effectiveness_score,
            similarity: 0.5,
            reason: '基于关键词匹配',
          })),
        },
      };
    }
  }

  /**
   * 推荐处方（基于相似医案）
   */
  async recommendPrescription(dto: RecommendPrescriptionDto) {
    // 1. 匹配相似医案
    const matchResult = await this.matchSimilarCases({
      symptoms: dto.symptoms,
      tongue: dto.tongue,
      pulse: dto.pulse,
      limit: 5,
    });

    if (!matchResult.data.cases || matchResult.data.cases.length === 0) {
      return {
        code: 200,
        msg: 'success',
        data: {
          hasMatch: false,
          message: '未找到相似医案，请使用常规诊疗流程',
        },
      };
    }

    const similarCases = matchResult.data.cases;

    // 2. 使用AI生成处方推荐
    const recommendPrompt = `根据以下用户信息和相似医案，推荐合适的处方：

用户信息：
性别：${dto.patientGender || '未知'}
年龄：${dto.patientAge || '未知'}
症状：${dto.symptoms}
${dto.currentIllness ? `现病史：${dto.currentIllness}` : ''}
${dto.tongue ? `舌象：${dto.tongue}` : ''}
${dto.pulse ? `脉象：${dto.pulse}` : ''}

相似医案（按相似度排序）：
${similarCases
  .map(
    (c, i) => `
${i + 1}. 医生：${c.doctor_name}（${c.doctor_era || '时代不详'}）
   相似度：${c.similarity || '未知'}
   主诉：${c.main_symptoms}
   舌象：${c.tongue || '未记录'}
   脉象：${c.pulse || '未记录'}
   诊断：${c.diagnosis}
   方名：${c.prescription_name || '未记录'}
   组成：${c.prescription_composition || '未记录'}
   用量：${c.prescription_dosage || '未记录'}
   用法：${c.prescription_usage || '未记录'}
   治疗结果：${c.treatment_result || '未记录'}
   相似原因：${c.reason || '未说明'}
`,
  )
  .join('\n')}

请返回JSON格式：
{
  "prescriptionName": "推荐的方名（如果相似医案中有，请优先使用；如果没有，根据诊断推荐经典经方）",
  "prescriptionComposition": "组成（药物及用量）",
  "prescriptionDosage": "用量说明",
  "prescriptionUsage": "用法说明",
  "diagnosis": "诊断结论",
  "diagnosisReason": "诊断理由",
  "referenceCases": ["参考的医案ID1", "参考的医案ID2"],
  "warnings": ["注意事项1", "注意事项2"],
  "successRate": 0.9
}`;

    try {
      const recommendResponse = await this.llmService.chat(
        recommendPrompt,
        [],
      );

      const recommendation = JSON.parse(recommendResponse.content);

      return {
        code: 200,
        msg: 'success',
        data: {
          hasMatch: true,
          similarCases,
          recommendation,
        },
      };
    } catch (err) {
      this.logger.error('AI推荐处方失败', err);
      // 失败时返回相似医案，让用户自己判断
      return {
        code: 200,
        msg: 'success',
        data: {
          hasMatch: true,
          similarCases,
          recommendation: null,
          message: 'AI推荐失败，请参考相似医案自行判断',
        },
      };
    }
  }

  /**
   * 提交治疗反馈
   */
  async submitFeedback(
    dto: CaseFeedbackDto,
    userId: string,
    recordId?: string,
  ) {
    const supabase = getSupabaseClient();
    const feedbackId = uuidv4();

    const { data, error } = await supabase
      .from('medical_case_feedback')
      .insert({
        id: feedbackId,
        case_id: dto.caseId,
        patient_id: userId,
        record_id: recordId || null,
        effectiveness: dto.effectiveness,
        symptom_improvement: dto.symptomImprovement,
        actual_prescription: dto.actualPrescription,
        dosage_adjustment: dto.dosageAdjustment,
        success: dto.success,
        learning_notes: dto.learningNotes,
        improvement_suggestions: dto.improvementSuggestions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      this.logger.error('提交反馈失败', error);
      throw new Error('提交反馈失败');
    }

    // 如果反馈为成功，更新医案的有效率
    if (dto.success) {
      await this.updateCaseEffectiveness(dto.caseId);
    }

    return { code: 200, msg: 'success', data };
  }

  /**
   * 更新医案有效率
   */
  private async updateCaseEffectiveness(caseId: string) {
    const supabase = getSupabaseClient();
    // 计算医案的平均成功率
    const { data: feedbacks, error } = await supabase
      .from('medical_case_feedback')
      .select('success')
      .eq('case_id', caseId);

    if (!error && feedbacks && feedbacks.length > 0) {
      const successCount = feedbacks.filter((f) => f.success).length;
      const effectivenessScore = successCount / feedbacks.length;

      await supabase
        .from('medical_cases')
        .update({ effectiveness_score: effectivenessScore })
        .eq('id', caseId);
    }
  }

  /**
   * 获取所有医生列表
   */
  async getDoctorsList() {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('medical_cases')
      .select('doctor_name, doctor_era')
      .order('doctor_name', { ascending: true });

    if (error) {
      this.logger.error('获取医生列表失败', error);
      throw new Error('获取医生列表失败');
    }

    // 去重
    const uniqueDoctors = Array.from(
      new Map(data.map((item) => [item.doctor_name, item])).values(),
    );

    return { code: 200, msg: 'success', data: uniqueDoctors };
  }
}
