# 肿瘤经方数据库使用指南

## 一、数据库概览

肿瘤经方数据库专为长期需要用药的肿瘤类患者设计，以《伤寒论》《金匮要略》的六经辨证思维为纲，结合现代肿瘤治疗背景，建立了分层、动态、安全导向的专业知识体系。

### 数据统计
- **体质分类**：4 种（太阴脾虚质、少阴阳虚质、厥阴寒热错杂质、少阳气郁质）
- **病机分类**：4 种（瘀血内阻、痰饮凝聚、气滞不行、毒热蕴结）
- **治疗变证**：11 种（涵盖手术、化疗、放疗、靶向/免疫治疗的各种副作用）
- **症状支持**：4 种（癌性疼痛、顽固性呃逆、腹水/胸水、失眠焦虑）
- **方证关联**：24 条（将方证与体质、病机、变证、症状等关联）
- **药物相互作用**：5 条（现代药物与中药的相互作用）

## 二、核心设计理念

### 1. 六经辨证为纲
所有方证都必须明确六经归属，确保辨证准确。

### 2. 动态证候管理
记录治疗过程中的证候变化，支持不同阶段的调理方案。

### 3. 安全优先
内置药物禁忌和相互作用检查，特别是与现代肿瘤治疗药物的相互作用。

### 4. 分层调理
- **治标**：快速缓解症状（如疼痛、呃逆）
- **治本**：调理体质（如补气血、温阳）
- **调和**：平衡寒热、调和气机
- **扶正**：增强免疫力（如小建中汤、肾气丸）

## 三、数据库表结构

### 3.1 体质分类表 (tumor_constitutions)
记录肿瘤患者的六经体质底色。

**查询示例**：
```sql
SELECT * FROM tumor_constitutions WHERE meridian_basis = '少阴';
```

### 3.2 病机分类表 (tumor_pathogenesis)
记录肿瘤相关的病机类型（瘀血、痰饮、气滞、毒热）。

**查询示例**：
```sql
SELECT * FROM tumor_pathogenesis WHERE category = '瘀血内阻';
```

### 3.3 治疗变证表 (treatment_complications)
记录现代治疗带来的"坏病"与变证。

**查询示例**：
```sql
SELECT * FROM treatment_complications WHERE treatment_type = '化疗';
```

### 3.4 症状支持表 (symptom_support_formulas)
记录症状导向的对症支持方证。

**查询示例**：
```sql
SELECT * FROM symptom_support_formulas WHERE symptom_category = '疼痛';
```

### 3.5 肿瘤方证关联表 (tumor_formula_relations)
将方证与体质、病机、变证、症状等关联起来。

**查询示例**：
```sql
SELECT
  f.formula_name,
  t.name as constitution,
  p.category as pathogenesis,
  c.complication_name,
  s.symptom_name,
  r.priority,
  r.indication
FROM tumor_formula_relations r
LEFT JOIN formulas f ON r.formula_id = f.id
LEFT JOIN tumor_constitutions t ON r.constitution_id = t.constitution_id
LEFT JOIN tumor_pathogenesis p ON r.pathogenesis_id = p.pathogenesis_id
LEFT JOIN treatment_complications c ON r.complication_id = c.complication_id
LEFT JOIN symptom_support_formulas s ON r.symptom_id = s.symptom_id
WHERE r.complication_id = 'CHEMO_GI_REACTION'
ORDER BY r.priority DESC;
```

### 3.6 药物安全检查表 (drug_safety_checks)
记录药物的安全信息和禁忌。

**查询示例**：
```sql
SELECT * FROM drug_safety_checks WHERE warning_level = 'D';
```

### 3.7 现代药物相互作用表 (modern_drug_interactions)
记录现代药物与中药的相互作用。

**查询示例**：
```sql
SELECT * FROM modern_drug_interactions WHERE severity = '重';
```

## 四、典型应用场景

### 4.1 化疗后恶心呕吐
**变证**：化疗后消化道反应（CHEMO_GI_REACTION）
**六经**：少阳
**推荐方证**：小柴胡汤
**适应症**：口苦咽干，默默不欲饮食，恶心呕吐
**疗程**：7-14天

```sql
SELECT
  f.formula_name,
  f.dosage,
  f.instructions,
  r.indication,
  r.dosage_adjustment,
  r.duration
FROM tumor_formula_relations r
LEFT JOIN formulas f ON r.formula_id = f.id
WHERE r.complication_id = 'CHEMO_GI_REACTION'
ORDER BY r.priority DESC
LIMIT 1;
```

