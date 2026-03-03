# 数据库调用流程详解

## 完整调用链路

```
┌─────────────────────────────────────────────────────────────┐
│ 用户操作：点击"查看"按钮查看桂枝汤详情                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 前端：formula-detail/index.tsx                              │
│                                                              │
│ Network.request({                                           │
│   url: '/api/formula-management/formulas/桂枝汤',           │
│   method: 'GET'                                             │
│ })                                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 网络层：Network.request()                                    │
│                                                              │
│ - 发起 HTTP 请求到 http://localhost:3000                     │
│ - 自动添加 Authorization header（如果有）                    │
│ - 等待后端响应                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 后端路由：/api/formula-management/formulas/:name             │
│                                                              │
│ @Get('formulas/:name')                                      │
│ async getFormulaByName(@Param('name') name: string)         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 后端 Controller：formula-management.controller.ts           │
│                                                              │
│ async getFormulaByName(@Param('name') name: string) {       │
│   try {                                                     │
│     // 调用 Service 层                                     │
│     const formula = await this.formulaService              │
│       .getFormulaByName(name);                              │
│                                                              │
│     if (!formula) {                                         │
│       return { code: 404, msg: '方剂未找到', data: null };   │
│     }                                                       │
│                                                              │
│     return { code: 200, msg: 'success', data: formula };    │
│   } catch (error) {                                        │
│     throw new HttpException({ code: 500, msg: error });     │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 后端 Service：formula-management.service.ts                  │
│                                                              │
│ async getFormulaByName(formulaName: string) {               │
│   // 🔑 关键：调用 Supabase 数据库                          │
│   const { data: formula, error } = await this.supabase       │
│     .from('formulas')                                       │
│     .select(`*                                             │
│       formula_symptoms (                                    │
│         symptom,                                            │
│         is_key,                                             │
│         weight                                              │
│       )                                                     │
│     `)                                                      │
│     .eq('formula_name', formulaName)  // WHERE 子句         │
│     .eq('is_active', true)           // WHERE 子句          │
│     .single();                       // 返回单条记录         │
│                                                              │
│   if (error) {                                              │
│     if (error.code === 'PGRST116') {                        │
│       return null;  // 未找到                              │
│     }                                                       │
│     console.error(`获取方剂 ${formulaName} 失败:`, error);  │
│     throw error;                                            │
│   }                                                         │
│                                                              │
│   // 转换数据格式                                           │
│   return this.convertToFormulaEvidence(formula);             │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Supabase 客户端：执行 SQL 查询                              │
│                                                              │
│ 实际执行的 SQL：                                            │
│                                                              │
│ SELECT                                                      │
│   formulas.*,                                               │
│   (SELECT JSON_AGG(json_build_object(                       │
│     'symptom', formula_symptoms.symptom,                    │
│     'is_key', formula_symptoms.is_key,                      │
│     'weight', formula_symptoms.weight                       │
│   ))                                                        │
│   FROM formula_symptoms                                    │
│   WHERE formula_symptoms.formula_id = formulas.id           │
│   ) AS formula_symptoms                                    │
│ FROM formulas                                               │
│ WHERE formulas.formula_name = '桂枝汤'                      │
│   AND formulas.is_active = true                            │
│ LIMIT 1;                                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Supabase PostgreSQL：执行查询并返回数据                      │
│                                                              │
│ 返回结果：                                                  │
│ {                                                           │
│   id: "uuid-xxx-xxx",                                      │
│   formula_name: "桂枝汤",                                   │
│   source: "伤寒论",                                         │
│   chapter: "太阳病篇",                                       │
│   original_text: "太阳中风...",                              │
│   mechanism: "营卫不和...",                                  │
│   treatment_method: "调和营卫",                              │
│   indications: ["太阳中风表虚证"],                           │
│   contraindications: ["表实证无汗"],                         │
│   dosage: "桂枝9g...",                                      │
│   instructions: "水煎服...",                                 │
│   meridian_category: "太阳",                                 │
│   formula_symptoms: [                                       │
│     { symptom: "恶风", is_key: true, weight: 5 },           │
│     { symptom: "发热", is_key: true, weight: 4 },           │
│     { symptom: "汗出", is_key: true, weight: 3 },           │
│     { symptom: "头痛", is_key: true, weight: 2 },           │
│     { symptom: "脉浮缓", is_key: true, weight: 1 }          │
│   ]                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 后端 Service：数据转换                                       │
│                                                              │
│ private convertToFormulaEvidence(formula: any) {           │
│   // 提取症状                                               │
│   const symptoms = formula.formula_symptoms || [];          │
│   const keySymptoms = symptoms                              │
│     .filter(s => s.is_key)                                  │
│     .sort((a, b) => b.weight - a.weight)                    │
│     .map(s => s.symptom);                                   │
│                                                              │
│   return {                                                  │
│     formula: formula.formula_name,                          │
│     source: formula.source,                                  │
│     chapter: formula.chapter,                                │
│     originalText: formula.original_text,                    │
│     keySymptoms,                                            │
│     mechanism: formula.mechanism,                            │
│     treatmentMethod: formula.treatment_method,              │
│     indications: formula.indications || [],                  │
│     contraindications: formula.contraindications || [],    │
│     dosage: formula.dosage,                                  │
│     instructions: formula.instructions                       │
│   };                                                        │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 后端 Controller：返回 JSON 响应                              │
│                                                              │
│ {                                                           │
│   code: 200,                                                │
│   msg: "success",                                           │
│   data: {                                                   │
│     formula: "桂枝汤",                                      │
│     source: "伤寒论",                                       │
│     chapter: "太阳病篇",                                     │
│     originalText: "太阳中风...",                              │
│     keySymptoms: ["恶风", "发热", "汗出", ...],             │
│     mechanism: "营卫不和，卫气不固，营阴外泄",                │
│     treatmentMethod: "调和营卫",                              │
│     indications: [...],                                     │
│     contraindications: [...],                                │
│     dosage: "桂枝9g，芍药9g...",                             │
│     instructions: "水煎服..."                               │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 前端：Network.request() 收到响应                             │
│                                                              │
│ const res = await Network.request({ ... })                 │
│ console.log('[FormulaDetail] 收到响应:', res.data)         │
│                                                              │
│ // 解析数据                                                 │
│ if (res.data.code === 200) {                                │
│   setFormula(res.data.data)  // 更新前端状态                │
│ } else {                                                    │
│   Taro.showToast({ title: res.data.msg, icon: 'none' })    │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 前端：更新 UI 显示                                           │
│                                                              │
│ <View>                                                      │
│   <Text>{formula.formula}</Text>  // 显示：桂枝汤           │
│   <Text>{formula.source}</Text>    // 显示：伤寒论           │
│   <Text>{formula.mechanism}</Text>  // 显示：营卫不和...     │
│   ...                                                       │
│ </View>                                                     │
└─────────────────────────────────────────────────────────────┘
```

