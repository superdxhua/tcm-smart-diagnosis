const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = 'https://dwswtkfbtdohaftnklxx.supabase.co';
const publishableKey = 'sb_publishable_7DetJ-vZ99o_7_aprg_w-Q_NMc_nlgv';

const supabase = createClient(supabaseUrl, publishableKey);

async function updateAdminPassword() {
  console.log('=== 更新 admin 密码 ===\n');

  try {
    // 1. 查询当前 admin 用户
    console.log('1. 查询当前 admin 用户...');
    const { data: adminUser, error: queryError } = await supabase
      .from('users')
      .select('id, username, password')
      .eq('username', 'admin')
      .maybeSingle();

    if (queryError) {
      console.log('❌ 查询失败:', queryError.message);
      return;
    }

    if (!adminUser) {
      console.log('❌ admin 用户不存在');
      return;
    }

    console.log('✅ 找到 admin 用户');
    console.log(`   当前密码哈希: ${adminUser.password.substring(0, 30)}...`);
    console.log('');

    // 2. 更新密码
    console.log('2. 更新密码为正确的哈希...');
    const newPasswordHash = '$2b$10$lCPLNNBnmGfHE2YJ1BHV7.xHaBRClq1QsEM2mdoHfokWT1oaw.RKq';

    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({
        password: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('username', 'admin')
      .select();

    if (updateError) {
      console.log('❌ 更新失败:', updateError.message);
      console.log('\n⚠️ publishable key 没有写入权限');
      console.log('需要手动在 SQL Editor 执行以下 SQL：\n');
      console.log('```sql');
      console.log('UPDATE users');
      console.log('SET password = \'$2b$10$lCPLNNBnmGfHE2YJ1BHV7.xHaBRClq1QsEM2mdoHfokWT1oaw.RKq\',');
      console.log('    updated_at = NOW()');
      console.log('WHERE username = \'admin\';');
      console.log('```\n');
      console.log('执行链接: https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql/new');
      return;
    }

    console.log('✅ 密码更新成功！');
    console.log(`   新密码哈希: ${newPasswordHash}`);
    console.log('');

    // 3. 验证更新
    console.log('3. 验证密码更新...');
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('password')
      .eq('username', 'admin')
      .maybeSingle();

    if (verifyError) {
      console.log('❌ 验证失败:', verifyError.message);
      return;
    }

    if (verifyUser.password === newPasswordHash) {
      console.log('✅ 密码哈希已更新为正确版本');
      console.log(`   哈希值: ${verifyUser.password.substring(0, 30)}...`);
      console.log('');

      // 4. 测试密码验证
      console.log('4. 测试密码验证...');
      const bcrypt = require('bcrypt');
      const isValid = await bcrypt.compare('123456', verifyUser.password);

      console.log(`   密码验证: ${isValid ? '✅ 成功' : '❌ 失败'}`);
      console.log('');

      if (isValid) {
        console.log('========================================');
        console.log('✅ 密码更新成功！');
        console.log('========================================');
        console.log('\n现在可以登录了！');
        console.log('URL: https://zhongyihskhealth.com');
        console.log('用户名: admin');
        console.log('密码: 123456');
        console.log('========================================\n');
      } else {
        console.log('⚠️ 密码验证仍然失败，需要进一步检查');
      }
    } else {
      console.log('❌ 密码未正确更新');
    }

  } catch (error) {
    console.error('❌ 更新失败:', error.message);
  }
}

updateAdminPassword();
