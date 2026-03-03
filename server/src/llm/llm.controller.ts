import { Controller, Post, Get, Body, Query, BadRequestException } from '@nestjs/common';
import { LLMService } from './llm.service';

@Controller('llm')
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  // 千问大模型查询搜索
  @Post('query')
  async query(@Body('query') query: string) {
    console.log('LLM 查询请求:', query);

    if (!query || query.trim().length === 0) {
      throw new BadRequestException('查询内容不能为空');
    }

    try {
      const result = await this.llmService.queryWithSearch(query);

      return {
        code: 200,
        msg: 'success',
        data: {
          query,
          answer: result,
        },
      };
    } catch (error) {
      console.error('LLM 查询失败:', error);
      throw new BadRequestException(error.message || '查询失败');
    }
  }

  // 图片识别
  @Post('recognize-image')
  async recognizeImage(
    @Body('imageUrl') imageUrl: string,
    @Body('prompt') prompt?: string,
  ) {
    console.log('图片识别请求:', { imageUrl, prompt });

    if (!imageUrl) {
      throw new BadRequestException('图片URL不能为空');
    }

    try {
      const result = await this.llmService.recognizeImage(imageUrl, prompt);

      return {
        code: 200,
        msg: 'success',
        data: {
          imageUrl,
          result,
        },
      };
    } catch (error) {
      console.error('图片识别失败:', error);
      throw new BadRequestException(error.message || '图片识别失败');
    }
  }

  // 文档内容读取
  @Post('read-document')
  async readDocument(@Body('fileKey') fileKey: string) {
    console.log('文档读取请求:', fileKey);

    if (!fileKey) {
      throw new BadRequestException('文件Key不能为空');
    }

    try {
      const result = await this.llmService.readDocument(fileKey);

      return {
        code: 200,
        msg: 'success',
        data: {
          fileKey,
          content: result,
        },
      };
    } catch (error) {
      console.error('文档读取失败:', error);
      throw new BadRequestException(error.message || '文档读取失败');
    }
  }

  // 中医诊疗分析
  @Post('analyze-tcm')
  async analyzeTCM(
    @Body('chiefComplaint') chiefComplaint: string,
    @Body('history') history?: string,
    @Body('pastHistory') pastHistory?: string,
  ) {
    console.log('中医诊疗分析请求:', { chiefComplaint, history, pastHistory });

    if (!chiefComplaint || chiefComplaint.trim().length === 0) {
      throw new BadRequestException('主诉不能为空');
    }

    try {
      const result = await this.llmService.analyzeTCM(
        chiefComplaint,
        history,
        pastHistory,
      );

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('中医诊疗分析失败:', error);
      throw new BadRequestException(error.message || '中医诊疗分析失败');
    }
  }

  // AI 对话聊天
  @Post('chat')
  async chat(
    @Body('message') message: string,
    @Body('conversationHistory') conversationHistory?: Array<{ role: string; content: string; timestamp: string }>,
    @Body('prescriptionContext') prescriptionContext?: string,
  ) {
    console.log('AI 对话请求:', { message, conversationHistoryLength: conversationHistory?.length, hasPrescriptionContext: !!prescriptionContext });

    if (!message || message.trim().length === 0) {
      throw new BadRequestException('消息内容不能为空');
    }

    try {
      const result = await this.llmService.chat(
        message,
        conversationHistory || [],
        prescriptionContext,
      );

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('AI 对话失败:', error);
      throw new BadRequestException(error.message || 'AI 对话失败');
    }
  }
}
