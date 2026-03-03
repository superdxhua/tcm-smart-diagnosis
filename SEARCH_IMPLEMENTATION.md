# 联网搜索功能实现总结

## 需求
用户要求联网搜索查找的时候默认优先接入千问大模型。

## 实现内容

### 1. 后端实现

#### 修改文件：`server/src/medical-ai/medical-ai.service.ts`
- **导入 SearchClient**：添加联网搜索功能
- **初始化 SearchClient**：在构造函数中创建搜索客户端
- **新增 searchTCMInfo 方法**：
  - 使用 SearchClient 进行联网搜索
  - 使用千问大模型（qwen-plus）进行智能总结
  - 支持自定义搜索数量、搜索类型、是否需要总结
  - temperature 设置为 0.3，确保总结的准确性和稳定性

#### 修改文件：`server/src/medical-ai/medical-ai.controller.ts`
- **新增 search 接口**：暴露联网搜索功能给前端调用

### 2. 前端实现

#### 新增文件：`src/pages/search/index.tsx`
- 创建联网搜索页面
- 支持输入搜索关键词
- 显示搜索结果和千问智能总结
- 支持点击打开搜索结果链接

#### 新增文件：`src/pages/search/index.config.ts`
- 配置页面标题为"联网搜索"

#### 修改文件：`src/app.config.ts`
- 注册搜索页面路由

#### 修改文件：`src/pages/index/index.tsx`
- 在首页功能导航菜单中添加"联网搜索"按钮
- 点击跳转到搜索页面

## 技术细节

### 后端接口

**接口路径**: `POST /api/medical-ai/search`

**请求参数**:
```typescript
{
  query: string;                    // 搜索关键词（必填）
  count?: number;                   // 搜索结果数量，默认 10
  searchType?: 'web' | 'web_summary' | 'image';  // 搜索类型
  summary?: boolean;                // 是否需要 AI 总结，默认 true
}
```

**响应格式**:
```typescript
{
  code: number;
  msg: string;
  data: {
    query: string;                  // 搜索关键词
    searchResults: Array<{
      title: string;                // 标题
      url: string;                  // 链接
      snippet: string;              // 摘要
      siteName: string;             // 网站名称
      content?: string;             // 内容
      publishTime?: string;         // 发布时间
    }>;
    aiSummary?: string;             // AI 智能总结（使用千问大模型）
    sourceCount: number;            // 结果数量
  };
}
```

### 千问大模型配置

- **模型**: qwen-plus
- **temperature**: 0.3（降低随机性，提高准确性）
- **用途**: 对搜索结果进行智能总结，结合中医理论进行分析

### 智能总结内容

千问大模型的总结包含以下部分：
1. 核心观点概述（3-5句话）
2. 关键信息要点（3-5条）
3. 中医理论分析
4. 临床应用建议
5. 注意事项

## 使用方法

### 前端页面访问
1. 打开首页，点击"联网搜索"按钮
2. 输入搜索关键词（如：高血压中医治疗）
3. 点击"搜索"按钮
4. 等待搜索结果和千问智能总结

### API 调用示例

```javascript
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

1. ✅ **联网搜索**: 实时获取互联网上的最新信息
2. ✅ **千问大模型优先**: 默认使用千问大模型进行智能总结
3. ✅ **中医专业**: AI 总结结合中医理论，提供专业的分析和建议
4. ✅ **灵活配置**: 可自定义搜索数量、搜索类型、是否需要总结
5. ✅ **用户友好**: 前端页面简洁易用，支持直接打开链接

## 技术栈

- **SearchClient**: coze-coding-dev-sdk 提供的联网搜索客户端
- **LLMClient**: 千问大模型，用于智能总结
- **Taro**: 跨端框架，支持 H5 和微信小程序

## 注意事项

1. 接口需要登录认证（JWT Token）
2. 搜索结果数量建议 5-10 条，避免过多导致总结超时
3. AI 总结会基于搜索结果生成专业分析，适合中医诊疗场景
4. 搜索关键词尽量具体，以获得更精准的结果
5. 千问大模型的总结结果已经过中医理论优化，可直接用于临床参考

## 应用场景

1. **查询最新中医研究**: 了解某个疾病的最新中医治疗方法
2. **获取临床经验**: 查找名医的临床案例和经验分享
3. **学习中医知识**: 探索某个中医理论或方剂的详细解释
4. **了解药物信息**: 查询中药的功效、禁忌、配伍等

## 验证步骤

1. ✅ 后端代码修改完成
2. ✅ 前端页面创建完成
3. ✅ 页面路由注册完成
4. ✅ 首页导航按钮添加完成
5. ✅ 代码编译正常，无错误

## 下一步建议

1. 在首页添加搜索入口（已完成）
2. 添加搜索历史功能
3. 支持收藏搜索结果
4. 优化搜索结果展示效果
5. 添加搜索建议功能
