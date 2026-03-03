# ✅ 部署检查清单 - 技术小白专用

## 📋 使用说明

**每完成一步，就在后面的方框里打勾 [✅]**

**如果您不确定某一步是否完成，可以重新查看详细指南：`DEPLOYMENT_FOR_BEGINNERS.md`**

---

## 第一阶段：注册账号（5 分钟）

- [ ] 1. 注册 GitHub 账号
  - 网址：https://github.com
  - 状态：________________________
  - 用户名：________________________

- [ ] 2. 注册 Supabase 账号
  - 网址：https://supabase.com
  - 状态：________________________

- [ ] 3. 注册 Coze 账号
  - 网址：https://www.coze.cn
  - 状态：________________________

---

## 第二阶段：获取 API 密钥（15 分钟）

- [ ] 1. 在 Supabase 创建项目
  - 项目名称：tcm-smart-diagnosis
  - 区域：Singapore
  - 状态：________________________

- [ ] 2. 获取 Supabase Project URL
  - URL：https://________________________.supabase.co
  - 状态：________________________

- [ ] 3. 获取 Supabase Service Role Key
  - Key：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - 状态：________________________

- [ ] 4. 获取 Coze API Key
  - Key：pat_xxxxxxxxxxxxxxxxxxxxxx
  - 状态：________________________

- [ ] 5. 获取 Coze API Secret
  - Secret：xxxxxxxxxxxxxxxxxxxxx
  - 状态：________________________

- [ ] 6. 确认 JWT Secret（已自动生成）
  - Secret：d9d090349fd94264e1a768711553413ee69927809b78382413ed23e2b674a985
  - 状态：________________________

---

## 第三阶段：创建 GitHub 仓库并推送代码（10 分钟）

- [ ] 1. 在 GitHub 创建仓库
  - 仓库名称：tcm-smart-diagnosis
  - 可见性：Private
  - 状态：________________________

- [ ] 2. 打开命令行
  - Windows: 按 Win + R，输入 cmd
  - Mac: 按 Command + Space，输入 Terminal
  - 状态：________________________

- [ ] 3. 进入项目文件夹
  - 命令：cd /workspace/projects（或您的实际路径）
  - 状态：________________________

- [ ] 4. 添加所有文件
  - 命令：git add .
  - 状态：________________________

- [ ] 5. 提交代码
  - 命令：git commit -m "准备部署到 Vercel + Render"
  - 状态：________________________

- [ ] 6. 添加远程仓库（替换您的用户名）
  - 命令：git remote add origin https://github.com/您的用户名/tcm-smart-diagnosis.git
  - 状态：________________________

- [ ] 7. 推送代码
  - 命令：git branch -M main && git push -u origin main
  - 状态：________________________

- [ ] 8. 验证推送成功
  - 刷新 GitHub 仓库页面
  - 能看到项目文件
  - 状态：________________________

---

## 第四阶段：部署后端到 Render（20 分钟）

- [ ] 1. 注册 Render 账号
  - 网址：https://render.com
  - 状态：________________________

- [ ] 2. 创建 Web Service
  - 点击 New + → Web Service
  - 状态：________________________

- [ ] 3. 连接 GitHub 仓库
  - 选择 tcm-smart-diagnosis 仓库
  - 状态：________________________

- [ ] 4. 配置基本信息
  - Name: tcm-smart-diagnosis-api
  - Region: Singapore（重要！）
  - Branch: main
  - Runtime: Node
  - 状态：________________________

- [ ] 5. 配置构建
  - Root Directory: server
  - Build Command: npm install && npm run build
  - Start Command: npm run start:prod
  - Instance Type: Free
  - 状态：________________________

- [ ] 6. 添加环境变量 SUPABASE_URL
  - Key: SUPABASE_URL
  - Value: https://________________________.supabase.co
  - 状态：________________________

- [ ] 7. 添加环境变量 SUPABASE_SERVICE_ROLE_KEY
  - Key: SUPABASE_SERVICE_ROLE_KEY
  - Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - 状态：________________________

- [ ] 8. 添加环境变量 COZE_API_KEY
  - Key: COZE_API_KEY
  - Value: pat_xxxxxxxxxxxxxxxxxxxxxx
  - 状态：________________________

- [ ] 9. 添加环境变量 COZE_API_SECRET
  - Key: COZE_API_SECRET
  - Value: xxxxxxxxxxxxxxxxxxxxxx
  - 状态：________________________

- [ ] 10. 添加环境变量 JWT_SECRET
  - Key: JWT_SECRET
  - Value: d9d090349fd94264e1a768711553413ee69927809b78382413ed23e2b674a985
  - 状态：________________________

- [ ] 11. 添加环境变量 NODE_ENV（可选）
  - Key: NODE_ENV
  - Value: production
  - 状态：________________________

- [ ] 12. 添加环境变量 PORT（可选）
  - Key: PORT
  - Value: 3000
  - 状态：________________________

