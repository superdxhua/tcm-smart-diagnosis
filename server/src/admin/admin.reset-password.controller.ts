import { Controller, Post, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

/**
 * 临时密码重置控制器
 * 仅用于重置 admin 用户密码，生产环境应删除此控制器
 */
@Controller('admin-temp')
export class AdminTempController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 重置 admin 用户密码为 123456
   * GET /api/admin-temp/reset-password
   */
  @Get('reset-password')
  async resetAdminPassword() {
    return await this.adminService.resetAdminPassword();
  }
}
