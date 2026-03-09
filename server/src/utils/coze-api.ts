/**
 * Coze API 原生调用 helper
 * 使用 Fetch API 直接调用 Coze API
 * 项目使用 coze-coding-dev-sdk，直接调用大模型服务，不需要 bot_id
 * 官方确认的 API 地址: https://integration.coze.cn/api/v3/chat
 * 认证方式: Bearer Token (COZE_WORKLOAD_IDENTITY_API_KEY)
 * 模型参数: COZE_MODEL_NAME (如 qwen-max)
 */

/**
 * 调用 Coze API（原生 Fetch）
 * @param messages OpenAI 格式的消息数组
 * @returns AI 回复内容
 */
export async function callCozeChat(messages: Array<{ role: string; content: string }>): Promise<string> {
  // 读取环境变量
  const token = process.env.COZE_WORKLOAD_IDENTITY_API_KEY || process.env.COZE_API_KEY;
  const modelName = process.env.COZE_MODEL_NAME || 'qwen-max';

  console.log('=== Coze API 原生调用 ===');
  console.log('Token:', token ? `${token.substring(0, 20)}...` : '未配置');
  console.log('模型名称:', modelName);

  if (!token) {
    throw new Error('COZE_WORKLOAD_IDENTITY_API_KEY 未配置');
  }

  // 官方确认的正确 API 地址
  const apiUrl = 'https://integration.coze.cn/api/v3/chat';
  console.log('请求地址:', apiUrl);

  console.log('用户问题:', messages[messages.length - 1].content);
  console.log('历史消息数量:', messages.length - 1);

  // 构建 OpenAI 格式的请求体（官方确认格式）
  const requestBody = {
    model: modelName,
    messages: messages,
    stream: false
  };
  console.log('请求 Body:', JSON.stringify(requestBody));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  });

  // 如果状态码不对，打印响应文本
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API 错误响应状态:', response.status);
    console.error('API 错误响应文本:', errorText);
    throw new Error(`API Error: ${response.status} - ${errorText.substring(0, 200)}`);
  }

  // 解析结果
  const data = await response.json();
  console.log('Coze API 响应:', JSON.stringify(data));

  // 检查错误码
  if (data.code !== 0 && data.code !== undefined) {
    throw new Error(`Coze API Error: ${data.msg} (code: ${data.code})`);
  }

  // 返回 AI 的回复内容
  // 官方格式: data.choices[0].message.content
  const choice = data.choices?.[0];
  if (!choice?.message?.content) {
    // 备用格式兼容
    const aiMessage = data.messages?.[0];
    if (aiMessage?.content) {
      console.log('AI 回复长度:', aiMessage.content.length);
      return aiMessage.content;
    }
    throw new Error('Coze API 返回空消息');
  }

  console.log('AI 回复长度:', choice.message.content.length);
  return choice.message.content;
}

/**
 * 获取环境变量信息（用于调试）
 */
export function getCozeConfig() {
  const token = process.env.COZE_WORKLOAD_IDENTITY_API_KEY || process.env.COZE_API_KEY;

  return {
    token: token ? `${token.substring(0, 20)}...` : '未配置',
    modelName: process.env.COZE_MODEL_NAME || 'qwen-max',
    apiUrl: 'https://integration.coze.cn/api/v3/chat',
  };
}
