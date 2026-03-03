-- ============================================
-- 数字张仲景 - 顶级经方数据库（权威版）
-- 核心原则：法度正、结构清、可推理
-- 四大支柱：经典原文库、方证知识图谱、药物规范库、名医验案库
-- ============================================

-- ============================================
-- 0. 系统配置表 - 冲突消解规则配置
-- ============================================
CREATE TABLE IF NOT EXISTS system_config (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_by VARCHAR(100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初始化冲突消解规则
INSERT INTO system_config (config_key, config_value, description) VALUES
(
  'conflict_resolution_rules',
  '{
    "principle": "经典为体，现代为用；数据库为主，联网为辅；安全为先，疗效为要",
    "database_weight": 0.8,
    "web_weight": 0.2,
    "authoritative_sources": ["国家药典", "中华中医药学会指南", "国家卫健委"],
    "safety_threshold": 0.7,
    "evidence_levels": {
      "经典条文": 1.0,
      "专家共识": 0.9,
      "药典标准": 0.95,
      "核心期刊": 0.7,
      "网络传言": 0.0
    }
  }'::jsonb,
  '冲突消解规则配置'
) ON CONFLICT (config_key) DO NOTHING;

-- ============================================
-- 支柱 1: 经典原文库（静态，经典不变）
-- ============================================
CREATE TABLE IF NOT EXISTS classic_sources (
  id VARCHAR(50) PRIMARY KEY,
  source_name VARCHAR(200) NOT NULL, -- 如《伤寒论》《金匮要略》
  edition VARCHAR(200) NOT NULL, -- 如"刘渡舟校注本"
  publisher VARCHAR(200), -- 出版社
  publish_year INTEGER, -- 出版年份
  isbn VARCHAR(20), -- ISBN
  author VARCHAR(100), -- 校注者
  author_type VARCHAR(50) CHECK (author_type IN ('原著者', '校注者', '注释者')),
  authority_level VARCHAR(20) NOT NULL CHECK (authority_level IN ('权威', '公认', '参考')),
  description TEXT, -- 描述
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 经典条文表
CREATE TABLE IF NOT EXISTS classic_clauses (
  id VARCHAR(50) PRIMARY KEY,
  source_id VARCHAR(50) NOT NULL REFERENCES classic_sources(id) ON DELETE CASCADE,
  book_name VARCHAR(50) NOT NULL, -- 书名（伤寒论/金匮要略）
  chapter VARCHAR(100), -- 篇名（如"辨太阳病脉证并治"）
  clause_number VARCHAR(50) NOT NULL, -- 条文编号（如"12"）
  original_text TEXT NOT NULL, -- 原文
  interpretation TEXT, -- 注释
  formula_id VARCHAR(50), -- 关联方剂
  syndrome_id VARCHAR(50), -- 关联证候
  key_points TEXT[], -- 要点
  version_notes TEXT[], -- 版本差异注记
  evidence_level CHAR(1) NOT NULL CHECK (evidence_level IN ('A', 'B', 'C')),
  is_canonical BOOLEAN DEFAULT false, -- 是否为标准条文
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source_id, book_name, clause_number)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_classic_clauses_source ON classic_clauses(source_id);
CREATE INDEX IF NOT EXISTS idx_classic_clauses_book ON classic_clauses(book_name);
CREATE INDEX IF NOT EXISTS idx_classic_clauses_clause_number ON classic_clauses(clause_number);
CREATE INDEX IF NOT EXISTS idx_classic_clauses_formula ON classic_clauses(formula_id);
CREATE INDEX IF NOT EXISTS idx_classic_clauses_syndrome ON classic_clauses(syndrome_id);
CREATE INDEX IF NOT EXISTS idx_classic_clauses_original_text ON classic_clauses USING GIN(to_tsvector('chinese', original_text));

-- ============================================
-- 支柱 2: 方证知识图谱（年度校准）
-- ============================================
-- 方剂表（增强版）
CREATE TABLE IF NOT EXISTS formulas (
  id VARCHAR(50) PRIMARY KEY,
  formula_name VARCHAR(100) NOT NULL,
  alias TEXT[], -- 别名
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('伤寒论', '金匮要略', '后世', '现代')),
  classic_clause_id VARCHAR(50) REFERENCES classic_clauses(id), -- 经典条文引用
  primary_syndrome_id VARCHAR(50) NOT NULL, -- 主治证候
  meridian_affiliation VARCHAR(20) NOT NULL, -- 六经归属
  eight_guides JSONB NOT NULL, -- 八纲属性（表里、寒热、虚实）
  key_symptoms JSONB NOT NULL, -- 主证（症状ID及权重）
  optional_symptoms JSONB, -- 兼证（症状ID及权重）
  contraindications TEXT[], -- 禁忌证
  modifications JSONB, -- 加减法
  dosage JSONB NOT NULL, -- 经方剂量（1两=3g换算）
  instructions TEXT NOT NULL, -- 煎服法
  modern_pharmacology JSONB, -- 现代药理
  evidence_level CHAR(1) NOT NULL CHECK (evidence_level IN ('A', 'B', 'C')),
  safety_rating CHAR(1) NOT NULL CHECK (safety_rating IN ('A', 'B', 'C', 'D')),
  expert_validation JSONB NOT NULL, -- 专家验证（3位以上专家）
  clinical_notes TEXT, -- 临床备注
  last_calibrated_at DATE, -- 最后校准日期
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 证候表（增强版）
CREATE TABLE IF NOT EXISTS syndromes (
  id VARCHAR(50) PRIMARY KEY,
  syndrome_name VARCHAR(100) NOT NULL,
  meridian VARCHAR(20) NOT NULL, -- 六经归属
  eight_guides JSONB NOT NULL, -- 八纲属性
  organ VARCHAR(20), -- 脏腑归属
  key_symptoms JSONB NOT NULL, -- 主证（症状ID及权重）
  optional_symptoms JSONB, -- 兼证（症状ID及权重）
  tongue VARCHAR(200), -- 舌象
  pulse VARCHAR(200), -- 脉象
  classic_clause_id VARCHAR(50) REFERENCES classic_clauses(id), -- 经典条文引用
  related_formulas TEXT[] NOT NULL, -- 关联方剂
  contraindications TEXT[], -- 禁忌
  complications TEXT[], -- 并发证
  transmission_risk JSONB, -- 传变风险（可能的传变证候及概率）
  expert_validation JSONB NOT NULL, -- 专家验证
  evidence_level CHAR(1) NOT NULL CHECK (evidence_level IN ('A', 'B', 'C')),
  last_calibrated_at DATE, -- 最后校准日期
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 方证关联表（知识图谱核心）
CREATE TABLE IF NOT EXISTS formula_syndrome_relations (
  id SERIAL PRIMARY KEY,
  formula_id VARCHAR(50) NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  syndrome_id VARCHAR(50) NOT NULL REFERENCES syndromes(id) ON DELETE CASCADE,
  relation_type VARCHAR(20) NOT NULL CHECK (relation_type IN ('主治', '兼治', '加减', '禁忌')),
  confidence DECIMAL(5, 2), -- 置信度（0-1）
  classic_clause_id VARCHAR(50) REFERENCES classic_clauses(id), -- 经典条文引用
  expert_consensus VARCHAR(100), -- 专家共识（如"一致认为"、"有分歧"）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(formula_id, syndrome_id, relation_type)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_formula_syndrome_formula ON formula_syndrome_relations(formula_id);
CREATE INDEX IF NOT EXISTS idx_formula_syndrome_syndrome ON formula_syndrome_relations(syndrome_id);
CREATE INDEX IF NOT EXISTS idx_formula_syndrome_type ON formula_syndrome_relations(relation_type);

-- ============================================
-- 支柱 3: 药物规范库（实时同步药典）
-- ============================================
-- 药物表（增强版）
CREATE TABLE IF NOT EXISTS herbs (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  alias TEXT[], -- 别名
  category VARCHAR(50) NOT NULL, -- 类别（解表药、清热药等）
  nature VARCHAR(20) NOT NULL, -- 性（寒、热、温、凉、平）
  flavor TEXT[] NOT NULL, -- 味（酸、苦、甘、辛、咸）
  meridian TEXT[] NOT NULL, -- 归经
  dosage JSONB NOT NULL, -- 剂量区间（min, max, unit）
  processing TEXT[], -- 炮制方法
  classic_usage JSONB, -- 经典用法（伤寒论/金匮要略中的使用）
  toxicity JSONB NOT NULL, -- 毒性（isToxic, toxicDosage, toxicSymptoms）
  incompatibilities JSONB, -- 配伍禁忌（十八反、十九畏）
  modern_pharmacology JSONB, -- 现代药理
  safety_rating CHAR(1) NOT NULL CHECK (safety_rating IN ('A', 'B', 'C', 'D')),
  contraindications TEXT[], -- 禁忌证
  pharmacopeia_dosage JSONB, -- 药典剂量（实时同步）
  pharmacopeia_limit VARCHAR(50), -- 药典限量
  last_pharmacopeia_sync DATE, -- 最后药典同步日期
  expert_validation JSONB NOT NULL, -- 专家验证
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 药典同步记录表
CREATE TABLE IF NOT EXISTS pharmacopeia_sync_logs (
  id SERIAL PRIMARY KEY,
  sync_date DATE NOT NULL,
  source VARCHAR(100) NOT NULL, -- 如《中国药典2025版》
  herbs_updated INTEGER, -- 更新的药物数量
  sync_status VARCHAR(20) NOT NULL CHECK (sync_status IN ('成功', '失败', '部分失败')),
  error_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 支柱 4: 名医验案库（季度新增）
-- ============================================
-- 名医表
CREATE TABLE IF NOT EXISTS famous_doctors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(100), -- 头衔（如"经方大师"、"伤寒大家"）
  school VARCHAR(50), -- 学派（如"伤寒派"、"火神派"）
  specialties TEXT[], -- 专长
  biography TEXT, -- 生平简介
  representative_cases TEXT[], -- 代表性案例
  authority_level VARCHAR(20) NOT NULL CHECK (authority_level IN ('国医大师', '名老中医', '经方大家', '临床专家')),
  verification_status VARCHAR(20) NOT NULL CHECK (verification_status IN ('已认证', '待认证', '未认证')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 名医验案表
CREATE TABLE IF NOT EXISTS famous_doctor_cases (
  id VARCHAR(50) PRIMARY KEY,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  doctor_id VARCHAR(50) NOT NULL REFERENCES famous_doctors(id) ON DELETE CASCADE,
  patient_info JSONB NOT NULL, -- 患者信息（脱敏）
  chief_complaint TEXT NOT NULL, -- 主诉
  present_illness TEXT NOT NULL, -- 现病史
  symptoms TEXT[] NOT NULL, -- 症状列表（结构化）
  tongue VARCHAR(200), -- 舌象
  pulse VARCHAR(200), -- 脉象
  diagnosis JSONB NOT NULL, -- 诊断（证候、六经、八纲）
  formula JSONB NOT NULL, -- 方剂
  formula_source VARCHAR(100), -- 方剂来源（如"桂枝汤原方"、"桂枝汤加减"）
  dosage_adjustment TEXT, -- 剂量调整说明
  outcome JSONB NOT NULL, -- 疗效
  doctor_comment TEXT NOT NULL, -- 医家点评
  non_typical_features TEXT[], -- 非典型表现
  clinical_value TEXT NOT NULL, -- 临床价值
  case_type VARCHAR(20) NOT NULL CHECK (case_type IN ('典型', '疑难', '危重', '误治')),
  tags TEXT[], -- 标签
  is_representative BOOLEAN DEFAULT false, -- 是否为代表案例
  generalizable_level VARCHAR(20) NOT NULL CHECK (generalizable_level IN ('高度', '中度', '低度', '不可')), -- 可泛化程度
  evidence_level CHAR(1) NOT NULL CHECK (evidence_level IN ('A', 'B', 'C')),
  verification_status VARCHAR(20) NOT NULL CHECK (verification_status IN ('已审核', '待审核', '未审核')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_famous_doctor_cases_doctor ON famous_doctor_cases(doctor_id);
CREATE INDEX IF NOT EXISTS idx_famous_doctor_cases_case_type ON famous_doctor_cases(case_type);
CREATE INDEX IF NOT EXISTS idx_famous_doctor_cases_tags ON famous_doctor_cases USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_famous_doctor_cases_symptoms ON famous_doctor_cases USING GIN(symptoms);
CREATE INDEX IF NOT EXISTS idx_famous_doctor_cases_diagnosis ON famous_doctor_cases USING GIN(diagnosis);

-- ============================================
-- 冲突消解记录表
-- ============================================
CREATE TABLE IF NOT EXISTS conflict_resolution_logs (
  id SERIAL PRIMARY KEY,
  conflict_type VARCHAR(50) NOT NULL, -- 冲突类型
  database_evidence JSONB NOT NULL, -- 数据库证据
  web_evidence JSONB, -- 联网证据
  web_source VARCHAR(100), -- 联网来源
  resolution_decision VARCHAR(50) NOT NULL, -- 决策（采纳数据库/采纳网络/拒绝/待审核）
  confidence_score DECIMAL(5, 2), -- 置信度分数
  reasoning TEXT NOT NULL, -- 决策理由
  resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_by VARCHAR(100) -- 决策者（AI/专家）
);

-- ============================================
-- 证据溯源表（每条诊断都引用经典条文）
-- ============================================
CREATE TABLE IF NOT EXISTS evidence_traces (
  id SERIAL PRIMARY KEY,
  record_id VARCHAR(100) NOT NULL, -- 记录ID（问诊记录、处方等）
  record_type VARCHAR(50) NOT NULL, -- 记录类型
  evidence_type VARCHAR(50) NOT NULL, -- 证据类型（经典条文/专家共识/药典标准）
  evidence_id VARCHAR(50), -- 证据ID
  evidence_text TEXT NOT NULL, -- 证据内容
  source_reference VARCHAR(200) NOT NULL, -- 来源引用（如《伤寒论》第12条）
  weight DECIMAL(5, 2), -- 权重
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 创建视图
-- ============================================

-- 方剂-证候-条文完整关联视图
CREATE OR REPLACE VIEW v_formula_syndrome_clause AS
SELECT
  f.id AS formula_id,
  f.formula_name,
  f.classic_clause_id,
  s.id AS syndrome_id,
  s.syndrome_name,
  c.clause_number,
  c.original_text,
  f.evidence_level,
  f.safety_rating
FROM formulas f
JOIN syndromes s ON f.primary_syndrome_id = s.id
LEFT JOIN classic_clauses c ON f.classic_clause_id = c.id;

-- 药物-药典剂量视图
CREATE OR REPLACE VIEW v_herb_pharmacopeia_dosage AS
SELECT
  h.id AS herb_id,
  h.name AS herb_name,
  h.dosage AS classic_dosage,
  h.pharmacopeia_dosage,
  h.pharmacopeia_limit,
  h.safety_rating,
  h.last_pharmacopeia_sync
FROM herbs h;

-- 名医验案统计视图
CREATE OR REPLACE VIEW v_famous_doctor_case_stats AS
SELECT
  fd.name AS doctor_name,
  fd.title,
  fd.school,
  COUNT(*) AS total_cases,
  COUNT(*) FILTER (WHERE fdc.case_type = '典型') AS typical_cases,
  COUNT(*) FILTER (WHERE fdc.case_type = '疑难') AS difficult_cases,
  COUNT(*) FILTER (WHERE fdc.case_type = '危重') AS critical_cases,
  AVG(fdc.evidence_level::INTEGER) AS avg_evidence_level
FROM famous_doctors fd
LEFT JOIN famous_doctor_cases fdc ON fd.id = fdc.doctor_id
GROUP BY fd.id, fd.name, fd.title, fd.school;

-- ============================================
-- 触发器
-- ============================================

-- 自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表创建触发器
CREATE TRIGGER update_classic_sources_updated_at BEFORE UPDATE ON classic_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classic_clauses_updated_at BEFORE UPDATE ON classic_clauses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_formulas_updated_at BEFORE UPDATE ON formulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_syndromes_updated_at BEFORE UPDATE ON syndromes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_herbs_updated_at BEFORE UPDATE ON herbs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_famous_doctors_updated_at BEFORE UPDATE ON famous_doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_famous_doctor_cases_updated_at BEFORE UPDATE ON famous_doctor_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 注释
-- ============================================

COMMENT ON TABLE classic_sources IS '经典原文库：如《伤寒论》《金匮要略》等权威校注本';
COMMENT ON TABLE classic_clauses IS '经典条文：每条条文都标注编号、原文、注释';
COMMENT ON TABLE formulas IS '方剂表：包含条文引用、证候关联、专家验证';
COMMENT ON TABLE syndromes IS '证候表：包含条文引用、传变风险、专家验证';
COMMENT ON TABLE formula_syndrome_relations IS '方证关联：知识图谱核心，记录方剂与证候的关系';
COMMENT ON TABLE herbs IS '药物表：包含药典剂量、毒性、安全等级';
COMMENT ON TABLE famous_doctors IS '名医表：胡希恕、刘渡舟、黄煌、冯世纶等';
COMMENT ON TABLE famous_doctor_cases IS '名医验案：真实案例，注明可泛化程度';
COMMENT ON TABLE conflict_resolution_logs IS '冲突消解记录：记录数据库与联网信息的冲突处理';
COMMENT ON TABLE evidence_traces IS '证据溯源：每条诊断都引用经典条文';
COMMENT ON TABLE system_config IS '系统配置：冲突消解规则配置';