## 关键代码分析

### 1. 前端发起请求

```typescript
// src/pages/formula-detail/index.tsx
const res = await Network.request({
  url: `/api/formula-management/formulas/${encodeURIComponent(formulaName)}`,
  method: 'GET'
})
```

**关键点**：
- 使用 `Network.request()` 而不是 `fetch()` 或 `Taro.request()`
- URL 使用相对路径 `/api/...`，Network 会自动拼接域名
- 使用 `encodeURIComponent()` 对方剂名称进行编码

### 2. 后端路由匹配

```typescript
// server/src/formula-management/formula-management.controller.ts
@Get('formulas/:name')
async getFormulaByName(@Param('name') name: string) {
  // name 参数会从 URL 路径中提取
  const formula = await this.formulaService.getFormulaByName(name);
  // ...
}
```

**关键点**：
- `@Get('formulas/:name')` 定义了路由模式
- `@Param('name')` 从 URL 路径中提取参数
- 实际路由是 `/api/formula-management/formulas/:name`

### 3. Service 调用数据库

```typescript
// server/src/formula-management/formula-management.service.ts
async getFormulaByName(formulaName: string): Promise<FormulaEvidence | null> {
  // 🗄️ 调用 Supabase 数据库
  const { data: formula, error } = await this.supabase
    .from('formulas')                    // 从 formulas 表查询
    .select(`
      *,
      formula_symptoms (                  // 关联查询 formula_symptoms 表
        symptom,
        is_key,
        weight
      )
    `)
    .eq('formula_name', formulaName)     // WHERE formula_name = ?
    .eq('is_active', true)               // WHERE is_active = true
    .single();                           // 只返回一条记录

  if (error) {
    if (error.code === 'PGRST116') {
      return null;  // 记录不存在
    }
    throw error;
  }

  return this.convertToFormulaEvidence(formula);
}
```

