/**
 * 微信支付测试脚本
 * 用于测试支付下单、查询订单等功能
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 测试数据
const testData = {
  userId: 'fe0e38c4-e5b9-4567-83f9-1ff5fe4962e4', // 真实的测试用户 ID
  packageId: 'test-package-001',
  amount: 0.01, // 1分钱测试
  paymentMethod: 'wechat'
};

/**
 * 测试创建充值订单
 */
async function testCreateRechargeOrder() {
  console.log('=== 测试创建充值订单 ===');

  try {
    const response = await axios.post(`${BASE_URL}/api/payment/create-order`, {
      userId: testData.userId,
      amount: testData.amount,
      paymentMethod: testData.paymentMethod
    });

    console.log('充值订单创建成功:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('充值订单创建失败:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 测试创建套餐购买订单
 */
async function testCreatePackageOrder() {
  console.log('=== 测试创建套餐购买订单 ===');

  try {
    const response = await axios.post(`${BASE_URL}/api/payment/create-package-order`, {
      userId: testData.userId,
      packageId: testData.packageId,
      paymentMethod: testData.paymentMethod
    });

    console.log('套餐订单创建成功:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('套餐订单创建失败:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 测试查询订单状态
 */
async function testQueryOrder(orderNo) {
  console.log(`=== 测试查询订单状态: ${orderNo} ===`);

  try {
    const response = await axios.get(`${BASE_URL}/api/payment/order/${orderNo}`);

    console.log('订单状态查询成功:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('订单状态查询失败:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 测试模拟支付回调
 */
async function testPaymentCallback(orderNo) {
  console.log(`=== 测试模拟支付回调: ${orderNo} ===`);

  try {
    const response = await axios.post(`${BASE_URL}/api/payment/callback`, {
      orderNo: orderNo,
      transactionId: `4200001234567890${Date.now()}`,
      status: 'paid'
    });

    console.log('支付回调处理成功:', response.data);
  } catch (error) {
    console.error('支付回调处理失败:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 测试获取用户余额
 */
async function testGetUserBalance(userId) {
  console.log(`=== 测试获取用户余额: ${userId} ===`);

  try {
    const response = await axios.get(`${BASE_URL}/api/payment/balance`, {
      params: { userId }
    });

    console.log('用户余额查询成功:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('用户余额查询失败:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始测试微信支付功能\n');

  try {
    // 测试 1: 创建充值订单
    console.log('\n【测试 1】创建充值订单');
    const rechargeOrder = await testCreateRechargeOrder();
    console.log(`订单号: ${rechargeOrder.orderNo}`);
    console.log(`支付二维码: ${rechargeOrder.qrCode}`);

    // 测试 2: 查询订单状态
    console.log('\n【测试 2】查询订单状态');
    await testQueryOrder(rechargeOrder.orderNo);

    // 测试 3: 模拟支付回调
    console.log('\n【测试 3】模拟支付回调');
    await testPaymentCallback(rechargeOrder.orderNo);

    // 测试 4: 查询订单状态（支付后）
    console.log('\n【测试 4】查询订单状态（支付后）');
    await testQueryOrder(rechargeOrder.orderNo);

    // 测试 5: 获取用户余额
    console.log('\n【测试 5】获取用户余额');
    await testGetUserBalance(testData.userId);

    console.log('\n✅ 所有测试通过！');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
runTests();
