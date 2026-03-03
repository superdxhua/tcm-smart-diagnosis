/**
 * 顶级经方大师 - 专家反馈闭环机制
 * 持续学习与模型优化
 */

import { Injectable, Logger } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import {
  ExpertFeedback,
  ModelUpdate,
  KnowledgeUnit,
  SyndromeOntology,
} from './ontology-types';

@Injectable()
export class ExpertFeedbackService {
  private readonly logger = new Logger(ExpertFeedbackService.name);

  constructor() {
    // 不再需要实例化 SupabaseClientService
  }

  /**
   * 提交专家反馈
   */
  async submitFeedback(feedback: ExpertFeedback): Promise<{ success: boolean; feedbackId: string }> {
    try {
      this.logger.log(`提交专家反馈: ${feedback.expertDiagnosis}`);

      // 1. 存储反馈到数据库
      const { data, error } = await getSupabaseClient()
        .from('expert_feedbacks')
        .insert({
          session_id: feedback.sessionId,
          original_diagnosis: feedback.originalDiagnosis,
          expert_diagnosis: feedback.expertDiagnosis,
          formula: feedback.formula,
          outcome: feedback.outcome,
          feedback_details: feedback.feedbackDetails,
          expert_id: feedback.expertId,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        this.logger.error('存储反馈失败:', error);
        throw error;
      }

      const feedbackId = data.id;

      // 2. 根据反馈更新模型权重
      const modelUpdate = await this.updateModelWeights(feedback);

      // 3. 存储模型更新记录
      await this.storeModelUpdate(feedbackId, modelUpdate);

      // 4. 如果疗效为"有效"，更新知识单元置信度
      if (feedback.outcome === 'effective') {
        await this.updateKnowledgeUnitConfidence(feedback);
      }

      this.logger.log(`专家反馈提交成功，反馈ID: ${feedbackId}`);

      return { success: true, feedbackId };
    } catch (error) {
      this.logger.error('提交专家反馈失败:', error);
      throw error;
    }
  }

  /**
   * 更新模型权重
   * 根据专家反馈调整症状-证候、证候-方剂的关联权重
   */
  private async updateModelWeights(feedback: ExpertFeedback): Promise<ModelUpdate> {
    const updatedWeights: ModelUpdate['updatedWeights'] = {};
    const updatedProbabilities: ModelUpdate['updatedProbabilities'] = {};

    // 1. 更新症状权重
    for (const item of feedback.feedbackDetails.correctItems) {
      // 增加正确项的权重
      const key = `symptom_${item}`;
      const oldWeight = await this.getWeight(key);
      const newWeight = Math.min(1, oldWeight + 0.05);

      updatedWeights[key] = {
        oldWeight,
        newWeight,
        delta: newWeight - oldWeight,
      };

      this.setWeight(key, newWeight);
    }

    for (const item of feedback.feedbackDetails.incorrectItems) {
      // 降低错误项的权重
      const key = `symptom_${item}`;
      const oldWeight = await this.getWeight(key);
      const newWeight = Math.max(0, oldWeight - 0.1);

      updatedWeights[key] = {
        oldWeight,
        newWeight,
        delta: newWeight - oldWeight,
      };

      this.setWeight(key, newWeight);
    }

    // 2. 更新证候概率
    const oldProb = await this.getProbability(feedback.expertDiagnosis);
    const newProb = Math.min(1, oldProb + 0.05);

    updatedProbabilities[feedback.expertDiagnosis] = {
      oldProbability: oldProb,
      newProbability: newProb,
      delta: newProb - oldProb,
    };

    this.setProbability(feedback.expertDiagnosis, newProb);

    return {
      feedbackId: feedback.sessionId,
      updatedWeights,
      updatedProbabilities,
    };
  }

  /**
   * 存储模型更新记录
   */
  private async storeModelUpdate(feedbackId: string, update: ModelUpdate): Promise<void> {
    try {
      await getSupabaseClient()
        .from('model_updates')
        .insert({
          feedback_id: feedbackId,
          updated_weights: update.updatedWeights,
          updated_probabilities: update.updatedProbabilities,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      this.logger.error('存储模型更新记录失败:', error);
    }
  }

  /**
   * 更新知识单元置信度
   * 仅当疗效为"有效"时调用
   */
  private async updateKnowledgeUnitConfidence(feedback: ExpertFeedback): Promise<void> {
    // 根据专家诊断找到对应的知识单元
    // 这里需要实现知识单元查找逻辑
    // 暂时跳过，等待知识图谱完善后实现
    this.logger.log('更新知识单元置信度:', feedback.expertDiagnosis);
  }

  /**
   * 获取权重
   */
  private async getWeight(key: string): Promise<number> {
    try {
      const { data } = await getSupabaseClient()
        .from('model_weights')
        .select('weight')
        .eq('key', key)
        .single();

      return data?.weight || 0.5;
    } catch (error) {
      return 0.5;
    }
  }

  /**
   * 设置权重
   */
  private async setWeight(key: string, weight: number): Promise<void> {
    try {
      await getSupabaseClient()
        .from('model_weights')
        .upsert({
          key,
          weight,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      this.logger.error('设置权重失败:', error);
    }
  }

  /**
   * 获取概率
   */
  private async getProbability(key: string): Promise<number> {
    try {
      const { data } = await getSupabaseClient()
        .from('syndrome_probabilities')
        .select('probability')
        .eq('syndrome_id', key)
        .single();

      return data?.probability || 0.5;
    } catch (error) {
      return 0.5;
    }
  }

  /**
   * 设置概率
   */
  private async setProbability(key: string, probability: number): Promise<void> {
    try {
      await getSupabaseClient()
        .from('syndrome_probabilities')
        .upsert({
          syndrome_id: key,
          probability,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      this.logger.error('设置概率失败:', error);
    }
  }

  /**
   * 获取反馈统计
   */
  async getFeedbackStatistics(expertId?: string): Promise<{
    totalFeedbacks: number;
    effectiveRate: number;
    commonMistakes: string[];
    topCorrectDiagnoses: string[];
  }> {
    try {
      let query = getSupabaseClient()
        .from('expert_feedbacks')
        .select('*');

      if (expertId) {
        query = query.eq('expert_id', expertId);
      }

      const { data, error } = await query;

      if (error || !data) {
        throw error || new Error('无法获取反馈统计');
      }

      const totalFeedbacks = data.length;
      const effectiveCount = data.filter(f => f.outcome === 'effective').length;
      const effectiveRate = totalFeedbacks > 0 ? effectiveCount / totalFeedbacks : 0;

      // 统计常见错误
      const mistakeMap = new Map<string, number>();
      data.forEach(f => {
        f.feedback_details.incorrectItems.forEach((item: string) => {
          mistakeMap.set(item, (mistakeMap.get(item) || 0) + 1);
        });
      });

      const commonMistakes = Array.from(mistakeMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([mistake]) => mistake);

      // 统计最常出现的正确诊断
      const diagnosisMap = new Map<string, number>();
      data.forEach(f => {
        if (f.outcome === 'effective') {
          diagnosisMap.set(f.expert_diagnosis, (diagnosisMap.get(f.expert_diagnosis) || 0) + 1);
        }
      });

      const topCorrectDiagnoses = Array.from(diagnosisMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([diagnosis]) => diagnosis);

      return {
        totalFeedbacks,
        effectiveRate,
        commonMistakes,
        topCorrectDiagnoses,
      };
    } catch (error) {
      this.logger.error('获取反馈统计失败:', error);
      throw error;
    }
  }

  /**
   * 批量导入反馈（用于模型训练）
   */
  async importFeedbacks(feedbacks: ExpertFeedback[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const feedback of feedbacks) {
      try {
        await this.submitFeedback(feedback);
        success++;
      } catch (error) {
        failed++;
        errors.push(`反馈 ${feedback.sessionId} 导入失败: ${error}`);
      }
    }

    return { success, failed, errors };
  }

  /**
   * 获取模型更新历史
   */
  async getModelUpdateHistory(limit: number = 100): Promise<ModelUpdate[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('model_updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error('获取模型更新历史失败:', error);
      return [];
    }
  }

  /**
   * 回滚模型更新
   */
  async rollbackModelUpdate(updateId: string): Promise<boolean> {
    try {
      // 1. 获取模型更新记录
      const { data: update, error: fetchError } = await getSupabaseClient()
        .from('model_updates')
        .select('*')
        .eq('id', updateId)
        .single();

      if (fetchError || !update) {
        throw fetchError || new Error('未找到模型更新记录');
      }

      // 2. 回滚权重更新
      Object.entries(update.updated_weights).forEach(([key, value]) => {
        const weightUpdate = value as { oldWeight: number; newWeight: number; delta: number };
        this.setWeight(key, weightUpdate.oldWeight);
      });

      // 3. 回滚概率更新
      Object.entries(update.updated_probabilities).forEach(([key, value]) => {
        const probUpdate = value as { oldProbability: number; newProbability: number; delta: number };
        this.setProbability(key, probUpdate.oldProbability);
      });

      // 4. 标记为已回滚
      await getSupabaseClient()
        .from('model_updates')
        .update({ rolled_back: true, rolled_back_at: new Date().toISOString() })
        .eq('id', updateId);

      this.logger.log(`模型更新已回滚: ${updateId}`);

      return true;
    } catch (error) {
      this.logger.error('回滚模型更新失败:', error);
      return false;
    }
  }
}
