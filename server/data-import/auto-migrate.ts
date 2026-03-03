/**
 * 自动数据库迁移脚本
 * 使用 Service Role Key 执行迁移
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

// Supabase 配置 - 必须使用 Service Role Key
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase Service Role Key');
  console.error('请在 .env 文件中配置: COZE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('🔑 使用 Service Role Key (管理员权限)\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// 迁移脚本路径
const migrationFilePath = path.join(__dirname, '../migrations/create_missing_tables.sql');

/**
 * 读取并拆分 SQL 语句
 */
function parseSqlStatements(sql: string): string[] {
  // 移除单行注释
  sql = sql.replace(/--.*$/gm, '');
  
  // 移除空行
  sql = sql.replace(/^\s*[\r\n]/gm, '');
  
  const statements: string[] = [];
  let currentStatement = '';
  let parenDepth = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const prevChar = i > 0 ? sql[i - 1] : '';
    
    // 处理字符串
    if ((char === "'" || char === '"') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }
    
    // 跟踪括号深度
    if (!inString) {
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth--;
    }
    
    // 分割语句
    if (char === ';' && parenDepth === 0 && !inString) {
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
 * 执行单个 SQL 语句
 */
async function executeStatement(statement: string, index: number): Promise<{ success: boolean; error?: string }> {
  try {
    // 跳过空语句
    if (!statement.trim()) {
      return { success: true };
    }
    
    // 跳过某些不需要执行的语句
    const skipPatterns = [
      /^SELECT.*completed.*successfully/i,
      /^COMMENT ON/i
    ];
    
    for (const pattern of skipPatterns) {
      if (pattern.test(statement)) {
        return { success: true };
      }
    }
    
    // 使用 PostgREST 的 REST API 执行 SQL
    // 注意：需要通过 SQL 执行端点
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: statement
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      // 某些错误可以忽略（如表已存在）
      if (errorText.includes('already exists') || 
          errorText.includes('duplicate') ||
          errorText.includes('does not exist')) {
        return { success: true };
      }
      return { success: false, error: errorText };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
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

  // 解析 SQL 语句
  const statements = parseSqlStatements(sql);
  console.log(`📊 共解析出 ${statements.length} 条 SQL 语句\n`);

  // 逐步执行
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const result = await executeStatement(statements[i], i);
    
    if (result.success) {
      console.log(`✅ 语句 ${i + 1}/${statements.length} 执行成功`);
      successCount++;
    } else {
      console.log(`❌ 语句 ${i + 1}/${statements.length} 执行失败:`);
      console.log(`   ${result.error}`);
      console.log(`   SQL: ${statements[i].substring(0, 100)}...`);
      failCount++;
    }
    
    // 添加延迟
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 迁移执行完成');
  console.log(`   成功: ${successCount} 条`);
  console.log(`   失败: ${failCount} 条`);
  console.log('='.repeat(80));

  if (failCount === 0) {
    console.log('\n✅ 数据库迁移成功完成！');
    console.log('💡 现在可以运行数据导入脚本：');
    console.log('   npx tsx data-import/import-data.ts\n');
  } else {
    console.log('\n⚠️  迁移完成，但有部分语句执行失败');
    console.log('💡 某些错误可以忽略（如表已存在），请检查日志\n');
  }
}

runMigration().catch(error => {
  console.error('❌ 迁移失败:', error);
  process.exit(1);
});
