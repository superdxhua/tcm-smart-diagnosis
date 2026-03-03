/**
 * 数据库迁移执行脚本
 * 用于执行 SQL 迁移脚本
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载环境变量
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });
}

// Supabase 配置
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 环境变量');
  console.error('需要的环境变量: COZE_SUPABASE_URL 和 COZE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 迁移脚本路径
const migrationFilePath = path.join(__dirname, '../migrations/003_add_comprehensive_database_schema.sql');

/**
 * 执行迁移脚本
 */
async function runMigration() {
  console.log('🚀 开始执行数据库迁移...\n');

  // 读取迁移脚本
  if (!fs.existsSync(migrationFilePath)) {
    console.error('❌ 迁移脚本文件不存在:', migrationFilePath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationFilePath, 'utf8');
  console.log('📋 迁移脚本加载成功');
  console.log(`   文件大小: ${(sql.length / 1024).toFixed(2)} KB\n`);

  // Supabase REST API 不支持直接执行 SQL
  // 需要通过 SQL Editor 或 RPC 函数执行
  // 这里我们尝试创建一个 RPC 函数来执行迁移

  const createMigrationFunctionSql = `
    CREATE OR REPLACE FUNCTION execute_migration_sql(sql_text TEXT)
    RETURNS TEXT
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_text;
      RETURN 'Migration executed successfully';
    END;
    $$;
  `;

  console.log('⚠️  注意: Supabase REST API 不支持直接执行 SQL 语句');
  console.log('⚠️  请通过 Supabase Dashboard 的 SQL Editor 执行以下步骤：\n');
  console.log('1. 打开 Supabase Dashboard');
  console.log('2. 进入 SQL Editor');
  console.log('3. 复制并执行迁移脚本内容：');
  console.log('   文件路径:', migrationFilePath);
  console.log('\n或者使用 psql 命令行工具：');
  console.log(`   psql ${supabaseUrl.replace('https://', 'postgresql://')} -f ${migrationFilePath}`);

  console.log('\n📄 迁移脚本内容预览：');
  console.log('='.repeat(80));
  console.log(sql);
  console.log('='.repeat(80));
}

runMigration().catch(error => {
  console.error('❌ 迁移失败:', error);
  process.exit(1);
});
