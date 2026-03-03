# 如何创建 Supabase 医案表

## 步骤说明

1. **登录 Supabase 控制台**
   - 访问 https://supabase.com
   - 使用您的账户登录

2. **选择您的项目**
   - 点击您当前使用的项目

3. **打开 SQL Editor**
   - 在左侧导航栏中找到 "SQL Editor"
   - 点击进入

4. **创建新查询**
   - 点击 "New query" 按钮

5. **执行 SQL 脚本**
   - 将下方的 SQL 脚本复制粘贴到编辑器中
   - 点击 "Run" 按钮执行

6. **验证表创建成功**
   - 在左侧导航栏中找到 "Table Editor"
   - 应该能看到 `medical_cases` 和 `medical_case_feedback` 表

7. **刷新页面**
   - 回到小程序页面，点击"重试"按钮
   - 或直接刷新页面

## SQL 脚本

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

## 常见问题

### Q: 执行 SQL 时报错 "relation does not exist"？
A: 这是因为 Supabase 没有使用 `gen_random_uuid()` 函数。请使用以下 SQL 创建表：

```sql
-- 替代方案：使用 uuid_generate_v4() 函数
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建 medical_cases 表
CREATE TABLE IF NOT EXISTS public.medical_cases (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 其他字段与上方相同
  ...
);
```

### Q: 执行 SQL 后还是看不到数据？
A: 表创建成功后，需要调用初始化接口插入数据：
```bash
curl -X POST 'http://localhost:3000/api/admin/init-medical-cases'
```

### Q: 如何验证表是否创建成功？
A: 在 Supabase 控制台中，点击左侧导航栏的 "Table Editor"，查看是否存在 `medical_cases` 和 `medical_case_feedback` 表。

## 下一步

表创建完成后，刷新小程序页面，应该能看到以下选项：
- 如果表为空，会显示"暂无医案数据"
- 点击刷新或重新搜索即可
