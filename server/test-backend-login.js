/**
 * 模拟后端登录逻辑进行测试
 */
require('dotenv').config({ path: '/workspace/projects/.env' });

const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.COZE_SUPABASE_URL;
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('=== 模拟后端登录逻辑 ===\n');

  const username = 'admin';
  const password = '123456';

  console.log('输入用户名:', username);
  console.log('输入密码:', password);

  // 1. 查询用户
  console.log('\n步骤 1: 查询用户...');
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !user) {
    console.log('❌ 用户不存在');
    console.log('错误:', error);
    return;
  }

  console.log('✅ 用户存在');
  console.log('用户ID:', user.id);
  console.log('用户名:', user.username);
  console.log('角色:', user.role);
  console.log('是否激活:', user.is_active);

  // 2. 检查是否激活
  console.log('\n步骤 2: 检查账户状态...');
  if (!user.is_active) {
    console.log('❌ 账户已被禁用');
    return;
  }
  console.log('✅ 账户已激活');

  // 3. 验证密码
  console.log('\n步骤 3: 验证密码...');
  console.log('数据库中的密码哈希:', user.password);
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  console.log('密码验证结果:', isValidPassword);

  if (!isValidPassword) {
    console.log('❌ 密码错误');
    return;
  }

  console.log('✅ 密码正确');

  // 4. 生成 token
  console.log('\n步骤 4: 生成 token...');
  const token = Buffer.from(JSON.stringify({
    userId: user.id,
    username: user.username,
    role: user.role,
  })).toString('base64');
  console.log('✅ Token 生成成功');
  console.log('Token:', token);

  console.log('\n=== 登录成功！ ===');
}

testLogin().catch(console.error);
