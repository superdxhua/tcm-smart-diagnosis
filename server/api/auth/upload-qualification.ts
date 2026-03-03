/**
 * 上传资质文件 API - /api/auth/upload-qualification
 *
 * 功能：
 * - POST /api/auth/upload-qualification - 上传资质文件
 *
 * 请求体：
 * - file: 文件
 * - type: 文件类型（institutionLicense, practiceLicense, physicianCert）
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '../../utils/supabase';

/**
 * 上传资质文件
 *
 * POST /api/auth/upload-qualification
 */
async function uploadQualification(req: NextApiRequest, res: NextApiResponse) {
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

    // 上传到 Supabase Storage（如果配置了）
    // 这里暂时返回一个模拟的 URL，实际需要配置 Supabase Storage
    const fileUrl = `https://example.com/qualifications/${fileName}`;

    console.log('[UploadQualification] File uploaded:', fileName, 'Type:', type);

    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: {
        url: fileUrl,
        type,
      },
    });
  } catch (error) {
    console.error('[UploadQualification] Unexpected error:', error);
    return res.status(500).json({
      code: 500,
      msg: 'error',
      error: '服务器错误',
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return uploadQualification(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      code: 405,
      msg: 'error',
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
