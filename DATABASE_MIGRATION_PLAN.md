# 数据库统一迁移方案

## 概述

将所有环境（本地开发、Render 生产环境）统一使用同一个 Supabase 数据库实例，解决数据库不一致导致的生产环境登录问题。

## 当前状态

### 已完成
- ✅ Supabase 数据库表结构已完整迁移（18个表）
- ✅ 表包括：users, user_permissions, medical_cases, patients, patient_records 等
- ✅ 经方数据库表结构已创建

### 待完成
- ❌ 数据库表为空（无数据）
- ❌ 缺少 admin 用户
- ❌ 缺少经方数据
- ❌ 环境变量未统一配置

## 统一数据库信息

```
Supabase 项目 URL: https://dwswtkfbtdohaftnklxx.supabase.co
项目 ID: dwswtkfbtdohaftnklxx
ANON KEY: YOUR_SUPABASE_ANON_KEY_HERE
```

## 迁移步骤

### 第一步：初始化数据库数据

由于 ANON_KEY 没有写入权限，需要通过 Supabase Dashboard 手动执行 SQL 脚本。

#### 操作步骤：

1. **访问 Supabase Dashboard**
   - URL: https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql
   - 点击 "SQL Editor"

2. **执行初始化脚本**
   - 打开 `server/scripts/unified-database-init.sql` 文件
   - 复制全部内容
   - 粘贴到 SQL Editor 中
   - 点击 "Run" 执行

3. **验证执行结果**
   - 检查输出中是否显示成功信息
   - 确认 admin 用户已创建
   - 确认经方数据已导入（4条医案）

### 第二步：配置环境变量

#### 2.1 配置 Render 生产环境

在 Render Dashboard 中添加以下环境变量：

```
COZE_SUPABASE_URL=https://dwswtkfbtdohaftnklxx.supabase.co
COZE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
```

**操作步骤**：
1. 访问 https://dashboard.render.com
2. 找到后端服务（zhongyi-api）
3. 点击 "Environment"
4. 添加上述环境变量
5. 点击 "Save Changes"
6. 触发重新部署（Manual Deploy → Deploy latest commit）

#### 2.2 配置本地/扣子开发环境

项目应该从扣子环境变量中读取配置。确保扣子项目中已配置：

```
COZE_SUPABASE_URL=https://dwswtkfbtdohaftnklxx.supabase.co
COZE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
```

**验证方法**：
```bash
cd /workspace/projects/server
node -e "require('./src/storage/database/supabase-client.ts').getSupabaseCredentials()"
```

#### 2.3 配置前端环境

前端也需要配置相同的 Supabase URL。

**如果是 Vercel 部署**：
1. 访问 Vercel Dashboard
2. 找到前端项目
3. Settings → Environment Variables
4. 添加：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://dwswtkfbtdohaftnklxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
   ```
5. 重新部署前端项目

### 第三步：重新部署服务

#### 3.1 重新部署 Render 后端

```bash
# 在 Render Dashboard 中
1. 点击 "Manual Deploy"
2. 选择 "Deploy latest commit"
3. 等待部署完成
```

#### 3.2 重新部署前端（Vercel）

```bash
# 在 Vercel Dashboard 中
1. 点击 "Redeploy"
2. 等待部署完成
```

### 第四步：验证功能

#### 4.1 测试登录功能

1. 访问生产环境：https://zhongyihskhealth.com
2. 使用以下凭据登录：
   - 用户名: `admin`
   - 密码: `123456`
3. 验证是否能够成功登录

#### 4.2 测试经方查询

1. 登录后，进入经方查询功能
2. 搜索 "桂枝汤"
3. 验证是否能查询到医案数据

#### 4.3 测试数据库连接

在扣子开发环境中运行：
```bash
cd /workspace/projects/server
node scripts/check-all-tables.js
```

应该显示所有表都存在，并且有数据。

## 数据库表结构

### 已创建的表（18个）

1. **用户管理**
   - `users` - 用户表
   - `user_permissions` - 用户权限表
   - `register_qrcodes` - 注册二维码表

2. **订单和支付**
   - `recharge_orders` - 充值订单
   - `orders` - 套餐订单
   - `refunds` - 退款表
   - `user_balance` - 用户余额

3. **患者管理**
   - `patients` - 患者表
   - `patient_records` - 患者记录
   - `prescription_adjustments` - 处方调整
   - `medication_feedback` - 用药反馈

4. **经方数据库**
   - `medical_cases` - 医疗案例（经方）
   - `medical_case_feedback` - 案例反馈

5. **其他**
   - `file_records` - 文件记录
   - `app_versions` - 应用版本
   - `packages` - 套餐表
   - `user_feedback` - 用户反馈
   - `health_check` - 健康检查

## 初始化数据

### Admin 用户
- 用户名: `admin`
- 密码: `123456`
- 角色: `admin`

### 经方数据（4条医案）
1. **桂枝汤** - 张仲景（太阳中风证）
2. **麻黄汤** - 张仲景（太阳伤寒证）
3. **小柴胡汤** - 张仲景（少阳病）
4. **破格救心汤** - 李可（心肾阳衰）

## 故障排查

### 问题 1: 登录失败，提示"用户名或密码错误"

**原因**：
- admin 用户未创建
- 密码哈希不正确

**解决方案**：
```bash
# 1. 检查 admin 用户是否存在
node scripts/check-all-tables.js

