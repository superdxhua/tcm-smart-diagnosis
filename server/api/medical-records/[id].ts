/**
 * 医疗记录详情 API - /api/medical-records/:id
 *
 * 功能：
 * - GET /api/medical-records/:id - 获取医疗记录详情
 * - PUT /api/medical-records/:id - 更新医疗记录
 * - DELETE /api/medical-records/:id - 删除医疗记录
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../../utils/supabase';
import { authenticate, AuthUser } from '../../../utils/auth';

/**
 * 获取医疗记录详情
 *
 * GET /api/medical-records/:id
 */
async function getMedicalRecord(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          code: 404,
          msg: 'error',
          error: '医疗记录不存在',
        });
      }

      console.error('[MedicalRecords] Failed to fetch record:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: error.message,
      });
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data,
    });
  } catch (error) {
    console.error('[MedicalRecords] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 更新医疗记录
 *
 * PUT /api/medical-records/:id
 */
async function updateMedicalRecord(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { id } = req.query;
    const body = req.body;
    const supabase = getSupabaseClient();

    // 转换驼峰命名为下划线命名
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.chiefComplaint !== undefined) updateData.chief_complaint = body.chiefComplaint;
    if (body.history !== undefined) updateData.history = body.history;
    if (body.pastHistory !== undefined) updateData.past_history = body.pastHistory;
    if (body.diagnosis !== undefined) updateData.diagnosis = body.diagnosis;
    if (body.treatment !== undefined) updateData.treatment = body.treatment;
    if (body.prescription !== undefined) updateData.prescription = body.prescription;
    if (body.advice !== undefined) updateData.advice = body.advice;
    if (body.status !== undefined) updateData.status = body.status;

    const { data, error } = await supabase
      .from('medical_records')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[MedicalRecords] Failed to update record:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '更新失败',
      });
    }

    return res.status(200).json({
      code: 200,
      msg: '医疗记录更新成功',
      data,
    });
  } catch (error) {
    console.error('[MedicalRecords] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 删除医疗记录
 *
 * DELETE /api/medical-records/:id
 */
async function deleteMedicalRecord(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { id } = req.query;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[MedicalRecords] Failed to delete record:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '删除失败',
      });
    }

    return res.status(200).json({
      code: 200,
      msg: '医疗记录删除成功',
      data: null,
    });
  } catch (error) {
    console.error('[MedicalRecords] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 认证用户（GET 请求不需要认证）
  let user: AuthUser | undefined;
  if (req.method !== 'GET') {
    user = await authenticate(req, res);
    if (!user) {
      return; // authenticate 已经返回了错误响应
    }
  }

  if (req.method === 'GET') {
    return getMedicalRecord(req, res);
  } else if (req.method === 'PUT') {
    return updateMedicalRecord(req, res, user!);
  } else if (req.method === 'DELETE') {
    return deleteMedicalRecord(req, res, user!);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
