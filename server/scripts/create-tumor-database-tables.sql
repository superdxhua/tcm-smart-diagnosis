-- ========================================
-- 肿瘤患者经方数据库表结构
-- ========================================

-- 1. 肿瘤患者体质分类表
CREATE TABLE IF NOT EXISTS tumor_constitutions (
  id SERIAL PRIMARY KEY,
  constitution_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  meridian_basis VARCHAR(50) NOT NULL,           -- 六经底色（太阳/阳明/少阳/太阴/少阴/厥阴）
  tongue_features TEXT[],                        -- 舌象特征
  pulse_features TEXT[],                         -- 脉象特征
  typical_symptoms TEXT[],                       -- 典型症状
  syndrome_combinations TEXT[],                  -- 常见证型组合
  description TEXT,                              -- 详细描述
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 肿瘤病机分类表
CREATE TABLE IF NOT EXISTS tumor_pathogenesis (
  id SERIAL PRIMARY KEY,
  pathogenesis_id VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,                 -- 病机类别（瘀血/痰饮/气滞/毒热）
  meridian_type VARCHAR(50) NOT NULL,            -- 六经归属
  description TEXT,                              -- 病机描述
  typical_manifestations TEXT[],                 -- 典型表现
  treatment_principle TEXT,                      -- 治则
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. 现代治疗变证表
CREATE TABLE IF NOT EXISTS treatment_complications (
  id SERIAL PRIMARY KEY,
  complication_id VARCHAR(50) UNIQUE NOT NULL,
  treatment_type VARCHAR(50) NOT NULL,           -- 治疗类型（手术/化疗/放疗/靶向/免疫）
  complication_name VARCHAR(100) NOT NULL,
  meridian_type VARCHAR(50) NOT NULL,            -- 六经归属
  core_pathogenesis TEXT[],                      -- 核心病机
  key_symptoms TEXT[],                           -- 关键症状
  time_window VARCHAR(50),                       -- 发生时间窗口
  severity VARCHAR(20),                          -- 严重程度（轻/中/重）
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. 肿瘤症状支持表
CREATE TABLE IF NOT EXISTS symptom_support_formulas (
  id SERIAL PRIMARY KEY,
  symptom_id VARCHAR(50) UNIQUE NOT NULL,
  symptom_name VARCHAR(100) NOT NULL,
  symptom_category VARCHAR(50) NOT NULL,         -- 症状类别（疼痛/呃逆/水肿/失眠等）
  recommended_formula VARCHAR(100) NOT NULL,
  formula_source VARCHAR(100),
  evidence TEXT,                                 -- 依据条文
  meridian_type VARCHAR(50),
  safety_level VARCHAR(10),                      -- 安全等级（A/B/C）
  dosage_adjustment TEXT,
  contraindications TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. 肿瘤经方库（复用 formulas 表，添加肿瘤相关字段）
-- 注意：这里我们将在现有的 formulas 表基础上，添加肿瘤特定字段

-- 6. 肿瘤方证关联表
CREATE TABLE IF NOT EXISTS tumor_formula_relations (
  id SERIAL PRIMARY KEY,
  formula_id UUID REFERENCES formulas(id) ON DELETE CASCADE,
  constitution_id VARCHAR(50) REFERENCES tumor_constitutions(constitution_id),
  pathogenesis_id VARCHAR(50) REFERENCES tumor_pathogenesis(pathogenesis_id),
  complication_id VARCHAR(50) REFERENCES treatment_complications(complication_id),
  symptom_id VARCHAR(50) REFERENCES symptom_support_formulas(symptom_id),
  priority INTEGER DEFAULT 0,                    -- 优先级
  indication TEXT,                               -- 适应症描述
  dosage_adjustment TEXT,                        -- 剂量调整
  duration VARCHAR(50),                          -- 疗程
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. 药物安全检查表
CREATE TABLE IF NOT EXISTS drug_safety_checks (
  id SERIAL PRIMARY KEY,
  formula_id UUID REFERENCES formulas(id) ON DELETE CASCADE,
  herb_name VARCHAR(100) NOT NULL,
  toxicity_level VARCHAR(20),                    -- 毒性等级（无毒/小毒/有毒/大毒）
  max_dosage VARCHAR(50),                        -- 最大剂量
  decoction_requirements TEXT,                  -- 煎煮要求
  interactions TEXT[],                           -- 药物相互作用
  contraindications TEXT[],
  warning_level VARCHAR(10),                     -- 警告等级（A/B/C/D）
  hospital_only BOOLEAN DEFAULT FALSE,           -- 是否仅限医院使用
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. 现代药物相互作用表
CREATE TABLE IF NOT EXISTS modern_drug_interactions (
  id SERIAL PRIMARY KEY,
  herb_name VARCHAR(100) NOT NULL,
  modern_drug VARCHAR(100) NOT NULL,             -- 现代药物
  interaction_type VARCHAR(50),                  -- 相互作用类型
  severity VARCHAR(20),                          -- 严重程度（轻/中/重）
  mechanism TEXT,                                -- 作用机制
  recommendation TEXT,                           -- 建议
  evidence_source TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 创建索引
-- ========================================

-- 体质表索引
CREATE INDEX IF NOT EXISTS tumor_constitutions_meridian_idx ON tumor_constitutions(meridian_basis);

-- 病机表索引
CREATE INDEX IF NOT EXISTS tumor_pathogenesis_category_idx ON tumor_pathogenesis(category);
CREATE INDEX IF NOT EXISTS tumor_pathogenesis_meridian_idx ON tumor_pathogenesis(meridian_type);

-- 变证表索引
CREATE INDEX IF NOT EXISTS treatment_complications_type_idx ON treatment_complications(treatment_type);
CREATE INDEX IF NOT EXISTS treatment_complications_meridian_idx ON treatment_complications(meridian_type);

-- 症状支持表索引
CREATE INDEX IF NOT EXISTS symptom_support_category_idx ON symptom_support_formulas(symptom_category);

-- 方证关联表索引
CREATE INDEX IF NOT EXISTS tumor_formula_relations_formula_idx ON tumor_formula_relations(formula_id);
CREATE INDEX IF NOT EXISTS tumor_formula_relations_constitution_idx ON tumor_formula_relations(constitution_id);
CREATE INDEX IF NOT EXISTS tumor_formula_relations_pathogenesis_idx ON tumor_formula_relations(pathogenesis_id);
CREATE INDEX IF NOT EXISTS tumor_formula_relations_complication_idx ON tumor_formula_relations(complication_id);
CREATE INDEX IF NOT EXISTS tumor_formula_relations_symptom_idx ON tumor_formula_relations(symptom_id);

-- 药物安全检查表索引
CREATE INDEX IF NOT EXISTS drug_safety_checks_formula_idx ON drug_safety_checks(formula_id);
CREATE INDEX IF NOT EXISTS drug_safety_checks_herb_idx ON drug_safety_checks(herb_name);

-- 现代药物相互作用表索引
CREATE INDEX IF NOT EXISTS modern_drug_interactions_herb_idx ON modern_drug_interactions(herb_name);
CREATE INDEX IF NOT EXISTS modern_drug_interactions_drug_idx ON modern_drug_interactions(modern_drug);

-- ========================================
-- 添加注释
-- ========================================

COMMENT ON TABLE tumor_constitutions IS '肿瘤患者体质分类表';
COMMENT ON TABLE tumor_pathogenesis IS '肿瘤病机分类表';
COMMENT ON TABLE treatment_complications IS '现代治疗变证表';
COMMENT ON TABLE symptom_support_formulas IS '肿瘤症状支持表';
COMMENT ON TABLE tumor_formula_relations IS '肿瘤方证关联表';
COMMENT ON TABLE drug_safety_checks IS '药物安全检查表';
COMMENT ON TABLE modern_drug_interactions IS '现代药物相互作用表';
