# 智能化方证检索系统架构设计

## 一、核心目标

实现方证系统的**全流程智能化**，包括：
1. **数据采集智能化**：自动从经典文献、现代研究中提取方剂数据
2. **数据归纳智能化**：自动分类、标准化、关联分析
3. **数据采用智能化**：AI 问询阶段自动理解症状、智能匹配方证、生成建议

## 二、系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    用户症状输入（自然语言）                     │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  自然语言理解层 (NLU)                          │
│  - 症状实体识别 (NER)                                         │
│  - 语义标准化                                                │
│  - 症状向量化 (Embedding)                                     │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  智能检索层 (Intelligence)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 向量数据库 (Vector DB)                                │  │
│  │  - 症状向量索引                                        │  │
│  │  - 方证向量索引                                        │  │
│  │  - 语义相似度检索 (RAG)                                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 知识图谱 (Knowledge Graph)                            │  │
│  │  - 症状关联网络                                        │  │
│  │  - 治法路径推理                                        │  │
│  │  - 体质匹配规则                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 规则引擎 (Rule Engine)                                │  │
│  │  - 六经辨证规则                                        │  │
│  │  - 八纲分类规则                                        │  │
│  │  - 禁忌症检查                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  智能推荐引擎 (Recommendation)                │
│  - 多维度评分计算                                            │
│  - 权重动态调整                                              │
│  - Top-K 排序                                                │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  证据溯源层 (Evidence Trace)                  │
│  - 匹配理由生成                                              │
│  - 经典条文引用                                              │
│  - 治法逻辑展示                                              │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  智能建议生成层 (Generation)                  │
│  - 自然语言解释                                              │
│  - 结构化方案输出                                            │
│  - 个性化调整                                                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心模块

#### 2.2.1 自然语言理解层 (NLU)

**功能**：理解用户的自然语言症状描述

**技术实现**：
- 使用 Qwen 大模型进行症状实体识别
- 症状标准化（同义词映射、术语规范化）
- 症状向量化（使用 Embedding 模型）

**示例**：
```
用户输入: "最近头痛，怕风，出汗，脉浮"
NLU 输出: {
  symptoms: ["头痛", "恶风", "汗出", "脉浮"],
  standardSymptoms: ["头痛", "恶风", "自汗", "脉浮"],
  meridian: "太阳病",
  vectors: [0.123, 0.456, ...]
}
```

#### 2.2.2 智能检索层 (Intelligence)

**2.2.2.1 向量数据库 (Vector DB)**

**功能**：存储症状和方证的语义向量，支持快速语义检索

**数据结构**：
```typescript
interface SymptomVector {
  symptom: string
  vector: number[]  // 1536 维向量
  meridian?: string  // 所属六经
  relatedSymptoms: string[]  // 相关症状
}

interface FormulaVector {
  formula: string
  vector: number[]  // 1536 维向量
  keySymptoms: string[]
  treatmentMethod: string
  meridian: string
}
```

**检索策略**：
1. 计算用户症状向量与方证向量的余弦相似度
2. 返回相似度最高的 Top-K 方证（K=10）
3. 使用 RAG (Retrieval-Augmented Generation) 增强检索

**2.2.2.2 知识图谱 (Knowledge Graph)**

**功能**：构建症状、治法、药物之间的关联网络

**图谱结构**：
```
节点类型:
- 症状 (Symptom)
- 证候 (Syndrome)
- 方剂 (Formula)
- 治法 (TreatmentMethod)
- 六经 (Meridian)
- 体质 (Constitution)

关系类型:
- 症状 -> 属于 -> 六经
- 症状 -> 导致 -> 证候
- 证候 -> 治法 -> 方剂
- 方剂 -> 包含 -> 药物
- 体质 -> 易患 -> 证候
```

**推理能力**：
- 根据症状推导证候（路径：症状 → 六经 → 证候）
- 根据证候推荐治法（路径：证候 → 治法 → 方剂）
- 检查禁忌症（路径：体质 → 禁忌 → 方剂）

**2.2.2.3 规则引擎 (Rule Engine)**

**功能**：基于中医理论的规则推理

**核心规则**：
```typescript
// 六经辨证规则
if (包含("恶风", "汗出", "脉浮", "头痛")) {
  return { meridian: "太阳病", syndrome: "太阳中风证" }
}

if (包含("恶寒", "无汗", "脉浮紧", "头痛")) {
  return { meridian: "太阳病", syndrome: "太阳伤寒证" }
}

// 八纲分类规则
if (包含("发热", "口渴", "脉数", "舌红")) {
  return { eightGang: { yinYang: "阳", coldHot: "热" } }
}

// 禁忌症检查
if (用户.体质 === "阳虚" && 方剂.治法 === "清热") {
  return { warning: "阳虚体质慎用清热方剂" }
}
```

#### 2.2.3 智能推荐引擎 (Recommendation)

**功能**：多维度评分，智能排序

