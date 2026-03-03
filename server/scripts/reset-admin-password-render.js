const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Render 环境数据库配置
const supabaseUrl = 'https://dwswtkfbtdohaftnklxx.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAdminPassword() {
  try {
    console.log('=== 重置 Render 环境数据库 admin 用户密码 ===');
    console.log('数据库 URL:', supabaseUrl);
    console.log('数据库密钥长度:', supabaseKey.length);

    // 1. 查询 admin 用户
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .single();

    if (findError) {
      console.error('查询用户失败:', findError);
      process.exit(1);
    }

    if (!existingUser) {
      console.log('admin 用户不存在，创建新用户...');

      // 创建新用户
      const hashedPassword = await bcrypt.hash('123456', 10);

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          username: 'admin',
          password: hashedPassword,
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('创建用户失败:', createError);
        process.exit(1);
      }

      console.log('✅ admin 用户创建成功');
      console.log('  用户名:', newUser.username);
      console.log('  密码: 123456');
      console.log('  角色:', newUser.role);
      console.log('  ID:', newUser.id);
    } else {
      console.log('admin 用户已存在，更新密码...');

      // 更新密码
      const hashedPassword = await bcrypt.hash('123456', 10);

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('username', 'admin')
        .select()
        .single();

      if (updateError) {
        console.error('更新密码失败:', updateError);
        process.exit(1);
      }

      console.log('✅ admin 用户密码已更新');
      console.log('  用户名:', updatedUser.username);
      console.log('  新密码: 123456');
      console.log('  角色:', updatedUser.role);
      console.log('  ID:', updatedUser.id);
    }

    // 2. 验证密码
    console.log('\n验证新密码...');
    const { data: verifyUser } = await supabase
      .from('users')
      .select('password')
      .eq('username', 'admin')
      .single();

    const isValid = await bcrypt.compare('123456', verifyUser.password);
    console.log('✅ 密码验证结果:', isValid ? '成功' : '失败');

    if (!isValid) {
      console.error('❌ 密码验证失败！');
      process.exit(1);
    }

    console.log('\n=== 操作完成 ===');
    console.log('现在可以使用以下凭据登录：');
    console.log('  用户名: admin');
    console.log('  密码: 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