### 4.2 化疗后骨髓抑制
**变证**：化疗后骨髓抑制（CHEMO_MARROW_SUPPRESSION）
**六经**：少阴
**推荐方证**：肾气丸、炙甘草汤
**适应症**：贫血、白细胞低、头晕乏力
**疗程**：21-28天

### 4.3 放疗后口腔溃疡
**变证**：化疗后口腔溃疡（CHEMO_STOMATITIS）
**六经**：少阴
**推荐方证**：黄连阿胶汤、竹叶石膏汤
**适应症**：口腔溃疡、口干、咽痛、心烦
**疗程**：7-14天

### 4.4 癌性疼痛
**症状**：癌性疼痛（CANCER_PAIN）
**六经**：厥阴
**推荐方证**：芍药甘草汤、桂枝茯苓丸
**适应症**：肝急筋急，腹痛拘急
**疗程**：持续使用

## 五、安全机制

### 5.1 绝对禁忌
- **十枣汤**：仅限短期、小量、严密监护下使用
- **附子、细辛**：标注剂量上限和煎煮要求

### 5.2 药物相互作用
- **华法林 + 丹参/当归**：增强抗凝作用，需监测凝血功能
- **地高辛 + 甘草**：增加地高辛血药浓度，需监测心律
- **β受体阻滞剂 + 附子**：可能增加低血压风险，需密切监测血压

### 5.3 疗效预期管理
明确标注：本方旨在改善症状、提高生活质量，非直接杀灭肿瘤。

### 5.4 强制面诊提示
对晚期、恶液质、多线治疗失败患者，建议以姑息照护为主，中药调理需个体化面诊。

## 六、查询优化建议

### 6.1 按六经体质查询
```sql
SELECT * FROM tumor_formula_relations
WHERE constitution_id = 'SHAOYIN_YANG_XU'
ORDER BY priority DESC;
```

### 6.2 按治疗类型查询
```sql
SELECT
  c.complication_name,
  c.treatment_type,
  c.time_window,
  c.severity
FROM treatment_complications c
WHERE c.treatment_type = '化疗'
ORDER BY c.severity DESC;
```

### 6.3 按症状查询
```sql
SELECT
  s.symptom_name,
  s.recommended_formula,
  s.safety_level,
  s.dosage_adjustment
FROM symptom_support_formulas s
WHERE s.symptom_category = '疼痛';
```

### 6.4 按药物相互作用查询
```sql
SELECT
  m.herb_name,
  m.modern_drug,
  m.interaction_type,
  m.severity,
  m.recommendation
FROM modern_drug_interactions m
WHERE m.modern_drug = '华法林';
```

## 七、数据更新维护

### 7.1 新增变证
当发现新的治疗变证时，需要在 `treatment_complications` 表中添加记录。

### 7.2 新增方证关联
当有新的方证应用经验时，需要在 `tumor_formula_relations` 表中添加关联。

### 7.3 更新药物相互作用
当发现新的药物相互作用时，需要在 `modern_drug_interactions` 表中添加记录。

### 7.4 数据验证
定期验证数据的准确性和完整性，确保六经辨证的一致性。

## 八、注意事项

### 8.1 证候动态变化
肿瘤患者的证候会随着治疗进程而动态变化，需要根据不同阶段调整方案。

### 8.2 多经合病
肿瘤患者常处于多经合病状态，需要综合考虑多个六经的证型。

### 8.3 寒热错杂
肿瘤患者常出现寒热错杂的复杂证候，需要使用调和寒热的方剂。

### 8.4 正虚邪实
肿瘤患者常处于正虚邪实状态，需要扶正祛邪并举。

### 8.5 安全优先
在使用任何方剂前，必须检查药物禁忌和相互作用，特别是与现代肿瘤治疗药物的相互作用。

## 九、未来扩展方向

### 9.1 向量检索
将方证、症状、病机等向量化，实现语义检索。

### 9.2 AI 辅助辨证
集成大模型，实现智能辨证和方证推荐。

### 9.3 知识图谱
构建肿瘤经方知识图谱，实现更复杂的推理和关联。

### 9.4 疗效追踪
建立疗效追踪系统，记录方证使用效果，优化推荐算法。
