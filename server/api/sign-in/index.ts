/**
 * 签到 API - /api/sign-in
 *
 * 功能：
 * - POST /api/sign-in - 用户签到
 * - GET /api/sign-in/history - 获取签到历史
 * - GET /api/sign-in/stats - 获取签到统计
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * 用户签到
 *
 * POST /api/sign-in
 */
async function signIn(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const supabase = getSupabaseClient();

    // 检查今天是否已经签到
    const today = new Date().toISOString().split('T')[0];

    const { data: existingRecord, error: checkError } = await supabase
      .from('sign_in_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', today)
      .single();

    if (existingRecord) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '今天已经签到过了',
      });
    }

    // 创建签到记录
    const recordData = {
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('sign_in_records')
      .insert(recordData)
      .select()
      .single();

    if (error) {
      console.error('[SignIn] Failed to sign in:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '签到失败',
      });
    }

    return res.status(201).json({
      code: 200,
      msg: 'success',
      data: {
        message: '签到成功',
        record: data,
      },
    });
  } catch (error) {
    console.error('[SignIn] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 获取签到历史
 *
 * GET /api/sign-in/history
 */
async function getSignInHistory(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('sign_in_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('[SignIn] Failed to fetch history:', error);
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
    console.error('[SignIn] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 获取签到统计
 *
 * GET /api/sign-in/stats
 */
async function getSignInStats(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const supabase = getSupabaseClient();

    // 获取本月签到次数
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count: thisMonthCount, error: countError } = await supabase
      .from('sign_in_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth);

    // 获取连续签到天数
    const { data: recentRecords } = await supabase
      .from('sign_in_records')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    let consecutiveDays = 0;
    if (recentRecords && recentRecords.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < recentRecords.length; i++) {
        const recordDate = new Date(recentRecords[i].created_at);
        recordDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (recordDate.getTime() === expectedDate.getTime()) {
          consecutiveDays++;
        } else {
          break;
        }
      }
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: {
        thisMonthCount: countError ? 0 : (count || 0),
        consecutiveDays,
      },
    });
  } catch (error) {
    console.error('[SignIn] Unexpected error:', error);
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

  const { history, stats } = req.query;

  if (req.method === 'POST') {
    return signIn(req, res, user);
  } else if (req.method === 'GET' && history) {
    return getSignInHistory(req, res, user);
  } else if (req.method === 'GET' && stats) {
    return getSignInStats(req, res, user);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
