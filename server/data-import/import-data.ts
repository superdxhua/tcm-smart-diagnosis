/**
 * 数据导入脚本
 * 用于将慢性病方证数据导入到 Supabase 数据库
 *
 * 使用方法：
 * 1. 确保 Supabase 环境变量已配置
 * 2. 运行：npm run import:data
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
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.SUPABASE_SERVICE_ROLE_KEY ||
                    process.env.COZE_SUPABASE_ANON_KEY || 
                    process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 环境变量');
  console.error('需要的环境变量: COZE_SUPABASE_URL 和 COZE_SUPABASE_ANON_KEY/COZE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔑 使用密钥类型:', supabaseKey.includes('service_role') ? 'Service Role Key (管理员权限)' : 'Anon Key (匿名权限)');

// 数据文件路径
const dataFilePath = path.join(__dirname, 'chronic-disease-data-updated.json');
const formulasFilePath = path.join(__dirname, 'formulas.json');

interface ImportData {
  formula_disease_relations: any[];
  chronic_disease_formulas: any[];
  formula_evidence: any[];
  tumor_formula_relations: any[];
}

interface FormulaData {
  formulas: any[];
}

/**
 * 导入基础方剂数据
 */
async function importFormulas(data: any[]): Promise<void> {
  console.log('\n📦 导入基础方剂数据...');

  let successCount = 0;
  let failCount = 0;

  for (const item of data) {
    try {
      const { error } = await supabase
        .from('formulas')
        .upsert(item, {
          onConflict: 'id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`  ❌ 导入失败: ${item.id}`, error.message);
        failCount++;
      } else {
        console.log(`  ✅ 导入成功: ${item.id} - ${item.name}`);
        successCount++;
      }
    } catch (error) {
      console.error(`  ❌ 导入异常: ${item.id}`, error.message);
      failCount++;
    }
  }

  console.log(`\n📊 基础方剂数据导入完成: 成功 ${successCount} 条, 失败 ${failCount} 条`);
}

/**
 * 导入方剂-疾病关联数据
 */
async function importFormulaDiseaseRelations(data: any[]): Promise<void> {
  console.log('\n📦 导入方剂-疾病关联数据...');

  let successCount = 0;
  let failCount = 0;

  for (const item of data) {
    try {
      const { error } = await supabase
        .from('formula_disease_relations')
        .upsert(item, {
          onConflict: 'formula_id,disease_category_id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`  ❌ 导入失败: ${item.id}`, error.message);
        failCount++;
      } else {
        console.log(`  ✅ 导入成功: ${item.id}`);
        successCount++;
      }
    } catch (error) {
      console.error(`  ❌ 导入异常: ${item.id}`, error.message);
      failCount++;
    }
  }

  console.log(`\n📊 方剂-疾病关联导入完成: 成功 ${successCount} 条, 失败 ${failCount} 条`);
}

/**
 * 导入慢性病方剂配置数据
 */
async function importChronicDiseaseFormulas(data: any[]): Promise<void> {
  console.log('\n📦 导入慢性病方剂配置数据...');

  let successCount = 0;
  let failCount = 0;

  for (const item of data) {
    try {
      const { error } = await supabase
        .from('chronic_disease_formulas')
        .upsert(item, {
          onConflict: 'formula_id,disease_category_id,disease_stage,symptom_pattern',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`  ❌ 导入失败: ${item.id}`, error.message);
        failCount++;
      } else {
        console.log(`  ✅ 导入成功: ${item.id}`);
        successCount++;
      }
    } catch (error) {
      console.error(`  ❌ 导入异常: ${item.id}`, error.message);
      failCount++;
    }
  }

  console.log(`\n📊 慢性病方剂配置导入完成: 成功 ${successCount} 条, 失败 ${failCount} 条`);
}

/**
 * 导入循证医学证据数据
 */
async function importFormulaEvidence(data: any[]): Promise<void> {
  console.log('\n📦 导入循证医学证据数据...');

  let successCount = 0;
  let failCount = 0;

  for (const item of data) {
    try {
      const { error } = await supabase
        .from('formula_evidence')
        .upsert(item, {
          onConflict: 'id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`  ❌ 导入失败: ${item.id}`, error.message);
        failCount++;
      } else {
        console.log(`  ✅ 导入成功: ${item.id}`);
        successCount++;
      }
    } catch (error) {
      console.error(`  ❌ 导入异常: ${item.id}`, error.message);
      failCount++;
    }
  }

  console.log(`\n📊 循证医学证据导入完成: 成功 ${successCount} 条, 失败 ${failCount} 条`);
}

/**
 * 导入肿瘤方剂关系数据
 */
async function importTumorFormulaRelations(data: any[]): Promise<void> {
  console.log('\n📦 导入肿瘤方剂关系数据...');

  let successCount = 0;
  let failCount = 0;

  for (const item of data) {
    try {
      const { error } = await supabase
        .from('tumor_formula_relations')
        .upsert(item, {
          onConflict: 'formula_id,disease_category_id,constitution_id,pathogenesis_id,complication_id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`  ❌ 导入失败: ${item.id}`, error.message);
        failCount++;
      } else {
        console.log(`  ✅ 导入成功: ${item.id}`);
        successCount++;
      }
    } catch (error) {
      console.error(`  ❌ 导入异常: ${item.id}`, error.message);
      failCount++;
    }
  }

  console.log(`\n📊 肿瘤方剂关系导入完成: 成功 ${successCount} 条, 失败 ${failCount} 条`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始导入慢性病方证数据...\n');

  try {
    // 读取数据文件
    if (!fs.existsSync(dataFilePath)) {
      console.error(`❌ 数据文件不存在: ${dataFilePath}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    const importData: ImportData = JSON.parse(fileContent);

    console.log('📋 数据文件加载成功');
    console.log(`   - 方剂-疾病关联: ${importData.formula_disease_relations.length} 条`);
    console.log(`   - 慢性病方剂配置: ${importData.chronic_disease_formulas.length} 条`);
    console.log(`   - 循证医学证据: ${importData.formula_evidence.length} 条`);
    console.log(`   - 肿瘤方剂关系: ${importData.tumor_formula_relations.length} 条`);

    // 先导入基础方剂数据
    console.log('\n========================================');
    console.log('第一步：导入基础方剂数据');
    console.log('========================================');

    if (fs.existsSync(formulasFilePath)) {
      const formulasContent = fs.readFileSync(formulasFilePath, 'utf-8');
      const formulaData: FormulaData = JSON.parse(formulasContent);
      await importFormulas(formulaData.formulas);
    } else {
      console.log('⚠️  基础方剂数据文件不存在，跳过导入');
    }

    // 导入扩展数据
    console.log('\n========================================');
    console.log('第二步：导入扩展数据');
    console.log('========================================');

    await importFormulaDiseaseRelations(importData.formula_disease_relations);
    await importChronicDiseaseFormulas(importData.chronic_disease_formulas);
    await importFormulaEvidence(importData.formula_evidence);
    await importTumorFormulaRelations(importData.tumor_formula_relations);

    console.log('\n✅ 所有数据导入完成！');

  } catch (error) {
    console.error('\n❌ 导入失败:', error);
    process.exit(1);
  }
}

// 执行导入
main();
