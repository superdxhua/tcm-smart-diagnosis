import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 疾病分类接口
 */
export interface DiseaseCategory {
  id: string;
  name: string;
  parent_id?: string;
  level: number;
  description?: string;
  tcm_name?: string;
  created_at: Date;
  updated_at: Date;
  children?: DiseaseCategory[];
}

/**
 * 疾病分类服务
 */
@Injectable()
export class DiseaseCategoryService {
  private readonly logger = new Logger(DiseaseCategoryService.name);

  /**
   * 获取所有疾病分类（树形结构）
   */
  async getDiseaseCategoriesTree(): Promise<DiseaseCategory[]> {
    this.logger.log('获取疾病分类树');

    const { data, error } = await getSupabaseClient()
      .from('disease_categories')
      .select('*')
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      this.logger.error('获取疾病分类失败:', error);
      throw new BadRequestException('获取疾病分类失败');
    }

    // 构建树形结构
    return this.buildTree(data || []);
  }

  /**
   * 获取所有疾病分类（扁平结构）
   */
  async getDiseaseCategoriesFlat(): Promise<DiseaseCategory[]> {
    this.logger.log('获取疾病分类（扁平）');

    const { data, error } = await getSupabaseClient()
      .from('disease_categories')
      .select('*')
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      this.logger.error('获取疾病分类失败:', error);
      throw new BadRequestException('获取疾病分类失败');
    }

    return data || [];
  }

  /**
   * 根据ID获取疾病分类
   */
  async getDiseaseCategoryById(id: string): Promise<DiseaseCategory> {
    this.logger.log(`获取疾病分类: ${id}`);

    const { data, error } = await getSupabaseClient()
      .from('disease_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error(`获取疾病分类失败: ${id}`, error);
      throw new NotFoundException(`疾病分类不存在: ${id}`);
    }

    return data;
  }

  /**
   * 获取子分类
   */
  async getChildCategories(parentId: string): Promise<DiseaseCategory[]> {
    this.logger.log(`获取子分类: ${parentId}`);

    const { data, error } = await getSupabaseClient()
      .from('disease_categories')
      .select('*')
      .eq('parent_id', parentId)
      .order('name', { ascending: true });

    if (error) {
      this.logger.error('获取子分类失败:', error);
      throw new BadRequestException('获取子分类失败');
    }

    return data || [];
  }

  /**
   * 创建疾病分类
   */
  async createDiseaseCategory(category: {
    id: string;
    name: string;
    parent_id?: string;
    description?: string;
    tcm_name?: string;
  }): Promise<DiseaseCategory> {
    this.logger.log(`创建疾病分类: ${category.name}`);

    // 验证父分类是否存在
    if (category.parent_id) {
      const parent = await this.getDiseaseCategoryById(category.parent_id);
      // 计算层级
      category.parent_id = parent.id;
    }

    const { data, error } = await getSupabaseClient()
      .from('disease_categories')
      .insert({
        id: category.id,
        name: category.name,
        parent_id: category.parent_id || null,
        level: category.parent_id ? 2 : 1,
        description: category.description || null,
        tcm_name: category.tcm_name || null,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('创建疾病分类失败:', error);
      throw new BadRequestException('创建疾病分类失败: ' + error.message);
    }

    this.logger.log(`疾病分类创建成功: ${category.id}`);
    return data;
  }

  /**
   * 更新疾病分类
   */
  async updateDiseaseCategory(
    id: string,
    updates: {
      name?: string;
      description?: string;
      tcm_name?: string;
    }
  ): Promise<DiseaseCategory> {
    this.logger.log(`更新疾病分类: ${id}`);

    // 验证分类是否存在
    await this.getDiseaseCategoryById(id);

    const { data, error } = await getSupabaseClient()
      .from('disease_categories')
      .update({
        name: updates.name,
        description: updates.description || null,
        tcm_name: updates.tcm_name || null,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('更新疾病分类失败:', error);
      throw new BadRequestException('更新疾病分类失败: ' + error.message);
    }

    this.logger.log(`疾病分类更新成功: ${id}`);
    return data;
  }

  /**
   * 删除疾病分类
   */
  async deleteDiseaseCategory(id: string): Promise<void> {
    this.logger.log(`删除疾病分类: ${id}`);

    // 检查是否有子分类
    const children = await this.getChildCategories(id);
    if (children.length > 0) {
      throw new BadRequestException('无法删除：存在子分类，请先删除子分类');
    }

    const { error } = await getSupabaseClient()
      .from('disease_categories')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('删除疾病分类失败:', error);
      throw new BadRequestException('删除疾病分类失败: ' + error.message);
    }

    this.logger.log(`疾病分类删除成功: ${id}`);
  }

  /**
   * 构建树形结构
   */
  private buildTree(categories: DiseaseCategory[]): DiseaseCategory[] {
    const categoryMap = new Map<string, DiseaseCategory>();
    const rootCategories: DiseaseCategory[] = [];

    // 先构建映射
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // 构建树
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      if (category.parent_id && categoryMap.has(category.parent_id)) {
        const parent = categoryMap.get(category.parent_id)!;
        parent.children!.push(node);
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  }
}
