# 更新充值订单表结构

## 说明

由于添加了手动充值功能，需要在 `recharge_orders` 表中添加以下字段：

- `screenshot_url` - 截图URL
- `audit_status` - 审核状态（pending/submitted/approved/rejected）
- `audit_remark` - 审核备注
- `audited_by` - 审核人ID
- `audited_at` - 审核时间

## SQL 脚本

请在 Supabase 控制台的 SQL 编辑器中执行以下命令：

```sql
-- 添加截图URL字段
ALTER TABLE public.recharge_orders
ADD COLUMN IF NOT EXISTS screenshot_url VARCHAR(512);

-- 添加审核状态字段
ALTER TABLE public.recharge_orders
ADD COLUMN IF NOT EXISTS audit_status VARCHAR(20) DEFAULT 'pending' NOT NULL;

-- 添加审核备注字段
ALTER TABLE public.recharge_orders
ADD COLUMN IF NOT EXISTS audit_remark TEXT;

-- 添加审核人ID字段
ALTER TABLE public.recharge_orders
ADD COLUMN IF NOT EXISTS audited_by VARCHAR(36);

-- 添加审核时间字段
ALTER TABLE public.recharge_orders
ADD COLUMN IF NOT EXISTS audited_at TIMESTAMPTZ;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_recharge_orders_audit_status
ON public.recharge_orders(audit_status);

-- 添加外键约束（审核人关联用户表）
ALTER TABLE public.recharge_orders
ADD CONSTRAINT IF NOT EXISTS recharge_orders_audited_by_users_id_fk
FOREIGN KEY (audited_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- 更新现有记录的审核状态（设置为pending）
UPDATE public.recharge_orders
SET audit_status = 'pending'
WHERE audit_status IS NULL;
```

## 验证

执行完成后，可以使用以下命令验证字段是否添加成功：

```sql
-- 查看表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'recharge_orders'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 查看现有数据
SELECT * FROM public.recharge_orders LIMIT 5;
```

## 注意事项

1. 如果表中已有数据，新字段会自动设置默认值（如 audit_status 默认为 'pending'）
2. 外键约束要求 audited_by 必须是有效的用户ID，否则会插入失败
3. 执行 SQL 脚本后，建议先在测试环境验证，再在生产环境执行
