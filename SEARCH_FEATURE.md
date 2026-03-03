# 联网搜索功能说明

## 功能概述

新增了联网搜索功能，支持使用千问大模型进行智能总结。

## 技术实现

### 后端接口

**接口路径**: `POST /api/medical-ai/search`

**请求参数**:
```typescript
{
  query: string;           // 搜索关键词（必填）
  count?: number;          // 搜索结果数量，默认 10
  searchType?: 'web' | 'web_summary' | 'image';  // 搜索类型
  summary?: boolean;       // 是否需要 AI 总结，默认 true
}
```

**响应格式**:
```typescript
{
  code: number;
  msg: string;
  data: {
    query: string;         // 搜索关键词
    searchResults: Array<{
      title: string;       // 标题
      url: string;         // 链接
      snippet: string;     // 摘要
      siteName: string;    // 网站名称
      content?: string;    // 内容
      publishTime?: string;// 发布时间
    }>;
    aiSummary?: string;    // AI 智能总结（使用千问大模型）
    sourceCount: number;   // 结果数量
  };
}
```

### 使用的技术栈

1. **SearchClient**: coze-coding-dev-sdk 提供的联网搜索客户端
2. **LLMClient**: 千问大模型，用于智能总结
   - 模型: qwen-plus
   - temperature: 0.3（降低随机性，提高准确性）

## 使用示例

### curl 测试（需要认证 token）

```bash
# 1. 先登录获取 token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'

# 2. 使用搜索接口（替换 YOUR_TOKEN 为实际的 token）
curl -X POST http://localhost:3000/api/medical-ai/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "高血压中医治疗",
    "count": 5,
    "summary": true
  }'
```

### JavaScript 调用示例

```javascript
// 使用 Network 工具调用（前端）
const result = await Network.request({
  url: '/api/medical-ai/search',
  method: 'POST',
  data: {
    query: '高血压中医治疗',
    count: 5,
    summary: true
  }
});

console.log('搜索结果:', result.data.searchResults);
console.log('AI 总结:', result.data.aiSummary);
```

## 功能特点

1. **联网搜索**: 实时获取互联网上的最新信息
2. **智能总结**: 使用千问大模型对搜索结果进行专业分析
3. **中医专业**: AI 总结结合中医理论，提供专业的分析和建议
4. **灵活配置**: 可自定义搜索数量、搜索类型、是否需要总结

## 千问大模型优先级

- 联网搜索的智能总结功能**默认使用千问大模型（qwen-plus）**
- 代码中明确指定了 `model: 'qwen-plus'`
- temperature 设置为 0.3，确保总结的准确性和稳定性

## 注意事项

1. 接口需要登录认证（JWT Token）
2. 搜索结果数量建议 5-10 条，避免过多导致总结超时
3. AI 总结会基于搜索结果生成专业分析，适合中医诊疗场景
4. 搜索关键词尽量具体，以获得更精准的结果

## 应用场景

1. **查询最新中医研究**: 了解某个疾病的最新中医治疗方法
2. **获取临床经验**: 查找名医的临床案例和经验分享
3. **学习中医知识**: 探索某个中医理论或方剂的详细解释
4. **了解药物信息**: 查询中药的功效、禁忌、配伍等
