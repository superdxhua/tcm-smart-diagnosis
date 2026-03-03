import { getSupabaseClient } from '../src/storage/database/supabase-client'

/**
 * 列出所有方证名称
 */
async function listAllFormulas() {
  console.log('[List] 开始列出所有方证名称...')

  const supabase = getSupabaseClient()

  try {
    const { data: formulas, error } = await supabase
      .from('formulas')
      .select('id, formula_name')
      .order('formula_name')

    if (error) {
      console.error('[List] 获取方证失败:', error)
      process.exit(1)
    }

    console.log(`\n[List] 共找到 ${formulas.length} 个方证:\n`)

    formulas.forEach((formula, index) => {
      console.log(`${index + 1}. ${formula.formula_name} (${formula.id})`)
    })
  } catch (error) {
    console.error('[List] 列出失败:', error)
    process.exit(1)
  }
}

listAllFormulas()
  .then(() => {
    console.log('\n[List] 列出完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[List] 列出失败:', error)
    process.exit(1)
  })
