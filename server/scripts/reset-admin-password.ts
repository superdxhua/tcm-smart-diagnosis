import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dwswtkfbtdohaftnklxx.supabase.co';
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c3d0a2ZidGRvaGFmdG5rbHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5OTU4MTMsImV4cCI6MjAxODU3MTgxM30.DQWj0Yk3oX6sQJXJF1W7Z2qVJY5TQVxP0pR0nY9JWwM';

if (!supabaseUrl || !supabaseKey) {
  console.error('请设置 COZE_SUPABASE_URL 和 COZE_SUPABASE_ANON_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAdminPassword() {
  try {
    console.log('开始重置 admin 用户密码...');

    // 检查 admin 用户是否存在
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('查询用户失败:', fetchError);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    if (existingUser) {
      console.log('admin 用户已存在，更新密码...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('username', 'admin');

      if (updateError) {
        console.error('更新密码失败:', updateError);
        process.exit(1);
      }
      console.log('✅ admin 用户密码已重置为: 123456');
    } else {
      console.log('admin 用户不存在，创建新用户...');
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: uuidv4(),
          username: 'admin',
          password: hashedPassword,
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
        });

      if (createError) {
        console.error('创建用户失败:', createError);
        process.exit(1);
      }
      console.log('✅ admin 用户创建成功，密码: 123456');
    }

    // 验证密码是否正确
    const { data: verifyUser } = await supabase
      .from('users')
      .select('password')
      .eq('username', 'admin')
      .single();

    if (verifyUser) {
      const isValid = await bcrypt.compare('123456', verifyUser.password);
      console.log(isValid ? '✅ 密码验证成功' : '❌ 密码验证失败');
    }

  } catch (err) {
    console.error('执行失败:', err);
    process.exit(1);
  }
}

resetAdminPassword().then(() => {
  console.log('重置完成');
  process.exit(0);
});
