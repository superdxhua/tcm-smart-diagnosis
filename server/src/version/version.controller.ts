import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { VersionService } from './version.service';

@Controller('version')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  // 检查更新（无需登录）
  @Get('check')
  async checkUpdate(@Query('currentVersionCode') currentVersionCode: string, @Query('platform') platform: string) {
    const versionCode = parseInt(currentVersionCode) || 0;

    const result = await this.versionService.checkUpdate(versionCode, platform);

    return {
      code: 200,
      msg: 'success',
      data: result,
    };
  }

  // 获取最新版本（无需登录）
  @Get('latest')
  async getLatestVersion(@Query('platform') platform: string) {
    const version = await this.versionService.getLatestVersion(platform);

    return {
      code: 200,
      msg: 'success',
      data: version,
    };
  }

  // 获取所有版本
  @Get('list')
  async getAllVersions(@Query('platform') platform?: string) {
    const versions = await this.versionService.getAllVersions(platform);

    return {
      code: 200,
      msg: 'success',
      data: versions,
    };
  }

  // 创建版本（需要管理员权限）
  @Post()
  async createVersion(@Body() body: {
    version: string;
    versionCode: number;
    changeLog: string;
    downloadUrl?: string;
    fileSize?: number;
    isForced?: boolean;
    platform: string;
  }) {
    const versionData: any = {
      version: body.version,
      version_code: body.versionCode,
      change_log: body.changeLog,
      download_url: body.downloadUrl,
      file_size: body.fileSize,
      is_forced: body.isForced || false,
      platform: body.platform,
      is_active: true,
    };

    const version = await this.versionService.createVersion(versionData);

    return {
      code: 200,
      msg: '版本创建成功',
      data: version,
    };
  }

  // 更新版本状态
  @Put(':id/status')
  async updateVersionStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    const version = await this.versionService.updateVersionStatus(id, body.isActive);

    return {
      code: 200,
      msg: '版本状态更新成功',
      data: version,
    };
  }

  // 删除版本
  @Delete(':id')
  async deleteVersion(@Param('id') id: string) {
    await this.versionService.deleteVersion(id);

    return {
      code: 200,
      msg: '版本删除成功',
      data: null,
    };
  }
}
