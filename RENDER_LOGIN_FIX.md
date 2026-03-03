# Render 环境登录问题修复指南

## 问题描述

生产环境（Render）登录失败，提示"用户名或密码错误"。

## 问题原因

经过诊断，发现 Render 环境的 Supabase 数据库中 `public.users` 表不存在或无法访问，导致：
1. 数据库查询失败：`Could not find the table 'public.users' in the schema cache`
2. 登录验证无法执行
3. admin 用户不存在

## 解决方案

### 步骤 1：初始化 Supabase 数据库

通过 Supabase Dashboard 手动创建表和初始数据：

1. **访问 Supabase Dashboard**
   - URL: https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql
   - 项目 ID: `dwswtkfbtdohaftnklxx`

2. **打开 SQL Editor**
   - 点击左侧菜单的 "SQL Editor"
   - 创建新的查询窗口

3. **执行 SQL 脚本**

复制以下完整的 SQL 语句并执行：

```sql
-- 创建 users 表
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'individual' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  audit_status VARCHAR(50),
  openid VARCHAR(255),
  session_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建 user_permissions 表
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);

-- 插入 admin 用户（密码: 123456）
INSERT INTO public.users (username, password, role, is_active, created_at, updated_at)
VALUES (
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  true,
  NOW(),
  NOW()
);

-- 授予 ANON_KEY 访问权限（启用 RLS）
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- users 表策略
CREATE POLICY "Enable read access for all users"
  ON public.users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON public.users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON public.users FOR DELETE
  TO authenticated
  USING (true);

-- user_permissions 表策略
CREATE POLICY "Enable read access for all users"
  ON public.user_permissions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.user_permissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON public.user_permissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON public.user_permissions FOR DELETE
  TO authenticated
  USING (true);

-- 为 admin 用户创建权限
INSERT INTO public.user_permissions (user_id, is_active, created_at)
SELECT id, true, NOW()
FROM public.users
WHERE username = 'admin'
ON CONFLICT DO NOTHING;
```

4. **验证执行结果**
   - 执行后应显示 "Success" 或 "Query completed successfully"
   - 检查 Table Editor 中是否出现 `users` 和 `user_permissions` 表
   - 检查 `users` 表中是否包含 admin 用户

### 步骤 2：重新部署 Render 后端服务

数据库初始化完成后，需要重新部署 Render 后端服务：

1. **访问 Render Dashboard**
   - URL: https://dashboard.render.com/

2. **找到你的后端服务**
   - 服务名称通常是 `zhongyi-api` 或类似名称

3. **触发重新部署**
   - 点击 "Manual Deploy" → "Deploy latest commit"
   - 或者推送新代码到 GitHub 触发自动部署

4. **等待部署完成**
   - 查看部署日志确认服务启动成功

### 步骤 3：验证登录功能

1. **访问生产环境**
   - 前端 URL: https://zhongyihskhealth.com

2. **使用 admin 账号登录**
   - 用户名: `admin`
   - 密码: `123456`

3. **确认登录成功**
   - 应该能够成功登录
   - 进入管理后台

## 故障排查

### 问题：执行 SQL 时报错

**错误**: `relation "public.users" does not exist`

**解决方案**:
- 确保使用的是 Supabase Dashboard 的 SQL Editor
- 确保项目 ID 正确（`dwswtkfbtdohaftnklxx`）
- 重新执行完整的 SQL 脚本

### 问题：登录仍然失败

**排查步骤**:

1. **检查数据库表是否存在**
   ```bash
   node server/scripts/check-admin-render.js
   ```

2. **检查 Render 环境变量**
   - 确认 `COZE_SUPABASE_URL` 和 `COZE_SUPABASE_ANON_KEY` 已配置
   - 确认 `DATABASE_URL` 已配置

3. **查看 Render 服务日志**
   - 在 Render Dashboard 查看服务日志
   - 检查是否有数据库连接错误

4. **测试数据库连接**
   ```bash
   node server/scripts/reset-admin-password-render.js
   ```

### 问题：权限错误

**错误**: `permission denied for table users`

**解决方案**:
- 确保已执行 RLS（Row Level Security）策略创建语句
- 检查 Supabase Dashboard 中的表权限设置
- 确保使用的 Key 有正确的权限

## 相关脚本

项目中已创建以下诊断和修复脚本：

1. `server/scripts/init-database.sql` - 数据库初始化 SQL
2. `server/scripts/init-database.js` - 数据库初始化脚本
3. `server/scripts/check-admin-render.js` - 检查 admin 用户
4. `server/scripts/diagnose-database.js` - 诊断数据库状态
5. `server/scripts/reset-admin-password-render.js` - 重置 admin 密码

## 重要信息

- **Supabase 项目 ID**: `dwswtkfbtdohaftnklxx`
- **Supabase Dashboard**: https://app.supabase.com/project/dwswtkfbtdohaftnklxx
- **SQL Editor**: https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql
- **生产数据库 URL**: `https://dwswtkfbtdohaftnklxx.supabase.co`
- **Render Dashboard**: https://dashboard.render.com/

## 下一步

完成上述步骤后：

1. 确认 admin 用户可以登录
2. 测试其他功能是否正常
3. 如果需要，考虑实施数据库迁移工具（如 Prisma）以避免手动操作
4. 定期备份数据库

## 技术支持

如果问题仍未解决，请：

1. 检查 Supabase 项目状态是否正常
2. 检查 Render 服务是否正常运行
3. 查看相关服务的日志文件
4. 联系 Supabase 或 Render 支持
