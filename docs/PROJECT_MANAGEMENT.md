# 中医智能诊疗小程序 - 项目管理指南

## 📍 项目位置

### 开发环境
- **本地代码路径**: `/workspace/projects/`
- **项目名称**: coze-mini-program
- **技术栈**: Taro 4 + React + NestJS

---

## 📚 项目文档位置

### 核心文档（docs/ 目录）
```
docs/
├── DEPLOYMENT_GUIDE.md      # 📖 部署上线指南（最重要）
└── CHECKLIST.md             # ✅ 上线检查清单
```

### 配置文件
```
项目根目录/
├── design_guidelines.md           # 🎨 设计指南
├── README.md                     # 📋 项目说明
├── project.config.json           # 🔧 小程序配置
├── .env.production.example       # ⚙️ 环境变量示例
└── package.json                  # 📦 项目依赖
```

---

## 🔍 快速查询项目的方法

### 1. 查看项目文档
```bash
# 进入项目目录
cd /workspace/projects

# 查看部署指南
cat docs/DEPLOYMENT_GUIDE.md

# 查看上线检查清单
cat docs/CHECKLIST.md

# 查看设计指南
cat design_guidelines.md

# 查看项目说明
cat README.md
```

### 2. 查看项目结构
```bash
# 查看项目目录结构
tree -L 2 -I 'node_modules|dist|swc'

# 查看前端页面
ls src/pages/

# 查看后端模块
ls server/src/

# 查看配置文件
ls -la | grep -E '\.(json|md|env)'
```

### 3. 查看 API 接口文档
```bash
# 查看后端所有控制器
ls server/src/*/

# 查看具体接口
cat server/src/admin/admin.controller.ts    # 管理员接口
cat server/src/auth/auth.controller.ts      # 认证接口
cat server/src/medical-ai/medical-ai.controller.ts  # AI 医案接口
```

### 4. 查看 Git 版本历史
```bash
# 查看提交历史
cd /workspace/projects
git log --oneline -10

# 查看最近修改的文件
git status

# 查看文件修改历史
git log --follow -- filename
```

---

## 💾 项目备份和版本管理

### 方法 1：使用 Git（推荐）

#### 当前 Git 状态
```bash
# 查看当前分支
git branch

# 查看提交历史
git log --oneline

# 查看远程仓库
git remote -v
```

#### 推送到 GitHub/Gitee
```bash
# 1. 创建远程仓库（在 GitHub/Gitee 上创建）

# 2. 添加远程仓库
git remote add origin https://github.com/your-username/tcm-mini-program.git

# 3. 推送到远程仓库
git push -u origin main

# 4. 以后同步代码
git push origin main
```

#### 从远程仓库恢复
```bash
# 克隆项目
git clone https://github.com/your-username/tcm-mini-program.git

# 切换到项目目录
cd tcm-mini-program

# 安装依赖
pnpm install

# 启动开发环境
pnpm dev
```

### 方法 2：手动备份

#### 打包备份
```bash
# 进入项目目录
cd /workspace/projects

# 创建备份包
tar -czf tcm-mini-program-$(date +%Y%m%d).tar.gz \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.swc' \
    .

# 备份到其他位置
cp tcm-mini-program-$(date +%Y%m%d).tar.gz /backup/
```

#### 恢复备份
```bash
# 解压备份包
tar -xzf tcm-mini-program-20250214.tar.gz

# 安装依赖
pnpm install

# 启动开发环境
pnpm dev
```

---

## 🚀 快速启动项目

### 启动开发环境
```bash
cd /workspace/projects
pnpm dev
```

### 编译项目
```bash
# 编译小程序
pnpm build:weapp

# 编译后端
pnpm build:server
```

---

## 📋 项目功能清单

### 已实现功能
- ✅ 用户认证（登录/注册/扫码注册）
- ✅ 账户授权系统
- ✅ 千问大模型查询
- ✅ 自动识图功能
- ✅ 文档读取功能
- ✅ 支付充值功能
- ✅ 患者管理
- ✅ 病历管理
- ✅ 服药反馈
- ✅ 处方调整
- ✅ 账户管理
- ✅ 版本升级管理
- ✅ 用户反馈系统
- ✅ AI 医案推荐（历代名医医案）
- ✅ 管理员用户管理

