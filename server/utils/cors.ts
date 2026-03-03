/**
 * CORS 工具函数
 *
 * 用途：为 API 响应添加 CORS headers
 * 使用：在所有 API 函数中调用
 */

import { NextApiResponse } from 'next';

/**
 * 允许的来源列表
 */
const ALLOWED_ORIGINS = [
  'https://www.zhongyihskhealth.com',
  'https://zhongyihskhealth.com',
  'http://localhost:5000', // 本地开发
  'http://127.0.0.1:5000', // 本地开发
];

/**
 * 检查来源是否允许
 */
function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * 设置 CORS headers
 *
 * 使用方法：
 * ```typescript
 * export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   setCorsHeaders(req, res);
 *
 *   if (req.method === 'OPTIONS') {
 *     res.status(200).end();
 *     return;
 *   }
 *
 *   // 业务逻辑...
 * }
 * ```
 */
export function setCorsHeaders(req: any, res: NextApiResponse): void {
  const origin = req.headers.origin;

  // 如果来源在允许列表中，设置具体的 origin
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // 生产环境：允许所有来源（临时方案）
    // 建议：根据实际情况调整
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }

  // 允许的 HTTP 方法
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  // 允许的请求头
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin'
  );

  // 允许携带凭证（cookies）
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 预检请求的缓存时间（秒）
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * 处理 OPTIONS 预检请求
 *
 * 使用方法：
 * ```typescript
 * export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   setCorsHeaders(req, res);
 *
 *   if (req.method === 'OPTIONS') {
 *     return handlePreflightRequest(res);
 *   }
 *
 *   // 业务逻辑...
 * }
 * ```
 */
export function handlePreflightRequest(res: NextApiResponse): void {
  res.status(200).end();
}
