/**
 * 新项目完整数据库迁移脚本
 * 用于在 superdxhua's Project 中创建完整的数据库架构
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

const supabaseUrl = process.env.COZE_SUPABASE_URL;
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 新项目数据库迁移工具\n');
console.log('📦 项目:', supabaseUrl);
console.log('🔑 密钥:', supabaseKey ? supabaseKey.substring(0, 30) + '...' : 'undefined');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 配置不完整');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 检查表是否存在
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('数据库迁移步骤');
  console.log('='.repeat(80));

  console.log('\n📋 步骤 1: 检查当前数据库状态\n');

  const tablesToCheck = [
    'formulas',
    'formula_symptoms',
    'disease_categories',
    'tumor_formula_relations',
    'formula_disease_relations',
    'chronic_disease_formulas',
    'formula_evidence'
  ];

  const existingTables: string[] = [];
  const missingTables: string[] = [];

  for (const table of tablesToCheck) {
    const exists = await checkTableExists(table);
    if (exists) {
      existingTables.push(table);
      console.log(`✅ 表存在: ${table}`);
    } else {
      missingTables.push(table);
      console.log(`❌ 表不存在: ${table}`);
    }
  }

  console.log(`\n📊 统计:`);
  console.log(`   已存在: ${existingTables.length} 个表`);
  console.log(`   缺失: ${missingTables.length} 个表`);

  if (missingTables.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('步骤 2: 执行数据库迁移');
    console.log('='.repeat(80));
    console.log('\n⚠️  由于 Supabase REST API 限制，需要手动执行迁移脚本');
    console.log('\n📋 请按照以下步骤操作:\n');
    console.log('1. 访问 Supabase Dashboard');
    console.log('   URL: https://supabase.com/dashboard/project/dwswtkfbtdohaftnklxx');
    console.log('\n2. 点击左侧的 "SQL Editor"');
    console.log('3. 点击 "New Query" 创建新查询');
    console.log('4. 复制以下文件的全部内容:');
    console.log('   server/migrations/create_missing_tables.sql');
    console.log('5. 粘贴到 SQL Editor 中');
    console.log('6. 点击 "Run" 按钮执行\n');
    console.log('⏸️  请先完成上述步骤，然后按回车键继续...');
  } else {
    console.log('\n✅ 所有表已存在，跳过迁移步骤');
  }

  console.log('\n' + '='.repeat(80));
  console.log('步骤 3: 数据导入准备');
  console.log('='.repeat(80));
  console.log('\n📋 准备导入以下数据:\n');
  console.log('   - 疾病分类数据（44 条）');
  console.log('   - 方剂数据');
  console.log('   - 方剂症状关联数据');
  console.log('   - 肿瘤方剂关系数据（43 条）');
  console.log('   - 方剂-疾病关联数据（3 条）');
  console.log('   - 慢性病方剂配置数据（15 条）');
  console.log('   - 循证医学证据数据（15 条）');

  console.log('\n💡 迁移完成后，执行以下命令导入数据:');
  console.log('   npx tsx data-import/import-all-data.ts\n');
}

main();
