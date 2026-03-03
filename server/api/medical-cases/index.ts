/**
 * 医疗案例 API - /api/medical-cases
 *
 * 功能：
 * - GET /api/medical-cases - 获取案例列表
 * - POST /api/medical-cases - 创建新案例
 * - GET /api/medical-cases/doctors/list - 获取名医列表
 * - POST /api/medical-cases/:id/analyze - 分析案例
 * - PUT /api/medical-cases/:id - 更新案例
 * - DELETE /api/medical-cases/:id - 删除案例
 * - POST /api/medical-cases/match - 匹配案例
 * - POST /api/medical-cases/inquiry-reference - 获取参考案例
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * 获取案例列表
 *
 * GET /api/medical-cases
 */
async function getMedicalCases(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('medical_cases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[MedicalCases] Failed to fetch cases:', error);
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
    console.error('[MedicalCases] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 创建新案例
 *
 * POST /api/medical-cases
 */
async function createMedicalCase(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const body = req.body;
    const supabase = getSupabaseClient();

    const caseData = {
      user_id: user.id,
      patient_name: body.patientName,
      chief_complaint: body.chiefComplaint,
      diagnosis: body.diagnosis,
      differentiation: body.differentiation,
      prescription: body.prescription,
      effectiveness_score: body.effectivenessScore || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('medical_cases')
      .insert(caseData)
      .select()
      .single();

    if (error) {
      console.error('[MedicalCases] Failed to create case:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '创建失败',
      });
    }

    return res.status(201).json({
      code: 200,
      msg: 'success',
      data,
    });
  } catch (error) {
    console.error('[MedicalCases] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 获取名医列表
 *
 * GET /api/medical-cases/doctors/list
 */
async function getDoctorsList(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MedicalCases] Failed to fetch doctors:', error);
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
    console.error('[MedicalCases] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 匹配案例
 *
 * POST /api/medical-cases/match
 */
async function matchCase(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { symptoms, diagnosis } = req.body;
    const supabase = getSupabaseClient();

    // 简单匹配逻辑
    const { data, error } = await supabase
      .from('medical_cases')
      .select('*')
      .or(`diagnosis.ilike.%${diagnosis}%,chief_complaint.ilike.%${symptoms}%`)
      .limit(10);

    if (error) {
      console.error('[MedicalCases] Failed to match cases:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '匹配失败',
      });
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: data || [],
    });
  } catch (error) {
    console.error('[MedicalCases] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 获取参考案例
 *
 * POST /api/medical-cases/inquiry-reference
 */
async function getInquiryReference(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { symptoms } = req.body;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('medical_cases')
      .select('*')
      .or(`chief_complaint.ilike.%${symptoms}%,diagnosis.ilike.%${symptoms}%`)
      .limit(5);

    if (error) {
      console.error('[MedicalCases] Failed to fetch reference:', error);
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
    console.error('[MedicalCases] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let user: AuthUser | undefined;
  if (req.method !== 'GET') {
    user = await authenticate(req, res);
    if (!user) {
      return;
    }
  }

  const { doctors, list, match, 'inquiry-reference': inquiryReference } = req.query;

  if (req.method === 'GET') {
    if (doctors && list) {
      return getDoctorsList(req, res);
    }
    return getMedicalCases(req, res);
  } else if (req.method === 'POST') {
    if (match) {
      return matchCase(req, res, user!);
    }
    if (inquiryReference) {
      return getInquiryReference(req, res, user!);
    }
    return createMedicalCase(req, res, user!);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
