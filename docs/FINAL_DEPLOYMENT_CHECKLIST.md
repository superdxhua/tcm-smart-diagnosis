# 部署前最终检查清单

## ✅ 前置检查

### 1. 代码准备
- [x] 所有代码已提交到 Git
- [x] PWA 图标已生成（`public/icons/` 目录下有 10 个尺寸的图标）
- [x] `.env` 文件已配置正确的环境变量（特别是 `COZE_SUPABASE_URL` 和 `COZE_SUPABASE_ANON_KEY`）
- [x] `.env.example` 文件已更新为正确的环境变量名称

### 2. 依赖检查
- [x] 前端依赖完整（`package.json`）
- [x] 后端依赖完整（`server/package.json`）
- [x] 前端可以成功构建（输出到 `dist-web/` 目录）
- [x] `package.json` 中的 `build:web` 命令已更新为：`taro build --type h5`

### 3. 构建配置
- [x] `vercel.json` 配置正确：
  - `buildCommand`: `npm run build:web`
  - `installCommand`: `npm install --legacy-peer-deps`
  - `outputDirectory`: `dist-web` ⚠️ 重要！
- [x] `src/app.ts` 已重命名为 `src/app.tsx`（解决 JSX 解析问题）
- [x] `src/app.tsx` 使用 React.createElement 语法（避免 babel 解析错误）

---

## 🚀 部署步骤

### 阶段 1：推送代码到 GitHub（手动操作）

```bash
# 1. 添加所有更改
git add .

# 2. 提交更改
git commit -m "feat: 完成部署前检查，准备上线"

# 3. 推送到 GitHub
git push origin main
```

**注意**：由于环境限制，可能需要手动在本地执行以上命令。

---

### 阶段 2：配置 Supabase 数据库（可选，如果已有数据库可跳过）

#### 2.1 创建 Supabase 项目

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 输入项目信息：
   - **Project Name**: `tcm-smart-diagnosis`
   - **Database Password**: 设置强密码并保存
   - **Region**: 选择 `Singapore`（或离用户最近的区域）
4. 等待项目创建完成（约 2 分钟）

#### 2.2 获取数据库连接信息

