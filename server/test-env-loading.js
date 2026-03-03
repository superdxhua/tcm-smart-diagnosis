/**
 * 测试后端环境变量加载
 */
console.log('=== 测试环境变量加载 ===\n');

// 测试方式 1: 直接读取环境变量
console.log('方式 1: 直接读取 process.env');
console.log('COZE_SUPABASE_URL:', process.env.COZE_SUPABASE_URL || '未设置');
console.log('COZE_SUPABASE_ANON_KEY:', process.env.COZE_SUPABASE_ANON_KEY ? '已设置' : '未设置');

// 测试方式 2: 加载 .env 文件
require('dotenv').config({ path: '/workspace/projects/.env' });

console.log('\n方式 2: 加载 .env 文件后');
console.log('COZE_SUPABASE_URL:', process.env.COZE_SUPABASE_URL || '未设置');
console.log('COZE_SUPABASE_ANON_KEY:', process.env.COZE_SUPABASE_ANON_KEY ? '已设置' : '未设置');
console.log('ANON KEY 长度:', process.env.COZE_SUPABASE_ANON_KEY?.length || 0);
