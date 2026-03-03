/**
 * AI 附件分析 API - /api/medical-ai/analyze-attachment
 *
 * 功能：
 * - POST /api/medical-ai/analyze-attachment - 分析附件
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * 分析附件
 *
 * POST /api/medical-ai/analyze-attachment
 */
async function analyzeAttachment(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { attachmentId, type } = req.body;

    if (!attachmentId) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '缺少附件 ID',
      });
    }

    const supabase = getSupabaseClient();

    // 查询附件信息
    const { data: attachment, error: fetchError } = await supabase
      .from('attachments')
      .select('*')
      .eq('id', attachmentId)
      .single();

    if (fetchError || !attachment) {
      return res.status(404).json({
        code: 404,
        msg: 'error',
        error: '附件不存在',
      });
    }

    // 这里应该调用 AI 分析接口，暂时返回模拟数据
    const analysis = {
      type: type || 'general',
      result: {
        summary: '附件分析完成',
        details: '根据附件内容，建议...',
        confidence: 0.85,
      },
    };

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: analysis,
    });
  } catch (error) {
    console.error('[MedicalAI/AnalyzeAttachment] Unexpected error:', error);
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
    return analyzeAttachment(req, res, user);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
