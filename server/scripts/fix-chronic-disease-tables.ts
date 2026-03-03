import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getSupabaseClient } from '../src/storage/database/supabase-client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 修复慢性病关联表
 */
async function fixChronicDiseaseTables() {
  console.log('[Fix] 开始修复慢性病关联表...')

  const supabase = getSupabaseClient()

  try {
    // 读取 SQL 文件
    const sqlPath = path.join(__dirname, 'fix-chronic-disease-tables.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    console.log('[Fix] SQL 文件已读取')

    // 执行 SQL
    const { data, error } = await supabase.rpc('execute_sql', { sql })

    if (error) {
      console.error('[Fix] 执行 SQL 失败:', error)
      process.exit(1)
    }

    console.log('[Fix] SQL 执行成功')
    console.log('[Fix] 修复完成！')
  } catch (error) {
    console.error('[Fix] 修复失败:', error)
    process.exit(1)
  }
}

// 执行修复
fixChronicDiseaseTables()
  .then(() => {
    console.log('[Fix] 修复脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Fix] 修复脚本执行失败:', error)
    process.exit(1)
  })
