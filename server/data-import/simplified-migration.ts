/**
 * 简化的数据库迁移脚本
 * 只创建缺失的表
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

// Supabase 配置
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 尝试创建表的 SQL 语句
 */
const createTableStatements = [
  // 1. 扩展 formulas 表
  `ALTER TABLE formulas
   ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
   ADD COLUMN IF NOT EXISTS applicable_diseases TEXT[],
   ADD COLUMN IF NOT EXISTS applicable_syndromes TEXT[],
   ADD COLUMN IF NOT EXISTS evidence_level VARCHAR(20) DEFAULT 'medium',
   ADD COLUMN IF NOT EXISTS clinical_usage_count INTEGER DEFAULT 0;`,

  // 2. 创建方剂-疾病关联表
  `CREATE TABLE IF NOT EXISTS formula_disease_relations (
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
   );`,

  `CREATE INDEX IF NOT EXISTS idx_formula_disease_relations_formula_id ON formula_disease_relations(formula_id);`,
  `CREATE INDEX IF NOT EXISTS idx_formula_disease_relations_disease_id ON formula_disease_relations(disease_category_id);`,
  `CREATE INDEX IF NOT EXISTS idx_formula_disease_relations_efficacy ON formula_disease_relations(efficacy_score DESC);`,

  // 3. 创建慢性病专用配置表
  `CREATE TABLE IF NOT EXISTS chronic_disease_formulas (
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
   );`,

  `CREATE INDEX IF NOT EXISTS idx_chronic_disease_formulas_formula_id ON chronic_disease_formulas(formula_id);`,
  `CREATE INDEX IF NOT EXISTS idx_chronic_disease_formulas_disease_id ON chronic_disease_formulas(disease_category_id);`,
  `CREATE INDEX IF NOT EXISTS idx_chronic_disease_formulas_stage ON chronic_disease_formulas(disease_stage);`,

  // 4. 创建循证医学证据表
  `CREATE TABLE IF NOT EXISTS formula_evidence (
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
   );`,

  `CREATE INDEX IF NOT EXISTS idx_formula_evidence_formula_id ON formula_evidence(formula_id);`,
  `CREATE INDEX IF NOT EXISTS idx_formula_evidence_disease_id ON formula_evidence(disease_category_id);`,
  `CREATE INDEX IF NOT EXISTS idx_formula_evidence_type ON formula_evidence(evidence_type);`,

  // 5. 扩展 tumor_formula_relations 表
  `ALTER TABLE tumor_formula_relations
   ADD COLUMN IF NOT EXISTS efficacy_notes TEXT,
   ADD COLUMN IF NOT EXISTS clinical_evidence TEXT[],
   ADD COLUMN IF NOT EXISTS evidence_level VARCHAR(20) DEFAULT 'medium';`
];

/**
 * 执行迁移说明
 */
function printInstructions() {
  console.log('⚠️  由于 Supabase REST API 权限限制，无法自动执行数据库迁移。\n');
  console.log('请按照以下步骤手动执行迁移：\n');
  console.log('方法一：通过 Supabase Dashboard');
  console.log('================================');
  console.log('1. 登录 Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. 选择你的项目');
  console.log('3. 点击 "SQL Editor" -> "New Query"');
  console.log('4. 复制以下 SQL 语句并执行：\n');
  
  console.log('-- 创建表 SQL 语句'.repeat(40));
  createTableStatements.forEach((stmt, index) => {
    console.log(`-- 语句 ${index + 1}`);
    console.log(stmt);
    console.log();
  });
  console.log('-- SQL 语句结束'.repeat(40));
  
  console.log('\n方法二：使用 psql 命令行工具');
  console.log('================================');
  console.log('将上述 SQL 语句保存到文件 migration.sql，然后执行：');
  console.log('  psql [数据库连接字符串] -f migration.sql');
  
  console.log('\n迁移完成后，执行数据导入：');
  console.log('  npx tsx data-import/import-data.ts');
}

printInstructions();
