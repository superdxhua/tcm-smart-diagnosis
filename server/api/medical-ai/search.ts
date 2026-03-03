/**
 * AI 搜索 API - /api/medical-ai/search
 *
 * 功能：
 * - POST /api/medical-ai/search - AI 搜索
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * AI 搜索
 *
 * POST /api/medical-ai/search
 */
async function search(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { query, type } = req.body;

    if (!query) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '缺少搜索关键词',
      });
    }

    const supabase = getSupabaseClient();

    // 简单的搜索逻辑
    const results = [];

    // 搜索处方
    const { data: formulas } = await supabase
      .from('formulas')
      .select('*')
      .or(`name.ilike.%${query}%,ingredients.ilike.%${query}%`)
      .limit(10);

    if (formulas && formulas.length > 0) {
      results.push({
        type: 'formula',
        items: formulas,
      });
    }

    // 搜索案例
    const { data: cases } = await supabase
      .from('medical_cases')
      .select('*')
      .or(`diagnosis.ilike.%${query}%,prescription.ilike.%${query}%`)
      .limit(10);

    if (cases && cases.length > 0) {
      results.push({
        type: 'case',
        items: cases,
      });
    }

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: {
        query,
        results,
      },
    });
  } catch (error) {
    console.error('[MedicalAI/Search] Unexpected error:', error);
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

  if (req.method === 'POST') {
    return search(req, res, user);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
