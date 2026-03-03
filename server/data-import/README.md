# 数据导入说明

## 概述

本目录包含慢性病方证数据的导入脚本，用于将数据导入到 Supabase 数据库。

## ⚠️ 重要提示

在运行数据导入脚本之前，**必须先执行数据库迁移**，创建所有必要的表。

## 文件说明

- `chronic-disease-data.json` - 慢性病方证数据文件
- `import-data.ts` - 数据导入脚本
- `MIGRATION_GUIDE.md` - 详细的数据库迁移指南
- `README.md` - 本说明文件

## 数据结构

### 1. formula_disease_relations（方剂-疾病关联）

方剂与疾病的关联关系，包含疗效评分、循证等级等信息。

```json
{
  "id": "fdr_001",
  "formula_id": "formula_001",
  "disease_category_id": "digestive_gastritis",
  "efficacy_score": 0.85,
  "evidence_level": "high",
  "evidence_sources": ["伤寒论", "临床研究"],
  "clinical_cases_count": 120,
  "clinical_effectiveness": 0.88
}
```

### 2. chronic_disease_formulas（慢性病方剂配置）

慢性病专用方剂的详细配置，包含剂量调整、疗程说明、生活建议等。

```json
{
  "id": "cdf_001",
  "formula_id": "formula_001",
  "disease_category_id": "digestive_gastritis",
  "disease_stage": "all",
  "symptom_pattern": "胃痛、胀满、嗳气",
  "syndrome_type": "脾胃气虚",
  "dosage_adjustment": "原方剂量，可酌加黄芪30g",
  "duration_notes": "4周为一个疗程",
  "combination_formulas": [],
  "contraindications": ["胃阴不足", "胃火炽盛"],
  "special_cautions": ["服药期间忌食生冷", "避免过度劳累"],
  "lifestyle_advice": {
    "diet": "易消化饮食，少食多餐",
    "exercise": "适度运动，避免剧烈运动",
    "sleep": "规律作息，避免熬夜",
    "emotion": "保持心情舒畅，避免焦虑"
  }
}
```

### 3. formula_evidence（循证医学证据）

方剂的循证医学证据，包含临床试验、荟萃分析等。

```json
{
  "id": "fe_001",
  "formula_id": "formula_001",
  "disease_category_id": "digestive_gastritis",
  "evidence_type": "clinical_trial",
  "title": "补中益气汤治疗慢性胃炎临床研究",
  "authors": "张三, 李四",
  "source": "中医杂志",
  "year": 2020,
  "sample_size": 120,
  "effectiveness": 0.88,
  "p_value": 0.001,
  "confidence_interval": "0.82-0.94",
  "url": "https://doi.org/10.13288/j.11-2166/r.2020.03.012",
  "abstract": "本研究评价补中益气汤治疗慢性胃炎的临床疗效...",
  "key_findings": ["总有效率88%", "症状评分显著改善", "无严重不良反应"],
  "limitations": "样本量较小，随访时间较短"
}
```

### 4. tumor_formula_relations（肿瘤方剂关系）

肿瘤患者专用方剂的配置，包含体质、病机、并发症等。

```json
{
  "id": "tfr_001",
  "formula_id": "formula_001",
  "disease_category_id": "tumor_lung",
  "constitution_id": "qi_deficiency",
  "pathogenesis_id": "toxic_stagnation",
  "complication_id": "chemotherapy_side_effects",
  "dosage_adjustment": "原方剂量，黄芪加量至45g，加白花蛇舌草30g",
  "efficacy_notes": "适用于肺癌化疗后气血两虚证",
  "clinical_evidence": ["临床观察", "专家经验"],
  "evidence_level": "medium"
}
```

## 使用步骤

### 0. 数据库迁移（必须先执行）

**⚠️ 在导入数据之前，必须先执行数据库迁移，创建所有必要的表。**

由于 Supabase REST API 权限限制，需要手动执行迁移。有以下两种方式：

#### 方法一：通过 Supabase Dashboard（推荐）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击 "SQL Editor"
4. 点击 "New Query" 创建新查询
5. 复制 `server/migrations/create_missing_tables.sql` 的全部内容
6. 粘贴到 SQL Editor 中
7. 点击 "Run" 执行
8. 等待执行完成，检查是否有错误

#### 方法二：使用 psql 命令行工具

```bash
# 使用 Supabase 提供的连接字符串
psql "postgresql://postgres:[password]@[host]:5432/postgres" -f server/migrations/create_missing_tables.sql
```

#### 验证迁移结果

迁移完成后，执行以下 SQL 验证表是否创建成功：

```sql
-- 检查表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'formula_disease_relations',
    'chronic_disease_formulas',
    'formula_evidence'
  );
```

所有表都应该出现在结果中。

### 1. 确保数据库已初始化

首先运行数据库迁移脚本，创建所有必要的表：

```bash
# 在 Supabase SQL Editor 中执行
psql -h <host> -U <user> -d <database> -f server/migrations/003_add_comprehensive_database_schema.sql
```

或使用 Supabase Dashboard 的 SQL Editor 执行迁移脚本。

### 2. 配置环境变量

确保 `.env` 文件中包含以下变量：

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 准备数据文件

编辑 `chronic-disease-data.json` 文件，添加或修改数据。

**注意事项**：
- `formula_id` 必须对应 `formulas` 表中已存在的方剂ID
- `disease_category_id` 必须对应 `disease_categories` 表中已存在的分类ID
- `constitution_id`、`pathogenesis_id`、`complication_id` 必须对应相关表中已存在的ID

### 4. 运行导入脚本

```bash
# 编译并运行导入脚本
npx ts-node server/data-import/import-data.ts
```

或添加到 `package.json`：

```json
{
  "scripts": {
    "import:data": "ts-node server/data-import/import-data.ts"
  }
}
```

然后运行：

```bash
npm run import:data
```

### 5. 验证导入结果

导入完成后，可以在 Supabase Dashboard 中查看数据：

- `formula_disease_relations` 表
- `chronic_disease_formulas` 表
- `formula_evidence` 表
- `tumor_formula_relations` 表

## 数据维护

### 更新现有数据

修改 `chronic-disease-data.json` 中的对应记录，然后重新运行导入脚本。脚本会使用 `upsert` 操作，自动更新已存在的记录。

### 添加新数据

在 `chronic-disease-data.json` 中添加新记录，确保ID唯一，然后运行导入脚本。

### 删除数据

如需删除数据，建议在 Supabase Dashboard 中手动删除，或编写专门的删除脚本。

## 错误处理

### 常见错误

1. **缺少外键引用**
   - 错误：`foreign key constraint fails`
   - 解决：确保 `formula_id`、`disease_category_id` 等外键引用的数据已存在

2. **唯一约束冲突**
   - 错误：`duplicate key value violates unique constraint`
   - 解决：修改数据的唯一标识符，或删除已存在的记录

3. **环境变量未配置**
   - 错误：`缺少 Supabase 环境变量`
   - 解决：检查 `.env` 文件中的 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY`

## 批量导入

如需批量导入大量数据，建议：

1. 将数据分批处理（每批 100-500 条）
2. 使用事务确保数据一致性
3. 添加进度日志和错误日志
4. 考虑使用 Supabase 的批量插入 API

## 备份与恢复

### 备份数据

```bash
# 导出所有数据
pg_dump -h <host> -U <user> -d <database> > backup.sql
```

### 恢复数据

```bash
# 恢复数据
psql -h <host> -U <user> -d <database} < backup.sql
```

## 联系支持

如遇到问题，请联系开发团队或提交 Issue。
