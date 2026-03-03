/**
 * Vercel 健康检查 API
 * 用于验证部署是否成功
 *
 * 访问: https://tcmsmarthealth.com/api/health
 */

export default function handler(req: any, res: any) {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'Bearer ***' : 'none',
    },
    cors: {
      'access-control-allow-origin': res.getHeader('access-control-allow-origin'),
      'access-control-allow-methods': res.getHeader('access-control-allow-methods'),
      'access-control-allow-headers': res.getHeader('access-control-allow-headers'),
    },
    environment: {
      node_env: process.env.NODE_ENV,
      region: process.env.VERCEL_REGION || 'unknown',
      function_name: process.env.VERCEL_FUNCTION_NAME || 'unknown',
    },
  };

  // 设置 CORS 响应头
  // 使用 Bearer Token 认证，不需要 Cookie 凭据
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // 移除 credentials 头，使用 Bearer Token 认证不需要 Cookie 凭据
  // res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 返回健康检查结果
  res.status(200).json(healthCheck);
}
