#!/usr/bin/env node

/**
 * Render API 快速测试脚本
 *
 * 用途：测试 Render 部署的 NestJS 应用是否正常工作
 * 使用：node scripts/test-render-nest.js
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

function testApi(baseUrl, path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = `${baseUrl}${path}`;
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const startTime = Date.now();

    const req = https.request(url, options, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({
          path,
          statusCode: res.statusCode,
          responseTime,
          data: body,
          success: res.statusCode < 400,
        });
      });
    });

    req.on('error', (error) => {
      reject({
        path,
        error: error.message,
        success: false,
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function main() {
  log('=========================================', colors.blue);
  log('Render NestJS 应用测试工具', colors.blue);
  log('=========================================\n', colors.blue);

  const baseUrl = 'https://tcm-smart-diagnosis-api.onrender.com';

  log(`🔗 测试 URL: ${baseUrl}\n`, colors.blue);

  const tests = [
    {
      name: '健康检查',
      path: '/api',
      method: 'GET',
    },
    {
      name: '获取疾病分类',
      path: '/api/disease-categories',
      method: 'GET',
    },
    {
      name: '获取疾病分类树',
      path: '/api/disease-categories/tree',
      method: 'GET',
    },
  ];

  const results = [];

  for (const test of tests) {
    try {
      log(`\n📡 测试: ${test.name}`, colors.blue);
      log(`   ${test.method} ${test.path}`, colors.blue);

      const result = await testApi(baseUrl, test.path, test.method);
      results.push({ ...test, ...result });

      if (result.success) {
        log(`   ✅ 状态码: ${result.statusCode}`, colors.green);
        log(`   ⏱️  响应时间: ${result.responseTime}ms`, colors.green);

        if (result.responseTime < 1000) {
          log(`   🚀 性能: 优秀`, colors.green);
        } else if (result.responseTime < 5000) {
          log(`   ⚠️  性能: 良好`, colors.yellow);
        } else {
          log(`   ⚠️  性能: 慢（可能是冷启动）`, colors.yellow);
        }
      } else {
        log(`   ❌ 状态码: ${result.statusCode}`, colors.red);
      }

      // 显示响应数据
      if (result.data) {
        const preview = result.data.length > 200
          ? result.data.substring(0, 200) + '...'
          : result.data;
        log(`   📦 响应数据: ${preview}`, colors.blue);
      }
    } catch (error) {
      results.push({ ...test, ...error });
      log(`   ❌ 错误: ${error.error || error.message}`, colors.red);
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

  log('\n📊 详细结果:', colors.blue);
  results.forEach((r, i) => {
    const status = r.success ? '✅' : '❌';
    const time = r.responseTime ? `${r.responseTime}ms` : 'N/A';
    log(`  ${i + 1}. ${status} ${r.name} - ${time}`, r.success ? colors.green : colors.red);
  });

  // 性能分析
  log('\n💡 性能分析:', colors.blue);
  const avgResponseTime = results
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + r.responseTime, 0) / results.filter(r => r.responseTime).length;

  log(`  平均响应时间: ${Math.round(avgResponseTime)}ms`, colors.blue);

  if (avgResponseTime < 1000) {
    log(`  🚀 性能优秀！`, colors.green);
  } else if (avgResponseTime < 5000) {
    log(`  ⚠️  性能一般，可能有冷启动`, colors.yellow);
  } else {
    log(`  ❌ 性能较差，可能是 NestJS 应用启动慢`, colors.red);
  }

  // 架构分析
  log('\n🏗️  架构分析:', colors.blue);
  log(`  Render 正在运行完整的 NestJS 应用`, colors.blue);
  log(`  包含所有模块和路由`, colors.blue);
  log(`  启动时间可能较长（单体应用）`, colors.yellow);

  // 对比 Vercel
  log('\n📊 Vercel vs Render 对比:', colors.blue);
  log(`  Vercel: 49 个独立 Serverless Functions`, colors.blue);
  log(`  Render: 1 个完整的 NestJS 应用`, colors.blue);
  log(`  差异: 架构完全不同`, colors.yellow);

  // 下一步建议
  log('\n🎯 下一步建议:', colors.blue);

  if (successCount === results.length) {
    log(`  ✅ Render API 正常工作！`, colors.green);
    log(`  💡 建议操作：`, colors.blue);
    log(`     1. 测试完整功能（登录、查询等）`, colors.blue);
    log(`     2. 对比 Vercel 和 Render 的性能`, colors.blue);
    log(`     3. 决定是否迁移到 Render`, colors.blue);
  } else {
    log(`  ⚠️  部分测试失败，需要检查`, colors.yellow);
    log(`  💡 建议操作：`, colors.blue);
    log(`     1. 查看 Render Dashboard 的日志`, colors.blue);
    log(`     2. 检查环境变量配置`, colors.blue);
    log(`     3. 重新部署服务`, colors.blue);
  }
}

main().catch(error => {
  log(`\n❌ 脚本执行失败: ${error.message}`, colors.red);
  process.exit(1);
});
