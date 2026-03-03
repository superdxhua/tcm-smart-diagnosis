import { Controller, Post, Get, Headers, HttpException, HttpStatus, Query } from '@nestjs/common';
import { SignInService } from './sign-in.service';
import { AuthService } from './auth.service';

@Controller('sign-in')
export class SignInController {
  constructor(
    private readonly signInService: SignInService,
    private readonly authService: AuthService
  ) {}

  /**
   * 签到
   */
  @Post()
  async signIn(@Headers('authorization') authHeader: string) {
    console.log('收到签到请求');

    try {
      // 验证用户身份
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权' },
          HttpStatus.OK,
        );
      }

      const user = await this.authService.verifyToken(token);

      // 执行签到
      const result = await this.signInService.signIn(user.id);

      return {
        code: 200,
        msg: '签到成功',
        data: result,
      };
    } catch (error) {
      console.error('签到失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 查询签到历史
   */
  @Get('history')
  async getSignInHistory(
    @Headers('authorization') authHeader: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    console.log('收到查询签到历史请求');

    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权' },
          HttpStatus.OK,
        );
      }

      const user = await this.authService.verifyToken(token);

      const result = await this.signInService.getSignInHistory(
        user.id,
        page ? parseInt(page) : 1,
        pageSize ? parseInt(pageSize) : 30
      );

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('查询签到历史失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 查询签到统计
   */
  @Get('stats')
  async getSignInStats(@Headers('authorization') authHeader: string) {
    console.log('收到查询签到统计请求');

    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权' },
          HttpStatus.OK,
        );
      }

      const user = await this.authService.verifyToken(token);

      const result = await this.signInService.getSignInStats(user.id);

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('查询签到统计失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }
}

@Controller('points')
export class PointsController {
  constructor(
    private readonly signInService: SignInService,
    private readonly authService: AuthService
  ) {}

  /**
   * 查询积分余额
   */
  @Get('balance')
  async getPointsBalance(@Headers('authorization') authHeader: string) {
    console.log('收到查询积分余额请求');

    try {
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException(
          { code: 401, msg: '未授权' },
          HttpStatus.OK,
        );
      }

      const user = await this.authService.verifyToken(token);

      const result = await this.signInService.getPointsBalance(user.id);

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('查询积分余额失败:', error.message);
      throw new HttpException(
        {
          code: error.status || 500,
          msg: error.message,
        },
        HttpStatus.OK,
      );
    }
  }
}