**关键点**：
- `this.supabase` 是 Supabase 客户端实例
- `.from('formulas')` 指定查询的表
- `.select()` 指定要查询的字段
- `.eq()` 添加 WHERE 条件
- `.single()` 限制返回单条记录
- 关联查询会自动执行 JOIN 操作

### 4. Supabase 生成的 SQL

```sql
SELECT
  formulas.*,
  (
    SELECT JSON_AGG(json_build_object(
      'symptom', formula_symptoms.symptom,
      'is_key', formula_symptoms.is_key,
      'weight', formula_symptoms.weight
    ))
    FROM formula_symptoms
    WHERE formula_symptoms.formula_id = formulas.id
  ) AS formula_symptoms
FROM formulas
WHERE formulas.formula_name = '桂枝汤'
  AND formulas.is_active = true
LIMIT 1;
```

**关键点**：
- Supabase 客户端会自动将查询转换为 SQL
- 关联查询使用子查询和 JSON_AGG
- WHERE 条件自动从 `.eq()` 转换
- `.single()` 转换为 `LIMIT 1`

## 数据库调用时机总结

### ✅ 会调用数据库的场景

| 场景 | 触发方式 | API 端点 | 数据库操作 |
|------|---------|---------|-----------|
| 查看方剂详情 | 点击"查看"按钮 | `GET /api/formula-management/formulas/:name` | SELECT + JOIN |
| 方剂列表加载 | 打开列表页 | `GET /api/formula-management/formulas` | SELECT + 分页 |
| 按六经筛选 | 点击六经筛选 | `GET /api/formula-management/formulas/meridian/:meridian` | SELECT + WHERE |
| 按治法筛选 | 点击治法筛选 | `GET /api/formula-management/formulas/treatment/:method` | SELECT + WHERE |
| 症状匹配 | AI 分析用户症状 | `POST /api/formula-management/formulas/match` | SELECT + 权重计算 |
| 创建方剂 | 管理员添加新方剂 | `POST /api/formula-management/formulas` | INSERT |
| 更新方剂 | 管理员编辑方剂 | `PUT /api/formula-management/formulas/:name` | UPDATE + INSERT(历史版本) |
| 删除方剂 | 管理员删除方剂 | `DELETE /api/formula-management/formulas/:name` | UPDATE(软删除) |
| 统计数据 | 加载统计信息 | `GET /api/formula-management/formulas/statistics` | SELECT + GROUP BY |

### ❌ 不会调用数据库的场景

| 场景 | 说明 |
|------|------|
| 页面初次加载（静态内容） | 如免责声明页、下载页等 |
| 前端表单验证 | 如输入格式检查、必填项验证 |
| 前端路由跳转 | Taro.navigateTo() 不涉及数据库 |
| 前端状态管理 | React useState 不涉及数据库 |

## 性能优化建议

### 1. 查询优化

```typescript
// ❌ 不好的做法：查询所有字段
const { data } = await this.supabase
  .from('formulas')
  .select('*')

// ✅ 好的做法：只查询需要的字段
const { data } = await this.supabase
  .from('formulas')
  .select('formula_name, treatment_method, mechanism')
```

### 2. 分页查询

```typescript
// ✅ 好的做法：使用分页
const { data } = await this.supabase
  .from('formulas')
  .select('*')
  .range(offset, offset + pageSize - 1)
  .order('formula_name', { ascending: true })
```

### 3. 缓存策略

```typescript
// ✅ 好的做法：使用 Redis 缓存热点数据
const cacheKey = `formula:${formulaName}`;
let formula = await this.redis.get(cacheKey);

if (!formula) {
  formula = await this.supabase.from('formulas')...
  await this.redis.set(cacheKey, formula, 'EX', 3600); // 缓存 1 小时
}
```

### 4. 批量查询

```typescript
// ❌ 不好的做法：循环查询
for (const name of formulaNames) {
  const formula = await this.getFormulaByName(name);
}

// ✅ 好的做法：批量查询
const { data } = await this.supabase
  .from('formulas')
  .select('*')
  .in('formula_name', formulaNames);
```
