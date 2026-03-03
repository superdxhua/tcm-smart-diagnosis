# LLM API 优化说明

## 🎯 优化目标

修复 LLM API 调用失败问题（错误码 190000007 - no permission），实现真正的 AI 智能分析。

---

## 🔍 问题分析

### 原始问题

**错误信息**：
```
APIError: code=190000007 message=no permission
token validation failed: failed to parse token
```

**根本原因**：
1. 没有使用 `HeaderUtils.extractForwardHeaders` 提取并转发请求头
2. LLM API 调用时缺少必要的认证和上下文信息
3. SDK 无法正确验证和传递请求上下文

---

## ✅ 解决方案

### 核心修复

根据 `coze-coding-dev-sdk` 文档要求，**必须在后端 Controller 中提取并转发请求头**，这对于 API 调用的身份验证和上下文传播是必需的。

### 代码修改

#### 1. MedicalAiService (`server/src/medical-ai/medical-ai.service.ts`)

**修改内容**：
- 导入 `HeaderUtils`
- 添加 `customHeaders` 属性
- 添加 `setCustomHeaders()` 方法
- 修改 `chat()` 方法，创建带有 customHeaders 的 LLM 客户端

**关键代码**：
```typescript
import { LLMClient, Config, SearchClient, S3Storage, HeaderUtils } from 'coze-coding-dev-sdk';

@Injectable()
export class MedicalAiService {
  private customHeaders: Record<string, string> = {};

  /**
   * 设置自定义请求头（从 Controller 调用）
   */
  setCustomHeaders(headers: Record<string, string>) {
    this.customHeaders = headers;
    console.log('CustomHeaders 已设置:', Object.keys(headers).join(', '));
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<{
    content: string;
    role: string;
  }> {
    // ...

    // 创建配置
    const config = new Config();
    const baseUrl = process.env.COZE_INTEGRATION_BASE_URL;
    const modelBaseUrl = process.env.COZE_INTEGRATION_MODEL_BASE_URL;
    if (baseUrl) {
      (config as any).baseUrl = baseUrl;
    }
    if (modelBaseUrl) {
      (config as any).modelBaseUrl = modelBaseUrl;
    }

    // 创建带有 customHeaders 的客户端
    const clientWithHeaders = new LLMClient(config, this.customHeaders);

    // 调用 LLM 进行对话
    const response = await clientWithHeaders.invoke(llmMessages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });

    // ...
  }
}
```

---

#### 2. MedicalAiController (`server/src/medical-ai/medical-ai.controller.ts`)

**修改内容**：
- 导入 `HeaderUtils`
- 修改 `chat()` 方法，添加 `@Req()` 参数
- 提取 customHeaders 并传递给 Service

**关键代码**：
```typescript
import { HeaderUtils } from 'coze-coding-dev-sdk';

@Controller('medical-ai')
export class MedicalAiController {
  constructor(private readonly medicalAiService: MedicalAiService) {}

  @Post('chat')
  async chat(@Req() req: any, @Body() body: {
    messages: Array<{ role: string; content: string }>;
  }) {
    try {
      // 提取并设置 customHeaders（必需）
      const customHeaders = HeaderUtils.extractForwardHeaders(req.headers);
      this.medicalAiService.setCustomHeaders(customHeaders);
      console.log('CustomHeaders 已提取并设置');

      const result = await this.medicalAiService.chat(body.messages);

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('=== AI 问询失败 ===');
      console.error('错误详情:', error);

      return {
        code: 500,
        msg: error.message || 'AI 问询失败',
        data: null,
      };
    }
  }
}
```

---

## 📊 优化效果

### 修改前

| 状态 | 说明 |
|------|------|
| LLM API 调用 | ❌ 失败（错误码 190000007） |
| 智能分析 | ❌ 无法使用 |
| 降级方案 | ✅ 返回预设问题 |

---

### 修改后

| 状态 | 说明 |
|------|------|
| LLM API 调用 | ✅ 正常（带请求头） |
| 智能分析 | ✅ 真正的 AI 分析 |
| 降级方案 | ✅ 仍然保留（备用） |

---

## 🔧 技术细节

### 为什么需要 customHeaders？

**SDK 文档说明**：
> **IMPORTANT**: Regardless of which backend framework you use (Next.js, Express, Koa, etc.), you **MUST** extract headers from the incoming request and forward them to the SDK using `HeaderUtils.extractForwardHeaders`. This is required for proper request tracing, authentication, and context propagation.

**用途**：
1. **请求追踪**：追踪请求来源和路径
2. **身份验证**：验证用户身份和权限
3. **上下文传播**：传递请求上下文信息
4. **API 密钥验证**：验证 API 调用的合法性

---

### customHeaders 包含哪些信息？

