import { getSupabaseClient } from '../src/storage/database/supabase-client'

/**
 * 列出所有表
 */
async function listAllTables() {
  console.log('[List] 开始列出所有表...')

  const supabase = getSupabaseClient()

  try {
    // 查询所有表
    const { data: tables, error } = await supabase
      .rpc('get_tables')

    if (error) {
      console.error('[List] 获取表失败:', error)
      process.exit(1)
    }

    console.log(`\n[List] 共找到 ${tables.length} 个表:\n`)

    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table}`)
    })
  } catch (error) {
    console.error('[List] 列出失败:', error)
    process.exit(1)
  }
}

listAllTables()
  .then(() => {
    console.log('\n[List] 列出完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[List] 列出失败:', error)
    process.exit(1)
  })
