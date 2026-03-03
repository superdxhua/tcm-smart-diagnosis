import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getSupabaseClient } from '../src/storage/database/supabase-client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 慢性病方证数据迁移脚本
 *
 * 功能：将慢性病方证数据导入到数据库
 */
async function migrateChronicDiseaseFormulas() {
  console.log('[Migrate] 开始导入慢性病方证数据...')

  // 读取数据文件
  const dataPath = path.join(__dirname, '../data/chronic-disease-formulas.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  const supabase = getSupabaseClient()

  // 统计信息
  let totalDiseases = 0
  let totalRelations = 0
  let totalSymptoms = 0
  let totalNursing = 0

    try {
    // 遍历每个慢性病
    for (const disease of data.chronic_diseases) {
      console.log(`[Migrate] 处理慢性病: ${disease.name}`)

      // 1. 查询慢性病ID（不再插入，因为已存在）
      const { data: existingDisease, error: diseaseError } = await supabase
        .from('chronic_diseases')
        .select('id')
        .eq('code', disease.code)
        .single()

      if (diseaseError || !existingDisease) {
        console.error(`[Migrate] 慢性病不存在: ${disease.name}`, diseaseError)
        continue
      }

      const diseaseId = existingDisease.id
      totalDiseases++

      console.log(`[Migrate] 慢性病已找到，ID: ${diseaseId}`)

      // 2. 插入方证与慢性病关联
      for (const formulaData of disease.formulas) {
        // 查询方证ID
        const { data: formula, error: formulaError } = await supabase
          .from('formulas')
          .select('id')
          .eq('formula_name', formulaData.formula_name)
          .single()

        if (formulaError || !formula) {
          console.warn(`[Migrate] 方证不存在: ${formulaData.formula_name}，跳过`)
          continue
        }

        // 插入关联关系
        const { error: relationError } = await supabase
          .from('formula_chronic_relations')
          .insert({
            formula_id: formula.id,
            chronic_disease_id: diseaseId,
            priority: formulaData.priority,
            indication: formulaData.indication,
            contraindication: formulaData.contraindication,
            dosage_adjustment: formulaData.dosage_adjustment,
            duration: formulaData.duration
          })

        if (relationError) {
          console.error(`[Migrate] 插入关联失败: ${formulaData.formula_name}`, relationError)
        } else {
          totalRelations++
          console.log(`[Migrate] 关联已插入: ${formulaData.formula_name} -> ${disease.name}`)
        }

        // 插入症状（从 formulaData.symptoms 中提取）
        if (formulaData.symptoms && formulaData.symptoms.length > 0) {
          for (const symptom of formulaData.symptoms) {
            const { error: symptomError } = await supabase
              .from('chronic_disease_symptoms')
              .insert({
                chronic_disease_id: diseaseId,
                symptom_name: symptom,
                symptom_type: '主要',
                frequency: '常见',
                description: `${disease.name}的主要症状之一`
              })

            if (!symptomError) {
              totalSymptoms++
            }
          }
        }
      }

      // 3. 插入调养建议
      if (disease.nursing_recommendations && disease.nursing_recommendations.length > 0) {
        for (const nursing of disease.nursing_recommendations) {
          const { error: nursingError } = await supabase
            .from('nursing_recommendations')
            .insert({
              chronic_disease_id: diseaseId,
              recommendation_type: nursing.type,
              content: nursing.content,
              priority: nursing.priority
            })

          if (!nursingError) {
            totalNursing++
          }
        }
      }

      console.log(`[Migrate] ${disease.name} 处理完成\n`)
    }

    console.log('\n[Migrate] 导入完成！')
    console.log(`[Migrate] 慢性病数量: ${totalDiseases}`)
    console.log(`[Migrate] 方证关联数量: ${totalRelations}`)
    console.log(`[Migrate] 症状数量: ${totalSymptoms}`)
    console.log(`[Migrate] 调养建议数量: ${totalNursing}`)
  } catch (error) {
    console.error('[Migrate] 迁移失败:', error)
    process.exit(1)
  }
}

// 执行迁移
migrateChronicDiseaseFormulas()
  .then(() => {
    console.log('[Migrate] 迁移脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Migrate] 迁移脚本执行失败:', error)
    process.exit(1)
  })
