# AI 智能问询系统重构方案

## 问题分析

当前 AI 问询存在的问题：
1. **模板化严重**：千篇一律地问舌苔、脉象、饮食、睡眠等固定问题
2. **缺乏针对性**：没有针对用户的具体病情进行个性化问询
3. **不符合中医逻辑**：中医问询的核心是"辨证论治"，通过问询排除不可能的病症，确认最可能的病症
4. **体现不出 AI 特色**：像机器人一样，不够智能

## 新的 AI 问询流程设计

### 核心理念

中医问询的本质是：**通过有针对性的问询，排除不可能的病症，确认最可能的病症，达到精准辨证和治疗**

### 问询流程

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户输入                                  │
│   基本信息（姓名、年龄、性别） + 主诉 + 补充信息                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    第一步：初步诊断分析                           │
│  1. 根据主诉，列出可能的病症（3-5种）                           │
│  2. 分析每个病症的特征和鉴别要点                                 │
│  3. 为每个病症设定可能性评分（0-100）                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    第二步：生成问询策略                           │
│  1. 针对每个可能的病症，设计关键鉴别问题                         │
│  2. 优先问询能最大程度排除或确认病症的问题                       │
│  3. 每个问题都明确其诊断价值（排除哪些病症、确认哪些病症）        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    第三步：个性化问询（动态调整）                  │
│  第1轮：提出最关键的问题                                         │
│    ↓ 用户回答                                                   │
│    ↓ 更新各病症的可能性评分                                       │
│    ↓ 排除不可能的病症                                           │
│    ↓ 提高最可能病症的置信度                                     │
│  第2-N轮：根据当前状态，继续问询...                             │
│    ↓ 直到满足以下条件之一：                                      │
│      • 某个病症的置信度 >80%                                     │
│      • 已经问了 5 个问题                                          │
│      • 用户明确表示无法提供更多信息                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    第四步：最终辨证确认                           │
│  1. 总结已收集的信息                                             │
│  2. 确定最终的辨证分型                                           │
│  3. 给出治疗方案建议                                             │
└─────────────────────────────────────────────────────────────────┘
```

## 核心功能模块

### 1. 初步诊断分析器（InitialDiagnosisAnalyzer）

**职责**：根据用户输入，分析可能的病症

**输入**：
- 基本信息（姓名、年龄、性别）
- 主诉（主要症状）
- 补充信息（现病史、既往史等）

**输出**：
```typescript
interface PossibleDisease {
  name: string;              // 病症名称
  probability: number;      // 可能性评分（0-100）
  keyFeatures: string[];    // 关键特征
  differentialQuestions: string[];  // 鉴别问题
}

interface InitialDiagnosisResult {
  possibleDiseases: PossibleDisease[];  // 可能的病症列表
  nextInquiry: {                           // 下一步问询建议
    question: string;                      // 问题
    targetDiseases: string[];             // 目标病症（用于排除/确认）
    diagnosticValue: string;              // 诊断价值说明
  };
}
```

**示例**：
```typescript
// 用户输入：头痛3天，主要在太阳穴附近
输出：
{
  possibleDiseases: [
    {
      name: "少阳头痛",
      probability: 40,
      keyFeatures: ["太阳穴疼痛", "口苦", "寒热往来"],
      differentialQuestions: ["有没有口苦?", "有没有寒热往来?"]
    },
    {
      name: "风热头痛",
      probability: 30,
      keyFeatures: ["头痛而胀", "发热", "面红目赤"],
      differentialQuestions: ["有没有发热?", "面红目赤吗?"]
    },
    {
      name: "气血亏虚头痛",
      probability: 20,
      keyFeatures: ["头痛隐隐", "神疲乏力", "面色无华"],
      differentialQuestions: ["神疲乏力吗?", "面色如何?"]
    },
    {
      name: "肝阳上亢头痛",
      probability: 10,
      keyFeatures: ["头痛眩晕", "急躁易怒", "舌红苔黄"],
      differentialQuestions: ["有没有眩晕?", "容易发怒吗?", "舌头颜色如何?"]
    }
  ],
  nextInquiry: {
    question: "请问您有没有口苦的感觉？或者有没有忽冷忽热的情况？",
    targetDiseases: ["少阳头痛", "风热头痛"],
    diagnosticValue: "如果有口苦或寒热往来，支持少阳头痛；如果发热，支持风热头痛"
  }
}
```

### 2. 个性化问询策略生成器（InquiryStrategyGenerator）

**职责**：根据当前的病症可能性，生成最有效的问询问题

**输入**：
- 当前可能的病症列表（带可能性评分）
- 已问过的问题列表
- 用户已回答的信息

**输出**：
```typescript
interface InquiryQuestion {
  question: string;              // 问题
  targetDiseases: {             // 目标病症
    disease: string;
    action: 'confirm' | 'eliminate';  // 确认或排除
  }[];
  diagnosticValue: string;      // 诊断价值说明
  priority: number;             // 优先级（0-100）
}
```

**问询优先级规则**：
1. **高价值问题**：能排除多个病症或显著提高置信度的问题
2. **未问过的问题**：避免重复问询
3. **用户容易回答的问题**：降低用户负担

### 3. 病症排除与确认引擎（DiseaseEliminationEngine）

**职责**：根据用户的回答，更新各病症的可能性评分

**输入**：
- 当前可能的病症列表
- 用户回答的问题和答案

**输出**：
```typescript
interface DiseaseUpdate {
  disease: string;
  oldProbability: number;
  newProbability: number;
  reason: string;              // 更新原因
}

