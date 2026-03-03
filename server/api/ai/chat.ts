/**
 * 通用 AI 聊天 API - /api/ai/chat
 *
 * 功能：
 * - POST /api/ai/chat - AI 聊天
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * AI 聊天
 *
 * POST /api/ai/chat
 */
async function chat(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '缺少消息内容',
      });
    }

    const supabase = getSupabaseClient();

    // 这里应该调用通义千问 API，暂时返回模拟数据
    const response = {
      reply: '这是一条 AI 回复消息',
      context: context || {},
    };

    // 保存聊天记录
    await supabase
      .from('chat_history')
      .insert({
        user_id: user.id,
        message,
        response: JSON.stringify(response),
        created_at: new Date().toISOString(),
      });

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: response,
    });
  } catch (error) {
    console.error('[AI/Chat] Unexpected error:', error);
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
    return chat(req, res, user);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
