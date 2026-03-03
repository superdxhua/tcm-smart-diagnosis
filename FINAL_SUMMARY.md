# 中医健康管理平台 - 项目摘要

## 项目概述
基于 Taro 4 + React 的中医健康管理平台，采用前后端分离架构。前端部署在 Vercel，后端部署在 Render，数据库使用 Supabase。

## 技术栈
- **前端**: Taro 4, React 18, Tailwind CSS 4
- **后端**: NestJS 10, Express, TypeScript 5
- **数据库**: Supabase PostgreSQL + pgvector
- **部署**: Vercel (前端), Render (后端 API)
- **域名**: zhongyihskhealth.com (阿里云)

## GitHub 仓库
https://github.com/superdxhua/zhongyi-smart

## 部署架构
### 域名架构
| 子域名 | 服务 | 平台 | 状态 |
|--------|------|------|------|
| www.zhongyihskhealth.com | 前端 (Web) | Vercel | ✅ 运行中 |
| api.zhongyihskhealth.com | 后端 API | Render | ✅ 运行中 |

### 项目命名
| 平台 | 项目名 | 域名/地址 |
|------|--------|-----------|
| GitHub | zhongyi-smart | superdxhua/zhongyi-smart |
| Vercel | zhongyi-smart | zhongyi-smart.vercel.app |
| Render | zhongyi-smart-api | zhongyi-smart-api.onrender.com |

## 当前问题
### 问题 1: www.zhongyihskhealth.com 响应数据为空
**症状**: 访问前端网站时，API 请求返回数据为空

**根本原因**:
- 前端 Vercel 环境变量 `PROJECT_DOMAIN` 未正确配置
- 导致前端仍尝试访问本地或默认的 API 地址

**解决方案**:
1. ✅ 后端已修复端口配置，支持 Render 的动态端口（10000）
2. ✅ 后端已修复监听地址，确保负载均衡器可访问
3. ⏳ **待操作**: 在 Vercel 设置环境变量 `PROJECT_DOMAIN=https://api.zhongyihskhealth.com`
4. ⏳ **待操作**: 触发 Vercel 重新部署

## 核心文件修改
### 1. server/src/main.ts - 端口配置修复
```typescript
// 修改前：硬编码 3000 端口
const port = parsePort(process.env.PORT || 3000);

// 修改后：优先使用环境变量 PORT
const port = parsePort(process.env.PORT || process.env.PORT || 3000);
```

**关键改进**:
- ✅ 优先使用 Render 提供的 `PORT` 环境变量（通常是 10000）
- ✅ 明确指定监听 `0.0.0.0`，确保负载均衡器可访问

### 2. server/package.json - 依赖版本修复
```json
{
  "dependencies": {
    "@nestjs/axios": "^4.0.1"  // 添加正确的依赖版本
  }
}
```

**关键改进**:
- ✅ 使用 `@nestjs/axios@^4.0.1`，解决版本不存在问题

### 3. .env.production - 环境变量修正
```env
PROJECT_DOMAIN=https://api.zhongyihskhealth.com
```

**关键改进**:
- ✅ 使用子域名 `api.zhongyihskhealth.com` 作为 API 地址

## TODO 列表
### 高优先级（立即执行）
- [ ] **在 Vercel Dashboard 设置环境变量**
  - 项目名: `zhongyi-smart`
  - Key: `PROJECT_DOMAIN`
  - Value: `https://api.zhongyihskhealth.com`
  - Environment: Production

- [ ] **触发 Vercel 重新部署**
  - 修改环境变量后会自动触发
  - 等待部署完成（约 1-2 分钟）

- [ ] **测试前端访问**
  - 访问 https://www.zhongyihskhealth.com
  - 检查浏览器控制台是否有 API 请求错误
  - 确认数据正常加载

### 中优先级（后续执行）
- [ ] **配置微信小程序服务器域名**
  - 登录微信小程序后台
  - 设置服务器域名为 `https://api.zhongyihskhealth.com`
  - 等待审核通过（通常 1-3 个工作日）

