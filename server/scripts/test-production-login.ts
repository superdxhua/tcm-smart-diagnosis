import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { AuthService } from '@/auth/auth.service';

// 测试生产环境数据库连接和登录
async function testProductionLogin() {
  const app = await NestFactory.create(AppModule);

  // 获取 AuthService
  const authService = app.get(AuthService);

  try {
    console.log('=== 测试生产环境登录 ===');
    console.log('数据库 URL:', process.env.COZE_SUPABASE_URL);

    const result = await authService.login({
      username: 'admin',
      password: '123456'
    });

    console.log('✅ 登录成功！');
    console.log('用户信息:', result.user);
  } catch (error) {
    console.error('❌ 登录失败:', error.message);
  } finally {
    await app.close();
    process.exit(0);
  }
}

testProductionLogin();