**评分维度**：
```typescript
interface FormulaScore {
  formula: string
  similarityScore: number      // 语义相似度 (0-1)
  symptomMatchScore: number    // 症状匹配度 (0-1)
  meridianMatchScore: number   // 六经匹配度 (0-1)
  treatmentMatchScore: number  // 治法匹配度 (0-1)
  constitutionScore: number    // 体质匹配度 (0-1)
  evidenceScore: number        // 证据强度 (0-1)
  totalScore: number           // 综合评分 (0-1)
  matchReasons: string[]       // 匹配理由
  evidenceSources: string[]    // 证据来源
}
```

**综合评分公式**：
```
totalScore =
  0.30 * similarityScore +      // 语义相似度权重 30%
  0.25 * symptomMatchScore +    // 症状匹配度权重 25%
  0.20 * meridianMatchScore +   // 六经匹配度权重 20%
  0.15 * treatmentMatchScore +  // 治法匹配度权重 15%
  0.10 * constitutionScore      // 体质匹配度权重 10%
```

**动态权重调整**：
- 症状严重度高时，提高 `symptomMatchScore` 权重
- 体质明确时，提高 `constitutionScore` 权重
- 急性病症时，提高 `meridianMatchScore` 权重

#### 2.2.4 证据溯源层 (Evidence Trace)

**功能**：生成匹配理由，提供证据支持

**匹配理由生成**：
```typescript
interface MatchReason {
  type: "主症匹配" | "病机吻合" | "治法对应" | "体质适配"
  content: string
  evidence: string  // 证据来源
  confidence: number  // 置信度 (0-1)
}

// 示例
const matchReasons: MatchReason[] = [
  {
    type: "主症匹配",
    content: "用户症状'头痛、恶风、汗出'与桂枝汤主症'头痛、发热、汗出、恶风'完全匹配",
    evidence: "《伤寒论》第13条：'太阳病，头痛，发热，汗出，恶风，桂枝汤主之。'",
    confidence: 0.95
  },
  {
    type: "病机吻合",
    content: "病机为'营卫不和'，桂枝汤具有调和营卫之功",
    evidence: "桂枝汤方义：'桂枝辛温，解肌发表，为君药；芍药苦酸，益阴敛营，为臣药'",
    confidence: 0.90
  },
  {
    type: "治法对应",
    content: "治法'调和营卫'与桂枝汤主治吻合",
    evidence: "桂枝汤主治：太阳中风，营卫不和",
    confidence: 0.92
  }
]
```

#### 2.2.5 智能建议生成层 (Generation)

**功能**：生成自然语言建议和结构化方案

**双通道输出**：
```typescript
interface SmartRecommendation {
  // 用户通道：自然语言解释
  userChannel: {
    summary: string  // 简要说明
    reasons: string[]  // 匹配理由（自然语言）
    advice: string[]  // 使用建议
    warnings: string[]  // 注意事项
  }

  // 系统通道：结构化数据
  systemChannel: {
    formula: string  // 方剂名称
    meridian: string  // 六经分类
    syndrome: string  // 证候诊断
    treatmentMethod: string  // 治法
    ingredients: Ingredient[]  // 组成药物
    dosage: string  // 剂量
    instructions: string  // 煎服法
    evidenceSources: string[]  // 证据来源
    confidence: number  // 推荐置信度
  }
}
```

## 三、数据流程

### 3.1 用户症状 → 方证推荐流程

```
Step 1: 自然语言理解
输入: "最近头痛，怕风，出汗，脉浮"
↓
NLU 处理
↓
输出: {
  symptoms: ["头痛", "恶风", "汗出", "脉浮"],
  meridian: "太阳病",
  vectors: [0.123, 0.456, ...]
}

Step 2: 智能检索
↓
向量相似度检索 (Top-10)
↓
知识图谱推理 (六经→证候→方剂)
↓
规则引擎过滤 (禁忌症检查)
↓
候选方证: [桂枝汤, 麻黄汤, 葛根汤, ...]

Step 3: 智能推荐
↓
多维度评分
↓
综合排序
↓
Top-3 推荐:
1. 桂枝汤 (总分: 0.92)
2. 葛根汤 (总分: 0.78)
3. 桂枝加葛根汤 (总分: 0.71)

Step 4: 证据溯源
↓
生成匹配理由
↓
提取证据来源
↓
输出: {
  matchReasons: [...],
  evidenceSources: [...]
}

Step 5: 建议生成
↓
自然语言解释
↓
结构化方案
↓
输出: {
  userChannel: {...},
  systemChannel: {...}
}
```

## 四、技术实现方案

### 4.1 向量数据库集成

**方案**：使用 Embedding 技能 + Supabase pgvector

```typescript
// 步骤 1：生成症状向量
import { Embedding } from '@/skills/embedding'

const symptomVector = await Embedding.embed({
  text: "头痛，恶风，汗出，脉浮",
  model: "text-embedding-3-small"
})

// 步骤 2：存储到 pgvector
await supabase.from('symptom_vectors').insert({
  symptom: "头痛，恶风，汗出，脉浮",
  vector: symptomVector,
  meridian: "太阳病"
})

// 步骤 3：相似度检索
const { data } = await supabase.rpc('match_symptoms', {
  query_vector: symptomVector,
  match_threshold: 0.8,
  match_count: 10
})
```

