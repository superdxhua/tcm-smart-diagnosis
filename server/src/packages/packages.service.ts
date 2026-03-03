import { Injectable, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class PackagesService {
  private supabase = getSupabaseClient();

  // 获取所有套餐（管理员）
  async getAllPackages() {
    console.log('获取所有套餐');

    const { data: packages, error } = await this.supabase
      .from('packages')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取套餐失败:', error);
      throw new BadRequestException('获取套餐失败: ' + error.message);
    }

    return packages || [];
  }

  // 获取启用的套餐（普通用户）
  async getActivePackages() {
    console.log('获取启用的套餐');

    const { data: packages, error } = await this.supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取套餐失败:', error);
      throw new BadRequestException('获取套餐失败: ' + error.message);
    }

    return packages || [];
  }

  // 根据 ID 获取套餐
  async getPackageById(packageId: string) {
    console.log('获取套餐详情:', packageId);

    const { data: package_, error } = await this.supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (error || !package_) {
      throw new BadRequestException('套餐不存在');
    }

    return package_;
  }

  // 创建套餐（管理员）
  async createPackage(packageData: {
    name: string;
    duration: number;
    price: number;
    description?: string;
    sortOrder?: number;
  }) {
    console.log('创建套餐:', packageData);

    // 验证数据
    if (!packageData.name || !packageData.duration || !packageData.price) {
      throw new BadRequestException('套餐名称、有效期和价格不能为空');
    }

    if (packageData.duration <= 0) {
      throw new BadRequestException('有效期必须大于0');
    }

    if (packageData.price <= 0) {
      throw new BadRequestException('价格必须大于0');
    }

    // 创建套餐
    const { data: newPackage, error } = await this.supabase
      .from('packages')
      .insert({
        name: packageData.name,
        duration: packageData.duration,
        price: packageData.price,
        description: packageData.description || '',
        is_active: true,
        sort_order: packageData.sortOrder || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('创建套餐失败:', error);
      throw new BadRequestException('创建套餐失败: ' + error.message);
    }

    console.log('套餐创建成功:', newPackage);
    return newPackage;
  }

  // 更新套餐（管理员）
  async updatePackage(packageId: string, packageData: {
    name?: string;
    duration?: number;
    price?: number;
    description?: string;
    is_active?: boolean;
    sort_order?: number;
  }) {
    console.log('更新套餐:', packageId, packageData);

    // 验证数据
    if (packageData.duration !== undefined && packageData.duration <= 0) {
      throw new BadRequestException('有效期必须大于0');
    }

    if (packageData.price !== undefined && packageData.price <= 0) {
      throw new BadRequestException('价格必须大于0');
    }

    // 更新套餐
    const { data: updatedPackage, error } = await this.supabase
      .from('packages')
      .update({
        ...packageData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', packageId)
      .select()
      .single();

    if (error) {
      console.error('更新套餐失败:', error);
      throw new BadRequestException('更新套餐失败: ' + error.message);
    }

    console.log('套餐更新成功:', updatedPackage);
    return updatedPackage;
  }

  // 删除套餐（管理员）
  async deletePackage(packageId: string) {
    console.log('删除套餐:', packageId);

    const { error } = await this.supabase
      .from('packages')
      .delete()
      .eq('id', packageId);

    if (error) {
      console.error('删除套餐失败:', error);
      throw new BadRequestException('删除套餐失败: ' + error.message);
    }

    console.log('套餐删除成功');
    return { success: true };
  }
}