- [ ] 13. 检查所有配置
  - 基本信息、构建配置、环境变量都正确
  - 状态：________________________

- [ ] 14. 创建 Web Service
  - 点击 Create Web Service
  - 状态：________________________

- [ ] 15. 等待构建完成
  - 等待 3-5 分钟
  - 状态：________________________

- [ ] 16. 验证部署成功
  - 状态变为 Live（绿色）
  - 状态：________________________

- [ ] 17. 记录 Render 后端地址
  - URL: https://tcm-smart-diagnosis-api.onrender.com
  - 状态：________________________

- [ ] 18. 测试后端
  - 在浏览器打开后端地址
  - 显示 {"status":"ok"}
  - 状态：________________________

---

## 第五阶段：部署前端到 Vercel（15 分钟）

- [ ] 1. 注册 Vercel 账号
  - 网址：https://vercel.com
  - 状态：________________________

- [ ] 2. 导入 GitHub 仓库
  - 点击 Add New + → Project
  - 选择 tcm-smart-diagnosis
  - 状态：________________________

- [ ] 3. 配置项目设置
  - Framework Preset: Other
  - Build Command: pnpm install && pnpm build:web
  - Output Directory: dist-web
  - Install Command: pnpm install
  - 状态：________________________

- [ ] 4. 添加环境变量 PROJECT_DOMAIN
  - Name: PROJECT_DOMAIN
  - Value: https://tcm-smart-diagnosis-api.onrender.com
  - Environment: Production, Preview, Development
  - 状态：________________________

- [ ] 5. 检查所有配置
  - 构建配置、环境变量都正确
  - 状态：________________________

- [ ] 6. 开始部署
  - 点击 Deploy
  - 状态：________________________

- [ ] 7. 等待构建完成
  - 等待 2-3 分钟
  - 状态：________________________

- [ ] 8. 验证部署成功
  - 显示绿色勾号
  - 状态：________________________

- [ ] 9. 记录 Vercel 前端地址
  - URL: https://tcm-smart-diagnosis.vercel.app
  - 状态：________________________

---

## 第六阶段：测试部署（10 分钟）

- [ ] 1. 测试前端页面
  - 在浏览器打开 Vercel 前端地址
  - 页面正常加载
  - 状态：________________________

- [ ] 2. 测试注册功能
  - 点击注册按钮
  - 填写：用户名 testuser，密码 123456
  - 提示注册成功
  - 状态：________________________

- [ ] 3. 测试登录功能
  - 输入用户名 testuser，密码 123456
  - 提示登录成功
  - 状态：________________________

- [ ] 4. 测试创建患者
  - 点击智能健康咨询
  - 添加患者
  - 填写姓名、性别、年龄
  - 保存成功
  - 状态：________________________

- [ ] 5. 测试智能健康咨询
  - 选择患者
  - 填写症状信息
  - 点击生成健康方案
  - AI 问询正常
  - 生成处方
  - 状态：________________________

---

## 🎉 完成检查

### 重要信息汇总

- [ ] GitHub 仓库地址已保存
  - URL: https://github.com/________________________/tcm-smart-diagnosis.git
  - 状态：________________________

- [ ] Supabase 密钥已保存
  - Project URL: https://________________________.supabase.co
  - Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - 状态：________________________

- [ ] Coze 密钥已保存
  - API Key: pat_xxxxxxxxxxxxxxxxxxxxxx
  - API Secret: xxxxxxxxxxxxxxxxxxxxxx
  - 状态：________________________

- [ ] 部署地址已保存
  - Vercel 前端: https://tcm-smart-diagnosis.vercel.app
  - Render 后端: https://tcm-smart-diagnosis-api.onrender.com
  - 状态：________________________

---

## 📊 进度统计

**总步骤数**：58 步

**已完成**：____ 步

**剩余**：____ 步

**完成率**：____ %

---

## 🔍 常见问题自查

如果遇到问题，请检查：

- [ ] GitHub 密码是否正确
  - 状态：________________________

- [ ] Root Directory 是否为 server
  - 状态：________________________

- [ ] Region 是否为 Singapore
  - 状态：________________________

- [ ] 所有环境变量是否已配置
  - 数量：7 个
  - 状态：________________________

- [ ] PROJECT_DOMAIN 是否正确
  - 状态：________________________

---

## 💪 鼓励的话

**您已经完成了 ____ %！**

**继续加油！只要按照指南一步步来，您一定能成功！**

**遇到问题不要慌，仔细检查每一步，或者重新查看详细指南。**

**相信您一定能完成部署！** 🎉

---

## 📝 备注

**遇到的问题记录**：

1. 问题：________________________
   解决方法：________________________

2. 问题：________________________
   解决方法：________________________

3. 问题：________________________
   解决方法：________________________

---

**祝您部署顺利！** 🚀
