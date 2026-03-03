import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { FormulaEvidence, FormulaMatchResult } from './formula-management.interfaces';

interface FormulaDB {
  id: string;
  formula_name: string;
  source: string;
  chapter: string;
  original_text: string;
  mechanism: string;
  treatment_method: string;
  indications: string[];
  contraindications: string[];
  dosage: string;
  instructions: string;
  meridian_category: string;
  comment: string;
  created_at: string;
  updated_at: string;
  version: number;
  is_active: boolean;
}

interface FormulaSymptom {
  formula_id: string;
  symptom: string;
  is_key: boolean;
  weight: number;
}

@Injectable()
export class FormulaManagementService {
  private supabase = getSupabaseClient();

  /**
   * 获取所有方剂（从 Supabase）
   */
  async getAllFormulas(): Promise<FormulaEvidence[]> {
    const { data: formulas, error } = await this.supabase
      .from('formulas')
      .select(`
        *,
        formula_symptoms (
          symptom,
          is_key,
          weight
        )
      `)
      .eq('is_active', true)
      .order('formula_name', { ascending: true });

    if (error) {
      console.error('获取所有方剂失败:', error);
      throw error;
    }

    return formulas.map(f => this.convertToFormulaEvidence(f));
  }

  /**
   * 根据六经分类获取方剂
   */
  async getFormulasByMeridian(meridian: string): Promise<FormulaEvidence[]> {
    const { data: formulas, error } = await this.supabase
      .from('formulas')
      .select(`
        *,
        formula_symptoms (
          symptom,
          is_key,
          weight
        )
      `)
      .eq('meridian_category', meridian)
      .eq('is_active', true)
      .order('formula_name', { ascending: true });

    if (error) {
      console.error(`获取 ${meridian} 病方剂失败:`, error);
      throw error;
    }

    return formulas.map(f => this.convertToFormulaEvidence(f));
  }

  /**
   * 根据治法获取方剂
   */
  async getFormulasByTreatmentMethod(treatmentMethod: string): Promise<FormulaEvidence[]> {
    const { data: formulas, error } = await this.supabase
      .from('formulas')
      .select(`
        *,
        formula_symptoms (
          symptom,
          is_key,
          weight
        )
      `)
      .eq('treatment_method', treatmentMethod)
      .eq('is_active', true)
      .order('formula_name', { ascending: true });

    if (error) {
      console.error(`获取治法为 ${treatmentMethod} 的方剂失败:`, error);
      throw error;
    }

    return formulas.map(f => this.convertToFormulaEvidence(f));
  }

