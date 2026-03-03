/**
 * 顶级经方大师 - 本体论类型定义
 * 六经-八纲-方证 三维知识架构
 */

// ============================================
// 第一维度：六经（病位层）
// ============================================
export type MeridianType = '太阳' | '阳明' | '少阳' | '太阴' | '少阴' | '厥阴';

export interface MeridianOntology {
  id: MeridianType;
  name: string;
  location: '表' | '里' | '半表半里';
  nature: '寒' | '热' | '寒热错杂';
  keyPathology: string; // 主要病机
  transmissionRules: MeridianTransmission[];
  classicFormulas: string[]; // 经典方剂
}

export interface MeridianTransmission {
  from: MeridianType;
  to: MeridianType;
  conditions: string[]; // 转化条件
  probability: number; // 转化概率
}

// ============================================
// 第二维度：八纲（病性层）
// ============================================
export type EightGuides = {
  location: '表' | '里' | '表里同病' | '半表半里';
  nature: '寒' | '热' | '寒热错杂';
  deficiencyExcess: '虚' | '实' | '虚实夹杂';
  yinYang: '阴' | '阳' | '阴阳两虚' | '阴盛格阳' | '阳盛格阴';
};

export interface EightGuidesOntology {
  eightGuides: EightGuides;
  characteristics: string[];
  combinationRules: string[];
  differentiationPoints: string[];
}

// ============================================
// 第三维度：方证（经典条文）
// ============================================

// 治法分类
export type TreatmentMethod =
  | '解表'           // 发汗解表
  | '清热'           // 清热泻火
  | '温里'           // 温阳救逆
  | '补益'           // 补气血阴阳
  | '泻下'           // 通腑泻下
  | '和解'           // 和解少阳
  | '调和营卫'       // 调和营卫
  | '化饮'           // 化饮利水
  | '活血化瘀'       // 活血化瘀
  | '涩肠固脱'       // 涩肠止泻
  | '回阳救逆'       // 回阳救逆
  | '养阴清热'       // 养阴清热
  | '温经散寒'       // 温经散寒
  | '和解少阳'       // 和解少阳
  | '清上温下'       // 清上温下
  | '疏肝和胃'       // 疏肝和胃
  | '健脾和胃'       // 健脾和胃
  | '养血和血'       // 养血和血
  | '通阳化饮'       // 通阳化饮
  | '清热燥湿'       // 清热燥湿
  | '温中健脾'       // 温中健脾
  | '滋阴潜阳'       // 滋阴潜阳
  | '引火归元'       // 引火归元
  | '调和脾胃'       // 调和脾胃
  | '清营凉血'       // 清营凉血
  | '补火助阳'       // 补火助阳
  | '疏肝解郁'       // 疏肝解郁;

export interface FormulaEvidence {
  formula: string;
  source: '伤寒论' | '金匮要略' | '其他' | '景岳全书' | '太平惠民和剂局方' | '内科摘要' | '医宗金鉴' | '丹溪心法' | '医林改错' | '本草纲目' | '小儿药证直诀' | '摄生秘剖' | '济生方' | '症因脉治' | '寿世保元' | '兰室秘藏' | '续名医类案' | '医级' | '医学心悟';
  chapter: string; // 如"太阳病篇"
  originalText: string; // 原文
  keySymptoms: string[]; // 主症
  mechanism: string; // 病机
  treatmentMethod: TreatmentMethod; // 治法（新增）
  indications: string[]; // 适应症
  contraindications: string[]; // 禁忌症
  dosage: string; // 剂量
  instructions: string; // 煎服法
}

// ============================================
// 三维知识单元
// ============================================
export interface KnowledgeUnit {
  id: string; // 唯一标识
  meridian: MeridianOntology;
  eightGuides: EightGuidesOntology;
  formula: FormulaEvidence;
  confidence: number; // 初始置信度
  evidenceWeight: number; // 证据权重
  relationships: KnowledgeRelationship[]; // 与其他单元的关系
}

