-- 修复慢性病关联表：将 formula_id 从 INTEGER 改为 UUID

-- 删除旧表（如果存在）
DROP TABLE IF EXISTS formula_chronic_relations CASCADE;

-- 重新创建表，使用 UUID 类型
CREATE TABLE formula_chronic_relations (
  id SERIAL PRIMARY KEY,
  formula_id UUID NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  chronic_disease_id INTEGER NOT NULL REFERENCES chronic_diseases(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,                 -- 优先级（0-10）
  indication TEXT,                            -- 适应症描述
  contraindication TEXT,                      -- 禁忌症
  dosage_adjustment TEXT,                     -- 剂量调整建议
  duration INTEGER,                           -- 建议疗程（天）
  UNIQUE(formula_id, chronic_disease_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS formula_chronic_relations_formula_idx ON formula_chronic_relations(formula_id);
CREATE INDEX IF NOT EXISTS formula_chronic_relations_chronic_idx ON formula_chronic_relations(chronic_disease_id);
CREATE INDEX IF NOT EXISTS formula_chronic_relations_priority_idx ON formula_chronic_relations(priority DESC);

-- 添加注释
COMMENT ON TABLE formula_chronic_relations IS '方证与慢性病关联表';
