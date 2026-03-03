# Supabase 医案表创建指南

## 问题描述

如果使用医案库功能时出现 `Could not find the table 'public.medical_cases' in the schema cache` 错误，说明数据库中还没有创建医案相关的表。

## 解决方案

### 方法 1：在 Supabase 控制台中创建（推荐）

1. 登录 Supabase 控制台：https://supabase.com/dashboard
2. 选择你的项目
3. 点击左侧菜单的 "SQL Editor"
4. 点击 "New query" 创建新查询
5. 粘贴以下 SQL 并点击 "Run" 执行：

```sql
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
```

6. 等待执行完成，确认没有错误

### 方法 2：使用 API 接口获取 SQL（临时方案）

你也可以调用后端接口来获取 SQL 脚本：

```bash
# 获取创建表的 SQL 脚本
curl -X GET http://localhost:3000/api/admin/create-medical-cases-tables \
  -H "Content-Type: application/json"
```

### 方法 3：初始化医案数据（需要先创建表）

表创建完成后，调用初始化接口添加示例医案数据：

```bash
# 初始化医案数据
TOKEN="your_token_here"
curl -X POST http://localhost:3000/api/admin/init-medical-cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}"
```

## 验证表创建成功

在 Supabase 控制台中：

1. 点击左侧菜单的 "Table Editor"
2. 应该能看到 `public.medical_cases` 和 `public.medical_case_feedback` 两个表
3. 点击 `medical_cases` 表，应该能看到空的表格（或者已初始化的数据）

## 常见问题

### Q1: 执行 SQL 时提示权限不足

**A**: 确保你使用的是 Supabase 项目的所有者账号登录，或者具有足够的权限。

### Q2: 表创建成功但接口仍报错

**A**: 尝试重启后端服务：

```bash
cd /workspace/projects && coze dev
```

### Q3: 初始化医案数据失败

**A**: 确保你已经：
1. 成功创建了 `medical_cases` 表
2. 设置了正确的认证 token
3. 检查后端日志是否有更详细的错误信息

## 后续步骤

表创建成功后，你可以：

1. 在小程序中使用医案库功能
2. 添加、搜索、分析医案
3. 使用 AI 匹配相似医案
4. 基于医案推荐处方

## 技术支持

如果遇到其他问题，请检查：

1. 后端日志：`tail -f /tmp/coze-logs/dev.log`
2. 前端控制台日志
3. Supabase 控制台的日志
