import { Controller, Post, Get, Body, Query, BadRequestException } from '@nestjs/common';
import { QrcodeService } from './qrcode.service';

@Controller('qrcode')
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}

  // 生成注册二维码
  @Post('generate')
  async generateQrcode(
    @Body('platform') platform: 'wechat' | 'alipay',
    @Body('referrerId') referrerId?: string,
    @Body('expiresIn') expiresIn?: number,
  ) {
    console.log('生成二维码请求:', { platform, referrerId, expiresIn });

    if (!platform) {
      throw new BadRequestException('平台不能为空');
    }

    try {
      const result = await this.qrcodeService.generateRegisterQrcode({
        platform,
        referrerId,
        expiresIn,
      });

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('生成二维码失败:', error);
      throw new BadRequestException(error.message || '生成二维码失败');
    }
  }

  // 验证二维码
  @Get('validate')
  async validateQrcode(@Query('qrCode') qrCode: string) {
    console.log('验证二维码请求:', qrCode);

    if (!qrCode) {
      throw new BadRequestException('二维码不能为空');
    }

    try {
      const result = await this.qrcodeService.validateQrcode(qrCode);

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('验证二维码失败:', error);
      throw new BadRequestException(error.message || '验证二维码失败');
    }
  }

  // 通过二维码注册用户
  @Post('register')
  async register(
    @Body('qrCode') qrCode: string,
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('phone') phone?: string,
  ) {
    console.log('二维码注册请求:', { qrCode, username, phone });

    if (!qrCode) {
      throw new BadRequestException('二维码不能为空');
    }

    if (!username || username.trim().length === 0) {
      throw new BadRequestException('用户名不能为空');
    }

    if (!password || password.length < 6) {
      throw new BadRequestException('密码长度不能少于6位');
    }

    try {
      const result = await this.qrcodeService.registerWithQrcode({
        qrCode,
        username,
        password,
        phone,
      });

      return {
        code: 200,
        msg: '注册成功',
        data: result,
      };
    } catch (error) {
      console.error('注册失败:', error);
      throw new BadRequestException(error.message || '注册失败');
    }
  }

  // 获取二维码列表（管理员）
  @Get('list')
  async getQrcodeList(@Query('platform') platform?: string) {
    console.log('获取二维码列表请求:', platform);

    try {
      const list = await this.qrcodeService.getQrcodeList(platform);

      return {
        code: 200,
        msg: 'success',
        data: list,
      };
    } catch (error) {
      console.error('获取二维码列表失败:', error);
      throw new BadRequestException(error.message || '获取二维码列表失败');
    }
  }

  // 禁用二维码
  @Post('disable')
  async disableQrcode(@Body('qrCode') qrCode: string) {
    console.log('禁用二维码请求:', qrCode);

    if (!qrCode) {
      throw new BadRequestException('二维码不能为空');
    }

    try {
      await this.qrcodeService.disableQrcode(qrCode);

      return {
        code: 200,
        msg: 'success',
      };
    } catch (error) {
      console.error('禁用二维码失败:', error);
      throw new BadRequestException(error.message || '禁用二维码失败');
    }
  }
}
