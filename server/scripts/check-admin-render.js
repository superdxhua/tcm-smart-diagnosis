const { createClient } = require('@supabase/supabase-js');

// Render 环境数据库配置
const supabaseUrl = 'https://dwswtkfbtdohaftnklxx.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndResetAdmin() {
  try {
    console.log('=== 检查并重置 admin 用户（Render 环境）===');
    console.log('数据库 URL:', supabaseUrl);

    // 1. 查询 users 表结构
    console.log('\n1. 检查 users 表数据...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.log('❌ 查询失败:', usersError.message);
      console.log('可能的原因：');
      console.log('  - users 表不存在');
      console.log('  - ANON_KEY 权限不足');
      console.log('  - 表结构与预期不符');
      throw usersError;
    }

    console.log('✅ 查询成功，找到', users.length, '个用户');

    if (users.length === 0) {
      console.log('⚠️ users 表为空');
    } else {
      console.log('\n用户列表：');
      users.forEach(user => {
        console.log(`  - 用户名: ${user.username}, 角色: ${user.role}, 激活: ${user.is_active}`);
      });
    }

    // 2. 检查是否存在 admin 用户
    console.log('\n2. 检查 admin 用户...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin');

    if (adminError) {
      console.log('❌ 查询 admin 失败:', adminError.message);
      throw adminError;
    }

    if (adminUsers.length === 0) {
      console.log('⚠️ admin 用户不存在，需要创建');
    } else {
      console.log('✅ admin 用户存在');
      console.log('  当前信息：', JSON.stringify(adminUsers[0], null, 2));
    }

    // 3. 使用 Supabase Admin API 重置密码
    console.log('\n3. 尝试重置 admin 密码...');
    console.log('⚠️ 注意：ANON_KEY 可能没有更新权限');
    console.log('建议：使用 service_role key 在 Supabase Dashboard 中执行以下 SQL：');
    console.log('');

    const sqlUpdate = `-- 重置 admin 用户密码为 123456
UPDATE users
SET
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  is_active = true,
  updated_at = NOW()
WHERE username = 'admin';

-- 如果 admin 用户不存在，则创建
INSERT INTO users (username, password, role, is_active, created_at, updated_at)
SELECT
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'admin'
);`;

    console.log(sqlUpdate);

    console.log('\n=== 操作步骤 ===');
    console.log('请在 Supabase Dashboard 中执行以下操作：');
    console.log('');
    console.log('1. 访问 https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql');
    console.log('2. 打开 SQL Editor');
    console.log('3. 复制并运行上面的 SQL 语句');
    console.log('4. 执行成功后，admin 密码将被重置为 123456');
    console.log('');
    console.log('=== 替代方案 ===');
    console.log('如果上述方法不可行，请：');
    console.log('1. 检查 Render 环境变量是否包含 DATABASE_URL');
    console.log('2. 确认数据库连接配置是否正确');
    console.log('3. 联系 Supabase 支持获取 service_role key');

  } catch (error) {
    console.error('\n❌ 操作失败:', error.message);
    console.error('\n完整错误信息:', error);
    process.exit(1);
  }
}

checkAndResetAdmin();
