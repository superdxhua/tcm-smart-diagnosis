/**
 * 执行 SQL 脚本创建健康记录函数
 * 运行方式: node scripts/create-health-record-function.js
 */
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

// 创建连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const sql = `
-- 创建健康记录表（如果不存在）
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

-- 启用RLS
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- 创建函数来插入健康记录
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

-- 授权
GRANT EXECUTE ON FUNCTION create_health_record_with_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION create_health_record_with_transaction TO anon;
GRANT EXECUTE ON FUNCTION create_health_record_with_transaction TO service_role;

-- 授予表权限
GRANT SELECT, INSERT, UPDATE, DELETE ON health_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON health_records TO anon;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_health_records_member_id ON health_records(member_id);
CREATE INDEX IF NOT EXISTS idx_health_records_consultant_id ON health_records(consultant_id);
CREATE INDEX IF NOT EXISTS idx_health_records_created_at ON health_records(created_at DESC);
`;

async function main() {
  console.log('开始创建健康记录函数...');

  try {
    // 测试连接
    const client = await pool.connect();
    console.log('✅ 数据库连接成功');

    // 执行 SQL
    await client.query(sql);
    console.log('✅ SQL 执行成功');

    // 验证函数是否存在
    const result = await client.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_name = 'create_health_record_with_transaction'
    `);

    if (result.rows.length > 0) {
      console.log('✅ 函数创建成功:', result.rows[0].routine_name);
    } else {
      console.log('⚠️ 函数可能未创建，请检查');
    }

    client.release();
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await pool.end();
  }
}

main();
