import { Injectable, BadRequestException } from '@nestjs/common';
import { UploadService } from '../upload/upload.service';
import { createConfig } from '../utils/llm-helper';
import { callCozeAI } from '../utils/coze-api-helper';
import { S3Storage } from 'coze-coding-dev-sdk';

@Injectable()
export class LLMService {
  private storage: S3Storage;

  constructor(private readonly uploadService: UploadService) {
    createConfig(); // 初始化配置

    this.storage = new S3Storage({
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });
  }

  // 千问大模型查询搜索
  async queryWithSearch(query: string): Promise<string> {
    console.log('千问大模型查询搜索:', query);

    try {
      const messages = [
        {
          role: 'system',
          content: `你是一个专业的中医诊疗助手。请根据用户的问题，提供准确、专业的中医相关答案。
你的回答应该：
1. 准确回答用户的问题
2. 如有需要，提供相关的中医理论和知识
3. 如有风险，提醒用户就医
4. 回答要简洁明了，易于理解`,
        },
        {
          role: 'user',
          content: query,
        },
      ];

      const response = await callCozeAI(messages);

      console.log('LLM 响应:', response);
      return response;
    } catch (error) {
      console.error('LLM 查询失败:', error);
      throw new BadRequestException('查询失败: ' + error.message);
    }
  }

  // 图片识别
  async recognizeImage(imageUrl: string, prompt?: string): Promise<string> {
    console.log('图片识别请求:', { imageUrl, prompt });

    try {
      const defaultPrompt = prompt || '请详细描述这张图片的内容，特别关注与中医诊断相关的信息（如舌苔、面色等）。';

      // 构建消息，将图片 URL 嵌入到文本中（Coze API 支持这种格式）
      const messages = [
        {
          role: 'system',
          content: '你是一个专业的中医诊断助手。请分析图片内容，提供专业的中医诊断建议。',
        },
        {
          role: 'user',
          content: `${defaultPrompt}\n\n图片地址：${imageUrl}`,
        },
      ];

      const response = await callCozeAI(messages);

      console.log('图片识别结果:', response);
      return response;
    } catch (error) {
      console.error('图片识别失败:', error);
      throw new BadRequestException('图片识别失败: ' + error.message);
    }
  }

  // 文档内容读取
  async readDocument(fileKey: string): Promise<string> {
    console.log('文档内容读取请求:', fileKey);

    try {
      // 从对象存储读取文件
      const fileBuffer = await this.storage.readFile({ fileKey });
      const fileContent = fileBuffer.toString('utf-8');

      console.log('文档读取成功，内容长度:', fileContent.length);

      // 使用 LLM 提取文档关键信息
      const messages = [
        {
          role: 'system',
          content: `你是一个专业的文档分析助手。请分析提供的文档内容，提取关键信息。
你的回答应该：
1. 总结文档的主要内容
2. 提取重要的数据和事实
3. 列出关键要点
4. 如有医学相关内容，特别标注`,
        },
        {
          role: 'user',
          content: `请分析以下文档内容：\n\n${fileContent}`,
        },
      ];

      const response = await callCozeAI(messages);

      console.log('文档分析结果:', response);
      return response;
    } catch (error) {
      console.error('文档内容读取失败:', error);
      throw new BadRequestException('文档内容读取失败: ' + error.message);
    }
  }

  // 中医诊疗分析（使用 LLM）
  async analyzeTCM(chiefComplaint: string, history?: string, pastHistory?: string): Promise<any> {
    console.log('中医诊疗分析请求:', { chiefComplaint, history, pastHistory });

    try {
      const systemPrompt = `你是一个专业的中医诊疗助手，基于张仲景经方和历代名医医案提供诊疗方案。
请根据用户的主诉、现病史和既往史，提供：
1. 中医诊断
2. 辨证分型
3. 治则
4. 处方（方名、药物组成、剂量、煎服方法、注意事项）
5. 解释
6. 建议

请以 JSON 格式返回，格式如下：
{
  "diagnosis": "中医诊断",
  "differentiation": "辨证分型",
  "treatmentPrinciple": "治则",
  "prescription": {
    "formulaName": "方名",
    "ingredients": [
      { "name": "药名", "dosage": "剂量", "special": "特殊用法" }
    ],
    "decoctionMethod": "煎服方法",
    "dosageMethod": "服用方法",
    "precautions": "注意事项"
  },
  "explanation": "解释",
  "advice": "建议"
}`;

      const userPrompt = `主诉：${chiefComplaint}
现病史：${history || '无'}
既往史：${pastHistory || '无'}

请提供诊疗方案。`;

      const messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ];

      const response = await callCozeAI(messages);

      console.log('中医诊疗分析结果:', response);

      // 尝试解析 JSON
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('解析 JSON 失败，返回原始文本');
      }

      return {
        diagnosis: '待定',
        differentiation: '待定',
        treatmentPrinciple: '待定',
        prescription: {
          formulaName: '待定',
          ingredients: [],
          decoctionMethod: '待定',
          dosageMethod: '待定',
          precautions: '待定',
        },
        explanation: response,
        advice: '请根据具体情况就医',
      };
    } catch (error) {
      console.error('中医诊疗分析失败:', error);
      throw new BadRequestException('中医诊疗分析失败: ' + error.message);
    }
  }

  // AI 对话聊天（用于医生与 AI 助手交流）
  async chat(
    message: string,
    conversationHistory: Array<{ role: string; content: string; timestamp: string }>,
    prescriptionContext?: string,
  ): Promise<{ content: string }> {
    console.log('AI 对话请求:', { message, conversationHistoryLength: conversationHistory.length, hasPrescriptionContext: !!prescriptionContext });

    try {
      // 构建系统提示词
      const systemPrompt = `你是一个专业的中医诊疗助手，基于张仲景经方和历代名医医案提供专业的诊疗建议。
你的职责是：
1. 解答医生关于中医理论的疑问
2. 分析处方是否合理，提供改进建议
3. 根据医生的反馈，提供处方调整建议
4. 提供药材的性味归经、功效用法等专业知识
4. 分析用户症状，辅助辨证论治

如果医生询问处方相关问题，请提供具体的建议，包括：
- 是否需要调整某些药材
- 剂量是否合适
- 是否有更好的配伍方案
- 需要注意的禁忌和注意事项

请以专业、准确、友好的语气回答医生的问题。`;

      // 构建消息历史
      const messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
      ];

      // 如果有处方上下文，添加到对话中
      if (prescriptionContext) {
        messages.push({
          role: 'system',
          content: `以下是当前用户和处方信息，供你参考：\n\n${prescriptionContext}`,
        });
      }

      // 添加对话历史（最近 10 条）
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }

      // 添加当前消息
      messages.push({
        role: 'user',
        content: message,
      });

      console.log('发送给 LLM 的消息数量:', messages.length);

      // 调用 LLM（使用统一的 callCozeChat 函数）
      const response = await callCozeAI(messages);

      console.log('AI 对话响应:', response);

      return {
        content: response,
      };
    } catch (error) {
      console.error('AI 对话失败:', error);
      throw new BadRequestException('AI 对话失败: ' + error.message);
    }
  }
}
