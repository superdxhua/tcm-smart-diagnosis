import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MedicalAiService {
  // 不再使用构造函数注入，直接读取全局 process.env
  // 只有在 ConfigModule.forRoot({ isGlobal: true }) 配置下，process.env 才能读到 Render 的变量

  private customHeaders: Record<string, string> = {};

  setCustomHeaders(headers: Record<string, string>) {
    this.customHeaders = headers;
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    return this.callCozeAPI(messages);
  }

  async recommendPrescription(params: any): Promise<string> {
    const messages = params.messages || [{ role: 'user', content: JSON.stringify(params) }];
    return this.callCozeAPI(messages);
  }

  async differentiateSyndrome(params: any): Promise<string> {
    const messages = params.messages || [{ role: 'user', content: JSON.stringify(params) }];
    return this.callCozeAPI(messages);
  }

  async getMedicationGuidance(params: any): Promise<string> {
    const messages = params.messages || [{ role: 'user', content: JSON.stringify(params) }];
    return this.callCozeAPI(messages);
  }

  async searchTCMInfo(params: any): Promise<string> {
    const messages = params.messages || [{ role: 'user', content: JSON.stringify(params) }];
    return this.callCozeAPI(messages);
  }

  async generateHealthPlan(params: any): Promise<string> {
    const messages = params.messages || [{ role: 'user', content: JSON.stringify(params) }];
    return this.callCozeAPI(messages);
  }

  async uploadAttachment(file: any): Promise<any> {
    return {};
  }

  async analyzeAttachment(imageUrl: string): Promise<any> {
    return {};
  }

  private async callCozeAPI(messages: Array<{ role: string; content: string }>): Promise<string> {
    // 1. 直接读取 process.env
    const token = process.env.COZE_API_KEY;
    const baseUrl = process.env.COZE_API_BASE_URL;

    // 2. 打印日志，确认是否读取成功
    console.log('=== [Final Fix] Reading Env Vars ===');
    console.log('COZE_API_KEY exists:', !!token);
    console.log('COZE_API_BASE_URL:', baseUrl);

    // 3. 校验变量是否存在
    if (!token) {
      console.error('Error: COZE_API_KEY is missing!');
      throw new Error('Server configuration error: Missing API Key');
    }
    if (!baseUrl) {
      console.error('Error: COZE_API_BASE_URL is missing!');
      throw new Error('Server configuration error: Missing Base URL');
    }

    // 4. 拼接正确的完整 URL
    const apiUrl = `${baseUrl}/open_api/v2/chat`;
    console.log(`[Final Fix] Requesting URL: ${apiUrl}`);

    const payload = {
      user_id: 'user_' + Date.now(),
      additional_messages: messages
    };

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.code === 0 && response.data.data) {
        const msgs = response.data.data.messages;
        if (msgs && msgs.length > 0) {
          return msgs[0].content;
        }
      }
      
      console.error('API Error Response:', JSON.stringify(response.data));
      throw new Error('Invalid response format');

    } catch (error) {
      console.error('[Final Fix] API Call Failed:', error.message);
      throw new Error('AI service unavailable');
    }
  }
}