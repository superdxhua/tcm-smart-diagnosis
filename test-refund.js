/**
 * 微信支付退款测试脚本
 *
 * 测试流程：
 * 1. 创建充值订单
 * 2. 模拟支付回调
 * 3. 申请退款
 * 4. 查询退款
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// 测试用户 ID（使用真实存在的用户）
const TEST_USER_ID = 'b6df59e9-c4d4-458d-a201-1f0bce5fe0c7';

// 测试金额
const TEST_AMOUNT = 0.01;

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. 创建充值订单
async function createOrder() {
  log('\n===== 步骤 1：创建充值订单 =====', 'blue');

  try {
    const response = await axios.post(`${API_BASE}/payment/create-order`, {
      userId: TEST_USER_ID,
      amount: TEST_AMOUNT,
      paymentMethod: 'wechat'
    });

    console.log('创建订单响应:', JSON.stringify(response.data, null, 2));

    if (response.data.code === 200) {
      const orderNo = response.data.data.orderNo;
      log(`✅ 创建订单成功，订单号：${orderNo}`, 'green');
      return orderNo;
    } else {
      throw new Error(response.data.msg || '创建订单失败');
    }
  } catch (error) {
    log(`❌ 创建订单失败：${error.message}`, 'red');
    throw error;
  }
}

// 2. 模拟支付回调
async function simulatePaymentCallback(orderNo) {
  log('\n===== 步骤 2：模拟支付回调 =====', 'blue');

  try {
    const response = await axios.post(`${API_BASE}/payment/callback`, {
      orderNo,
      transactionId: `WX${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'paid'
    });

    console.log('支付回调响应:', JSON.stringify(response.data, null, 2));

    if (response.data.code === 200) {
      log(`✅ 支付回调成功`, 'green');
      await sleep(1000); // 等待订单状态更新
      return true;
    } else {
      throw new Error(response.data.msg || '支付回调失败');
    }
  } catch (error) {
    log(`❌ 支付回调失败：${error.message}`, 'red');
    throw error;
  }
}

// 3. 查询订单状态
async function getOrderStatus(orderNo) {
  log('\n===== 步骤 2.5：查询订单状态 =====', 'blue');

  try {
    const response = await axios.get(`${API_BASE}/payment/order/${orderNo}`);

    console.log('订单状态响应:', JSON.stringify(response.data, null, 2));

    if (response.data.code === 200) {
      const status = response.data.data.status;
      log(`✅ 订单状态：${status}`, status === 'paid' ? 'green' : 'yellow');
      return response.data.data;
    } else {
      throw new Error(response.data.msg || '查询订单状态失败');
    }
  } catch (error) {
    log(`❌ 查询订单状态失败：${error.message}`, 'red');
    throw error;
  }
}

// 4. 申请退款
async function applyRefund(orderNo, refundAmount) {
  log('\n===== 步骤 3：申请退款 =====', 'blue');

  try {
    const response = await axios.post(`${API_BASE}/payment/refund`, {
      orderNo,
      refundAmount,
      refundReason: '测试退款'
    });

    console.log('申请退款响应:', JSON.stringify(response.data, null, 2));

    if (response.data.code === 200) {
      const refundId = response.data.data.refundId;
      log(`✅ 申请退款成功，退款单号：${refundId}`, 'green');
      return refundId;
    } else {
      throw new Error(response.data.msg || '申请退款失败');
    }
  } catch (error) {
    log(`❌ 申请退款失败：${error.message}`, 'red');
    if (error.response) {
      console.log('错误详情:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// 5. 查询退款
async function queryRefund(refundId) {
  log('\n===== 步骤 4：查询退款 =====', 'blue');

  try {
    const response = await axios.get(`${API_BASE}/payment/refund/${refundId}`);

    console.log('查询退款响应:', JSON.stringify(response.data, null, 2));

    if (response.data.code === 200) {
      const refundStatus = response.data.data.status;
      log(`✅ 退款状态：${refundStatus}`, refundStatus === 'SUCCESS' ? 'green' : 'yellow');
      return response.data.data;
    } else {
      throw new Error(response.data.msg || '查询退款失败');
    }
  } catch (error) {
    log(`❌ 查询退款失败：${error.message}`, 'red');
    throw error;
  }
}

// 6. 获取用户余额
async function getUserBalance() {
  log('\n===== 步骤 5：获取用户余额 =====', 'blue');

  try {
    const response = await axios.get(`${API_BASE}/payment/balance`, {
      params: { userId: TEST_USER_ID }
    });

    console.log('用户余额响应:', JSON.stringify(response.data, null, 2));

    if (response.data.code === 200) {
      const balance = response.data.data.balance;
      log(`✅ 用户余额：${balance} 元`, 'green');
      return balance;
    } else {
      throw new Error(response.data.msg || '获取用户余额失败');
    }
  } catch (error) {
    log(`❌ 获取用户余额失败：${error.message}`, 'red');
    throw error;
  }
}

// 主测试流程
async function main() {
  log('\n========================================', 'blue');
  log('   微信支付退款测试', 'blue');
  log('========================================\n', 'blue');

  let orderNo = null;
  let refundId = null;

  try {
    // 1. 创建订单
    orderNo = await createOrder();

    // 2. 模拟支付回调
    await simulatePaymentCallback(orderNo);

    // 2.5 查询订单状态
    await getOrderStatus(orderNo);

    // 3. 申请退款
    refundId = await applyRefund(orderNo, TEST_AMOUNT);

    // 4. 查询退款
    await queryRefund(refundId);

    // 5. 获取用户余额
    await getUserBalance();

    log('\n========================================', 'green');
    log('   🎉 所有测试通过！', 'green');
    log('========================================\n', 'green');

    console.log('测试结果汇总：');
    console.log(`- 订单号：${orderNo}`);
    console.log(`- 退款单号：${refundId}`);
    console.log(`- 退款金额：${TEST_AMOUNT} 元`);

  } catch (error) {
    log('\n========================================', 'red');
    log('   ❌ 测试失败', 'red');
    log('========================================\n', 'red');
    console.error('错误详情:', error);
    process.exit(1);
  }
}

// 运行测试
main();
