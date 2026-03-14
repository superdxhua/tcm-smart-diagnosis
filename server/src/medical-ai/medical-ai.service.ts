import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

@Injectable()
export class MedicalAiService {
  private readonly logger = new Logger(MedicalAiService.name);
  private aiClient: any;
  private readonly modelName: string;

  constructor(private configService: ConfigService) {
    this.initializeAiClient();
  }

  private initializeAiClient() {
    // 1. 读取 Token
    const workloadToken = this.configService.get<string>('COZE_WORKLOAD_IDENTITY_API_KEY') 
                       || this.configService.get<string>('COZE_API_KEY');

    if (!workloadToken) {
      this.logger.error('Workload Token is missing');
      throw new Error('Missing Token');
    }

    this.modelName = this.configService.get<string>('COZE_MODEL_NAME', 'qwen-max');

    try {
      // 2. 配置 SDK
      const sdkConfig = new Config();
      (sdkConfig as any).apiKey = workloadToken;

      // 3. 初始化客户端 (使用 LLMClient)
      this.aiClient = new LLMClient(sdkConfig, {});
      
      this.logger.log('✅ Coze Client initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize Coze Client:', error);
      throw new Error('AI Client initialization failed');
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

  private async callCozeAPI(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.aiClient) {
      throw new Error('AI Client not initialized');
    }

    try {
      this.logger.debug(`Calling Coze API with model: ${this.modelName}`);

      // === 核心修复：使用 chat.completions.create ===
      // 这是 DeepSeek 推荐的 OpenAI 兼容写法，能正确处理 Workload Token
      const response = await this.aiClient.chat.completions.create({
        model: this.modelName, 
        messages: messages,
      });

      this.logger.debug('✅ Coze API call successful');

      // 解析标准 OpenAI 格式返回
      if (response.choices && response.choices.length > 0) {
        return response.choices[0].message.content;
      }
      
      this.logger.error('Unexpected response structure:', response);
      throw new Error('Invalid AI response structure');

    } catch (error) {
      this.logger.error('Coze SDK call failed:', error);
      throw new HttpException('AI service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}