#!/bin/bash

# Vercel 部署测试脚本

DOMAIN="https://tcmsmarthealth.com"
API_URL="$DOMAIN/api/auth/login"

echo "=================================="
echo "Vercel 部署测试脚本"
echo "=================================="
echo "测试域名: $DOMAIN"
echo ""

# 1. 测试前端页面
echo "1. 测试前端页面..."
echo "   URL: $DOMAIN"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$DOMAIN")
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "✅ 前端页面正常 (HTTP 200)"
else
  echo "❌ 前端页面异常 (HTTP $FRONTEND_STATUS)"
fi
echo ""

# 2. 测试 OPTIONS 预检请求
echo "2. 测试 OPTIONS 预检请求..."
echo "   URL: $API_URL"
echo "   Method: OPTIONS"
echo ""

OPTIONS_RESPONSE=$(curl -s -i -X OPTIONS \
  -H "Origin: $DOMAIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  --max-time 10 \
  "$API_URL")

OPTIONS_STATUS=$(echo "$OPTIONS_RESPONSE" | grep -i "^HTTP/" | awk '{print $2}')

echo "   响应状态: $OPTIONS_STATUS"

if [ "$OPTIONS_STATUS" = "204" ]; then
  echo "   ✅ OPTIONS 状态码正确"
else
  echo "   ❌ OPTIONS 状态码错误 (应该是 204)"
fi

# 检查 CORS 头
echo ""
echo "   检查 CORS 响应头..."

if echo "$OPTIONS_RESPONSE" | grep -iq "access-control-allow-origin"; then
  ORIGIN=$(echo "$OPTIONS_RESPONSE" | grep -i "access-control-allow-origin:" | cut -d':' -f2- | tr -d '\r')
  echo "   ✅ Access-Control-Allow-Origin: $ORIGIN"
else
  echo "   ❌ 缺少 Access-Control-Allow-Origin"
fi

if echo "$OPTIONS_RESPONSE" | grep -iq "access-control-allow-methods"; then
  METHODS=$(echo "$OPTIONS_RESPONSE" | grep -i "access-control-allow-methods:" | cut -d':' -f2- | tr -d '\r')
  echo "   ✅ Access-Control-Allow-Methods: $METHODS"
else
  echo "   ❌ 缺少 Access-Control-Allow-Methods"
fi

if echo "$OPTIONS_RESPONSE" | grep -iq "access-control-allow-headers"; then
  HEADERS=$(echo "$OPTIONS_RESPONSE" | grep -i "access-control-allow-headers:" | cut -d':' -f2- | tr -d '\r')
  echo "   ✅ Access-Control-Allow-Headers: $HEADERS"
else
  echo "   ❌ 缺少 Access-Control-Allow-Headers"
fi

if echo "$OPTIONS_RESPONSE" | grep -iq "access-control-allow-credentials"; then
  CREDENTIALS=$(echo "$OPTIONS_RESPONSE" | grep -i "access-control-allow-credentials:" | cut -d':' -f2- | tr -d '\r')
  echo "   ✅ Access-Control-Allow-Credentials: $CREDENTIALS"
else
  echo "   ❌ 缺少 Access-Control-Allow-Credentials"
fi

echo ""

# 3. 测试 POST 登录请求
echo "3. 测试 POST 登录请求..."
echo "   URL: $API_URL"
echo "   Method: POST"
echo "   Body: { username: 'admin', password: '123456' }"
echo ""

LOGIN_RESPONSE=$(curl -s -i -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: $DOMAIN" \
  -d '{"username":"admin","password":"123456"}' \
  --max-time 10 \
  "$API_URL")

LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | grep -i "^HTTP/" | awk '{print $2}')
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '1,/^$/d')

echo "   响应状态: $LOGIN_STATUS"

if [ "$LOGIN_STATUS" = "200" ]; then
  echo "   ✅ POST 状态码正确"

  # 检查响应体
  echo ""
  echo "   响应体:"
  echo "$LOGIN_BODY" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_BODY"

  # 检查是否包含 token
  if echo "$LOGIN_BODY" | grep -q "token"; then
    echo ""
    echo "   ✅ 响应包含 token"
  else
    echo ""
    echo "   ❌ 响应缺少 token"
  fi

  # 检查是否包含 user
  if echo "$LOGIN_BODY" | grep -q "user"; then
    echo "   ✅ 响应包含 user 信息"
  else
    echo "   ❌ 响应缺少 user 信息"
  fi
else
  echo "   ❌ POST 状态码错误 (应该是 200)"
  echo ""
  echo "   响应体:"
  echo "$LOGIN_BODY"
fi

echo ""
echo "=================================="
echo "测试完成"
echo "=================================="
echo ""

# 4. 诊断建议
echo "诊断建议："
echo ""

if [ "$OPTIONS_STATUS" != "204" ] || ! echo "$OPTIONS_RESPONSE" | grep -iq "access-control-allow-methods"; then
  echo "⚠️  CORS 预检请求处理有问题"
  echo "   可能原因："
  echo "   - Vercel 还没有重新部署最新代码"
  echo "   - vercel.json 配置没有生效"
  echo "   解决方案："
  echo "   - 检查 Vercel Dashboard 中的 Functions 日志"
  echo "   - 等待 Vercel 重新部署完成（通常需要 1-2 分钟）"
  echo "   - 清除 Vercel 缓存：在 Vercel Dashboard 中点击 'Redeploy'"
  echo ""
fi

if [ "$LOGIN_STATUS" != "200" ]; then
  echo "⚠️  登录 API 不工作"
  echo "   可能原因："
  echo "   - 数据库连接问题"
  echo "   - 环境变量未配置"
  echo "   解决方案："
  echo "   - 检查 Vercel Dashboard 中的环境变量"
  echo "   - 检查 Functions 日志查看错误信息"
  echo ""
fi

if [ "$OPTIONS_STATUS" = "204" ] && [ "$LOGIN_STATUS" = "200" ]; then
  echo "✅ 所有测试通过！登录功能应该正常工作"
  echo ""
  echo "下一步："
  echo "   1. 在浏览器中访问 $DOMAIN"
  echo "   2. 使用管理员账号登录：admin / 123456"
  echo "   3. 测试完整的登录流程"
fi
