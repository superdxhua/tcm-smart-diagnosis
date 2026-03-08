#!/usr/bin/env node

/**
 * 执行 SQL 脚本创建健康记录函数
 * 使用 Node.js 内置模块，无需额外依赖
 */

const https = require('https');

// Supabase 配置
const SUPABASE_URL = 'https://dwswtkfbtdohaftnklxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c3d0a2ZidGRvaGFmdG5rbHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDQ3ODYsImV4cCI6MjA4Njg4MDc4Nn0.Q7Psovx5MPPd_q8kEKgQejvfZvZOzQXxtIG1apJrt90';

// SQL 语句
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

// 将 SQL 转为单行（PostgREST 需要）
const sqlArray = sql.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.startsWith('--'));

// 使用 postgREST 的 exec_sql 需要先将 SQL 编码
// 由于无法直接执行 SQL，我们尝试通过不同的方式

// 方案1：创建表
const createTableSQL = `
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
`;

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function main() {
  console.log('开始创建健康记录函数...\n');

  // 1. 先尝试直接插入一条记录来触发表创建
  // 由于没有直接的 RPC 执行 SQL 的方法，我们尝试通过直接插入

  const testData = {
    member_id: '00000000-0000-0000-0000-000000000001',
    chief_complaint: '测试'
  };

  console.log('尝试通过直接插入测试健康记录...');

  try {
    // 尝试插入数据（这会失败因为表可能不存在，但可以确认 API 可用）
    const response = await makeRequest({
      hostname: 'dwswtkfbtdohaftnklxx.supabase.co',
      port: 443,
      path: '/rest/v1/health_records',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    }, JSON.stringify(testData));

    console.log('响应状态:', response.status);
    console.log('响应内容:', response.body);

    if (response.status === 201 || response.status === 200) {
      console.log('✅ 插入成功！表已存在');
    } else if (response.body.includes('relation') || response.body.includes('does not exist')) {
      console.log('❌ 表不存在，需要手动创建');
      console.log('\n请在 Supabase SQL Editor 中执行以下 SQL:\n');
      console.log('==========================================');
      console.log(sql);
      console.log('==========================================\n');
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

main();
