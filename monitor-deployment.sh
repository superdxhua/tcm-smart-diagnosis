#!/bin/bash

# Vercel 部署监控脚本

echo "=== Vercel 部署监控 ==="
echo ""

API_URL="https://zhongyi-smart.vercel.app/api/health"
FRONTEND_URL="https://zhongyi-smart.vercel.app/"

echo "测试 API 端点: $API_URL"
echo ""

for i in {1..10}; do
    echo "[$i/10] 测试 API..."
    RESPONSE=$(curl -s -m 10 -w "\n%{http_code}" "$API_URL" 2>&1)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ API 正常响应 (HTTP 200)"
        echo "响应内容: $BODY"
        echo ""
        echo "测试前端页面: $FRONTEND_URL"
        FRONTEND_RESPONSE=$(curl -s -m 10 -w "\n%{http_code}" "$FRONTEND_URL" 2>&1)
        FRONTEND_CODE=$(echo "$FRONTEND_RESPONSE" | tail -n1)
        FRONTEND_BODY=$(echo "$FRONTEND_RESPONSE" | sed '$d')

        if [ "$FRONTEND_CODE" = "200" ]; then
            echo "✅ 前端页面正常响应 (HTTP 200)"
            echo "前 100 字符: $(echo "$FRONTEND_BODY" | head -c 100)"
            echo ""
            echo "=== 部署成功！==="
            exit 0
        else
            echo "⚠️ 前端页面响应异常 (HTTP $FRONTEND_CODE)"
        fi
        exit 0
    else
        echo "❌ API 响应异常 (HTTP $HTTP_CODE)"
        echo "等待 30 秒后重试..."
        sleep 30
    fi
done

echo ""
echo "=== 10 次测试后 API 仍未正常响应 ==="
echo "请访问 Vercel Dashboard 查看部署日志："
echo "https://vercel.com/superdxhuas-projects/zhongyi-smart/deployments"
echo ""
echo "可能的原因："
echo "1. 构建失败"
echo "2. 环境变量未配置"
echo "3. 构建超时"
echo "4. 依赖安装失败"
echo ""
echo "建议操作："
echo "1. 检查 Vercel Dashboard 中的部署日志"
echo "2. 确认环境变量已正确配置（COZE_SUPABASE_URL, COZE_SUPABASE_ANON_KEY）"
echo "3. 检查构建脚本是否正确"
