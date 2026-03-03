/**
 * 处方管理 API - /api/formula-management
 *
 * 功能：
 * - GET /api/formula-management/formulas - 获取处方列表
 * - GET /api/formula-management/formulas/:name - 获取处方详情
 * - POST /api/formula-management/formulas - 创建处方
 * - DELETE /api/formula-management/formulas/:name - 删除处方
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../../utils/supabase';
import { authenticate, AuthUser } from '../../../utils/auth';

/**
 * 获取处方列表
 *
 * GET /api/formula-management/formulas
 */
async function getFormulas(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[FormulaManagement] Failed to fetch formulas:', error);
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
    console.error('[FormulaManagement] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 获取处方详情
 *
 * GET /api/formula-management/formulas/:name
 */
async function getFormula(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name } = req.query;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .eq('name', decodeURIComponent(name as string))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          code: 404,
          msg: 'error',
          error: '处方不存在',
        });
      }

      console.error('[FormulaManagement] Failed to fetch formula:', error);
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
    console.error('[FormulaManagement] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 创建处方
 *
 * POST /api/formula-management/formulas
 */
async function createFormula(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { name, ingredients, decoctionMethod, dosageMethod, precautions } = req.body;
    const supabase = getSupabaseClient();

    const formulaData = {
      user_id: user.id,
      name,
      ingredients,
      decoction_method: decoctionMethod,
      dosage_method: dosageMethod,
      precautions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('formulas')
      .insert(formulaData)
      .select()
      .single();

    if (error) {
      console.error('[FormulaManagement] Failed to create formula:', error);
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
    console.error('[FormulaManagement] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 删除处方
 *
 * DELETE /api/formula-management/formulas/:name
 */
async function deleteFormula(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { name } = req.query;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('formulas')
      .delete()
      .eq('name', decodeURIComponent(name as string))
      .eq('user_id', user.id);

    if (error) {
      console.error('[FormulaManagement] Failed to delete formula:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '删除失败',
      });
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: { message: '处方已删除' },
    });
  } catch (error) {
    console.error('[FormulaManagement] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let user: AuthUser | undefined;
  if (req.method !== 'GET' || req.query.name) {
    user = await authenticate(req, res);
    if (!user) {
      return;
    }
  }

  const { name } = req.query;

  if (req.method === 'GET' && name) {
    return getFormula(req, res);
  } else if (req.method === 'GET') {
    return getFormulas(req, res, user!);
  } else if (req.method === 'POST') {
    return createFormula(req, res, user!);
  } else if (req.method === 'DELETE') {
    return deleteFormula(req, res, user!);
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
