#!/bin/bash

# Vercel CLI 部署脚本
# 使用此脚本通过 Git 集成部署项目到 Vercel

echo "=== Vercel 部署脚本 ==="
echo ""

# 检查 Git 状态
echo "1. 检查 Git 状态..."
git status

echo ""
echo "2. 检查是否有未提交的更改..."
if [ -n "$(git status --porcelain)" ]; then
    echo "发现未提交的更改："
    git status --short
    echo ""
    echo "是否提交这些更改？(y/n)"
    read -r response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        echo "请输入提交信息："
        read -r commit_message
        git add .
        git commit -m "$commit_message"
    else
        echo "跳过提交"
    fi
else
    echo "没有未提交的更改"
fi

echo ""
echo "3. 推送到远程仓库（触发 Vercel 部署）..."
git push

echo ""
echo "4. 部署状态"
echo "请访问以下链接查看部署状态："
echo "https://vercel.com/superdxhuas-projects/zhongyi-smart/deployments"
echo ""

echo "5. 测试部署"
echo "前端：https://zhongyi-smart.vercel.app/"
echo "API：https://zhongyi-smart.vercel.app/api/health"
echo ""

echo "=== 部署脚本完成 ==="