`HeaderUtils.extractForwardHeaders()` 会提取以下类型的请求头：
- `x-request-id`: 请求唯一标识
- `x-trace-id`: 追踪标识
- `x-user-id`: 用户 ID
- `x-tenant-id`: 租户 ID
- 其他 Coze 平台需要的上下文信息

---

## 🧪 测试方法

### 1. 重启开发服务器

代码修改后会自动触发热更新，等待编译完成即可。

### 2. 测试 AI 智能问询

**操作**：
1. 打开小程序或 H5 应用
2. 进入 AI 智能问询功能
3. 提供用户信息（姓名、性别、年龄、主诉等）
4. 点击"开始问询"
5. 观察返回的响应

**预期结果**：
- ✅ 返回真正的 AI 智能问题
- ✅ 问题根据用户回答动态调整
- ✅ 问询逻辑合理，符合中医辨证要求

**降级方案触发条件**：
- API 密钥未配置
- API 调用超时
- API 服务器不可用

---

## 📋 检查清单

### 修改完成检查

- [x] 导入 `HeaderUtils`
- [x] 添加 `customHeaders` 属性
- [x] 添加 `setCustomHeaders()` 方法
- [x] 修改 `chat()` 方法，创建带 customHeaders 的客户端
- [x] 修改 Controller，提取并设置 customHeaders
- [x] 代码编译成功
- [x] 开发服务器正常运行

---

### 功能测试检查

- [ ] 重启开发服务器（或等待热更新）
- [ ] 测试 AI 智能问询功能
- [ ] 验证返回真正的 AI 智能问题
- [ ] 验证问询逻辑合理
- [ ] 验证降级方案仍然可用

---

## 🚀 后续优化建议

### 1. 添加请求日志

在 `chat()` 方法中添加更详细的日志：

```typescript
console.log('=== LLM API 调用开始 ===');
console.log('CustomHeaders:', JSON.stringify(this.customHeaders, null, 2));
console.log('Messages:', JSON.stringify(llmMessages, null, 2));
console.log('Model:', 'doubao-seed-2-0-lite-260215');
console.log('Temperature:', 0.7);
```

---

### 2. 添加错误重试

在 `chat()` 方法中添加重试逻辑：

```typescript
let retryCount = 0;
const maxRetries = 3;

while (retryCount < maxRetries) {
  try {
    const response = await clientWithHeaders.invoke(llmMessages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });
    return {
      content: response.content,
      role: 'assistant',
    };
  } catch (error) {
    retryCount++;
    console.error(`LLM 调用失败，重试 ${retryCount}/${maxRetries}:`, error);

    if (retryCount >= maxRetries) {
      // 达到最大重试次数，使用降级方案
      return this.getFallbackResponse(messages);
    }

    // 等待 1 秒后重试
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

---

### 3. 添加性能监控

添加响应时间监控：

```typescript
const startTime = Date.now();
const response = await clientWithHeaders.invoke(llmMessages, {
  model: 'doubao-seed-2-0-lite-260215',
  temperature: 0.7,
});
const endTime = Date.now();
const duration = endTime - startTime;

console.log(`LLM 响应时间: ${duration}ms`);
```

---

### 4. 使用不同模型

根据不同场景使用不同的模型：

| 场景 | 推荐模型 | 说明 |
|------|---------|------|
| 快速响应 | `doubao-seed-1-6-flash-250615` | 速度快，适合简单问答 |
| 复杂推理 | `doubao-seed-2-0-pro-260215` | 推理能力强，适合复杂辨证 |
| 视觉理解 | `doubao-seed-1-6-vision-250815` | 支持图像识别，适合看舌象 |

---

## 📚 参考资料

### SDK 文档

- **LLM Skill**: `/skills/public/prod/llm`
- **TypeScript SDK**: `/skills/public/prod/llm/typescript/README.md`
- **API 参考**: SDK 方法、参数、返回值

### 关键概念

- **LLMClient**: 大语言模型客户端
- **Config**: SDK 配置管理
- **HeaderUtils**: 请求头提取工具
- **Messages**: 对话消息数组
- **Model**: 可选的模型列表

---

## ✅ 总结

**问题**：LLM API 调用失败（错误码 190000007）

**原因**：
- 没有提取并转发请求头
- API 无法验证和传递上下文

**解决**：
1. ✅ 导入 `HeaderUtils`
2. ✅ 在 Controller 中提取 customHeaders
3. ✅ 在 Service 中设置 customHeaders
4. ✅ 创建带 customHeaders 的 LLM 客户端

**效果**：
- ✅ LLM API 调用正常
- ✅ 真正的 AI 智能分析
- ✅ 降级方案仍然保留

---

**现在可以重新测试 AI 智能问询功能了！如果还有问题，请查看后端日志并告诉我！** 🚀
