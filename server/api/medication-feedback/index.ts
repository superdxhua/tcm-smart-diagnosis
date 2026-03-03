/**
 * 用药反馈 API - /api/medication-feedback
 *
 * 功能：
 * - POST /api/medication-feedback - 提交用药反馈
 * - GET /api/medication-feedback/learning-summary - 获取学习摘要
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * 提交用药反馈
 *
 * POST /api/medication-feedback
 */
async function submitFeedback(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { recordId, effectiveness, sideEffects, suggestions } = req.body;
    const supabase = getSupabaseClient();

    const feedbackData = {
      user_id: user.id,
      record_id: recordId,
      effectiveness,
      side_effects: sideEffects,
      suggestions,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('medication_feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (error) {
      console.error('[MedicationFeedback] Failed to submit feedback:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '提交失败',
      });
    }

    return res.status(201).json({
      code: 200,
      msg: 'success',
      data,
    });
  } catch (error) {
    console.error('[MedicationFeedback] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

/**
 * 获取学习摘要
 *
 * GET /api/medication-feedback/learning-summary
 */
async function getLearningSummary(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('medication_feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[MedicationFeedback] Failed to fetch summary:', error);
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
    console.error('[MedicationFeedback] Unexpected error:', error);
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

  const { 'learning-summary': learningSummary } = req.query;

  if (req.method === 'POST') {
    return submitFeedback(req, res, user);
  } else if (req.method === 'GET' && learningSummary) {
    return getLearningSummary(req, res, user);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
