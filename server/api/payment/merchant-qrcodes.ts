/**
 * 商户二维码 API - /api/payment/merchant-qrcodes
 *
 * 功能：
 * - GET /api/payment/merchant-qrcodes - 获取商户二维码
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * 获取商户二维码
 *
 * GET /api/payment/merchant-qrcodes
 */
async function getMerchantQrcodes(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('merchant_qrcodes')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('[Payment/Qrcodes] Failed to fetch qrcodes:', error);
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
    console.error('[Payment/Qrcodes] Unexpected error:', error);
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
    return getMerchantQrcodes(req, res, user);
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
