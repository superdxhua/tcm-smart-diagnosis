# 🔄 大模型切换到千问大模型

## 📋 更改概述

已将项目中所有大模型从 **豆包大模型** 切换到 **千问大模型**。

---

## ✅ 修改的文件

### 1. `server/src/llm/llm.service.ts`

**修改内容**：
- ✅ `queryWithSearch` 方法：`doubao-seed-1-8-251228` → `qwen-plus`
- ✅ `recognizeImage` 方法：`doubao-seed-1-6-vision-250815` → `qwen-vl-plus`
- ✅ `readDocument` 方法：`doubao-seed-1-8-251228` → `qwen-plus`
- ✅ `analyzeTCM` 方法：`doubao-seed-1-8-251228` → `qwen-plus`
- ✅ `chat` 方法：`doubao-seed-1-8-251228` → `qwen-plus`

**更改数量**：5 处

---

### 2. `server/src/medical-ai/medical-ai.service.ts`

**修改内容**：
- ✅ 构造函数注释：`优先使用千问大模型` → `使用千问大模型（qwen-plus）`
- ✅ `recommendPrescription` 方法：`doubao-seed-1-8-251228` → `qwen-plus`
- ✅ `differentiateSyndrome` 方法：`doubao-seed-1-8-251228` → `qwen-plus`
- ✅ `getMedicationGuidance` 方法：`doubao-seed-1-8-251228` → `qwen-plus`
- ✅ 其他 LLM 调用：`doubao-seed-1-8-251228` → `qwen-plus`

**更改数量**：5 处

---

### 3. `server/src/medication-feedback/medication-feedback.service.ts`

**修改内容**：
- ✅ 所有 LLM 调用：`doubao-seed-1-8-251228` → `qwen-plus`

**更改数量**：3 处

---

## 📊 模型对比

### 千问大模型 vs 豆包大模型

| 特性 | 千问大模型 | 豆包大模型 |
|------|-----------|-----------|
| **模型名称** | `qwen-plus` | `doubao-seed-1-8-251228` |
| **文字理解** | ✅ 优秀 | ✅ 优秀 |
| **图像理解** | ✅ 支持 | ✅ 支持 |
| **推理能力** | ✅ 强 | ✅ 强 |
| **医学知识** | ✅ 优秀 | ✅ 优秀 |
| **成本** | 低 | 低 |
| **速度** | 快 | 快 |

---

## 🎯 当前使用的模型

### 文字模型

| 功能 | 模型名称 | 说明 |
|------|---------|------|
| **通用查询** | `qwen-plus` | 千问 Plus 版本（文字模型） |
| **文档分析** | `qwen-plus` | 千问 Plus 版本 |
| **中医诊疗** | `qwen-plus` | 千问 Plus 版本 |
| **AI 对话** | `qwen-plus` | 千问 Plus 版本 |
| **医案推荐** | `qwen-plus` | 千问 Plus 版本 |
| **辨证分析** | `qwen-plus` | 千问 Plus 版本 |
| **用药指导** | `qwen-plus` | 千问 Plus 版本 |

### 视觉模型

| 功能 | 模型名称 | 说明 |
|------|---------|------|
| **图片识别** | `qwen-vl-plus` | 千问视觉 Plus 版本（图像理解） |

---

## ✅ 验证结果

### 检查豆包模型

```bash
grep -r "doubao-seed" server/src/
```

**结果**：✅ 无结果（已全部替换）

### 检查千问模型

```bash
grep -r "qwen" server/src/
```

**结果**：✅ 共找到 14 处（全部正确）

---

## 🚀 下一步

### 测试建议

1. **重启后端服务**
   ```bash
   cd /workspace/projects
   pnpm dev:server
   ```

2. **测试各个功能**
   - ✅ 测试千问大模型查询搜索
   - ✅ 测试图片识别
   - ✅ 测试文档内容读取
   - ✅ 测试中医诊疗分析
   - ✅ 测试 AI 对话

3. **监控日志**
   - 查看模型调用日志
   - 确认模型名称正确
   - 确认响应正常

---

## 📝 注意事项

### 1. API Key 配置

确保 `coze-coding-dev-sdk` 的配置文件中已正确配置千问大模型的 API Key。

### 2. 模型名称

如果遇到模型调用失败，可能需要调整模型名称：
- `qwen-plus`：千问 Plus 版本
- `qwen-turbo`：千问 Turbo 版本（更快）
- `qwen-max`：千问 Max 版本（更智能）

### 3. 向后兼容

如果千问大模型不支持某些功能，可能需要：
- 调整提示词
- 修改输出格式
- 处理错误响应

---

## 📞 技术支持

如果遇到问题：

1. 查看后端日志：`/tmp/coze-logs/dev.log`
2. 检查 SDK 版本：`coze-coding-dev-sdk`
3. 参考 coze-coding-dev-sdk 文档

---

**✅ 所有大模型已成功切换到千问大模型！**

**🎉 现在项目默认接入的是千问大模型（qwen-plus）！**
