/**
 * Coze API 原生调用 helper
 * 使用 Fetch API 直接调用 Coze API，不再依赖 LangChain/SDK
 * 自动根据 Token 类型选择正确的 API 地址
 */

import { LLMClient, Config } from 'coze-coding-dev-sdk';

/**
 * 调用 Coze API（原生 Fetch）
 * @param messages OpenAI 格式的消息数组
 * @returns AI 回复内容
 */
export async function callCozeChat(messages: Array<{ role: string; content: string }>): Promise<string> {
  // 读取环境变量
  const token = process.env.COZE_WORKLOAD_IDENTITY_API_KEY || process.env.COZE_API_KEY;
  const botId = process.env.COZE_BOT_ID;
  const envBaseUrl = process.env.COZE_INTEGRATION_BASE_URL || 'https://api.coze.cn';

  console.log('=== Coze API 原生调用 ===');
  console.log('Token:', token ? `${token.substring(0, 20)}...` : '未配置');
  console.log('Bot ID:', botId);
  console.log('环境变量 Base URL:', envBaseUrl);

  if (!token) {
    throw new Error('COZE_WORKLOAD_IDENTITY_API_KEY 未配置');
  }

  if (!botId) {
    throw new Error('COZE_BOT_ID 未配置');
  }

  // 自动判断 Token 类型并选择正确的 API 地址
  const isWorkloadToken = token.startsWith('cztei_');
  const baseUrl = isWorkloadToken ? 'https://integration.coze.cn' : envBaseUrl;

  console.log('【自动修正】Token 类型:', isWorkloadToken ? '工作负载 (cztei_)' : '标准');
  console.log('【自动修正】最终 Base URL:', baseUrl);

  // 生成临时用户 ID
  const userId = 'user_' + Date.now();

  // 将 OpenAI 格式的 messages 转换为 Coze 格式
  // Coze 需要 query (最后一条消息) 和 chat_history (历史消息)
  const lastMsg = messages[messages.length - 1];
  const history = messages.slice(0, -1).map(m => ({
    role: m.role,
    content: m.content,
    type: 'text' // Coze 需要这个字段
  }));

  console.log('用户问题:', lastMsg.content);
  console.log('历史消息数量:', history.length);

  // 工作负载 Token 使用 /api/v3/workload/chat 或 /v3/chat
  const apiUrl = isWorkloadToken
    ? `${baseUrl}/api/v3/workload/chat`
    : `${baseUrl}/open_api/v2/chat`;
  console.log('请求地址:', apiUrl);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 工作负载 Token 尝试使用 Bearer 认证
  headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      bot_id: botId,
      user_id: userId,
      query: lastMsg.content,
      chat_history: history,
      stream: false
    })
  });

  // 解析结果
  const data = await response.json();
  console.log('Coze API 响应:', JSON.stringify(data));

  if (data.code !== 0) {
    throw new Error(`Coze API Error: ${data.msg} (code: ${data.code})`);
  }

  // 返回 AI 的回复内容
  const aiMessage = data.messages?.[0];
  if (!aiMessage) {
    throw new Error('Coze API 返回空消息');
  }

  console.log('AI 回复长度:', aiMessage.content?.length || 0);
  return aiMessage.content;
}

/**
 * 获取环境变量信息（用于调试）
 */
export function getCozeConfig() {
  const token = process.env.COZE_WORKLOAD_IDENTITY_API_KEY || process.env.COZE_API_KEY;
  const isWorkloadToken = token?.startsWith('cztei_') || false;

  return {
    token: token ? `${token.substring(0, 20)}...` : '未配置',
    botId: process.env.COZE_BOT_ID || '未配置',
    envBaseUrl: process.env.COZE_INTEGRATION_BASE_URL || 'https://api.coze.cn',
    isWorkloadToken,
    autoSelectedBaseUrl: isWorkloadToken ? 'https://integration.coze.cn' : (process.env.COZE_INTEGRATION_BASE_URL || 'https://api.coze.cn'),
  };
}
