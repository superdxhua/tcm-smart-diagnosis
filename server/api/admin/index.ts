/**
 * 管理功能 API - /api/admin
 *
 * 功能：
 * - GET /api/admin/users - 获取所有用户（管理员）
 * - PUT /api/admin/users/:userId - 更新用户（管理员）
 * - GET /api/admin/pending-recharge-count - 获取待充值订单数（管理员）
 * - GET /api/admin/pending-recharge-orders - 获取待充值订单列表（管理员）
 * - POST /api/admin/approve-recharge-order - 批准充值订单（管理员）
 * - POST /api/admin/reject-recharge-order - 拒绝充值订单（管理员）
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser, isAdmin } from '../../utils/auth';

/**
 * 获取所有用户
 *
 * GET /api/admin/users
 */
async function getAdminUsers(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    if (!isAdmin(user)) {
      return res.status(403).json({
        code: 403,
        msg: 'error',
        error: '需要管理员权限',
      });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin/Users] Failed to fetch users:', error);
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
    console.error('[Admin/Users] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 更新用户
 *
 * PUT /api/admin/users/:userId
 */
async function updateAdminUser(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    if (!isAdmin(user)) {
      return res.status(403).json({
        code: 403,
        msg: 'error',
        error: '需要管理员权限',
      });
    }

    const { userId } = req.query;
    const { role, isActive } = req.body;
    const supabase = getSupabaseClient();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Admin/Users] Failed to update user:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '更新失败',
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
    console.error('[Admin/Users] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 获取待充值订单数
 *
 * GET /api/admin/pending-recharge-count
 */
async function getPendingRechargeCount(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    if (!isAdmin(user)) {
      return res.status(403).json({
        code: 403,
        msg: 'error',
        error: '需要管理员权限',
      });
    }

    const supabase = getSupabaseClient();

    const { count, error } = await supabase
      .from('recharge_orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      console.error('[Admin/Recharge] Failed to count orders:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: error.message,
      });
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: { count: count || 0 },
    });
  } catch (error) {
    console.error('[Admin/Recharge] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 获取待充值订单列表
 *
 * GET /api/admin/pending-recharge-orders
 */
async function getPendingRechargeOrders(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    if (!isAdmin(user)) {
      return res.status(403).json({
        code: 403,
        msg: 'error',
        error: '需要管理员权限',
      });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('recharge_orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin/Recharge] Failed to fetch orders:', error);
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
    console.error('[Admin/Recharge] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 批准充值订单
 *
 * POST /api/admin/approve-recharge-order
 */
async function approveRechargeOrder(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    if (!isAdmin(user)) {
      return res.status(403).json({
        code: 403,
        msg: 'error',
        error: '需要管理员权限',
      });
    }

    const { orderId } = req.body;
    const supabase = getSupabaseClient();

    // 查询订单
    const { data: order, error: fetchError } = await supabase
      .from('recharge_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({
        code: 404,
        msg: 'error',
        error: '订单不存在',
      });
    }

    // 更新订单状态
    const { error: updateError } = await supabase
      .from('recharge_orders')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('[Admin/Recharge] Failed to approve order:', updateError);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '批准失败',
      });
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: { message: '订单已批准' },
    });
  } catch (error) {
    console.error('[Admin/Recharge] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 拒绝充值订单
 *
 * POST /api/admin/reject-recharge-order
 */
async function rejectRechargeOrder(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    if (!isAdmin(user)) {
      return res.status(403).json({
        code: 403,
        msg: 'error',
        error: '需要管理员权限',
      });
    }

    const { orderId } = req.body;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('recharge_orders')
      .update({
        status: 'rejected',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      console.error('[Admin/Recharge] Failed to reject order:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '拒绝失败',
      });
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: { message: '订单已拒绝' },
    });
  } catch (error) {
    console.error('[Admin/Recharge] Unexpected error:', error);
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

  const { users, 'pending-recharge-count': pendingCount, 'pending-recharge-orders': pendingOrders } = req.query;
  const { 'approve-recharge-order': approve, 'reject-recharge-order': reject } = req.body;

  if (req.method === 'GET') {
    if (users) {
      return getAdminUsers(req, res, user);
    }
    if (pendingCount) {
      return getPendingRechargeCount(req, res, user);
    }
    if (pendingOrders) {
      return getPendingRechargeOrders(req, res, user);
    }
    return res.status(404).json({
      code: 404,
      msg: 'error',
      error: 'Not Found',
    });
  } else if (req.method === 'PUT') {
    return updateAdminUser(req, res, user);
  } else if (req.method === 'POST') {
    if (approve) {
      return approveRechargeOrder(req, res, user);
    }
    if (reject) {
      return rejectRechargeOrder(req, res, user);
    }
    return res.status(404).json({
      code: 404,
      msg: 'error',
      error: 'Not Found',
    });
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
