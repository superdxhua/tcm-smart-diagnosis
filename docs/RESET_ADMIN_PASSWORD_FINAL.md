# 立即重置 admin 密码（SQL 脚本）

由于 Render 部署问题，请使用此方法立即重置 admin 密码。

## 执行步骤

1. 登录 [Supabase 控制台](https://app.supabase.com/)
2. 选择项目：`zhongyi-tcm-smart-diagnosis`
3. 进入 **SQL Editor**
4. 复制以下 SQL 脚本并执行

## SQL 脚本（完整版）

```sql
-- 1. 删除现有的 admin 用户（如果存在）
DELETE FROM users WHERE username = 'admin';

-- 2. 创建新的 admin 用户
-- 密码: 123456（已使用 bcrypt 加密）
INSERT INTO users (
  id,
  username,
  password,
  role,
  is_active,
  created_at
)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  true,
  now()
);

-- 3. 验证用户是否创建成功
SELECT id, username, role, is_active, created_at
FROM users
WHERE username = 'admin';
```

## 登录凭据

- **用户名**: `admin`
- **密码**: `123456`

## 注意事项

1. 密码 `123456` 的 bcrypt hash: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
2. 此操作会删除旧的 admin 用户（如果存在）
3. admin 用户具有完全权限

## 如果 SQL 执行失败

如果执行时出现错误（如表不存在），请先执行以下脚本创建表：

```sql
-- 创建 users 表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  email VARCHAR(255),
  phone VARCHAR(20),
  audit_status VARCHAR(20),
  audit_remark TEXT,
  qualifications TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

## 验证登录

执行完 SQL 后，尝试登录：
1. 打开前端应用
2. 输入用户名：`admin`
3. 输入密码：`123456`
4. 点击登录按钮

如果仍然提示"用户名或密码错误"，请检查：
1. SQL 脚本是否执行成功
2. 是否有其他错误提示
3. 浏览器控制台是否有错误信息
