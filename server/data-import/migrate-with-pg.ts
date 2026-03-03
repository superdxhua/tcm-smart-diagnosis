/**
 * 使用 pg 库直接连接 PostgreSQL 执行迁移
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

// 从 Supabase URL 提取项目引用 ID
const supabaseUrl = process.env.COZE_SUPABASE_URL;
const serviceRoleKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔑 使用 Service Role Key (管理员权限)\n');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 缺少必要的配置');
  process.exit(1);
}

// 提取项目引用 ID
const projectRefMatch = supabaseUrl.match(/\/\/([a-z0-9-]+)\.supabase/);
const projectRef = projectRefMatch ? projectRefMatch[1] : 'br-zippy-kea-87a692a5';

console.log('📋 项目引用 ID:', projectRef);
console.log('📋 Supabase URL:', supabaseUrl);

// 尝试多种连接字符串格式
const connectionStringOptions = [
  // 格式 1: 使用 project-ref
  `postgresql://postgres:${serviceRoleKey}@db.${projectRef}.supabase.co:5432/postgres`,
  // 格式 2: 使用 pooler
  `postgresql://postgres.${projectRef}:${serviceRoleKey}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
  // 格式 3: 直连
  `postgresql://postgres:${serviceRoleKey}@${projectRef}.supabase.co:5432/postgres`,
];

// 迁移脚本路径
const migrationFilePath = path.join(__dirname, '../migrations/create_missing_tables.sql');

/**
 * 尝试连接数据库并执行迁移
 */
async function tryConnectionAndMigrate() {
  console.log('\n🔍 尝试连接数据库...\n');

  for (let i = 0; i < connectionStringOptions.length; i++) {
    const connectionString = connectionStringOptions[i];
    console.log(`尝试连接方式 ${i + 1}/${connectionStringOptions.length}:`);
    console.log(`   ${connectionString.replace(serviceRoleKey, '***')}\n`);

    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
    });

    try {
      // 测试连接
      const client = await pool.connect();
      console.log('✅ 数据库连接成功！\n');

      // 读取迁移脚本
      if (!fs.existsSync(migrationFilePath)) {
        console.error('❌ 迁移脚本文件不存在:', migrationFilePath);
        client.release();
        await pool.end();
        process.exit(1);
      }

      const sql = fs.readFileSync(migrationFilePath, 'utf8');
      console.log('📋 迁移脚本加载成功');
      console.log(`   文件大小: ${(sql.length / 1024).toFixed(2)} KB\n`);

      // 执行迁移
      console.log('🚀 开始执行迁移...\n');
      const result = await client.query(sql);
      
      console.log('✅ 迁移执行完成！');
      console.log(`   命令结果:`, result.rowCount);
      console.log('\n💡 现在可以运行数据导入：');
      console.log('   npx tsx data-import/import-data.ts\n');

      client.release();
      await pool.end();
      return;

    } catch (error: any) {
      console.log(`❌ 连接失败: ${error.message}\n`);
      await pool.end();
      continue;
    }
  }

  console.log('❌ 所有连接方式都失败了');
  console.log('\n💡 请使用 Supabase Dashboard 的 SQL Editor 手动执行迁移：');
  console.log('   1. 访问 https://supabase.com/dashboard');
  console.log('   2. 打开 SQL Editor');
  console.log('   3. 复制 server/migrations/create_missing_tables.sql 的内容');
  console.log('   4. 粘贴并执行\n');
}

tryConnectionAndMigrate().catch(error => {
  console.error('❌ 迁移失败:', error);
  process.exit(1);
});
