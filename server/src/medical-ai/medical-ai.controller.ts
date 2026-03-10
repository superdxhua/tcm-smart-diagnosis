import { Controller, Post, Body, UseGuards, Request, BadRequestException, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { MedicalAiService } from './medical-ai.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { HeaderUtils } from 'coze-coding-dev-sdk';

@Controller('medical-ai')
export class MedicalAiController {
  constructor(private readonly medicalAiService: MedicalAiService) {}

  /**
   * AI 医案推荐
   */
  @Post('recommend')
  @UseGuards(JwtAuthGuard)
  async recommendPrescription(@Request() req: any, @Body() body: {
    patientName?: string;
    age?: number;
    gender?: string;
    chiefComplaint: string;
    history?: string;
    pastHistory?: string;
    diagnosis?: string;
    differentiation?: string;
    aiChatHistory?: string;
  }) {
    // 从请求中获取用户信息
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      throw new BadRequestException('用户信息缺失');
    }

    // 关键修复：提取并设置 customHeaders
    const rawCustomHeaders = HeaderUtils.extractForwardHeaders(req.headers);
    const customHeaders = Object.fromEntries(
      Object.entries(rawCustomHeaders).filter(([key]) => key.toLowerCase() !== 'authorization')
    );
    this.medicalAiService.setCustomHeaders(customHeaders);

    const result = await this.medicalAiService.recommendPrescription({
      ...body,
      userRole,
      userId,
    });

    return {
      code: 200,
      msg: 'success',
      data: result,
    };
  }

  /**
   * AI 辨证分析
   */
  @Post('differentiate')
  async differentiateSyndrome(@Body() body: {
    chiefComplaint: string;
    symptoms: string[];
    tongue?: string;
    pulse?: string;
  }) {
    const result = await this.medicalAiService.differentiateSyndrome(body);

    return {
      code: 200,
      msg: 'success',
      data: result,
    };
  }

  /**
   * AI 用药指导
   */
  @Post('medication')
  async getMedicationGuidance(@Body() body: {
    prescription: string;
    diagnosis: string;
    patientAge?: number;
    gender?: string;
  }) {
    const result = await this.medicalAiService.getMedicationGuidance(body);

    return {
      code: 200,
      msg: 'success',
      data: result,
    };
  }

  /**
   * 联网搜索中医相关信息（使用千问大模型进行智能总结）
   */
  @Post('search')
  async searchTCMInfo(@Body() body: {
    query: string;
    count?: number;
    searchType?: 'web' | 'web_summary' | 'image';
    summary?: boolean;
  }) {
    const result = await this.medicalAiService.searchTCMInfo(body);

    return {
      code: 200,
      msg: 'success',
      data: result,
    };
  }

  /**
   * AI 智能问询 - 多轮对话接口
   * 注意：此接口不需要认证，方便用户快速体验 AI 问询功能
   */
  @Post('chat')
  async chat(@Req() req: any, @Body() body: {
    messages: Array<{ role: string; content: string }>;
  }) {
    try {
      console.log('=== 接收到 AI 问询请求 ===');
      console.log('请求体:', JSON.stringify(body, null, 2));

      // 提取并设置 customHeaders（必需）
      const rawCustomHeaders = HeaderUtils.extractForwardHeaders(req.headers);

      // 🚨 过滤掉 authorization 字段，避免 token 格式错误
      const customHeaders = Object.fromEntries(
        Object.entries(rawCustomHeaders).filter(([key]) => key.toLowerCase() !== 'authorization')
      );

      this.medicalAiService.setCustomHeaders(customHeaders);
      console.log('CustomHeaders 已提取并设置');
      
      const result = await this.medicalAiService.chat(body.messages);
      
      console.log('=== AI 问询成功 ===');
      console.log('响应:', JSON.stringify(result, null, 2));

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('=== AI 问询失败 ===');
      console.error('错误详情:', error);
      
      return {
        code: 500,
        msg: error.message || 'AI 问询失败',
        data: null,
      };
    }
  }

  /**
   * 上传附件到对象存储
   */
  @Post('upload-attachment')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB 限制
  }))
  async uploadAttachment(@UploadedFile() file: Express.Multer.File) {
    try {
      console.log('=== 接收到附件上传请求 ===');
      console.log('文件名:', file.originalname);
      console.log('文件类型:', file.mimetype);
      console.log('文件大小:', file.size);

      if (!file) {
        throw new BadRequestException('请上传文件');
      }

      const result = await this.medicalAiService.uploadAttachment(file);

      console.log('=== 附件上传成功 ===');
      console.log('文件 URL:', result.url);

      return {
        code: 200,
        msg: '上传成功',
        data: result,
      };
    } catch (error) {
      console.error('=== 附件上传失败 ===');
      console.error('错误详情:', error);

      return {
        code: 500,
        msg: error.message || '上传失败',
        data: null,
      };
    }
  }

  /**
   * 分析附件内容（调用大模型识图）
   */
  @Post('analyze-attachment')
  async analyzeAttachment(@Body() body: {
    imageUrl: string;
  }) {
    try {
      console.log('=== 接收到附件分析请求 ===');
      console.log('图片 URL:', body.imageUrl);

      if (!body.imageUrl) {
        throw new BadRequestException('请提供图片 URL');
      }

      const result = await this.medicalAiService.analyzeAttachment(body.imageUrl);

      console.log('=== 附件分析成功 ===');
      // 安全地打印提取的信息
      const infoPreview = typeof result.extractedInfo === 'string'
        ? result.extractedInfo.substring(0, 100)
        : JSON.stringify(result.extractedInfo).substring(0, 100);
      console.log('提取的信息:', infoPreview);

      return {
        code: 200,
        msg: '分析成功',
        data: result,
      };
    } catch (error) {
      console.error('=== 附件分析失败 ===');
      console.error('错误详情:', error);

      return {
        code: 500,
        msg: error.message || '分析失败',
        data: null,
      };
    }
  }
}
