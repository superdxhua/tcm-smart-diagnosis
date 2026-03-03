/**
 * 套餐激活 API - /api/packages/active
 *
 * 功能：
 * - GET /api/packages/active - 获取当前激活的套餐
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * 获取当前激活的套餐
 *
 * GET /api/packages/active
 */
async function getActivePackage(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_packages')
      .select(`
        *,
        packages (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[Packages/Active] Failed to fetch active package:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: error.message,
      });
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: data || null,
    });
  } catch (error) {
    console.error('[Packages/Active] Unexpected error:', error);
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
    return getActivePackage(req, res, user);
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
