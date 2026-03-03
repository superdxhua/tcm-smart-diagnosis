/**
 * 套餐管理 API - /api/packages
 *
 * 功能：
 * - GET /api/packages/all - 获取所有套餐
 * - GET /api/packages/active - 获取当前激活的套餐
 * - POST /api/packages/create - 创建套餐（管理员）
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser, isAdmin } from '../../utils/auth';

/**
 * 获取所有套餐
 *
 * GET /api/packages/all
 */
async function getAllPackages(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('[Packages] Failed to fetch packages:', error);
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
    console.error('[Packages] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

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
      console.error('[Packages] Failed to fetch active package:', error);
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
    console.error('[Packages] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 创建套餐（管理员）
 *
 * POST /api/packages/create
 */
async function createPackage(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    if (!isAdmin(user)) {
      return res.status(403).json({
        code: 403,
        msg: 'error',
        error: '需要管理员权限',
      });
    }

    const { name, description, price, duration, features } = req.body;
    const supabase = getSupabaseClient();

    const packageData = {
      name,
      description,
      price,
      duration,
      features,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('packages')
      .insert(packageData)
      .select()
      .single();

    if (error) {
      console.error('[Packages] Failed to create package:', error);
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
    console.error('[Packages] Unexpected error:', error);
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

  const { all, active, create } = req.query;

  if (req.method === 'GET') {
    if (all) {
      return getAllPackages(req, res);
    }
    if (active && user) {
      return getActivePackage(req, res, user);
    }
    return getAllPackages(req, res);
  } else if (req.method === 'POST' && create) {
    return createPackage(req, res, user!);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
