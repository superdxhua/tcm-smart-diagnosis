import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MedicalAiService {
  private customHeaders: Record<string, string> = {};

  setCustomHeaders(headers: Record<string, string>) {
    this.customHeaders = headers;
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    // 1. 从环境变量读取 Token
    const token = process.env.COZE_API_KEY;

    if (!token) {
      console.error('COZE_API_KEY not found in environment variables');
      throw new Error('Server configuration error');
    }

    // 2. 构建请求体 (严格按照 Coze V2 API 规范)
    const payload = {
      bot_id: process.env.COZE_BOT_ID, // 从环境变量读取 Bot ID (可选，视您的配置而定)
      user_id: 'user_' + Date.now(),
      additional_messages: messages // 使用 additional_messages 参数
    };

    // 3. 发送请求 (直接请求正确的 V2 地址)
    const apiUrl = 'https://api.coze.cn/open_api/v2/chat';

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // 4. 解析响应
      console.log('=== [Direct API] Coze Response ===');
      console.log(JSON.stringify(response.data, null, 2));

      if (response.data && response.data.code === 0 && response.data.data) {
        const msgs = response.data.data.messages;
        if (msgs && msgs.length > 0) {
          return msgs[0].content;
        }
      }
      
      console.error('Unhandled response format');
      throw new Error('Invalid response format');

    } catch (error) {
      console.error('[Direct API] Coze API call failed:', error);
      throw new Error('AI service unavailable');
    }
  }
}
