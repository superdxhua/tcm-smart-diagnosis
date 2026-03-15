import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MedicalAiService {
  private readonly logger = new Logger(MedicalAiService.name);
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  // 从环境变量读取 OAuth 凭证
  private readonly clientId = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_ID;
  private readonly clientSecret = process.env.COZE_WORKLOAD_IDENTITY_CLIENT_SECRET;

  constructor() {
    if (!this.clientId || !this.clientSecret) {
      this.logger.error('❌ OAuth Credentials (CLIENT_ID/SECRET) are missing!');
    }
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

  // === 核心：手动实现 OAuth 获取 Token ===
  private async getAccessToken(): Promise<string> {
    // 1. 检查缓存（有效期内直接返回）
    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    this.logger.log('🔄 Requesting new Access Token via OAuth...');

    try {
      // 2. 请求 Coze OAuth 接口
      const response = await axios.post(
        'https://api.coze.cn/.well-known/token',
        `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      // 3. 解析并缓存 Token
      const token = response.data.access_token;
      const expiresIn = response.data.expires_in || 3600; // 默认1小时

      this.cachedToken = token;
      // 提前 5 分钟过期，确保安全
      this.tokenExpiresAt = Date.now() + (expiresIn - 300) * 1000;

      this.logger.log('✅ Successfully obtained Access Token');
      return token;

    } catch (error) {
      this.logger.error('❌ OAuth Failed:', error.response?.data || error.message);
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }

  private async callCozeAPI(messages: Array<{ role: string; content: string }>): Promise<string> {
    // 1. 获取 JWT Token
    const token = await this.getAccessToken();

    // 2. 调用模型 API (使用正确的 V3 地址)
    const apiUrl = 'https://api.coze.cn/api/v3/chat';

    const payload = {
      model: 'qwen-max',
      messages: messages,
      stream: false
    };

    this.logger.debug(`[OAuth Fix] Calling API: ${apiUrl}`);

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.debug('✅ [OAuth Fix] API Call Successful');

      // 解析返回
      if (response.data && response.data.code === 0 && response.data.data) {
        const msgs = response.data.data.messages;
        if (msgs && msgs.length > 0) {
          return msgs[0].content;
        }
      }
      
      // 兼容 OpenAI 格式
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      }

      this.logger.error('Unexpected response:', response.data);
      throw new HttpException('Invalid AI response', HttpStatus.BAD_GATEWAY);

    } catch (error) {
      this.logger.error('[OAuth Fix] API Call Failed:', error.message);
      throw new HttpException('AI service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}