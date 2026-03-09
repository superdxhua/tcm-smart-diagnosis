/**
 * Coze API 原生调用 helper
 * 使用 Fetch API 直接调用 Coze API，不再依赖 LangChain/SDK
 * cztei 开头的 Token 是工作负载 Token，必须使用 integration.coze.cn
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
  // 工作负载 Token 必须使用 integration.coze.cn
  const baseUrl = process.env.COZE_INTEGRATION_BASE_URL || 'https://integration.coze.cn';

  console.log('=== Coze API 原生调用 ===');
  console.log('Token:', token ? `${token.substring(0, 20)}...` : '未配置');
  console.log('Bot ID:', botId);
  console.log('Base URL:', baseUrl);

  if (!token) {
    throw new Error('COZE_WORKLOAD_IDENTITY_API_KEY 未配置');
  }

  if (!botId) {
    throw new Error('COZE_BOT_ID 未配置');
  }

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

  // 工作负载 Token 使用 integration.coze.cn/v3/chat
  const apiUrl = `${baseUrl}/v3/chat`;
  console.log('请求地址:', apiUrl);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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
  return {
    token: process.env.COZE_WORKLOAD_IDENTITY_API_KEY ? `${process.env.COZE_WORKLOAD_IDENTITY_API_KEY.substring(0, 20)}...` : '未配置',
    botId: process.env.COZE_BOT_ID || '未配置',
    baseUrl: process.env.COZE_INTEGRATION_BASE_URL || 'https://integration.coze.cn',
    modelBaseUrl: process.env.COZE_INTEGRATION_MODEL_BASE_URL || 'https://integration.coze.cn/api/v3',
  };
}
