#!/bin/bash

# 静态资源修复验证脚本

DOMAIN="https://tcmsmarthealth.com"

echo "=================================="
echo "静态资源修复验证脚本"
echo "=================================="
echo ""

# 测试静态资源
echo "1. 测试静态资源..."
STATIC_RESOURCES=(
  "/icons/icon-512x512.png"
  "/icons/icon-192x192.png"
  "/manifest.json"
)

for resource in "${STATIC_RESOURCES[@]}"; do
  echo ""
  echo "   测试: $DOMAIN$resource"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$DOMAIN$resource")
  CONTENT_TYPE=$(curl -s -I --max-time 10 "$DOMAIN$resource" | grep -i "content-type:" | cut -d':' -f2- | tr -d '\r')

  if [ "$STATUS" = "200" ]; then
    echo "   ✅ 状态码: $STATUS"
    echo "   ✅ 内容类型: $CONTENT_TYPE"
  elif [ "$STATUS" = "404" ]; then
    echo "   ❌ 文件不存在 (404)"
    echo "   原因: 静态资源没有被复制到 dist-web 目录"
  elif [ "$STATUS" = "401" ]; then
    echo "   ❌ 认证失败 (401)"
    echo "   原因: 请求被错误地路由到需要认证的 API"
  else
    echo "   ⚠️  异常状态码: $STATUS"
  fi
done

echo ""
echo "2. 检查本地 dist-web 目录..."
if [ -d "dist-web/icons" ]; then
  ICON_COUNT=$(ls -1 dist-web/icons/*.png 2>/dev/null | wc -l)
  echo "   ✅ dist-web/icons 目录存在"
  echo "   📊 图标文件数量: $ICON_COUNT"

  if [ "$ICON_COUNT" -eq 10 ]; then
    echo "   ✅ 所有图标文件都已复制"
  else
    echo "   ⚠️  图标文件数量不正确（应为 10）"
  fi
else
  echo "   ❌ dist-web/icons 目录不存在"
  echo "   解决方案: 手动复制 public/icons 到 dist-web/"
fi

echo ""
echo "3. 检查本地 public 目录..."
if [ -d "public/icons" ]; then
  ICON_COUNT=$(ls -1 public/icons/*.png 2>/dev/null | wc -l)
  echo "   ✅ public/icons 目录存在"
  echo "   📊 图标文件数量: $ICON_COUNT"
else
  echo "   ❌ public/icons 目录不存在"
fi

echo ""
echo "=================================="
echo "诊断总结"
echo "=================================="
echo ""

# 诊断建议
STATIC_401=false
for resource in "${STATIC_RESOURCES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$DOMAIN$resource")
  if [ "$STATUS" = "401" ]; then
    STATIC_401=true
    break
  fi
done

if [ "$STATIC_401" = true ]; then
  echo "⚠️  静态资源仍然返回 401"
  echo ""
  echo "可能原因："
  echo "1. Vercel 缓存问题 - 静态文件请求被错误地路由到 API"
  echo "2. vercel.json 的 routes 规则没有生效"
  echo "3. 需要重新部署才能生效"
  echo ""
  echo "解决方案："
  echo "1. 推送代码到 Git，触发 Vercel 重新部署"
  echo "2. 在 Vercel Dashboard 中手动清除缓存并重新部署"
  echo "3. 等待 Vercel 部署完成（1-3 分钟）"
  echo "4. 重新运行此脚本验证"
else
  echo "✅ 静态资源访问正常"
  echo ""
  echo "下一步："
  echo "1. 测试登录功能"
  echo "2. 测试完整的用户流程"
fi
