# 商户收款码配置指南

## 📸 商户收款码说明

本系统使用通用收款码，支持微信、支付宝、云闪付三种支付方式。

**当前收款码 URL**：
```
https://dwswtkfbtdohaftnklxx.supabase.co/storage/v1/object/public/qrcodes/0f4d33663fcd22d619c950ba281efc91.jpg
```

## 🔧 配置方式

### 方式1：环境变量配置（推荐）

**本地开发环境**：

在项目根目录创建 `.env` 文件：

```bash
# 商户收款码配置
MERCHANT_QR_CODE=https://dwswtkfbtdohaftnklxx.supabase.co/storage/v1/object/public/qrcodes/0f4d33663fcd22d619c950ba281efc91.jpg
MERCHANT_NAME=中医智能诊疗
```

**生产环境（Vercel）**：

1. 进入 Vercel 项目设置
2. Settings → Environment Variables
3. 添加环境变量：
   - Name: `MERCHANT_QR_CODE`
   - Value: `https://dwswtkfbtdohaftnklxx.supabase.co/storage/v1/object/public/qrcodes/0f4d33663fcd22d619c950ba281efc91.jpg`
   - Name: `MERCHANT_NAME`
   - Value: `中医智能诊疗`

**生产环境（Render）**：

1. 进入 Render 服务设置
2. Environment
3. 添加环境变量：
   - Key: `MERCHANT_QR_CODE`
   - Value: `https://dwswtkfbtdohaftnklxx.supabase.co/storage/v1/object/public/qrcodes/0f4d33663fcd22d619c950ba281efc91.jpg`
   - Key: `MERCHANT_NAME`
   - Value: `中医智能诊疗`

### 方式2：修改代码默认值

如果无法使用环境变量，可以直接修改代码中的默认值：

**文件位置**：`server/src/payment/payment.service.ts`

```typescript
async getMerchantQrCodes() {
  console.log('获取商户收款码配置');

  // 从环境变量读取通用收款码
  // 开发环境默认值（生产环境请在部署平台配置环境变量）
  const qrCode = process.env.MERCHANT_QR_CODE || 'https://你的收款码URL.jpg';
  const merchantName = process.env.MERCHANT_NAME || '你的商户名称';

  return {
    merchantName,
    qrCode,
    instructions: [
      '1. 选择套餐并创建订单',
      '2. 使用微信、支付宝或云闪付扫描上方二维码',
      '3. 输入待付款金额完成转账',
      '4. 保存转账成功页面截图',
      '5. 上传转账截图并提交审核',
      '6. 等待管理员确认到账',
    ],
    notice: '请确保转账金额与订单金额一致，便于管理员核对',
  };
}
```

## ✅ 验证配置

**测试接口**：

```bash
curl http://localhost:3000/api/payment/merchant-qrcodes
```

**预期响应**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "merchantName": "中医智能诊疗",
    "qrCode": "https://dwswtkfbtdohaftnklxx.supabase.co/storage/v1/object/public/qrcodes/0f4d33663fcd22d619c950ba281efc91.jpg",
    "instructions": [
      "1. 选择套餐并创建订单",
      "2. 使用微信、支付宝或云闪付扫描上方二维码",
      "3. 输入待付款金额完成转账",
      "4. 保存转账成功页面截图",
      "5. 上传转账截图并提交审核",
      "6. 等待管理员确认到账"
    ],
    "notice": "请确保转账金额与订单金额一致，便于管理员核对"
  }
}
```

## 🔄 更换收款码

如果需要更换收款码：

1. **上传新收款码到 Supabase**
   - Storage → qrcodes bucket
   - 上传新图片

2. **获取新图片 URL**
   - 右键图片 → Copy URL
   - 确保是公共 URL（`/object/public/`）

3. **更新配置**
   - 本地：修改 `.env` 文件
   - 生产：更新部署平台环境变量

4. **重启服务**
   ```bash
   # 本地开发
   cd /workspace/projects && coze dev

   # 生产环境
   # 在 Vercel/Render 中重新部署
   ```

## 📝 注意事项

1. **图片要求**：
   - 格式：JPG、PNG、WEBP
   - 大小：建议不超过 2MB
   - 分辨率：建议至少 500x500 像素
   - 清晰度：确保二维码清晰可识别

2. **URL 格式**：
   - ✅ 正确：`https://xxx.supabase.co/storage/v1/object/public/qrcodes/xxx.jpg`
   - ❌ 错误：`https://xxx.supabase.co/storage/v1/object/sign/qrcodes/xxx.jpg?token=...`
   - ❌ 错误：`/storage/v1/object/public/qrcodes/xxx.jpg`（缺少域名）

3. **Bucket 设置**：
   - Storage bucket 必须设置为 **Public**
   - 否则无法通过 URL 访问图片

4. **收款码类型**：
   - 通用收款码（推荐）：一张码支持微信、支付宝、云闪付
   - 分开收款码：需要单独的微信码、支付宝码

## 🎯 充值流程

### 用户操作步骤：

1. **选择套餐**
   - 进入充值页面
   - 点击选择套餐
   - 查看待付款金额

2. **创建订单**
   - 点击"创建订单"
   - 系统生成订单号

3. **扫码支付**
   - 显示收款二维码
   - 使用微信/支付宝/云闪付扫描
   - 输入订单金额
   - 完成转账

4. **上传截图**
   - 保存转账成功页面截图
   - 在小程序中上传截图
   - 提交审核

5. **等待审核**
   - 管理员查看订单和截图
   - 核实转账金额和时间
   - 审核通过后自动到账

## ❓ 常见问题

**Q: 为什么收款码不显示？**

A: 检查以下几点：
1. 收款码 URL 是否正确（公共 URL，不是签名 URL）
2. Storage bucket 是否设置为 Public
3. 环境变量是否正确配置
4. 图片是否上传成功

**Q: 如何测试收款码是否可用？**

A:
1. 在浏览器中打开收款码 URL
2. 确认能看到图片
3. 调用 `/api/payment/merchant-qrcodes` 接口
4. 查看返回的 `qrCode` 字段

**Q: 可以使用多个收款码吗？**

A: 当前版本使用单一通用收款码，如需使用多个收款码，需要修改代码逻辑。

**Q: 收款码可以更改吗？**

A: 可以。上传新收款码后，更新环境变量中的 URL 并重启服务即可。

## 📞 联系支持

如果配置过程中遇到问题，请检查：
1. Supabase Storage 访问权限
2. 环境变量配置
3. 服务日志（`/tmp/coze-logs/dev.log`）
4. 接口响应状态码和错误信息
