import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MedicalAiService {
  private readonly logger = new Logger(MedicalAiService.name);

  // 读取阿里云 API Key
  private readonly apiKey = process.env.DASHSCOPE_API_KEY;

  constructor() {
    if (!this.apiKey) {
      this.logger.error('❌ 阿里云 API Key (DASHSCOPE_API_KEY) 未配置！');
    } else {
      this.logger.log('✅ 阿里云 API Key 已加载');
    }
  }

  // 保留这个空方法，防止其他地方调用时报错
  setCustomHeaders(headers: Record<string, string>) {}

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    return this.callAI(messages);
  }

  async recommendPrescription(params: any): Promise<string> {
    const messages = params.messages || [{ role: 'user', content: JSON.stringify(params) }];
    return this.callAI(messages);
  }

  async differentiateSyndrome(params: any): Promise<string> {
    const messages = params.messages || [{ role: 'user', content: JSON.stringify(params) }];
    return this.callAI(messages);
  }

  async getMedicationGuidance(params: any): Promise<string> {
    const messages = params.messages || [{ role: 'user', content: JSON.stringify(params) }];
    return this.callAI(messages);
  }

  async searchTCMInfo(params: any): Promise<string> {
    const messages = params.messages || [{ role: 'user', content: JSON.stringify(params) }];
    return this.callAI(messages);
  }

  async generateHealthPlan(params: any): Promise<string> {
    const messages = params.messages || [{ role: 'user', content: JSON.stringify(params) }];
    return this.callAI(messages);
  }

  async uploadAttachment(file: any): Promise<any> {
    return {};
  }

  async analyzeAttachment(imageUrl: string): Promise<any> {
    return {};
  }

  private async callAI(messages: Array<{ role: string; content: string }>): Promise<string> {
    // 阿里云通义千问 API 地址
    const url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

    this.logger.log('🚀 正在调用阿里云通义千问...');

    try {
      const response = await axios.post(url, {
        model: 'qwen-max', // 使用通义千问最强模型
        messages: messages,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log('✅ 阿里云调用成功！');

      // 解析结果（标准的 OpenAI 格式，非常稳定）
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      }
      
      this.logger.error('阿里云返回格式异常:', response.data);
      throw new Error('AI 响应格式异常');
    } catch (error) {
      this.logger.error('❌ 阿里云调用失败:', error.response?.data || error.message);
      throw new HttpException('AI 服务暂时不可用', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}