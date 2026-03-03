# ✅ Service Role Key 配置完成

## 当前状态

✅ Service Role Key 已成功配置到 `.env` 文件中
✅ 密钥验证通过

## 下一步操作

由于 Supabase 的架构限制，即使拥有 Service Role Key，仍然需要通过以下方式之一执行数据库迁移：

---

## 方法一：通过 Supabase Dashboard（最简单、推荐）

### 步骤 1：登录 Supabase Dashboard

1. 访问：https://supabase.com/dashboard
2. 选择你的项目

### 步骤 2：打开 SQL Editor

1. 在左侧导航栏点击 **SQL Editor**
2. 点击 **New Query** 创建新查询

### 步骤 3：执行迁移脚本

1. 打开文件：`server/migrations/create_missing_tables.sql`
2. 复制全部内容
3. 粘贴到 SQL Editor 中
4. 点击 **Run** 按钮

### 步骤 4：验证迁移结果

执行完成后，检查是否出现错误。如果没有错误，说明迁移成功。

---

## 方法二：使用 psql 命令行工具

### 步骤 1：获取数据库连接信息

在 Supabase Dashboard 中：

1. 点击 **Settings** → **Database**
2. 找到 **Connection string**
3. 选择 **URI** 格式
4. 复制连接字符串（格式如：`postgresql://postgres:[password]@[host]:5432/postgres`）

### 步骤 2：执行迁移

```bash
# 替换为你的实际连接字符串
psql "postgresql://postgres:[password]@[host]:5432/postgres" -f server/migrations/create_missing_tables.sql
```

---

## 方法三：使用 Supabase CLI（高级用户）

如果你安装了 Supabase CLI：

```bash
# 登录 Supabase
supabase login

# 链接到你的项目
supabase link --project-ref br-zippy-kea-87a692a5

# 执行迁移
supabase db push
```

---

## 迁移完成后

### 1. 验证表是否创建成功

在 Supabase Dashboard 的 **Table Editor** 中，检查以下表是否存在：
- ✅ `formula_disease_relations`
- ✅ `chronic_disease_formulas`
- ✅ `formula_evidence`

### 2. 运行数据导入脚本

```bash
cd /workspace/projects/server
npx tsx data-import/import-data.ts
```

### 3. 验证数据导入结果

导入完成后，检查各表的记录数：
- `formula_disease_relations`: 应有 3 条记录
- `chronic_disease_formulas`: 应有 15 条记录
- `formula_evidence`: 应有 15 条记录

---

## 常见问题

### Q: 为什么不能自动执行迁移？

A: Supabase 的 REST API 不支持直接执行 DDL 语句（CREATE TABLE、ALTER TABLE 等），需要通过 SQL Editor 或直接连接数据库执行。

### Q: Service Role Key 有什么用？

A: Service Role Key 可以用于：
- ✅ 在代码中直接操作数据库（绕过 RLS）
- ✅ 执行管理员级别的操作
- ✅ 通过 psql 直接连接数据库
- ✅ 使用 Supabase CLI 管理项目

### Q: 如何确保迁移成功？

A: 迁移脚本中使用了 `IF NOT EXISTS` 语句，即使表已存在也不会报错。执行后检查控制台输出，确认没有错误即可。

---

## 需要帮助？

如果遇到问题，请检查：

1. **网络连接**：确保可以访问 Supabase Dashboard
2. **权限**：确保你有项目的管理员权限
3. **语法错误**：如果 SQL Editor 报错，检查 SQL 语句是否完整复制

---

**提示**：迁移完成后，记得删除本文件以保持项目整洁。
