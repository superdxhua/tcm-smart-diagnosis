-- ============================================================================
-- 综合数据库架构迁移脚本
-- 包含：疾病分类、方剂-疾病关联、慢性病配置、循证证据
-- ============================================================================

-- ============================================================================
-- 第一部分：扩展现有表
-- ============================================================================

-- 1. 扩展 formulas 表，添加分类和应用场景
ALTER TABLE formulas
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS applicable_diseases TEXT[],
ADD COLUMN IF NOT EXISTS applicable_syndromes TEXT[],
ADD COLUMN IF NOT EXISTS evidence_level VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS clinical_usage_count INTEGER DEFAULT 0;

-- 创建注释
COMMENT ON COLUMN formulas.category IS '方剂分类：general-通用方剂, chronic-慢性病专用, tumor-肿瘤专用, acute-急性病, prevention-预防保健';
COMMENT ON COLUMN formulas.applicable_diseases IS '适用疾病列表（疾病分类ID数组）';
COMMENT ON COLUMN formulas.applicable_syndromes IS '适用证型列表（证型名称数组）';
COMMENT ON COLUMN formulas.evidence_level IS '循证等级：high-高质量证据, medium-中等质量证据, low-低质量证据';
COMMENT ON COLUMN formulas.clinical_usage_count IS '临床使用次数';

-- 2. 扩展 tumor_formula_relations 表
ALTER TABLE tumor_formula_relations
ADD COLUMN IF NOT EXISTS efficacy_notes TEXT,
ADD COLUMN IF NOT EXISTS clinical_evidence TEXT[],
ADD COLUMN IF NOT EXISTS evidence_level VARCHAR(20) DEFAULT 'medium';

-- ============================================================================
-- 第二部分：创建新表
-- ============================================================================

-- 3. 创建疾病分类表
CREATE TABLE IF NOT EXISTS disease_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_id VARCHAR(50) REFERENCES disease_categories(id) ON DELETE SET NULL,
  level INTEGER DEFAULT 1,
  description TEXT,
  tcm_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_disease_categories_parent_id ON disease_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_disease_categories_level ON disease_categories(level);

-- 创建注释
COMMENT ON TABLE disease_categories IS '疾病分类表，支持层级结构';
COMMENT ON COLUMN disease_categories.parent_id IS '父分类ID，NULL表示顶级分类';
COMMENT ON COLUMN disease_categories.level IS '分类层级：1-一级分类, 2-二级分类, 3-三级分类';
COMMENT ON COLUMN disease_categories.tcm_name IS '中医疾病名称';

