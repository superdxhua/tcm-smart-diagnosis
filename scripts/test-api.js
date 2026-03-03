#!/usr/bin/env node

/**
 * API 测试脚本
 *
 * 用途：测试后端 API 是否可以正常访问
 * 使用：node scripts/test-api.js
 */

const https = require('https');

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

function testApi(url) {
  return new Promise((resolve, reject) => {
    log(`\n📡 测试 API: ${url}`, colors.blue);

    const startTime = Date.now();

    https.get(url, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        log(`  ✅ 状态码: ${res.statusCode}`, colors.green);
        log(`  ⏱️  响应时间: ${responseTime}ms`, colors.green);
        log(`  📦 响应数据:`, colors.blue);

        try {
          const jsonData = JSON.parse(data);
          log(`    ${JSON.stringify(jsonData, null, 2)}`, colors.green);
        } catch (e) {
          log(`    ${data}`, colors.green);
        }

        resolve({
          success: true,
          statusCode: res.statusCode,
          responseTime,
          data,
        });
      });
    }).on('error', (error) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      log(`  ❌ 错误: ${error.message}`, colors.red);
      log(`  ⏱️  响应时间: ${responseTime}ms`, colors.yellow);

      reject({
        success: false,
        error: error.message,
        responseTime,
      });
    });
  });
}

async function main() {
  log('=========================================', colors.blue);
  log('API 测试工具', colors.blue);
  log('=========================================\n', colors.blue);

  const apiBaseUrl = process.env.PROJECT_DOMAIN || 'https://api.zhongyihskhealth.com';

  log(`🔗 API 基础 URL: ${apiBaseUrl}\n`, colors.blue);

  const tests = [
    {
      name: '健康检查（GET /api/health-records）',
      url: `${apiBaseUrl}/api/health-records`,
    },
    {
      name: '获取当前用户（GET /api/auth/me）',
      url: `${apiBaseUrl}/api/auth/me`,
    },
    {
      name: '获取用户列表（GET /api/members）',
      url: `${apiBaseUrl}/api/members`,
    },
    {
      name: '获取套餐列表（GET /api/packages/all）',
      url: `${apiBaseUrl}/api/packages/all`,
    },
  ];

  const results = [];

  for (const test of tests) {
    try {
      log(`\n${test.name}`, colors.blue);
      const result = await testApi(test.url);
      results.push({ ...test, ...result });
    } catch (error) {
      results.push({ ...test, ...error });
    }
  }

  // 总结
  log('\n=========================================', colors.blue);
  log('测试结果总结', colors.blue);
  log('=========================================\n', colors.blue);

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  log(`✅ 成功: ${successCount}/${results.length}`, colors.green);
  log(`❌ 失败: ${failCount}/${results.length}`, colors.red);

  if (failCount > 0) {
    log('\n❌ 失败的测试:', colors.red);
    results.filter(r => !r.success).forEach(r => {
      log(`  - ${r.name}`, colors.red);
      log(`    错误: ${r.error}`, colors.red);
    });
  }

  log('\n提示：', colors.blue);
  log('1. 如果所有测试都成功，说明 API 正常', colors.blue);
  log('2. 如果某些测试失败，可能是:', colors.blue);
  log('   - API 正在冷启动（150-200ms，属于正常）', colors.yellow);
  log('   - API 不可访问或配置错误', colors.red);
  log('   - 网络连接问题', colors.red);
}

main().catch(error => {
  log(`\n❌ 脚本执行失败: ${error.message}`, colors.red);
  process.exit(1);
});
