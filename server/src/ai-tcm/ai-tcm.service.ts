import { Injectable } from '@nestjs/common';
import { MedicalAiService } from '../medical-ai/medical-ai.service'; // 引入已修复的 Service

@Injectable()
export class AiTcmService {
  // 注入 MedicalAiService
  constructor(private readonly medicalAiService: MedicalAiService) {}

  async conductInquiry(basicInfo: any, supplementaryInfo: string, dialogHistory: any[], customHeaders: any) {
    // 构造消息
    const messages = [
      { role: 'system', content: '你是一位精通《伤寒论》《金匮要略》的经方中医师。' },
      { role: 'user', content: `患者基础信息：${JSON.stringify(basicInfo)}\n补充信息：${supplementaryInfo}` }
    ];

    // 关键：直接调用已修复的 MedicalAiService
    return this.medicalAiService.chat(messages);
  }

  async generatePlan(basicInfo: any, supplementaryInfo: string, inquiryTranscript: string, customHeaders: any) {
    const messages = [
      { role: 'system', content: '你是一位精通《伤寒论》《金匮要略》的经方中医师。请生成 JSON 格式的健康方案。' },
      { role: 'user', content: `信息：${JSON.stringify(basicInfo)}。记录：${inquiryTranscript}` }
    ];
    
    return this.medicalAiService.chat(messages);
  }
}