# 管理员审核订单指南

## 📋 问题说明

**问题**：用户上传截图后，管理员如何知道具体是哪位用户的付款截图？

**答案**：系统会自动关联订单和用户信息，管理员可以清楚地看到：

- ✅ 用户名（username）
- ✅ 订单号（orderNo）
- ✅ 充值金额（amount）
- ✅ 转账截图（screenshotUrl）
- ✅ 订单创建时间（createdAt）
- ✅ 审核状态（auditStatus）

## 🔍 查看待审核订单

### 接口说明

**接口地址**：`GET /api/admin/pending-recharge-orders`

**请求头**：
```json
{
  "Authorization": "Bearer <管理员token>"
}
```

**请求示例**：
```bash
# 1. 先登录获取管理员token
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}'

# 2. 使用token获取待审核订单
curl -X GET http://localhost:3000/api/admin/pending-recharge-orders \
  -H "Authorization: Bearer <token>"
```

**响应示例**：
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "orderNo": "RCG20240101120000123ABC",
      "amount": 45,
      "paymentMethod": "generic",
      "status": "pending",
      "auditStatus": "submitted",
      "screenshotUrl": "https://xxx.supabase.co/storage/v1/object/public/screenshots/xxx.jpg",
      "auditRemark": null,
      "auditedAt": null,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:05:00.000Z",
      "user": {
        "id": "user-uuid-123",
        "username": "zhangsan",
        "role": "user",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

## ✅ 关键字段说明

### 订单信息

| 字段 | 说明 | 示例 |
|-----|------|------|
| `orderNo` | 订单号 | `RCG20240101120000123ABC` |
| `amount` | 充值金额 | `45` |
| `paymentMethod` | 支付方式 | `generic`（通用支付） |
| `auditStatus` | 审核状态 | `pending`（待截图） / `submitted`（待审核） |
| `screenshotUrl` | 转账截图URL | `https://...` |
| `createdAt` | 订单创建时间 | `2024-01-01T12:00:00.000Z` |

### 用户信息

| 字段 | 说明 | 示例 |
|-----|------|------|
| `user.id` | 用户ID | `user-uuid-123` |
| `user.username` | 用户名 | `zhangsan` |
| `user.role` | 用户角色 | `user` |
| `user.createdAt` | 用户注册时间 | `2024-01-01T00:00:00.000Z` |

## 🔐 审核订单

### 审核通过

**接口地址**：`POST /api/admin/approve-recharge-order`

**请求参数**：
```json
{
  "orderNo": "RCG20240101120000123ABC"
}
```

**请求示例**：
```bash
curl -X POST http://localhost:3000/api/admin/approve-recharge-order \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"orderNo": "RCG20240101120000123ABC"}'
```

**系统自动处理**：
1. ✅ 更新订单状态为 `approved`
2. ✅ 更新订单状态为 `paid`
3. ✅ 记录审核人和审核时间
4. ✅ 自动增加用户使用天数（1元=1天）
5. ✅ 更新用户权限到期时间

**响应示例**：
```json
{
  "code": 200,
  "msg": "审核通过",
  "data": {
    "orderNo": "RCG20240101120000123ABC",
    "auditStatus": "approved",
    "daysAdded": 45,
    "newExpiresAt": "2024-02-15T12:00:00.000Z"
  }
}
```

### 审核拒绝

**接口地址**：`POST /api/admin/reject-recharge-order`

**请求参数**：
```json
{
  "orderNo": "RCG20240101120000123ABC",
  "remark": "转账截图不清晰，请重新上传"
}
```

**请求示例**：
```bash
curl -X POST http://localhost:3000/api/admin/reject-recharge-order \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderNo": "RCG20240101120000123ABC",
    "remark": "转账截图不清晰，请重新上传"
  }'
```

**系统自动处理**：
1. ✅ 更新订单状态为 `rejected`
2. ✅ 记录拒绝原因（remark）
3. ✅ 记录审核人和审核时间
4. ✅ 用户可重新上传截图

**响应示例**：
```json
{
  "code": 200,
  "msg": "审核拒绝",
  "data": {
    "orderNo": "RCG20240101120000123ABC",
    "auditStatus": "rejected",
    "remark": "转账截图不清晰，请重新上传"
  }
}
```

## 📊 管理员工作流程

### 步骤1：登录后台

```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}'
```

保存返回的 `token`。

### 步骤2：查看待审核订单

```bash
curl -X GET http://localhost:3000/api/admin/pending-recharge-orders \
  -H "Authorization: Bearer <token>"
```

### 步骤3：核对订单信息

对于每个待审核订单，检查：

- ✅ **用户名**：确认是哪个用户
- ✅ **订单号**：核对订单唯一标识
- ✅ **充值金额**：确认金额正确
- ✅ **转账截图**：查看转账凭证
  - 打开 `screenshotUrl` 链接
  - 查看转账成功页面
  - 核对转账金额和时间
- ✅ **订单创建时间**：确认订单时效性

### 步骤4：核实转账信息

管理员需要：
1. 登录微信/支付宝/云闪付
2. 查看收款记录
3. 核对：
   - 转账金额是否一致
   - 转账时间是否合理
   - 转账人信息（如有）
4. 确认转账真实性

### 步骤5：审核决策

**审核通过**：
- 转账信息完全正确
- 金额一致
- 时间合理

**审核拒绝**：
- 转账截图不清晰
- 金额不一致
- 截图造假
- 其他问题

### 步骤6：执行审核

**通过**：
```bash
curl -X POST http://localhost:3000/api/admin/approve-recharge-order \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"orderNo": "订单号"}'
```

**拒绝**：
```bash
curl -X POST http://localhost:3000/api/admin/reject-recharge-order \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderNo": "订单号",
    "remark": "拒绝原因"
  }'
```

## 💡 常见问题

**Q: 如何快速找到某个用户的订单？**

A: 待审核订单接口返回了用户信息，可以根据 `user.username` 筛选。

**Q: 用户上传的截图可以放大查看吗？**

A: 可以。直接在浏览器中打开 `screenshotUrl` 链接，可以放大查看。

**Q: 审核通过后用户会收到通知吗？**

A: 目前系统未实现通知功能，用户可以在充值页面查看订单状态。

**Q: 审核拒绝后用户怎么办？**

A: 用户会在充值页面看到拒绝原因，可以重新上传截图。

**Q: 如何防止重复审核？**

A: 系统有状态检查，已审核的订单无法再次审核。

**Q: 审核通过后用户权限如何计算？**

A: 1元 = 1天。系统会自动在用户当前到期时间基础上增加相应天数。

## 📋 订单状态说明

| 状态 | 说明 | 可操作 |
|-----|------|--------|
| `pending` | 待上传截图 | 无（等待用户上传） |
| `submitted` | 已提交，待审核 | 审核通过/拒绝 |
| `approved` | 审核通过 | 无（已完成） |
| `rejected` | 审核拒绝 | 无（用户需重新上传） |

## 🎯 总结

**管理员可以清楚地知道：**

1. ✅ **谁充值了**：用户名、用户ID、角色
2. ✅ **充值多少**：订单金额、订单号
3. ✅ **凭证是什么**：转账截图URL
4. ✅ **何时充值**：订单创建时间
5. ✅ **审核状态**：当前审核状态

**完全不需要通过 QQ 或其他方式确认！**

所有信息都在订单中完整记录，管理员可以直接查看和处理。
