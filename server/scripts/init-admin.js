/**
 * 初始化管理员账号脚本
 * 用于创建系统管理员账号
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// 手动解析 .env 文件
const envPath = path.resolve(__dirname, '../../.env');
console.log('脚本目录:', __dirname);
console.log('环境文件路径:', envPath);
console.log('文件是否存在:', fs.existsSync(envPath));
const envContent = fs.readFileSync(envPath, 'utf8');

// 解析环境变量
const envVars = {};
envContent.split('\n').forEach((line, index) => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const equalIndex = trimmedLine.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmedLine.substring(0, equalIndex).trim();
      const value = trimmedLine.substring(equalIndex + 1).trim();
      envVars[key] = value;
    }
  }
});

console.log('解析出的环境变量数量:', Object.keys(envVars).length);
console.log('所有环境变量键:', Object.keys(envVars).map(k => `"${k}"`).join(', '));
console.log('COZE_SUPABASE_URL (直接访问):', envVars['COZE_SUPABASE_URL']);
console.log('COZE_SUPABASE_ANON_KEY (直接访问):', envVars['COZE_SUPABASE_ANON_KEY'] ? '已设置' : '未设置');

// 初始化 Supabase 客户端
const supabaseUrl = envVars['COZE_SUPABASE_URL'] || envVars['SUPABASE_URL'];
const supabaseKey = envVars['COZE_SUPABASE_ANON_KEY'] || envVars['SUPABASE_ANON_KEY'];

console.log('环境变量检查:');
console.log('  COZE_SUPABASE_URL:', supabaseUrl ? '已设置' : '未设置');
console.log('  COZE_SUPABASE_ANON_KEY:', supabaseKey ? '已设置' : '未设置');

if (!supabaseUrl || !supabaseKey) {
  console.error('请设置数据库环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 管理员账号信息
const adminUser = {
  username: 'admin',
  password: '123456',
  role: 'admin',
};

async function initAdmin() {
  try {
    console.log('开始初始化管理员账号...');

    // 检查是否已存在管理员
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('username', adminUser.username)
      .single();

    if (existingUser) {
      console.log('管理员账号已存在:', existingUser.username);
      console.log('是否重置密码？如需重置，请先删除该账号');

      // 更新密码（如果需要）
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('username', adminUser.username)
        .select()
        .single();

      if (updateError) {
        console.error('更新密码失败:', updateError);
        process.exit(1);
      }

      console.log('✓ 管理员密码已更新');
      process.exit(0);
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);

    // 创建管理员账号
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        username: adminUser.username,
        password: hashedPassword,
        role: adminUser.role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('创建管理员失败:', createError);
      process.exit(1);
    }

    console.log('✓ 管理员账号创建成功:');
    console.log('  用户名:', newUser.username);
    console.log('  密码:', adminUser.password);
    console.log('  角色:', newUser.role);
    console.log('  ID:', newUser.id);

    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

initAdmin();
