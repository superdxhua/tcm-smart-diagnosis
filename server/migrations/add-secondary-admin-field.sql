-- 添加次级管理员字段到 users 表
-- 执行时间: 2025-02-21

-- 1. 添加次级管理员字段
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS secondary_admin VARCHAR(100);

-- 2. 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_secondary_admin
ON public.users(secondary_admin);

-- 3. 验证字段是否添加成功
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'secondary_admin';

-- 注意：
-- - secondary_admin 字段用于存储次级管理员信息（可以是手机号或人名）
-- - 该字段为可选字段，允许 NULL 值
-- - 添加了索引以支持按次级管理员快速查询和排序
