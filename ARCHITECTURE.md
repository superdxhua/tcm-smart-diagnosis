# 系统架构说明

本文档详细说明中医智能健康咨询系统的整体架构和部署方案。

## 📋 目录

- [架构概览](#架构概览)
- [技术栈](#技术栈)
- [前端架构](#前端架构)
- [后端架构](#后端架构)
- [数据存储](#数据存储)
- [AI 服务集成](#ai-服务集成)
- [部署架构](#部署架构)
- [网络流量](#网络流量)
- [安全策略](#安全策略)

---

## 架构概览

### 系统组成

```
┌─────────────────────────────────────────────────────────┐
│                      账户层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  微信小程序    │  │  H5 网页版    │  │  PWA 应用    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    前端层 (Taro + React)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  页面组件     │  │  状态管理     │  │  网络请求     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              API 网关层 (Vercel Edge)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  路由分发     │  │  CORS 处理   │  │  认证授权     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│          后端层 (NestJS + Serverless)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  医疗 AI 服务 │  │  账户管理     │  │  支付服务     │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  │
│  │  患者管理     │  │  病历管理     │  │  医案管理     │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  │
│  │  处方管理     │  │  反馈管理     │  │  管理后台     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌──────────────┬──────────────┬──────────────┬─────────────┐
│   数据存储    │   AI 服务     │   对象存储    │   第三方服务  │
│              │              │              │             │
│  ┌────────┐ │  ┌────────┐ │  ┌────────┐ │  ┌─────────┐ │
│  │Supabase│ │  │ Coze AI│ │  │   S3   │ │  │ 微信支付 │ │
│  │  数据库 │ │  │  API   │ │  │  存储  │ │  │   API   │ │
│  └────────┘ │  └────────┘ │  └────────┘ │  └─────────┘ │
└──────────────┴──────────────┴──────────────┴─────────────┘
```

---

## 技术栈

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Taro** | 4.1.9 | 跨端框架（小程序、H5、PWA） |
| **React** | 18.x | UI 框架 |
| **TypeScript** | 5.x | 类型安全 |
| **Tailwind CSS** | 4.x | 样式框架 |
| **Zustand** | 5.x | 状态管理 |
| **Capacitor** | 8.x | 原生应用打包 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **NestJS** | 10.x | 后端框架 |
| **TypeScript** | 5.x | 类型安全 |
| **Express** | 5.x | HTTP 服务器 |
| **Drizzle ORM** | 0.45.x | 数据库 ORM |
| **bcrypt** | 6.x | 密码加密 |
| **Multer** | 2.x | 文件上传 |

### 基础设施

| 技术 | 用途 |
|------|------|
| **Vercel** | 前端 + 后端 Serverless 部署 |
| **Supabase** | PostgreSQL 数据库 + 认证 |
| **Coze AI** | 大语言模型（千问、豆包） |
| **S3 对象存储** | 文件存储（图片、文档） |
| **微信支付** | 支付服务 |

---

## 前端架构

### 目录结构

```
src/
├── app.config.ts          # 应用配置
├── pages/                 # 页面
│   ├── index/            # 首页（智能健康咨询）
│   ├── login/            # 登录页
│   ├── register/         # 注册页
│   ├── admin/            # 管理后台
│   └── ...              # 其他页面
├── components/           # 公共组件
├── store/               # 状态管理（Zustand）
├── network.ts           # 网络请求封装
├── utils/               # 工具函数
└── types/               # TypeScript 类型定义
```

### 核心模块

#### 1. 网络请求层（`network.ts`）

```typescript
// 封装 Taro.request，支持自动域名拼接
export namespace Network {
  request(options) {
    return Taro.request({
      url: createUrl(options.url),  // 自动添加 PROJECT_DOMAIN
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  uploadFile(options) {
    return Taro.uploadFile({
      url: createUrl(options.url),
      filePath: options.filePath,
      name: 'file',
    });
  }
}
```

#### 2. 状态管理（Zustand）

```typescript
// 全局状态管理
interface AppState {
  user: User | null;
  patients: Patient[];
  records: MedicalRecord[];
  
  // Actions
  setUser: (user: User) => void;
  addPatient: (patient: Patient) => void;
  addRecord: (record: MedicalRecord) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  patients: [],
  records: [],
  
  setUser: (user) => set({ user }),
  addPatient: (patient) => set((state) => ({
    patients: [...state.patients, patient]
  })),
  addRecord: (record) => set((state) => ({
    records: [...state.records, record]
  })),
}));
```

### 页面架构

#### 智能健康咨询流程（五步健康咨询）

```
步骤 1: 主诉与现病史
  ↓
步骤 2: 现病史详情
  ↓
步骤 3: 既往史（可选附件上传）
  ↓
步骤 4: AI 智能问询
  ↓
步骤 5: 生成健康方案
  ↓
自动保存病历
```

---

## 后端架构

### 目录结构

```
server/
├── src/
│   ├── main.ts              # 应用入口
│   ├── app.module.ts        # 根模块
│   ├── auth/                # 认证模块
│   ├── medical-ai/          # 医疗 AI 模块
│   ├── patients/            # 患者管理模块
│   ├── medical-records/     # 病历管理模块
│   ├── payment/             # 支付模块
│   ├── medical-cases/       # 医案管理模块
│   ├── admin/               # 管理后台模块
│   ├── upload/              # 文件上传模块
│   └── ...                  # 其他模块
├── api/                     # Vercel Serverless 适配器
│   ├── index.ts            # 主适配器
│   └── [[...path]].ts      # 动态路由
├── vercel.json             # Vercel 配置
└── package.json
```

### 核心模块

#### 1. 认证模块（`auth/`）

```typescript
// 账户注册、登录、授权
@Controller('auth')
export class AuthController {
  @Post('register-phone-individual')
  async registerPhoneIndividual(@Body() dto: RegisterDto) {
    // 手机号注册（个人账户）
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    // 账户登录
  }

  @Post('authorize')
  async authorize(@Body() dto: AuthorizeDto) {
    // 账户授权（管理员）
  }
}
```

#### 2. 医疗 AI 模块（`medical-ai/`）

```typescript
// AI 智能问询、识图、联网搜索
@Controller('medical-ai')
export class MedicalAIController {
  @Post('chat')
  async chat(@Body() dto: ChatDto) {
    // AI 问询
  }
  
  @Post('analyze-attachment')
  async analyzeAttachment(@Body() dto: AttachmentDto) {
    // 识图分析
  }
  
  @Post('search')
  async search(@Body() dto: SearchDto) {
    // 联网搜索
  }
}
```

#### 3. 患者管理模块（`patients/`）

```typescript
// 患者 CRUD 操作
@Controller('patients')
export class PatientsController {
  @Get()
  async findAll(@Query('userId') userId: string) {
    // 获取患者列表
  }
  
  @Post()
  async create(@Body() dto: CreatePatientDto) {
    // 创建患者
  }
  
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    // 更新患者
  }
  
  @Delete(':id')
  async remove(@Param('id') id: string) {
    // 删除患者
  }
}
```

#### 4. 病历管理模块（`medical-records/`）

```typescript
// 病历 CRUD 操作
@Controller('medical-records')
export class MedicalRecordsController {
  @Post()
  async create(@Body() dto: CreateRecordDto) {
    // 创建病历
  }
  
  @Get('patient/:patientId')
  async findByPatient(@Param('patientId') patientId: string) {
    // 获取患者的病历列表
  }
  
  @Post('analyze-followup')
  async analyzeFollowup(@Body() dto: FollowupDto) {
    // AI 分析复诊信息
  }
}
```

### Serverless 适配器

```typescript
// Vercel Serverless Function 适配器
// server/api/index.ts

let cachedApp: any = null;

async function bootstrap() {
  if (cachedApp) return cachedApp;
  
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);
  
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.init();
  
  cachedApp = app;
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  const server = app.getHttpAdapter().getInstance();
  server(req, res);
}
```

---

## 数据存储

### Supabase 数据库

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `users` | 账户表 | `id`, `username`, `password_hash`, `role`, `expiry_date` |
| `patients` | 患者表 | `id`, `user_id`, `name`, `age`, `gender`, `medical_history` |
| `medical_records` | 病历表 | `id`, `user_id`, `patient_id`, `diagnosis`, `prescription`, `created_at` |
| `medical_cases` | 医案表 | `id`, `title`, `doctor_name`, `symptoms`, `prescription`, `description` |
| `recharge_orders` | 充值订单表 | `id`, `user_id`, `amount`, `status`, `screenshot_url` |
| `packages` | 套餐表 | `id`, `name`, `price`, `duration_days`, `is_active` |

### 数据库关系

```
users (1) ←→ (N) patients
users (1) ←→ (N) medical_records
patients (1) ←→ (N) medical_records
users (1) ←→ (N) recharge_orders
users (1) ←→ (N) packages
```

---

## AI 服务集成

### Coze AI 集成

```typescript
// medical-ai.service.ts
@Injectable()
export class MedicalAIService {
  private llmClient: LLMClient;
  private searchClient: SearchClient;
  
  constructor() {
    this.llmClient = new LLMClient({
      apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
      baseUrl: process.env.COZE_INTEGRATION_BASE_URL,
      modelBaseUrl: process.env.COZE_INTEGRATION_MODEL_BASE_URL,
    });
    
    this.searchClient = new SearchClient({
      apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
      baseUrl: process.env.COZE_INTEGRATION_BASE_URL,
    });
  }
  
  async chat(messages: Message[]) {
    // AI 问询
    return await this.llmClient.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });
  }
  
  async analyzeImage(imageUrl: string) {
    // AI 识图
    return await this.llmClient.invoke([
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageUrl } },
          { type: 'text', text: '请分析这张图片的内容' }
        ]
      }
    ]);
  }
  
  async search(query: string) {
    // 联网搜索
    return await this.searchClient.search({
      query,
      count: 5,
      summary: true,
    });
  }
}
```

---

## 部署架构

### 前端部署（Vercel）

```
GitHub 仓库
  ↓
Vercel Frontend 项目
  ↓
自动构建（npm run build:web）
  ↓
部署到 Vercel CDN
  ↓
全球加速访问
```

### 后端部署（Vercel Serverless）

```
GitHub 仓库
  ↓
Vercel Backend 项目（Root Directory: server）
  ↓
自动构建（npm run build）
  ↓
部署到 Vercel Serverless Functions
  ↓
按需执行，自动扩缩容
```

### 部署配置

#### 前端 `vercel.json`

```json
{
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist-web",
  "installCommand": "npm install --legacy-peer-deps"
}
```

#### 后端 `server/vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install --legacy-peer-deps",
  "functions": {
    "api/**/*.{ts,js}": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

---

## 网络流量

### 账户请求流程

```
1. 账户打开应用
   ↓
2. 前端加载（Vercel CDN）
   ↓
3. 账户登录
   ↓
4. POST /api/auth/login → 后端 Serverless Function
   ↓
5. 返回 JWT Token
   ↓
6. 前端保存 Token
   ↓
7. 账户使用功能（如 AI 问询）
   ↓
8. POST /api/medical-ai/chat → 后端 Serverless Function
   ↓
9. 后端调用 Coze AI API
   ↓
10. 返回 AI 回复
   ↓
11. 前端更新 UI
```

### API 调用统计

| 功能 | API 路径 | 频率 | 响应时间 |
|------|---------|------|---------|
| 登录 | `POST /api/auth/login` | 低 | < 500ms |
| AI 问询 | `POST /api/medical-ai/chat` | 高 | 3-8s |
| 识图分析 | `POST /api/medical-ai/analyze-attachment` | 中 | 5-10s |
| 联网搜索 | `POST /api/medical-ai/search` | 中 | 2-5s |
| 处方生成 | `POST /api/tcm/analyze` | 高 | 5-10s |

---

## 安全策略

### 1. 认证与授权

```typescript
// JWT Token 认证
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    // 验证 Token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      request.user = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

### 2. 权限控制

```typescript
// 角色权限控制
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;
    
    const user = context.switchToHttp().getRequest().user;
    return requiredRoles.includes(user.role);
  }
}

// 使用示例
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'institution')
async getAllAccounts() {
  // 只有管理员和机构账户可以访问
}
```

### 3. 数据加密

```typescript
// 密码加密（bcrypt）
const hashedPassword = await bcrypt.hash(password, 10);

// 密码验证
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 4. CORS 配置

```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### 5. 请求限制

```typescript
// 防止滥用检测
@Injectable()
export class AbuseDetectionService {
  async detectAbuse(userId: string): Promise<boolean> {
    // 检测一天内的异常行为
    const todayRecords = await this.medicalRecordsRepository.find({
      userId,
      createdAt: gte(startOfDay(new Date())),
    });
    
    // 检测规则
    const rules = [
      { check: () => todayRecords.length > 20, reason: '处方频率过高' },
      { check: () => this.detectMultiplePatients(todayRecords), reason: '多患者使用' },
      { check: () => this.detectDuplicateRecords(todayRecords), reason: '重复处方' },
    ];
    
    for (const rule of rules) {
      if (rule.check()) {
        await this.punishmentService.punishUser(userId, rule.reason);
        return true;
      }
    }
    
    return false;
  }
}
```

---

## 性能优化

### 1. 前端优化

- ✅ 代码分割（React Lazy）
- ✅ 图片懒加载
- ✅ CDN 加速（Vercel）
- ✅ 缓存策略（Service Worker）

### 2. 后端优化

- ✅ Serverless Function 缓存
- ✅ 数据库查询优化（索引）
- ✅ AI 调用优化（流式响应）
- ✅ 并发限制（防止滥用）

### 3. 缓存策略

```typescript
// 使用 Vercel KV 或 Redis
@Injectable()
export class CacheService {
  async get(key: string) {
    return await this.redis.get(key);
  }
  
  async set(key: string, value: any, ttl: number = 3600) {
    return await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}
```

---

## 监控与日志

### 1. 前端监控

```typescript
// 错误监控
window.addEventListener('error', (event) => {
  console.error('Frontend Error:', event.error);
  // 上报到 Sentry 或其他监控服务
});

// 性能监控
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart);
});
```

### 2. 后端监控

```typescript
// NestJS 日志
@Injectable()
export class LoggerService extends ConsoleLogger {
  log(message: string, context?: string) {
    super.log(message, context);
    // 上报到日志服务（如 Sentry、LogRocket）
  }
  
  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
    // 上报到错误监控服务
  }
}
```

---

## 扩展性

### 水平扩展

- ✅ Serverless Functions 自动扩缩容
- ✅ 数据库连接池管理
- ✅ CDN 全球加速

### 垂直扩展

- ✅ 升级 Vercel 计划（Pro → Enterprise）
- ✅ 增加内存配置（1024MB → 3008MB）
- ✅ 增加执行时间限制（10s → 60s）

---

## 总结

### 系统特点

1. **前后端分离**：前端和后端独立部署，灵活扩展
2. **Serverless 架构**：按需付费，自动扩缩容
3. **多端支持**：支持小程序、H5、PWA、原生应用
4. **AI 集成**：集成 Coze AI，提供智能问询和识图能力
5. **安全可靠**：JWT 认证、角色权限、数据加密
6. **高性能**：CDN 加速、缓存策略、代码分割

### 适用场景

- ✅ 中医健康咨询辅助
- ✅ 处方智能推荐
- ✅ AI 问询咨询
- ✅ 患者管理
- ✅ 病历管理
- ✅ 医案学习

### 未来规划

- 📱 支持更多平台（Android、iOS）
- 🤖 集成更多 AI 模型
- 📊 数据分析和可视化
- 🔔 推送通知
- 🎨 更多主题和样式

---

## 更新日志

- **2026-02-21**: 初始版本，完成架构说明文档
