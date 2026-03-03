import { getSupabaseClient } from '../src/storage/database/supabase-client'

/**
 * 补充慢性病相关治法
 */
async function supplementChronicDiseaseTreatmentMethods() {
  console.log('[Supplement] 开始补充慢性病相关治法...')

  const supabase = getSupabaseClient()

  // 缺失的治法列表
  const missingMethods = [
    '益气健脾，和胃止痛',
    '温肾通便',
    '益气润肠',
    '养血和血，健脾利湿',
    '和解少阳，化气利水'
  ]

  let insertedCount = 0
  let skippedCount = 0

  try {
    for (const method of missingMethods) {
      // 检查是否已存在
      const { data: existing, error: checkError } = await supabase
        .from('treatment_methods')
        .select('id')
        .eq('id', method)
        .single()

      if (existing) {
        console.log(`[Supplement] 治法已存在，跳过: ${method}`)
        skippedCount++
        continue
      }

      // 插入新治法
      const { error: insertError } = await supabase
        .from('treatment_methods')
        .insert({
          id: method,
          description: '',  // 暂时空
          category: '治法',
          sort_order: 0
        })

      if (insertError) {
        console.error(`[Supplement] 插入治法失败: ${method}`, insertError)
      } else {
        console.log(`[Supplement] 治法已插入: ${method}`)
        insertedCount++
      }
    }

    console.log('\n[Supplement] 治法补充完成！')
    console.log(`[Supplement] 插入数量: ${insertedCount}`)
    console.log(`[Supplement] 跳过数量: ${skippedCount}`)
  } catch (error) {
    console.error('[Supplement] 治法补充失败:', error)
    process.exit(1)
  }
}

// 执行补充
supplementChronicDiseaseTreatmentMethods()
  .then(() => {
    console.log('[Supplement] 治法补充脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Supplement] 治法补充脚本执行失败:', error)
    process.exit(1)
  })
