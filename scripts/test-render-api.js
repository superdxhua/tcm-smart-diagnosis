#!/usr/bin/env node

/**
 * Render API 测试脚本
 *
 * 用途：测试 Render 部署的 API 是否正常工作
 * 使用：node scripts/test-render-api.js
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
  log('Render API 测试工具', colors.blue);
  log('=========================================\n', colors.blue);

  // 从命令行参数获取基础 URL，或使用默认值
  const baseUrl = process.argv[2] || 'https://tcm-smart-diagnosis-api.onrender.com';

  log(`🔗 测试 URL: ${baseUrl}\n`, colors.blue);

  const tests = [
    {
      name: '获取患者列表',
      path: '/api/members',
      method: 'GET',
    },
    {
      name: '获取当前用户',
      path: '/api/auth/me',
      method: 'GET',
    },
    {
      name: '登录测试',
      path: '/api/auth/login',
      method: 'POST',
      data: {
        username: 'test@example.com',
        password: 'password123',
      },
    },
  ];

  const results = [];

  for (const test of tests) {
    try {
      log(`\n📡 测试: ${test.name}`, colors.blue);
      log(`   ${test.method} ${test.path}`, colors.blue);

      const result = await testApi(baseUrl, test.path, test.method, test.data || null);
      results.push({ ...test, ...result });

      if (result.success) {
        log(`   ✅ 状态码: ${result.statusCode}`, colors.green);
        log(`   ⏱️  响应时间: ${result.responseTime}ms`, colors.green);

        if (result.responseTime < 1000) {
          log(`   🚀 性能: 优秀`, colors.green);
        } else if (result.responseTime < 3000) {
          log(`   ⚠️  性能: 良好（可能有冷启动）`, colors.yellow);
        } else {
          log(`   ⚠️  性能: 慢（冷启动或休眠）`, colors.yellow);
        }
      } else {
        log(`   ❌ 状态码: ${result.statusCode}`, colors.red);
      }

      // 显示响应数据（截取前 200 字符）
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
    log(`  🚀 性能优秀！适合生产环境`, colors.green);
  } else if (avgResponseTime < 5000) {
    log(`  ⚠️  性能一般，可能有冷启动`, colors.yellow);
    log(`  💡 建议：如果频繁出现 > 2 秒的响应时间，考虑升级到 Starter 计划`, colors.yellow);
  } else {
    log(`  ❌ 性能较差，建议升级到 Starter 计划`, colors.red);
  }

  // 冷启动检测
  const coldStartCount = results.filter(r => r.responseTime > 2000).length;
  if (coldStartCount > 0) {
    log(`\n⚠️  检测到 ${coldStartCount} 次冷启动（响应时间 > 2 秒）`, colors.yellow);
    log(`  💡 这说明服务正在休眠，首次访问需要冷启动`, colors.yellow);
    log(`  💡 解决方案：`, colors.yellow);
    log(`     1. 升级到 Starter 计划（$25/月），彻底解决冷启动`, colors.green);
    log(`     2. 使用 Background Workers 定时预热（免费方案）`, colors.yellow);
  } else {
    log(`\n✅ 未检测到冷启动，服务状态良好`, colors.green);
  }

  // 下一步建议
  log('\n🎯 下一步建议:', colors.blue);

  if (successCount === results.length && avgResponseTime < 1000) {
    log(`  ✅ 所有测试通过，API 运行正常！`, colors.green);
    log(`  💡 建议操作：`, colors.blue);
    log(`     1. 继续监控 1-2 天，观察性能稳定性`, colors.blue);
    log(`     2. 如果一切正常，可以升级到 Starter 计划`, colors.blue);
    log(`     3. 配置 DNS，切换到 Render`, colors.blue);
  } else if (successCount === results.length && avgResponseTime < 5000) {
    log(`  ⚠️  所有测试通过，但响应时间较长`, colors.yellow);
    log(`  💡 建议操作：`, colors.blue);
    log(`     1. 等待 15 分钟后再次测试，观察冷启动情况`, colors.blue);
    log(`     2. 如果冷启动频繁，建议升级到 Starter 计划`, colors.blue);
  } else {
    log(`  ❌ 部分测试失败，需要检查配置`, colors.red);
    log(`  💡 建议操作：`, colors.blue);
    log(`     1. 查看 Render Dashboard 的部署日志`, colors.blue);
    log(`     2. 检查环境变量配置`, colors.blue);
    log(`     3. 重新部署服务`, colors.blue);
  }
}

main().catch(error => {
  log(`\n❌ 脚本执行失败: ${error.message}`, colors.red);
  process.exit(1);
});
