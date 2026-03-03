# 🎉 项目迁移到 superdxhua's Project

## ✅ 已完成

1. ✅ 更新 `.env` 配置文件，切换到新项目
2. ✅ 验证新项目连接成功
3. ✅ 备份旧项目配置到 `.env.backup`
4. ✅ 确认新项目为空项目（无现有表）

---

## 📋 下一步操作

### 步骤 1：执行数据库迁移

在 Supabase Dashboard 中：

1. **访问项目**
   - URL: https://supabase.com/dashboard/project/dwswtkfbtdohaftnklxx

2. **打开 SQL Editor**
   - 点击左侧的 **SQL Editor**
   - 点击 **New Query**

3. **执行迁移脚本**
   - 打开文件：`server/migrations/create_missing_tables.sql`
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 **Run** 执行

4. **验证迁移结果**
   - 检查是否有错误
   - "relation already exists" 错误可以忽略

---

### 步骤 2：导入基础数据

迁移脚本执行完成后，在终端运行：

```bash
cd /workspace/projects/server
npx tsx data-import/import-data.ts
```

**预期输出**：
```
🚀 开始导入慢性病方证数据...

📋 数据文件加载成功
   - 方剂-疾病关联: 3 条
   - 慢性病方剂配置: 15 条
   - 循证医学证据: 15 条
   - 肿瘤方剂关系: 2 条

[... 导入过程 ...]

✅ 所有数据导入完成！
```

---

### 步骤 3：验证数据

在 Supabase Dashboard 中：

1. 点击 **Table Editor**
2. 检查各表的记录数：
   - `formula_disease_relations`: 3 条
   - `chronic_disease_formulas`: 15 条
   - `formula_evidence`: 15 条

或在 SQL Editor 中执行：

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

## 📊 迁移后的数据库结构

### 表结构

```
✅ formulas（方剂表）
✅ formula_symptoms（方剂症状表）
✅ disease_categories（疾病分类表，44 条）
✅ tumor_formula_relations（肿瘤方剂关系表，43 条）
✅ tumor_constitutions（肿瘤体质表）
✅ tumor_pathogeneses（肿瘤病机表）
✅ tumor_complications（肿瘤并发症表）
✅ formula_disease_relations（方剂-疾病关联表，3 条）
✅ chronic_disease_formulas（慢性病配置表，15 条）
✅ formula_evidence（循证证据表，15 条）
```

### 功能支持

- ✅ 通用方剂推荐
- ✅ 慢性病专用方剂推荐
- ✅ 肿瘤患者方剂推荐
- ✅ 循证医学证据查询
- ✅ 疾病分类管理
- ✅ 症状匹配分析

---

## 🆕 项目信息

### 新项目配置

- **项目名称**: superdxhua's Project
- **项目引用 ID**: dwswtkfbtdohaftnklxx
- **项目 URL**: https://dwswtkfbtdohaftnklxx.supabase.co
- **区域**: AWS | ap-southeast-1

### 配置文件

```bash
# .env 文件
COZE_SUPABASE_URL=https://dwswtkfbtdohaftnklxx.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
COZE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 备份文件

```bash
# 旧项目配置备份
.env.backup
```

---

## ❓ 常见问题

### Q: 迁移脚本执行失败怎么办？

A: 
1. 检查 SQL 是否完整复制
2. 查看错误信息
3. 如果是 "already exists" 错误，可以忽略
4. 如果是其他错误，检查 SQL 语法

### Q: 数据导入失败怎么办？

A: 
1. 确保迁移脚本已成功执行
2. 检查外键引用的数据是否存在
3. 查看导入脚本的错误日志
4. 重新执行导入脚本（使用 upsert 会更新已存在的记录）

### Q: 如何验证迁移成功？

A: 
1. 检查所有表是否创建成功
2. 检查数据记录数是否正确
3. 测试 API 接口是否正常

---

## 📝 完成检查清单

迁移完成后，请确认：

- [ ] 迁移脚本执行成功（无错误或仅有 "already exists"）
- [ ] 所有新表已创建：
  - [ ] `formula_disease_relations`
  - [ ] `chronic_disease_formulas`
  - [ ] `formula_evidence`
- [ ] 数据导入脚本执行成功
- [ ] 数据记录数正确：
  - [ ] `formula_disease_relations`: 3 条
  - [ ] `chronic_disease_formulas`: 15 条
  - [ ] `formula_evidence`: 15 条
- [ ] API 接口测试正常

---

## 🎯 下一步

迁移完成后，你的应用就可以：

1. **使用智能方剂推荐功能**
   - 通用方剂推荐
   - 慢性病方剂推荐
   - 肿瘤患者方剂推荐

2. **查询循证医学证据**
   - 临床试验数据
   - 荟萃分析结果
   - 病例研究数据

3. **管理疾病分类**
   - 层级分类结构
   - 中医疾病名称

---

**祝迁移成功！** 🎉
