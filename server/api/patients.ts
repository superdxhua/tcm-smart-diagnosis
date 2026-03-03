/**
 * 患者管理 API - /api/patients
 *
 * 功能：
 * - GET /api/patients - 获取患者列表
 * - POST /api/patients - 创建新患者
 * - PUT /api/patients/:id - 更新患者信息
 * - DELETE /api/patients/:id - 删除患者
 *
 * 注意：此 API 与 /api/members 功能类似，但使用不同的数据表
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../utils/supabase';
import { authenticate, AuthUser } from '../utils/auth';

/**
 * 获取患者列表
 *
 * GET /api/patients
 */
async function getPatients(req: NextApiRequest, res: NextApiResponse, user?: AuthUser) {
  try {
    const supabase = getSupabaseClient();
    let query = supabase.from('patients').select('*');

    // 如果提供了 consultant_id 参数，添加筛选
    if (req.query.consultant_id) {
      query = query.eq('consultant_id', req.query.consultant_id);
    }
    // 如果用户已登录，筛选该用户的患者
    else if (user) {
      query = query.eq('consultant_id', user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[Patients] Failed to fetch patients:', error);
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
    console.error('[Patients] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 创建新患者
 *
 * POST /api/patients
 */
async function createPatient(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const body = req.body;
    const supabase = getSupabaseClient();

    // 验证必需字段
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '患者名称不能为空',
      });
    }

    // 准备患者数据
    const patientData = {
      consultant_id: user.id,
      name: body.name.trim(),
      gender: body.gender || null,
      age: body.age || null,
      birth_year: body.birth_year || null,
      phone: body.phone || null,
      address: body.address || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 创建患者
    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();

    if (error) {
      console.error('[Patients] Failed to create patient:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '创建失败',
      });
    }

    return res.status(201).json({
      code: 201,
      msg: 'success',
      data,
    });
  } catch (error) {
    console.error('[Patients] Unexpected error:', error);
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
    return getPatients(req, res, user);
  } else if (req.method === 'POST') {
    return createPatient(req, res, user!);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
