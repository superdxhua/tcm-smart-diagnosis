#!/usr/bin/env node

/**
 * 方证数据迁移脚本
 * 将 extended-formula-evidence.ts 中的 200 条方证数据迁移到 Supabase 数据库
 */

import { getSupabaseClient } from '../src/storage/database/supabase-client';
import { getAllFormulasWithSupplementary, FormulaEvidence } from '../src/ai-inquiry/extended-formula-evidence';

const supabase = getSupabaseClient();

// 六经分类映射
function getMeridianCategory(formula: FormulaEvidence, formulaName: string): string {
  // 根据方剂名称判断六经分类
  if (formulaName.includes('桂枝') ||
      formulaName.includes('麻黄') ||
      formulaName.includes('葛根') ||
      formulaName.includes('五苓') ||
      formulaName.includes('桃核')) {
    return '太阳';
  } else if (formulaName.includes('白虎') ||
             formulaName.includes('承气') ||
             formulaName.includes('茵陈') ||
             formulaName.includes('泻心')) {
    return '阳明';
  } else if (formulaName.includes('柴胡') ||
             formulaName.includes('大柴胡') ||
             formulaName.includes('小柴胡')) {
    return '少阳';
  } else if (formulaName.includes('理中') ||
             formulaName.includes('建中') ||
             formulaName.includes('附子理中')) {
    return '太阴';
  } else if (formulaName.includes('四逆') ||
             formulaName.includes('真武') ||
             formulaName.includes('黄连阿胶') ||
             formulaName.includes('地黄')) {
    return '少阴';
  } else if (formulaName.includes('乌梅') ||
             formulaName.includes('白头翁') ||
             formulaName.includes('当归四逆')) {
    return '厥阴';
  }
  return '其他';
}

async function migrateFormulas() {
  console.log('========================================');
  console.log('开始方证数据迁移');
  console.log('========================================\n');

  try {
    // 1. 读取所有方剂数据
    const allFormulas = getAllFormulasWithSupplementary();
    console.log(`📦 读取到 ${allFormulas.length} 条方剂数据\n`);

    // 2. 统计信息
    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    // 3. 逐条插入方剂数据
    for (let i = 0; i < allFormulas.length; i++) {
      const formula = allFormulas[i];
      const progress = `[${i + 1}/${allFormulas.length}]`;

      try {
        // 检查方剂是否已存在
        const { data: existing, error: checkError } = await supabase
          .from('formulas')
          .select('id')
          .eq('formula_name', formula.formula)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existing) {
          console.log(`${progress} ⏭️  跳过：${formula.formula}（已存在）`);
          skipCount++;
          continue;
        }

        // 确定六经分类
        const meridianCategory = getMeridianCategory(formula, formula.formula);

        // 插入方剂数据
        const { data: insertedFormula, error: insertError } = await supabase
          .from('formulas')
          .insert({
            formula_name: formula.formula,
            source: formula.source,
            chapter: formula.chapter,
            original_text: formula.originalText,
            mechanism: formula.mechanism,
            treatment_method: formula.treatmentMethod,
            indications: formula.indications,
            contraindications: formula.contraindications,
            dosage: formula.dosage,
            instructions: formula.instructions,
            meridian_category: meridianCategory,
            comment: `从 extended-formula-evidence.ts 迁移，来源：${formula.source}`,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        // 插入症状数据
        for (let j = 0; j < formula.keySymptoms.length; j++) {
          const symptom = formula.keySymptoms[j];
          await supabase
            .from('formula_symptoms')
            .insert({
              formula_id: insertedFormula.id,
              symptom: symptom,
              is_key: true,
              weight: formula.keySymptoms.length - j,  // 越靠前的症状权重越高
            });
        }

        // 创建历史版本（版本 1）
        await supabase
          .from('formula_versions')
          .insert({
            formula_id: insertedFormula.id,
            version: 1,
            data: JSON.stringify(formula),
            change_reason: '初始版本，从 extended-formula-evidence.ts 迁移',
          });

        console.log(`${progress} ✅ 成功：${formula.formula}`);
        successCount++;

      } catch (error) {
        console.error(`${progress} ❌ 失败：${formula.formula}`);
        console.error(`   错误：${error.message}`);
        errorCount++;
      }

      // 每 10 条输出一次进度
      if ((i + 1) % 10 === 0) {
        console.log(`\n--- 进度：${i + 1}/${allFormulas.length} ---\n`);
      }
    }

    // 4. 输出统计信息
    console.log('\n========================================');
    console.log('迁移完成');
    console.log('========================================');
    console.log(`✅ 成功：${successCount} 条`);
    console.log(`❌ 失败：${errorCount} 条`);
    console.log(`⏭️  跳过：${skipCount} 条`);
    console.log(`📊 总计：${allFormulas.length} 条\n`);

    // 5. 验证数据
    const { count } = await supabase
      .from('formulas')
      .select('*', { count: 'exact', head: true });

    console.log(`📋 数据库中的方剂数量：${count}\n`);

    // 6. 按六经统计
    const { data: meridianStats } = await supabase
      .from('formulas')
      .select('meridian_category')
      .not('meridian_category', 'is', null);

    const stats: Record<string, number> = {};
    meridianStats?.forEach(item => {
      const category = item.meridian_category || '其他';
      stats[category] = (stats[category] || 0) + 1;
    });

    console.log('📊 六经分类统计：');
    Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   ${category}：${count} 条`);
      });

    console.log('\n========================================');

  } catch (error) {
    console.error('迁移失败：', error);
    process.exit(1);
  }
}

// 执行迁移
migrateFormulas();
