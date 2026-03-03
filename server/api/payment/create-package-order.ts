/**
 * 创建套餐订单 API - /api/payment/create-package-order
 *
 * 功能：
 * - POST /api/payment/create-package-order - 创建套餐订单
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * 创建套餐订单
 *
 * POST /api/payment/create-package-order
 */
async function createPackageOrder(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { packageId, paymentMethod } = req.body;
    const supabase = getSupabaseClient();

    // 查询套餐信息
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (pkgError || !pkg) {
      return res.status(404).json({
        code: 404,
        msg: 'error',
        error: '套餐不存在',
      });
    }

    // 创建订单
    const orderData = {
      user_id: user.id,
      package_id: packageId,
      amount: pkg.price,
      payment_method: paymentMethod,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('[Payment/CreateOrder] Failed to create order:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '创建订单失败',
      });
    }

    return res.status(201).json({
      code: 200,
      msg: 'success',
      data: {
        orderId: data.id,
        amount: data.amount,
        package: pkg,
      },
    });
  } catch (error) {
    console.error('[Payment/CreateOrder] Unexpected error:', error);
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

  if (req.method === 'POST') {
    return createPackageOrder(req, res, user);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
