/**
 * 获取当前用户信息 API - /api/auth/me
 *
 * 功能：
 * - GET /api/auth/me - 获取当前登录用户的信息
 *
 * 权限控制：
 * - 需要认证（需要有效的 Token）
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * 获取当前用户信息
 *
 * GET /api/auth/me
 */
async function getCurrentUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 认证用户
    const user = await authenticate(req, res);

    if (!user) {
      return; // authenticate 已经返回了错误响应
    }

    const supabase = getSupabaseClient();

    // 查询完整的用户信息
    const { data: fullUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('[Auth/Me] Failed to fetch user:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: error.message,
      });
    }

    // 返回用户信息（不返回 password_hash）
    const { password_hash, ...userWithoutPassword } = fullUser || user;

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('[Auth/Me] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getCurrentUser(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
