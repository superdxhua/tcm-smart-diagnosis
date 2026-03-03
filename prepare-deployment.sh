#!/bin/bash

# Vercel + Render 快速部署准备脚本
# 此脚本帮助您快速准备部署所需的环境和配置

set -e

echo "🚀 Vercel + Render 快速部署准备脚本"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查必要的命令
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 未安装，请先安装${NC}"
        exit 1
    fi
}

echo "📋 检查必要工具..."
check_command node
check_command npm
check_command git
echo -e "${GREEN}✅ 所有必要工具已安装${NC}"
echo ""

# 生成 JWT Secret
echo "🔑 生成 JWT Secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${GREEN}✅ JWT Secret 已生成${NC}"
echo ""
echo "请在 Render 环境变量中设置："
echo -e "${YELLOW}JWT_SECRET=$JWT_SECRET${NC}"
echo ""

# 保存 JWT Secret 到文件
echo $JWT_SECRET > .jwt_secret
echo "JWT Secret 已保存到 .jwt_secret 文件"
echo ""

# 检查 Git 仓库
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Git 仓库已初始化${NC}"
else
    echo "📦 初始化 Git 仓库..."
    git init
    echo -e "${GREEN}✅ Git 仓库已初始化${NC}"
fi

echo ""
echo "📝 部署前检查清单："
echo "======================================"
echo ""

# 检查必要文件
FILES_TO_CHECK=(
    "vercel.json"
    "package.json"
    "server/package.json"
    "DEPLOYMENT_VERCEL_RENDER.md"
    "DEPLOYMENT_CHECKLIST.md"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file 缺失${NC}"
    fi
done

echo ""
echo "🔧 环境变量配置："
echo "======================================"
echo ""
echo "在 Render 中需要配置以下环境变量："
echo ""
echo -e "${YELLOW}SUPABASE_URL${NC}"
echo "  从 Supabase Dashboard → Settings → API 获取"
echo ""
echo -e "${YELLOW}SUPABASE_SERVICE_ROLE_KEY${NC}"
echo "  从 Supabase Dashboard → Settings → API 获取"
echo ""
echo -e "${YELLOW}COZE_API_KEY${NC}"
echo "  从 Coze Dashboard → API Management 获取"
echo ""
echo -e "${YELLOW}COZE_API_SECRET${NC}"
echo "  从 Coze Dashboard → API Management 获取"
echo ""
echo -e "${YELLOW}JWT_SECRET${NC}"
echo "  已生成：$JWT_SECRET"
echo ""

# 创建 .env.local.example
echo "📝 创建 .env.local.example 文件..."
cat > .env.local.example <<EOF
# Supabase 配置
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Coze AI 配置
COZE_API_KEY=your_coze_api_key
COZE_API_SECRET=your_coze_api_secret

# JWT 配置
JWT_SECRET=$JWT_SECRET

# 其他配置
NODE_ENV=development
PORT=3000
PROJECT_DOMAIN=http://localhost:3000
EOF

echo -e "${GREEN}✅ .env.local.example 已创建${NC}"
echo ""

# 创建 GitHub Actions 工作流
echo "📝 创建 GitHub Actions 工作流（定时 Ping 后端）..."
mkdir -p .github/workflows
cat > .github/workflows/keep-alive.yml <<EOF
name: Keep Render Warm

on:
  schedule:
    - cron: '*/10 * * * *'  # 每 10 分钟执行一次

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping API
        run: |
          curl https://tcm-smart-diagnosis-api.onrender.com
EOF

echo -e "${GREEN}✅ GitHub Actions 工作流已创建${NC}"
echo ""

# 添加到 .gitignore
if [ ! -f ".gitignore" ]; then
    echo ".jwt_secret" > .gitignore
    echo ".env.local" >> .gitignore
    echo -e "${GREEN}✅ 已创建 .gitignore${NC}"
else
    if ! grep -q ".jwt_secret" .gitignore 2>/dev/null; then
        echo ".jwt_secret" >> .gitignore
        echo ".env.local" >> .gitignore
        echo -e "${GREEN}✅ 已更新 .gitignore${NC}"
    fi
fi

echo ""
echo "🎉 准备完成！"
echo "======================================"
echo ""
echo "生成的文件："
echo "- .jwt_secret (JWT Secret)"
echo "- .env.local.example (环境变量模板)"
echo "- .github/workflows/keep-alive.yml (定时 Ping 工作流)"
echo ""
echo "文档："
echo "- DEPLOYMENT_VERCEL_RENDER.md (完整部署指南)"
echo "- DEPLOYMENT_CHECKLIST.md (部署检查清单)"
echo "- DEPLOYMENT_QUICK_REFERENCE.md (快速参考)"
echo ""
echo "下一步："
echo "1. 查看 DEPLOYMENT_CHECKLIST.md 按步骤操作"
echo "2. 推送代码到 GitHub"
echo "3. 在 Vercel 和 Render 部署项目"
echo ""
echo -e "${GREEN}祝部署顺利！🚀${NC}"
