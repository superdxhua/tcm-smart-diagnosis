import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// 引入扣子官方 SDK
import { LLMClient, Config } from 'coze-coding-dev-sdk'; 

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
    // 1. 读取 Token
    const token = process.env.COZE_WORKLOAD_IDENTITY_API_KEY || process.env.COZE_API_KEY;

    if (!token) {
      console.error('Error: API Token is missing');
      throw new HttpException('Server configuration error', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    console.log('[SDK Fix] Preparing to call Coze SDK...');
    console.log('[SDK Fix] Token exists:', !!token);

    try {
      // 2. 配置 SDK
      const config = new Config();
      // 强制设置 Token
      (config as any).apiKey = token; 
      // 设置正确的 endpoint (Integration API)
      (config as any).baseUrl = 'https://integration.coze.cn';

      // 3. 创建客户端
      const client = new LLMClient(config, this.customHeaders);

      // 4. 调用模型
      // 注意：这里我们显式指定模型，确保不依赖默认值
      const response = await client.invoke(messages, {
        model: 'qwen-max',
        temperature: 0.7
      });

      console.log('✅ [SDK Fix] SDK Call Successful');
      
      // 5. 返回结果
      return response.content;

    } catch (error) {
      console.error('[SDK Fix] Call Failed:', error.message);
      // 打印更详细的错误栈
      console.error(error.stack);
      throw new HttpException('AI service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}