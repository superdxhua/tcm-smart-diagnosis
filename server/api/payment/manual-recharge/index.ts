/**
 * 手动充值 API - /api/payment/manual-recharge
 *
 * 功能：
 * - GET /api/payment/manual-recharge/orders - 获取充值订单列表
 * - POST /api/payment/manual-recharge/create - 创建充值订单
 * - POST /api/payment/manual-recharge/upload-screenshot - 上传充值截图
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../../utils/supabase';
import { authenticate, AuthUser } from '../../../utils/auth';

/**
 * 获取充值订单列表
 *
 * GET /api/payment/manual-recharge/orders
 */
async function getRechargeOrders(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('recharge_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Payment/Recharge] Failed to fetch orders:', error);
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
    console.error('[Payment/Recharge] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 创建充值订单
 *
 * POST /api/payment/manual-recharge/create
 */
async function createRechargeOrder(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { amount, paymentMethod } = req.body;
    const supabase = getSupabaseClient();

    const orderData = {
      user_id: user.id,
      amount,
      payment_method: paymentMethod,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('recharge_orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('[Payment/Recharge] Failed to create order:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '创建订单失败',
      });
    }

    return res.status(201).json({
      code: 200,
      msg: 'success',
      data,
    });
  } catch (error) {
    console.error('[Payment/Recharge] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 上传充值截图
 *
 * POST /api/payment/manual-recharge/upload-screenshot
 */
async function uploadScreenshot(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { orderId, screenshotUrl } = req.body;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('recharge_orders')
      .update({
        screenshot: screenshotUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('user_id', user.id);

    if (error) {
      console.error('[Payment/Recharge] Failed to upload screenshot:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '上传失败',
      });
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: { message: '截图上传成功' },
    });
  } catch (error) {
    console.error('[Payment/Recharge] Unexpected error:', error);
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

  const { orders, create, 'upload-screenshot': upload } = req.query;

  if (req.method === 'GET' && orders) {
    return getRechargeOrders(req, res, user);
  } else if (req.method === 'POST' && create) {
    return createRechargeOrder(req, res, user);
  } else if (req.method === 'POST' && upload) {
    return uploadScreenshot(req, res, user);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
