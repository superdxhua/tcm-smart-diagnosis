const bcrypt = require('bcrypt');

async function generatePasswordHash() {
  const password = '123456';

  console.log('生成新的密码哈希...\n');

  const rounds = [10, 12, 14];
  for (const round of rounds) {
    const hash = await bcrypt.hash(password, round);
    console.log(`Salt round ${round}:`);
    console.log(hash);
    console.log('');

    // 验证
    const isValid = await bcrypt.compare(password, hash);
    console.log(`验证结果: ${isValid ? '✅ 成功' : '❌ 失败'}`);
    console.log('---\n');
  }

  // 推荐使用 round 10
  const recommendedHash = await bcrypt.hash(password, 10);
  console.log('\n推荐使用的哈希（round 10）:');
  console.log(recommendedHash);
}

generatePasswordHash();
