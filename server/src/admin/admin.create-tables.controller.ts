import { Controller, Post } from '@nestjs/common';
import { MedicalCasesService } from '../medical-cases/medical-cases.service';

@Controller('admin')
export class AdminCreateTablesController {
  constructor(private readonly medicalCasesService: MedicalCasesService) {}

  /**
   * 创建医案数据库表（仅用于初始化）
   * POST /api/admin/create-medical-cases-tables
   */
  @Post('create-medical-cases-tables')
  async createTables() {
    // 注意：这个方法不会真正创建表，因为 Supabase 表需要在数据库层面创建
    // 实际创建表需要：
    // 1. 在 Supabase 控制台的 SQL 编辑器中执行 SQL
    // 2. 或者使用 Supabase CLI: supabase db push

    return {
      code: 200,
      msg: '请手动在 Supabase 控制台中执行 SQL 脚本创建表',
      data: {
        instructions: [
          '1. 登录 Supabase 控制台',
          '2. 选择项目 -> SQL Editor',
          '3. 粘贴以下 SQL 并执行',
          '4. 等待表创建完成',
        ],
        sql: `
-- 创建 medical_cases 表
CREATE TABLE IF NOT EXISTS public.medical_cases (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_name VARCHAR(100) NOT NULL,
  doctor_era VARCHAR(50),
  patient_gender VARCHAR(10),
  patient_age INTEGER,
  main_symptoms TEXT NOT NULL,
  current_illness TEXT,
  past_history TEXT,
  tongue VARCHAR(200),
  pulse VARCHAR(200),
  diagnosis TEXT NOT NULL,
  prescription_name VARCHAR(200),
  prescription_composition TEXT,
  prescription_dosage TEXT,
  prescription_usage TEXT,
  treatment_result TEXT,
  notes TEXT,
  source VARCHAR(200),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  symptom_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  diagnosis_pattern VARCHAR(200),
  effectiveness_score NUMERIC(3, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 medical_case_feedback 表
CREATE TABLE IF NOT EXISTS public.medical_case_feedback (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36),
  success BOOLEAN NOT NULL,
  feedback_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_case FOREIGN KEY (case_id) REFERENCES public.medical_cases(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_medical_cases_doctor_name ON public.medical_cases(doctor_name);
CREATE INDEX IF NOT EXISTS idx_medical_cases_diagnosis ON public.medical_cases(diagnosis);
CREATE INDEX IF NOT EXISTS idx_medical_cases_tags ON public.medical_cases USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_medical_case_feedback_case_id ON public.medical_case_feedback(case_id);

-- 启用行级安全策略
ALTER TABLE public.medical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_case_feedback ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取医案数据
CREATE POLICY IF NOT EXISTS "Allow public read access" ON public.medical_cases FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access" ON public.medical_case_feedback FOR SELECT USING (true);

-- 允许认证用户插入医案
CREATE POLICY IF NOT EXISTS "Allow authenticated insert" ON public.medical_cases FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow authenticated insert" ON public.medical_case_feedback FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 允许认证用户更新医案
CREATE POLICY IF NOT EXISTS "Allow authenticated update" ON public.medical_cases FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow authenticated update" ON public.medical_case_feedback FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 允许认证用户删除医案
CREATE POLICY IF NOT EXISTS "Allow authenticated delete" ON public.medical_cases FOR DELETE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Allow authenticated delete" ON public.medical_case_feedback FOR DELETE USING (auth.uid() IS NOT NULL);
        `.trim(),
      },
    };
  }
}
