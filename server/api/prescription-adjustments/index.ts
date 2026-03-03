/**
 * 处方管理 API - /api/prescription-adjustments
 *
 * 功能：
 * - GET /api/prescription-adjustments - 获取处方调整记录
 * - POST /api/prescription-adjustments - 创建处方调整记录
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * 获取处方调整记录
 *
 * GET /api/prescription-adjustments
 */
async function getPrescriptionAdjustments(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { recordId } = req.query;
    const supabase = getSupabaseClient();

    let query = supabase
      .from('prescription_adjustments')
      .select('*')
      .eq('user_id', user.id);

    if (recordId) {
      query = query.eq('record_id', recordId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[PrescriptionAdjustments] Failed to fetch adjustments:', error);
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
    console.error('[PrescriptionAdjustments] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 创建处方调整记录
 *
 * POST /api/prescription-adjustments
 */
async function createPrescriptionAdjustment(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { recordId, originalPrescription, adjustedPrescription, reason } = req.body;
    const supabase = getSupabaseClient();

    const adjustmentData = {
      user_id: user.id,
      record_id: recordId,
      original_prescription: originalPrescription,
      adjusted_prescription: adjustedPrescription,
      reason,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('prescription_adjustments')
      .insert(adjustmentData)
      .select()
      .single();

    if (error) {
      console.error('[PrescriptionAdjustments] Failed to create adjustment:', error);
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
    console.error('[PrescriptionAdjustments] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticate(req, res);

  if (!user) {
    return;
  }

  if (req.method === 'GET') {
    return getPrescriptionAdjustments(req, res, user);
  } else if (req.method === 'POST') {
    return createPrescriptionAdjustment(req, res, user);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
