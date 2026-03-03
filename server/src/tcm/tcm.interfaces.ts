export interface AnalyzeRequest {
  chiefComplaint: string;
  history: string;
  pastHistory: string;
  aiInquiry?: string;  // AI 问询对话历史
  additionalInfo?: string;  // 补充信息（来自上传的文档）
  userId?: string;    // 用户 ID
  patientId?: string;  // 用户 ID
  isFollowUp?: boolean; // 是否为复诊
  userRole?: string;   // 用户角色（individual/institution/admin）- 用于权限控制
  auditStatus?: string; // 审核状态（approved/pending/rejected）- 用于权限控制
}

export interface Ingredient {
  name: string;      // 药物名称
  dosage: string;    // 剂量（如：12g）
  special: string;   // 特殊说明（如：先煎、后下、包煎等，无特殊则为空字符串）
}

export interface ReferenceCase {
  id: string;
  doctorName: string;
  doctorEra?: string;
  prescriptionName: string;
  diagnosis: string;
  mainSymptoms: string;
  effectivenessScore: number;
  matchScore: number;      // 匹配度（0-1）
  source: string;          // 来源（伤寒论、金匮要略等）
}

// 处方决策信息
export interface PrescriptionDecision {
  primarySource: string;   // 主要来源（医案优先/千问建议/融合生成）
  decisionReason: string;  // 决策理由
  topMatchScore: number;   // 最高匹配度
  hasConflict: boolean;    // 是否存在冲突
  conflictDetails?: string; // 冲突详情
}

// 高风险处方信息
export interface HighRiskPrescriptionInfo {
  isHighRisk: boolean;     // 是否为高风险处方
  reason: string;          // 高风险原因
  ingredients: string[];   // 高风险药材列表
}

export interface TreatmentPlan {
  diagnosis: string;              // 诊断
  differentiation: string;        // 辨证分型
  treatmentPrinciple: string;     // 治则
  symptomAnalysis?: string;       // 症状分析
  prescription: {
    formulaName: string;          // 方名
    ingredients: Ingredient[];    // 药物组成（结构化数组）
    decoctionMethod: string;      // 煎煮方法（详细步骤）
    dosageMethod: string;         // 服用方法（频次、时间、温度等）
    precautions: string;          // 注意事项（禁忌、饮食宜忌等）
    highRiskInfo?: HighRiskPrescriptionInfo;  // 高风险处方信息（新增）
  };
  explanation: string;            // 方解
  advice: string;                 // 调护建议
  warnings?: string[];            // 警告信息（审核状态、特殊人群等）
  referenceCases: ReferenceCase[];// 参考医案
  prescriptionSource: string;     // 处方来源
  prescriptionDecision: PrescriptionDecision; // 处方决策
}
