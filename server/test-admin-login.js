/**
 * 测试 admin 登录流程
 * 运行命令: node test-admin-login.js
 */

const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取配置
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://xxx.supabase.co';
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'your-anon-key';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? '已配置' : '未配置');

async function testAdminLogin() {
  try {
    // 创建 Supabase 客户端
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('\n=== 1. 查询 admin 用户 ===');
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin');

    console.log('查询结果:', users);
    console.log('查询错误:', findError);

    if (findError) {
      console.error('查询用户失败:', findError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ admin 用户不存在！');
      console.log('\n=== 创建 admin 用户 ===');
      const password = '123456';
      const hash = await bcrypt.hash(password, 10);
      console.log('密码哈希:', hash);

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          username: 'admin',
          password: hash,
          role: 'admin',
          is_active: true,
        })
        .select()
        .single();

      if (createError) {
        console.error('创建用户失败:', createError);
        return;
      }

      console.log('✅ admin 用户创建成功:', newUser);
    } else {
      console.log('✅ 找到 admin 用户:', users[0]);
    }

    // 重新查询以获取最新数据
    const { data: adminUser } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .single();

    if (!adminUser) {
      console.error('无法获取 admin 用户数据');
      return;
    }

    console.log('\n=== 2. 测试密码验证 ===');
    console.log('数据库中的密码哈希:', adminUser.password);
    console.log('输入的密码:', '123456');

    // 测试密码验证
    const isValid = await bcrypt.compare('123456', adminUser.password);
    console.log('密码验证结果:', isValid);

    if (isValid) {
      console.log('\n✅ 密码验证成功！');
    } else {
      console.log('\n❌ 密码验证失败！');
      console.log('\n=== 重新设置密码 ===');
      const newHash = await bcrypt.hash('123456', 10);
      console.log('新的密码哈希:', newHash);

      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newHash })
        .eq('username', 'admin');

      if (updateError) {
        console.error('更新密码失败:', updateError);
      } else {
        console.log('✅ 密码更新成功！');

        // 再次验证
        const { data: updatedUser } = await supabase
          .from('users')
          .select('password')
          .eq('username', 'admin')
          .single();

        const reValid = await bcrypt.compare('123456', updatedUser.password);
        console.log('更新后密码验证结果:', reValid);
      }
    }

  } catch (error) {
    console.error('测试失败:', error);
  }
}

testAdminLogin();
