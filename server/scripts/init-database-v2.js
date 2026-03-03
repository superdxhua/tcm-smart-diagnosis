const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Supabase 配置
const supabaseUrl = 'https://dwswtkfbtdohaftnklxx.supabase.co';
const serviceRoleKey = 'sbp_6d0d1e2895b79ebebc25f2ff0e833acd7546c372';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c3d0a2ZidGRvaGFmdG5rbHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTQ3NzMsImV4cCI6MjA1MDAzMDc3M30.5h5sL7xkMkXrXqK7pZ2nJ8mV3qR4tY5wK6bL7cN8dD0';

// 先用 ANON KEY 测试连接
console.log('=== 测试 Supabase 连接 ===\n');

async function testAndInit() {
  try {
    // 1. 测试 ANON KEY 连接
    console.log('1. 测试 ANON KEY 连接...');
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data: anonData, error: anonError } = await anonClient
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (anonError) {
      console.log('❌ ANON KEY 连接失败:', anonError.message);
    } else {
      console.log('✅ ANON KEY 连接成功，用户数:', anonData);
    }

    // 2. 测试 SERVICE ROLE 连接
    console.log('\n2. 测试 SERVICE ROLE KEY 连接...');
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: serviceData, error: serviceError } = await serviceClient
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (serviceError) {
      console.log('❌ SERVICE ROLE KEY 连接失败:', serviceError.message);
      console.log('   尝试使用 ANON KEY 进行操作...\n');
      await initWithAnonKey(anonClient);
    } else {
      console.log('✅ SERVICE ROLE KEY 连接成功，用户数:', serviceData);
      await initWithServiceKey(serviceClient);
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

async function initWithServiceKey(client) {
  console.log('\n=== 使用 SERVICE ROLE KEY 初始化数据库 ===\n');
  await performInitialization(client);
}

async function initWithAnonKey(client) {
  console.log('\n=== 使用 ANON KEY 初始化数据库 ===\n');

  // ANON KEY 可能没有写入权限，但可以尝试
  const adminPassword = '123456';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // 尝试创建 admin 用户
  console.log('尝试创建 admin 用户...');
  const adminId = uuidv4();

  const { data: existingAdmin } = await client
    .from('users')
    .select('id')
    .eq('username', 'admin')
    .maybeSingle();

  if (existingAdmin) {
    console.log('ℹ️ admin 用户已存在，尝试更新...');
    const { error } = await client
      .from('users')
      .update({
        password: hashedPassword,
        role: 'admin',
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('username', 'admin');

    if (error) {
      console.log('❌ 更新失败:', error.message);
      console.log('\n⚠️ ANON KEY 没有写入权限');
      console.log('请使用以下方案：\n');
      console.log('方案 1: 在 Supabase Dashboard 执行 SQL 脚本');
      console.log('   1. 打开 https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql/new');
      console.log('   2. 复制 QUICK_START.md 中的 SQL 代码');
      console.log('   3. 粘贴并执行\n');
      console.log('方案 2: 提供正确的 service_role key');
      console.log('   从 https://app.supabase.com/project/dwswtkfbtdohaftnklxx/settings/api 获取');
      return;
    }
    console.log('✅ admin 用户更新成功');
  } else {
    const { error } = await client.from('users').insert({
      id: adminId,
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.log('❌ 创建失败:', error.message);
      console.log('\n⚠️ ANON KEY 没有写入权限');
      console.log('请在 Supabase Dashboard 执行 SQL 脚本（参考 QUICK_START.md）');
      return;
    }
    console.log('✅ admin 用户创建成功');
  }

  await performInitialization(client);
}

async function performInitialization(client) {
  try {
    const adminPassword = '123456';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminId = uuidv4();

    // 步骤 1: 创建 admin 用户
    console.log('步骤 1/3: 创建 admin 用户...');
    const { data: existingAdmin } = await client
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .maybeSingle();

    let adminUserId;
    if (existingAdmin) {
      adminUserId = existingAdmin.id;
      const { error } = await client
        .from('users')
        .update({
          password: hashedPassword,
          role: 'admin',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('username', 'admin');

      if (error) throw error;
      console.log('✅ admin 用户更新成功');
    } else {
      const { error } = await client.from('users').insert({
        id: adminId,
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      adminUserId = adminId;
      console.log('✅ admin 用户创建成功');
    }

    // 步骤 2: 创建权限
    console.log('步骤 2/3: 创建 admin 权限...');
    const { data: existingPerm } = await client
      .from('user_permissions')
      .select('id')
      .eq('user_id', adminUserId)
      .maybeSingle();

    if (existingPerm) {
      const { error } = await client
        .from('user_permissions')
        .update({
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', adminUserId);

      if (error) throw error;
      console.log('✅ admin 权限更新成功');
    } else {
      const { error } = await client.from('user_permissions').insert({
        id: uuidv4(),
        user_id: adminUserId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      console.log('✅ admin 权限创建成功');
    }

    // 步骤 3: 导入经方数据
    console.log('步骤 3/3: 导入经方数据...');
    const medicalCasesData = require('./medical-cases-data.js');

    const { data: existingCases } = await client
      .from('medical_cases')
      .select('id')
      .limit(1);

    if (existingCases && existingCases.length > 0) {
      console.log('ℹ️ 经方数据已存在，跳过');
    } else {
      for (let i = 0; i < medicalCasesData.length; i++) {
        const caseData = {
          ...medicalCasesData[i],
          id: uuidv4(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await client.from('medical_cases').insert(caseData);
        if (error) throw error;

        console.log(`✅ [${i + 1}/${medicalCasesData.length}] ${caseData.prescription_name}`);
      }
    }

    // 验证
    console.log('\n=== 验证结果 ===');
    const { count: userCount } = await client.from('users').select('*', { count: 'exact' });
    const { count: caseCount } = await client.from('medical_cases').select('*', { count: 'exact' });

    console.log(`✅ 用户数: ${userCount}`);
    console.log(`✅ 医案数: ${caseCount}`);
    console.log('\n登录信息: admin / 123456\n');

  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    if (error.message.includes('permission') || error.message.includes('RLS')) {
      console.log('\n⚠️ 权限不足，请在 Supabase Dashboard 执行 SQL 脚本');
      console.log('   参考: QUICK_START.md');
    }
  }
}

testAndInit();
