/**
 * 用户管理 API - /api/members
 *
 * 功能：
 * 1. GET /api/members - 获取用户列表
 * 2. GET /api/members/:id - 获取单个用户
 * 3. POST /api/members - 创建新用户
 * 4. PUT /api/members/:id - 更新用户信息
 * 5. DELETE /api/members/:id - 删除用户
 *
 * 权限控制：
 * - 所有操作都需要认证（除 GET 列表外）
 * - 个人账户有创建上限（最多 4 位用户）
 * - 个人账户不能删除用户
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../utils/supabase';
import { authenticate, AuthUser, isAdmin, isInstitution, isIndividual } from '../utils/auth';

/**
 * 获取用户列表
 *
 * 查询参数：
 * - consultant_id: 筛选特定顾问的用户
 *
 * GET /api/members
 */
async function getMembers(req: NextApiRequest, res: NextApiResponse, user?: AuthUser) {
  try {
    const supabase = getSupabaseClient();
    let query = supabase.from('members').select('*');

    // 如果提供了 consultant_id 参数，添加筛选
    if (req.query.consultant_id) {
      query = query.eq('consultant_id', req.query.consultant_id);
    }
    // 如果用户已登录，筛选该用户的用户
    else if (user) {
      query = query.eq('consultant_id', user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[Members] Failed to fetch members:', error);
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
    console.error('[Members] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 获取单个用户
 *
 * GET /api/members/:id
 */
async function getMember(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          code: 404,
          msg: 'error',
          error: '用户不存在',
        });
      }

      console.error('[Members] Failed to fetch member:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: error.message,
      });
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data,
    });
  } catch (error) {
    console.error('[Members] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 创建新用户
 *
 * POST /api/members
 *
 * 请求体：
 * {
 *   "name": "张三",
 *   "gender": "男",
 *   "age": 35,
 *   "birth_year": 1989,
 *   "phone": "13800138000",
 *   ...
 * }
 */
async function createMember(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const body = req.body;
    const supabase = getSupabaseClient();

    console.log('[Members] Creating member:', JSON.stringify(body, null, 2));

    // 验证必需字段
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '用户名称不能为空',
      });
    }

    // 个人账户添加用户数量上限检查
    if (isIndividual(user)) {
      const { count, error: countError } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('consultant_id', user.id);

      if (countError) {
        console.error('[Members] Failed to count members:', countError);
        return res.status(500).json({
          code: 500,
          msg: 'error',
          error: '无法查询用户数量',
        });
      }

      const maxMembers = 4;
      if (count >= maxMembers) {
        return res.status(403).json({
          code: 403,
          msg: `个人账户最多只能添加 ${maxMembers} 位用户，您已达到上限。如需添加更多用户，请联系管理员申请机构资质认证。`,
        });
      }

      console.log(`[Members] Individual account current members: ${count}/${maxMembers}`);
    }

    // 准备用户数据
    const memberData = {
      consultant_id: user.id,
      name: body.name.trim(),
      gender: body.gender || null,
      age: body.age || null,
      birth_year: body.birth_year || null,
      height: body.height || null,
      weight: body.weight || null,
      phone: body.phone || null,
      contact_info: body.contact_info || null,
      address: body.address || null,
      health_history: body.health_history || null,
      allergies: body.allergies || null,
      visit_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 创建用户
    const { data, error } = await supabase
      .from('members')
      .insert(memberData)
      .select()
      .single();

    if (error) {
      console.error('[Members] Failed to create member:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: error.message,
      });
    }

    console.log('[Members] Member created successfully:', data.id);

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data,
    });
  } catch (error) {
    console.error('[Members] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 更新用户信息
 *
 * PUT /api/members/:id
 *
 * 请求体：
 * {
 *   "name": "张三",
 *   "gender": "男",
 *   ...
 * }
 */
async function updateMember(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { id } = req.query;
    const body = req.body;
    const supabase = getSupabaseClient();

    // 验证用户是否存在
    const { data: existingMember, error: fetchError } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          code: 404,
          msg: 'error',
          error: '用户不存在',
        });
      }

      console.error('[Members] Failed to fetch member:', fetchError);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: fetchError.message,
      });
    }

    // 检查权限：只能更新自己的用户
    if (existingMember.consultant_id !== user.id && !isAdmin(user)) {
      return res.status(403).json({
        code: 403,
        msg: 'error',
        error: '您没有权限修改此用户',
      });
    }

    // 准备更新数据
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // 只更新提供的字段
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.age !== undefined) updateData.age = body.age;
    if (body.birth_year !== undefined) updateData.birth_year = body.birth_year;
    if (body.height !== undefined) updateData.height = body.height;
    if (body.weight !== undefined) updateData.weight = body.weight;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.contact_info !== undefined) updateData.contact_info = body.contact_info;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.health_history !== undefined) updateData.health_history = body.health_history;
    if (body.allergies !== undefined) updateData.allergies = body.allergies;

    // 更新用户
    const { data, error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Members] Failed to update member:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: error.message,
      });
    }

    console.log('[Members] Member updated successfully:', data.id);

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data,
    });
  } catch (error) {
    console.error('[Members] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 删除用户
 *
 * DELETE /api/members/:id
 */
async function deleteMember(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { id } = req.query;
    const supabase = getSupabaseClient();

    // 验证用户是否存在
    const { data: existingMember, error: fetchError } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          code: 404,
          msg: 'error',
          error: '用户不存在',
        });
      }

      console.error('[Members] Failed to fetch member:', fetchError);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: fetchError.message,
      });
    }

    // 个人账户不能删除用户
    if (isIndividual(user) && !isAdmin(user)) {
      return res.status(403).json({
        code: 403,
        msg: 'error',
        error: '个人账户没有删除用户的权限。如需删除用户，请联系管理员申请机构资质认证。',
      });
    }

    // 检查权限：只能删除自己的用户（除非是管理员）
    if (existingMember.consultant_id !== user.id && !isAdmin(user)) {
      return res.status(403).json({
        code: 403,
        msg: 'error',
        error: '您没有权限删除此用户',
      });
    }

    // 删除用户
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Members] Failed to delete member:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: error.message,
      });
    }

    console.log('[Members] Member deleted successfully:', id);

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: { id },
    });
  } catch (error) {
    console.error('[Members] Unexpected error:', error);
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
 * - GET /api/members - 获取用户列表（可选认证）
 * - GET /api/members/:id - 获取单个用户（需要认证）
 * - POST /api/members - 创建用户（需要认证）
 * - PUT /api/members/:id - 更新用户（需要认证）
 * - DELETE /api/members/:id - 删除用户（需要认证）
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Members] Request:', {
    method: req.method,
    url: req.url,
    query: req.query,
  });

  // 路由分发
  const { id } = req.query;

  if (id) {
    // 处理单个用户的操作
    if (req.method === 'GET') {
      // GET /api/members/:id - 需要认证
      const user = await authenticate(req, res);
      if (!user) return;

      return getMember(req, res);
    } else if (req.method === 'PUT') {
      // PUT /api/members/:id - 需要认证
      const user = await authenticate(req, res);
      if (!user) return;

      return updateMember(req, res, user);
    } else if (req.method === 'DELETE') {
      // DELETE /api/members/:id - 需要认证
      const user = await authenticate(req, res);
      if (!user) return;

      return deleteMember(req, res, user);
    } else {
      return res.status(405).json({
        code: 405,
        msg: 'error',
        error: '不支持的 HTTP 方法',
      });
    }
  } else {
    // 处理列表操作
    if (req.method === 'GET') {
      // GET /api/members - 可选认证
      const token = req.headers.authorization?.replace('Bearer ', '');
      let user: AuthUser | undefined;

      if (token) {
        const authResult = await authenticate(req, res);
        if (authResult) {
          user = authResult;
        }
      }

      return getMembers(req, res, user);
    } else if (req.method === 'POST') {
      // POST /api/members - 需要认证
      const user = await authenticate(req, res);
      if (!user) return;

      return createMember(req, res, user);
    } else {
      return res.status(405).json({
        code: 405,
        msg: 'error',
        error: '不支持的 HTTP 方法',
      });
    }
  }
}

// 配置 Vercel Serverless Function
export const config = {
  api: {
    bodyParser: true,
  },
};
