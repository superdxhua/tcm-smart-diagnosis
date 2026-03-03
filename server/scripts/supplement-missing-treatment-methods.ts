import { getSupabaseClient } from '../src/storage/database/supabase-client'

/**
 * 补充缺失的治法数据
 */
async function supplementMissingTreatmentMethods() {
  console.log('[Supplement] 开始补充缺失的治法数据...')

  const supabase = getSupabaseClient()

  // 缺失的治法列表
  const missingMethods = [
    '疏肝理脾',
    '益气健脾，渗湿止泻',
    '温补肾阳，化气生津',
    '益气和营，通阳行痹',
    '养心安神',
    '理气化痰，清胆和胃',
    '益气和营，调和营卫',
    '温清并用',
    '温经散寒止痛',
    '益气祛湿',
    '温经养血',
    '缓消癥块',
    '养血止血，调经安胎',
    '温肾阳，补肾精，泻相火，调冲任'
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

      // 插入新治法（id 字段就是治法名称）
      const { error: insertError } = await supabase
        .from('treatment_methods')
        .insert({
          id: method,
          description: '',  // 暂时空
          category: '治法',  // 治法
          sort_order: 0  // 暂时设为0
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