-- 4. 创建方剂-疾病关联表
CREATE TABLE IF NOT EXISTS formula_disease_relations (
  id VARCHAR(50) PRIMARY KEY,
  formula_id VARCHAR(50) NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  disease_category_id VARCHAR(50) NOT NULL REFERENCES disease_categories(id) ON DELETE CASCADE,
  efficacy_score DECIMAL(3,2) DEFAULT 0.50 CHECK (efficacy_score >= 0 AND efficacy_score <= 1),
  evidence_level VARCHAR(20) DEFAULT 'medium' CHECK (evidence_level IN ('high', 'medium', 'low')),
  evidence_sources TEXT[],
  clinical_cases_count INTEGER DEFAULT 0,
  clinical_effectiveness DECIMAL(3,2), -- 临床有效率
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(formula_id, disease_category_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_formula_disease_relations_formula_id ON formula_disease_relations(formula_id);
CREATE INDEX IF NOT EXISTS idx_formula_disease_relations_disease_id ON formula_disease_relations(disease_category_id);
CREATE INDEX IF NOT EXISTS idx_formula_disease_relations_efficacy ON formula_disease_relations(efficacy_score DESC);

-- 创建注释
COMMENT ON TABLE formula_disease_relations IS '方剂与疾病的关联关系';
COMMENT ON COLUMN formula_disease_relations.efficacy_score IS '疗效评分（0-1），越高表示疗效越好';
COMMENT ON COLUMN formula_disease_relations.evidence_level IS '循证等级：high-高质量, medium-中等质量, low-低质量';
COMMENT ON COLUMN formula_disease_relations.clinical_cases_count IS '临床病例数';
COMMENT ON COLUMN formula_disease_relations.clinical_effectiveness IS '临床有效率（0-1）';

-- 5. 创建慢性病专用配置表
CREATE TABLE IF NOT EXISTS chronic_disease_formulas (
  id VARCHAR(50) PRIMARY KEY,
  formula_id VARCHAR(50) NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  disease_category_id VARCHAR(50) NOT NULL REFERENCES disease_categories(id) ON DELETE CASCADE,
  disease_stage VARCHAR(50) CHECK (disease_stage IN ('early', 'middle', 'late', 'all')),
  symptom_pattern VARCHAR(100), -- 症状模式
  syndrome_type VARCHAR(100), -- 证型分类
  dosage_adjustment TEXT, -- 剂量调整说明
  duration_notes TEXT, -- 疗程说明
  combination_formulas TEXT[], -- 联合使用的方剂ID列表
  contraindications TEXT[], -- 禁忌症
  special_cautions TEXT[], -- 特殊注意事项
  lifestyle_advice JSONB, -- 生活建议（JSON格式）
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(formula_id, disease_category_id, disease_stage, symptom_pattern)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chronic_disease_formulas_formula_id ON chronic_disease_formulas(formula_id);
CREATE INDEX IF NOT EXISTS idx_chronic_disease_formulas_disease_id ON chronic_disease_formulas(disease_category_id);
CREATE INDEX IF NOT EXISTS idx_chronic_disease_formulas_stage ON chronic_disease_formulas(disease_stage);

-- 创建注释
COMMENT ON TABLE chronic_disease_formulas IS '慢性病专用方剂配置';
COMMENT ON COLUMN chronic_disease_formulas.disease_stage IS '疾病分期：early-早期, middle-中期, late-晚期, all-所有分期';
COMMENT ON COLUMN chronic_disease_formulas.symptom_pattern IS '症状模式，用于匹配患者症状特征';
COMMENT ON COLUMN chronic_disease_formulas.syndrome_type IS '证型分类，如脾胃气虚、肝肾阴虚等';
COMMENT ON COLUMN chronic_disease_formulas.lifestyle_advice IS '生活建议（JSON格式）';

-- 6. 创建循证医学证据表
CREATE TABLE IF NOT EXISTS formula_evidence (
  id VARCHAR(50) PRIMARY KEY,
  formula_id VARCHAR(50) NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  disease_category_id VARCHAR(50) REFERENCES disease_categories(id) ON DELETE SET NULL, -- 可选，针对特定疾病
  evidence_type VARCHAR(50) NOT NULL CHECK (evidence_type IN ('clinical_trial', 'case_study', 'literature', 'expert_opinion', 'meta_analysis')),
  title VARCHAR(200) NOT NULL,
  authors VARCHAR(200),
  source VARCHAR(100), -- 期刊名称或机构
  year INTEGER,
  volume VARCHAR(50),
  issue VARCHAR(50),
  pages VARCHAR(50),
  doi VARCHAR(100),
  sample_size INTEGER,
  effectiveness DECIMAL(3,2), -- 治疗有效率
  p_value DECIMAL(10,4),
  confidence_interval VARCHAR(50),
  url VARCHAR(500),
  abstract TEXT,
  key_findings TEXT[],
  limitations TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_formula_evidence_formula_id ON formula_evidence(formula_id);
CREATE INDEX IF NOT EXISTS idx_formula_evidence_disease_id ON formula_evidence(disease_category_id);
CREATE INDEX IF NOT EXISTS idx_formula_evidence_type ON formula_evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_formula_evidence_year ON formula_evidence(year DESC);

-- 创建注释
COMMENT ON TABLE formula_evidence IS '方剂循证医学证据表';
COMMENT ON COLUMN formula_evidence.evidence_type IS '证据类型：clinical_trial-临床试验, case_study-病例研究, literature-文献, expert_opinion-专家意见, meta_analysis-荟萃分析';
COMMENT ON COLUMN formula_evidence.effectiveness IS '治疗有效率（0-1）';
COMMENT ON COLUMN formula_evidence.p_value IS '统计学P值';

-- ============================================================================
-- 第三部分：插入初始数据
-- ============================================================================

-- 插入疾病分类数据
INSERT INTO disease_categories (id, name, tcm_name, level, description) VALUES
-- 一级分类
('digestive', '消化系统', '脾胃病', 1, '消化系统疾病分类'),
('immune', '免疫代谢', '气血津液病', 1, '免疫代谢系统疾病分类'),
('emotion', '情志神经', '神志病', 1, '情志神经系统疾病分类'),
('rheumatic', '风湿免疫', '痹病', 1, '风湿免疫系统疾病分类'),
('gynecological', '妇科', '妇科病', 1, '妇科疾病分类'),
('respiratory', '呼吸系统', '肺病', 1, '呼吸系统疾病分类'),
('cardiovascular', '心血管系统', '心病', 1, '心血管系统疾病分类'),
('tumor', '肿瘤疾病', '积聚', 1, '肿瘤疾病分类'),

-- 二级分类 - 消化系统
('digestive_gastritis', '胃炎', '胃痛', 2, '急慢性胃炎'),
('digestive_ulcer', '胃溃疡', '胃疡', 2, '胃及十二指肠溃疡'),
('digestive_ibs', '肠易激综合征', '腹痛泄泻', 2, '肠易激综合征'),
('digestive_constipation', '便秘', '便秘', 2, '功能性便秘'),
('digestive_diarrhea', '腹泻', '泄泻', 2, '急慢性腹泻'),

-- 二级分类 - 免疫代谢
('immune_diabetes', '糖尿病', '消渴', 2, '2型糖尿病'),
('immune_obesity', '肥胖症', '肥胖', 2, '单纯性肥胖'),
('immune_gout', '痛风', '痛风', 2, '痛风性关节炎'),
('immune_hyperlipidemia', '高脂血症', '痰浊', 2, '高脂血症'),
('immune_metabolic', '代谢综合征', '痰瘀', 2, '代谢综合征'),

-- 二级分类 - 情志神经
('emotion_insomnia', '失眠', '不寐', 2, '失眠症'),
('emotion_anxiety', '焦虑症', '郁证', 2, '焦虑障碍'),
('emotion_depression', '抑郁症', '癫狂', 2, '抑郁症'),
('emotion_headache', '头痛', '头痛', 2, '紧张性头痛、偏头痛'),
('emotion_migraine', '偏头痛', '头风', 2, '偏头痛'),

-- 二级分类 - 风湿免疫
('rheumatic_arthritis', '类风湿关节炎', '尪痹', 2, '类风湿关节炎'),
('rheumatic_osteoarthritis', '骨关节炎', '骨痹', 2, '退行性骨关节炎'),
('rheumatic_lumbar', '腰椎间盘突出', '腰痛', 2, '腰椎间盘突出症'),
('rheumatic_cervical', '颈椎病', '项痹', 2, '颈椎病'),
('rheumatic_gouty', '痛风性关节炎', '热痹', 2, '痛风性关节炎'),

-- 二级分类 - 妇科
('gynecological_dysmenorrhea', '痛经', '痛经', 2, '原发性痛经'),
('gynecological_irregular', '月经不调', '月经不调', 2, '月经失调'),
('gynecological_pms', '经前综合征', '经前综合征', 2, '经前紧张综合征'),
('gynecological_menopause', '更年期综合征', '绝经前后诸症', 2, '围绝经期综合征'),

-- 二级分类 - 呼吸系统
('respiratory_asthma', '哮喘', '哮病', 2, '支气管哮喘'),
('respiratory_cough', '慢性咳嗽', '咳嗽', 2, '慢性咳嗽'),
('respiratory_copd', '慢阻肺', '肺胀', 2, '慢性阻塞性肺疾病'),
('respiratory_allergy', '过敏性鼻炎', '鼻鼽', 2, '过敏性鼻炎'),

-- 二级分类 - 心血管
('cardiovascular_hypertension', '高血压', '眩晕', 2, '原发性高血压'),
('cardiovascular_angina', '心绞痛', '胸痹', 2, '心绞痛'),
('cardiovascular_arrhythmia', '心律失常', '心悸', 2, '心律失常'),

-- 二级分类 - 肿瘤
('tumor_lung', '肺癌', '肺癌', 2, '原发性肺癌'),
('tumor_liver', '肝癌', '肝癌', 2, '原发性肝癌'),
('tumor_stomach', '胃癌', '胃癌', 2, '胃癌'),
('tumor_colorectal', '结直肠癌', '肠癌', 2, '结直肠癌'),
('tumor_breast', '乳腺癌', '乳岩', 2, '乳腺癌')
ON CONFLICT (id) DO NOTHING;

-- 更新 formulas 表的 category 字段（将经方标记为 general）
UPDATE formulas
SET category = 'general',
    evidence_level = 'high'
WHERE source IN ('伤寒论', '金匮要略');

-- ============================================================================
-- 第四部分：创建视图（便于查询）
-- ============================================================================

-- 创建方剂详细信息视图
CREATE OR REPLACE VIEW v_formula_details AS
SELECT
    f.*,
    dc.name AS applicable_disease_names,
    ARRAY_AGG(DISTINCT dc.name) FILTER (WHERE dc.name IS NOT NULL) AS disease_list,
    COUNT(DISTINCT fe.id) AS evidence_count,
    AVG(fe.effectiveness) FILTER (WHERE fe.effectiveness IS NOT NULL) AS avg_effectiveness
FROM formulas f
LEFT JOIN formula_disease_relations fdr ON f.id = fdr.formula_id
LEFT JOIN disease_categories dc ON fdr.disease_category_id = dc.id
LEFT JOIN formula_evidence fe ON f.id = fe.formula_id
GROUP BY f.id;

-- 创建慢性病方剂推荐视图
CREATE OR REPLACE VIEW v_chronic_disease_recommendations AS
SELECT
    cdf.id,
    f.formula_name,
    f.source,
    f.mechanism,
    dc.name AS disease_name,
    dc.tcm_name AS tcm_disease_name,
    cdf.disease_stage,
    cdf.symptom_pattern,
    cdf.syndrome_type,
    cdf.dosage_adjustment,
    cdf.duration_notes,
    cdf.combination_formulas,
    fdr.efficacy_score,
    fdr.evidence_level
FROM chronic_disease_formulas cdf
JOIN formulas f ON cdf.formula_id = f.id
JOIN disease_categories dc ON cdf.disease_category_id = dc.id
LEFT JOIN formula_disease_relations fdr ON f.id = fdr.formula_id AND cdf.disease_category_id = fdr.disease_category_id
ORDER BY fdr.efficacy_score DESC;

-- ============================================================================
-- 第五部分：创建触发器（自动更新时间戳）
-- ============================================================================

-- 为所有表创建 updated_at 自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 应用触发器
CREATE TRIGGER update_disease_categories_updated_at BEFORE UPDATE ON disease_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formula_disease_relations_updated_at BEFORE UPDATE ON formula_disease_relations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chronic_disease_formulas_updated_at BEFORE UPDATE ON chronic_disease_formulas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formula_evidence_updated_at BEFORE UPDATE ON formula_evidence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 迁移完成
-- ============================================================================
SELECT 'Database migration completed successfully!' AS status;
