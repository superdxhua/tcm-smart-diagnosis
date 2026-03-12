import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiTcmService {
  async conductInquiry(basicInfo: any, supplementaryInfo: string, dialogHistory: any[]) {
    const systemPrompt = `你是一位精通《伤寒论》《金匮要略》的经方中医师。
【核心指令：构建智能问诊决策树】
请在问诊过程中，内部构建并维护一棵“方证对应”决策树，逻辑如下：
1. **动态问诊路径**：不要按固定清单提问。根据患者的上一个回答，实时计算各证型的“可能性概率”。
2. **多维证候要素提取**：从患者自然语言中提取：病性（寒/热/虚/实）、病位（表/里/半表半里）。
3. **混合推理引擎**：
   - **规则引擎**：严格遵循《伤寒论》条文逻辑。
   - **概率推理**：信息不全时，计算各证型的后验概率。
4. **方证对应核心**：你的所有提问，最终目标都是为了锁定具体的“经方”。
【输出要求】
- 每次只提一个关键问题。
- 禁止废话，禁止一次性问多个问题。`;

    const userContent = `
患者基础信息：${JSON.stringify(basicInfo)}
补充信息：${supplementaryInfo}
当前对话历史：${JSON.stringify(dialogHistory)}
请根据以上信息，提出下一个关键的问诊问题。`;

    return await this.callCozeAPI(systemPrompt, userContent);
  }

  async generatePlan(basicInfo: any, supplementaryInfo: string, inquiryTranscript: string) {
    const systemPrompt = `你是一位精通《伤寒论》《金匮要略》的经方中医师。
请根据以下信息进行辨证论治，输出标准的 JSON 格式。`;

    const userContent = `
患者基础信息：${JSON.stringify(basicInfo)}
补充信息：${supplementaryInfo}
问诊记录：${inquiryTranscript}
请输出 JSON 格式的诊疗方案，包含：diagnosis, differentiation, prescription, composition, advice。`;

    return await this.callCozeAPI(systemPrompt, userContent);
  }

  private async callCozeAPI(systemPrompt: string, userContent: string) {
    const url = 'https://api.coze.cn/open_api/v2/chat';
    const token = process.env.COZE_API_KEY;

    const payload = {
      user_id: 'user_' + Date.now(),
      additional_messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ]
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Coze API response status:', response.status);

      const messages = response.data?.data?.messages;

      if (messages && messages.length > 0) {
        return messages[0].content;
      } else {
        console.error('Invalid response structure:', JSON.stringify(response.data));
        throw new Error('AI returned empty content');
      }
    } catch (error) {
      console.error('Coze API call failed:', error);
      throw new Error('AI service unavailable');
    }
  }
}
