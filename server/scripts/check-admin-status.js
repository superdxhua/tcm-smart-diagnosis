const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = 'https://dwswtkfbtdohaftnklxx.supabase.co';
const publishableKey = 'sb_publishable_7DetJ-vZ99o_7_aprg_w-Q_NMc_nlgv';

const supabase = createClient(supabaseUrl, publishableKey);

async function checkAdminUser() {
  console.log('=== 检查 admin 用户状态 ===\n');

  try {
    // 1. 查询所有用户
    console.log('1. 查询所有用户...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.log('❌ 查询失败:', usersError.message);
      return;
    }

    console.log(`✅ 找到 ${users.length} 个用户:\n`);
    users.forEach((user, i) => {
      console.log(`${i + 1}. 用户名: ${user.username}`);
      console.log(`   角色: ${user.role}`);
      console.log(`   状态: ${user.is_active ? '激活' : '未激活'}`);
      console.log(`   密码哈希: ${user.password.substring(0, 30)}...`);
      console.log(`   创建时间: ${user.created_at}`);
      console.log('');
    });

    // 2. 检查 admin 用户
    console.log('2. 检查 admin 用户详情...');
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .maybeSingle();

    if (adminError) {
      console.log('❌ 查询 admin 失败:', adminError.message);
      return;
    }

    if (!adminUser) {
      console.log('❌ admin 用户不存在！');
      console.log('需要重新执行 SQL 初始化脚本');
      return;
    }

    console.log('✅ admin 用户存在:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   用户名: ${adminUser.username}`);
    console.log(`   角色: ${adminUser.role}`);
    console.log(`   激活状态: ${adminUser.is_active ? '✅ 已激活' : '❌ 未激活'}`);
    console.log(`   密码哈希: ${adminUser.password}`);
    console.log('');

    // 3. 检查用户权限
    console.log('3. 检查 admin 用户权限...');
    const { data: permissions, error: permError } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', adminUser.id);

    if (permError) {
      console.log('❌ 查询权限失败:', permError.message);
      return;
    }

    if (permissions.length === 0) {
      console.log('⚠️ admin 用户没有权限记录');
    } else {
      console.log(`✅ 找到 ${permissions.length} 条权限记录:`);
      permissions.forEach((perm, i) => {
        console.log(`${i + 1}. 激活: ${perm.is_active}, 到期: ${perm.expires_at || '无限制'}`);
      });
    }

    // 4. 测试登录接口
    console.log('\n4. 测试数据库查询...');
    const bcrypt = require('bcrypt');
    const testPassword = '123456';

    const isValid = await bcrypt.compare(testPassword, adminUser.password);
    console.log(`密码验证: ${isValid ? '✅ 密码正确' : '❌ 密码错误'}`);

    console.log('\n=== 诊断结果 ===');
    console.log(`admin 用户状态: ✅ 正常`);
    console.log(`密码状态: ${isValid ? '✅ 正确' : '❌ 错误'}`);
    console.log(`激活状态: ${adminUser.is_active ? '✅ 已激活' : '❌ 未激活'}`);
    console.log(`权限状态: ${permissions.length > 0 ? '✅ 有权限' : '⚠️ 无权限'}`);

    if (!isValid) {
      console.log('\n⚠️ 密码不匹配！需要重新设置密码');
      console.log('请在 SQL Editor 执行：');
      console.log(`
UPDATE users SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE username = 'admin';
      `);
    }

    if (!adminUser.is_active) {
      console.log('\n⚠️ admin 用户未激活！');
      console.log('请在 SQL Editor 执行：');
      console.log(`
UPDATE users SET is_active = true WHERE username = 'admin';
      `);
    }

    if (permissions.length === 0) {
      console.log('\n⚠️ admin 用户没有权限！');
      console.log('请在 SQL Editor 执行：');
      console.log(`
INSERT INTO user_permissions (id, user_id, is_active, created_at, updated_at)
SELECT gen_random_uuid(), id, true, NOW(), NOW()
FROM users WHERE username = 'admin';
      `);
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkAdminUser();
