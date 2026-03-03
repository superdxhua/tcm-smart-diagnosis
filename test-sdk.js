const { LLMClient, Config } = require('coze-coding-dev-sdk');
require('dotenv').config({ path: '/workspace/projects/.env' });

console.log('环境变量:');
console.log('COZE_WORKLOAD_IDENTITY_API_KEY:', process.env.COZE_WORKLOAD_IDENTITY_API_KEY ? '已配置' : '未配置');
console.log('COZE_INTEGRATION_BASE_URL:', process.env.COZE_INTEGRATION_BASE_URL);
console.log('COZE_INTEGRATION_MODEL_BASE_URL:', process.env.COZE_INTEGRATION_MODEL_BASE_URL);

const config = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
  baseUrl: process.env.COZE_INTEGRATION_BASE_URL,
  modelBaseUrl: process.env.COZE_INTEGRATION_MODEL_BASE_URL
});

console.log('\nConfig 配置:');
console.log('apiKey:', config.apiKey ? '已配置' : '未配置');
console.log('baseUrl:', config.baseUrl);
console.log('modelBaseUrl:', config.modelBaseUrl);

const client = new LLMClient(config);

console.log('\n开始测试...');
client.invoke([
  { role: 'user', content: '你好' }
], { temperature: 0.7 })
  .then(response => {
    console.log('成功:', response.content);
  })
  .catch(error => {
    console.error('失败:', error.message);
    console.error('完整错误:', error);
  });
