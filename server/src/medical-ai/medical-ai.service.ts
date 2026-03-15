import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MedicalAiService {
  private readonly logger = new Logger(MedicalAiService.name);
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private readonly clientId = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_ID;
  private readonly clientSecret = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_SECRET;

  constructor() {
    if (!this.clientId || !this.clientSecret) {
      this.logger.error('❌ OAuth Credentials (CLIENT_ID/SECRET) are missing!');
    }
  }

  setCustomHeaders(headers: Record<string, string>) {}

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

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    this.logger.log('🔄 Requesting new Access Token via OAuth...');

    try {
      const response = await axios.post(
        'https://api.coze.cn/.well-known/token',
        `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      const token = response.data.access_token;
      const expiresIn = response.data.expires_in || 3600;

      this.cachedToken = token;
      this.tokenExpiresAt = Date.now() + (expiresIn - 300) * 1000;

      this.logger.log('✅ Successfully obtained Access Token');
      return token;

    } catch (error) {
      this.logger.error('❌ OAuth Failed:', error.response?.data || error.message);
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }

  private async callCozeAPI(messages: Array<{ role: string; content: string }>): Promise<string> {
    const token = await this.getAccessToken();

    // === 终极修复：加回 /api ===
    const apiUrl = 'https://integration.coze.cn/api/v3/chat';

    const payload = {
      model: 'qwen-max', 
      messages: messages,
      stream: false
    };

    this.logger.debug(`[Final URL Fix] Calling API: ${apiUrl}`);

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.debug('✅ [Final URL Fix] API Call Successful');

      if (response.data && response.data.code === 0 && response.data.data) {
        const msgs = response.data.data.messages;
        if (msgs && msgs.length > 0) {
          return msgs[0].content;
        }
      }
      
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      }

      this.logger.error('Unexpected response:', response.data);
      throw new HttpException('Invalid AI response', HttpStatus.BAD_GATEWAY);

    } catch (error) {
      this.logger.error('[Final URL Fix] API Call Failed:', error.message);
      throw new HttpException('AI service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}