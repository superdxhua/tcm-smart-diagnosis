require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const pg = require('pg');
const { Pool } = pg;

async function checkTables() {
  console.log('=== 检查 COZE 数据库 ===\n');
  
  const url = process.env.COZE_SUPABASE_URL;
  console.log('COZE_SUPABASE_URL:', url);
  
  // 提取连接字符串
  const connectionString = url + '?apikey=' + process.env.COZE_SUPABASE_ANON_KEY;
  console.log('连接字符串:', connectionString.substring(0, 80) + '...\n');
  
  const supabase = createClient(url, process.env.COZE_SUPABASE_ANON_KEY);
  
  // 尝试查询用户表
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ users 表不存在或查询失败:', error.message);
  } else {
    console.log('✅ users 表存在');
    console.log('用户数量:', data.length);
    if (data.length > 0) {
      console.log('示例用户:', data[0]);
    }
  }
}

checkTables();
