const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  const supabaseUrl = 'https://dwswtkfbtdohaftnklxx.supabase.co';
  const serviceRoleKey = 'sbp_6d0d1e2895b79ebebc25f2ff0e833acd7546c372';

  console.log('测试 Supabase 连接...\n');
  console.log('URL:', supabaseUrl);
  console.log('Key 长度:', serviceRoleKey.length);
  console.log('Key 前缀:', serviceRoleKey.substring(0, 10) + '...\n');

  // 方式 1: 标准创建
  try {
    console.log('方式 1: 标准创建');
    const client1 = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await client1.from('users').select('count', { count: 'exact', head: true });

    if (error) {
      console.log('❌ 失败:', error.message);
    } else {
      console.log('✅ 成功！用户数:', data);
      console.log('\n密钥验证通过！');
      process.exit(0);
    }
  } catch (e) {
    console.log('❌ 异常:', e.message);
  }

  // 方式 2: 带配置
  try {
    console.log('\n方式 2: 带配置');
    const client2 = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });
    const { data, error } = await client2.from('users').select('count', { count: 'exact', head: true });

    if (error) {
      console.log('❌ 失败:', error.message);
    } else {
      console.log('✅ 成功！用户数:', data);
      console.log('\n密钥验证通过！');
      process.exit(0);
    }
  } catch (e) {
    console.log('❌ 异常:', e.message);
  }

  console.log('\n所有方式都失败了，请检查密钥是否正确');
  process.exit(1);
}

testConnection();
