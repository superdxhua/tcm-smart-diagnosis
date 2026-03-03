import { Controller, Get, Post, Put, Delete, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  // 获取所有套餐（管理员）
  @Get('all')
  async getAllPackages() {
    console.log('获取所有套餐请求');

    try {
      const packages = await this.packagesService.getAllPackages();

      return {
        code: 200,
        msg: 'success',
        data: packages,
      };
    } catch (error) {
      console.error('获取套餐失败:', error);
      throw new BadRequestException(error.message || '获取套餐失败');
    }
  }

  // 获取启用的套餐（普通用户）
  @Get('active')
  async getActivePackages() {
    console.log('获取启用的套餐请求');

    try {
      const packages = await this.packagesService.getActivePackages();

      return {
        code: 200,
        msg: 'success',
        data: packages,
      };
    } catch (error) {
      console.error('获取套餐失败:', error);
      throw new BadRequestException(error.message || '获取套餐失败');
    }
  }

  // 根据 ID 获取套餐
  @Get(':id')
  async getPackageById(@Param('id') packageId: string) {
    console.log('获取套餐详情请求:', packageId);

    try {
      const package_ = await this.packagesService.getPackageById(packageId);

      return {
        code: 200,
        msg: 'success',
        data: package_,
      };
    } catch (error) {
      console.error('获取套餐失败:', error);
      throw new BadRequestException(error.message || '获取套餐失败');
    }
  }

  // 创建套餐（管理员）
  @Post('create')
  async createPackage(@Body() packageData: {
    name: string;
    duration: number;
    price: number;
    description?: string;
    sortOrder?: number;
  }) {
    console.log('创建套餐请求:', packageData);

    try {
      const newPackage = await this.packagesService.createPackage(packageData);

      return {
        code: 200,
        msg: '套餐创建成功',
        data: newPackage,
      };
    } catch (error) {
      console.error('创建套餐失败:', error);
      throw new BadRequestException(error.message || '创建套餐失败');
    }
  }

  // 更新套餐（管理员）
  @Put(':id')
  async updatePackage(
    @Param('id') packageId: string,
    @Body() packageData: {
      name?: string;
      duration?: number;
      price?: number;
      description?: string;
      is_active?: boolean;
      sort_order?: number;
    },
  ) {
    console.log('更新套餐请求:', packageId, packageData);

    try {
      const updatedPackage = await this.packagesService.updatePackage(packageId, packageData);

      return {
        code: 200,
        msg: '套餐更新成功',
        data: updatedPackage,
      };
    } catch (error) {
      console.error('更新套餐失败:', error);
      throw new BadRequestException(error.message || '更新套餐失败');
    }
  }

  // 删除套餐（管理员）
  @Delete(':id')
  async deletePackage(@Param('id') packageId: string) {
    console.log('删除套餐请求:', packageId);

    try {
      await this.packagesService.deletePackage(packageId);

      return {
        code: 200,
        msg: '套餐删除成功',
      };
    } catch (error) {
      console.error('删除套餐失败:', error);
      throw new BadRequestException(error.message || '删除套餐失败');
    }
  }
}
