/**
 * AI 智能问询系统 - 类型定义
 */

export interface PatientInfo {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
}

export interface PossibleDisease {
  name: string;                    // 病症名称
  probability: number;            // 可能性评分（0-100）
  keyFeatures: string[];          // 关键特征
  differentialQuestions: string[]; // 鉴别问题
}

export interface InquiryQuestion {
  question: string;               // 问题
  targetDiseases: {              // 目标病症
    disease: string;
    action: 'confirm' | 'eliminate';  // 确认或排除
  }[];
  diagnosticValue: string;       // 诊断价值说明
  priority: number;              // 优先级（0-100）
}

export interface DiseaseUpdate {
  disease: string;
  oldProbability: number;
  newProbability: number;
  reason: string;                // 更新原因
}

export interface DiagnosisUpdateResult {
  updatedDiseases: DiseaseUpdate[];
  eliminatedDiseases: string[];  // 被排除的病症（可能性 <10%）
  confirmedDisease?: string;    // 确认的病症（可能性 >80%）
}

export interface InitialDiagnosisResult {
  possibleDiseases: PossibleDisease[];
  nextInquiry: InquiryQuestion;
}

export interface InquiryHistoryItem {
  round: number;
  question: string;
  answer: string;
  diagnosisUpdate: DiagnosisUpdateResult;
}

export interface InquirySession {
  id: string;
  userId: string;
  patientInfo: PatientInfo;
  chiefComplaint: string;
  additionalInfo: string;
  possibleDiseases: PossibleDisease[];
  inquiryHistory: InquiryHistoryItem[];
  status: 'initial' | 'in_progress' | 'completed';
  currentRound: number;
  finalDiagnosis?: {
    syndrome: string;
    probability: number;
    reasoning: string;
    recommendation: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface StartInquiryParams {
  userId: string;
  patientInfo: PatientInfo;
  chiefComplaint: string;
  additionalInfo?: string;
}

export interface StartInquiryResult {
  sessionId: string;
  initialDiagnosis: InitialDiagnosisResult;
  firstQuestion: string;
}

export interface ContinueInquiryParams {
  sessionId: string;
  answer: string;
}

export interface ContinueInquiryResult {
  nextQuestion: string;
  diagnosisUpdate: DiagnosisUpdateResult;
  currentPossibilities: PossibleDisease[];
  shouldContinue: boolean;
}

export interface InquiryStatusResult {
  sessionId: string;
  status: string;
  currentRound: number;
  possibleDiseases: PossibleDisease[];
  inquiryHistory: InquiryHistoryItem[];
}

export interface CompleteInquiryResult {
  sessionId: string;
  finalDiagnosis: {
    syndrome: string;
    probability: number;
    reasoning: string;
    recommendation: string;
  };
  prescriptionRecommendation?: {
    formula: string;
    herbs: string[];
    dosage: string;
    instructions: string;
  };
}
