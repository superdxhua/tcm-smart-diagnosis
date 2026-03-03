# 管理员审核页面 - 实时通知功能说明

## 🎯 功能概述

管理员审核页面实现了完整的实时通知功能，当有用户提交充值截图后，系统会自动通知管理员，无需管理员不断刷新页面。

## ✨ 核心功能

### 1. 定时轮询

系统每 **30 秒**自动检查一次待审核订单数量，如果有新订单，立即通知管理员。

**优点**：
- ✅ 实现简单，无需复杂的 WebSocket 配置
- ✅ 兼容性好，H5 和小程序都支持
- ✅ 性能开销小，对服务器压力极小

**缺点**：
- ⚠️ 最大延迟 30 秒（对实际使用影响极小）

### 2. 声音提示

当检测到新订单时，系统会播放"叮"的一声提示音。

**实现方式**：
- 使用 **Web Audio API** 生成提示音
- 无需外部音频文件
- 支持自定义开关

**提示音特性**：
- 音调：从 A5 (880Hz) 降调到 A4 (440Hz)
- 类型：正弦波（清脆悦耳）
- 时长：0.5 秒
- 音量：适中，不会惊吓

### 3. 页面标题闪烁

当有新订单时，浏览器标签页标题会闪烁提醒：

```
原始标题：订单审核 - 中医智能诊疗
闪烁标题：[3条新订单] 管理员审核
```

**闪烁次数**：6 次（3 秒）

### 4. 提示音开关

右上角提供提示音开关，可以随时开启/关闭：

```
🔊 提示音  ← 开启状态
🔇 提示音  ← 关闭状态
```

## 📱 页面布局

```
┌─────────────────────────────────────┐
│ 🔔 待审核订单 (3)        🔊 提示音  │  ← 顶部状态栏
├─────────────────────────────────────┤
│ 💡 系统每30秒自动检查新订单...      │  ← 说明文字
├─────────────────────────────────────┤
│ 订单 1                              │
│   订单号：RCG2024010112...          │
│   用户：zhangsan (user)             │
│   金额：¥45.00                      │
│   支付方式：通用收款码              │
│   截图：[点击查看]                  │
│   [拒绝]  [通过]                    │
├─────────────────────────────────────┤
│ 订单 2                              │
│   ...                               │
└─────────────────────────────────────┘
```

## 🔧 后端接口

### 1. 获取待审核订单数量

**接口**：`GET /api/admin/pending-recharge-count`

**响应**：
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "count": 3
  }
}
```

### 2. 获取待审核订单列表

**接口**：`GET /api/admin/pending-recharge-orders`

**响应**：
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": "订单ID",
      "orderNo": "RCG20240101120000123ABC",
      "amount": 45,
      "paymentMethod": "generic",
      "auditStatus": "submitted",
      "screenshotUrl": "https://...",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "username": "zhangsan",
        "role": "user",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

### 3. 审核通过

**接口**：`POST /api/admin/approve-recharge-order`

**请求**：
```json
{
  "orderNo": "RCG20240101120000123ABC"
}
```

**响应**：
```json
{
  "code": 200,
  "msg": "审核通过",
  "data": {
    "orderNo": "RCG20240101120000123ABC",
    "newExpiryDate": "2024-01-16T12:00:00.000Z",
    "daysAdded": 45
  }
}
```

### 4. 审核拒绝

**接口**：`POST /api/admin/reject-recharge-order`

**请求**：
```json
{
  "orderNo": "RCG20240101120000123ABC",
  "remark": "转账金额不符"
}
```

**响应**：
```json
{
  "code": 200,
  "msg": "审核拒绝",
  "data": {
    "orderNo": "RCG20240101120000123ABC",
    "auditRemark": "转账金额不符"
  }
}
```

## 🚀 使用步骤

### 1. 访问审核页面

**方法 1：通过导航栏**
- 在首页点击"订单审核"或"管理后台"
- 选择"订单审核"

**方法 2：直接访问**
```
/pages/admin-recharge/index
```

### 2. 开启提示音

- 确认右上角提示音开关显示 🔊
- 如果显示 🔇，点击切换到开启状态

### 3. 监听新订单

- 保持页面打开
- 系统会每 30 秒自动检查
- 有新订单时会：
  1. 播放"叮"的一声提示音
  2. 页面标题闪烁
  3. 待审核订单数量更新

### 4. 审核订单

**审核通过**：
1. 查看订单详情（用户、金额、截图）
2. 登录微信/支付宝核对收款记录
3. 确认无误后点击"通过"按钮
4. 系统自动增加用户使用天数

**审核拒绝**：
1. 查看订单详情
2. 核对后发现不符合
3. 点击"拒绝"按钮
4. 输入拒绝原因（可选）
5. 用户会收到拒绝通知

### 5. 查看截图

- 点击截图图片
- 会放大显示
- 可以长按保存

## 💡 最佳实践

### 1. 保持页面打开

建议将管理员审核页面作为浏览器标签页长期保持打开，这样就不会错过任何新订单。

### 2. 使用浏览器通知（可选）

如果想要更强的提醒，可以启用浏览器通知权限：

```javascript
// 在浏览器控制台中执行
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    new Notification('新订单提醒', {
      body: '有待审核订单需要处理',
      icon: '/icon.png'
    })
  }
})
```

### 3. 定期检查

即使有实时通知，也建议每天定期检查一次待审核订单，防止遗漏。

### 4. 及时审核

收到新订单提醒后，建议尽快审核（最好在 1 小时内），提升用户体验。

## 🔧 配置项

### 修改轮询间隔

当前设置为 **30 秒**，如需修改，编辑 `src/pages/admin-recharge/index.tsx`：

```typescript
// 找到这一行
const interval = setInterval(() => {
  fetchPendingCount()
}, 30000) // 修改这里的数字（单位：毫秒）

