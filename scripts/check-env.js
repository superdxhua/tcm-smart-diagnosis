#!/usr/bin/env node

/**
 * 环境变量检查脚本
 *
 * 用途：检查项目环境变量是否正确配置
 * 使用：node scripts/check-env.js
 */

const path = require('path');
const fs = require('fs');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`❌ 文件不存在: ${filePath}`, colors.red);
    return false;
  }

  log(`✅ 文件存在: ${filePath}`, colors.green);

  // 读取文件内容
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // 检查关键环境变量
  const requiredVars = [
    'PROJECT_DOMAIN',
    'COZE_SUPABASE_URL',
    'COZE_SUPABASE_ANON_KEY',
    'WECHAT_APP_ID',
    'WECHAT_SECRET',
  ];

  let missingVars = [];

  requiredVars.forEach(varName => {
    const hasVar = lines.some(line => line.startsWith(`${varName}=`));
    if (hasVar) {
      log(`  ✅ ${varName}`, colors.green);
    } else {
      log(`  ❌ ${varName} (缺失)`, colors.red);
      missingVars.push(varName);
    }
  });

  return missingVars.length === 0;
}

function main() {
  log('=========================================', colors.blue);
  log('环境变量检查工具', colors.blue);
  log('=========================================\n', colors.blue);

  // 检查 .env.production
  log('检查 .env.production 文件...\n', colors.blue);
  const prodFile = path.join(__dirname, '../.env.production');
  const isProdValid = checkEnvFile(prodFile);

  // 检查 .env.local
  log('\n检查 .env.local 文件...\n', colors.blue);
  const localFile = path.join(__dirname, '../.env.local');
  const isLocalValid = checkEnvFile(localFile);

  // 总结
  log('\n=========================================', colors.blue);
  log('检查结果总结', colors.blue);
  log('=========================================\n', colors.blue);

  if (isProdValid) {
    log('✅ .env.production 配置正确', colors.green);
  } else {
    log('❌ .env.production 配置不完整', colors.red);
  }

  if (isLocalValid) {
    log('✅ .env.local 配置正确', colors.green);
  } else {
    log('⚠️  .env.local 配置不完整（仅影响本地开发）', colors.yellow);
  }

  log('\n提示：', colors.blue);
  log('1. 如果 .env.production 配置不完整，请添加缺失的环境变量', colors.blue);
  log('2. 如果在 Vercel 上部署失败，请在 Vercel Dashboard 中配置环境变量', colors.blue);
  log('3. 修改环境变量后，必须重新部署才能生效', colors.blue);
}

main();
