/**
 * 文件上传 API - /api/upload
 *
 * 功能：
 * - POST /api/upload - 通用文件上传
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../utils/supabase';

/**
 * 通用文件上传
 *
 * POST /api/upload
 */
async function upload(req: NextApiRequest, res: NextApiResponse) {
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
    const fileName = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // 暂时返回模拟 URL
    const fileUrl = `https://example.com/uploads/${fileName}`;

    console.log('[Upload] File uploaded:', fileName, 'Type:', type);

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: {
        url: fileUrl,
        type,
      },
    });
  } catch (error) {
    console.error('[Upload] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return upload(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