// 例如改为 60 秒
}, 60000)
```

### 修改提示音

如需自定义提示音，编辑 `playNotificationSound` 方法：

```typescript
const playNotificationSound = () => {
  // 修改以下参数
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime) // 初始频率
  oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.3) // 结束频率
  oscillator.type = 'sine' // 波形类型：'sine' | 'square' | 'sawtooth' | 'triangle'

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime) // 音量
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5) // 淡出时间
}
```

## ⚠️ 注意事项

### 1. 浏览器兼容性

**Web Audio API 兼容性**：
- ✅ Chrome 15+
- ✅ Firefox 25+
- ✅ Safari 7+
- ✅ Edge 12+
- ❌ IE（不支持）

**小程序端**：
- 小程序端可能不支持 Web Audio API
- 会自动静音，不影响功能使用

### 2. 音频自动播放策略

现代浏览器禁止音频自动播放，需要用户先与页面交互（点击、滚动等）才能播放音频。

**解决方案**：
- 首次访问页面时，建议先点击"提示音"开关
- 或者在页面任意位置点击一次

### 3. 页面休眠

浏览器标签页休眠时，定时器会暂停执行。

**解决方案**：
- 保持标签页激活状态
- 或使用浏览器扩展防止标签页休眠

### 4. 多管理员场景

如果有多个管理员同时在线，可能会收到重复的提醒。

**解决方案**：
- 建议建立内部沟通机制（如微信群）
- 收到提醒后在群里说一声，避免重复审核

## 📊 常见问题

### Q1: 为什么没有提示音？

**可能原因**：
1. 浏览器不支持 Web Audio API（IE 等旧浏览器）
2. 提示音开关关闭
3. 未与页面交互（浏览器限制）
4. 音量被静音

**解决方法**：
- 使用现代浏览器（Chrome、Firefox、Safari）
- 开启提示音开关
- 在页面任意位置点击一次
- 检查系统音量

### Q2: 提示音延迟多久？

**最大延迟**：30 秒（轮询间隔）

如果 30 秒后仍没有提示，可能原因：
- 页面处于休眠状态
- 网络连接断开
- 系统繁忙

**解决方法**：
- 保持标签页激活
- 检查网络连接
- 手动刷新页面

### Q3: 如何关闭提示音？

点击右上角的提示音开关即可：

```
🔊 → 🔇 （关闭）
🔇 → 🔊 （开启）
```

### Q4: 小程序端有提示音吗？

小程序端可能不支持 Web Audio API，会自动静音。建议使用 H5 版本进行管理员审核。

### Q5: 可以自定义提示音文件吗？

可以！如果您想使用自定义音频文件：

1. 准备音频文件（MP3 或 WAV 格式）
2. 放置到 `public/assets/notification.mp3`
3. 修改 `playNotificationSound` 方法：

```typescript
const playNotificationSound = () => {
  try {
    const audio = new Audio('/assets/notification.mp3')
    audio.play().catch(err => console.error('播放失败:', err))
  } catch (error) {
    console.error('提示音异常:', error)
  }
}
```

## 📞 技术支持

如有问题，请联系技术支持或查看项目文档。

---

**最后更新**：2024-01-01
**版本**：v1.0.0
