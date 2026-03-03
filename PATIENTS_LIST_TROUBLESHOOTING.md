# 用户列表为空问题排查指南

## 问题描述
点击"选择用户"时，用户列表显示"暂无用户记录"。

## 可能原因

### 1. 数据库中确实没有用户记录
- **检查方法**: 查看 Supabase 数据库中 `members` 表是否有数据
- **解决方案**: 添加测试用户记录

### 2. 后端 API 无法访问
- **检查方法**: 测试 `/api/members` 接口是否返回数据
- **解决方案**: 部署后端服务，配置正确的域名

### 3. 前端 API 路径配置错误
- **检查方法**: 查看前端环境变量 `PROJECT_DOMAIN` 配置
- **解决方案**: 配置正确的前端环境变量

### 4. 数据库连接失败
- **检查方法**: 检查后端环境变量 `DATABASE_URL` 是否正确
- **解决方案**: 配置正确的数据库连接字符串

---

## 排查步骤

### Step 1: 检查数据库是否有数据

登录 Supabase Dashboard，执行以下 SQL 查询：

```sql
SELECT COUNT(*) as member_count FROM members;
```

**预期结果**:
- 如果 `member_count = 0`，说明数据库中确实没有用户记录
- 如果 `member_count > 0`，说明有数据，继续排查其他原因

### Step 2: 测试后端 API

在浏览器中打开以下 URL（替换为实际域名）：

```
https://your-backend-domain.vercel.app/api/members
```

**预期结果**:
```json
{
  "code": 200,
  "msg": "success",
  "data": [...]
}
```

**如果返回错误**:
- 404 Not Found: 后端未部署或路由配置错误
- 500 Internal Server Error: 后端代码错误或数据库连接失败
- 401 Unauthorized: 需要认证

### Step 3: 检查前端网络请求

打开浏览器控制台（F12），查看 Network 标签页，找到 `/api/members` 请求：

**检查项**:
1. 请求 URL 是否正确
2. 请求方法是否为 GET
3. 响应状态码
4. 响应数据结构

### Step 4: 检查环境变量配置

**前端项目环境变量**:
- 登录 Vercel Dashboard
- 进入 `zhongyi-smart` 项目
- Settings → Environment Variables
- 检查 `PROJECT_DOMAIN` 配置

**后端项目环境变量**:
- 登录 Vercel Dashboard
- 进入 `tcm-smart-diagnosis-backend` 项目
- Settings → Environment Variables
- 检查 `DATABASE_URL` 配置

---

## 快速解决方案

### 方案 1: 添加测试用户（如果数据库为空）

登录 Supabase Dashboard，执行以下 SQL：

```sql
INSERT INTO members (
  id,
  consultant_id,
  name,
  gender,
  age,
  birth_year,
  height,
  weight,
  phone,
  contact_info,
  address,
  health_history,
  allergies,
  visit_count,
  created_at,
  updated_at
) VALUES (
  'test-member-1',
  'default-consultant',
  '张三',
  '男',
  35,
  1989,
  175,
  70,
  '13800138000',
  '张三本人',
  '北京市朝阳区',
  '既往体健，无重大病史',
  '无已知过敏',
  0,
  NOW(),
  NOW()
);
```

### 方案 2: 检查并修复环境变量

**前端环境变量**:
- 如果后端部署在同一个 Vercel 项目，设置 `PROJECT_DOMAIN=/`
- 如果后端部署在独立项目，设置 `PROJECT_DOMAIN=https://your-backend-domain.vercel.app`

**后端环境变量**:
- 确认 `DATABASE_URL` 格式正确
- 格式示例：`postgresql://user:password@host:port/database`

### 方案 3: 部署后端服务

如果后端未部署，执行以下步骤：

1. 在 Vercel Dashboard 中，进入 `tcm-smart-diagnosis-backend` 项目
2. 配置构建命令（如果需要）
3. 配置环境变量
4. 触发部署

### 方案 4: 通过前端界面添加用户

如果后端 API 正常，可以通过前端界面添加用户：

1. 打开应用
2. 进入"对象管理"页面
3. 点击"+ 添加用户"按钮
4. 填写用户信息并提交

---

## 代码检查

### 前端 API 调用

**文件**: `src/pages/patients-list/index.tsx`

```typescript
const loadMembers = async () => {
  try {
    setLoading(true)
    const res = await Network.request({
      url: '/api/members',  // ← 检查这个路径
      method: 'GET'
    })

    if (res.statusCode === 200) {
      setMembers(res.data.data || [])  // ← 检查数据解析
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    Taro.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    setLoading(false)
  }
}
```

### 后端 API 实现

**文件**: `server/src/patients/patients.controller.ts`

```typescript
@Controller('members')  // ← 路由前缀
export class PatientsController {
  @Get()  // ← GET /api/members
  async findAll() {
    return {
      code: 200,
      msg: 'success',
      data: await this.patientsService.findAll()
    }
  }
}
```

---

## 常见错误及解决方案

### 错误 1: "加载失败"

**原因**: API 请求失败
**解决方案**:
- 检查网络连接
- 检查后端是否部署
- 检查环境变量配置

### 错误 2: 显示"暂无用户记录"但数据库有数据

**原因**: 后端 API 返回数据格式不正确
**解决方案**:
- 检查后端响应数据结构
- 确认前端数据解析逻辑

### 错误 3: CORS 错误

**原因**: 跨域问题
**解决方案**:
- 检查后端 CORS 配置
- 确保前端域名在白名单中

---

## 需要用户提供的信息

为了进一步排查问题，请提供以下信息：

1. **数据库数据**: Supabase `members` 表中是否有数据？
2. **后端状态**: 后端是否成功部署？域名是什么？
3. **环境变量**:
   - 前端 `PROJECT_DOMAIN` 配置
   - 后端 `DATABASE_URL` 配置
4. **网络请求**: 浏览器控制台 Network 标签页中 `/api/members` 请求的详细信息

---

## 下一步

根据排查结果，选择相应的解决方案：

- 如果数据库为空 → 添加测试用户
- 如果后端未部署 → 部署后端服务
- 如果环境变量配置错误 → 修复环境变量
- 如果 API 路由错误 → 修复路由配置
