/**
 * 认证工具 - 处理用户身份验证
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

/**
 * 认证中间件 - 验证用户Token
 */
export async function authenticate(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthUser | null> {
  try {
    // 从请求头获取Token
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        code: 401,
        msg: 'error',
        error: '未授权：缺少认证信息',
      });
      return null;
    }

    // 解析 Bearer Token
    const token = authHeader.replace('Bearer ', '').replace('bearer ', '');

    if (!token) {
      res.status(401).json({
        code: 401,
        msg: 'error',
        error: '未授权：Token无效',
      });
      return null;
    }

    // 验证Token并获取用户信息
    const supabase = getSupabaseClient();

    // 使用 Supabase 验证 token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Token验证失败:', error);
      res.status(401).json({
        code: 401,
        msg: 'error',
        error: '未授权：Token验证失败',
      });
      return null;
    }

    // 返回用户信息
    return {
      id: user.id,
      email: user.email || '',
      role: (user as any).role || 'user',
    };
  } catch (error) {
    console.error('认证过程出错:', error);
    res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误：认证失败',
    });
    return null;
  }
}
