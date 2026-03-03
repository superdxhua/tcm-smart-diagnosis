/**
 * AI 附件上传 API - /api/medical-ai/upload-attachment
 *
 * 功能：
 * - POST /api/medical-ai/upload-attachment - 上传 AI 附件
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, AuthUser } from '../../utils/auth';

/**
 * 上传 AI 附件
 *
 * POST /api/medical-ai/upload-attachment
 */
async function uploadAttachment(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  try {
    const { file, type } = req.body;

    if (!file) {
      return res.status(400).json({
        code: 400,
        msg: 'error',
        error: '请上传文件',
      });
    }

    const supabase = getSupabaseClient();

    // 生成文件名
    const fileName = `${type}_${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // 暂时返回模拟 URL
    const fileUrl = `https://example.com/attachments/${fileName}`;

    // 保存附件记录
    const { data, error } = await supabase
      .from('attachments')
      .insert({
        user_id: user.id,
        file_name: fileName,
        file_url: fileUrl,
        type,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[MedicalAI/UploadAttachment] Failed to save attachment:', error);
      return res.status(500).json({
        code: 500,
        msg: 'error',
        error: '上传失败',
      });
    }

    return res.status(201).json({
      code: 200,
      msg: 'success',
      data: {
        id: data.id,
        url: fileUrl,
        type,
      },
    });
  } catch (error) {
    console.error('[MedicalAI/UploadAttachment] Unexpected error:', error);
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
    return uploadAttachment(req, res, user);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
