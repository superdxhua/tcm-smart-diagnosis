-- ============================================================================
-- 创建缺失的数据库表
-- ============================================================================
-- 注意：此脚本需要在 Supabase Dashboard 的 SQL Editor 中手动执行
-- 或者使用 psql 命令行工具执行
-- ============================================================================

-- ============================================================================
-- 第一部分：扩展现有表
-- ============================================================================

-- 1. 扩展 formulas 表
ALTER TABLE formulas
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS applicable_diseases TEXT[],
ADD COLUMN IF NOT EXISTS applicable_syndromes TEXT[],
ADD COLUMN IF NOT EXISTS evidence_level VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS clinical_usage_count INTEGER DEFAULT 0;

-- 2. 扩展 tumor_formula_relations 表
ALTER TABLE tumor_formula_relations
ADD COLUMN IF NOT EXISTS efficacy_notes TEXT,
ADD COLUMN IF NOT EXISTS clinical_evidence TEXT[],
ADD COLUMN IF NOT EXISTS evidence_level VARCHAR(20) DEFAULT 'medium';

-- ============================================================================
-- 第二部分：创建新表
-- ============================================================================

-- 3. 创建方剂-疾病关联表
CREATE TABLE IF NOT EXISTS formula_disease_relations (
  id VARCHAR(50) PRIMARY KEY,
  formula_id VARCHAR(50) NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  disease_category_id VARCHAR(50) NOT NULL REFERENCES disease_categories(id) ON DELETE CASCADE,
  efficacy_score DECIMAL(3,2) DEFAULT 0.50 CHECK (efficacy_score >= 0 AND efficacy_score <= 1),
  evidence_level VARCHAR(20) DEFAULT 'medium' CHECK (evidence_level IN ('high', 'medium', 'low')),
  evidence_sources TEXT[],
  clinical_cases_count INTEGER DEFAULT 0,
  clinical_effectiveness DECIMAL(3,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(formula_id, disease_category_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_formula_disease_relations_formula_id ON formula_disease_relations(formula_id);
CREATE INDEX IF NOT EXISTS idx_formula_disease_relations_disease_id ON formula_disease_relations(disease_category_id);
CREATE INDEX IF NOT EXISTS idx_formula_disease_relations_efficacy ON formula_disease_relations(efficacy_score DESC);

-- 4. 创建慢性病专用配置表
CREATE TABLE IF NOT EXISTS chronic_disease_formulas (
  id VARCHAR(50) PRIMARY KEY,
  formula_id VARCHAR(50) NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  disease_category_id VARCHAR(50) NOT NULL REFERENCES disease_categories(id) ON DELETE CASCADE,
  disease_stage VARCHAR(50) CHECK (disease_stage IN ('early', 'middle', 'late', 'all')),
  symptom_pattern VARCHAR(100),
  syndrome_type VARCHAR(100),
  dosage_adjustment TEXT,
  duration_notes TEXT,
  combination_formulas TEXT[],
  contraindications TEXT[],
  special_cautions TEXT[],
  lifestyle_advice JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(formula_id, disease_category_id, disease_stage, symptom_pattern)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chronic_disease_formulas_formula_id ON chronic_disease_formulas(formula_id);
CREATE INDEX IF NOT EXISTS idx_chronic_disease_formulas_disease_id ON chronic_disease_formulas(disease_category_id);
CREATE INDEX IF NOT EXISTS idx_chronic_disease_formulas_stage ON chronic_disease_formulas(disease_stage);

-- 5. 创建循证医学证据表
CREATE TABLE IF NOT EXISTS formula_evidence (
  id VARCHAR(50) PRIMARY KEY,
  formula_id VARCHAR(50) NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  disease_category_id VARCHAR(50) REFERENCES disease_categories(id) ON DELETE CASCADE,
  evidence_type VARCHAR(50) CHECK (evidence_type IN ('clinical_trial', 'meta_analysis', 'case_study', 'review', 'expert_opinion')),
  title VARCHAR(200) NOT NULL,
  authors TEXT,
  source VARCHAR(100),
  year INTEGER,
  volume VARCHAR(20),
  issue VARCHAR(20),
  pages VARCHAR(50),
  doi VARCHAR(100),
  sample_size INTEGER,
  effectiveness DECIMAL(3,2),
  p_value DECIMAL(10,6),
  confidence_interval VARCHAR(50),
  url TEXT,
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

-- ============================================================================
-- 迁移完成
-- ============================================================================
SELECT 'Table creation completed successfully!' AS status;
