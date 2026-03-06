import { LLMClient, Config } from 'coze-coding-dev-sdk';

/**
 * 创建 LLM 客户端 helper 函数
 * 统一处理 API Key 格式，确保所有服务使用正确的认证方式
 */
export function createLLMClient(customHeaders?: Record<string, string>): LLMClient {
  // API Key 优先级：COZE_WORKLOAD_IDENTITY_API_KEY > COZE_API_KEY
  let apiKey: string | undefined;

  const workloadApiKey = process.env.COZE_WORKLOAD_IDENTITY_API_KEY;
  const cozeApiKey = process.env.COZE_API_KEY;
  const clientId = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_ID;
  const clientSecret = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_SECRET;

  if (workloadApiKey) {
    apiKey = workloadApiKey;
    console.log('【LLM Helper】使用 COZE_WORKLOAD_IDENTITY_API_KEY');
  } else if (cozeApiKey) {
    apiKey = cozeApiKey;
    console.log('【LLM Helper】使用 COZE_API_KEY');
  } else if (clientId && clientSecret) {
    apiKey = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    console.log('【LLM Helper】使用 Client ID/Secret 认证');
  } else {
    console.warn('【LLM Helper】警告：未找到有效的认证凭据');
  }

  // Base URL 优先级：环境变量 > 默认值
  const baseUrl = process.env.COZE_INTEGRATION_BASE_URL || 'https://integration.coze.cn';
  const modelBaseUrl = process.env.COZE_INTEGRATION_MODEL_BASE_URL || 'https://integration.coze.cn/api/v3';

  console.log('【LLM Helper】创建 LLM 客户端');
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  console.log('Base URL:', baseUrl);
  console.log('Model Base URL:', modelBaseUrl);
  console.log('CustomHeaders keys:', customHeaders ? Object.keys(customHeaders).join(', ') : 'none');

  // 创建配置，显式设置 API Key
  const config = new Config({
    apiKey: apiKey,
    baseUrl: baseUrl,
    modelBaseUrl: modelBaseUrl,
  });

  // 创建 LLM 客户端
  return new LLMClient(config, customHeaders);
}

/**
 * 创建 Config 对象 helper 函数
 * 用于需要 Config 的其他 SDK 客户端（如 SearchClient、S3Storage）
 */
export function createConfig(): Config {
  let apiKey: string | undefined;

  const workloadApiKey = process.env.COZE_WORKLOAD_IDENTITY_API_KEY;
  const cozeApiKey = process.env.COZE_API_KEY;
  const clientId = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_ID;
  const clientSecret = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_SECRET;

  if (workloadApiKey) {
    apiKey = workloadApiKey;
  } else if (cozeApiKey) {
    apiKey = cozeApiKey;
  } else if (clientId && clientSecret) {
    apiKey = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  }

  const baseUrl = process.env.COZE_INTEGRATION_BASE_URL || 'https://integration.coze.cn';
  const modelBaseUrl = process.env.COZE_INTEGRATION_MODEL_BASE_URL || 'https://integration.coze.cn/api/v3';

  return new Config({
    apiKey: apiKey,
    baseUrl: baseUrl,
    modelBaseUrl: modelBaseUrl,
  });
}
