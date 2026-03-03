import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MedicalCasesService } from './medical-cases.service';
import {
  CreateMedicalCaseDto,
  UpdateMedicalCaseDto,
  MatchCasesDto,
  RecommendPrescriptionDto,
  CaseFeedbackDto,
} from './medical-cases.interfaces';

@Controller('medical-cases')
@UseGuards(JwtAuthGuard)
export class MedicalCasesController {
  constructor(private readonly medicalCasesService: MedicalCasesService) {}

  /**
   * 创建医案
   */
  @Post()
  async createCase(@Body() dto: CreateMedicalCaseDto) {
    return await this.medicalCasesService.createCase(dto);
  }

  /**
   * 获取医案列表
   */
  @Get()
  async getCasesList(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('doctorName') doctorName?: string,
  ) {
    return await this.medicalCasesService.getCasesList(
      parseInt(page || '1') || 1,
      parseInt(pageSize || '20') || 20,
      search,
      doctorName,
    );
  }

  /**
   * 获取医生列表（固定路由，必须在 :id 之前）
   */
  @Get('doctors/list')
  async getDoctorsList() {
    return await this.medicalCasesService.getDoctorsList();
  }

  /**
   * 获取医案详情
   */
  @Get(':id')
  async getCaseDetail(@Param('id') id: string) {
    return await this.medicalCasesService.getCaseDetail(id);
  }

  /**
   * 更新医案
   */
  @Put(':id')
  async updateCase(
    @Param('id') id: string,
    @Body() dto: UpdateMedicalCaseDto,
  ) {
    return await this.medicalCasesService.updateCase(id, dto);
  }

  /**
   * 删除医案
   */
  @Delete(':id')
  async deleteCase(@Param('id') id: string) {
    return await this.medicalCasesService.deleteCase(id);
  }

  /**
   * AI分析医案
   */
  @Post(':id/analyze')
  async analyzeCase(@Param('id') id: string) {
    return await this.medicalCasesService.analyzeCase(id);
  }

  /**
   * 匹配相似医案
   */
  @Post('match')
  async matchSimilarCases(@Body() dto: MatchCasesDto) {
    return await this.medicalCasesService.matchSimilarCases(dto);
  }

  /**
   * AI问询参考医案（简化版，不包含完整处方）
   */
  @Post('inquiry-reference')
  async getInquiryReference(@Body() dto: MatchCasesDto) {
    return await this.medicalCasesService.getInquiryReference(dto);
  }

  /**
   * 推荐处方
   */
  @Post('recommend')
  async recommendPrescription(@Body() dto: RecommendPrescriptionDto) {
    return await this.medicalCasesService.recommendPrescription(dto);
  }

  /**
   * 提交治疗反馈
   */
  @Post('feedback')
  async submitFeedback(
    @Body() dto: CaseFeedbackDto,
    @Request() req,
    @Query('recordId') recordId?: string,
  ) {
    const userId = req.user?.userId;
    return await this.medicalCasesService.submitFeedback(
      dto,
      userId,
      recordId,
    );
  }
}
