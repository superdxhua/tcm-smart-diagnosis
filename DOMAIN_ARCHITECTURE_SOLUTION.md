# 域名架构分析与解决方案

## 📋 项目域名架构总览

### 5个域名列表

| 序号 | 域名 | 用途 | 平台 | 状态 | 访问测试 |
|-----|------|------|------|------|----------|
| 1 | **www.zhongyihskhealth.com** | 前端主页 | Vercel | ⚠️ 可访问但无法连接后端 | HTTP 200 ✅ |
| 2 | **h5.zhongyihskhealth.com** | H5 网页 | Vercel | ❌ 域名不存在 | NXDOMAIN ❌ |
| 3 | **admin.zhongyihskhealth.com** | 管理后台 | Vercel | ✅ 可访问 | HTTP 200 ✅ |
| 4 | **api.zhongyihskhealth.com** | 后端 API | Render | ✅ 完全正常 | HTTP 200 ✅ |
| 5 | **zhongyihskhealth.com** | 主域名 | ICP 审核中 | ❌ 不可访问 | N/A ❌ |

---

## 🔍 当前状态详细分析

### 1. www.zhongyihskhealth.com（前端主页）

**域名解析**：
```bash
$ nslookup www.zhongyihskhealth.com
www.zhongyihskhealth.com → df752034ddc07555.vercel-dns-017.com
```

**访问测试**：
```bash
$ curl -I https://www.zhongyihskhealth.com
HTTP/2 200
Content-Type: text/html; charset=utf-8
Server: Vercel
```

**问题分析**：
- ✅ 域名解析正常
- ✅ HTTP 200 响应正常
- ⚠️ 但前端页面显示"响应数据为空"
- ⚠️ 原因：`PROJECT_DOMAIN` 环境变量未设置为 `https://api.zhongyihskhealth.com`

**前端请求流程**：
```
用户访问 www.zhongyihskhealth.com
  ↓
Vercel 返回前端页面
  ↓
前端尝试访问 API
  ↓
PROJECT_DOMAIN = ""（空字符串）
  ↓
请求 /api/health（相对路径）
  ↓
浏览器请求 https://www.zhongyihskhealth.com/api/health
  ↓
❌ Vercel 上没有 /api/health 路由，返回 404
```

---

### 2. h5.zhongyihskhealth.com（H5 网页）

**域名解析**：
```bash
$ nslookup h5.zhongyihskhealth.com
** server can't find h5.zhongyihskhealth.com: NXDOMAIN
```

**问题分析**：
- ❌ 域名不存在
- ❌ 需要在阿里云 DNS 中添加 CNAME 记录

**解决方案**：
```
阿里云 DNS 配置：
类型：CNAME
主机记录：h5
记录值：cname.vercel-dns.com
TTL：600
```

---

### 3. admin.zhongyihskhealth.com（管理后台）

**域名解析**：
```bash
$ nslookup admin.zhongyihskhealth.com
admin.zhongyihskhealth.com → df752034ddc07555.vercel-dns-017.com
```

**访问测试**：
```bash
$ curl -I https://admin.zhongyihskhealth.com
HTTP/2 200
Content-Type: text/html; charset=utf-8
Server: Vercel
```

**问题分析**：
- ✅ 域名解析正常
- ✅ HTTP 200 响应正常
- ⚠️ 可能同样存在无法连接后端的问题（同 www 子域名）

---

### 4. api.zhongyihskhealth.com（后端 API）⭐

**域名解析**：
```bash
$ nslookup api.zhongyihskhealth.com
api.zhongyihskhealth.com → zhongyi-smart-api.onrender.com
```

**访问测试**：
```bash
$ curl https://api.zhongyihskhealth.com/api/health
{"status":"success","data":"2026-02-28T14:11:25.512Z"} ✅

$ curl https://api.zhongyihskhealth.com/api/disease-categories | head -c 500
{"code":200,"msg":"success","data":[...]} ✅
```

**问题分析**：
- ✅ 域名解析正常（指向 Render）
- ✅ API 响应完全正常
- ✅ CORS 配置正确（`origin: true`）
- ⚠️ 但前端没有配置使用这个域名

---

### 5. zhongyihskhealth.com（主域名）

**状态**：
- ⚠️ ICP 审核中，暂时不能使用
- ⚠️ 备案完成后才能启用

---

## 🚀 解决方案（绕过 www.zhongyihskhealth.com）

### 方案 1：使用 api.zhongyihskhealth.com 作为小程序和前端 API 地址 ⭐⭐⭐⭐⭐

**适用场景**：
- 微信小程序
- H5 网页（如果配置 h5.zhongyihskhealth.com）
- 任何需要访问后端 API 的场景