在 Supabase Dashboard 中：
1. 进入项目的 **Settings → API**
2. 复制以下信息：
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJhbGci...`（以 `eyJ` 开头的长字符串）
   - **service_role key**: `eyJhbGci...`（拥有最高权限，请妥善保管）

#### 2.3 创建数据库表

使用以下 SQL 脚本创建必要的表：

```sql
-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  remaining_days INTEGER DEFAULT 3,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 处方风控表
CREATE TABLE IF NOT EXISTS prescription_safety_check (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID REFERENCES medical_records(id),
  toxic_ingredients TEXT[],
  contraindications TEXT[],
  pregnancy_warnings TEXT[],
  risk_level VARCHAR(20),
  check_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 病例表
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  patient_id UUID REFERENCES patients(id),
  prescription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 医案表
CREATE TABLE IF NOT EXISTS medical_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  source VARCHAR(100),
  symptoms TEXT[],
  diagnosis TEXT,
  prescription TEXT,
  dosage TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 充值订单表
CREATE TABLE IF NOT EXISTS recharge_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  days INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  proof_image_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 套餐表
CREATE TABLE IF NOT EXISTS recharge_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  days INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2.4 初始化套餐数据

```sql
-- 插入默认套餐
INSERT INTO recharge_packages (name, amount, days, description) VALUES
  ('体验包', 10.00, 10, '10天使用期，适合初次体验'),
  ('月度套餐', 30.00, 30, '30天使用期，性价比最高'),
  ('季度套餐', 80.00, 90, '90天使用期，超值优惠'),
  ('年度套餐', 280.00, 365, '365天使用期，最划算');
```

---

### 阶段 3：部署到 Render（后端 API）

#### 3.1 创建 Render 服务

1. 登录 [Render Dashboard](https://dashboard.render.com/)
2. 点击 "New +"
3. 选择 "Web Service"
4. 连接 GitHub 仓库：`superdxhua/tcm-smart-diagnosis`

#### 3.2 配置 Build & Deploy

**配置详情**：

- **Name**: `tcm-api`
- **Region**: `Singapore`（或离用户最近的区域）
- **Root Directory**: `server` ⚠️ 重要！
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `npm install && npx @nestjs/cli build`
- **Start Command**: `node dist/main`

**实例类型**：
- **Type**: `Free`
- **Instance Type**: `Standard`
- **RAM**: 512 MB
- **CPU**: 0.1

**环境变量**（在 Render Dashboard 的 Environment Variables 中设置）：

```bash
NODE_ENV=production
PORT=3000

# Supabase 配置
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key-here

# JWT 配置
JWT_SECRET=your-jwt-secret-key-here

# 商户收款码配置
MERCHANT_QR_CODE=https://your-qr-code-url.com/qr.png
MERCHANT_NAME=中医智能诊疗
```

#### 3.3 等待部署完成

- 部署通常需要 2-5 分钟
- 部署成功后，Render 会提供一个 URL，例如：`https://tcm-api.onrender.com`
- 记录这个 URL，稍后配置前端时需要用到

#### 3.4 测试 API

```bash
# 测试 API 健康检查
curl https://tcm-api.onrender.com/api

# 应该返回类似以下内容：
# {"message":"Hello World"}
```

---

### 阶段 4：部署到 Vercel（前端 H5）

#### 4.1 创建 Vercel 项目

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入 GitHub 仓库：`superdxhua/tcm-smart-diagnosis`

#### 4.2 配置项目

**配置详情**：

- **Project Name**: `tcm-smart-diagnosis`（或自定义）
- **Framework Preset**: `Other`
- **Root Directory**: `./`
- **Build Command**: `npm install --legacy-peer-deps && npm run build:web`
- **Output Directory**: `dist-web` ⚠️ 重要！

**环境变量**（在 Vercel Dashboard 的 Environment Variables 中设置）：

```bash
NODE_ENV=production

# 项目域名（后端 API 地址）
PROJECT_DOMAIN=https://tcm-api.onrender.com
```

#### 4.3 等待部署完成

- 部署通常需要 1-3 分钟
- 部署成功后，Vercel 会提供一个 URL，例如：`https://tcm-smart-diagnosis.vercel.app`

#### 4.4 测试前端

1. 访问 Vercel 提供的 URL
2. 检查页面是否正常加载
3. 尝试登录功能（使用测试账号）
4. 检查 API 请求是否正常（打开浏览器开发者工具 → Network）

---

### 阶段 5：配置自定义域名（可选）

#### 5.1 配置 Vercel 自定义域名

1. 在 Vercel Dashboard 中进入项目设置
2. 选择 "Domains"
3. 添加自定义域名（例如：`tcm.yourdomain.com`）
4. 按照提示配置 DNS 记录

#### 5.2 配置 Render 自定义域名

1. 在 Render Dashboard 中进入服务设置
2. 选择 "Custom Domains"
3. 添加自定义域名（例如：`api.yourdomain.com`）
4. 按照提示配置 DNS 记录

---

## 🧪 部署后验证

### 1. 前端验证

- [ ] 访问前端 URL，页面正常加载
- [ ] 登录功能正常
- [ ] 智能诊疗功能正常
- [ ] 充值页面正常显示收款二维码
- [ ] 管理员页面正常访问（使用管理员账号）

### 2. 后端验证

- [ ] API 健康检查正常（`/api`）
- [ ] 用户注册/登录接口正常
- [ ] 充值订单创建接口正常
- [ ] 管理员审核订单接口正常

### 3. PWA 功能验证

- [ ] 在 Android Chrome 中访问，显示"添加到主屏幕"提示
- [ ] 在 iOS Safari 中访问，可以手动添加到主屏幕
- [ ] 添加到主屏幕后，应用全屏显示
- [ ] 离线时，已缓存页面可以访问

### 4. Supabase 数据库验证

- [ ] 可以正常连接数据库
- [ ] 用户数据正确存储
- [ ] 订单数据正确存储
- [ ] 充值套餐正确显示

---

## 📋 重要注意事项

### 1. 免费资源限制

**Vercel（前端）**：
- ✅ 免费 SSL 证书
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 100 GB 带宽/月
- ⚠️ 部署时间限制（最短 60 秒启动）

**Render（后端）**：
- ✅ 免费 SSL 证书
- ✅ 自动 HTTPS
- ⚠️ 休眠机制（15 分钟无请求后休眠，首次访问需要 30 秒启动）
- ⚠️ 750 小时运行时间/月
- ⚠️ 512 MB RAM

**Supabase（数据库）**：
- ✅ 免费 500 MB 数据库存储
- ✅ 免费 1 GB 文件存储
- ✅ 免费 2 GB 带宽/月
- ✅ 50,000 月活跃用户（MAU）

### 2. 性能优化建议

- 使用 Redis 缓存（可选，升级到付费版）
- 配置 CDN 加速（Vercel 已自动配置）
- 优化图片加载（使用 WebP 格式）
- 启用 Gzip 压缩（已配置）

### 3. 安全建议

- 定期更新依赖包
- 使用强密码和密钥
- 启用双因素认证
- 定期备份数据库
- 监控 API 访问日志

### 4. 监控和日志

**Vercel**：
- 查看 Dashboard 中的部署日志
- 查看 Analytics 了解访问情况

**Render**：
- 查看 Dashboard 中的服务日志
- 查看 Metrics 了解性能情况

**Supabase**：
- 查看 Dashboard 中的数据库日志
- 查看 Database Insights 了解性能情况

---

## 🆘 常见问题

### Q1: Render 服务无法启动

**可能原因**：
- 环境变量未正确配置
- 构建失败（依赖冲突）

**解决方案**：
1. 检查环境变量是否正确
2. 查看 Build Log 中的错误信息
3. 确认 `package.json` 中的依赖版本正确

### Q2: Vercel 部署失败

**可能原因**：
- Output Directory 配置错误
- 构建命令配置错误

**解决方案**：
1. 确认 Output Directory 为 `dist-web`（不是 `dist/h5`）
2. 确认 Build Command 为 `npm install --legacy-peer-deps && npm run build:web`
3. 查看构建日志中的错误信息

### Q3: 前端无法连接后端 API

**可能原因**：
- CORS 未正确配置
- API URL 错误
- 环境变量未正确设置

**解决方案**：
1. 检查后端的 CORS 配置（`server/src/main.ts`）
2. 确认 `PROJECT_DOMAIN` 环境变量正确
3. 检查网络请求的 URL 是否正确

### Q4: Supabase 连接失败

**可能原因**：
- 环境变量未正确配置
- 数据库表未创建

**解决方案**：
1. 确认 `COZE_SUPABASE_URL` 和 `COZE_SUPABASE_ANON_KEY` 正确
2. 使用 SQL 脚本创建必要的表
3. 检查 Supabase Dashboard 中的连接信息

---

## 📞 获取帮助

如果遇到问题，请按照以下顺序排查：

1. 查看部署日志（Vercel / Render Dashboard）
2. 查看浏览器控制台错误信息
3. 查看本文档的"常见问题"部分
4. 查看 `docs/DEPLOYMENT_FAQ.md` 获取更多帮助
5. 查看 `docs/DEPLOYMENT_GUIDE.md` 获取详细步骤

---

## ✨ 部署成功后

恭喜！您的中医智能诊疗应用已成功部署！

**下一步**：

1. 分享链接给用户测试
2. 收集用户反馈
3. 监控应用性能
4. 根据需求迭代优化

**重要提醒**：

- 定期更新依赖包
- 定期备份数据库
- 监控资源使用情况
- 根据用户增长情况考虑升级到付费计划

---

**文档版本**: v1.0.0
**最后更新**: 2024-02-20
