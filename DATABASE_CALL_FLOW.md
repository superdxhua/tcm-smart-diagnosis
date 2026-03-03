# 数据库调用流程图

## 完整调用流程示例：查看桂枝汤详情

```
┌──────────────────────────────────────────────────────────────┐
│                       用户操作层                               │
└──────────────────────────────────────────────────────────────┘

用户在方剂管理页面点击"查看"按钮（桂枝汤）
                        ↓
        Taro.navigateTo({ url: '/pages/formula-detail/index?name=桂枝汤' })

┌──────────────────────────────────────────────────────────────┐
│                      前端应用层                               │
└──────────────────────────────────────────────────────────────┘

formula-detail/index.tsx
├── useEffect(() => loadFormulaDetail(), [])
├── loadFormulaDetail() 函数执行
│   ├── Network.request({
│   │   url: '/api/formula-management/formulas/桂枝汤',
│   │   method: 'GET'
│   │ })
│   └── 等待响应...
└── 显示加载中状态...

┌──────────────────────────────────────────────────────────────┐
│                       网络层                                  │
└──────────────────────────────────────────────────────────────┘

HTTP 请求：
GET http://localhost:3000/api/formula-management/formulas/桂枝汤
Headers:
  - Authorization: Bearer eyJhbGc... (如果有)
  - Content-Type: application/json

┌──────────────────────────────────────────────────────────────┐
│                     后端路由层                                │
└──────────────────────────────────────────────────────────────┘

路由匹配：
├── /api/formula-management/formulas/:name
└── @Param('name') 提取参数：name = "桂枝汤"

Controller 层：
├── FormulaManagementController.getFormulaByName("桂枝汤")
├── 调用 this.formulaService.getFormulaByName("桂枝汤")
└── 等待 Service 返回...

┌──────────────────────────────────────────────────────────────┐
│                    后端业务层                                 │
└──────────────────────────────────────────────────────────────┘

Service 层：
├── FormulaManagementService.getFormulaByName("桂枝汤")
├── 构建数据库查询：
│   this.supabase
│     .from('formulas')
│     .select('*, formula_symptoms(*)')
│     .eq('formula_name', '桂枝汤')
│     .eq('is_active', true)
│     .single()
└── 调用 Supabase 客户端...

┌──────────────────────────────────────────────────────────────┐
│                   Supabase 客户端层                            │
└──────────────────────────────────────────────────────────────┘

Supabase Client：
├── 接收查询参数
├── 生成 SQL 语句
│   SELECT
│     formulas.*,
│     formula_symptoms.* as formula_symptoms
│   FROM formulas
│   LEFT JOIN formula_symptoms
│     ON formulas.id = formula_symptoms.formula_id
│   WHERE formulas.formula_name = '桂枝汤'
│     AND formulas.is_active = true
│   LIMIT 1
├── 发送 SQL 到 PostgreSQL
└── 等待数据库响应...

┌──────────────────────────────────────────────────────────────┐
│                    PostgreSQL 数据库层                         │
└──────────────────────────────────────────────────────────────┘

数据库执行：
├── 接收 SQL 查询
├── 查询执行计划优化
├── 索引查找：
│   ├── 使用 idx_formulas_name 索引查找 formula_name = '桂枝汤'
│   ├── 扫描 formulas 表，返回匹配行
│   ├── 关联查询 formula_symptoms 表
│   └── 组装 JSON 结果
├── 返回查询结果：
│   {
│     id: "uuid-xxx-xxx",
│     formula_name: "桂枝汤",
│     source: "伤寒论",
│     chapter: "太阳病篇",
│     original_text: "太阳中风...",
│     mechanism: "营卫不和...",
│     treatment_method: "调和营卫",
│     indications: ["太阳中风表虚证"],
│     contraindications: ["表实证无汗"],
│     dosage: "桂枝9g...",
│     instructions: "水煎服...",
│     meridian_category: "太阳",
│     formula_symptoms: [
│       { symptom: "恶风", is_key: true, weight: 5 },
│       { symptom: "发热", is_key: true, weight: 4 },
│       { symptom: "汗出", is_key: true, weight: 3 },
│       { symptom: "头痛", is_key: true, weight: 2 },
│       { symptom: "脉浮缓", is_key: true, weight: 1 }
│     ]
│   }
└── 发送结果到 Supabase 客户端

┌──────────────────────────────────────────────────────────────┐
│                   Supabase 客户端层（返回）                     │
└──────────────────────────────────────────────────────────────┘

Supabase Client：
├── 接收数据库响应
├── 转换为 JavaScript 对象
├── 处理错误情况
└── 返回给 Service 层

┌──────────────────────────────────────────────────────────────┐
│                    后端业务层（返回）                          │
└──────────────────────────────────────────────────────────────┘

Service 层：
├── 接收原始数据
├── 数据格式转换：
│   convertToFormulaEvidence({
│     formula_name -> formula
│     treatment_method -> treatmentMethod
│     original_text -> originalText
│     ...
│   })
├── 返回 FormulaEvidence 对象
└── 发送给 Controller

┌──────────────────────────────────────────────────────────────┐
│                    后端路由层（返回）                          │
└──────────────────────────────────────────────────────────────┘

Controller 层：
├── 接收 FormulaEvidence 对象
├── 包装为统一响应格式：
│   {
│     code: 200,
│     msg: "success",
│     data: FormulaEvidence
│   }
├── 设置 HTTP 状态码：200
└── 发送 JSON 响应

HTTP 响应：
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "code": 200,
  "msg": "success",
  "data": {
    "formula": "桂枝汤",
    "source": "伤寒论",
    "chapter": "太阳病篇",
    "originalText": "太阳中风...",
    "keySymptoms": ["恶风", "发热", "汗出", "头痛", "脉浮缓"],
    "mechanism": "营卫不和，卫气不固，营阴外泄",
    "treatmentMethod": "调和营卫",
    "indications": ["太阳中风表虚证", "营卫不和", "自汗出"],
    "contraindications": ["表实证无汗", "里热证", "温病初起"],
    "dosage": "桂枝9g，芍药9g，炙甘草6g，生姜9g，大枣12枚",
    "instructions": "水煎服，服后啜热稀粥，覆衣被取微似汗，不可令大汗淋漓。"
  }
}

┌──────────────────────────────────────────────────────────────┐
│                       网络层（返回）                            │
└──────────────────────────────────────────────────────────────┘

Network.request()：
├── 接收 HTTP 响应
├── 解析 JSON 数据
├── 返回给调用者：
│   res = {
│     data: {
│       code: 200,
│       msg: "success",
│       data: FormulaEvidence
│     },
│     statusCode: 200,
│     header: {...}
│   }
└── 触发 .then() 回调

┌──────────────────────────────────────────────────────────────┐
│                      前端应用层（返回）                         │
└──────────────────────────────────────────────────────────────┘

formula-detail/index.tsx：
├── loadFormulaDetail() 收到响应
├── 检查响应状态：
│   if (res.data.code === 200) {
│     setFormula(res.data.data)  // 更新 React 状态
│   }
├── 触发 React 重新渲染
└── 显示方剂详情 UI

渲染 UI：
├── 显示方剂名称：桂枝汤
├── 显示来源：伤寒论
├── 显示章节：太阳病篇
├── 显示原文：太阳中风...
├── 显示病机：营卫不和...
├── 显示治法：调和营卫
├── 显示主症：恶风、发热、汗出、头痛、脉浮缓
├── 显示适应症：太阳中风表虚证...
├── 显示禁忌症：表实证无汗...
├── 显示剂量：桂枝9g...
└── 显示煎服法：水煎服...

┌──────────────────────────────────────────────────────────────┐
│                       用户操作层（完成）                        │
└──────────────────────────────────────────────────────────────┘

用户在页面上看到完整的桂枝汤信息 ✅

```

