import { Controller, Get, Query, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { AbuseDetectionService } from '../tcm/abuse-detection.service';
import { AuthService } from '../auth/auth.service';

@Controller('admin')
export class AdminAbuseDetectionController {
  constructor(
    private readonly abuseDetectionService: AbuseDetectionService,
    private readonly authService: AuthService,
  ) {}

  /**
   * 获取高风险用户列表（仅管理员可用）
   */
  @Get('high-risk-users')
  async getHighRiskUsers(
    @Headers('authorization') authHeader: string,
    @Query('days') days?: string,
  ) {
    // 验证管理员权限
    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权，请先登录' },
          HttpStatus.OK,
        );
      }

      const user = await this.authService.verifyToken(token);
      if (user.role !== 'admin') {
        throw new HttpException(
          { code: 403, msg: '权限不足，仅管理员可访问' },
          HttpStatus.OK,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { code: 401, msg: '未授权，请先登录' },
        HttpStatus.OK,
      );
    }

    try {
      const queryDays = days ? parseInt(days, 10) : 7;
      const highRiskUsers = await this.abuseDetectionService.getHighRiskUsers(queryDays);

      return {
        code: 200,
        msg: 'success',
        data: {
          users: highRiskUsers,
          total: highRiskUsers.length,
          queryPeriod: `${queryDays} 天`,
        },
      };
    } catch (error) {
      console.error('获取高风险用户列表失败:', error);
      throw new HttpException(
        {
          code: 500,
          msg: error.message || '获取高风险用户列表失败',
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取指定用户的异常检测记录（仅管理员可用）
   */
  @Get('abuse-detection-records')
  async getAbuseDetectionRecords(
    @Headers('authorization') authHeader: string,
    @Query('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    // 验证管理员权限
    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权，请先登录' },
          HttpStatus.OK,
        );
      }

      const user = await this.authService.verifyToken(token);
      if (user.role !== 'admin') {
        throw new HttpException(
          { code: 403, msg: '权限不足，仅管理员可访问' },
          HttpStatus.OK,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { code: 401, msg: '未授权，请先登录' },
        HttpStatus.OK,
      );
    }

    if (!userId) {
      throw new HttpException(
        { code: 400, msg: '用户 ID 不能为空' },
        HttpStatus.OK,
      );
    }

    try {
      const queryLimit = limit ? parseInt(limit, 10) : 50;
      const records = await this.abuseDetectionService.getAbuseDetectionRecords(userId, queryLimit);

      return {
        code: 200,
        msg: 'success',
        data: {
          records,
          total: records.length,
        },
      };
    } catch (error) {
      console.error('获取异常检测记录失败:', error);
      throw new HttpException(
        {
          code: 500,
          msg: error.message || '获取异常检测记录失败',
        },
        HttpStatus.OK,
      );
    }
  }
}
