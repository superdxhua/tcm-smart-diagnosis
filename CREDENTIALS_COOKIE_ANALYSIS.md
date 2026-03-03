# "凭据（credentials）+ Cookie" 陷阱分析报告

## 🔍 发现的问题

### 问题 1：后端设置了 credentials: true，但前端使用 Bearer Token

**后端配置** (`api/index.ts`):
```typescript
app.enableCors({
  origin: (origin) => { /* ... */ },
  credentials: true,  // ← 问题：期望接收 cookies
  // ...
});
```

**前端实现** (`src/network.ts`):
```typescript
export const request: typeof Taro.request = option => {
  return Taro.request({
    ...option,
    url: createUrl(option.url),
    dataType: 'json',
    header: {
      ...option.header,
      'Content-Type': 'application/json',
      ...getAuthHeader(),  // ← 使用 Bearer Token，不是 Cookie
    },
  })
}

const getAuthHeader = (): Record<string, string> => {
  const token = Taro.getStorageSync('token')  // ← 从本地存储获取 token
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}
```

### 问题 2：Taro.request H5 端不支持 credentials 参数

**Taro 文档说明**:
- Taro.request 在 H5 端基于 fetch 实现
- 但 Taro 没有暴露 `credentials` 参数
- 小程序端支持 credentials，但 H5 端不支持

**问题表现**:
```
后端: credentials: true
前端: 无法设置 credentials: 'include'（Taro 不支持）
结果: 浏览器 CORS 预检失败 → "Failed to fetch"
```

### 问题 3：认证方式不匹配

| 组件 | 认证方式 | 传输方式 |
|------|---------|---------|
| 后端 CORS 配置 | Cookie | Set-Cookie |
| 前端认证实现 | Bearer Token | Authorization header |
| 后端业务逻辑 | Bearer Token | Authorization header |

**矛盾点**:
- CORS 配置期望 Cookie（`credentials: true`）
- 实际认证使用 Bearer Token（`Authorization: Bearer xxx`）
- 前端无法设置 `credentials: 'include'`

---

## 💡 根本原因

即使 CORS 头正确，以下情况会导致 "Failed to fetch"：

1. **后端设置 `credentials: true`** → 告诉浏览器"我需要 cookies"
2. **前端未设置 `credentials: 'include'`** → 浏览器不发送 cookies
3. **浏览器检测到凭证配置不匹配** → 阻止请求 → "Failed to fetch"

**关键矛盾**:
- 项目使用 Bearer Token，不需要 cookies
- 但 CORS 配置却启用了 credentials
- Taro.request 无法满足 credentials 要求

---

## ✅ 解决方案

### 方案 1：移除 credentials: true（推荐）

**适用场景**: 项目使用 Bearer Token 认证

**修改 `api/index.ts`**:
```typescript
app.enableCors({
  origin: (origin) => {
    const allowedOrigins = [
      'https://tcmsmarthealth.com',
      'http://localhost:3000',
      'http://localhost:5000',
    ];

    if (origin && allowedOrigins.includes(origin)) {
      return origin;
    }

    if (!origin) {
      return '*';
    }

    return false;
  },
  credentials: false,  // ← 修改：禁用凭据
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
});
```

**优点**:
- ✅ 符合项目实际认证方式（Bearer Token）
- ✅ 不需要前端修改
- ✅ 避免 CORS 凭证不匹配问题

**影响**:
- 无负面影响，因为项目本身不使用 Cookie

---

### 方案 2：使用原生 fetch（不推荐）

**适用场景**: 需要使用 Cookie 认证

**修改 `src/network.ts`**:
```typescript
export const request: typeof Taro.request = option => {
  const useNativeFetch = Taro.getEnv() === Taro.ENV_TYPE.H5

  if (useNativeFetch) {
    // H5 端使用原生 fetch，支持 credentials
    return fetch(createUrl(option.url), {
      method: option.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...option.header,
      },
      credentials: 'include',  // ← H5 端设置 credentials
      body: option.data ? JSON.stringify(option.data) : undefined,
    }).then(async response => {
      const data = await response.json()
      return {
        statusCode: response.status,
        data: data,
        header: Object.fromEntries(response.headers.entries()),
      } as any
    })
  }

  // 小程序端继续使用 Taro.request
  return Taro.request({
    ...option,
    url: createUrl(option.url),
    dataType: 'json',
    header: {
      ...option.header,
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  })
}
```

