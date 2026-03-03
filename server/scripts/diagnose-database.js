const { createClient } = require('@supabase/supabase-js');

// Render 环境数据库配置
const supabaseUrl = 'https://dwswtkfbtdohaftnklxx.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseDatabase() {
  try {
    console.log('=== 诊断 Render 数据库状态 ===');
    console.log('数据库 URL:', supabaseUrl);
    console.log('使用的 Key:', supabaseKey.substring(0, 20) + '...');

    console.log('\n⚠️ 重要说明：');
    console.log('错误 "Could not find the table \'public.users\' in the schema cache" 通常表示：');
    console.log('  1. users 表不在 public schema 中');
    console.log('  2. ANON_KEY 没有访问该表的权限');
    console.log('  3. 表确实不存在');
    console.log('  4. Supabase PostgREST API 配置问题');

    console.log('\n=== 可能的解决方案 ===');
    console.log('');
    console.log('方案 1: 使用 Supabase Dashboard 初始化数据库（推荐）');
    console.log('  1. 访问 https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql');
    console.log('  2. 打开 SQL Editor');
    console.log('  3. 执行以下 SQL：');
    console.log('');
    console.log('-- 创建 users 表');
    console.log('CREATE TABLE IF NOT EXISTS public.users (');
    console.log('  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),');
    console.log('  username VARCHAR(255) UNIQUE NOT NULL,');
    console.log('  password VARCHAR(255) NOT NULL,');
    console.log('  email VARCHAR(255),');
    console.log('  role VARCHAR(50) DEFAULT \'individual\' NOT NULL,');
    console.log('  is_active BOOLEAN DEFAULT true NOT NULL,');
    console.log('  audit_status VARCHAR(50),');
    console.log('  openid VARCHAR(255),');
    console.log('  session_key TEXT,');
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,');
    console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL');
    console.log(');');
    console.log('');
    console.log('-- 插入 admin 用户（密码: 123456）');
    console.log('INSERT INTO public.users (username, password, role, is_active, created_at, updated_at)');
    console.log('VALUES (');
    console.log('  \'admin\',');
    console.log('  \'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy\',');
    console.log('  \'admin\',');
    console.log('  true,');
    console.log('  NOW(),');
    console.log('  NOW()');
    console.log(');');
    console.log('');
    console.log('-- 授予 ANON_KEY 访问权限');
    console.log('ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('CREATE POLICY "Enable read access for all users"');
    console.log('  ON public.users FOR SELECT');
    console.log('  TO anon, authenticated');
    console.log('  USING (true);');
    console.log('');
    console.log('CREATE POLICY "Enable insert for authenticated users"');
    console.log('  ON public.users FOR INSERT');
    console.log('  TO authenticated');
    console.log('  WITH CHECK (true);');
    console.log('');
    console.log('CREATE POLICY "Enable update for authenticated users"');
    console.log('  ON public.users FOR UPDATE');
    console.log('  TO authenticated');
    console.log('  USING (true)');
    console.log('  WITH CHECK (true);');
    console.log('');

    console.log('方案 2: 获取 Service Role Key 并直接连接数据库');
    console.log('  1. 在 Supabase Dashboard 获取 service_role key');
    console.log('  2. 使用 PostgreSQL 客户端直接连接数据库');
    console.log('  3. 执行 SQL 创建表和数据');
    console.log('');

    console.log('方案 3: 检查 Render 环境配置');
    console.log('  1. 检查 Render Dashboard 的环境变量');
    console.log('  2. 确认 DATABASE_URL 是否正确');
    console.log('  3. 确认数据库连接是否正常');
    console.log('');

    console.log('方案 4: 使用数据库迁移工具');
    console.log('  如果项目使用 Prisma 或其他 ORM，运行迁移命令：');
    console.log('  npx prisma migrate deploy');
    console.log('  或');
    console.log('  npm run migration:run');
    console.log('');

    console.log('=== 推荐操作步骤 ===');
    console.log('1. 访问 Supabase Dashboard: https://app.supabase.com/project/dwswtkfbtdohaftnklxx');
    console.log('2. 检查 Table Editor，查看是否存在 users 表');
    console.log('3. 如果不存在，在 SQL Editor 中执行上面的 SQL');
    console.log('4. 执行后，admin 用户密码将为 123456');
    console.log('5. 在 Render 重新部署后端服务');
    console.log('');
    console.log('=== 需要的信息 ===');
    console.log('项目 ID: dwswtkfbtdohaftnklxx');
    console.log('Supabase URL: https://app.supabase.com/project/dwswtkfbtdohaftnklxx');
    console.log('SQL Editor: https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql');

  } catch (error) {
    console.error('\n❌ 诊断失败:', error.message);
    process.exit(1);
  }
}

diagnoseDatabase();
