-- 初始化数据库表结构
-- 适用于 Render 环境的 Supabase 数据库

-- 创建 users 表
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- 插入默认 admin 用户
-- 密码: 123456 (bcrypt 哈希，盐值 10)
INSERT INTO users (username, password, role, is_active, created_at, updated_at)
VALUES (
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  is_active = true,
  updated_at = NOW();

-- 为 admin 用户创建无限期的权限
INSERT INTO user_permissions (user_id, is_active, created_at)
SELECT id, true, NOW()
FROM users
WHERE username = 'admin'
ON CONFLICT DO NOTHING;
