#!/bin/bash

# Vercel 快速部署脚本
# 使用方法：bash deploy-to-vercel.sh

echo "=========================================="
echo "  Vercel 快速部署脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}正在安装 Vercel CLI...${NC}"
    npm install -g vercel
fi

# 检查是否已登录
echo -e "${YELLOW}检查 Vercel 登录状态...${NC}"
vercel whoami &> /dev/null

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}请先登录 Vercel...${NC}"
    vercel login
fi

# 检查是否有 .env 文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}创建 .env 文件...${NC}"
    cat > .env << EOF
# Vercel 环境变量
NODE_ENV=production
EOF
fi

# 检查 Git 仓库
if [ ! -d .git ]; then
    echo -e "${YELLOW}初始化 Git 仓库...${NC}"
    git init
    git add .
    git commit -m "Initial commit"
    echo -e "${GREEN}✓ Git 仓库已初始化${NC}"
else
    echo -e "${GREEN}✓ Git 仓库已存在${NC}"
fi

# 检查远程仓库
if ! git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}请设置 GitHub 远程仓库...${NC}"
    echo -e "${YELLOW}步骤：${NC}"
    echo "1. 在 GitHub 上创建新仓库"
    echo "2. 运行：git remote add origin https://github.com/你的用户名/仓库名.git"
    echo "3. 运行：git push -u origin main"
    echo ""
    echo -e "${RED}请先设置远程仓库，然后再运行此脚本${NC}"
    exit 1
fi

# 推送代码
echo -e "${YELLOW}推送代码到 GitHub...${NC}"
git push -u origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}推送失败！请检查网络连接${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 代码已推送到 GitHub${NC}"

# 部署到 Vercel
echo ""
echo -e "${YELLOW}开始部署到 Vercel...${NC}"
echo ""

vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo "  🎉 部署成功！"
    echo "=========================================="
    echo ""
    echo -e "${GREEN}✓ 你的网站已成功部署到 Vercel${NC}"
    echo ""
    echo "访问地址："
    echo "  - 首页：https://你的项目名.vercel.app"
    echo "  - 下载页：https://你的项目名.vercel.app/pages/download/index"
    echo ""
    echo "手机访问："
    echo "  直接在手机浏览器输入上述地址"
    echo ""
    echo "下一步："
    echo "  1. 访问 Vercel 控制台查看部署详情"
    echo "  2. 配置自定义域名（可选）"
    echo "  3. 在手机上添加到主屏幕（获得 APP 体验）"
    echo ""
else
    echo ""
    echo -e "${RED}=========================================="
    echo "  ❌ 部署失败"
    echo "=========================================="
    echo ""
    echo "请检查错误信息并重试"
    echo ""
    exit 1
fi
