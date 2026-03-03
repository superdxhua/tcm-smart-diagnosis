/**
 * 诊断 admin 登录问题
 * 运行命令: node diagnose-admin.js
 */

const bcrypt = require('bcrypt');

// 数据库配置
const supabaseUrl = process.env.SUPABASE_URL || 'https://xxx.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// 测试密码哈希
async function testPasswordHash() {
  console.log('=== 测试密码哈希 ===');
  
  // 生成新的密码哈希
  const password = '123456';
  const hash1 = await bcrypt.hash(password, 10);
  const hash2 = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  
  console.log('原始密码:', password);
  console.log('新生成的哈希:', hash1);
  console.log('文档中的哈希:', hash2);
  
  // 验证两个哈希
  const valid1 = await bcrypt.compare(password, hash1);
  const valid2 = await bcrypt.compare(password, hash2);
  
  console.log('验证新哈希:', valid1);
  console.log('验证文档哈希:', valid2);
  
  return { hash1, valid1, valid2 };
}

// 使用新的 bcrypt 生成正确的哈希
async function generateCorrectHash() {
  console.log('\n=== 生成正确的密码哈希 ===');
  
  const password = '123456';
  const correctHash = await bcrypt.hash(password, 10);
  
  console.log('正确的密码哈希:', correctHash);
  
  // 提供完整的 SQL 插入语句
  console.log('\n=== 执行以下 SQL ===');
  console.log(`DELETE FROM users WHERE username = 'admin';`);
  console.log(`INSERT INTO users (id, username, password, role, is_active, created_at)`);
  console.log(`VALUES (gen_random_uuid(), 'admin', '${correctHash}', 'admin', true, now());`);
  
  return correctHash;
}

async function main() {
  console.log('开始诊断 admin 登录问题...\n');
  
  try {
    // 测试密码哈希
    await testPasswordHash();
    
    // 生成正确的哈希
    await generateCorrectHash();
    
    console.log('\n=== 诊断完成 ===');
    console.log('请使用上面生成的 SQL 语句更新数据库');
  } catch (error) {
    console.error('诊断失败:', error);
  }
}

main();
