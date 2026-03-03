/**
 * 认证工具函数
 *
 * 目的：统一处理用户认证逻辑，验证 JWT Token 并提取用户信息
 * 功能：
 * 1. 从请求头中提取 Token
 * 2. 验证 Token 有效性
 * 3. 提取用户信息（id, email, role 等）
 * 4. 标准化错误响应
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from './supabase';

/**
 * 用户信息接口
 */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
}

/**
 * 认证错误类型
 */
export enum AuthError {
  NO_TOKEN = 'NO_TOKEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 认证结果接口
 */
export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: {
    code: AuthError;
    message: string;
  };
}

/**
 * 从请求头中提取 Token
 *
 * @param req - Next.js API 请求对象
 * @returns Token 字符串或 null
 */
export function extractToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // 支持 Bearer Token 格式
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 直接返回 Token（向后兼容）
  return authHeader;
}

/**
 * 验证 Token 并获取用户信息
 *
 * @param req - Next.js API 请求对象
 * @returns 认证结果对象
 */
export async function verifyToken(req: NextApiRequest): Promise<AuthResult> {
  try {
    // 提取 Token
    const token = extractToken(req);

    if (!token) {
      return {
        success: false,
        error: {
          code: AuthError.NO_TOKEN,
          message: '未提供认证令牌',
        },
      };
    }

    console.log('[Auth] Verifying token...');

    // 获取 Supabase 客户端
    const supabase = getSupabaseClient();

    // 验证 Token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('[Auth] Token verification failed:', error.message);

      // 根据错误类型返回不同的错误代码
      if (error.message.includes('Invalid JWT')) {
        return {
          success: false,
          error: {
            code: AuthError.INVALID_TOKEN,
            message: '无效的认证令牌',
          },
        };
      }

      if (error.message.includes('expired')) {
        return {
          success: false,
          error: {
            code: AuthError.EXPIRED_TOKEN,
            message: '认证令牌已过期，请重新登录',
          },
        };
      }

      return {
        success: false,
        error: {
          code: AuthError.UNKNOWN_ERROR,
          message: `认证失败: ${error.message}`,
        },
      };
    }

    if (!user) {
      return {
        success: false,
        error: {
          code: AuthError.USER_NOT_FOUND,
          message: '用户不存在或已被删除',
        },
      };
    }

    console.log('[Auth] Token verified successfully for user:', user.id);

    // 构建用户信息对象
    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      role: (user.user_metadata?.role as string) || 'user',
      username: user.user_metadata?.username,
      avatar_url: user.user_metadata?.avatar_url,
      created_at: user.created_at,
    };

    return {
      success: true,
      user: authUser,
    };
  } catch (error) {
    console.error('[Auth] Unexpected error:', error);

    return {
      success: false,
      error: {
        code: AuthError.UNKNOWN_ERROR,
        message: '认证过程中发生未知错误',
      },
    };
  }
}

/**
 * 检查用户是否具有特定角色
 *
 * @param user - 用户信息对象
 * @param allowedRoles - 允许的角色列表
 * @returns 是否具有权限
 */
export function hasRole(user: AuthUser, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}

/**
 * 检查用户是否为管理员
 *
 * @param user - 用户信息对象
 * @returns 是否为管理员
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin';
}

/**
 * 检查用户是否为机构用户
 *
 * @param user - 用户信息对象
 * @returns 是否为机构用户
 */
export function isInstitution(user: AuthUser): boolean {
  return user.role === 'institution';
}

/**
 * 检查用户是否为个人用户
 *
 * @param user - 用户信息对象
 * @returns 是否为个人用户
 */
export function isIndividual(user: AuthUser): boolean {
  return user.role === 'individual';
}

/**
 * 返回标准化的认证错误响应
 *
 * @param res - Next.js API 响应对象
 * @param error - 认证错误对象
 */
export function sendAuthError(res: NextApiResponse, error: { code: AuthError; message: string }): void {
  const statusCode = error.code === AuthError.NO_TOKEN ? 401 : 403;

  res.status(statusCode).json({
    code: statusCode,
    msg: 'error',
    error: error.message,
  });
}

/**
 * 中间件函数：验证用户身份
 *
 * 使用示例：
 * ```typescript
 * export default async function handler(req, res) {
 *   // 验证用户身份
 *   const authResult = await verifyToken(req);
 *   if (!authResult.success) {
 *     return sendAuthError(res, authResult.error!);
 *   }
 *
 *   // 获取用户信息
 *   const user = authResult.user!;
 *
 *   // 继续处理请求...
 * }
 * ```
 */
export async function authenticate(req: NextApiRequest, res: NextApiResponse): Promise<AuthUser | null> {
  const authResult = await verifyToken(req);

  if (!authResult.success) {
    sendAuthError(res, authResult.error!);
    return null;
  }

  return authResult.user!;
}
