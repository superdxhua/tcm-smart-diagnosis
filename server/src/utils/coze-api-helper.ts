/**
 * 扣子编程官方 SDK Helper
 * 使用 coze-coding-dev-sdk 直接调用大模型服务
 * 不需要 bot_id，使用 model 参数
 */

import { LLMClient, Config, Message } from 'coze-coding-dev-sdk';

/**
 * SDK 消息类型（使用字面量类型）
 */
type SDKMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

/**
 * 创建 LLM 客户端
 * 使用 SAT Token 或 Workload Token
 */
function createLLMClient(): LLMClient {
  // 读取 Token
  const token = process.env.COZE_WORKLOAD_IDENTITY_API_KEY || process.env.COZE_API_KEY;

  if (!token) {
    throw new Error('COZE_WORKLOAD_IDENTITY_API_KEY 未配置');
  }

  // 根据 Token 类型选择正确的 Base URL
  let baseUrl = 'https://api.coze.cn';
  if (token.startsWith('cztei_')) {
    // Workload Token 使用 integration 地址
    baseUrl = 'https://integration.coze.cn';
  }

  const modelName = process.env.COZE_MODEL_NAME || 'qwen-max';
  const modelBaseUrl = baseUrl;

  console.log('【SDK】创建 LLM 客户端');
  console.log('【SDK】Token:', token.substring(0, 20) + '...');
  console.log('【SDK】Base URL:', baseUrl);
  console.log('【SDK】Model Base URL:', modelBaseUrl);
  console.log('【SDK】Model Name:', modelName);

  // 创建配置
  const config = new Config({
    apiKey: token,
    baseUrl: baseUrl,
    modelBaseUrl: modelBaseUrl,
  });

  return new LLMClient(config);
}

/**
 * 调用 Coze AI（大模型服务）
 * @param messages OpenAI 格式的消息数组（支持任意 role 字符串）
 * @returns AI 回复内容
 */
export async function callCozeAI(messages: Array<{ role: string; content: string }>): Promise<string> {
  console.log('=== [官方 SDK] 调用 Coze AI ===');
  console.log('消息数量:', messages.length);

  // 转换为 SDK 需要的类型（使用类型断言）
  const sdkMessages: SDKMessage[] = messages.map(msg => ({
    role: msg.role as 'system' | 'user' | 'assistant',
    content: msg.content
  }));

  const llmClient = createLLMClient();

  try {
    // 直接调用 SDK，不需要额外的 bot_id 参数
    const response = await llmClient.invoke(sdkMessages as Message[], {
      temperature: 0.7,
    });

    console.log('=== [官方 SDK] 调用成功 ===');
    console.log('回复长度:', response.content?.length || 0);

    return response.content;
  } catch (error) {
    console.error('=== [官方 SDK] 调用失败 ===');
    console.error('错误:', error);
    throw error;
  }
}