export interface KnowledgeRelationship {
  type: 'inclusion' | 'contradiction' | 'transmission' | 'combination';
  targetId: string;
  strength: number; // 关系强度
}

// ============================================
// 症状本体论
// ============================================
export interface SymptomOntology {
  id: string;
  name: string;
  alias: string[]; // 别名（口语化表达）
  category: '主症' | '兼症' | '舌象' | '脉象';
  location?: string; // 部位
  severity?: '轻' | '中' | '重';
  duration?: '急性' | '慢性' | '发作性';
  standardization?: string; // 标准化术语
  associatedMeridians: MeridianType[]; // 关联六经
  associatedFormulas: string[]; // 关联方剂
  probability: {
    [meridian: string]: number; // 在各六经中的出现概率
  };
}

// ============================================
// 证候本体论
// ============================================
export interface SyndromeOntology {
  id: string;
  name: string;
  type: '单经证' | '合病' | '并病' | '坏病';
  meridian: MeridianType | MeridianType[]; // 支持多经
  eightGuides: EightGuides;
  keySymptoms: string[]; // 主症
  supportingSymptoms: string[]; // 兼症
  differentiationPoints: string[]; // 鉴别点
  formula: string; // 主方
  alternativeFormulas: string[]; // 备选方
  mechanism: string; // 病机
  transmission: SyndromeTransmission[]; // 传变规律
}

export interface SyndromeTransmission {
  to: string; // 目标证候
  conditions: string[]; // 转化条件
  triggers: string[]; // 触发因素（如误汗、误下）
  probability: number; // 转化概率
}

// ============================================
// 贝叶斯网络节点
// ============================================
export interface BayesianNode {
  id: string;
  type: 'symptom' | 'syndrome' | 'formula';
  name: string;
  parents: string[]; // 父节点
  children: string[]; // 子节点
  priorProbability?: number; // 先验概率
  conditionalProbabilities?: {
    // 条件概率表 CPT
    [parentState: string]: number;
  };
}

export interface BayesianNetwork {
  nodes: BayesianNode[];
  edges: BayesianEdge[];
  inferenceEngine: string; // 推理引擎类型
}

export interface BayesianEdge {
  from: string;
  to: string;
  type: 'causal' | 'influence';
  weight: number;
}

// ============================================
// 置信度与不确定性
// ============================================
export interface ConfidenceMetrics {
  primarySyndrome: {
    syndromeId: string;
    name: string;
    confidence: number; // 0-100
    uncertainty: number; // 不确定性 0-100
    evidence: EvidenceItem[];
  };
  alternativeSyndromes: {
    syndromeId: string;
    name: string;
    confidence: number;
    uncertainty: number;
    evidence: EvidenceItem[];
  }[];
  recommendation: RecommendationType;
}

export type RecommendationType =
  | 'high_confidence' // 高置信度（≥80%）
  | 'moderate_confidence' // 中等置信度（60-79%）
  | 'low_confidence' // 低置信度（<60%）
  | 'contradictory' // 矛盾证据
  | 'insufficient_evidence'; // 证据不足

export interface EvidenceItem {
  type: 'symptom' | 'sign' | 'history';
  name: string;
  weight: number; // 证据权重
  source: 'user_input' | 'inferred';
}

// ============================================
// 专家反馈
// ============================================
export interface ExpertFeedback {
  sessionId: string;
  originalDiagnosis: string;
  expertDiagnosis: string;
  formula: string;
  outcome: 'effective' | 'ineffective' | 'partially_effective';
  feedbackDetails: {
    correctItems: string[];
    incorrectItems: string[];
    missingItems: string[];
    additionalNotes?: string;
  };
  timestamp: Date;
  expertId: string;
}

export interface ModelUpdate {
  feedbackId: string;
  updatedWeights: {
    [knowledgeUnitId: string]: {
      oldWeight: number;
      newWeight: number;
      delta: number;
    };
  };
  updatedProbabilities: {
    [syndromeId: string]: {
      oldProbability: number;
      newProbability: number;
      delta: number;
    };
  };
}
