// 简单的测试 API - 用于验证 Vercel 路由是否正常工作
export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'ok',
    message: 'Test API working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
