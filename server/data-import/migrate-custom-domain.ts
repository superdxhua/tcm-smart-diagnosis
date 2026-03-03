/**
 * 使用自定义域名连接 PostgreSQL 执行迁移
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

const supabaseUrl = process.env.COZE_SUPABASE_URL;
const serviceRoleKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔑 使用 Service Role Key (管理员权限)\n');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 缺少必要的配置');
  process.exit(1);
}

// 从 URL 中提取域名
const urlMatch = supabaseUrl.match(/https?:\/\/([^\/]+)/);
const hostname = urlMatch ? urlMatch[1] : 'br-zippy-kea-87a692a5.supabase2.aidap-global.cn-beijing.volces.com';

console.log('📋 Supabase 域名:', hostname);

// 尝试使用自定义域名的连接字符串
const connectionStringOptions = [
  // 格式 1: 直接使用自定义域名
  `postgresql://postgres:${serviceRoleKey}@${hostname}/postgres`,
  // 格式 2: 移除端口号
  `postgresql://postgres:${serviceRoleKey}@${hostname.split(':')[0]}/postgres`,
  // 格式 3: 指定端口 5432
  `postgresql://postgres:${serviceRoleKey}@${hostname.split(':')[0]}:5432/postgres`,
  // 格式 4: 使用 sslmode=require
  `postgresql://postgres:${serviceRoleKey}@${hostname.split(':')[0]}:5432/postgres?sslmode=require`,
  // 格式 5: 使用 sslmode=no-verify（仅用于测试）
  `postgresql://postgres:${serviceRoleKey}@${hostname.split(':')[0]}:5432/postgres?sslmode=no-verify`,
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
    const masked = connectionString.replace(serviceRoleKey, '***');
    console.log(`   ${masked}\n`);

    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 10000,
      // 尝试不同的 SSL 配置
      ssl: i === 4 ? { rejectUnauthorized: false } : true,
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
      
      // 执行 SQL
      await client.query(sql);
      
      console.log('✅ 迁移执行完成！');
      console.log('\n💡 现在可以运行数据导入：');
      console.log('   npx tsx data-import/import-data.ts\n');

      client.release();
      await pool.end();
      return;

    } catch (error: any) {
      console.log(`❌ 连接失败: ${error.message}`);
      if (error.code) {
        console.log(`   错误代码: ${error.code}`);
      }
      console.log('');
      await pool.end();
      continue;
    }
  }

  console.log('❌ 所有连接方式都失败了');
  console.log('\n💡 请使用 Supabase Dashboard 的 SQL Editor 手动执行迁移：');
  console.log('   1. 访问 Supabase Dashboard');
  console.log('   2. 打开 SQL Editor');
  console.log('   3. 复制 server/migrations/create_missing_tables.sql 的内容');
  console.log('   4. 粘贴并执行\n');
  console.log('💡 或者使用 psql 命令行工具：');
  console.log(`   psql "${connectionStringOptions[3].replace(serviceRoleKey, '[password]')}" -f ${migrationFilePath}\n`);
}

tryConnectionAndMigrate().catch(error => {
  console.error('❌ 迁移失败:', error);
  process.exit(1);
});