### 4.2 知识图谱构建

**方案**：使用 Neo4j 或 Supabase 构建图数据库

```typescript
// 节点定义
interface Node {
  id: string
  label: string  // "Symptom", "Formula", "TreatmentMethod", etc.
  properties: Record<string, any>
}

// 关系定义
interface Relationship {
  from: string
  to: string
  type: string  // "BELONGS_TO", "LEADS_TO", "TREATED_BY", etc.
  properties: Record<string, any>
}

// 查询示例：根据症状推导方剂
const result = await graphQuery(`
  MATCH (s:Symptom {name: '头痛'})-[:BELONGS_TO]->(m:Meridian)
  MATCH (m)-[:HAS_SYNDROME]->(syn:Syndrome)
  MATCH (syn)-[:TREATED_BY]->(f:Formula)
  RETURN f.name AS formula, f.treatmentMethod AS method
`)
```

### 4.3 规则引擎实现

**方案**：使用 Drools 或自定义规则引擎

```typescript
// 规则定义
const rules: Rule[] = [
  {
    id: "rule_sun_wind",
    name: "太阳中风证",
    conditions: [
      { type: "symptom", value: "恶风" },
      { type: "symptom", value: "汗出" },
      { type: "symptom", value: "脉浮" },
      { type: "symptom", value: "头痛" }
    ],
    actions: [
      { type: "assign_meridian", value: "太阳病" },
      { type: "assign_syndrome", value: "太阳中风证" },
      { type: "recommend_formula", value: "桂枝汤" }
    ]
  }
]

// 规则推理
function applyRules(symptoms: string[]): RuleResult {
  const matchedRules = rules.filter(rule =>
    rule.conditions.every(cond =>
      symptoms.includes(cond.value)
    )
  )

  return {
    matchedRules: matchedRules.map(r => r.name),
    meridian: matchedRules[0]?.actions.find(a => a.type === "assign_meridian")?.value,
    syndrome: matchedRules[0]?.actions.find(a => a.type === "assign_syndrome")?.value,
    recommendedFormula: matchedRules[0]?.actions.find(a => a.type === "recommend_formula")?.value
  }
}
```

## 五、性能优化

### 5.1 缓存策略
- 症状向量缓存：避免重复计算
- 方证向量缓存：提升检索速度
- 搜索结果缓存：相同症状复用结果

### 5.2 检索优化
- 使用 pgvector 的 HNSW 索引加速向量检索
- 限制候选集大小（Top-10 → Top-5）
- 并行执行多种检索策略

### 5.3 响应时间目标
- 自然语言理解：≤ 500ms
- 智能检索：≤ 1000ms
- 推荐排序：≤ 500ms
- 总响应时间：≤ 2s

## 六、扩展性设计

### 6.1 自学习能力
- 用户反馈收集：推荐是否有效
- 权重自动调整：基于反馈优化评分公式
- 知识图谱更新：添加新的症状关联

### 6.2 多模型集成
- 主模型：Qwen-7B/14B（通用问答）
- 专用模型：LoRA 微调（经方推理）
- 辅助模型：Embedding 模型（向量检索）

### 6.3 数据源扩展
- 经典原文：伤寒论、金匮要略、温病条辨
- 现代研究：知网、PubMed 方剂研究
- 名医经验：名医医案、临床研究

## 七、安全与合规

### 7.1 安全护栏
- 输入过滤：识别敏感词、医疗用语
- 输出审查：检查建议是否合理
- 知识锚定：强制使用数据库数据

### 7.2 免责声明
- 明确提示：AI 建议仅供参考
- 建议就医：严重症状建议线下就医
- 证据标注：标注推荐依据

## 八、实施计划

### Phase 1: 基础设施搭建
- [x] Supabase 数据库设计
- [x] 方证基础数据迁移 (144 条)
- [ ] 向量数据库集成 (pgvector)
- [ ] 症状向量化处理

### Phase 2: 智能检索开发
- [ ] 语义相似度检索
- [ ] 知识图谱构建
- [ ] 规则引擎实现

### Phase 3: 推荐引擎开发
- [ ] 多维度评分算法
- [ ] 智能排序引擎
- [ ] 动态权重调整

### Phase 4: 证据溯源开发
- [ ] 匹配理由生成
- [ ] 证据来源提取
- [ ] 置信度计算

### Phase 5: 集成与测试
- [ ] 集成到 AI 问询流程
- [ ] 端到端测试
- [ ] 性能优化

### Phase 6: 上线与迭代
- [ ] 灰度发布
- [ ] 用户反馈收集
- [ ] 持续优化

---

**设计理念**：以中医理论为根基，以 AI 技术为手段，实现方证系统的全流程智能化，为用户提供精准、可解释的个性化建议。