interface DiagnosisUpdateResult {
  updatedDiseases: DiseaseUpdate[];
  eliminatedDiseases: string[];  // 被排除的病症（可能性 <10%）
  confirmedDisease?: string;    // 确认的病症（可能性 >80%）
}
```

**更新规则**：
- 支持（正面回答）：提高对应病症的可能性（+20~30）
- 反对（负面回答）：降低对应病症的可能性（-30~40）
- 无关：不影响可能性

### 4. 智能问询调度器（InquiryScheduler）

**职责**：协调整个问询流程

**流程**：
```
while (未满足结束条件) {
  1. 生成下一个问询问题
  2. 向用户提问
  3. 获取用户回答
  4. 更新病症可能性
  5. 检查是否需要继续问询
}
```

**结束条件**：
1. 某个病症的置信度 >80%
2. 已经问了 5 个问题
3. 用户明确表示无法提供更多信息
4. 只剩下一个可能的病症

## 技术实现

### 数据结构

```typescript
// 问询会话
interface InquirySession {
  id: string;
  userId: string;
  patientInfo: {
    name: string;
    age: number;
    gender: string;
  };
  chiefComplaint: string;
  additionalInfo: string;
  possibleDiseases: PossibleDisease[];
  inquiryHistory: {
    round: number;
    question: string;
    answer: string;
    diagnosisUpdate: DiagnosisUpdateResult;
  }[];
  status: 'initial' | 'in_progress' | 'completed';
  finalDiagnosis?: string;
}
```

### API 设计

#### 1. 初始化问询会话

```http
POST /api/medical-ai/inquiry/start
Content-Type: application/json

{
  "userId": "xxx",
  "patientName": "张三",
  "age": 35,
  "gender": "男",
  "chiefComplaint": "头痛3天",
  "additionalInfo": "主要在太阳穴附近，因为最近加班太累了"
}

Response:
{
  "code": 200,
  "data": {
    "sessionId": "inquiry_123",
    "initialDiagnosis": {
      "possibleDiseases": [...],
      "nextInquiry": {
        "question": "请问您有没有口苦的感觉？或者有没有忽冷忽热的情况？",
        "targetDiseases": ["少阳头痛", "风热头痛"],
        "diagnosticValue": "如果有口苦或寒热往来，支持少阳头痛；如果发热，支持风热头痛"
      }
    },
    "firstQuestion": "请问您有没有口苦的感觉？或者有没有忽冷忽热的情况？"
  }
}
```

#### 2. 继续问询

```http
POST /api/medical-ai/inquiry/continue
Content-Type: application/json

{
  "sessionId": "inquiry_123",
  "answer": "有口苦，也有忽冷忽热的情况"
}

Response:
{
  "code": 200,
  "data": {
    "nextQuestion": "请问您除了头痛、口苦、寒热往来之外，还有没有其他不适？比如食欲不振、恶心呕吐等？",
    "diagnosisUpdate": {
      "updatedDiseases": [
        {
          "disease": "少阳头痛",
          "oldProbability": 40,
          "newProbability": 70,
          "reason": "口苦、寒热往来支持少阳头痛"
        }
      ],
      "eliminatedDiseases": ["气血亏虚头痛"],
      "confirmedDisease": null
    },
    "currentPossibilities": [
      { "disease": "少阳头痛", "probability": 70 },
      { "disease": "风热头痛", "probability": 20 },
      { "disease": "肝阳上亢头痛", "probability": 10 }
    ],
    "shouldContinue": true
  }
}
```

#### 3. 获取问询状态

```http
GET /api/medical-ai/inquiry/:sessionId/status

Response:
{
  "code": 200,
  "data": {
    "sessionId": "inquiry_123",
    "status": "in_progress",
    "currentRound": 2,
    "possibleDiseases": [...],
    "inquiryHistory": [...]
  }
}
```

#### 4. 完成问询

```http
POST /api/medical-ai/inquiry/complete
Content-Type: application/json

{
  "sessionId": "inquiry_123"
}

