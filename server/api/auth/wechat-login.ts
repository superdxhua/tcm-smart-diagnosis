/**
 * 微信登录 API - /api/auth/wechat-login
 *
 * 功能：
 * - POST /api/auth/wechat-login - 微信一键登录
 *
 * 请求体：
 * {
 *   "code": "微信登录 code"
 * }
 *
 * 响应：
 * {
 *   "code": 200,
 *   "msg": "success",
 *   "data": {
 *     "token": "JWT token",
 *     "user": { ... }
 *   }
 * }
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';

/**
 * 微信一键登录
 *
 * POST /api/auth/wechat-login
 */
async function wechatLogin(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '缺少微信登录 code',
      });
    }

    const WECHAT_APPID = process.env.WECHAT_APPID || '';
    const WECHAT_SECRET = process.env.WECHAT_SECRET || '';

    if (!WECHAT_APPID || !WECHAT_SECRET) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '微信登录配置未完成，请联系管理员',
      });
    }

    const supabase = getSupabaseClient();

    // 1. 使用 code 向微信服务器换取 openid 和 session_key
    const wechatUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`;

    const wechatResponse = await fetch(wechatUrl);
    const wechatData = await wechatResponse.json() as any;

    console.log('[WeChat Login] WeChat response:', wechatData);

    if (wechatData.errcode) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: `微信登录失败: ${wechatData.errmsg}`,
      });
    }

    const openid = wechatData.openid;
    const sessionKey = wechatData.session_key;

    // 2. 查询是否已有该 openid 的用户
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('openid', openid)
      .single();

    let user: any;

    if (!findError && existingUser) {
      // 用户已存在，更新 session_key
      user = existingUser;

      await supabase
        .from('users')
        .update({ session_key: sessionKey })
        .eq('id', user.id);

      console.log('[WeChat Login] User logged in:', user.id);
    } else {
      // 新用户，创建账号
      const username = `wx_${openid.substring(0, 8)}`; // 使用 openid 前 8 位作为用户名
      const defaultPassword = Buffer.from('123456').toString('base64'); // 默认密码（明文存储，待后续使用 bcrypt）

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          username,
          password: defaultPassword,
          openid,
          session_key: sessionKey,
          role: 'individual',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('[WeChat Login] Failed to create user:', createError);
        return res.status(500).json({
          code: 500,
          msg: 'error',
          error: '创建用户失败，请稍后重试',
        });
      }

      user = newUser;

      // 自动创建3天使用期限
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);

      await supabase
        .from('user_permissions')
        .insert({
          user_id: user.id,
          is_active: true,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
        });

      console.log('[WeChat Login] New user created:', user.id);
    }

    // 3. 生成 token
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      username: user.username,
      role: user.role,
      openid: user.openid,
    })).toString('base64');

    // 4. 查询用户权限
    let expiresAt: string | null = null;
    if (user.role !== 'admin') {
      const { data: permissions } = await supabase
        .from('user_permissions')
        .select('expires_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (permissions && permissions.expires_at) {
        expiresAt = permissions.expires_at;
      }
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          isActive: user.is_active,
          createdAt: user.created_at,
          expiresAt,
        },
      },
    });
  } catch (error) {
    console.error('[WeChat Login] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return wechatLogin(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
