/**
 * CORS 测试脚本
 * 用于测试 API 的 CORS 配置是否正确
 */

const testUrl = 'http://localhost:3000';

console.log('='.repeat(60));
console.log('CORS 配置测试');
console.log('='.repeat(60));
console.log(`测试地址: ${testUrl}`);
console.log('='.repeat(60));

async function testOptions() {
  console.log('\n1. 测试 OPTIONS 预检请求...');
  try {
    const response = await fetch(`${testUrl}/api/auth/login`, {
      method: 'OPTIONS',
    });

    console.log('   状态:', response.status);
    console.log('   CORS 响应头:');
    console.log('     - Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
    console.log('     - Access-Control-Allow-Methods:', response.headers.get('Access-Control-Allow-Methods'));
    console.log('     - Access-Control-Allow-Headers:', response.headers.get('Access-Control-Allow-Headers'));
    console.log('     - Access-Control-Allow-Credentials:', response.headers.get('Access-Control-Allow-Credentials'));
    console.log('     - Access-Control-Max-Age:', response.headers.get('Access-Control-Max-Age'));

    if (response.status === 204) {
      console.log('   ✅ OPTIONS 预检请求成功');
    } else {
      console.log('   ❌ OPTIONS 预检请求失败');
    }
  } catch (error) {
    console.log('   ❌ 请求失败:', error.message);
  }
}

async function testPost() {
  console.log('\n2. 测试 POST 请求...');
  try {
    const response = await fetch(`${testUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
      },
      body: JSON.stringify({
        username: 'admin',
        password: '123456',
      }),
    });

    console.log('   状态:', response.status);
    console.log('   CORS 响应头:');
    console.log('     - Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
    console.log('     - Access-Control-Allow-Credentials:', response.headers.get('Access-Control-Allow-Credentials'));

    const data = await response.json();
    console.log('   响应数据:', JSON.stringify(data, null, 2));

    if (response.ok && data.code === 200) {
      console.log('   ✅ POST 请求成功');
      return data.data.token;
    } else {
      console.log('   ❌ POST 请求失败:', data.msg || '未知错误');
      return null;
    }
  } catch (error) {
    console.log('   ❌ 请求失败:', error.message);
    return null;
  }
}

async function testCrossOrigin() {
  console.log('\n3. 测试跨域请求（模拟浏览器）...');
  try {
    const response = await fetch(`${testUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://example.com', // 模拟不同的来源
      },
      body: JSON.stringify({
        username: 'admin',
        password: '123456',
      }),
    });

    console.log('   状态:', response.status);
    console.log('   CORS 响应头:');
    console.log('     - Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));

    const data = await response.json();
    console.log('   响应数据:', JSON.stringify(data, null, 2));

    if (response.ok && data.code === 200) {
      console.log('   ✅ 跨域请求成功');
    } else {
      console.log('   ❌ 跨域请求失败:', data.msg || '未知错误');
    }
  } catch (error) {
    console.log('   ❌ 请求失败:', error.message);
  }
}

async function testHealthCheck() {
  console.log('\n4. 测试健康检查接口...');
  try {
    const response = await fetch(`${testUrl}/api/health`);
    console.log('   状态:', response.status);
    console.log('   CORS 响应头:');
    console.log('     - Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));

    const data = await response.json();
    console.log('   响应数据:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('   ✅ 健康检查成功');
    } else {
      console.log('   ❌ 健康检查失败');
    }
  } catch (error) {
    console.log('   ❌ 请求失败:', error.message);
  }
}

async function runTests() {
  await testOptions();
  await testPost();
  await testCrossOrigin();
  await testHealthCheck();

  console.log('\n' + '='.repeat(60));
  console.log('CORS 测试完成');
  console.log('='.repeat(60));
  console.log('\n检查要点：');
  console.log('  1. OPTIONS 请求应该返回 204 状态码');
  console.log('  2. 所有响应都应该包含 Access-Control-Allow-Origin: *');
  console.log('  3. POST 请求应该能够正常工作');
  console.log('  4. 跨域请求应该被允许');
  console.log('='.repeat(60));
}

runTests();
