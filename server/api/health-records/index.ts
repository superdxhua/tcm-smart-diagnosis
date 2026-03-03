/**
 * 健康记录 API - /api/health-records
 *
 * 功能：
 * - GET /api/health-records/member/:memberId - 获取用户的所有档案
 * - POST /api/health-records - 创建新档案
 * - POST /api/health-records/analyze-followup - 复诊分析
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * 获取用户的所有档案
 *
 * GET /api/health-records/member/:memberId
 */
async function getMemberHealthRecords(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { memberId } = req.query;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[HealthRecords] Failed to fetch records:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: error.message,
      });
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: data || [],
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
 * 创建新档案
 *
 * POST /api/health-records
 */
async function createHealthRecord(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const body = req.body;
    const supabase = getSupabaseClient();

    // 转换驼峰命名为下划线命名
    const recordData: any = {
      member_id: body.memberId,
      consultant_id: body.consultantId || user.id,
      visit_number: body.visitNumber,
      chief_complaint: body.chiefComplaint,
      history: body.history,
      past_history: body.pastHistory,
      analysis_result: body.analysisResult,
      differentiation: body.differentiation,
      treatment_principle: body.treatmentPrinciple,
      health_plan: body.healthPlan,
      advice: body.advice,
      status: body.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('health_records')
      .insert(recordData)
      .select()
      .single();

    if (error) {
      console.error('[HealthRecords] Failed to create record:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '创建失败',
      });
    }

    return res.status(201).json({
      code: 200,
      msg: '档案创建成功',
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
 * 复诊分析 - 查询用户历史档案并提供优化建议
 *
 * POST /api/health-records/analyze-followup
 */
async function analyzeFollowUp(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { memberId, currentSymptoms } = req.body;
    const supabase = getSupabaseClient();

    // 查询历史档案
    const { data: historyRecords, error: historyError } = await supabase
      .from('health_records')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (historyError) {
      console.error('[HealthRecords] Failed to fetch history:', historyError);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '查询历史档案失败',
      });
    }

    // 这里应该调用 AI 分析接口，暂时返回模拟数据
    const analysis = {
      historyRecords: historyRecords || [],
      recommendations: [
        {
          type: 'prescription',
          message: '建议调整处方：...',
        },
        {
          type: 'lifestyle',
          message: '建议调整生活方式：...',
        },
      ],
      riskAssessment: {
        overallRisk: 'low',
        factors: [],
      },
    };

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: analysis,
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

  const { memberId } = req.query;
  const { analyzeFollowup } = req.query;

  if (req.method === 'GET' && memberId) {
    return getMemberHealthRecords(req, res);
  } else if (req.method === 'POST') {
    if (analyzeFollowup) {
      return analyzeFollowUp(req, res, user!);
    }
    return createHealthRecord(req, res, user!);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
