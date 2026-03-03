import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getSupabaseClient } from '../src/storage/database/supabase-client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 肿瘤数据库数据迁移脚本
 */
async function migrateTumorDatabase() {
  console.log('[Migrate] 开始迁移肿瘤数据库数据...')

  const supabase = getSupabaseClient()

  // 读取数据文件
  const dataPath = path.join(__dirname, '../data/tumor-database-data.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  let totalInserted = 0

  try {
    // 1. 导入体质分类数据
    console.log('\n[Migrate] 导入体质分类数据...')
    for (const constitution of data.constitutions) {
      const { error } = await supabase
        .from('tumor_constitutions')
        .insert({
          constitution_id: constitution.constitution_id,
          name: constitution.name,
          meridian_basis: constitution.meridian_basis,
          tongue_features: constitution.tongue_features,
          pulse_features: constitution.pulse_features,
          typical_symptoms: constitution.typical_symptoms,
          syndrome_combinations: constitution.syndrome_combinations,
          description: constitution.description
        })

      if (error) {
        console.error(`[Migrate] 插入体质失败: ${constitution.name}`, error)
      } else {
        console.log(`[Migrate] 体质已插入: ${constitution.name}`)
        totalInserted++
      }
    }

    // 2. 导入病机分类数据
    console.log('\n[Migrate] 导入病机分类数据...')
    for (const pathogenesis of data.pathogenesis) {
      const { error } = await supabase
        .from('tumor_pathogenesis')
        .insert({
          pathogenesis_id: pathogenesis.pathogenesis_id,
          category: pathogenesis.category,
          meridian_type: pathogenesis.meridian_type,
          description: pathogenesis.description,
          typical_manifestations: pathogenesis.typical_manifestations,
          treatment_principle: pathogenesis.treatment_principle
        })

      if (error) {
        console.error(`[Migrate] 插入病机失败: ${pathogenesis.category}`, error)
      } else {
        console.log(`[Migrate] 病机已插入: ${pathogenesis.category}`)
        totalInserted++
      }
    }

    // 3. 导入治疗变证数据
    console.log('\n[Migrate] 导入治疗变证数据...')
    for (const complication of data.treatment_complications) {
      const { error } = await supabase
        .from('treatment_complications')
        .insert({
          complication_id: complication.complication_id,
          treatment_type: complication.treatment_type,
          complication_name: complication.complication_name,
          meridian_type: complication.meridian_type,
          core_pathogenesis: complication.core_pathogenesis,
          key_symptoms: complication.key_symptoms,
          time_window: complication.time_window,
          severity: complication.severity,
          description: complication.description
        })

      if (error) {
        console.error(`[Migrate] 插入变证失败: ${complication.complication_name}`, error)
      } else {
        console.log(`[Migrate] 变证已插入: ${complication.complication_name}`)
        totalInserted++
      }
    }

    // 4. 导入症状支持数据
    console.log('\n[Migrate] 导入症状支持数据...')
    for (const symptom of data.symptom_support) {
      const { error } = await supabase
        .from('symptom_support_formulas')
        .insert({
          symptom_id: symptom.symptom_id,
          symptom_name: symptom.symptom_name,
          symptom_category: symptom.symptom_category,
          recommended_formula: symptom.recommended_formula,
          formula_source: symptom.formula_source,
          evidence: symptom.evidence,
          meridian_type: symptom.meridian_type,
          safety_level: symptom.safety_level,
          dosage_adjustment: symptom.dosage_adjustment,
          contraindications: symptom.contraindications
        })

      if (error) {
        console.error(`[Migrate] 插入症状支持失败: ${symptom.symptom_name}`, error)
      } else {
        console.log(`[Migrate] 症状支持已插入: ${symptom.symptom_name}`)
        totalInserted++
      }
    }

    // 5. 导入现代药物相互作用数据
    console.log('\n[Migrate] 导入现代药物相互作用数据...')
    for (const interaction of data.modern_drug_interactions) {
      const { error } = await supabase
        .from('modern_drug_interactions')
        .insert({
          herb_name: interaction.herb_name,
          modern_drug: interaction.modern_drug,
          interaction_type: interaction.interaction_type,
          severity: interaction.severity,
          mechanism: interaction.mechanism,
          recommendation: interaction.recommendation,
          evidence_source: interaction.evidence_source
        })

      if (error) {
        console.error(`[Migrate] 插入药物相互作用失败: ${interaction.herb_name} - ${interaction.modern_drug}`, error)
      } else {
        console.log(`[Migrate] 药物相互作用已插入: ${interaction.herb_name} - ${interaction.modern_drug}`)
        totalInserted++
      }
    }

    console.log('\n[Migrate] 数据迁移完成！')
    console.log(`[Migrate] 共插入 ${totalInserted} 条数据`)
  } catch (error) {
    console.error('[Migrate] 迁移失败:', error)
    process.exit(1)
  }
}

// 执行迁移
migrateTumorDatabase()
  .then(() => {
    console.log('[Migrate] 迁移脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Migrate] 迁移脚本执行失败:', error)
    process.exit(1)
  })