## 关键要点总结

### 1. 调用时机
- **用户操作触发**：点击按钮、输入搜索词、切换筛选条件
- **页面加载触发**：useEffect 钩子监听依赖项变化
- **AI 分析触发**：AI 问诊需要查询方剂数据

### 2. 调用方式
- **前端**：Network.request() 发起 HTTP 请求
- **后端 Controller**：接收路由参数，调用 Service
- **后端 Service**：构建数据库查询，调用 Supabase
- **Supabase 客户端**：生成 SQL，发送到 PostgreSQL
- **PostgreSQL**：执行 SQL，返回数据

### 3. 数据流转
```
用户操作 → HTTP 请求 → Controller → Service → Supabase → PostgreSQL
                    ↓
前端显示 ← HTTP 响应 ← Service ← Supabase ← PostgreSQL
```

### 4. 性能优化点
- ✅ 使用索引（idx_formulas_name）加速查询
- ✅ 分页查询避免一次性加载过多数据
- ✅ 只查询需要的字段减少数据传输
- ✅ 关联查询避免 N+1 问题

### 5. 错误处理
- ✅ 前端 try-catch 捕获网络错误
- ✅ 后端 Controller 捕获异常并返回统一错误格式
- ✅ Service 层处理数据库错误（如 PGRST116 表示记录不存在）
- ✅ 前端 Toast 提示用户友好的错误信息
