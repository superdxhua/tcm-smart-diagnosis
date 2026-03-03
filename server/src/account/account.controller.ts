import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // 获取用户信息
  @Get()
  async getUserInfo(@Request() req) {
    const userId = req.user.userId;

    const userInfo = await this.accountService.getUserInfo(userId);

    return {
      code: 200,
      msg: 'success',
      data: userInfo,
    };
  }

  // 修改用户名（email）
  @Put('username')
  async updateUsername(@Request() req, @Body() body: { email: string }) {
    const userId = req.user.userId;

    await this.accountService.updateUsername(userId, body.email);

    return {
      code: 200,
      msg: '用户名修改成功',
      data: null,
    };
  }

  // 修改密码
  @Put('password')
  async updatePassword(
    @Request() req,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    const userId = req.user.userId;

    await this.accountService.updatePassword(userId, body.oldPassword, body.newPassword);

    return {
      code: 200,
      msg: '密码修改成功',
      data: null,
    };
  }
}
