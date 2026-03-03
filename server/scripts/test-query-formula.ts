import { getSupabaseClient } from '../src/storage/database/supabase-client'

/**
 * 测试查询特定方证
 */
async function testQueryFormula() {
  console.log('[Test] 开始测试查询方证...')

  const supabase = getSupabaseClient()

  const testNames = ['理中汤', '半夏泻心汤', '小柴胡汤', '香砂六君子汤']

  try {
    for (const name of testNames) {
      console.log(`\n[Test] 查询方证: ${name}`)

      // 方法1: 使用 formula_name 字段
      const { data: data1, error: error1 } = await supabase
        .from('formulas')
        .select('*')
        .eq('formula_name', name)

      if (error1) {
        console.error(`[Test] 查询失败（formula_name）:`, error1)
      } else {
        console.log(`[Test] 查询成功（formula_name）: 找到 ${data1.length} 条`)
      }

      // 方法2: 使用 ilike 进行模糊查询
      const { data: data2, error: error2 } = await supabase
        .from('formulas')
        .select('*')
        .ilike('formula_name', `%${name}%`)

      if (error2) {
        console.error(`[Test] 查询失败（ilike）:`, error2)
      } else {
        console.log(`[Test] 查询成功（ilike）: 找到 ${data2.length} 条`)
        if (data2.length > 0) {
          console.log(`[Test] 实际名称: ${data2[0].formula_name}`)
        }
      }
    }

    // 列出所有方证名称
    console.log('\n[Test] 列出所有方证名称（前20条）...')
    const { data: allFormulas, error: allError } = await supabase
      .from('formulas')
      .select('formula_name')
      .order('formula_name')
      .limit(20)

    if (allError) {
      console.error('[Test] 查询失败:', allError)
    } else {
      allFormulas.forEach((f, i) => {
        console.log(`${i + 1}. ${f.formula_name}`)
      })
    }
  } catch (error) {
    console.error('[Test] 测试失败:', error)
  }
}

testQueryFormula()
  .then(() => {
    console.log('\n[Test] 测试完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Test] 测试失败:', error)
    process.exit(1)
  })
