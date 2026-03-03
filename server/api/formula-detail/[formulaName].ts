/**
 * 处方详情 API - /api/formula-detail
 *
 * 功能：
 * - GET /api/formula-detail/:name - 获取处方详情
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';

/**
 * 获取处方详情
 *
 * GET /api/formula-detail/:name
 */
async function getFormulaDetail(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { formulaName } = req.query;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .eq('name', decodeURIComponent(formulaName as string))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          code: 404,
          msg: 'error',
          error: '处方不存在',
        });
      }

      console.error('[FormulaDetail] Failed to fetch formula:', error);
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
    console.error('[FormulaDetail] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getFormulaDetail(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
