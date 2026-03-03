import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface AbuseDetectionResult {
  isAbuse: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
  recommendation: string;
}

export interface PrescriptionRecord {
  id: string;
  userId: string;
  patientId: string;
  diagnosis: string;
  prescriptionName: string;
  symptoms: string;
  createdAt: Date;
}

@Injectable()
export class AbuseDetectionService {
  private supabase = getSupabaseClient();

  /**
   * 检测个人用户是否存在滥用诊疗行为
   */
  async detectAbuse(userId: string, patientId: string, diagnosis: string, symptoms: string, prescriptionName: string): Promise<AbuseDetectionResult> {
    const reasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // 1. 检测一天内的处方开具频率
    const frequencyResult = await this.checkPrescriptionFrequency(userId);
    if (frequencyResult.isAbuse && frequencyResult.reason) {
      reasons.push(frequencyResult.reason);
      riskLevel = this.updateRiskLevel(riskLevel, frequencyResult.riskLevel);
    }

    // 2. 检测为多个不同用户开方的异常行为
    const multiPatientResult = await this.checkMultiPatientUsage(userId, patientId);
    if (multiPatientResult.isAbuse && multiPatientResult.reason) {
      reasons.push(multiPatientResult.reason);
      riskLevel = this.updateRiskLevel(riskLevel, multiPatientResult.riskLevel);
    }

    // 3. 检测同一用户的诊断冲突
    const diagnosisConflictResult = await this.checkDiagnosisConflict(userId, patientId, diagnosis);
    if (diagnosisConflictResult.isAbuse && diagnosisConflictResult.reason) {
      reasons.push(diagnosisConflictResult.reason);
      riskLevel = this.updateRiskLevel(riskLevel, diagnosisConflictResult.riskLevel);
    }

    // 4. 检测症状逻辑合理性
    const symptomLogicResult = this.checkSymptomLogic(symptoms, diagnosis);
    if (symptomLogicResult.isAbuse && symptomLogicResult.reason) {
      reasons.push(symptomLogicResult.reason);
      riskLevel = this.updateRiskLevel(riskLevel, symptomLogicResult.riskLevel);
    }

    // 5. 检测处方重复性
    const duplicateResult = await this.checkDuplicatePrescription(userId, prescriptionName, patientId);
    if (duplicateResult.isAbuse && duplicateResult.reason) {
      reasons.push(duplicateResult.reason);
      riskLevel = this.updateRiskLevel(riskLevel, duplicateResult.riskLevel);
    }

    // 生成推荐操作
    const isAbuse = reasons.length > 0;
    const recommendation = this.generateRecommendation(riskLevel, reasons);

    // 如果检测到滥用行为，记录到数据库
    if (isAbuse) {
      await this.recordAbuseDetection(userId, patientId, diagnosis, symptoms, prescriptionName, riskLevel, reasons);
    }

    return {
      isAbuse,
      riskLevel,
      reasons,
      recommendation
    };
  }

