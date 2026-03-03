import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // 创建反馈
  @Post()
  async createFeedback(@Request() req, @Body() body: {
    feedbackType: string;
    title: string;
    content: string;
    screenshots?: string;
    deviceInfo?: string;
    appVersion?: string;
    priority?: string;
  }) {
    const userId = req.user.userId;

    const feedbackData: any = {
      user_id: userId,
      feedback_type: body.feedbackType,
      title: body.title,
      content: body.content,
      screenshots: body.screenshots,
      device_info: body.deviceInfo,
      app_version: body.appVersion,
      status: 'pending',
      priority: body.priority || 'normal',
    };

    const feedback = await this.feedbackService.createFeedback(feedbackData);

    return {
      code: 200,
      msg: '反馈提交成功',
      data: feedback,
    };
  }

  // 获取反馈详情
  @Get(':id')
  async getFeedbackById(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    const feedback = await this.feedbackService.getFeedbackById(id);

    // 只允许查看自己的反馈（或管理员查看所有）
    if (feedback.user_id !== userId && req.user.role !== 'admin') {
      return {
        code: 403,
        msg: '无权访问此反馈',
        data: null,
      };
    }

    return {
      code: 200,
      msg: 'success',
      data: feedback,
    };
  }

  // 获取用户的反馈列表
  @Get('my/list')
  async getMyFeedbacks(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const userId = req.user.userId;
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 10;

    const result = await this.feedbackService.getUserFeedbacks(userId, pageNum, pageSizeNum);

    return {
      code: 200,
      msg: 'success',
      data: result,
    };
  }

  // 获取所有反馈（管理员）
  @Get('admin/list')
  async getAllFeedbacks(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    if (req.user.role !== 'admin') {
      return {
        code: 403,
        msg: '无权访问',
        data: null,
      };
    }

    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 10;

    const result = await this.feedbackService.getAllFeedbacks(pageNum, pageSizeNum, status, type);

    return {
      code: 200,
      msg: 'success',
      data: result,
    };
  }

  // 更新反馈状态（管理员）
  @Put(':id/status')
  async updateFeedbackStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() body: {
      status?: string;
      priority?: string;
      processedBy?: string;
    },
  ) {
    if (req.user.role !== 'admin') {
      return {
        code: 403,
        msg: '无权访问',
        data: null,
      };
    }

    const feedback = await this.feedbackService.updateFeedbackStatus(id, {
      status: body.status,
      priority: body.priority,
      processed_by: body.processedBy || req.user.userId,
      processed_at: new Date().toISOString(),
    });

    return {
      code: 200,
      msg: '反馈状态更新成功',
      data: feedback,
    };
  }

  // 回复反馈（管理员）
  @Put(':id/reply')
  async replyFeedback(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { adminReply: string },
  ) {
    if (req.user.role !== 'admin') {
      return {
        code: 403,
        msg: '无权访问',
        data: null,
      };
    }

    const feedback = await this.feedbackService.replyFeedback(id, body.adminReply, req.user.userId);

    return {
      code: 200,
      msg: '回复成功',
      data: feedback,
    };
  }

  // 删除反馈
  @Delete(':id')
  async deleteFeedback(@Param('id') id: string, @Request() req) {
    const feedback = await this.feedbackService.getFeedbackById(id);

    // 只允许删除自己的反馈（或管理员删除所有）
    if (feedback.user_id !== req.user.userId && req.user.role !== 'admin') {
      return {
        code: 403,
        msg: '无权删除此反馈',
        data: null,
      };
    }

    await this.feedbackService.deleteFeedback(id);

    return {
      code: 200,
      msg: '反馈删除成功',
      data: null,
    };
  }
}
