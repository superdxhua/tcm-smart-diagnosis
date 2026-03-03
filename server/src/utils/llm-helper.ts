import { LLMClient, Config } from 'coze-coding-dev-sdk';

/**
 * 创建 LLM 客户端 helper 函数
 * 统一处理 API Key 格式，确保所有服务使用正确的认证方式
 */
export function createLLMClient(customHeaders?: Record<string, string>): LLMClient {
  const clientId = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_ID;
  const clientSecret = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_SECRET;

  // 将 client_id:client_secret 转换为 Base64 编码
  const apiKey = (clientId && clientSecret)
    ? Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    : undefined;

  console.log('【LLM Helper】创建 LLM 客户端');
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  console.log('CustomHeaders keys:', customHeaders ? Object.keys(customHeaders).join(', ') : 'none');

  // 创建配置，显式设置 API Key
  const config = new Config({
    apiKey: apiKey,
    baseUrl: process.env.COZE_INTEGRATION_BASE_URL,
    modelBaseUrl: process.env.COZE_INTEGRATION_MODEL_BASE_URL,
  });

  // 创建 LLM 客户端
  return new LLMClient(config, customHeaders);
}

/**
 * 创建 Config 对象 helper 函数
 * 用于需要 Config 的其他 SDK 客户端（如 SearchClient、S3Storage）
 */
export function createConfig(): Config {
  const clientId = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_ID;
  const clientSecret = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_SECRET;

  // 将 client_id:client_secret 转换为 Base64 编码
  const apiKey = (clientId && clientSecret)
    ? Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    : undefined;

  return new Config({
    apiKey: apiKey,
    baseUrl: process.env.COZE_INTEGRATION_BASE_URL,
    modelBaseUrl: process.env.COZE_INTEGRATION_MODEL_BASE_URL,
  });
}