  /**
   * 检测一天内的处方开具频率
   */
  private async checkPrescriptionFrequency(userId: string): Promise<{ isAbuse: boolean; reason?: string; riskLevel: 'low' | 'medium' | 'high' }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const { data: prescriptions, error } = await this.supabase
      .from('medical_records')
      .select('id, patient_id, diagnosis, created_at')
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString());

    if (error) {
      console.error('查询处方频率失败:', error);
      return { isAbuse: false, riskLevel: 'low' };
    }

    const prescriptionCount = prescriptions?.length || 0;

    // 阈值：一天内超过 5 张处方视为中等风险，超过 10 张视为高风险
    if (prescriptionCount >= 10) {
      return {
        isAbuse: true,
        reason: `一天内已开具 ${prescriptionCount} 张处方，超出正常诊疗范围（高风险阈值：10 张/天）`,
        riskLevel: 'high'
      };
    } else if (prescriptionCount >= 5) {
      return {
        isAbuse: true,
        reason: `一天内已开具 ${prescriptionCount} 张处方，接近诊疗上限（中等风险阈值：5 张/天）`,
        riskLevel: 'medium'
      };
    }

    return { isAbuse: false, riskLevel: 'low' };
  }

  /**
   * 检测为多个不同用户开方的异常行为
   */
  private async checkMultiPatientUsage(userId: string, currentPatientId: string): Promise<{ isAbuse: boolean; reason?: string; riskLevel: 'low' | 'medium' | 'high' }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const { data: prescriptions, error } = await this.supabase
      .from('medical_records')
      .select('id, patient_id, diagnosis')
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString());

    if (error) {
      console.error('查询多用户使用失败:', error);
      return { isAbuse: false, riskLevel: 'low' };
    }

    // 统计不同用户数量
    const uniquePatients = new Set(prescriptions?.map(p => p.patient_id) || []);
    uniquePatients.add(currentPatientId);

    // 个人用户一天内为 4 个以上不同用户开方，视为可能滥用
    if (uniquePatients.size >= 4) {
      return {
        isAbuse: true,
        reason: `一天内为 ${uniquePatients.size} 位不同用户开具处方，疑似为他人诊疗牟利（阈值：4 人/天）`,
        riskLevel: 'high'
      };
    } else if (uniquePatients.size >= 3) {
      return {
        isAbuse: true,
        reason: `一天内为 ${uniquePatients.size} 位不同用户开具处方，需警惕（阈值：3 人/天）`,
        riskLevel: 'medium'
      };
    }

    return { isAbuse: false, riskLevel: 'low' };
  }

  /**
   * 检测同一用户的诊断冲突
   */
  private async checkDiagnosisConflict(userId: string, patientId: string, newDiagnosis: string): Promise<{ isAbuse: boolean; reason?: string; riskLevel: 'low' | 'medium' | 'high' }> {
    const { data: records, error } = await this.supabase
      .from('medical_records')
      .select('id, diagnosis, created_at')
      .eq('user_id', userId)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('查询诊断历史失败:', error);
      return { isAbuse: false, riskLevel: 'low' };
    }

    if (!records || records.length === 0) {
      return { isAbuse: false, riskLevel: 'low' };
    }

    // 检测最近的诊断是否与新诊断冲突
    const lastDiagnosis = records[0].diagnosis;
    const lastDiagnosisTime = new Date(records[0].created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastDiagnosisTime.getTime()) / (1000 * 60 * 60);

    // 如果在 24 小时内诊断完全不同，提示可能存在冲突
    if (hoursDiff < 24 && lastDiagnosis && newDiagnosis !== lastDiagnosis) {
      // 简单判断：如果诊断关键词重叠度很低，视为冲突
      const overlapScore = this.calculateDiagnosisOverlap(lastDiagnosis, newDiagnosis);

      if (overlapScore < 0.3) {
        return {
          isAbuse: true,
          reason: `同一用户 ${hoursDiff.toFixed(1)} 小时内诊断从"${lastDiagnosis}"变为"${newDiagnosis}"，疑似逻辑冲突`,
          riskLevel: 'medium'
        };
      }
    }

    return { isAbuse: false, riskLevel: 'low' };
  }

  /**
   * 检测症状逻辑合理性
   */
  private checkSymptomLogic(symptoms: string, diagnosis: string): { isAbuse: boolean; reason?: string; riskLevel: 'low' | 'medium' | 'high' } {
    if (!symptoms || !diagnosis) {
      return { isAbuse: false, riskLevel: 'low' };
    }

    // 检测症状是否过于简单或异常
    const symptomLength = symptoms.trim().length;
    if (symptomLength < 10) {
      return {
        isAbuse: true,
        reason: '症状描述过于简单（少于 10 字符），可能存在随意填写的情况',
        riskLevel: 'medium'
      };
    }

    // 检测症状是否包含多个完全不相关的病症
    const symptomParts = symptoms.split(/[，。；；,;\n]/).filter(s => s.trim().length > 0);
    if (symptomParts.length >= 6) {
      return {
        isAbuse: true,
        reason: `症状描述包含 ${symptomParts.length} 个不同症状项，可能存在罗列无关症状的情况`,
        riskLevel: 'high'
      };
    }

    return { isAbuse: false, riskLevel: 'low' };
  }

  /**
   * 检测处方重复性
   */
  private async checkDuplicatePrescription(userId: string, prescriptionName: string, patientId: string): Promise<{ isAbuse: boolean; reason?: string; riskLevel: 'low' | 'medium' | 'high' }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const { data: records, error } = await this.supabase
      .from('medical_records')
      .select('id, diagnosis, created_at')
      .eq('user_id', userId)
      .contains('diagnosis', prescriptionName)
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString());

    if (error) {
      console.error('查询重复处方失败:', error);
      return { isAbuse: false, riskLevel: 'low' };
    }

    // 如果同一处方在一天内被多次使用
    if (records && records.length >= 3) {
      return {
        isAbuse: true,
        reason: `同一处方"${prescriptionName}"在一天内被使用 ${records.length} 次，疑似批量开方`,
        riskLevel: 'high'
      };
    } else if (records && records.length >= 2) {
      return {
        isAbuse: true,
        reason: `同一处方"${prescriptionName}"在一天内被使用 ${records.length} 次，需警惕`,
        riskLevel: 'medium'
      };
    }

    return { isAbuse: false, riskLevel: 'low' };
  }

  /**
   * 计算诊断重叠度
   */
  private calculateDiagnosisOverlap(diagnosis1: string, diagnosis2: string): number {
    const keywords1 = new Set(diagnosis1.split(/[，。；；,;\s]+/).filter(k => k.length >= 2));
    const keywords2 = new Set(diagnosis2.split(/[，。；；,;\s]+/).filter(k => k.length >= 2));

    if (keywords1.size === 0 || keywords2.size === 0) {
      return 0;
    }

    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    const union = new Set([...keywords1, ...keywords2]);

    return intersection.size / union.size;
  }

  /**
   * 更新风险等级
   */
  private updateRiskLevel(current: 'low' | 'medium' | 'high', newLevel: 'low' | 'medium' | 'high'): 'low' | 'medium' | 'high' {
    const levels = ['low', 'medium', 'high'];
    return levels[Math.max(levels.indexOf(current), levels.indexOf(newLevel))] as 'low' | 'medium' | 'high';
  }

  /**
   * 生成推荐操作
   */
  private generateRecommendation(riskLevel: 'low' | 'medium' | 'high', reasons: string[]): string {
    if (riskLevel === 'high') {
      return `⚠️ 检测到高风险滥用行为！\n\n异常原因：\n${reasons.map(r => `• ${r}`).join('\n')}\n\n建议操作：\n1. 立即停止本次处方开具\n2. 联系管理员进行人工审核\n3. 个人用户仅供科研教学使用，严禁为他人诊疗牟利`;
    } else if (riskLevel === 'medium') {
      return `⚠️ 检测到疑似滥用行为！\n\n异常原因：\n${reasons.map(r => `• ${r}`).join('\n')}\n\n建议操作：\n1. 请确认诊疗行为是否符合规定\n2. 个人用户仅供科研教学使用\n3. 如有疑问请联系管理员`;
    }

    return '';
  }

  /**
   * 记录异常检测到数据库
   */
  private async recordAbuseDetection(
    userId: string,
    patientId: string | undefined,
    diagnosis: string | undefined,
    symptoms: string | undefined,
    prescriptionName: string | undefined,
    riskLevel: 'low' | 'medium' | 'high',
    reasons: string[]
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('abuse_detection_records')
        .insert({
          user_id: userId,
          patient_id: patientId || null,
          diagnosis: diagnosis || '',
          symptoms: symptoms || '',
          prescription_name: prescriptionName || '',
          risk_level: riskLevel,
          reasons,
          detected_at: new Date().toISOString()
        });

      if (error) {
        console.error('记录异常检测失败:', error);
      }
    } catch (err) {
      console.error('记录异常检测异常:', err);
    }
  }

  /**
   * 获取用户的异常检测记录（管理员用）
   */
  async getAbuseDetectionRecords(userId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('abuse_detection_records')
      .select('*')
      .eq('user_id', userId)
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('查询异常检测记录失败:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 获取高风险用户列表（管理员用）
   */
  async getHighRiskUsers(days: number = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('abuse_detection_records')
      .select('user_id, risk_level, detected_at')
      .gte('detected_at', startDate.toISOString())
      .in('risk_level', ['medium', 'high']);

    if (error) {
      console.error('查询高风险用户失败:', error);
      return [];
    }

    // 统计每个用户的高风险次数
    const userRiskMap = new Map<string, { high: number; medium: number; lastDetected: string }>();

    (data || []).forEach(record => {
      const userId = record.user_id;
      if (!userRiskMap.has(userId)) {
        userRiskMap.set(userId, { high: 0, medium: 0, lastDetected: record.detected_at });
      }
      const userRisk = userRiskMap.get(userId)!;
      if (record.risk_level === 'high') {
        userRisk.high++;
      } else if (record.risk_level === 'medium') {
        userRisk.medium++;
      }
      userRisk.lastDetected = userRisk.lastDetected > record.detected_at ? userRisk.lastDetected : record.detected_at;
    });

    // 返回高风险用户列表
    return Array.from(userRiskMap.entries())
      .map(([userId, stats]) => ({
        userId,
        highRiskCount: stats.high,
        mediumRiskCount: stats.medium,
        totalRiskCount: stats.high + stats.medium,
        lastDetected: stats.lastDetected
      }))
      .filter(user => user.totalRiskCount >= 3)
      .sort((a, b) => b.totalRiskCount - a.totalRiskCount);
  }
}
