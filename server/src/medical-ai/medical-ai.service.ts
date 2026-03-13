import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MedicalAiService {
  private customHeaders: Record<string, string> = {};

  setCustomHeaders(headers: Record<string, string>) {
    this.customHeaders = headers;
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    // 1. 读取 SAT Token
    const token = process.env.COZE_API_KEY;

    if (!token) {
      console.error('COZE_API_KEY not found');
      throw new Error('Server configuration error');
    }

    // 2. 构建请求体 (SAT Token 模式不需要 bot_id)
    const payload = {
      user_id: 'user_' + Date.now(),
      additional_messages: messages
    };

    // 3. 发送请求
    const apiUrl = 'https://api.coze.cn/open_api/v2/chat';

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('=== [Direct API] Response Status:', response.status);
      
      // 4. 解析结果
      if (response.data && response.data.code === 0 && response.data.data) {
        const msgs = response.data.data.messages;
        if (msgs && msgs.length > 0) {
          return msgs[0].content;
        }
      }
      
      console.error('API Error Response:', JSON.stringify(response.data));
      throw new Error('Invalid response format');

    } catch (error) {
      console.error('[Direct API] Call failed:', error.message);
      throw new Error('AI service unavailable');
    }
  }
}
