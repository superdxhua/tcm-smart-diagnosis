/**
 * 数据迁移脚本 - 从 br-zippy-kea-87a692a5 导出并迁移到新项目
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

// 源项目配置（br-zippy-kea-87a692a5）
const SOURCE_URL = process.env.COZE_SUPABASE_URL;
const SOURCE_SERVICE_ROLE_KEY = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

console.log('📦 Supabase 项目数据迁移工具\n');
console.log('🔷 源项目:', SOURCE_URL);
console.log('🔑 Service Role Key:', SOURCE_SERVICE_ROLE_KEY ? SOURCE_SERVICE_ROLE_KEY.substring(0, 30) + '...' : 'undefined');

/**
 * 导出源项目数据
 */
async function exportSourceData() {
  console.log('\n📥 开始导出源项目数据...\n');

  if (!SOURCE_URL || !SOURCE_SERVICE_ROLE_KEY) {
    console.error('❌ 源项目配置不完整');
    return null;
  }

  const sourceClient = createClient(SOURCE_URL, SOURCE_SERVICE_ROLE_KEY);

  const tables = [
    'formulas',
    'formula_symptoms',
    'disease_categories',
    'tumor_formula_relations',
    'tumor_constitutions',
    'tumor_pathogeneses',
    'tumor_complications',
    'ai_inquiry_sessions',
    'ai_inquiry_messages'
  ];

  const exportedData: any = {};

  for (const table of tables) {
    try {
      console.log(`📤 导出表: ${table}...`);
      const { data, error, count } = await sourceClient
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        console.log(`   ❌ 失败: ${error.message}`);
        console.log(`   代码: ${error.code}`);
        exportedData[table] = null;
      } else {
        exportedData[table] = data;
        console.log(`   ✅ 成功: ${count} 条记录`);
      }
    } catch (e: any) {
      console.log(`   ❌ 异常: ${e.message}`);
      exportedData[table] = null;
    }
  }

  return exportedData;
}

/**
 * 保存导出数据到文件
 */
function saveExportedData(data: any) {
  const exportPath = path.join(__dirname, 'data-export.json');
  fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 数据已保存到: ${exportPath}`);
  
  // 统计导出的记录数
  let totalRecords = 0;
  Object.keys(data).forEach(table => {
    if (data[table] && Array.isArray(data[table])) {
      totalRecords += data[table].length;
    }
  });
  console.log(`📊 总记录数: ${totalRecords}`);
}

/**
 * 迁移到新项目
 */
async function migrateToNewProject(targetUrl: string, targetServiceRoleKey: string, data: any) {
  console.log('\n📥 开始迁移到新项目...\n');
  console.log('🔷 目标项目:', targetUrl);

  const targetClient = createClient(targetUrl, targetServiceRoleKey);

  // 先执行数据库迁移脚本
  console.log('📋 步骤 1: 执行数据库迁移...');
  console.log('⚠️  请在新项目的 SQL Editor 中执行以下脚本:');
  console.log('   server/migrations/create_missing_tables.sql');
  console.log('\n按回车键继续，按 Ctrl+C 取消...');
  // await new Promise(resolve => process.stdin.once('data', resolve));

  // 导入数据
  console.log('\n📋 步骤 2: 导入数据...\n');

  let successCount = 0;
  let failCount = 0;

  for (const [table, records] of Object.entries(data)) {
    if (!records || !Array.isArray(records) || records.length === 0) {
      console.log(`⏭️  跳过: ${table} (无数据)`);
      continue;
    }

    try {
      console.log(`📤 导入表: ${table} (${records.length} 条)...`);

      // 使用 upsert 插入数据
      const { error } = await targetClient
        .from(table)
        .upsert(records, { onConflict: 'id' });

      if (error) {
        console.log(`   ❌ 失败: ${error.message}`);
        failCount++;
      } else {
        console.log(`   ✅ 成功`);
        successCount++;
      }
    } catch (e: any) {
      console.log(`   ❌ 异常: ${e.message}`);
      failCount++;
    }
  }

  console.log('\n📊 迁移完成');
  console.log(`   成功: ${successCount} 个表`);
  console.log(`   失败: ${failCount} 个表`);
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(80));
  console.log('步骤 1: 从源项目导出数据');
  console.log('='.repeat(80));

  const exportedData = await exportSourceData();

  if (!exportedData) {
    console.error('\n❌ 导出失败，请检查源项目配置和访问权限');
    return;
  }

  saveExportedData(exportedData);

  console.log('\n' + '='.repeat(80));
  console.log('步骤 2: 迁移到新项目');
  console.log('='.repeat(80));

  console.log('\n📋 要继续迁移，请提供新项目的信息:');
  console.log('1. 在 Supabase Dashboard 中打开 "superdxhua\'s Project"');
  console.log('2. 点击 Settings → API');
  console.log('3. 复制以下信息:');
  console.log('   - Project URL');
  console.log('   - service_role key');

  console.log('\n💡 然后运行迁移命令:');
  console.log('   npx tsx data-import/migrate-to-new-project.ts <NEW_PROJECT_URL> <SERVICE_ROLE_KEY>');
}

main().catch(error => {
  console.error('❌ 迁移失败:', error);
  process.exit(1);
});