Response:
{
  "code": 200,
  "data": {
    "sessionId": "inquiry_123",
    "finalDiagnosis": {
      "syndrome": "少阳头痛",
      "probability": 85,
      "reasoning": "患者头痛在太阳穴，伴有口苦、寒热往来，符合少阳头痛的特征，排除气血亏虚和风热头痛",
      "recommendation": "建议使用小柴胡汤加减治疗"
    },
    "prescriptionRecommendation": {
      "formula": "小柴胡汤",
      "herbs": ["柴胡", "黄芩", "半夏", "生姜", "大枣", "人参", "甘草"],
      "dosage": "...",
      "instructions": "..."
    }
  }
}
```

## 系统提示词设计

### 初步诊断提示词

```
你是一位经验丰富的中医专家。根据用户提供的主诉和基本信息，进行初步诊断分析。

你的任务是：
1. 列出3-5个可能的病症（证型）
2. 为每个病症设定可能性评分（0-100）
3. 分析每个病症的关键特征
4. 设计针对这些病症的鉴别问题

输出格式为JSON：
{
  "possibleDiseases": [
    {
      "name": "病症名称",
      "probability": 可能性评分,
      "keyFeatures": ["关键特征1", "关键特征2"],
      "differentialQuestions": ["鉴别问题1", "鉴别问题2"]
    }
  ],
  "nextInquiry": {
    "question": "最关键的鉴别问题",
    "targetDiseases": ["目标病症1", "目标病症2"],
    "diagnosticValue": "诊断价值说明"
  }
}
```

### 问询策略生成提示词

```
你是一位经验丰富的中医专家。根据当前的诊断情况，生成最有效的问询问题。

当前可能的病症及其可能性：
{{possibleDiseases}}

已问过的问题：
{{askedQuestions}}

用户已回答的信息：
{{userAnswers}}

请生成一个能够最大程度排除或确认病症的问题。要求：
1. 问题要简洁明确，用户容易理解
2. 问题要有明确的诊断价值（能够排除或确认某些病症）
3. 避免重复问询

输出格式为JSON：
{
  "question": "问询问题",
  "targetDiseases": [
    {
      "disease": "病症名称",
      "action": "confirm | eliminate"
    }
  ],
  "diagnosticValue": "诊断价值说明",
  "priority": 优先级（0-100）
}
```

## 实现步骤

### Phase 1: 基础架构（1-2天）
- [ ] 创建新的问询服务模块
- [ ] 设计数据结构和接口
- [ ] 实现问询会话管理

### Phase 2: 核心功能（2-3天）
- [ ] 实现初步诊断分析器
- [ ] 实现个性化问询策略生成器
- [ ] 实现病症排除与确认引擎
- [ ] 实现智能问询调度器

### Phase 3: 前端集成（1-2天）
- [ ] 修改前端 AI 问询页面
- [ ] 实现新的问询流程
- [ ] 添加诊断进度可视化

### Phase 4: 测试与优化（1-2天）
- [ ] 单元测试
- [ ] 集成测试
- [ ] 用户体验优化

## 预期效果

1. **个性化问询**：每个用户都会得到针对性的问询，不再是千篇一律的模板化问题
2. **高效诊断**：通过排除法和确认法，快速锁定最可能的病症
3. **符合中医逻辑**：体现中医辨证论治的精髓
4. **AI 特色明显**：展现 AI 的智能分析能力

## 示例对话

**用户**：我头痛3天了，主要在太阳穴附近

**AI（初步诊断）**：
- 可能性分析：
  - 少阳头痛（40%）：太阳穴疼痛、口苦、寒热往来
  - 风热头痛（30%）：头痛而胀、发热、面红目赤
  - 气血亏虚头痛（20%）：头痛隐隐、神疲乏力
  - 肝阳上亢头痛（10%）：头痛眩晕、急躁易怒
- 下一步问询：请问您有没有口苦的感觉？或者有没有忽冷忽热的情况？

**用户**：有口苦，也有忽冷忽热的情况

**AI（病症更新）**：
- 少阳头痛：40% → 70%（支持：口苦、寒热往来）
- 气血亏虚头痛：20% → 5%（排除：无明显乏力症状）
- 风热头痛：30% → 15%（排除：无发热）
- 肝阳上亢头痛：10% → 10%（无明显证据）
- 下一步问询：请问您除了头痛、口苦、寒热往来之外，还有没有其他不适？比如食欲不振、恶心呕吐等？

**用户**：有点食欲不振，但不太明显

**AI（病症更新）**：
- 少阳头痛：70% → 85%（支持：食欲不振符合少阳病特征）
- 其他病症可能性都 <10%
- 确诊：少阳头痛（置信度85%）
- 建议：可以使用小柴胡汤加减治疗

## 总结

新的 AI 问询系统将：
1. **体现中医特色**：通过辨证论治的逻辑，实现精准问询
2. **展现 AI 能力**：智能分析可能的病症，动态调整问询策略
3. **提升用户体验**：个性化问询，提高问询效率
4. **实现精准治疗**：最终达到精准辨证和治疗的效果