### API 接口总览
| 模块 | 路径 | 功能 |
|------|------|------|
| 认证 | `/api/auth/*` | 登录、注册、授权 |
| 管理员 | `/api/admin/*` | 用户管理 |
| AI | `/api/medical-ai/*` | 医案推荐 |
| 反馈 | `/api/feedback/*` | 用户反馈 |
| 版本 | `/api/version/*` | 版本管理 |
| 支付 | `/api/payment/*` | 支付充值 |
| 患者 | `/api/patients/*` | 患者管理 |
| 病历 | `/api/medical-records/*` | 病历管理 |

---

## 🔧 常用命令速查

### 开发命令
```bash
pnpm dev              # 启动开发环境（前端+后端）
pnpm build:weapp      # 编译小程序
pnpm build:server     # 编译后端
pnpm lint:build       # ESLint 检查
pnpm tsc              # TypeScript 类型检查
```

### Git 命令
```bash
git status            # 查看状态
git log --oneline     # 查看历史
git add .             # 暂存所有文件
git commit -m "msg"   # 提交更改
git push origin main  # 推送到远程
```

### 查看命令
```bash
cat docs/DEPLOYMENT_GUIDE.md     # 查看部署指南
cat docs/CHECKLIST.md            # 查看检查清单
cat design_guidelines.md         # 查看设计指南
cat README.md                    # 查看项目说明
cat project.config.json          # 查看小程序配置
```

---

## 📞 如何联系和获取帮助

### 本地文档
- 📖 部署指南：`docs/DEPLOYMENT_GUIDE.md`
- ✅ 检查清单：`docs/CHECKLIST.md`
- 🎨 设计指南：`design_guidelines.md`
- 📋 项目说明：`README.md`

### Git 提交历史
```bash
# 查看所有开发记录
cd /workspace/projects
git log --oneline --all

# 查看某次提交的详细内容
git show <commit-hash>
```

### 代码结构查询
```bash
# 查看前端页面
ls -la src/pages/

# 查看后端模块
ls -la server/src/

# 查看配置文件
ls -la | grep -E '\.(json|md|env)'
```

---

## 🎯 下一步建议

### 1. 立即行动
- [ ] 将项目推送到 GitHub/Gitee
- [ ] 记录项目访问地址
- [ ] 备份重要文档

### 2. 后续开发
- [ ] 根据 `docs/CHECKLIST.md` 完善功能
- [ ] 根据 `docs/DEPLOYMENT_GUIDE.md` 部署上线
- [ ] 持续迭代优化

### 3. 团队协作
- [ ] 创建 GitHub/Gitee 仓库
- [ ] 邀请团队成员
- [ ] 建立开发规范

---

## 💡 重要提示

### 数据安全
- ⚠️ 定期备份代码
- ⚠️ 不要将 `.env` 文件提交到 Git
- ⚠️ 敏感信息使用环境变量

### 版本管理
- ✅ 使用 Git 管理版本
- ✅ 提交前先测试
- ✅ 编写有意义的提交信息

### 文档维护
- ✅ 更新部署指南
- ✅ 更新 API 文档
- ✅ 记录重要变更

---

## 📌 快速访问链接

| 名称 | 路径 | 说明 |
|------|------|------|
| 项目根目录 | `/workspace/projects/` | 所有代码在这里 |
| 部署指南 | `docs/DEPLOYMENT_GUIDE.md` | 上线部署参考 |
| 检查清单 | `docs/CHECKLIST.md` | 上线前检查 |
| 设计指南 | `design_guidelines.md` | UI 设计规范 |
| 项目说明 | `README.md` | 项目总体介绍 |

---

**🎉 现在你已经知道了如何查询和管理这个小程序！**

**下次需要查看项目时，只需记住这个路径：`/workspace/projects/`**
