# ✅ Service Role Key 配置成功

## 当前状态

✅ Service Role Key 已成功配置  
✅ 密钥验证通过  
✅ 数据导入脚本已更新为使用 Service Role Key

---

## ⚠️ 重要提示

**由于网络限制，无法自动连接到 PostgreSQL 数据库端口（5432）**。

这个 Supabase 实例使用了自定义域名（`supabase2.aidap-global.cn-beijing.volces.com`），该域名只开放了 HTTP/HTTPS 端口用于 API 访问，**不开放直接的 PostgreSQL 数据库连接端口**。

因此，**无法通过脚本自动执行数据库迁移**，需要通过 Supabase Dashboard 手动执行。

---

## 📋 下一步操作

### 方法一：通过 Supabase Dashboard（唯一可行方案）

#### 步骤 1：登录 Supabase Dashboard

1. 访问你的 Supabase 项目 Dashboard
   - URL: https://supabase.com/dashboard
2. 选择项目：**br-zippy-kea-87a692a5**

#### 步骤 2：打开 SQL Editor

1. 在左侧导航栏点击 **SQL Editor**
2. 点击 **New Query** 创建新查询

#### 步骤 3：执行迁移脚本

1. 打开文件：`server/migrations/create_missing_tables.sql`
2. 复制**全部内容**
3. 粘贴到 SQL Editor 中
4. 点击 **Run** 按钮执行

#### 步骤 4：验证迁移结果

执行完成后，查看控制台输出：
- ✅ 如果没有错误，迁移成功
- ⚠️ 如果有 "relation already exists" 错误，可以忽略（表已存在）

#### 步骤 5：检查表是否创建成功

在 Supabase Dashboard 中：
1. 点击 **Table Editor**
2. 检查以下表是否存在：
   - ✅ `formula_disease_relations`
   - ✅ `chronic_disease_formulas`
   - ✅ `formula_evidence`

---

### 步骤 6：运行数据导入脚本

迁移完成后，在终端执行：

```bash
cd /workspace/projects/server
npx tsx data-import/import-data.ts
```

预期输出：
```
🚀 开始导入慢性病方证数据...

📋 数据文件加载成功
   - 方剂-疾病关联: 3 条
   - 慢性病方剂配置: 15 条
   - 循证医学证据: 15 条
   - 肿瘤方剂关系: 2 条

📦 导入方剂-疾病关联数据...
  ✅ 导入成功: fdr_001
  ✅ 导入成功: fdr_002
  ✅ 导入成功: fdr_003

📊 方剂-疾病关联导入完成: 成功 3 条, 失败 0 条

[... 其他数据导入成功 ...]

✅ 所有数据导入完成！
```

---

## 📊 验证数据导入结果

导入完成后，可以验证数据：

### 在 Supabase Dashboard 中

1. 打开 **Table Editor**
2. 点击各个表，检查记录数：
   - `formula_disease_relations`: 应有 **3 条**
   - `chronic_disease_formulas`: 应有 **15 条**
   - `formula_evidence`: 应有 **15 条**

### 使用 SQL 查询

在 SQL Editor 中执行：

```sql
-- 检查各表的记录数
SELECT 
  'formula_disease_relations' AS table_name,
  COUNT(*) AS row_count
FROM formula_disease_relations
UNION ALL
SELECT 'chronic_disease_formulas', COUNT(*) FROM chronic_disease_formulas
UNION ALL
SELECT 'formula_evidence', COUNT(*) FROM formula_evidence;
```

---

## 📝 迁移脚本内容预览

迁移脚本将执行以下操作：

1. **扩展 `formulas` 表**
   - 添加 `category` 字段（方剂分类）
   - 添加 `applicable_diseases` 字段（适用疾病列表）
   - 添加 `applicable_syndromes` 字段（适用证型列表）
   - 添加 `evidence_level` 字段（循证等级）
   - 添加 `clinical_usage_count` 字段（临床使用次数）

2. **创建 `formula_disease_relations` 表**
   - 方剂与疾病的关联关系
   - 包含疗效评分、循证等级等

3. **创建 `chronic_disease_formulas` 表**
   - 慢性病专用方剂配置
   - 包含剂量调整、疗程说明、禁忌症等

4. **创建 `formula_evidence` 表**
   - 循证医学证据
   - 支持临床试验、荟萃分析等

5. **扩展 `tumor_formula_relations` 表**
   - 添加疗效说明、临床证据等字段

6. **创建索引**
   - 优化查询性能

---

## ❓ 常见问题

### Q: 为什么不能自动执行迁移？

A: 这个 Supabase 实例使用了自定义域名，**不开放 PostgreSQL 数据库端口（5432）**，只开放 HTTP/HTTPS 端口用于 API 访问。因此无法通过 pg 库直接连接数据库执行 DDL 语句。

### Q: Service Role Key 有什么用？

A: Service Role Key 已配置到代码中，用于：
- ✅ 数据导入脚本（绕过 RLS 限制）
- ✅ 执行管理员级别的数据库操作
- ✅ 后端 API 中的数据库操作

### Q: 迁移失败怎么办？

A: 
1. 检查 SQL 是否完整复制
2. 查看错误信息，如果是 "already exists" 可以忽略
3. 如果其他错误，请检查 SQL 语法

### Q: 数据导入失败怎么办？

A: 
1. 确保迁移已成功执行（所有表已创建）
2. 检查外键引用的数据是否存在
3. 查看导入脚本的错误日志

---

## 📞 需要帮助？

如果遇到问题：

1. **检查 Supabase Dashboard**
   - 确保项目访问正常
   - 检查 SQL Editor 是否可用

2. **查看错误日志**
   - 迁移脚本的错误信息
   - 数据导入脚本的错误信息

3. **重新执行**
   - 迁移脚本使用 `IF NOT EXISTS`，可以安全地重新执行
   - 数据导入使用 `upsert`，会更新已存在的记录

---

## ✅ 完成检查清单

执行迁移后，请确认：

- [ ] 迁移脚本执行成功（无错误或仅有 "already exists"）
- [ ] 三个新表已创建：
  - [ ] `formula_disease_relations`
  - [ ] `chronic_disease_formulas`
  - [ ] `formula_evidence`
- [ ] 数据导入脚本执行成功
- [ ] 数据记录数正确：
  - [ ] `formula_disease_relations`: 3 条
  - [ ] `chronic_disease_formulas`: 15 条
  - [ ] `formula_evidence`: 15 条

---

**完成后，你的数据库架构就完整了，可以使用智能方剂推荐功能了！**
