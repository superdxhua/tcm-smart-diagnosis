/**
 * 机构注册 API - /api/auth/register-institution
 *
 * 功能：
 * - POST /api/auth/register-institution - 机构注册
 *
 * 请求体：
 * {
 *   "username": "机构用户名",
 *   "password": "密码",
 *   "organizationName": "机构名称",
 *   "contactName": "联系人",
 *   "contactPhone": "联系电话",
 *   "qualification": "资质证明 URL"
 * }
 *
 * 权限控制：
 * - 不需要认证（公开接口）
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';

/**
 * 机构注册
 *
 * POST /api/auth/register-institution
 */
async function registerInstitution(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      username,
      password,
      organizationName,
      contactName,
      contactPhone,
      qualification,
    } = req.body;

    // 验证必需字段
    if (!username || !password || !organizationName || !contactName || !contactPhone) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '缺少必要字段',
      });
    }

    const supabase = getSupabaseClient();

    // 检查用户名是否已存在
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(409).json({
        code: 409,
        msg: 'error',
        error: '用户名已存在',
      });
    }

    // 创建机构用户
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        username,
        password: Buffer.from(password).toString('base64'), // 临时使用 base64，待后续使用 bcrypt
        role: 'institution',
        organization_name: organizationName,
        contact_name: contactName,
        contact_phone: contactPhone,
        qualification: qualification || null,
        is_active: false, // 机构用户需要管理员审核
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('[Auth/RegisterInstitution] Failed to create user:', createError);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '注册失败，请稍后重试',
      });
    }

    // 移除密码字段
    const { password_hash, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      code: 201,
      msg: 'success',
      data: {
        user: userWithoutPassword,
        message: '注册成功，等待管理员审核',
      },
    });
  } catch (error) {
    console.error('[Auth/RegisterInstitution] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return registerInstitution(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
