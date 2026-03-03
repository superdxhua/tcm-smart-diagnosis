import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
// import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('health-records')
// @UseGuards(JwtAuthGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  // 创建档案
  @Post()
  async createHealthRecord(@Body() body: {
    memberId: string;
    consultantId?: string;
    visitNumber: number;
    chiefComplaint: string;
    history?: string;
    pastHistory?: string;
    analysisResult?: string;
    differentiation?: string;
    treatmentPrinciple?: string;
    healthPlan: string;
    advice?: string;
    status?: string;
  }) {
    // const userId = req.user.userId;

    // 转换驼峰命名为下划线命名
    const recordData: any = {
      member_id: body.memberId,
      consultant_id: body.consultantId || 'default-consultant',
      visit_number: body.visitNumber,
      chief_complaint: body.chiefComplaint,
      history: body.history,
      past_history: body.pastHistory,
      analysis_result: body.analysisResult,
      differentiation: body.differentiation,
      treatment_principle: body.treatmentPrinciple,
      health_plan: body.healthPlan,
      advice: body.advice,
      status: body.status || 'active',
    };

    const record = await this.medicalRecordsService.createHealthRecord(recordData);

    return {
      code: 200,
      msg: '档案创建成功',
      data: record,
    };
  }

  // 获取用户的所有档案（必须在 @Get(':id') 之前，避免路由冲突）
  @Get('member/:memberId')
  async getMemberHealthRecords(@Param('memberId') memberId: string) {
    const records = await this.medicalRecordsService.getMemberHealthRecords(memberId);

    return {
      code: 200,
      msg: 'success',
      data: records,
    };
  }

  // 获取档案详情
  @Get(':id')
  async getHealthRecordById(@Param('id') id: string) {
    const record = await this.medicalRecordsService.getHealthRecordById(id);

    return {
      code: 200,
      msg: 'success',
      data: record,
    };
  }

  // 更新档案
  @Put(':id')
  async updateMedicalRecord(
    @Param('id') id: string,
    @Body() body: {
      chiefComplaint?: string;
      history?: string;
      pastHistory?: string;
      analysisResult?: string;
      differentiation?: string;
      treatmentPrinciple?: string;
      healthPlan?: string;
      advice?: string;
      status?: string;
    },
  ) {
    // 转换驼峰命名为下划线命名
    const updateData: any = {};
    if (body.chiefComplaint !== undefined) updateData.chief_complaint = body.chiefComplaint;
    if (body.history !== undefined) updateData.history = body.history;
    if (body.pastHistory !== undefined) updateData.past_history = body.pastHistory;
    if (body.analysisResult !== undefined) updateData.analysis_result = body.analysisResult;
    if (body.differentiation !== undefined) updateData.differentiation = body.differentiation;
    if (body.treatmentPrinciple !== undefined) updateData.treatment_principle = body.treatmentPrinciple;
    if (body.healthPlan !== undefined) updateData.health_plan = body.healthPlan;
    if (body.advice !== undefined) updateData.advice = body.advice;
    if (body.status !== undefined) updateData.status = body.status;

    const record = await this.medicalRecordsService.updateMedicalRecord(id, updateData);

    return {
      code: 200,
      msg: '档案更新成功',
      data: record,
    };
  }

  // 删除档案
  @Delete(':id')
  async deleteMedicalRecord(@Param('id') id: string) {
    await this.medicalRecordsService.deleteMedicalRecord(id);

    return {
      code: 200,
      msg: '档案删除成功',
      data: null,
    };
  }

  // 归档档案
  @Put(':id/archive')
  async archiveMedicalRecord(@Param('id') id: string) {
    await this.medicalRecordsService.archiveMedicalRecord(id);

    return {
      code: 200,
      msg: '档案已归档',
      data: null,
    };
  }

  // 复诊分析 - 查询用户历史档案并提供优化建议
  @Post('analyze-followup')
  async analyzeFollowUp(@Body() body: {
    memberId: string;
    currentSymptoms: string;
  }) {
    const analysis = await this.medicalRecordsService.analyzeFollowUp(
      body.memberId,
      body.currentSymptoms
    );

    return {
      code: 200,
      msg: 'success',
      data: analysis,
    };
  }
}
