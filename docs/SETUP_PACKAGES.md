# 套餐管理使用指南

## 📦 套餐列表

当前系统包含以下4个套餐：

| 套餐名称 | 时长 | 价格 | 描述 |
|---------|------|------|------|
| 7天体验 | 7天 | ¥15 | 适合初次体验用户 |
| 1个月标准 | 30天 | ¥45 | 月度套餐，性价比之选 |
| 3个月优惠 | 90天 | ¥108 | 季度套餐，超值优惠 |
| 1年尊享 | 365天 | ¥365 | 年度套餐，长期使用首选 |

## 🔧 初始化套餐数据

### 步骤1：创建 packages 表（如果不存在）

如果 `packages` 表不存在，需要先在 Supabase 控制台中创建表。

**执行以下 SQL 脚本**：

```sql
-- 创建 packages 表
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  duration INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_packages_is_active ON public.packages(is_active);

-- 启用行级安全策略
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取套餐数据
CREATE POLICY IF NOT EXISTS "Allow public read access" ON public.packages FOR SELECT USING (true);

-- 允许认证用户插入套餐
CREATE POLICY IF NOT EXISTS "Allow authenticated insert" ON public.packages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 允许认证用户更新套餐
CREATE POLICY IF NOT EXISTS "Allow authenticated update" ON public.packages FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 允许认证用户删除套餐
CREATE POLICY IF NOT EXISTS "Allow authenticated delete" ON public.packages FOR DELETE USING (auth.uid() IS NOT NULL);
```

### 步骤2：调用初始化接口

**接口地址**：`POST /api/admin/init-packages`

**请求头**：
```json
{
  "Authorization": "Bearer <管理员token>"
}
```

**示例请求**：

```bash
# 获取管理员token（先登录）
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_admin_password"
  }'

# 使用返回的token初始化套餐
curl -X POST http://localhost:3000/api/admin/init-packages \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

**响应示例**：

```json
{
  "code": 200,
  "msg": "套餐初始化成功",
  "data": {
    "successCount": 4,
    "errorCount": 0,
    "total": 4,
    "packages": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "7天体验",
        "duration": 7,
        "price": 15,
        "description": "适合初次体验用户",
        "is_active": true,
        "sort_order": 1,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "1个月标准",
        "duration": 30,
        "price": 45,
        "description": "月度套餐，性价比之选",
        "is_active": true,
        "sort_order": 2,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "name": "3个月优惠",
        "duration": 90,
        "price": 108,
        "description": "季度套餐，超值优惠",
        "is_active": true,
        "sort_order": 3,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "name": "1年尊享",
        "duration": 365,
        "price": 365,
        "description": "年度套餐，长期使用首选",
        "is_active": true,
        "sort_order": 4,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## 📋 查看套餐列表

**接口地址**：`GET /api/packages/all`

**请求示例**：

```bash
curl -X GET http://localhost:3000/api/packages/all
```

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "7天体验",
      "duration": 7,
      "price": 15,
      "description": "适合初次体验用户",
      "is_active": true,
      "sort_order": 1
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "1个月标准",
      "duration": 30,
      "price": 45,
      "description": "月度套餐，性价比之选",
      "is_active": true,
      "sort_order": 2
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "3个月优惠",
      "duration": 90,
      "price": 108,
      "description": "季度套餐，超值优惠",
      "is_active": true,
      "sort_order": 3
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "name": "1年尊享",
      "duration": 365,
      "price": 365,
      "description": "年度套餐，长期使用首选",
      "is_active": true,
      "sort_order": 4
    }
  ]
}
```

## 🎯 充值页面使用流程

### 用户操作步骤

1. **进入充值页面**
   - 点击首页底部"💰 账户充值"按钮

2. **选择支付方式**
   - 微信支付
   - 支付宝

3. **查看收款二维码**
   - 系统显示对应的收款二维码
   - 扫描二维码进行转账

4. **选择套餐**
   - 点击套餐卡片
   - 必须选择套餐才能创建订单

5. **创建订单**
   - 查看待付款金额（套餐价格）
   - 点击"创建订单"

6. **上传转账截图**
   - 选择相册中的转账截图
   - 提交审核

7. **等待审核**
   - 管理员在后台查看订单和截图
   - 审核通过后自动到账

## 🔐 管理员后台审核流程

### 管理员操作步骤

1. **获取待审核订单**
   ```bash
   curl -X GET http://localhost:3000/api/admin/pending-recharge-orders \
     -H "Authorization: Bearer <admin_token>"
   ```

2. **查看订单详情和截图**
   - 订单号
   - 充值金额
   - 支付方式
   - 转账截图

3. **核实收款**
   - 登录微信/支付宝查看收款记录
   - 核对金额和时间

4. **审核通过**
   ```bash
   curl -X POST http://localhost:3000/api/admin/approve-recharge-order \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "orderNo": "ORD2024010100001"
     }'
   ```

5. **审核拒绝（可选）**
   ```bash
   curl -X POST http://localhost:3000/api/admin/reject-recharge-order \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "orderNo": "ORD2024010100001",
       "remark": "转账截图不清晰"
     }'
   ```

## 📝 注意事项

1. **套餐初始化**
   - 只需要执行一次
   - 会删除现有的所有套餐数据
   - 如果需要修改套餐，请直接在 Supabase 控制台中编辑

2. **收款码配置**
   - 需要在环境变量中配置收款码图片 URL
   - 配置项：
     - `WECHAT_MERCHANT_QRCODE`
     - `ALIPAY_MERCHANT_QRCODE`
     - `MERCHANT_NAME`

3. **审核流程**
   - 管理员必须核实转账真实性
   - 审核通过后系统自动增加用户使用天数
   - 审核拒绝后用户可重新上传截图

## 🔍 相关接口

| 接口 | 方法 | 说明 |
|-----|------|------|
| `/api/admin/init-packages` | POST | 初始化套餐数据 |
| `/api/admin/packages` | GET | 获取所有套餐（管理员） |
| `/api/packages/all` | GET | 获取所有套餐（公开） |
| `/api/packages/active` | GET | 获取激活的套餐 |
| `/api/payment/merchant-qrcodes` | GET | 获取收款码配置 |
| `/api/payment/manual-recharge/create` | POST | 创建充值订单 |
| `/api/payment/manual-recharge/upload-screenshot` | POST | 上传转账截图 |
| `/api/admin/pending-recharge-orders` | GET | 获取待审核订单 |
| `/api/admin/approve-recharge-order` | POST | 审核通过 |
| `/api/admin/reject-recharge-order` | POST | 审核拒绝 |
| `/api/admin/recharge-audit-stats` | GET | 获取审核统计 |

## ❓ 常见问题

**Q: 如何修改套餐价格？**

A: 直接在 Supabase 控制台的 `packages` 表中编辑对应记录即可。

**Q: 如何添加新套餐？**

A: 在 Supabase 控制台的 `packages` 表中插入新记录，注意设置 `sort_order` 以控制显示顺序。

**Q: 用户充值后没有到账怎么办？**

A: 检查充值订单的 `audit_status`，如果是 `pending` 或 `rejected`，需要管理员重新审核。

**Q: 如何查看充值统计数据？**

A: 调用 `/api/admin/recharge-audit-stats` 接口获取统计信息。
