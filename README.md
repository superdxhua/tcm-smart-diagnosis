# Coze Mini Program

这是一个基于 [Taro 4](https://docs.taro.zone/docs/) + [Nest.js](https://nestjs.com/) 的前后端分离项目，由扣子编程 CLI 创建。

**最后更新：2024-02-22**

## 技术栈

- **整体框架**: Taro 4.1.9
- **语言**: TypeScript 5.4.5
- **渲染**: React 18.0.0
- **样式**: TailwindCSS 4.1.18
- **Tailwind 适配层**: weapp-tailwindcss 4.9.2
- **状态管理**: Zustand 5.0.9
- **图标库**: lucide-react 0.511.0
- **工程化**: Vite 4.2.0
- **包管理**: pnpm
- **运行时**: Node.js >= 18
- **服务端**: NestJS 10.4.15
- **数据库 ORM**: Drizzle ORM 0.45.1
- **类型校验**: Zod 4.3.5

## 文档

### 🚀 Vercel 云端部署（推荐）
- **⚡ 5 分钟快速部署**：[VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md) - 最简单、最快速的部署方案
- **📖 完整部署指南**：[docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md) - Vercel 部署详细指南
- **🌐 Serverless Functions**：[docs/VERCEL_FUNCTIONS_GUIDE.md](./docs/VERCEL_FUNCTIONS_GUIDE.md) - 将后端改造为 Vercel Functions
- **🌐 部署后访问指南**：[POST_DEPLOYMENT_ACCESS_GUIDE.md](./POST_DEPLOYMENT_ACCESS_GUIDE.md) - 部署成功后的访问和配置

### 🚀 快速开始（本地开发）
- **⚡ H5 版本快速启动**：[H5_3_STEPS.md](./H5_3_STEPS.md) - 3 步快速启动 H5 版本
- **🚀 H5 详细指南**：[H5_QUICK_START.md](./H5_QUICK_START.md) - H5 版本完整部署指南
- **📱 手机访问配置**：[H5_MOBILE_ACCESS.md](./H5_MOBILE_ACCESS.md) - 手机访问详细配置指南
- **📥 下载页面访问**：[DOWNLOAD_PAGE_ACCESS_GUIDE.md](./DOWNLOAD_PAGE_ACCESS_GUIDE.md) - 如何访问下载页面

### 📱 下载页面
- **📥 下载页面访问指南**：[DOWNLOAD_PAGE_ACCESS_GUIDE.md](./DOWNLOAD_PAGE_ACCESS_GUIDE.md) - 下载页面使用说明
- **📱 超简单安装指南**：[INSTALL_SIMPLE_GUIDE.md](./INSTALL_SIMPLE_GUIDE.md) - 面向普通用户的安装教程
- **📱 快速参考卡**：[INSTALL_QUICK_REF.md](./INSTALL_QUICK_REF.md) - 5 步速查

### 🚀 生产环境部署
- **🌐 完整部署指南**：[docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) - 详细的生产环境部署步骤
- **⚡ 快速部署指南**：[docs/DEPLOYMENT_QUICKSTART.md](./docs/DEPLOYMENT_QUICKSTART.md) - 5 分钟快速部署
- **✅ 部署检查清单**：[docs/DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md) - 部署前检查清单
- **❓ 部署常见问题**：[docs/DEPLOYMENT_FAQ.md](./docs/DEPLOYMENT_FAQ.md) - 部署问题排查

### 开发文档
- [微信支付接入指南](./docs/wechat-payment-guide.md) - 如何配置真实的微信支付接口
- [小程序审核截图准备指南](./docs/wechat-audit-screenshot-guide.md) - 如何准备小程序审核所需的页面截图
- [截图自动化指南](./docs/screenshot-automation-guide.md) - 自动化截图工具使用说明
- [微信平台审核4张截图要求](./docs/wechat-4-screenshots-guide.md) - 微信平台要求的4张具体截图详解

### APP 打包文档
- **📱 超简单安装指南**：[INSTALL_SIMPLE_GUIDE.md](./INSTALL_SIMPLE_GUIDE.md) - 面向普通用户的安装教程
- **📱 快速参考卡**：[INSTALL_QUICK_REF.md](./INSTALL_QUICK_REF.md) - 5 步速查
- **📱 鸿蒙安装指南**：[HARMONY_INSTALL_GUIDE.md](./HARMONY_INSTALL_GUIDE.md) - 华为鸿蒙手机详细安装指南
- **📱 下载安装说明**：[DOWNLOAD_README.md](./DOWNLOAD_README.md) - 下载和安装说明
- **📱 APP 打包指南**：[APP_BUILD_GUIDE.md](./APP_BUILD_GUIDE.md) - 技术人员打包指南
- **📱 APP 快速开始**：[APP_README.md](./APP_README.md) - APP 使用快速开始
- **📱 华为应用市场上架**：[HUAWEI_STORE_GUIDE.md](./HUAWEI_STORE_GUIDE.md) - 上架华为应用市场指南
- **📱 打包完成总结**：[APP_BUILD_SUMMARY.md](./APP_BUILD_SUMMARY.md) - 已完成工作总结

### APK 构建文档
- **📦 构建方案总览**：[APK_BUILD_OVERVIEW.md](./APK_BUILD_OVERVIEW.md) - 选择最适合你的构建方案
- **🐳 Docker 构建教程**：[BUILD_APK_TUTORIAL_DOCKER.md](./BUILD_APK_TUTORIAL_DOCKER.md) - 使用 Docker 自动构建（推荐技术人员）
- **☁️ 在线构建教程**：[BUILD_APK_ONLINE.md](./BUILD_APK_ONLINE.md) - 使用 GitHub Actions/GitLab CI 构建（推荐所有人）
- **⏭️  跳过构建教程**：[SKIP_APK_BUILD.md](./SKIP_APK_BUILD.md) - 暂时使用 H5 版本（最简单）
- **📥 官网下载指南**：[GET_APK_FROM_WEBSITE.md](./GET_APK_FROM_WEBSITE.md) - 如何从官网获取 APK 文件

## 快速工具

- [📸 截图导航页面](http://localhost:5000/screenshot-navigation.html) - 一键访问所有需要截图的页面（需先启动开发服务器）

## 🌐 Vercel 云端部署（推荐）

### 为什么选择 Vercel？

✅ **免费**：个人项目完全免费
✅ **自动 HTTPS**：无需手动配置 SSL 证书
✅ **全球 CDN**：自动加速，访问速度更快
✅ **一键部署**：推送代码自动部署
✅ **无需服务器**：无需购买和维护服务器
✅ **无需域名**：使用 Vercel 免费域名

### 5 分钟快速部署

1. **上传到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/tcm-smart-diagnosis.git
   git push -u origin main
   ```

2. **导入到 Vercel**
   - 访问：https://vercel.com/dashboard
   - 点击"Add New" → "Project"
   - 选择你的 GitHub 仓库
   - 点击"Import"

3. **配置项目**
   - **Build Command**: `pnpm install && pnpm build:web`
   - **Output Directory**: `dist/h5`
   - 点击"Deploy"

4. **等待 1-2 分钟，部署成功！**

5. **访问你的网站**
   - 首页：https://你的项目名.vercel.app
   - 下载页：https://你的项目名.vercel.app/pages/download/index

### 详细指南

查看完整文档：[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

### 快速参考

查看关键命令和配置：[VERCEL_QUICK_REF.md](./VERCEL_QUICK_REF.md)

## APP 打包（华为鸿蒙）

### 获取 APK 文件

**APK 文件未包含在代码仓库中**，需要以下方式获取：

#### 方式 1：联系开发人员（推荐）
- **邮箱**：support@example.com
- **客服电话**：400-xxx-xxxx

#### 方式 2：自行构建
查看详细指南：[APP_BUILD_GUIDE.md](./APP_BUILD_GUIDE.md)

### 开发命令

```bash
# 构建 H5 版本
pnpm build:web

# 同步到 Android 项目
pnpm app:sync

# 打开 Android Studio
pnpm app:open

# 构建 APK
pnpm app:build
```

## 项目结构

```
├── .cozeproj/                # Coze 平台配置
│   └── scripts/              # 构建和运行脚本
├── config/                   # Taro 构建配置
│   ├── index.ts              # 主配置文件
│   ├── dev.ts                # 开发环境配置
│   └── prod.ts               # 生产环境配置
├── server/                   # NestJS 后端服务
│   └── src/  
│       ├── main.ts           # 服务入口
│       ├── app.module.ts     # 根模块
│       ├── app.controller.ts # 应用控制器
│       └── app.service.ts    # 应用服务
├── src/                      # 前端源码
│   ├── pages/                # 页面组件
│   ├── utils/                # 工具函数
│   ├── app.ts                # 应用入口
│   ├── app.config.ts         # 应用配置
│   └── app.css               # 全局样式
├── types/                    # TypeScript 类型定义
├── key/                      # 小程序密钥（CI 上传用）
├── .env.local                # 环境变量
└── project.config.json       # 微信小程序项目配置
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 本地开发

同时启动 H5 前端和 NestJS 后端：

```bash
pnpm dev
```

- 前端地址：http://localhost:5000
- 后端地址：http://localhost:3000

单独启动：

```bash
pnpm dev:web      # 仅 H5 前端
pnpm dev:weapp    # 仅微信小程序
pnpm dev:server   # 仅后端服务
```

### 构建

```bash
pnpm build        # 构建所有（H5 + 小程序 + 后端）
pnpm build:web    # 仅构建 H5，输出到 dist-web
pnpm build:weapp  # 仅构建微信小程序，输出到 dist
pnpm build:server # 仅构建后端
```

### 预览小程序

```bash
pnpm preview:weapp # 构建并生成预览小程序二维码
```

## 前端核心开发规范

### 新建页面流程

1. 在 \`src/pages/\` 下创建页面目录
2. 创建 \`index.tsx\`（页面组件）
3. 创建 \`index.config.ts\`（页面配置）
4. 创建 \`index.css\`（页面样式，可选）
5. 在 \`src/app.config.ts\` 的 \`pages\` 数组中注册页面路径

或使用 Taro 脚手架命令：

```bash
pnpm new      # 交互式创建页面/组件
```

### 常用 Taro 组件

引入方式

```typescript
import { Text } from '@tarojs/components'
```
- 基础组件
  - Text
  - Icon
  - Progress
  - RichText
- 表单组件
  - Button
  - Checkbox
  - CheckboxGroup
  - Editor
  - Form
  - Input
  - Label
  - Picker
  - PickerView
  - PickerViewColumn
  - Radio
  - RadioGroup
  - Slider
  - Switch
  - Textarea
- 导航组件
  - FunctionalPageNavigator
  - NavigationBar
  - Navigator
  - TabItem
  - Tabs
- 媒体组件
  - Camera
  - Image
  - Video
- 视图容器
  - ScrollView
  - Swiper
  - SwiperItem
  - View

### 路径别名

项目配置了 `@/*` 路径别名指向 `src/*`：

```typescript
import { SomeComponent } from '@/components/SomeComponent'
import { useUserStore } from '@/stores/user'
```

### 代码模板

#### 页面组件 (TypeScript + React)

```tsx
// src/pages/example/index.tsx
import { View, Text } from '@tarojs/components'
import { useLoad, useDidShow } from '@tarojs/taro'
import type { FC } from 'react'
import './index.css'

const ExamplePage: FC = () => {
  useLoad(() => {
    console.log('Page loaded.')
  })

  useDidShow(() => {
    console.log('Page showed.')
  })

  return (
    <View className="flex flex-col items-center p-4">
      <Text className="text-lg font-bold">Hello Taro!</Text>
    </View>
  )
}

export default ExamplePage
```

#### 页面配置

```typescript
// src/pages/example/index.config.ts
import { definePageConfig } from '@tarojs/taro'

export default definePageConfig({
  navigationBarTitleText: '示例页面',
  enablePullDownRefresh: true,
  backgroundTextStyle: 'dark',
})
```

#### 应用配置

```typescript
// src/app.config.ts
import { defineAppConfig } from '@tarojs/taro'

export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/example/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'App',
    navigationBarTextStyle: 'black',
  },
  // TabBar 配置 (可选)
  // tabBar: {
  //   list: [
  //     { pagePath: 'pages/index/index', text: '首页' },
  //   ],
  // },
})
```

### 发送请求

**IMPORTANT: 禁止直接使用 Taro.request、Taro.uploadFile、Taro.downloadFile，使用 Network.request、Network.uploadFile、Network.downloadFile 替代。**

Network 是对 Taro.request、Taro.uploadFile、Taro.downloadFile 的封装，自动添加项目域名前缀，参数与 Taro 一致。

✅ 正确使用方式

```typescript
import { Network } from '@/network'

// GET 请求
const data = await Network.request({ 
  url: '/api/hello' 
})

// POST 请求
const result = await Network.request({
  url: '/api/user/login',
  method: 'POST',
  data: { username, password }
})

// 文件上传
await Network.uploadFile({
  url: '/api/upload',
  filePath: tempFilePath,
  name: 'file'
})

// 文件下载
await Network.downloadFile({
  url: '/api/download/file.pdf'
})
```

❌ 错误用法

```typescript
import Taro from '@tarojs/taro'

// ❌ 会导致自动域名拼接无法生效，除非是特殊指定域名
const data = await Network.request({ 
  url: 'http://localhost/api/hello' 
})

// ❌ 不要直接使用 Taro.request
await Taro.request({ url: '/api/hello' })

// ❌ 不要直接使用 Taro.uploadFile
await Taro.uploadFile({ url: '/api/upload', filePath, name: 'file' })
```

### Zustand 状态管理

```typescript
// src/stores/user.ts
import { create } from 'zustand'

interface UserState {
  userInfo: UserInfo | null
  token: string
  setUserInfo: (info: UserInfo) => void
  setToken: (token: string) => void
  logout: () => void
}

interface UserInfo {
  id: string
  name: string
  avatar: string
}

export const useUserStore = create<UserState>((set) => ({
  userInfo: null,
  token: '',
  setUserInfo: (info) => set({ userInfo: info }),
  setToken: (token) => set({ token }),
  logout: () => set({ userInfo: null, token: '' }),
}))
```

### Taro 生命周期 Hooks

```typescript
import {
  useLoad,             // 页面加载 (onLoad)
  useReady,            // 页面初次渲染完成 (onReady)
  useDidShow,          // 页面显示 (onShow)
  useDidHide,          // 页面隐藏 (onHide)
  usePullDownRefresh,  // 下拉刷新 (onPullDownRefresh)
  useReachBottom,      // 触底加载 (onReachBottom)
  useShareAppMessage,  // 分享 (onShareAppMessage)
  useRouter,           // 获取路由参数
} from '@tarojs/taro'
```

### 路由导航

```typescript
import Taro from '@tarojs/taro'

// 保留当前页面，跳转到新页面
Taro.navigateTo({ url: '/pages/detail/index?id=1' })

// 关闭当前页面，跳转到新页面
Taro.redirectTo({ url: '/pages/detail/index' })

// 跳转到 tabBar 页面
Taro.switchTab({ url: '/pages/index/index' })

// 返回上一页
Taro.navigateBack({ delta: 1 })

// 获取路由参数
const router = useRouter()
const { id } = router.params
```

### 图标使用 (lucide-react)

项目集成了 [lucide-react](https://lucide.dev/) 图标库，提供丰富的 SVG 图标：

```tsx
import { View } from '@tarojs/components'
import { Home, Settings, User, Search, Heart, Star } from 'lucide-react'

const IconDemo = () => {
  return (
    <View className="flex gap-4">
      <Home size={24} color="#333" />
      <Settings size={24} className="text-blue-500" />
      <User size={20} strokeWidth={1.5} />
      <Search size={24} />
      <Heart size={24} fill="red" color="red" />
      <Star size={24} className="text-yellow-500" />
    </View>
  )
}
```

常用属性：
- `size` - 图标大小（默认 24）
- `color` - 图标颜色
- `strokeWidth` - 线条粗细（默认 2）
- `className` - 支持 Tailwind 类名

更多图标请访问：https://lucide.dev/icons

### Tailwind CSS 样式开发

IMPORTANT：必须使用 tailwindcss 实现样式，只有在必要情况下才能 fallback 到 css / less

> 项目已集成 Tailwind CSS 4.x + weapp-tailwindcss，支持跨端原子化样式：

```tsx
<View className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
  <Text className="text-2xl font-bold text-blue-600 mb-4">标题</Text>
  <View className="w-full px-4">
    <Button className="w-full bg-blue-500 text-white rounded-lg py-3">
      按钮
    </Button>
  </View>
</View>
```

### 性能优化

#### 图片懒加载

```tsx
import { Image } from '@tarojs/components'

<Image src={imageUrl} lazyLoad mode="aspectFill" />
```

#### 虚拟列表

```tsx
import { VirtualList } from '@tarojs/components'

<VirtualList
  height={500}
  itemData={list}
  itemCount={list.length}
  itemSize={100}
  renderItem={({ index, style, data }) => (
    <View style={style}>{data[index].name}</View>
  )}
/>
```

#### 分包加载

```typescript
// src/app.config.ts
export default defineAppConfig({
  pages: ['pages/index/index'],
  subPackages: [
    {
      root: 'packageA',
      pages: ['pages/detail/index'],
    },
  ],
})
```

### 小程序限制

| 限制项   | 说明                                     |
| -------- | ---------------------------------------- |
| 主包体积 | ≤ 2MB                                    |
| 总包体积 | ≤ 20MB                                   |
| 域名配置 | 生产环境需在小程序后台配置合法域名       |
| 本地开发 | 需在微信开发者工具开启「不校验合法域名」 |

### 权限配置

```typescript
// src/app.config.ts
export default defineAppConfig({
  // ...其他配置
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息将用于小程序位置接口的效果展示'
    }
  },
  requiredPrivateInfos: ['getLocation', 'chooseAddress']
})
```

### 位置服务

```typescript
// 需先在 app.config.ts 中配置 permission
async function getLocation(): Promise<Taro.getLocation.SuccessCallbackResult> {
  return await Taro.getLocation({ type: 'gcj02' })
}
```

## 后端核心开发规范

本项目后端基于 NestJS + TypeScript 构建，提供高效、可扩展的服务端能力。

### 项目结构

```sh
.
├── server/                   # NestJS 后端服务
│   └── src/
│       ├── main.ts           # 服务入口
│       ├── app.module.ts     # 根模块
│       ├── app.controller.ts # 根控制器
│       └── app.service.ts    # 根服务
```

### 开发命令

```sh
pnpm dev:server // 启动开发服务 (热重载, 默认端口 3000)
pnpm build:server // 构建生产版本
```

### 新建模块流程 (CLI)

快速生成样板代码：

```bash
cd server

# 生成完整的 CRUD 资源 (包含 Module, Controller, Service, DTO, Entity)
npx nest g resource modules/product

# 仅生成特定部分
npx nest g module modules/order
npx nest g controller modules/order
npx nest g service modules/order
```

### 环境变量配置

在 server/ 根目录创建 .env 文件：

```sh
## 服务端口
PORT=3000

## 微信小程序配置
WX_APP_ID=你的AppID
WX_APP_SECRET=你的AppSecret

## JWT 密钥
JWT_SECRET=your-super-secret-key
```

在代码中使用 @nestjs/config 读取环境变量：

```typescript
import { ConfigService } from '@nestjs/config';

// 在 Service 中注入
constructor(private configService: ConfigService) {}

getWxConfig() {
  return {
    appId: this.configService.get<string>('WX_APP_ID'),
    secret: this.configService.get<string>('WX_APP_SECRET'),
  };
}
```

### 标准响应封装

建议使用拦截器 (Interceptor) 统一 API 响应格式：

```typeScript
// src/common/interceptors/transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  data: T;
  message: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        data,
        message: 'success',
      })),
    );
  }
}
```

在 main.ts 中全局注册：

```typescript
app.useGlobalInterceptors(new TransformInterceptor());
```

### 微信登录后端实现

```typescript
// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async code2Session(code: string) {
    const appId = this.configService.get('WX_APP_ID');
    const secret = this.configService.get('WX_APP_SECRET');
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    const { data } = await lastValueFrom(this.httpService.get(url));

    if (data.errcode) {
      throw new UnauthorizedException(`微信登录失败: ${data.errmsg}`);
    }

    return data; // 包含 openid, session_key
  }
}
```

### 异常处理

使用全局异常过滤器 (Filter) 统一错误响应：

```typescript
// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      code: status,
      message: typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message,
      data: null,
    });
  }
}
```

在 main.ts 中注册：

```
app.useGlobalFilters(new HttpExceptionFilter());
```

### 数据库 (Drizzle ORM)

推荐使用 [Drizzle ORM](https://orm.drizzle.team/)，已预安装。

### 类型校验 (Zod)

项目集成了 [Zod](https://zod.dev/) 用于运行时类型校验。

#### 定义 Schema

```typescript
import { z } from 'zod';

// 基础类型
const userSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(50),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

// 从 schema 推导 TypeScript 类型
type User = z.infer<typeof userSchema>;
```

#### 请求校验

```typescript
// src/modules/user/dto/create-user.dto.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  nickname: z.string().min(1, '昵称不能为空').max(20, '昵称最多20个字符'),
  avatar: z.string().url('头像必须是有效的URL').optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

// 在 Controller 中使用
@Post()
create(@Body() body: unknown) {
  const result = createUserSchema.safeParse(body);
  if (!result.success) {
    throw new BadRequestException(result.error.errors);
  }
  return this.userService.create(result.data);
}
```

---

## 📝 Vercel 部署日志

### 2024-02-22 - 修复 Serverless Function 语法问题

**问题描述：**
- 后端项目根路径和 API 端点无法访问，所有请求超时
- 简化的健康检查端点 `/health` 也无法访问

**根本原因：**
- 使用了 Next.js 特定语法（`NextRequest`、`NextResponse`），但这是 NestJS 项目
- Vercel 无法正确识别和运行这些函数

**解决方案：**
1. 修复 `server/_health.ts` - 使用标准 Vercel Serverless Function 语法
2. 修复 `server/api/index.ts` - 创建 API 入口
3. 创建 `server/api/_health.ts` - 创建 API 健康检查端点
4. 删除根目录的 `api/index.ts` - 前端项目不需要 Serverless Function

**修改的文件：**
- ✅ `server/_health.ts` - 修复语法
- ✅ `server/api/index.ts` - 创建 API 入口
- ✅ `server/api/_health.ts` - 创建 API 健康检查端点
- ❌ `api/index.ts` - 删除（前端项目不需要）

**预期的访问端点：**
- `GET /` - 根路径健康检查
- `GET /_health` - 简化的健康检查（不依赖 NestJS）
- `GET /api/` - API 入口
- `GET /api/_health` - API 健康检查（不依赖 NestJS）
- `GET /api/health` - NestJS 健康检查（可能较慢）

### 2024-02-22 - 部署配置修复

**问题描述：**
- Vercel 部署报错 `ENOENT: no such file or directory, open '/vercel/path0/package.json'`
- 前端和后端域名无法访问，`ERR_CONNECTION_TIMED_OUT`
- 前端构建卡在 "transforming..." 阶段

**解决方案：**
1. 修复 `.vercelignore` - 移除对 `package.json` 的排除
2. 移除 `regions: ["sin1"]` 配置 - 使用 Vercel 默认区域
3. 添加 Serverless Function 入口文件 - 解决根路径访问超时问题

**修改的文件：**
- ✅ `.vercelignore` - 移除对 `package.json` 的排除
- ✅ `vercel.json` - 移除 `regions` 配置
- ✅ `server/vercel.json` - 移除 `regions` 配置
- ✅ `server/index.ts` - 添加根路径处理器
- ✅ `server/_health.ts` - 添加简化健康检查端点

```
