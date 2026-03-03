import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { FormulaManagementService } from './formula-management.service';
import { FormulaEvidence } from './formula-management.interfaces';

@Controller('formula-management')
export class FormulaManagementController {
  constructor(private readonly formulaService: FormulaManagementService) {}

  /**
   * 获取所有方剂（分页）
   */
  @Get('formulas')
  async getAllFormulas(
    @Param('page') page?: string,
    @Param('pageSize') pageSize?: string,
  ) {
    try {
      const formulas = await this.formulaService.getAllFormulas();
      
      // 分页处理
      const pageNum = parseInt(page || '1', 10);
      const pageSizeNum = parseInt(pageSize || '20', 10);
      const startIndex = (pageNum - 1) * pageSizeNum;
      const endIndex = startIndex + pageSizeNum;

      return {
        code: 200,
        msg: 'success',
        data: {
          total: formulas.length,
          page: pageNum,
          pageSize: pageSizeNum,
          totalPages: Math.ceil(formulas.length / pageSizeNum),
          formulas: formulas.slice(startIndex, endIndex),
        },
      };
    } catch (error) {
      throw new HttpException(
        { code: 500, msg: error.message },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 根据六经分类获取方剂
   */
  @Get('formulas/meridian/:meridian')
  async getFormulasByMeridian(@Param('meridian') meridian: string) {
    try {
      const formulas = await this.formulaService.getFormulasByMeridian(meridian);
      return {
        code: 200,
        msg: 'success',
        data: {
          meridian,
          total: formulas.length,
          formulas: formulas,
        },
      };
    } catch (error) {
      throw new HttpException(
        { code: 500, msg: error.message },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 根据治法获取方剂
   */
  @Get('formulas/treatment/:treatmentMethod')
  async getFormulasByTreatmentMethod(@Param('treatmentMethod') treatmentMethod: string) {
    try {
      const formulas = await this.formulaService.getFormulasByTreatmentMethod(treatmentMethod);
      return {
        code: 200,
        msg: 'success',
        data: {
          treatmentMethod,
          total: formulas.length,
          formulas: formulas,
        },
      };
    } catch (error) {
      throw new HttpException(
        { code: 500, msg: error.message },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 症状匹配方剂
   */
  @Post('formulas/match')
  async matchFormulasBySymptoms(@Body() body: { symptoms: string[] }) {
    try {
      const results = await this.formulaService.matchFormulasBySymptoms(body.symptoms || []);
      return {
        code: 200,
        msg: 'success',
        data: {
          symptoms: body.symptoms,
          total: results.length,
          matches: results.slice(0, 20),
        },
      };
    } catch (error) {
      throw new HttpException(
        { code: 500, msg: error.message },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取统计信息（必须放在 formulas/:name 之前）
   */
  @Get('formulas/statistics')
  async getFormulaStatistics() {
    try {
      const stats = await this.formulaService.getFormulaStatistics();
      return {
        code: 200,
        msg: 'success',
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        { code: 500, msg: error.message },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 根据名称获取方剂详情（必须放在最后）
   */
  @Get('formulas/:name')
  async getFormulaByName(@Param('name') name: string) {
    try {
      const formula = await this.formulaService.getFormulaByName(name);
      if (!formula) {
        return {
          code: 404,
          msg: '方剂未找到',
          data: null,
        };
      }
      return {
        code: 200,
        msg: 'success',
        data: formula,
      };
    } catch (error) {
      throw new HttpException(
        { code: 500, msg: error.message },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 创建新方剂
   */
  @Post('formulas')
  async createFormula(@Body() body: FormulaEvidence & { createdBy?: string }) {
    try {
      const formula = await this.formulaService.createFormula(body);
      return {
        code: 200,
        msg: 'success',
        data: formula,
      };
    } catch (error) {
      throw new HttpException(
        { code: 500, msg: error.message },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 更新方剂
   */
  @Put('formulas/:name')
  async updateFormula(
    @Param('name') name: string,
    @Body() body: Partial<FormulaEvidence> & { reason: string; userId?: string },
  ) {
    try {
      const formula = await this.formulaService.updateFormula(
        name,
        body,
        body.reason || '更新',
        body.userId,
      );
      return {
        code: 200,
        msg: 'success',
        data: formula,
      };
    } catch (error) {
      throw new HttpException(
        { code: 500, msg: error.message },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 删除方剂
   */
  @Delete('formulas/:name')
  async deleteFormula(@Param('name') name: string, @Body() body?: { userId?: string }) {
    try {
      await this.formulaService.deleteFormula(name, body?.userId);
      return {
        code: 200,
        msg: 'success',
        data: null,
      };
    } catch (error) {
      throw new HttpException(
        { code: 500, msg: error.message },
        HttpStatus.OK,
      );
    }
  }

  /**
   * 获取方剂历史版本
   */
  @Get('formulas/:name/versions')
  async getFormulaVersions(@Param('name') name: string) {
    try {
      const versions = await this.formulaService.getFormulaVersions(name);
      return {
        code: 200,
        msg: 'success',
        data: {
          formulaName: name,
          total: versions.length,
          versions: versions,
        },
      };
    } catch (error) {
      throw new HttpException(
        { code: 500, msg: error.message },
        HttpStatus.OK,
      );
    }
  }
}
