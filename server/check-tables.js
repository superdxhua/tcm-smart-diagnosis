require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const pg = require('pg');
const { Pool } = pg;

async function checkTables() {
  console.log('=== 检查数据库表结构 ===\n');
  
  // 使用 PostgreSQL 直接连接
  const connectionString = process.env.COZE_SUPABASE_URL;
  console.log('连接字符串:', connectionString);
  
  const pool = new Pool({ connectionString });
  
  try {
    const client = await pool.connect();
    console.log('✅ 数据库连接成功\n');
    
    // 查询所有表
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('数据库中的表:');
    result.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    client.release();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
