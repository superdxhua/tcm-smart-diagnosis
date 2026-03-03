const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// 生产环境数据库配置
const supabaseUrl = 'https://br-zippy-kea-87a692a5.supabase2.aidap-global.cn-beijing.volces.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTEzNjMzMzIsInJvbGUiOiJhbm9uIn0.RS0wQLKj-8lsYE-Qek3ut9y9adM072H6gHepZ4xwk60';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAdminPassword() {
  try {
    console.log('开始重置生产环境 admin 用户密码...');

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

    process.exit(0);
  } catch (error) {
    console.error('操作失败:', error);
    process.exit(1);
  }
}

resetAdminPassword();
