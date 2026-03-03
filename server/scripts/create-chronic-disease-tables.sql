-- 慢性病分类表
CREATE TABLE IF NOT EXISTS chronic_diseases (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,           -- 疾病编码
  name VARCHAR(100) NOT NULL,                 -- 疾病名称
  category VARCHAR(50) NOT NULL,              -- 大类别
  description TEXT,                           -- 疾病描述
  core_mechanism TEXT,                        -- 核心病机
  treatment_principle TEXT,                   -- 治则
  precautions TEXT,                           -- 注意事项
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 方证与慢性病关联表
CREATE TABLE IF NOT EXISTS formula_chronic_relations (
  id SERIAL PRIMARY KEY,
  formula_id INTEGER NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  chronic_disease_id INTEGER NOT NULL REFERENCES chronic_diseases(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,                 -- 优先级（0-10）
  indication TEXT,                            -- 适应症描述
  contraindication TEXT,                      -- 禁忌症
  dosage_adjustment TEXT,                     -- 剂量调整建议
  duration INTEGER,                           -- 建议疗程（天）
  UNIQUE(formula_id, chronic_disease_id)
);

-- 慢性病症状表
CREATE TABLE IF NOT EXISTS chronic_disease_symptoms (
  id SERIAL PRIMARY KEY,
  chronic_disease_id INTEGER NOT NULL REFERENCES chronic_diseases(id) ON DELETE CASCADE,
  symptom_name VARCHAR(100) NOT NULL,
  symptom_type VARCHAR(20),                   -- 主要/次要/伴随
  frequency VARCHAR(20),                      -- 常见/偶见/罕见
  description TEXT
);

-- 调养建议表
CREATE TABLE IF NOT EXISTS nursing_recommendations (
  id SERIAL PRIMARY KEY,
  chronic_disease_id INTEGER NOT NULL REFERENCES chronic_diseases(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(20),            -- 饮食/起居/情志/运动
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 0
);

-- 创建索引
CREATE INDEX IF NOT EXISTS chronic_diseases_category_idx ON chronic_diseases(category);
CREATE INDEX IF NOT EXISTS formula_chronic_relations_formula_idx ON formula_chronic_relations(formula_id);
CREATE INDEX IF NOT EXISTS formula_chronic_relations_chronic_idx ON formula_chronic_relations(chronic_disease_id);
CREATE INDEX IF NOT EXISTS formula_chronic_relations_priority_idx ON formula_chronic_relations(priority DESC);
CREATE INDEX IF NOT EXISTS chronic_disease_symptoms_chronic_idx ON chronic_disease_symptoms(chronic_disease_id);
CREATE INDEX IF NOT EXISTS nursing_recommendations_chronic_idx ON nursing_recommendations(chronic_disease_id);

-- 添加注释
COMMENT ON TABLE chronic_diseases IS '慢性病分类表';
COMMENT ON TABLE formula_chronic_relations IS '方证与慢性病关联表';
COMMENT ON TABLE chronic_disease_symptoms IS '慢性病症状表';
COMMENT ON TABLE nursing_recommendations IS '调养建议表';
