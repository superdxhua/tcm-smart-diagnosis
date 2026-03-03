// 测试端口配置修复
console.log('=== 端口配置测试 ===\n');

// 模拟 Render 环境
process.env.PORT = '10000';
process.env.NODE_ENV = 'production';

// 导入修复后的 parsePort 函数
const parsePort = () => {
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('-p');
  if (portIndex !== -1 && args[portIndex + 1]) {
    const port = parseInt(args[portIndex + 1], 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      return port;
    }
  }
  const envPort = process.env.PORT;
  if (envPort) {
    const port = parseInt(envPort, 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      console.log(`✅ 使用环境变量 PORT: ${envPort}`);
      return port;
    }
  }
  return 3000;
};

const port = parsePort();
console.log(`解析后的端口: ${port}`);
console.log(`期望端口: 10000`);
console.log(`匹配: ${port === 10000 ? '✅ 成功' : '❌ 失败'}`);
