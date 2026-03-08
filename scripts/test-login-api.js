#!/usr/bin/env node

/**
 * 登录 API 测试脚本
 *
 * 用途：测试登录 API 是否可以正常访问
 * 使用：node scripts/test-login-api.js
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

function testLogin() {
  return new Promise((resolve, reject) => {
    const url = 'https://tcm-smart-diagnosis.onrender.com/api/auth/login';
    const data = JSON.stringify({
      username: 'test@example.com',
      password: 'password123',
    });

    log(`\n📡 测试登录 API: ${url}`, colors.blue);
    log(`📦 请求数据: ${data}`, colors.blue);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Origin': 'https://www.zhongyihskhealth.com',
      },
    };

    const startTime = Date.now();

    const req = https.request(url, options, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      log(`\n✅ 响应状态码: ${res.statusCode}`, colors.green);
      log(`⏱️  响应时间: ${responseTime}ms`, colors.green);
      log(`📋 响应 headers:`, colors.blue);

      const headers = res.headers;
      Object.keys(headers).forEach(key => {
        log(`  ${key}: ${headers[key]}`, colors.blue);
      });

      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        log(`\n📦 响应数据:`, colors.blue);
        try {
          const jsonData = JSON.parse(body);
          log(JSON.stringify(jsonData, null, 2), colors.green);
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            responseTime,
            data: jsonData,
            headers: res.headers,
          });
        } catch (e) {
          log(body, colors.green);
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            responseTime,
            data: body,
            headers: res.headers,
          });
        }
      });
    });

    req.on('error', (error) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      log(`\n❌ 请求失败`, colors.red);
      log(`⏱️  响应时间: ${responseTime}ms`, colors.yellow);
      log(`错误信息: ${error.message}`, colors.red);

      reject({
        success: false,
        error: error.message,
        responseTime,
      });
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  log('=========================================', colors.blue);
  log('登录 API 测试工具', colors.blue);
  log('=========================================\n', colors.blue);

  log('📋 测试配置:', colors.blue);
  log(`  - 小程序域名: https://www.zhongyihskhealth.com`, colors.blue);
  log(`  - 后端 API: https://tcm-smart-diagnosis.onrender.com`, colors.blue);
  log(`  - 登录接口: /api/auth/login`, colors.blue);

  try {
    const result = await testLogin();

    log('\n=========================================', colors.blue);
    log('测试结果总结', colors.blue);
    log('=========================================\n', colors.blue);

    if (result.success) {
      log('✅ 登录 API 测试成功', colors.green);
    } else {
      log('❌ 登录 API 测试失败', colors.red);
      log(`  状态码: ${result.statusCode}`, colors.red);
    }

    log('\n📋 CORS 检查:', colors.blue);
    if (result.headers['access-control-allow-origin']) {
      log(`  ✅ Access-Control-Allow-Origin: ${result.headers['access-control-allow-origin']}`, colors.green);
    } else {
      log(`  ⚠️  未发现 Access-Control-Allow-Origin header`, colors.yellow);
    }

    if (result.headers['access-control-allow-methods']) {
      log(`  ✅ Access-Control-Allow-Methods: ${result.headers['access-control-allow-methods']}`, colors.green);
    } else {
      log(`  ⚠️  未发现 Access-Control-Allow-Methods header`, colors.yellow);
    }

    if (result.headers['access-control-allow-headers']) {
      log(`  ✅ Access-Control-Allow-Headers: ${result.headers['access-control-allow-headers']}`, colors.green);
    } else {
      log(`  ⚠️  未发现 Access-Control-Allow-Headers header`, colors.yellow);
    }

    log('\n💡 提示:', colors.blue);
    log('1. 如果响应时间 < 1 秒，API 正常', colors.green);
    log('2. 如果响应时间 1-5 秒，属于冷启动（可接受）', colors.yellow);
    log('3. 如果响应时间 > 10 秒，需要优化冷启动', colors.red);
    log('4. 如果缺少 CORS headers，H5 端会有跨域问题', colors.yellow);

  } catch (error) {
    log('\n=========================================', colors.blue);
    log('测试结果总结', colors.blue);
    log('=========================================\n', colors.blue);

    log('❌ 测试失败', colors.red);
    log(`错误信息: ${error.error}`, colors.red);

    log('\n💡 可能的原因:', colors.blue);
    log('1. API 不可访问（检查网络连接）', colors.yellow);
    log('2. API 正在冷启动（等待后重试）', colors.yellow);
    log('3. API 配置错误（检查 Vercel 部署）', colors.red);
  }
}

main().catch(error => {
  log(`\n❌ 脚本执行失败: ${error.message}`, colors.red);
  process.exit(1);
});
