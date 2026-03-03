-- ============================================
-- 数字张仲景 - 数据库表结构
-- 支持专业数据库体系（经典文献、证候图谱、药物知识库、RWD）
-- ============================================

-- ============================================
-- 1. 经典文献表
-- ============================================
CREATE TABLE IF NOT EXISTS classic_formulas (
  id VARCHAR(50) PRIMARY KEY,
  formula_name VARCHAR(100) NOT NULL,
  source VARCHAR(200) NOT NULL,
  source_book VARCHAR(50) NOT NULL CHECK (source_book IN ('伤寒论', '金匮要略', '千金方', '外台秘要')),
  chapter VARCHAR(100),
  clause VARCHAR(100),
  meridian_affiliation TEXT[] NOT NULL, -- 六经归属
  key_symptoms TEXT[] NOT NULL, -- 主证
  contraindications TEXT[] NOT NULL, -- 禁忌证
  modifications JSONB, -- 加减法
  modern_pharmacology TEXT[], -- 现代药理
  dosage JSONB NOT NULL, -- 经方剂量
  instructions TEXT NOT NULL, -- 煎服法
  evidence_level CHAR(1) NOT NULL CHECK (evidence_level IN ('A', 'B', 'C')), -- 证据等级
  expert_validation JSONB NOT NULL, -- 专家验证
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_classic_formulas_meridian ON classic_formulas USING GIN(meridian_affiliation);
CREATE INDEX IF NOT EXISTS idx_classic_formulas_symptoms ON classic_formulas USING GIN(key_symptoms);
CREATE INDEX IF NOT EXISTS idx_classic_formulas_source_book ON classic_formulas(source_book);
CREATE INDEX IF NOT EXISTS idx_classic_formulas_evidence_level ON classic_formulas(evidence_level);

-- ============================================
-- 2. 症状节点表
-- ============================================
CREATE TABLE IF NOT EXISTS symptom_nodes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  synonyms TEXT[] NOT NULL, -- 同义词
  related_syndromes JSONB NOT NULL, -- 关联证候及权重
  modern_terms TEXT[], -- 现代医学术语
  extraction_rules TEXT[], -- 提取规则
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_symptom_nodes_name ON symptom_nodes(name);
CREATE INDEX IF NOT EXISTS idx_symptom_nodes_synonyms ON symptom_nodes USING GIN(synonyms);
CREATE INDEX IF NOT EXISTS idx_symptom_nodes_related_syndromes ON symptom_nodes USING GIN(related_syndromes);

-- ============================================
-- 3. 证候模式表
-- ============================================
CREATE TABLE IF NOT EXISTS syndrome_patterns (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('六经', '八纲', '脏腑', '气血津液')),
  meridian VARCHAR(20), -- 六经归属
  nature VARCHAR(20), -- 八纲属性
  organ VARCHAR(20), -- 脏腑归属
  key_symptoms JSONB NOT NULL, -- 主证及权重
  optional_symptoms JSONB NOT NULL, -- 兼证及权重
  tongue TEXT[], -- 舌象
  pulse TEXT[], -- 脉象
  related_formulas TEXT[] NOT NULL, -- 关联方剂
  contraindications TEXT[], -- 禁忌
  complications TEXT[], -- 并发证
  transmission_risk TEXT[], -- 传变风险
  expert_validation JSONB NOT NULL, -- 专家验证
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_syndrome_patterns_category ON syndrome_patterns(category);
CREATE INDEX IF NOT EXISTS idx_syndrome_patterns_meridian ON syndrome_patterns(meridian);
CREATE INDEX IF NOT EXISTS idx_syndrome_patterns_nature ON syndrome_patterns(nature);
CREATE INDEX IF NOT EXISTS idx_syndrome_patterns_related_formulas ON syndrome_patterns USING GIN(related_formulas);

-- ============================================
-- 4. 药物表
-- ============================================
CREATE TABLE IF NOT EXISTS herbs (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  aliases TEXT[] NOT NULL, -- 别名
  category VARCHAR(50) NOT NULL, -- 类别
  nature VARCHAR(20) NOT NULL, -- 性
  flavor TEXT[] NOT NULL, -- 味
  meridian TEXT[] NOT NULL, -- 归经
  dosage JSONB NOT NULL, -- 剂量区间
  processing TEXT[], -- 炮制方法
  contraindications TEXT[] NOT NULL, -- 禁忌
  toxicity JSONB NOT NULL, -- 毒性
  incompatibilities JSONB NOT NULL, -- 配伍禁忌
  modern_pharmacology JSONB NOT NULL, -- 现代药理
  classic_usage JSONB NOT NULL, -- 经典用法
  safety_rating CHAR(1) NOT NULL CHECK (safety_rating IN ('A', 'B', 'C', 'D')), -- 安全等级
  expert_validation JSONB NOT NULL, -- 专家验证
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_herbs_name ON herbs(name);
CREATE INDEX IF NOT EXISTS idx_herbs_category ON herbs(category);
CREATE INDEX IF NOT EXISTS idx_herbs_safety_rating ON herbs(safety_rating);
CREATE INDEX IF NOT EXISTS idx_herbs_aliases ON herbs USING GIN(aliases);
CREATE INDEX IF NOT EXISTS idx_herbs_toxicity ON herbs USING GIN(toxicity);

-- ============================================
-- 5. 配伍禁忌表
-- ============================================
CREATE TABLE IF NOT EXISTS incompatibility_pairs (
  id SERIAL PRIMARY KEY,
  herb_a VARCHAR(100) NOT NULL,
  herb_b VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('十八反', '十九畏', '配伍禁忌')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('严重', '中度', '轻度')),
  description TEXT NOT NULL,
  consequences TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_incompatibility_pairs_herb_a ON incompatibility_pairs(herb_a);
CREATE INDEX IF NOT EXISTS idx_incompatibility_pairs_herb_b ON incompatibility_pairs(herb_b);
CREATE INDEX IF NOT EXISTS idx_incompatibility_pairs_type ON incompatibility_pairs(type);

-- ============================================
-- 6. 孕期禁忌表
-- ============================================
CREATE TABLE IF NOT EXISTS pregnancy_contraindications (
  id SERIAL PRIMARY KEY,
  herb VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('禁用', '慎用')),
  reason TEXT NOT NULL,
  trimester_specific VARCHAR(100),
  modern_evidence TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_pregnancy_contraindications_herb ON pregnancy_contraindications(herb);
CREATE INDEX IF NOT EXISTS idx_pregnancy_contraindications_category ON pregnancy_contraindications(category);

-- ============================================
-- 7. 真实世界病例表
-- ============================================
CREATE TABLE IF NOT EXISTS real_world_cases (
  id VARCHAR(50) PRIMARY KEY,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  doctor VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  patient_info JSONB NOT NULL, -- 患者信息（脱敏）
  chief_complaint TEXT NOT NULL, -- 主诉
  present_illness TEXT NOT NULL, -- 现病史
  symptoms TEXT[] NOT NULL, -- 症状列表（结构化）
  tongue VARCHAR(200) NOT NULL, -- 舌象
  pulse VARCHAR(200) NOT NULL, -- 脉象
  diagnosis JSONB NOT NULL, -- 诊断（证候、六经、八纲）
  formula JSONB NOT NULL, -- 方剂
  outcome JSONB NOT NULL, -- 疗效
  doctor_comment TEXT NOT NULL, -- 医家点评
  non_typical_features TEXT[] NOT NULL, -- 非典型表现
  clinical_value TEXT NOT NULL, -- 临床价值
  evidence_level CHAR(1) NOT NULL CHECK (evidence_level IN ('A', 'B', 'C')),
  tags TEXT[] NOT NULL, -- 标签
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_real_world_cases_doctor ON real_world_cases(doctor);
CREATE INDEX IF NOT EXISTS idx_real_world_cases_date ON real_world_cases(date);
CREATE INDEX IF NOT EXISTS idx_real_world_cases_symptoms ON real_world_cases USING GIN(symptoms);
CREATE INDEX IF NOT EXISTS idx_real_world_cases_diagnosis ON real_world_cases USING GIN(diagnosis);
CREATE INDEX IF NOT EXISTS idx_real_world_cases_tags ON real_world_cases USING GIN(tags);

-- ============================================
-- 8. 问诊记录表（用户会话）
-- ============================================
CREATE TABLE IF NOT EXISTS inquiry_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL, -- 用户ID
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  symptoms TEXT[] NOT NULL, -- 症状列表
  tongue VARCHAR(200), -- 舌象
  pulse VARCHAR(200), -- 脉象
  diagnosis JSONB, -- 诊断结果
  recommended_formula JSONB, -- 推荐方剂
  diagnosis_confidence NUMERIC(5, 2), -- 诊断置信度
  warnings TEXT[], -- 预警信息
  status VARCHAR(50) NOT NULL CHECK (status IN ('进行中', '已完成', '已取消')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_inquiry_sessions_user_id ON inquiry_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_sessions_session_start ON inquiry_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_inquiry_sessions_status ON inquiry_sessions(status);
CREATE INDEX IF NOT EXISTS idx_inquiry_sessions_symptoms ON inquiry_sessions USING GIN(symptoms);

-- ============================================
-- 9. 用户反馈表（专家反馈闭环）
-- ============================================
CREATE TABLE IF NOT EXISTS expert_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id VARCHAR(50) NOT NULL, -- 关联的病例ID
  expert_id VARCHAR(100) NOT NULL, -- 专家ID
  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('诊断正确', '诊断错误', '方剂合适', '方剂不合适', '疗效反馈')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 评分（1-5）
  comment TEXT, -- 详细反馈
  suggested_diagnosis JSONB, -- 建议诊断
  suggested_formula JSONB, -- 建议方剂
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_expert_feedback_case_id ON expert_feedback(case_id);
CREATE INDEX IF NOT EXISTS idx_expert_feedback_expert_id ON expert_feedback(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_feedback_feedback_type ON expert_feedback(feedback_type);

-- ============================================
-- 10. 系统配置表（推理引擎参数）
-- ============================================
CREATE TABLE IF NOT EXISTS system_config (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);

-- ============================================
-- 初始化系统配置
-- ============================================
INSERT INTO system_config (config_key, config_value, description) VALUES
  ('bayesian_threshold', '{"high": 0.8, "medium": 0.5, "low": 0.3}', '贝叶斯推理置信度阈值'),
  ('risk_warning_enabled', 'true', '是否启用风险预警'),
  ('auto_learning_enabled', 'false', '是否启用自动学习（需专家审核）'),
  ('max_daily_inquiries', '100', '每日最大问诊次数')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================
-- 创建更新时间触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_classic_formulas_updated_at BEFORE UPDATE ON classic_formulas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptom_nodes_updated_at BEFORE UPDATE ON symptom_nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_syndrome_patterns_updated_at BEFORE UPDATE ON syndrome_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_herbs_updated_at BEFORE UPDATE ON herbs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_real_world_cases_updated_at BEFORE UPDATE ON real_world_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiry_sessions_updated_at BEFORE UPDATE ON inquiry_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expert_feedback_updated_at BEFORE UPDATE ON expert_feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 数据注释
-- ============================================
COMMENT ON TABLE classic_formulas IS '经典文献表：存储200+经方、500+条文、1000+加减变证';
COMMENT ON TABLE symptom_nodes IS '症状节点表：存储症状、同义词、关联证候';
COMMENT ON TABLE syndrome_patterns IS '证候模式表：存储六经、八纲、脏腑等证候模式';
COMMENT ON TABLE herbs IS '药物表：存储药物信息、毒性、配伍禁忌';
COMMENT ON TABLE incompatibility_pairs IS '配伍禁忌表：存储十八反、十九畏';
COMMENT ON TABLE pregnancy_contraindications IS '孕期禁忌表：存储孕期禁用/慎用药物';
COMMENT ON TABLE real_world_cases IS '真实世界病例表：存储名老中医病例（脱敏）';
COMMENT ON TABLE inquiry_sessions IS '问诊记录表：存储用户问诊会话';
COMMENT ON TABLE expert_feedback IS '专家反馈表：存储专家反馈（闭环学习）';
COMMENT ON TABLE system_config IS '系统配置表：存储推理引擎参数';

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '数字张仲景数据库表结构创建完成！';
    RAISE NOTICE '已创建10个表：经典文献、症状节点、证候模式、药物、配伍禁忌、孕期禁忌、真实世界病例、问诊记录、专家反馈、系统配置';
END $$;
