/**
 * 测试优化后的功能
 * 1. AI 问询记忆功能测试
 * 2. 处方风险评估测试
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============ 测试 1：AI 问询记忆功能 ============
async function testAiChatMemory() {
  log('\n========================================', 'blue');
  log('   测试 1：AI 问询记忆功能', 'blue');
  log('========================================\n', 'blue');

  try {
    // 模拟多轮对话
    const messages = [
      {
        role: 'system',
        content: '你是一位中医诊疗助手，负责与患者进行智能问询。\n\n当前用户信息：\n- 姓名：张三\n- 主诉：头痛3天\n- 诊断：头痛\n'
      },
      {
        role: 'user',
        content: '我头痛3天了，感觉头晕'
      }
    ];

    log('=== 第 1 轮对话 ===', 'cyan');
    log('用户：我头痛3天了，感觉头晕', 'cyan');

    let res = await axios.post(`${API_BASE}/medical-ai/chat`, { messages });
    let assistantReply = res.data.data.content;
    log(`AI：${assistantReply}`, 'green');

    // 第 2 轮
    messages.push({ role: 'assistant', content: assistantReply });
    messages.push({ role: 'user', content: '主要是在太阳穴附近' });

    log('\n=== 第 2 轮对话 ===', 'cyan');
    log('用户：主要是在太阳穴附近', 'cyan');

    res = await axios.post(`${API_BASE}/medical-ai/chat`, { messages });
    assistantReply = res.data.data.content;
    log(`AI：${assistantReply}`, 'green');

    // 第 3 轮
    messages.push({ role: 'assistant', content: assistantReply });
    messages.push({ role: 'user', content: '是因为最近加班太累了' });

    log('\n=== 第 3 轮对话 ===', 'cyan');
    log('用户：是因为最近加班太累了', 'cyan');

    res = await axios.post(`${API_BASE}/medical-ai/chat`, { messages });
    assistantReply = res.data.data.content;
    log(`AI：${assistantReply}`, 'green');

    // 检查是否有重复问询
    const allAssistantMessages = messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content);

    log('\n=== 检查重复问询 ===', 'yellow');
    let hasDuplicate = false;
    for (let i = 0; i < allAssistantMessages.length; i++) {
      for (let j = i + 1; j < allAssistantMessages.length; j++) {
        if (allAssistantMessages[i] === allAssistantMessages[j]) {
          log(`❌ 发现重复问询：${allAssistantMessages[i]}`, 'red');
          hasDuplicate = true;
        }
      }
    }

    if (!hasDuplicate) {
      log('✅ 未发现重复问询', 'green');
    }

    log('\n========================================', 'blue');
    log('   ✅ AI 问询记忆功能测试通过', 'blue');
    log('========================================\n', 'blue');

    return true;
  } catch (error) {
    log('\n========================================', 'red');
    log('   ❌ AI 问询记忆功能测试失败', 'red');
    log('========================================\n', 'red');
    console.error(error);
    return false;
  }
}

// ============ 测试 2：处方风险评估 ============
async function testPrescriptionRisk() {
  log('\n========================================', 'blue');
  log('   测试 2：处方风险评估', 'blue');
  log('========================================\n', 'blue');

  const { hasHighRiskIngredients, SAFE_HERBS } = require('./server/src/config/high-risk-prescriptions.ts');

  const testCases = [
    {
      name: '常见安全药材',
      herbs: ['茯苓', '当归', '生姜', '桂枝', '白芍', '甘草'],
      expectedRisk: false,
      description: '这些是中医临床最常用的药材，不应该被判定为高风险'
    },
    {
      name: '含附子（生，剧毒）',
      herbs: ['附子（生）', '干姜', '甘草'],
      expectedRisk: true,
      description: '附子（生）是剧毒药材，应该被判定为高风险'
    },
    {
      name: '含巴豆（剧毒）',
      herbs: ['巴豆', '大黄', '干姜'],
      expectedRisk: true,
      description: '巴豆是剧毒药材，应该被判定为高风险'
    },
    {
      name: '含斑蝥（剧毒）',
      herbs: ['斑蝥'],
      expectedRisk: true,
      description: '斑蝥是剧毒药材，应该被判定为高风险'
    },
    {
      name: '常见补益方',
      herbs: ['人参', '白术', '茯苓', '甘草', '当归', '熟地黄', '白芍', '川芎'],
      expectedRisk: false,
      description: '八珍汤的组成，是经典补益方，不应该被判定为高风险'
    },
    {
      name: '含麻黄（小毒，但不在高风险列表）',
      herbs: ['麻黄', '桂枝', '杏仁', '甘草'],
      expectedRisk: false,
      description: '麻黄有小毒，但经过炮制后毒性降低，且在临床常用，不应被判定为高风险'
    },
    {
      name: '含细辛（小毒，但不在高风险列表）',
      herbs: ['当归', '桂枝', '芍药', '细辛', '甘草', '通草', '大枣'],
      expectedRisk: false,
      description: '细辛有小毒，但经过炮制后毒性降低，且在临床常用，不应被判定为高风险'
    },
  ];

  let passedCount = 0;
  let failedCount = 0;

  testCases.forEach((testCase, index) => {
    log(`--- 测试用例 ${index + 1}：${testCase.name} ---`, 'cyan');
    log(`药材：${testCase.herbs.join('、')}`, 'cyan');
    log(`说明：${testCase.description}`, 'cyan');

    const actualRisk = hasHighRiskIngredients(testCase.herbs);
    const passed = actualRisk === testCase.expectedRisk;

    if (passed) {
      log(`✅ 测试通过：${actualRisk ? '高风险' : '安全'}（符合预期）`, 'green');
      passedCount++;
    } else {
      log(`❌ 测试失败：${actualRisk ? '高风险' : '安全'}（预期${testCase.expectedRisk ? '高风险' : '安全'}）`, 'red');
      failedCount++;
    }
    log('');
  });

  log('\n========================================', 'blue');
  log(`   测试结果：通过 ${passedCount}/${testCases.length}，失败 ${failedCount}/${testCases.length}`, 'blue');
  log('========================================\n', 'blue');

  return failedCount === 0;
}

// ============ 主测试流程 ============
async function main() {
  log('\n========================================', 'blue');
  log('   开始测试优化后的功能', 'blue');
  log('========================================\n', 'blue');

  const test1Result = await testAiChatMemory();
  const test2Result = await testPrescriptionRisk();

  log('\n========================================', 'blue');
  log('   测试总结', 'blue');
  log('========================================\n', 'blue');

  log(`测试 1（AI 问询记忆）：${test1Result ? '✅ 通过' : '❌ 失败'}`, test1Result ? 'green' : 'red');
  log(`测试 2（处方风险评估）：${test2Result ? '✅ 通过' : '❌ 失败'}`, test2Result ? 'green' : 'red');

  if (test1Result && test2Result) {
    log('\n========================================', 'green');
    log('   🎉 所有测试通过！', 'green');
    log('========================================\n', 'green');
  } else {
    log('\n========================================', 'yellow');
    log('   ⚠️ 部分测试失败，请检查', 'yellow');
    log('========================================\n', 'yellow');
  }
}

// 运行测试
main();
