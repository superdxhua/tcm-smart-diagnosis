/**
 * Vercel 部署健康检查脚本
 * 用于检查 Vercel 部署后的 API 是否正常工作
 */

const testUrl = process.env.VERCEL_URL || process.env.VERCEL_DEPLOYMENT_URL || 'https://tcmsmarthealth.com';

console.log('='.repeat(60));
console.log('Vercel 部署健康检查');
console.log('='.repeat(60));
console.log(`测试地址: ${testUrl}`);
console.log('='.repeat(60));

async function testHealthCheck() {
  console.log('\n1. 测试健康检查接口...');
  try {
    const response = await fetch(`${testUrl}/api/health`);
    const data = await response.json();
    console.log('   状态:', response.status);
    console.log('   响应:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('   ✅ 健康检查通过');
    } else {
      console.log('   ❌ 健康检查失败');
    }
  } catch (error) {
    console.log('   ❌ 请求失败:', error.message);
  }
}

async function testLogin() {
  console.log('\n2. 测试登录接口...');
  try {
    const response = await fetch(`${testUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: '123456',
      }),
    });

    const data = await response.json();
    console.log('   状态:', response.status);
    console.log('   响应:', JSON.stringify(data, null, 2));

    if (response.ok && data.code === 200) {
      console.log('   ✅ 登录成功');
      console.log('   Token:', data.data.token.substring(0, 20) + '...');
      return data.data.token;
    } else {
      console.log('   ❌ 登录失败:', data.msg || '未知错误');
      return null;
    }
  } catch (error) {
    console.log('   ❌ 请求失败:', error.message);
    return null;
  }
}

async function testGetUsers(token) {
  console.log('\n3. 测试获取用户列表接口...');
  try {
    const response = await fetch(`${testUrl}/api/auth/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('   状态:', response.status);
    console.log('   用户数量:', data.data ? data.data.length : 0);

    if (response.ok && data.code === 200) {
      console.log('   ✅ 获取用户列表成功');
      console.log('   用户列表:', data.data.map(u => u.username).join(', '));
    } else {
      console.log('   ❌ 获取用户列表失败:', data.msg || '未知错误');
    }
  } catch (error) {
    console.log('   ❌ 请求失败:', error.message);
  }
}

async function testCORS() {
  console.log('\n4. 测试 CORS 配置...');
  try {
    const response = await fetch(`${testUrl}/api/health`, {
      method: 'OPTIONS',
    });

    console.log('   状态:', response.status);
    console.log('   CORS 头:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    });

    if (response.headers.get('Access-Control-Allow-Origin')) {
      console.log('   ✅ CORS 配置正确');
    } else {
      console.log('   ⚠️  CORS 头未设置');
    }
  } catch (error) {
    console.log('   ❌ 请求失败:', error.message);
  }
}

async function runTests() {
  await testHealthCheck();

  const token = await testLogin();

  if (token) {
    await testGetUsers(token);
  }

  await testCORS();

  console.log('\n' + '='.repeat(60));
  console.log('健康检查完成');
  console.log('='.repeat(60));
  console.log('\n如果所有测试都通过，说明 Vercel 部署正常。');
  console.log('如果有测试失败，请检查：');
  console.log('  1. Vercel 环境变量是否正确配置');
  console.log('  2. vercel.json 配置是否正确');
  console.log('  3. 数据库连接是否正常');
  console.log('  4. 查看 Vercel Dashboard 中的部署日志');
  console.log('='.repeat(60));
}

runTests();
