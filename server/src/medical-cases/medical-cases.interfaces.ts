import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalCaseDto {
  @ApiProperty({ description: '医生姓名' })
  doctorName: string;

  @ApiProperty({ description: '所属年代', required: false })
  doctorEra?: string;

  @ApiProperty({ description: '用户性别', required: false })
  patientGender?: string;

  @ApiProperty({ description: '用户年龄', required: false })
  patientAge?: number;

  @ApiProperty({ description: '主诉' })
  mainSymptoms: string;

  @ApiProperty({ description: '现病史', required: false })
  currentIllness?: string;

  @ApiProperty({ description: '既往史', required: false })
  pastHistory?: string;

  @ApiProperty({ description: '舌象', required: false })
  tongue?: string;

  @ApiProperty({ description: '脉象', required: false })
  pulse?: string;

  @ApiProperty({ description: '诊断' })
  diagnosis: string;

  @ApiProperty({ description: '方名', required: false })
  prescriptionName?: string;

  @ApiProperty({ description: '组成', required: false })
  prescriptionComposition?: string;

  @ApiProperty({ description: '用量', required: false })
  prescriptionDosage?: string;

  @ApiProperty({ description: '用法', required: false })
  prescriptionUsage?: string;

  @ApiProperty({ description: '治疗结果', required: false })
  treatmentResult?: string;

  @ApiProperty({ description: '备注', required: false })
  notes?: string;

  @ApiProperty({ description: '来源', required: false })
  source?: string;

  @ApiProperty({ description: '标签', type: [String], required: false })
  tags?: string[];
}

export class UpdateMedicalCaseDto {
  @ApiProperty({ description: '医生姓名', required: false })
  doctorName?: string;

  @ApiProperty({ description: '所属年代', required: false })
  doctorEra?: string;

  @ApiProperty({ description: '用户性别', required: false })
  patientGender?: string;

  @ApiProperty({ description: '用户年龄', required: false })
  patientAge?: number;

  @ApiProperty({ description: '主诉', required: false })
  mainSymptoms?: string;

  @ApiProperty({ description: '现病史', required: false })
  currentIllness?: string;

  @ApiProperty({ description: '既往史', required: false })
  pastHistory?: string;

  @ApiProperty({ description: '舌象', required: false })
  tongue?: string;

  @ApiProperty({ description: '脉象', required: false })
  pulse?: string;

  @ApiProperty({ description: '诊断', required: false })
  diagnosis?: string;

  @ApiProperty({ description: '方名', required: false })
  prescriptionName?: string;

  @ApiProperty({ description: '组成', required: false })
  prescriptionComposition?: string;

  @ApiProperty({ description: '用量', required: false })
  prescriptionDosage?: string;

  @ApiProperty({ description: '用法', required: false })
  prescriptionUsage?: string;

  @ApiProperty({ description: '治疗结果', required: false })
  treatmentResult?: string;

  @ApiProperty({ description: '备注', required: false })
  notes?: string;

  @ApiProperty({ description: '来源', required: false })
  source?: string;

  @ApiProperty({ description: '标签', type: [String], required: false })
  tags?: string[];
}

export class AnalyzeMedicalCaseDto {
  @ApiProperty({ description: '医案ID' })
  caseId: string;
}

export class MatchCasesDto {
  @ApiProperty({ description: '用户症状' })
  symptoms: string;

  @ApiProperty({ description: '舌象', required: false })
  tongue?: string;

  @ApiProperty({ description: '脉象', required: false })
  pulse?: string;

  @ApiProperty({ description: '匹配数量', default: 5 })
  limit?: number;
}

export class RecommendPrescriptionDto {
  @ApiProperty({ description: '用户症状' })
  symptoms: string;

  @ApiProperty({ description: '现病史', required: false })
  currentIllness?: string;

  @ApiProperty({ description: '舌象', required: false })
  tongue?: string;

  @ApiProperty({ description: '脉象', required: false })
  pulse?: string;

  @ApiProperty({ description: '用户性别', required: false })
  patientGender?: string;

  @ApiProperty({ description: '用户年龄', required: false })
  patientAge?: number;
}

export class CaseFeedbackDto {
  @ApiProperty({ description: '医案ID' })
  caseId: string;

  @ApiProperty({ description: '处方ID', required: false })
  recordId?: string;

  @ApiProperty({ description: '有效性' })
  effectiveness: string;

  @ApiProperty({ description: '症状改善情况', required: false })
  symptomImprovement?: string;

  @ApiProperty({ description: '实际使用处方', required: false })
  actualPrescription?: string;

  @ApiProperty({ description: '用量调整', required: false })
  dosageAdjustment?: string;

  @ApiProperty({ description: '是否成功' })
  success: boolean;

  @ApiProperty({ description: '学习笔记', required: false })
  learningNotes?: string;

  @ApiProperty({ description: '改进建议', required: false })
  improvementSuggestions?: string;
}
