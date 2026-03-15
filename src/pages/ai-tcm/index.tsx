import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MedicalAiService {
  private readonly logger = new Logger(MedicalAiService.name);
  private readonly apiKey = process.env.DASHSCOPE_API_KEY;

  constructor() {
    if (!this.apiKey) {
      this.logger.error('❌ 阿里云 API Key 未配置！');
    } else {
      this.logger.log('✅ 阿里云 API Key 已加载');
    }
  }

  setCustomHeaders(headers: Record<string, string>) {}

  // === 通用调用入口 ===
  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    return this.callAI(messages);
  }

  // === 问诊阶段：引导式提问 ===
  async conductInquiry(
    basicInfo: any, 
    supplementaryInfo: string, 
    dialogHistory: any[]
  ): Promise<string> {
    
    // 1. 构造系统提示词（千问建议的严格逻辑）
    const systemPrompt = {
      role: 'system',
      content: `你是一位精通《伤寒论》《金匮要略》的经方中医师。
你的任务是根据患者当前已知信息，提出**一个最能帮助辨证的关键问题**。

【核心规则】
1. 必须先辨证，再提问。
2. 每次只问一个关键问题，禁止一次性问多个。
3. 提问要简洁、聚焦，便于患者回答。
4. 聚焦于：寒热、虚实、病位、舌脉。
5. 若信息已足够辨证，请直接说“信息已足够，准备开方”。`
    };

    // 2. 构造用户消息（当前患者信息）
    const userMessage = {
      role: 'user',
      content: `患者基本信息：${JSON.stringify(basicInfo)}
补充信息：${supplementaryInfo}
当前对话历史：${JSON.stringify(dialogHistory)}
请提出下一个关键的问诊问题。`
    };

    // 3. 合并历史
    const messages = [systemPrompt, ...dialogHistory, userMessage];

    return this.callAI(messages);
  }

  // === 生成方案阶段：结构化输出 ===
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
  "syndrome_diagnosis": "证型，如 '少阳病'",
  "recommended_formula": "方剂，如 '小柴胡汤'",
  "classical_reference": "经典出处，如 '《伤寒论》第96条'",
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

  // === 底层 API 调用 ===
  private async callAI(messages: Array<{ role: string; content: string }>): Promise<string> {
    const url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

    this.logger.log(`🚀 调用阿里云，当前对话轮数: ${messages.length}`);

    try {
      const response = await axios.post(url, {
        model: 'qwen-max',
        messages: messages,
        // 开启 JSON 模式（如果阿里云支持，可以强制输出 JSON）
        // response_format: { type: "json_object" } 
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log('✅ 阿里云调用成功！');
      
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      }
      
      throw new Error('AI 响应格式异常');
    } catch (error) {
      this.logger.error('❌ 阿里云调用失败:', error.response?.data || error.message);
      throw new HttpException('AI 服务暂时不可用', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
  
  // === 其他保留方法（防止报错）===
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
  
  async uploadAttachment(file: any): Promise<any> { return {}; }
  async analyzeAttachment(imageUrl: string): Promise<any> { return {}; }
}