  /**
   * 根据方剂名称获取详细信息
   */
  async getFormulaByName(formulaName: string): Promise<FormulaEvidence | null> {
    const { data: formula, error } = await this.supabase
      .from('formulas')
      .select(`
        *,
        formula_symptoms (
          symptom,
          is_key,
          weight
        )
      `)
      .eq('formula_name', formulaName)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // 未找到
      }
      console.error(`获取方剂 ${formulaName} 失败:`, error);
      throw error;
    }

    return this.convertToFormulaEvidence(formula);
  }

  /**
   * 根据症状匹配方剂（使用权重匹配）
   */
  async matchFormulasBySymptoms(symptoms: string[]): Promise<FormulaMatchResult[]> {
    // 查询包含任何症状的方剂
    const { data: matches, error } = await this.supabase
      .from('formula_symptoms')
      .select(`
        formula_id,
        symptom,
        is_key,
        weight,
        formulas!inner (
          formula_name,
          source,
          chapter,
          original_text,
          mechanism,
          treatment_method,
          indications,
          contraindications,
          dosage,
          instructions,
          meridian_category
        )
      `)
      .in('symptom', symptoms);

    if (error) {
      console.error('症状匹配失败:', error);
      throw error;
    }

    // 计算每个方剂的匹配分数
    const formulaScores = new Map<string, { formula: any, score: number }>();

    for (const match of matches as any[]) {
      const formulaName = match.formulas?.formula_name;
      const isKey = match.is_key;
      const weight = match.weight;

      // 计算匹配分数：主症权重更高
      const score = isKey ? weight * 2 : weight;

      if (!formulaScores.has(formulaName)) {
        formulaScores.set(formulaName, {
          formula: match.formulas,
          score: 0
        });
      }

      formulaScores.get(formulaName)!.score += score;
    }

    // 获取所有匹配方剂的完整信息（包括所有症状）
    const results: { formula: FormulaEvidence, matchScore: number }[] = [];
    for (const [formulaName, { formula, score }] of formulaScores.entries()) {
      const fullFormula = await this.getFormulaByName(formulaName);
      if (fullFormula) {
        results.push({
          formula: fullFormula,
          matchScore: Math.min(score / 10, 1) // 归一化到 0-1
        });
      }
    }

    // 按匹配分数降序排序
    return results.sort((a, b) => b.matchScore - a.matchScore) as FormulaMatchResult[];
  }

  /**
   * 获取方剂统计信息
   */
  async getFormulaStatistics() {
    // 获取所有方剂的统计信息
    const { count } = await this.supabase
      .from('formulas')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 按六经统计
    const { data: meridianData } = await this.supabase
      .from('formulas')
      .select('meridian_category')
      .eq('is_active', true)
      .not('meridian_category', 'is', null);

    const meridianStats: Record<string, number> = {};
    meridianData?.forEach(item => {
      const category = item.meridian_category || '其他';
      meridianStats[category] = (meridianStats[category] || 0) + 1;
    });

    // 按治法统计
    const { data: treatmentData } = await this.supabase
      .from('formulas')
      .select('treatment_method')
      .eq('is_active', true)
      .not('treatment_method', 'is', null);

    const treatmentMethodStats: Record<string, number> = {};
    treatmentData?.forEach(item => {
      const method = item.treatment_method;
      treatmentMethodStats[method] = (treatmentMethodStats[method] || 0) + 1;
    });

    return {
      total: count || 0,
      byMeridian: meridianStats,
      byTreatmentMethod: treatmentMethodStats,
    };
  }

  /**
   * 创建新方剂
   */
  async createFormula(data: FormulaEvidence & { createdBy?: string }): Promise<FormulaEvidence> {
    // 插入方剂
    const { data: formula, error: insertError } = await this.supabase
      .from('formulas')
      .insert({
        formula_name: data.formula,
        source: data.source,
        chapter: data.chapter,
        original_text: data.originalText,
        mechanism: data.mechanism,
        treatment_method: data.treatmentMethod,
        indications: data.indications,
        contraindications: data.contraindications,
        dosage: data.dosage,
        instructions: data.instructions,
        meridian_category: this.inferMeridianCategory(data),
        created_by: data.createdBy,
        comment: '用户手动创建',
      })
      .select()
      .single();

    if (insertError) {
      console.error('创建方剂失败:', insertError);
      throw insertError;
    }

    // 插入症状
    for (let i = 0; i < data.keySymptoms.length; i++) {
      await this.supabase
        .from('formula_symptoms')
        .insert({
          formula_id: formula.id,
          symptom: data.keySymptoms[i],
          is_key: true,
          weight: data.keySymptoms.length - i,
        });
    }

    // 创建历史版本
    await this.supabase
      .from('formula_versions')
      .insert({
        formula_id: formula.id,
        version: 1,
        data: JSON.stringify(data),
        change_reason: '创建新方剂',
        created_by: data.createdBy,
      });

    return this.convertToFormulaEvidence({
      ...formula,
      formula_symptoms: data.keySymptoms.map((symptom, index) => ({
        symptom,
        is_key: true,
        weight: data.keySymptoms.length - index,
      })),
    });
  }

  /**
   * 更新方剂
   */
  async updateFormula(formulaName: string, data: Partial<FormulaEvidence>, reason: string, userId?: string): Promise<FormulaEvidence> {
    // 获取当前方剂
    const currentFormula = await this.getFormulaByName(formulaName);
    if (!currentFormula) {
      throw new Error('方剂不存在');
    }

    // 获取当前版本号
    const { data: formulaRecord } = await this.supabase
      .from('formulas')
      .select('id, version')
      .eq('formula_name', formulaName)
      .single();

    if (!formulaRecord) {
      throw new Error('方剂不存在');
    }

    // 更新方剂数据
    const { data: updatedFormula, error: updateError } = await this.supabase
      .from('formulas')
      .update({
        ...(data.formula && { formula_name: data.formula }),
        ...(data.source && { source: data.source }),
        ...(data.chapter && { chapter: data.chapter }),
        ...(data.originalText && { original_text: data.originalText }),
        ...(data.mechanism && { mechanism: data.mechanism }),
        ...(data.treatmentMethod && { treatment_method: data.treatmentMethod }),
        ...(data.indications && { indications: data.indications }),
        ...(data.contraindications && { contraindications: data.contraindications }),
        ...(data.dosage && { dosage: data.dosage }),
        ...(data.instructions && { instructions: data.instructions }),
        version: formulaRecord.version + 1,
      })
      .eq('formula_name', formulaName)
      .select()
      .single();

    if (updateError) {
      console.error('更新方剂失败:', updateError);
      throw updateError;
    }

    // 更新症状
    if (data.keySymptoms) {
      // 删除旧症状
      await this.supabase
        .from('formula_symptoms')
        .delete()
        .eq('formula_id', updatedFormula.id);

      // 插入新症状
      for (let i = 0; i < data.keySymptoms.length; i++) {
        await this.supabase
          .from('formula_symptoms')
          .insert({
            formula_id: updatedFormula.id,
            symptom: data.keySymptoms[i],
            is_key: true,
            weight: data.keySymptoms.length - i,
          });
      }
    }

    // 创建历史版本
    await this.supabase
      .from('formula_versions')
      .insert({
        formula_id: updatedFormula.id,
        version: formulaRecord.version + 1,
        data: JSON.stringify({ ...currentFormula, ...data }),
        change_reason: reason,
        created_by: userId,
      });

    return await this.getFormulaByName(data.formula || formulaName) as FormulaEvidence;
  }

  /**
   * 删除方剂（软删除）
   */
  async deleteFormula(formulaName: string, userId?: string): Promise<void> {
    const { error } = await this.supabase
      .from('formulas')
      .update({ is_active: false })
      .eq('formula_name', formulaName);

    if (error) {
      console.error('删除方剂失败:', error);
      throw error;
    }
  }

  /**
   * 获取方剂历史版本
   */
  async getFormulaVersions(formulaName: string) {
    const { data: formula } = await this.supabase
      .from('formulas')
      .select('id')
      .eq('formula_name', formulaName)
      .single();

    if (!formula) {
      throw new Error('方剂不存在');
    }

    const { data, error } = await this.supabase
      .from('formula_versions')
      .select('*')
      .eq('formula_id', formula.id)
      .order('version', { ascending: false });

    if (error) {
      console.error('获取历史版本失败:', error);
      throw error;
    }

    return data?.map(v => ({
      version: v.version,
      data: JSON.parse(v.data),
      changeReason: v.change_reason,
      createdBy: v.created_by,
      createdAt: v.created_at,
    })) || [];
  }

  /**
   * 将数据库格式转换为 FormulaEvidence 格式
   */
  private convertToFormulaEvidence(formula: any): FormulaEvidence {
    // 提取症状
    const symptoms = formula.formula_symptoms || [];
    const keySymptoms = symptoms
      .filter((s: FormulaSymptom) => s.is_key)
      .sort((a: FormulaSymptom, b: FormulaSymptom) => b.weight - a.weight)
      .map((s: FormulaSymptom) => s.symptom);

    return {
      formula: formula.formula_name,
      source: formula.source,
      chapter: formula.chapter,
      originalText: formula.original_text,
      keySymptoms,
      mechanism: formula.mechanism,
      treatmentMethod: formula.treatment_method,
      indications: formula.indications || [],
      contraindications: formula.contraindications || [],
      dosage: formula.dosage,
      instructions: formula.instructions,
    };
  }

  /**
   * 推断六经分类
   */
  private inferMeridianCategory(data: FormulaEvidence): string {
    const formulaName = data.formula;

    if (formulaName.includes('桂枝') ||
        formulaName.includes('麻黄') ||
        formulaName.includes('葛根') ||
        formulaName.includes('五苓') ||
        formulaName.includes('桃核')) {
      return '太阳';
    } else if (formulaName.includes('白虎') ||
               formulaName.includes('承气') ||
               formulaName.includes('茵陈') ||
               formulaName.includes('泻心')) {
      return '阳明';
    } else if (formulaName.includes('柴胡') ||
               formulaName.includes('大柴胡') ||
               formulaName.includes('小柴胡')) {
      return '少阳';
    } else if (formulaName.includes('理中') ||
               formulaName.includes('建中') ||
               formulaName.includes('附子理中')) {
      return '太阴';
    } else if (formulaName.includes('四逆') ||
               formulaName.includes('真武') ||
               formulaName.includes('黄连阿胶') ||
               formulaName.includes('地黄')) {
      return '少阴';
    } else if (formulaName.includes('乌梅') ||
               formulaName.includes('白头翁') ||
               formulaName.includes('当归四逆')) {
      return '厥阴';
    }

    return '其他';
  }
}
