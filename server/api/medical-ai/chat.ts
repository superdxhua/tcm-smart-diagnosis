/**
 * AI 医疗聊天 API - /api/medical-ai/chat
 *
 * 功能：
 * - POST /api/medical-ai/chat - AI 医疗聊天
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * AI 医疗聊天
 *
 * POST /api/medical-ai/chat
 */
async function chat(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { message, context, memberId } = req.body;

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
      diagnosis: '脾虚湿盛',
      differentiation: '脾主运化，脾虚则运化失常，湿浊内生，湿阻中焦',
      treatmentPrinciple: '健脾益气，燥湿化痰',
      prescription: {
        formulaName: '参苓白术散加减',
        ingredients: [
          { name: '人参', dosage: '10g', special: '' },
          { name: '白术', dosage: '10g', special: '炒' },
          { name: '茯苓', dosage: '15g', special: '' },
          { name: '甘草', dosage: '6g', special: '炙' },
          { name: '陈皮', dosage: '10g', special: '' },
          { name: '半夏', dosage: '10g', special: '制' },
        ],
        decoctionMethod: '水煎服，每日 1 剂，分 2 次服用',
        dosageMethod: '早晚各 1 次，饭后服用',
        precautions: '忌食生冷油腻之物，注意保暖',
      },
      explanation: '患者症状符合脾虚湿盛证，治疗应以健脾益气、燥湿化痰为主',
      advice: '建议配合针灸治疗，调理脾胃功能，注意饮食起居',
    };

    // 保存聊天记录
    await supabase
      .from('chat_history')
      .insert({
        user_id: user.id,
        member_id: memberId || null,
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
    console.error('[MedicalAI/Chat] Unexpected error:', error);
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
    return; // authenticate 已经返回了错误响应
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