**优势**：
- ✅ api.zhongyihskhealth.com 已经正常工作
- ✅ 直接指向 Render，无需 Vercel 中间层
- ✅ 响应速度快（无冷启动）
- ✅ 无需等待主域名 ICP 备案

**实施步骤**：

#### 步骤 1：配置 Vercel 环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目：`zhongyi-smart`
3. 进入 **Settings** → **Environment Variables**
4. 添加/更新环境变量：
   - **Key**: `PROJECT_DOMAIN`
   - **Value**: `https://api.zhongyihskhealth.com`
   - **Environment**: Production（生产环境）
5. 点击 **Save**
6. 触发重新部署：
   - 进入 **Deployments**
   - 点击最新部署右侧的 **...** → **Redeploy**

#### 步骤 2：配置微信小程序服务器域名

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入 **开发** → **开发管理** → **开发设置** → **服务器域名**
3. 配置以下域名：

| 域名类型 | 域名地址 |
|---------|---------|
| request 合法域名 | `https://api.zhongyihskhealth.com` |
| uploadFile 合法域名 | `https://api.zhongyihskhealth.com` |
| downloadFile 合法域名 | `https://api.zhongyihskhealth.com` |

4. 点击 **保存**
5. 等待 5-10 分钟生效

#### 步骤 3：测试小程序

1. 打开微信开发者工具
2. 上传小程序代码
3. 测试网络请求：
   ```typescript
   import { Network } from '@/network'

   const testApi = async () => {
     const res = await Network.request({
       url: '/api/health'
     })
     console.log('API 响应:', res)
     // 预期输出：{ status: "success", data: "..." }
   }
   ```
4. 检查控制台，确认请求成功

#### 步骤 4：测试前端网页（可选）

1. 访问 https://www.zhongyihskhealth.com
2. 打开浏览器控制台（F12）
3. 查看网络请求（Network 标签）
4. 确认请求指向 `https://api.zhongyihskhealth.com/api/*`

**预期结果**：
```
✅ 小程序网络请求成功
✅ 前端网页 API 调用成功
✅ 用户数据正常加载
```

---

### 方案 2：使用 admin.zhongyihskhealth.com 作为管理后台入口 ⭐⭐⭐⭐

**适用场景**：
- 管理员登录
- 数据统计查看
- 系统配置管理

**优势**：
- ✅ admin.zhongyihskhealth.com 已经可访问
- ✅ 与 www 域名分离，职责清晰
- ✅ 可以独立配置 PROJECT_DOMAIN

**实施步骤**：

#### 步骤 1：创建单独的 Vercel 项目（可选）

如果需要独立配置管理后台的环境变量：

1. 克隆项目：`git clone https://github.com/superdxhua/tcm-smart-diagnosis.git`
2. 创建新分支：`git checkout -b admin-branch`
3. 修改 `src/pages/admin` 为默认首页
4. 在 Vercel 中创建新项目
5. 绑定域名：`admin.zhongyihskhealth.com`
6. 配置环境变量：`PROJECT_DOMAIN=https://api.zhongyihskhealth.com`

#### 步骤 2：直接使用现有域名

如果管理后台共享同一个项目：

1. 直接访问：https://admin.zhongyihskhealth.com/#/admin
2. 确认 API 调用正常（需要先配置方案 1）

**预期结果**：
```
✅ 管理后台可正常访问
✅ 管理员可以登录
✅ 数据统计正常显示
```

---

### 方案 3：创建 h5.zhongyihskhealth.com 域名 ⭐⭐⭐⭐

**适用场景**：
- 微信内嵌 H5 网页
- 移动端网页访问
- 社交分享链接

**优势**：
- ✅ 独立的 H5 域名，职责清晰
- ✅ 可以在微信中正常分享
- ✅ SEO 优化友好

**实施步骤**：

#### 步骤 1：配置 DNS 解析

1. 登录阿里云域名控制台
2. 找到域名：`zhongyihskhealth.com`
3. 进入 **解析设置** → **添加记录**
4. 添加以下记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| CNAME | h5 | cname.vercel-dns.com | 600 |

5. 保存设置
6. 等待 DNS 生效（10-30 分钟）

#### 步骤 2：在 Vercel 中绑定域名

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入项目 **Settings** → **Domains**
3. 点击 **Add Domain**
4. 输入域名：`h5.zhongyihskhealth.com`
5. 等待 Vercel 验证 DNS 配置
6. 确认域名状态显示为 ✅ `Valid Configuration`

#### 步骤 3：配置微信 JS-SDK（可选）

如果需要分享功能：