**缺点**:
- ❌ 增加复杂度（需要维护两套实现）
- ❌ 响应格式可能不一致
- ❌ 项目不需要 Cookie 认证

---

### 方案 3：同时支持 Cookie 和 Bearer Token（过度设计）

**适用场景**: 需要同时支持两种认证方式

**修改 `api/index.ts`**:
```typescript
app.enableCors({
  origin: (origin) => { /* ... */ },
  credentials: true,  // 保留 credentials
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
});
```

**修改 `src/network.ts`** (同方案 2)

**缺点**:
- ❌ 复杂度高
- ❌ 增加维护成本
- ❌ 项目只需要 Bearer Token

---

## 🧪 验证方案

### 测试 1: 检查当前 CORS 配置

```bash
# 测试 CORS 头
curl -I http://localhost:3000/api/health \
  -H "Origin: http://localhost:5000"

# 检查返回的 CORS 头
# Access-Control-Allow-Credentials: true ← 问题：设置了 credentials
```

### 测试 2: 最小可复现测试

**创建 `test-cors.html`**:
```html
<!DOCTYPE html>
<html>
<head>
  <title>CORS Test</title>
</head>
<body>
  <script>
    // 测试 1: 使用 fetch（支持 credentials）
    fetch('http://localhost:3000/api/health', {
      method: 'GET',
      credentials: 'include',  // ← 设置 credentials
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(r => r.json())
    .then(console.log)
    .catch(e => console.error('Fetch with credentials error:', e));

    // 测试 2: 不使用 credentials
    fetch('http://localhost:3000/api/health', {
      method: 'GET',
      credentials: 'omit',  // ← 不发送 credentials
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(r => r.json())
    .then(console.log)
    .catch(e => console.error('Fetch without credentials error:', e));
  </script>
</body>
</html>
```

**预期结果**:
- `credentials: 'include'` + 后端 `credentials: true` → ✅ 成功
- `credentials: 'omit'` + 后端 `credentials: true` → ❌ 可能失败

### 测试 3: 浏览器 Network 面板

1. 打开浏览器开发者工具
2. 切换到 Network 面板
3. 执行登录操作
4. 查看请求详情：
   - Request Headers: 是否包含 Authorization header？
   - Response Headers: Access-Control-Allow-Credentials 的值
   - Cookies: 是否发送了 cookies？

---

## 📊 对比分析

| 方案 | 复杂度 | 适用性 | 推荐度 |
|------|--------|--------|--------|
| 方案 1: 移除 credentials | 低 | ✅ 完全适用 | ⭐⭐⭐⭐⭐ |
| 方案 2: 使用原生 fetch | 中 | ⚠️ 部分适用 | ⭐⭐ |
| 方案 3: 双认证支持 | 高 | ❌ 过度设计 | ⭐ |

---

## 🎯 推荐行动

### 立即执行（方案 1）

1. **修改 `api/index.ts`**:
   ```typescript
   credentials: false,  // 禁用凭据
   ```

2. **测试验证**:
   ```bash
   bash server/scripts/test-cors.sh
   ```

3. **浏览器测试**:
   - 打开开发者工具
   - 执行登录操作
   - 确认不再出现 "Failed to fetch"

### 后续优化（可选）

1. **添加认证方式文档**:
   ```markdown
   # 认证方式
   - 使用 Bearer Token 认证
   - Token 存储在本地存储
   - 通过 Authorization header 发送
   ```

2. **监控 CORS 错误**:
   ```typescript
   // 添加 CORS 错误日志
   app.use((req, res, next) => {
     console.log('CORS Request:', {
       origin: req.headers.origin,
       method: req.method,
       path: req.path
     })
     next()
   })
   ```

---

## 📝 总结

### 问题根源
后端设置了 `credentials: true`，但项目使用 Bearer Token 认证，前端无法满足 credentials 要求，导致 CORS 凭证不匹配。

### 解决方案
移除 `credentials: true`，使 CORS 配置与实际认证方式一致。

### 预期效果
- ✅ 消除 "Failed to fetch" 错误
- ✅ 简化 CORS 配置
- ✅ 提高代码可维护性

---

**分析时间**: 2026-02-24
**分析状态**: ✅ 完成
**推荐方案**: 方案 1 - 移除 credentials: true
