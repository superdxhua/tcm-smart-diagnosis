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

    console.log('=== [BACKEND] 前端发送的数据:', JSON.stringify(body));

    // 显式映射参数名：从驼峰转为下划线 + p_ 前缀
    const params = {
      p_member_id: body.memberId,
      p_consultant_id: body.consultantId || user?.id || 'default-consultant',
      p_visit_number: body.visitNumber || 1,
      p_chief_complaint: body.chiefComplaint,
      p_history: body.history || null,
      p_past_history: body.pastHistory || null,
      p_analysis_result: body.analysisResult || null,
      p_differentiation: body.differentiation || null,
      p_treatment_principle: body.treatmentPrinciple || null,
      p_health_plan: body.healthPlan || '',
      p_advice: body.advice || null,
      p_status: body.status || 'active',
    };

    console.log('=== [BACKEND] RPC 参数:', JSON.stringify(params));

    // 调用 Supabase RPC 函数
    const { data, error } = await supabase.rpc(
      'create_health_record_with_transaction',
      params
    );

    if (error) {
      console.error('[BACKEND] ❌ RPC 调用失败:', error);
      console.error('[BACKEND] 错误代码:', error.code);
      console.error('[BACKEND] 错误详情:', error.details);
      console.error('[BACKEND] 错误提示:', error.hint);
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    console.log('[BACKEND] ✅ RPC 返回数据:', data);

    return res.status(201).json({
      code: 200,
      msg: '档案创建成功',
      data,
    });
  } catch (error: any) {
    console.error('[BACKEND] ❌ 创建记录时发生意外错误:', error);
    console.error('[BACKEND] 错误堆栈:', error.stack);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: error.message || '服务器错误',
      stack: error.stack,
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
  // 调试日志
  console.log('=== [BACKEND] 🔥 API 接口被调用了！Method:', req.method);
  console.log('=== [BACKEND] 🔥 接收到的 Body:', JSON.stringify(req.body));
  console.log('=== [BACKEND] 🔥 Query:', req.query);

  // 认证用户（GET 请求不需要认证）
  let user: AuthUser | undefined;
  if (req.method !== 'GET') {
    console.log('=== [BACKEND] 开始认证用户 ===');
    user = await authenticate(req, res);
    console.log('=== [BACKEND] 认证结果 user:', user);
    if (!user) {
      console.log('=== [BACKEND] 认证失败，返回错误 ===');
      return; // authenticate 已经返回了错误响应
    }
  }

  const { memberId } = req.query;
  const { analyzeFollowup } = req.query;

  if (req.method === 'GET' && memberId) {
    console.log('=== [BACKEND] 调用 getMemberHealthRecords ===');
    return getMemberHealthRecords(req, res);
  } else if (req.method === 'POST') {
    if (analyzeFollowup) {
      console.log('=== [BACKEND] 调用 analyzeFollowUp ===');
      return analyzeFollowUp(req, res, user!);
    }
    console.log('=== [BACKEND] 调用 createHealthRecord ===');
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
