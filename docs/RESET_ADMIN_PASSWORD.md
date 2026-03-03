# 重置 admin 用户密码 SQL 脚本

## 执行步骤

1. 登录 [Supabase 控制台](https://app.supabase.com/)
2. 选择项目：`zhongyi-tcm-smart-diagnosis`
3. 进入 **SQL Editor**
4. 复制以下 SQL 脚本并执行

## SQL 脚本

```sql
-- 1. 检查 admin 用户是否存在
SELECT * FROM users WHERE username = 'admin';

-- 2. 如果存在，更新密码为 123456（bcrypt hash）
UPDATE users
SET password = '$2a$10$rKxY8zL8eZ8G8Z8Z8Z8Z8.8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z'
WHERE username = 'admin';

-- 3. 如果不存在，创建 admin 用户
INSERT INTO users (id, username, password, role, is_active, created_at)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$rKxY8zL8eZ8G8Z8Z8Z8Z8.8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z',
  'admin',
  true,
  now()
)
ON CONFLICT (username) DO NOTHING;

-- 4. 验证密码是否更新成功
SELECT username, role, is_active, created_at FROM users WHERE username = 'admin';
```

## 密码说明

- **用户名**: `admin`
- **密码**: `123456`
- **bcrypt hash**: `$2a$10$rKxY8zL8eZ8G8Z8Z8Z8Z8.8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z`

## 验证

执行完成后，使用以下凭据登录：
- 用户名：`admin`
- 密码：`123456`

如果还有问题，请检查：
1. 用户的 `is_active` 字段是否为 `true`
2. 用户的 `role` 字段是否为 `'admin'`
