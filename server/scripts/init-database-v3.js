const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// 使用新的 publishable key
const supabaseUrl = 'https://dwswtkfbtdohaftnklxx.supabase.co';
const publishableKey = 'sb_publishable_7DetJ-vZ99o_7_aprg_w-Q_NMc_nlgv';

console.log('=== 使用新的 Publishable Key 初始化数据库 ===\n');
console.log('URL:', supabaseUrl);
console.log('Key:', publishableKey.substring(0, 30) + '...\n');

async function initDatabase() {
  try {
    // 创建客户端
    const supabase = createClient(supabaseUrl, publishableKey);

    // 测试连接
    console.log('1. 测试数据库连接...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      console.log('❌ 连接失败:', testError.message);
      throw testError;
    }
    console.log('✅ 连接成功！当前用户数:', testData || 0);

    // 步骤 1: 创建 admin 用户
    console.log('\n2. 创建 admin 用户...');
    const adminPassword = '123456';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminId = uuidv4();

    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .maybeSingle();

    let adminUserId;
    if (existingAdmin) {
      adminUserId = existingAdmin.id;
      console.log('  ℹ️  admin 用户已存在，更新密码...');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          role: 'admin',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('username', 'admin');

      if (updateError) {
        console.log('  ⚠️ 更新失败（可能是权限问题）:', updateError.message);
        console.log('  尝试跳过，继续检查是否已存在正确数据...\n');
      } else {
        console.log('  ✅ admin 用户更新成功');
      }
    } else {
      const { error: insertError } = await supabase.from('users').insert({
        id: adminId,
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) {
        console.log('  ⚠️ 创建失败:', insertError.message);
        console.log('  可能原因：Publishable key 没有写入权限\n');
      } else {
        adminUserId = adminId;
        console.log('  ✅ admin 用户创建成功');
      }
    }

    // 检查 admin 用户是否存在
    const { data: adminCheck } = await supabase
      .from('users')
      .select('id, role, is_active')
      .eq('username', 'admin')
      .maybeSingle();

    if (adminCheck) {
      adminUserId = adminCheck.id;
      console.log(`  ✅ admin 用户存在 - ID: ${adminUserId}`);
      console.log(`     角色: ${adminCheck.role}, 状态: ${adminCheck.is_active ? '激活' : '未激活'}`);
    } else {
      console.log('  ❌ admin 用户不存在，需要手动创建');
      console.log('\n  建议：在 Supabase SQL Editor 中执行以下 SQL：');
      console.log(`
INSERT INTO users (id, username, password, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  true,
  NOW(),
  NOW()
);
      `);
    }

    // 步骤 2: 创建权限
    if (adminUserId) {
      console.log('\n3. 创建 admin 权限...');
      const { data: existingPerm } = await supabase
        .from('user_permissions')
        .select('id')
        .eq('user_id', adminUserId)
        .maybeSingle();

      if (existingPerm) {
        console.log('  ✅ admin 权限已存在');
      } else {
        const { error: permError } = await supabase.from('user_permissions').insert({
          id: uuidv4(),
          user_id: adminUserId,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (permError) {
          console.log('  ⚠️ 创建权限失败:', permError.message);
          console.log('  权限数据可能需要手动创建\n');
        } else {
          console.log('  ✅ admin 权限创建成功');
        }
      }
    }

    // 步骤 3: 检查经方数据
    console.log('\n4. 检查经方数据...');
    const { count: caseCount } = await supabase.from('medical_cases').select('*', { count: 'exact' });

    if (caseCount > 0) {
      console.log(`  ✅ 经方数据已存在，共 ${caseCount} 条`);
    } else {
      console.log('  ℹ️  经方数据为空');
      console.log('\n  建议：在 Supabase SQL Editor 中执行 QUICK_START.md 中的 SQL 脚本');
    }

    // 验证结果
    console.log('\n=== 验证结果 ===');
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact' });
    console.log(`✅ 用户总数: ${userCount}`);
    console.log(`✅ 医案总数: ${caseCount || 0}`);

    if (userCount > 0 && caseCount > 0) {
      console.log('\n========================================');
      console.log('✅ 数据库已初始化！');
      console.log('========================================');
      console.log('\n登录信息：');
      console.log('  用户名: admin');
      console.log('  密码: 123456');
      console.log('\n========================================\n');
    } else {
      console.log('\n⚠️ 数据库未完全初始化');
      console.log('\n建议：在 Supabase SQL Editor 中执行完整的初始化脚本');
      console.log('链接: https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql/new');
      console.log('参考: QUICK_START.md\n');
    }

  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    console.error('详细错误:', error);

    if (error.message.includes('permission') || error.message.includes('RLS')) {
      console.log('\n⚠️ 权限不足');
      console.log('Publishable key 通常只有读取权限，没有写入权限');
      console.log('\n建议：使用 SQL Editor 手动执行初始化脚本');
      console.log('链接: https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql/new\n');
    }
    process.exit(1);
  }
}

initDatabase();
