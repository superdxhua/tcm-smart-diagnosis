import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MedicalAiService {
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
    const token = process.env.COZE_API_KEY;
    const baseUrl = process.env.COZE_API_BASE_URL;

    if (!token || !baseUrl) {
      console.error('Error: COZE_API_KEY or BASE_URL is missing');
      throw new HttpException('Server configuration error', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // === 核心修复：使用 V3 接口！SAT Token 必须用 V3！
    const apiUrl = `${baseUrl}/v3/chat`;

    // === 核心修复：V3 接口参数调整 ===
    const payload = {
      user_id: 'user_' + Date.now(),
      stream: false, 
      additional_messages: messages
    };

    console.log(`[V3 Fix] Requesting URL: ${apiUrl}`);
    console.log('[V3 Fix] Payload:', JSON.stringify(payload));

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ [V3 Fix] API Response Status:', response.status);

      // V3 接口的返回格式可能略有不同，我们打印出来看看
      console.log('✅ [V3 Fix] Response Body:', JSON.stringify(response.data));

      if (response.data && response.data.code === 0 && response.data.data) {
        const msgs = response.data.data.messages;
        if (msgs && msgs.length > 0) {
          return msgs[0].content;
      }
      
      console.error('API Error Response:', JSON.stringify(response.data));
      throw new HttpException('Invalid AI response', HttpStatus.BAD_GATEWAY);

    } catch (error) {
      console.error('[V3 Fix] API Call Failed:', error.message);
      throw new HttpException('AI service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}