/**
 * Coze API 原生调用 helper
 * 使用 Fetch API 直接调用 Coze API
 * 项目使用 coze-coding-dev-sdk，直接调用大模型服务，不需要 bot_id
 * 支持两种 Token 类型:
 *   - SAT Token (sat_...): 永久有效，使用 api.coze.cn
 *   - Workload Token (cztei_...): 工作负载 Token，使用 integration.coze.cn
 * 模型参数: COZE_MODEL_NAME (如 qwen-max)
 */

/**
 * 根据 Token 类型选择正确的 API 地址
 */
function getApiUrlByToken(token: string): string {
  if (token.startsWith('sat_')) {
    // SAT Token 使用主 API 地址
    console.log('【Token 类型】SAT Token (sat_), 使用主 API');
    return 'https://api.coze.cn/api/v3/chat';
  } else if (token.startsWith('cztei_')) {
    // Workload Token 使用 integration 地址
    console.log('【Token 类型】Workload Token (cztei_), 使用 integration API');
    return 'https://integration.coze.cn/api/v3/chat';
  } else {
    // 默认使用 integration 地址
    console.log('【Token 类型】未知，使用 integration API');
    return 'https://integration.coze.cn/api/v3/chat';
  }
}

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

  // 根据 Token 类型选择正确的 API 地址
  const apiUrl = getApiUrlByToken(token);
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

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    // 打印状态码
    console.log('API 状态码:', response.status);

    // 如果状态码不对，打印响应文本
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 错误响应状态:', response.status);
      console.error('API 错误响应文本:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText.substring(0, 500)}`);
    }

    // 解析结果
    const data = await response.json();
    console.log('API 返回数据:', JSON.stringify(data));

    // 检查错误码
    if (data.code !== 0 && data.code !== undefined) {
      console.error('Coze API 错误码:', data.code);
      console.error('Coze API 错误信息:', data.msg);
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
      console.error('API 返回数据为空:', data);
      throw new Error('Coze API 返回空消息');
    }

    console.log('AI 回复长度:', choice.message.content.length);
    return choice.message.content;
  } catch (error) {
    console.error('=== 请求失败详细信息 ===');
    console.error('错误对象:', error);
    if (error instanceof Error) {
      console.error('错误信息:', error.message);
      console.error('错误堆栈:', error.stack);
    }
    throw error;
  }
}

/**
 * 获取环境变量信息（用于调试）
 */
export function getCozeConfig() {
  const token = process.env.COZE_WORKLOAD_IDENTITY_API_KEY || process.env.COZE_API_KEY;
  const apiUrl = token ? getApiUrlByToken(token) : '未配置';

  return {
    token: token ? `${token.substring(0, 20)}...` : '未配置',
    modelName: process.env.COZE_MODEL_NAME || 'qwen-max',
    apiUrl: apiUrl,
  };
}
