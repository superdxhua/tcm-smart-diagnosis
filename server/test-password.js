const bcrypt = require('bcrypt');

const password = '123456';
const hash = '$2b$10$cXqZuNp3mHf8e18Dqpu9Iud.wKJMkWLCbTmG3LVGs6V/TiefSYHju';

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('错误:', err);
    process.exit(1);
  }
  console.log('密码验证结果:', result);
  process.exit(0);
});