```typescript
// 在页面中添加微信 JS-SDK
import Taro from '@tarojs/taro'

useEffect(() => {
  // 获取微信签名（需要后端接口支持）
  fetch('https://api.zhongyihskhealth.com/api/wechat/signature?url=' + encodeURIComponent(window.location.href))
    .then(res => res.json())
    .then(data => {
      Taro.config({
        appId: 'wxc9246b2c31d037f2',
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData']
      })
    })
}, [])
```

#### 步骤 4：测试 H5 网页

1. 等待 DNS 生效后
2. 访问：https://h5.zhongyihskhealth.com
3. 在浏览器中测试功能
4. 在微信中测试分享功能

**预期结果**：
```
✅ H5 网页可正常访问
✅ 微信内嵌显示正常
✅ 分享功能正常（如果配置）
```

---

## 📊 域名使用建议

### 小程序使用方案

| 场景 | 推荐域名 | 说明 |
|-----|---------|------|
| API 请求 | `https://api.zhongyihskhealth.com` | 后端 API，正常工作 |
| 文件上传 | `https://api.zhongyihskhealth.com` | 后端 API，支持上传 |
| 文件下载 | `https://api.zhongyihskhealth.com` | 后端 API，支持下载 |

**配置方式**：
- 在 Vercel Dashboard 设置 `PROJECT_DOMAIN=https://api.zhongyihskhealth.com`
- 在微信小程序后台配置服务器域名

---

### 前端网页使用方案

| 场景 | 推荐域名 | 说明 |
|-----|---------|------|
| PC 网页 | `https://www.zhongyihskhealth.com` | 主页（需要先配置 API） |
| H5 网页 | `https://h5.zhongyihskhealth.com` | 移动端（需先创建域名） |
| 管理后台 | `https://admin.zhongyihskhealth.com` | 管理员入口 |
| API 请求 | `https://api.zhongyihskhealth.com` | 所有前端共享 |

**配置方式**：
- 所有前端项目共享同一个 `PROJECT_DOMAIN=https://api.zhongyihskhealth.com`
- 无需为每个子域名单独配置

---

## ✅ 立即行动清单

### 高优先级（必须完成）

- [ ] **在 Vercel Dashboard 中设置环境变量**
  - [ ] Key: `PROJECT_DOMAIN`
  - [ ] Value: `https://api.zhongyihskhealth.com`
  - [ ] Environment: Production
  - [ ] 触发重新部署

- [ ] **在微信小程序后台配置服务器域名**
  - [ ] request 合法域名：`https://api.zhongyihskhealth.com`
  - [ ] uploadFile 合法域名：`https://api.zhongyihskhealth.com`
  - [ ] downloadFile 合法域名：`https://api.zhongyihskhealth.com`

- [ ] **测试小程序**
  - [ ] 网络请求是否成功
  - [ ] 数据加载是否正常
  - [ ] 功能是否正常

### 中优先级（建议完成）

- [ ] **测试前端网页**
  - [ ] 访问 https://www.zhongyihskhealth.com
  - [ ] 检查 API 调用是否成功
  - [ ] 检查数据加载是否正常

- [ ] **测试管理后台**
  - [ ] 访问 https://admin.zhongyihskhealth.com
  - [ ] 检查管理功能是否正常

### 低优先级（可选）

- [ ] **创建 h5.zhongyihskhealth.com 域名**
  - [ ] 在阿里云 DNS 中添加 CNAME 记录
  - [ ] 在 Vercel 中绑定域名
  - [ ] 测试 H5 网页访问
  - [ ] 在微信中测试分享功能

---

## 🎯 总结

### 当前问题

- ❌ www.zhongyihskhealth.com 可以访问，但前端无法连接后端
- ❌ h5.zhongyihskhealth.com 域名不存在
- ✅ api.zhongyihskhealth.com 工作完全正常
- ✅ admin.zhongyihskhealth.com 可以访问
- ❌ zhongyihskhealth.com 主域名 ICP 审核中

### 核心解决方案

**使用 api.zhongyihskhealth.com 作为小程序和前端的 API 地址**

1. 在 Vercel Dashboard 设置 `PROJECT_DOMAIN=https://api.zhongyihskhealth.com`
2. 在微信小程序后台配置服务器域名为 `https://api.zhongyihskhealth.com`
3. 重新部署前端项目
4. 测试小程序和前端网页

### 预期效果

- ✅ 小程序网络请求成功
- ✅ 前端网页数据加载正常
- ✅ 管理后台可以正常使用
- ✅ 无需等待主域名 ICP 备案
- ✅ 无需依赖 www.zhongyihskhealth.com

---

**更新时间**：2026-02-28
**问题状态**：待解决（需要在 Vercel Dashboard 和微信小程序后台中配置）
