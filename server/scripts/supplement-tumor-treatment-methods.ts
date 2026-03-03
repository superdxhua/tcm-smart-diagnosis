import { getSupabaseClient } from '../src/storage/database/supabase-client'

/**
 * 补充缺失的治法数据
 */
async function supplementMissingTreatmentMethods() {
  console.log('[Supplement] 开始补充缺失的治法数据...')

  const supabase = getSupabaseClient()

  // 缺失的治法列表
  const missingMethods = [
    '益气养血，通阳复脉',
    '滋养肺胃，降逆下气',
    '降逆化痰，益气和胃',
    '温阳化饮，健脾利水',
    '逐水消肿'
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
          description: '',
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
supplementMissingTreatmentMethods()
  .then(() => {
    console.log('[Supplement] 治法补充脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Supplement] 治法补充脚本执行失败:', error)
    process.exit(1)
  })
