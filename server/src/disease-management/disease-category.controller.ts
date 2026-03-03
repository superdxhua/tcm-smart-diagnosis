import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { DiseaseCategoryService, DiseaseCategory } from './disease-category.service';

@Controller('disease-categories')
export class DiseaseCategoryController {
  constructor(private readonly diseaseCategoryService: DiseaseCategoryService) {}

  /**
   * 获取所有疾病分类（树形结构）
   * GET /api/disease-categories/tree
   */
  @Get('tree')
  async getDiseaseCategoriesTree() {
    try {
      const tree = await this.diseaseCategoryService.getDiseaseCategoriesTree();

      return {
        code: 200,
        msg: 'success',
        data: tree,
      };
    } catch (error) {
      console.error('获取疾病分类树失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '获取疾病分类树失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 获取所有疾病分类（扁平结构）
   * GET /api/disease-categories
   */
  @Get()
  async getDiseaseCategoriesFlat() {
    try {
      const categories = await this.diseaseCategoryService.getDiseaseCategoriesFlat();

      return {
        code: 200,
        msg: 'success',
        data: categories,
      };
    } catch (error) {
      console.error('获取疾病分类失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '获取疾病分类失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 根据ID获取疾病分类
   * GET /api/disease-categories/:id
   */
  @Get(':id')
  async getDiseaseCategoryById(@Param('id') id: string) {
    try {
      const category = await this.diseaseCategoryService.getDiseaseCategoryById(id);

      return {
        code: 200,
        msg: 'success',
        data: category,
      };
    } catch (error) {
      console.error('获取疾病分类失败:', error);
      if (error.message && error.message.includes('不存在')) {
        throw new HttpException(
          { code: 404, msg: error.message },
          HttpStatus.NOT_FOUND
        );
      }
      throw new HttpException(
        { code: 500, msg: error.message || '获取疾病分类失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 获取子分类
   * GET /api/disease-categories/:id/children
   */
  @Get(':id/children')
  async getChildCategories(@Param('id') id: string) {
    try {
      const children = await this.diseaseCategoryService.getChildCategories(id);

      return {
        code: 200,
        msg: 'success',
        data: children,
      };
    } catch (error) {
      console.error('获取子分类失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '获取子分类失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 创建疾病分类
   * POST /api/disease-categories
   */
  @Post()
  async createDiseaseCategory(
    @Body() body: {
      id: string;
      name: string;
      parent_id?: string;
      description?: string;
      tcm_name?: string;
    }
  ) {
    if (!body.id || !body.name) {
      throw new HttpException(
        { code: 400, msg: 'ID和名称不能为空' },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const category = await this.diseaseCategoryService.createDiseaseCategory(body);

      return {
        code: 200,
        msg: 'success',
        data: category,
      };
    } catch (error) {
      console.error('创建疾病分类失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '创建疾病分类失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 更新疾病分类
   * PUT /api/disease-categories/:id
   */
  @Put(':id')
  async updateDiseaseCategory(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      description?: string;
      tcm_name?: string;
    }
  ) {
    try {
      const category = await this.diseaseCategoryService.updateDiseaseCategory(id, body);

      return {
        code: 200,
        msg: 'success',
        data: category,
      };
    } catch (error) {
      console.error('更新疾病分类失败:', error);
      if (error.message && error.message.includes('不存在')) {
        throw new HttpException(
          { code: 404, msg: error.message },
          HttpStatus.NOT_FOUND
        );
      }
      throw new HttpException(
        { code: 500, msg: error.message || '更新疾病分类失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 删除疾病分类
   * DELETE /api/disease-categories/:id
   */
  @Delete(':id')
  async deleteDiseaseCategory(@Param('id') id: string) {
    try {
      await this.diseaseCategoryService.deleteDiseaseCategory(id);

      return {
        code: 200,
        msg: 'success',
        data: { id, deleted: true },
      };
    } catch (error) {
      console.error('删除疾病分类失败:', error);
      throw new HttpException(
        { code: 500, msg: error.message || '删除疾病分类失败' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