# 2. 如果不存在，重新执行 SQL 脚本
# 访问 https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql
# 执行 unified-database-init.sql
```

### 问题 2: 前端无法连接数据库

**原因**：
- 环境变量未配置
- Supabase URL 错误

**解决方案**：
```bash
# 检查环境变量
node -e "require('./src/storage/database/supabase-client.ts').getSupabaseCredentials()"

# 确认输出正确的 URL 和 KEY
```

### 问题 3: Render 服务启动失败

**原因**：
- 环境变量未配置
- 数据库连接失败

**解决方案**：
```bash
# 1. 检查 Render 环境变量
# 在 Render Dashboard 中确认 COZE_SUPABASE_URL 和 COZE_SUPABASE_ANON_KEY 已配置

# 2. 查看 Render 服务日志
# 检查是否有数据库连接错误

# 3. 重新部署服务
```

### 问题 4: 经方数据为空

**原因**：
- SQL 脚本未执行
- 数据导入失败

**解决方案**：
```bash
# 1. 检查 medical_cases 表数据
node scripts/check-all-tables.js

# 2. 如果为空，重新执行 SQL 脚本
# 访问 https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql
# 执行 unified-database-init.sql
```

## 优势

使用统一的 Supabase 数据库实例有以下优势：

1. **数据一致性**：所有环境使用相同的数据，避免不一致问题
2. **简化架构**：减少数据库实例数量，降低维护成本
3. **开发效率**：开发和生产环境共享数据结构，调试更简单
4. **成本优化**：只需一个 Supabase 实例，降低费用
5. **易于扩展**：基于 Supabase 的自动扩展能力

## 注意事项

1. **数据备份**：定期备份 Supabase 数据库
2. **权限管理**：合理配置 RLS 策略，保护数据安全
3. **环境隔离**：虽然数据库统一，但可以通过环境变量区分开发和生产逻辑
4. **监控告警**：设置 Supabase 监控，及时发现问题

## 后续优化

1. **添加更多经方数据**：继续导入经典医案
2. **实施数据库迁移工具**：使用 Drizzle 等工具管理数据库版本
3. **添加数据同步机制**：如果需要多环境隔离，可以考虑数据同步
4. **优化查询性能**：添加必要的索引，优化查询速度

## 相关文档

- `RENDER_LOGIN_FIX.md` - Render 登录问题修复指南
- `server/scripts/unified-database-init.sql` - 数据库初始化 SQL 脚本
- `server/scripts/check-all-tables.js` - 数据库表检查脚本
- `server/scripts/init-unified-database.js` - 数据库初始化脚本（Node.js 版本）

## 技术支持

如遇问题：
1. 检查 Supabase Dashboard：https://app.supabase.com/project/dwswtkfbtdohaftnklxx
2. 查看服务日志（Render / Vercel）
3. 运行诊断脚本：`node scripts/check-all-tables.js`
