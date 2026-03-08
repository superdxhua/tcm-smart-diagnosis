-- 创建健康记录函数
-- 请在 Supabase SQL Editor 中执行此 SQL

-- 1. 首先确保 health_records 表存在（如果不存在则创建）
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  consultant_id UUID,
  visit_number INTEGER DEFAULT 1,
  chief_complaint TEXT,
  history TEXT,
  past_history TEXT,
  analysis_result TEXT,
  differentiation TEXT,
  treatment_principle TEXT,
  health_plan TEXT,
  advice TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 启用RLS但允许所有操作（根据需要调整）
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- 3. 创建函数来插入健康记录
CREATE OR REPLACE FUNCTION create_health_record_with_transaction(
  p_member_id UUID,
  p_consultant_id UUID DEFAULT NULL,
  p_chief_complaint TEXT DEFAULT NULL,
  p_history TEXT DEFAULT NULL,
  p_past_history TEXT DEFAULT NULL,
  p_differentiation TEXT DEFAULT NULL,
  p_treatment_principle TEXT DEFAULT NULL,
  p_health_plan TEXT DEFAULT NULL,
  p_advice TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  member_id UUID,
  consultant_id UUID,
  chief_complaint TEXT,
  history TEXT,
  past_history TEXT,
  differentiation TEXT,
  treatment_principle TEXT,
  health_plan TEXT,
  advice TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_record_id UUID;
BEGIN
  INSERT INTO health_records (
    member_id,
    consultant_id,
    chief_complaint,
    history,
    past_history,
    differentiation,
    treatment_principle,
    health_plan,
    advice,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_member_id,
    COALESCE(p_consultant_id, p_member_id),
    p_chief_complaint,
    p_history,
    p_past_history,
    p_differentiation,
    p_treatment_principle,
    p_health_plan,
    p_advice,
    'active',
    NOW(),
    NOW()
  )
  RETURNING id INTO new_record_id;

  RETURN QUERY
  SELECT * FROM health_records WHERE id = new_record_id;
END;
$$;

-- 4. 授权所有用户执行此函数
GRANT EXECUTE ON FUNCTION create_health_record_with_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION create_health_record_with_transaction TO anon;
GRANT EXECUTE ON FUNCTION create_health_record_with_transaction TO service_role;

-- 5. 为 health_records 表添加必要的权限
GRANT SELECT, INSERT, UPDATE, DELETE ON health_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON health_records TO anon;

-- 6. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_health_records_member_id ON health_records(member_id);
CREATE INDEX IF NOT EXISTS idx_health_records_consultant_id ON health_records(consultant_id);
CREATE INDEX IF NOT EXISTS idx_health_records_created_at ON health_records(created_at DESC);
