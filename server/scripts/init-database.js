const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Render 环境数据库配置
const supabaseUrl = 'https://dwswtkfbtdohaftnklxx.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  try {
    console.log('=== 初始化 Render 环境数据库 ===');
    console.log('数据库 URL:', supabaseUrl);

    // 读取 SQL 文件
    const sqlFile = path.join(__dirname, 'init-database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('\n执行 SQL 初始化...');
    console.log('SQL 内容预览:', sql.substring(0, 200) + '...');

    // Supabase REST API 不支持直接执行 SQL
    // 需要通过 Supabase Dashboard 或者使用 service_role key 执行
    console.log('\n⚠️ 注意：Supabase REST API 无法直接执行 SQL');
    console.log('请通过以下方式初始化数据库：');
    console.log('');
    console.log('方法 1: 通过 Supabase Dashboard');
    console.log('  1. 访问 https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql');
    console.log('  2. 打开 SQL Editor');
    console.log('  3. 复制并运行 init-database.sql 文件中的 SQL 语句');
    console.log('');
    console.log('方法 2: 使用 Supabase CLI');
    console.log('  supabase db push --db-url "postgresql://postgres.dwswtkfbtdohaftnklxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"');
    console.log('');
    console.log('init-database.sql 文件位置:', sqlFile);
    console.log('');

    // 检查表是否已存在
    console.log('检查数据库表...');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.log('❌ users 表不存在，需要初始化');
        console.log('错误:', error.message);
      } else {
        console.log('✅ users 表已存在，记录数:', data);
      }
    } catch (e) {
      console.log('❌ 检查失败:', e.message);
    }

    console.log('\n=== 初始化说明 ===');
    console.log('SQL 文件包含以下内容：');
    console.log('  1. 创建 users 表');
    console.log('  2. 创建 user_permissions 表');
    console.log('  3. 创建必要的索引');
    console.log('  4. 插入默认 admin 用户（密码: 123456）');

    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  }
}

initDatabase();
