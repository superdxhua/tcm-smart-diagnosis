import { LLMClient, Config } from 'coze-coding-dev-sdk';

/**
 * 创建 LLM 客户端 helper 函数
 * 统一处理 API Key 格式，确保所有服务使用正确的认证方式
 * 关键修复：通过 customHeaders 传递 Authorization，避免 SDK 误解析 Token
 */
export function createLLMClient(customHeaders?: Record<string, string>): LLMClient {
  // API Key 优先级：COZE_API_KEY > COZE_WORKLOAD_IDENTITY_API_KEY
  let apiKey: string | undefined;

  const cozeApiKey = process.env.COZE_API_KEY;
  const workloadApiKey = process.env.COZE_WORKLOAD_IDENTITY_API_KEY;
  const clientId = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_ID;
  const clientSecret = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_SECRET;

  if (cozeApiKey) {
    apiKey = cozeApiKey;
    console.log('【LLM Helper】使用 COZE_API_KEY');
  } else if (workloadApiKey) {
    apiKey = workloadApiKey;
    console.log('【LLM Helper】使用 COZE_WORKLOAD_IDENTITY_API_KEY');
  } else if (clientId && clientSecret) {
    apiKey = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    console.log('【LLM Helper】使用 Client ID/Secret 认证');
  } else {
    console.warn('【LLM Helper】警告：未找到有效的认证凭据');
  }

  // Base URL 优先级：Render 上配置的变量名优先，默认兜底用 api.coze.cn
  const baseUrl = process.env.COZE_API_BASE_URL
               || process.env.COZE_INTEGRATION_BASE_URL
               || process.env.COZE_MODEL_BASE_URL
               || 'https://api.coze.cn';
  const modelBaseUrl = process.env.COZE_API_BASE_URL
                    || process.env.COZE_INTEGRATION_MODEL_BASE_URL
                    || process.env.COZE_MODEL_BASE_URL
                    || 'https://api.coze.cn';

  // 模型名称：从环境变量读取，默认使用 qwen-max
  const modelName = process.env.COZE_MODEL_NAME || 'qwen-max';

  console.log('【LLM Helper】创建 LLM 客户端');
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  console.log('Base URL:', baseUrl);
  console.log('Model Base URL:', modelBaseUrl);
  console.log('Model Name:', modelName);
  console.log('CustomHeaders keys:', customHeaders ? Object.keys(customHeaders).join(', ') : 'none');

  // 关键修复：通过 Authorization Header 传递 API Key，绕过 SDK 的 Token 解析
  // Coze PAT 格式为 cztei_xxx，不需要 Bearer 前缀（SDK 会自动添加）
  const authHeaders: Record<string, string> = {
    'Authorization': apiKey || '',
  };

  // 合并自定义 headers
  const mergedHeaders = { ...authHeaders, ...customHeaders };

  console.log('【LLM Helper】Authorization Header 已设置:', authHeaders['Authorization'] ? `${authHeaders['Authorization'].substring(0, 20)}...` : '空');

  // 创建配置（API Key 设为空，让 Header 生效）
  const config = new Config({
    apiKey: '', // 清空 API Key，完全通过 Header 认证
    baseUrl: baseUrl,
    modelBaseUrl: modelBaseUrl,
  });

  // 创建 LLM 客户端，传入合并后的 Headers
  return new LLMClient(config, mergedHeaders);
}

/**
 * 创建 Config 对象 helper 函数
 * 用于需要 Config 的其他 SDK 客户端（如 SearchClient、S3Storage）
 * 返回配置和自定义 Headers（用于绕过 SDK 的 Token 解析）
 */
export function createConfig(): Config {
  let apiKey: string | undefined;

  const cozeApiKey = process.env.COZE_API_KEY;
  const workloadApiKey = process.env.COZE_WORKLOAD_IDENTITY_API_KEY;
  const clientId = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_ID;
  const clientSecret = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_SECRET;

  if (cozeApiKey) {
    apiKey = cozeApiKey;
  } else if (workloadApiKey) {
    apiKey = workloadApiKey;
  } else if (clientId && clientSecret) {
    apiKey = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  }

  // Base URL 优先级：Render 上配置的变量名优先，默认兜底用 api.coze.cn
  const baseUrl = process.env.COZE_API_BASE_URL
               || process.env.COZE_INTEGRATION_BASE_URL
               || process.env.COZE_MODEL_BASE_URL
               || 'https://api.coze.cn';
  const modelBaseUrl = process.env.COZE_API_BASE_URL
                    || process.env.COZE_INTEGRATION_MODEL_BASE_URL
                    || process.env.COZE_MODEL_BASE_URL
                    || 'https://api.coze.cn';

  // 通过 Header 传递 API Key
  const config = new Config({
    apiKey: '', // 清空 API Key
    baseUrl: baseUrl,
    modelBaseUrl: modelBaseUrl,
  });

  return config;
}

/**
 * 获取认证 Headers（用于手动传递 Authorization）
 */
export function getAuthHeaders(): Record<string, string> {
  // 优先级：COZE_API_KEY > COZE_WORKLOAD_IDENTITY_API_KEY
  const apiKey = process.env.COZE_API_KEY || process.env.COZE_WORKLOAD_IDENTITY_API_KEY;

  return {
    'Authorization': apiKey || '',
  };
}

/**
 * 获取模型名称（从环境变量读取）
 */
export function getModelName(): string {
  return process.env.COZE_MODEL_NAME || 'qwen-max';
}
