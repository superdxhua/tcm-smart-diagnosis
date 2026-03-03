import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getSupabaseClient } from '../src/storage/database/supabase-client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 肿瘤方证关联数据迁移脚本
 */
async function migrateTumorFormulaRelations() {
  console.log('[Migrate] 开始迁移肿瘤方证关联数据...')

  const supabase = getSupabaseClient()

  // 读取数据文件
  const dataPath = path.join(__dirname, '../data/tumor-formula-relations.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  let totalInserted = 0
  let totalSkipped = 0

  try {
    for (const relation of data.formula_relations) {
      // 查询方证ID
      const { data: formula, error: formulaError } = await supabase
        .from('formulas')
        .select('id')
        .eq('formula_name', relation.formula_name)
        .single()

      if (formulaError || !formula) {
        console.warn(`[Migrate] 方证不存在: ${relation.formula_name}，跳过`)
        totalSkipped++
        continue
      }

      // 插入关联关系
      const { error: insertError } = await supabase
        .from('tumor_formula_relations')
        .insert({
          formula_id: formula.id,
          constitution_id: relation.constitution_id,
          pathogenesis_id: relation.pathogenesis_id,
          complication_id: relation.complication_id,
          symptom_id: relation.symptom_id,
          priority: relation.priority,
          indication: relation.indication,
          dosage_adjustment: relation.dosage_adjustment,
          duration: relation.duration
        })

      if (insertError) {
        console.error(`[Migrate] 插入关联失败: ${relation.formula_name}`, insertError)
      } else {
        console.log(`[Migrate] 关联已插入: ${relation.formula_name}`)
        totalInserted++
      }
    }

    console.log('\n[Migrate] 数据迁移完成！')
    console.log(`[Migrate] 共插入 ${totalInserted} 条数据`)
    console.log(`[Migrate] 跳过 ${totalSkipped} 条数据`)
  } catch (error) {
    console.error('[Migrate] 迁移失败:', error)
    process.exit(1)
  }
}

// 执行迁移
migrateTumorFormulaRelations()
  .then(() => {
    console.log('[Migrate] 迁移脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Migrate] 迁移脚本执行失败:', error)
    process.exit(1)
  })
