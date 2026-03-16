import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MedicalAiService {
  private readonly logger = new Logger(MedicalAiService.name);
  private readonly apiKey = process.env.DASHSCOPE_API_KEY;

  constructor() {
    if (!this.apiKey) {
      this.logger.error('❌ 阿里云 API Key (DASHSCOPE_API_KEY) 未配置！');
    } else {
      this.logger.log('✅ 阿里云 API Key 已加载');
    }
  }

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

  // === 生成方案阶段：结构化输出 (修正参数) ===
  async generateHealthPlan(
    basicInfo: any, 
    supplementaryInfo: string, 
    inquiryTranscript: string
  ): Promise<string> {
    
    const systemPrompt = {
      role: 'system',
      content: `你是一位严格遵循《伤寒论》《金匮要略》的经方医师。
请根据患者信息，进行**六经八纲辨证**，并给出**唯一推荐经方**。

【输出规则】
1. 必须先辨证，再处方。
2. 推荐方剂必须出自《伤寒论》或《金匮要略》。
3. 若疑似急重症，**不得开方**，应建议“立即面诊”。
4. 输出必须是严格的 JSON 格式，不可包含其他文字。

【JSON Schema】
{
  "syndrome_diagnosis": "证型",
  "recommended_formula": "方剂",
  "classical_reference": "经典出处",
  "cautions": "注意事项"
}`
    };

    const userMessage = {
      role: 'user',
      content: `患者信息：${JSON.stringify(basicInfo)}
症状记录：${inquiryTranscript}
请给出诊疗方案。`
    };

    return this.callAI([systemPrompt, userMessage]);
  }

  async uploadAttachment(file: any): Promise<any> {
    return {};
  }

  async analyzeAttachment(imageUrl: string): Promise<any> {
    return {};
  }

  private async callAI(messages: Array<{ role: string; content: string }>): Promise<string> {
    const url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

    this.logger.log(`🚀 调用阿里云，当前对话轮数: ${messages.length}`);

    try {
      const response = await axios.post(url, {
        model: 'qwen-max',
        messages: messages,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        // 设置超时时间为 120秒 (2分钟)
        timeout: 120000 
      });

      this.logger.log('✅ 阿里云调用成功！');
      
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      }
      
      throw new Error('AI 响应格式异常');
    } catch (error) {
      this.logger.error('❌ 阿里云调用失败:', error.message);
      throw new HttpException('AI 服务暂时不可用', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}