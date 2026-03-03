/**
 * 健康记录详情 API - /api/health-records/:id
 *
 * 功能：
 * - GET /api/health-records/:id - 获取档案详情
 * - PUT /api/health-records/:id - 更新档案
 * - DELETE /api/health-records/:id - 删除档案
 * - PUT /api/health-records/:id/archive - 归档档案
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../../utils/supabase';
import { authenticate, AuthUser } from '../../../utils/auth';

/**
 * 获取档案详情
 *
 * GET /api/health-records/:id
 */
async function getHealthRecord(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          code: 404,
          msg: 'error',
          error: '档案不存在',
        });
      }

      console.error('[HealthRecords] Failed to fetch record:', error);
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
    console.error('[HealthRecords] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 更新档案
 *
 * PUT /api/health-records/:id
 */
async function updateHealthRecord(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
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
    if (body.analysisResult !== undefined) updateData.analysis_result = body.analysisResult;
    if (body.differentiation !== undefined) updateData.differentiation = body.differentiation;
    if (body.treatmentPrinciple !== undefined) updateData.treatment_principle = body.treatmentPrinciple;
    if (body.healthPlan !== undefined) updateData.health_plan = body.healthPlan;
    if (body.advice !== undefined) updateData.advice = body.advice;
    if (body.status !== undefined) updateData.status = body.status;

    const { data, error } = await supabase
      .from('health_records')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[HealthRecords] Failed to update record:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '更新失败',
      });
    }

    return res.status(200).json({
      code: 200,
      msg: '档案更新成功',
      data,
    });
  } catch (error) {
    console.error('[HealthRecords] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 删除档案
 *
 * DELETE /api/health-records/:id
 */
async function deleteHealthRecord(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { id } = req.query;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('health_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[HealthRecords] Failed to delete record:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '删除失败',
      });
    }

    return res.status(200).json({
      code: 200,
      msg: '档案删除成功',
      data: null,
    });
  } catch (error) {
    console.error('[HealthRecords] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 归档档案
 *
 * PUT /api/health-records/:id/archive
 */
async function archiveHealthRecord(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { id } = req.query;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('health_records')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[HealthRecords] Failed to archive record:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '归档失败',
      });
    }

    return res.status(200).json({
      code: 200,
      msg: '档案已归档',
      data: null,
    });
  } catch (error) {
    console.error('[HealthRecords] Unexpected error:', error);
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

  const { archive } = req.query;

  if (req.method === 'GET') {
    return getHealthRecord(req, res);
  } else if (req.method === 'PUT') {
    if (archive) {
      return archiveHealthRecord(req, res, user!);
    }
    return updateHealthRecord(req, res, user!);
  } else if (req.method === 'DELETE') {
    return deleteHealthRecord(req, res, user!);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