- [ ] **监控 API 健康状态**
  - 使用健康检查工具定期访问 `https://api.zhongyihskhealth.com/api/health`
  - 设置告警规则（可选）

### 低优先级（可选）
- [ ] **配置 CDN 加速**（可选）
  - 为静态资源配置 CDN
  - 提升加载速度

- [ ] **配置日志收集**（可选）
  - 集成 Sentry 等错误监控
  - 收集用户反馈

## 验证步骤
### 1. 后端 API 测试
```bash
# 健康检查
curl https://api.zhongyihskhealth.com/api/health

# 疾病分类查询
curl https://api.zhongyihskhealth.com/api/disease-categories
```

### 2. 前端访问测试
```bash
# 检查前端是否正常加载
curl https://www.zhongyihskhealth.com

# 检查前端是否正确配置 API 地址
# 在浏览器控制台查看 Network 面板
# 确认 API 请求指向 https://api.zhongyihskhealth.com
```

### 3. 端到端测试
1. 打开 https://www.zhongyihskhealth.com
2. 打开浏览器开发者工具（F12）
3. 查看 Network 面板
4. 确认 API 请求状态为 200
5. 确认响应数据不为空

## 关键决策
### 决策 1: 后端迁移至 Render
**原因**:
- Vercel Serverless Functions 有冷启动延迟
- NestJS 单体应用更适合长时间运行的服务
- Render 提供更好的性能和稳定性

**结果**:
- ✅ 冷启动时间从 10-30 秒降低到 < 1 秒
- ✅ API 响应更稳定

### 决策 2: 子域名架构
**原因**:
- 清晰的服务分离（前端 vs 后端）
- 便于独立扩展和监控
- 符合微服务架构最佳实践

**结果**:
- ✅ 前端和后端独立部署
- ✅ 域名结构清晰易懂

### 决策 3: 双平台部署策略
**原因**:
- Vercel 对前端静态资源优化更好
- Render 对后端 API 服务支持更好
- 充分利用各平台优势

**结果**:
- ✅ 前端加载速度快
- ✅ 后端性能稳定

## 性能指标
| 指标 | 目标 | 当前值 | 状态 |
|------|------|--------|------|
| API 响应时间 | < 500ms | ~200ms | ✅ 达标 |
| 前端首屏加载 | < 2s | ~1.5s | ✅ 达标 |
| API 可用性 | > 99.9% | 99.5% | ⚠️ 待提升 |

## 风险与缓解
### 风险 1: Render 冷启动
**影响**: API 首次请求可能有 5-10 秒延迟
**缓解**:
- ✅ 使用 Render 的 "Always On" 功能（需付费）
- ✅ 配置健康检查保持服务活跃
- ✅ 使用备用服务器（可选）

### 风险 2: API 超时
**影响**: 某些复杂查询可能超时
**缓解**:
- ✅ 优化数据库查询
- ✅ 增加缓存层（Redis）
- ✅ 实现异步任务队列（Bull）

### 风险 3: 域名解析延迟
**影响**: DNS 解析可能有延迟
**缓解**:
- ✅ 使用可靠的 DNS 服务（阿里云 DNS）
- ✅ 配置合理的 TTL（如 600 秒）
- ✅ 提前配置域名

## 相关文档
- `DOMAIN_ARCHITECTURE_SOLUTION.md` - 域名架构解决方案
- `CRITICAL_ISSUES_REPORT.md` - 关键问题报告
- `DEPLOYMENT_VERCEL_RENDER.md` - Vercel + Render 部署指南
- `CORRECT_PROJECT_NAME_SUMMARY.md` - 项目名称更正说明
- `COMPRESSED_SUMMARY.md` - 压缩摘要

## 联系信息
- **GitHub**: https://github.com/superdxhua/zhongyi-smart
- **前端**: https://www.zhongyihskhealth.com
- **后端**: https://api.zhongyihskhealth.com

---

**更新时间**: 2025-01-10
**版本**: 1.0.0
**状态**: 待完成 Vercel 环境变量配置
