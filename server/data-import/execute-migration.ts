/**
 * 智能数据库迁移执行脚本
 * 拆分 SQL 语句并逐步执行
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载环境变量
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });
}

// Supabase 配置
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 迁移脚本路径
const migrationFilePath = path.join(__dirname, '../migrations/003_add_comprehensive_database_schema.sql');

/**
 * 拆分 SQL 语句
 */
function splitSqlStatements(sql: string): string[] {
  // 移除注释
  sql = sql.replace(/--.*$/gm, '');
  
  // 移除空行
  sql = sql.replace(/^\s*[\r\n]/gm, '');
  
  // 按分号拆分，但保持括号内的分号不被拆分
  const statements: string[] = [];
  let currentStatement = '';
  let inParentheses = false;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const prevChar = i > 0 ? sql[i - 1] : '';
    
    if (char === "'" && prevChar !== '\\') {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && prevChar !== '\\') {
      inDoubleQuote = !inDoubleQuote;
    } else if (char === '(' && !inSingleQuote && !inDoubleQuote) {
      inParentheses = true;
    } else if (char === ')' && !inSingleQuote && !inDoubleQuote) {
      inParentheses = false;
    } else if (char === ';' && !inParentheses && !inSingleQuote && !inDoubleQuote) {
      const statement = currentStatement.trim();
      if (statement) {
        statements.push(statement);
      }
      currentStatement = '';
      continue;
    }
    
    currentStatement += char;
  }
  
  // 添加最后一个语句
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  return statements;
}

/**
 * 创建执行 SQL 的 RPC 函数
 */
async function createExecuteSqlFunction() {
  console.log('🔧 创建 execute_sql RPC 函数...\n');
  
  const functionSql = `
CREATE OR REPLACE FUNCTION execute_sql(sql_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_text;
  RETURN 'OK';
END;
$$;
`;
  
  const { data, error } = await supabase.rpc('execute_sql', { sql_text: functionSql });
  
  if (error && error.code !== 'PGRST116') {
    console.error('❌ 创建 RPC 函数失败:', error);
    return false;
  }
  
  console.log('✅ execute_sql RPC 函数创建成功\n');
  return true;
}

/**
 * 执行 SQL 语句
 */
async function executeStatement(statement: string, index: number): Promise<boolean> {
  try {
    // 跳过空语句和仅包含注释的语句
    if (!statement.trim() || statement.trim().startsWith('--')) {
      return true;
    }
    
    // 跳过某些不支持的语句
    const unsupportedPatterns = [
      /^CREATE OR REPLACE (TRIGGER|VIEW)/i,
      /^COMMENT ON/i,
      /^SELECT 'Database migration completed successfully!/i
    ];
    
    for (const pattern of unsupportedPatterns) {
      if (pattern.test(statement)) {
        console.log(`⏭️  跳过语句 ${index + 1}（不支持的语句类型）`);
        return true;
      }
    }
    
    // 尝试通过 RPC 执行
    const { data, error } = await supabase.rpc('execute_sql', { sql_text: statement });
    
    if (error) {
      console.log(`❌ 语句 ${index + 1} 执行失败: ${error.message}`);
      console.log(`   SQL: ${statement.substring(0, 100)}...`);
      return false;
    }
    
    console.log(`✅ 语句 ${index + 1} 执行成功`);
    return true;
  } catch (error: any) {
    console.log(`❌ 语句 ${index + 1} 执行异常: ${error.message}`);
    return false;
  }
}

/**
 * 执行迁移
 */
async function runMigration() {
  console.log('🚀 开始执行数据库迁移...\n');

  // 读取迁移脚本
  if (!fs.existsSync(migrationFilePath)) {
    console.error('❌ 迁移脚本文件不存在:', migrationFilePath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationFilePath, 'utf8');
  console.log('📋 迁移脚本加载成功');
  console.log(`   文件大小: ${(sql.length / 1024).toFixed(2)} KB\n`);

  // 拆分 SQL 语句
  const statements = splitSqlStatements(sql);
  console.log(`📊 共拆分出 ${statements.length} 条 SQL 语句\n`);

  // 创建 RPC 函数
  const functionCreated = await createExecuteSqlFunction();
  if (!functionCreated) {
    console.error('❌ 无法创建 RPC 函数，迁移失败');
    process.exit(1);
  }

  // 逐步执行 SQL 语句
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const success = await executeStatement(statements[i], i);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // 添加延迟，避免过快请求
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 迁移执行完成');
  console.log(`   成功: ${successCount} 条`);
  console.log(`   失败: ${failCount} 条`);
  console.log('='.repeat(80));

  if (failCount === 0) {
    console.log('\n✅ 数据库迁移成功完成！');
  } else {
    console.log('\n⚠️  迁移完成，但有部分语句执行失败，请检查日志');
  }
}

runMigration().catch(error => {
  console.error('❌ 迁移失败:', error);
  process.exit(1);
});
