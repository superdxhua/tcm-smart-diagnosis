/**
 * 认证 API - /api/auth/login
 *
 * 功能：
 * 1. POST /api/auth/login - 用户登录
 * 2. POST /api/auth/register - 用户注册
 * 3. POST /api/auth/logout - 用户登出
 * 4. GET /api/auth/me - 获取当前用户信息
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../utils/supabase';
import { setCorsHeaders, handlePreflightRequest } from '../utils/cors';
import bcrypt from 'bcrypt';

/**
 * 用户登录
 *
 * POST /api/auth/login
 *
 * 请求体：
 * {
 *   "username": "user@example.com",  // 邮箱或用户名
 *   "password": "password123"
 * }
 *
 * 响应：
 * {
 *   "code": 200,
 *   "msg": "success",
 *   "data": {
 *     "user": { ... },
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "refreshToken": "..."
 *   }
 * }
 */
async function login(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { username, password } = req.body;

    console.log('[Auth] Login request:', { username });

    // 验证必需字段
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '用户名和密码不能为空',
      });
    }

    const supabase = getSupabaseClient();

    // 尝试使用邮箱登录
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (authError) {
      console.error('[Auth] Login failed:', authError.message);

      // 尝试使用用户名登录
      const { data: usernameData, error: usernameError } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${username},email.eq.${username}`)
        .single();

      if (usernameError || !usernameData) {
        return res.status(401).json({
          code: 401,
          msg: 'error',
          error: '用户名或密码错误',
        });
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, usernameData.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          code: 401,
          msg: 'error',
          error: '用户名或密码错误',
        });
      }

      // 使用邮箱登录获取 Token
      const { data: finalAuthData, error: finalError } = await supabase.auth.signInWithPassword({
        email: usernameData.email,
        password: password,
      });

      if (finalError) {
        console.error('[Auth] Final login failed:', finalError.message);
        return res.status(401).json({
          code: 401,
          msg: 'error',
          error: '登录失败，请重试',
        });
      }

      console.log('[Auth] Login successful:', finalAuthData.user.id);

      return res.status(200).json({
        code: 200,
        msg: 'success',
        data: {
          user: finalAuthData.user,
          token: finalAuthData.session.access_token,
          refreshToken: finalAuthData.session.refresh_token,
        },
      });
    }

    console.log('[Auth] Login successful:', authData.user.id);

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: {
        user: authData.user,
        token: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
      },
    });
  } catch (error) {
    console.error('[Auth] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 用户注册
 *
 * POST /api/auth/register
 *
 * 请求体：
 * {
 *   "username": "newuser",
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 */
async function register(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { username, email, password } = req.body;

    console.log('[Auth] Register request:', { username, email });

    // 验证必需字段
    if (!username || !email || !password) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '用户名、邮箱和密码不能为空',
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '邮箱格式不正确',
      });
    }

    // 验证密码强度
    if (password.length < 6) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '密码长度至少为 6 位',
      });
    }

    const supabase = getSupabaseClient();

    // 检查用户名是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existingUser) {
      return res.status(409).json({
        code: 409,
        msg: 'error',
        error: '用户名或邮箱已被使用',
      });
    }

    // 注册用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (authError) {
      console.error('[Auth] Register failed:', authError.message);
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: authError.message,
      });
    }

    console.log('[Auth] Register successful:', authData.user.id);

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: {
        user: authData.user,
        token: authData.session?.access_token,
        refreshToken: authData.session?.refresh_token,
      },
    });
  } catch (error) {
    console.error('[Auth] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 获取当前用户信息
 *
 * GET /api/auth/me
 */
async function getMe(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        code: 401,
        msg: 'error',
        error: '未提供认证令牌',
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseClient();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        code: 401,
        msg: 'error',
        error: '无效的认证令牌',
      });
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: user,
    });
  } catch (error) {
    console.error('[Auth] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 主处理函数
 *
 * 路由：
 * - POST /api/auth/login - 用户登录
 * - POST /api/auth/register - 用户注册
 * - GET /api/auth/me - 获取当前用户信息
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 设置 CORS headers
  setCorsHeaders(req, res);

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return handlePreflightRequest(res);
  }

  console.log('[Auth] Request:', {
    method: req.method,
    url: req.url,
  });

  // 路由分发
  if (req.method === 'POST') {
    if (req.url?.includes('/register')) {
      return register(req, res);
    } else {
      return login(req, res);
    }
  } else if (req.method === 'GET') {
    if (req.url?.includes('/me')) {
      return getMe(req, res);
    } else {
      return res.status(404).json({
        code: 404,
        msg: 'error',
        error: '路由不存在',
      });
    }
  } else {
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: '不支持的 HTTP 方法',
    });
  }
}

// 配置 Vercel Serverless Function
export const config = {
  api: {
    bodyParser: true,
  },
};
