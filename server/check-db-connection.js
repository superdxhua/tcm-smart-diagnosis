/**
 * 检查后端实际连接的数据库
 */
require('dotenv').config({ path: '/workspace/projects/.env' });

const supabaseUrl = process.env.COZE_SUPABASE_URL;
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY;

console.log('=== 检查后端数据库连接 ===\n');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? '已配置' : '未配置');

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
  try {
    console.log('\n=== 查询 admin 用户 ===');
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin');

    console.log('查询结果:', users);
    console.log('查询错误:', error);

    if (users && users.length > 0) {
      console.log('\n✅ 后端数据库中有 admin 用户');
      console.log('用户信息:', users[0]);
    } else {
      console.log('\n❌ 后端数据库中没有 admin 用户');
    }
  } catch (error) {
    console.error('检查失败:', error);
  }
}

checkAdmin();
