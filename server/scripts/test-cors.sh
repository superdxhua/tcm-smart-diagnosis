#!/bin/bash

# CORS 配置测试脚本
# 用于验证修复后的 CORS 配置是否正确

set -e

echo "========================================"
echo "CORS 配置测试"
echo "========================================"

# 测试 URL（替换为实际的 Vercel URL或本地地址）
BASE_URL="${VERCEL_URL:-http://localhost:3000}"

echo ""
echo "测试 1: OPTIONS 预检请求"
echo "----------------------------------------"
echo "请求: OPTIONS ${BASE_URL}/api/health"
echo "Headers: Origin=http://localhost:5000, Access-Control-Request-Method=POST"
curl -i -X OPTIONS "${BASE_URL}/api/health" \
  -H "Origin: http://localhost:5000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  2>&1 | head -20

echo ""
echo "测试 2: GET 请求（带 Origin）"
echo "----------------------------------------"
echo "请求: GET ${BASE_URL}/api/health"
echo "Headers: Origin=http://localhost:5000"
curl -i "${BASE_URL}/api/health" \
  -H "Origin: http://localhost:5000" \
  2>&1 | head -20

echo ""
echo "测试 3: POST 请求（带 Origin 和 Credentials）"
echo "----------------------------------------"
echo "请求: POST ${BASE_URL}/api/health"
echo "Headers: Origin=http://localhost:5000, Content-Type=application/json"
curl -i -X POST "${BASE_URL}/api/health" \
  -H "Origin: http://localhost:5000" \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}' \
  2>&1 | head -20

echo ""
echo "测试 4: 检查是否包含 credentials 头"
echo "----------------------------------------"
echo "检查: 是否返回 'Access-Control-Allow-Credentials' 头"
RESPONSE=$(curl -i "${BASE_URL}/api/health" \
  -H "Origin: http://localhost:5000" \
  2>&1)

if echo "$RESPONSE" | grep -q "Access-Control-Allow-Credentials: true"; then
  echo "❌ 错误: 仍然返回 credentials: true（应已移除）"
else
  echo "✅ 正确: 未返回 credentials 头或设置为 false"
fi

echo ""
echo "测试 5: 检查 Origin 是否匹配白名单"
echo "----------------------------------------"
echo "检查: Access-Control-Allow-Origin 是否为 'http://localhost:5000'"
if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin: http://localhost:5000"; then
  echo "✅ 正确: Origin 匹配白名单"
else
  echo "⚠️  警告: Origin 不匹配白名单或未返回"
  echo "实际返回: $(echo "$RESPONSE" | grep "Access-Control-Allow-Origin:" || echo "未找到 Access-Control-Allow-Origin 头")"
fi

echo ""
echo "========================================"
echo "测试完成"
echo "========================================"
