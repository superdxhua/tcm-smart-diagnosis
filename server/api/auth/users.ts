/**
 * 用户管理 API - /api/auth/users
 *
 * 功能：
 * - GET /api/auth/users - 获取用户列表（管理员）
 * - POST /api/auth/authorize - 授权用户（管理员）
 * - PUT /api/auth/update-user - 更新用户信息
 *
 * 权限控制：
 * - 所有操作都需要认证
 * - 部分操作需要管理员权限
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser, isAdmin } from '../../utils/auth';

/**
 * 获取用户列表
 *
 * GET /api/auth/users
 */
async function getUsers(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    // 只有管理员可以查看所有用户
    if (!isAdmin(user)) {
      return res.status(403).json({
        code: 403,
        msg: 'error',
        error: '无权访问',
      });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Auth/Users] Failed to fetch users:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: error.message,
      });
    }

    // 移除密码字段
    const usersWithoutPassword = data.map(u => {
      const { password_hash, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: usersWithoutPassword,
    });
  } catch (error) {
    console.error('[Auth/Users] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 授权用户
 *
 * POST /api/auth/authorize
 *
 * 请求体：
 * {
 *   "userId": "user-uuid",
 *   "action": "approve" | "reject"
 * }
 */
async function authorizeUser(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    if (!isAdmin(user)) {
      return res.status(403).json({
        code: 403,
        msg: 'error',
        error: '无权访问',
      });
    }

    const { userId, action } = req.body;

    if (!userId || !action) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '缺少必要参数',
      });
    }

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '无效的操作',
      });
    }

    const supabase = getSupabaseClient();

    if (action === 'approve') {
      // 批准用户
      const { error } = await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', userId);

      if (error) {
        console.error('[Auth/Authorize] Failed to approve user:', error);
        return res.status(500).json({
          code: 500,
          msg: 'error',
          error: error.message,
        });
      }

      return res.status(200).json({
        code: 200,
        msg: 'success',
        data: { message: '用户已批准' },
      });
    } else {
      // 拒绝用户
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) {
        console.error('[Auth/Authorize] Failed to reject user:', error);
        return res.status(500).json({
          code: 500,
          msg: 'error',
          error: error.message,
        });
      }

      return res.status(200).json({
        code: 200,
        msg: 'success',
        data: { message: '用户已拒绝' },
      });
    }
  } catch (error) {
    console.error('[Auth/Authorize] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 更新用户信息
 *
 * PUT /api/auth/update-user
 *
 * 请求体：
 * {
 *   "userId": "user-uuid",
 *   "role": "individual" | "institution" | "admin",
 *   "isActive": true
 * }
 */
async function updateUser(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    if (!isAdmin(user)) {
      return res.status(403).json({
        code: 403,
        msg: 'error',
        error: '无权访问',
      });
    }

    const { userId, role, isActive } = req.body;

    if (!userId) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '缺少用户 ID',
      });
    }

    const supabase = getSupabaseClient();
    const updateData: any = {};

    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.is_active = isActive;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Auth/UpdateUser] Failed to update user:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: error.message,
      });
    }

    // 移除密码字段
    const { password_hash, ...userWithoutPassword } = data;

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('[Auth/UpdateUser] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 认证用户
  const user = await authenticate(req, res);

  if (!user) {
    return; // authenticate 已经返回了错误响应
  }

  if (req.method === 'GET') {
    return getUsers(req, res, user);
  } else if (req.method === 'POST') {
    return authorizeUser(req, res, user);
  } else if (req.method === 'PUT') {
    return updateUser(req, res, user);
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
