#!/bin/bash

echo "=================================="
echo "Vercel 部署诊断脚本"
echo "=================================="
echo ""

# 1. 检查必要文件
echo "1. 检查必要文件..."
files=(
  "api/index.ts"
  "vercel.json"
  ".vercelignore"
  "package.json"
  "server/dist/app.module.js"
  "server/dist/interceptors/http-status.interceptor.js"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file - 文件不存在"
    all_exist=false
  fi
done

echo ""

# 2. 检查 vercel.json 配置
echo "2. 检查 vercel.json 配置..."
if grep -q "api/index.ts" vercel.json; then
  echo "✅ functions 配置包含 api/index.ts"
else
  echo "❌ functions 配置缺少 api/index.ts"
fi

if grep -q "/api/:path*" vercel.json; then
  echo "✅ rewrites 配置包含 /api/:path*"
else
  echo "❌ rewrites 配置缺少 /api/:path*"
fi

if grep -q "Access-Control-Allow-Origin" vercel.json; then
  echo "✅ headers 配置包含 CORS 头"
else
  echo "❌ headers 配置缺少 CORS 头"
fi

echo ""

# 3. 检查 api/index.ts 引用
echo "3. 检查 api/index.ts 引用路径..."
if grep -q "../server/dist/app.module" api/index.ts; then
  echo "✅ api/index.ts 引用 ../server/dist/app.module"
else
  echo "❌ api/index.ts 引用路径错误"
  echo "   当前引用:"
  grep "import.*app.module" api/index.ts | head -1
fi

if grep -q "../server/dist/interceptors/http-status.interceptor" api/index.ts; then
  echo "✅ api/index.ts 引用 ../server/dist/interceptors/http-status.interceptor"
else
  echo "❌ api/index.ts 引用路径错误"
fi

echo ""

# 4. 检查编译后的文件
echo "4. 检查编译后的后端文件..."
if [ -f "server/dist/app.module.js" ]; then
  echo "✅ server/dist/app.module.js 存在"
  file_size=$(wc -c < server/dist/app.module.js)
  echo "   文件大小: $file_size bytes"
else
  echo "❌ server/dist/app.module.js 不存在"
  echo "   请运行: cd server && npm run build"
fi

echo ""

# 5. 检查 CORS 配置
echo "5. 检查 CORS 配置..."
if grep -q "Access-Control-Allow-Origin" api/index.ts; then
  echo "✅ api/index.ts 包含 CORS 配置"
else
  echo "❌ api/index.ts 缺少 CORS 配置"
fi

echo ""

# 6. 提供部署建议
echo "=================================="
echo "部署建议"
echo "=================================="
echo ""
echo "1. 确保在 Vercel Dashboard 中配置以下环境变量："
echo "   - COZE_SUPABASE_URL"
echo "   - COZE_SUPABASE_ANON_KEY"
echo "   - JWT_SECRET"
echo "   - WECHAT_APP_ID (如需微信登录)"
echo "   - WECHAT_SECRET (如需微信登录)"
echo ""
echo "2. Vercel 会自动读取 vercel.json 配置"
echo ""
echo "3. 推送代码后，Vercel 会自动触发部署"
echo ""
echo "4. 部署完成后，检查以下 URL："
echo "   - https://tcmsmarthealth.com/ (前端)"
echo "   - https://tcmsmarthealth.com/api/auth/login (后端 API)"
echo ""
echo "5. 如果 API 不工作，检查 Vercel Function 日志："
echo "   https://vercel.com/dashboard -> 项目 -> Functions -> Logs"
echo ""

if [ "$all_exist" = true ]; then
  echo "✅ 所有必要文件存在，可以推送到 Vercel"
else
  echo "❌ 有文件缺失，请先修复"
  exit 1
fi
