#!/bin/bash

# 域名配置检查脚本
# 用于验证 zhongyihskhealth.com 域名配置是否正确

echo "================================"
echo "域名配置检查脚本"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOMAIN="zhongyihskhealth.com"
PROTOCOL="https"

echo "检查域名: ${GREEN}${DOMAIN}${NC}"
echo ""

# 检查 1: 域名解析
echo "1. 检查域名解析..."
if command -v dig &> /dev/null; then
    DNS_RESULT=$(dig +short ${DOMAIN} CNAME)
    if [[ $DNS_RESULT == *"vercel"* ]]; then
        echo -e "   ${GREEN}✓ 域名解析正确${NC}"
        echo "   CNAME: ${DNS_RESULT}"
    else
        echo -e "   ${RED}✗ 域名解析未指向 Vercel${NC}"
        echo "   当前值: ${DNS_RESULT}"
    fi
else
    echo -e "   ${YELLOW}⚠ 无法检查 DNS（dig 命令不可用）${NC}"
fi
echo ""

# 检查 2: HTTPS 访问
echo "2. 检查 HTTPS 访问..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" ${PROTOCOL}://${DOMAIN} --max-time 10)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "   ${GREEN}✓ HTTPS 访问正常${NC}"
    echo "   HTTP 状态码: ${HTTP_CODE}"
else
    echo -e "   ${RED}✗ HTTPS 访问失败${NC}"
    echo "   HTTP 状态码: ${HTTP_CODE}"
fi
echo ""

# 检查 3: SSL 证书
echo "3. 检查 SSL 证书..."
if command -v openssl &> /dev/null; then
    CERT_VALID=$(echo | openssl s_client -servername ${DOMAIN} -connect ${DOMAIN}:443 2>/dev/null | openssl x509 -noout -checkend 0 2>&1)
    if [ -z "$CERT_VALID" ]; then
        echo -e "   ${GREEN}✓ SSL 证书有效${NC}"
    else
        echo -e "   ${RED}✗ SSL 证书无效或已过期${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠ 无法检查 SSL 证书（openssl 命令不可用）${NC}"
fi
echo ""

# 检查 4: API 端点测试
echo "4. 检查 API 端点..."
API_URL="${PROTOCOL}://${DOMAIN}/api/members"
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" ${API_URL} --max-time 10)
if [ "$API_CODE" = "200" ]; then
    echo -e "   ${GREEN}✓ API 端点正常${NC}"
    echo "   端点: ${API_URL}"
    echo "   HTTP 状态码: ${API_CODE}"
else
    echo -e "   ${RED}✗ API 端点无法访问${NC}"
    echo "   端点: ${API_URL}"
    echo "   HTTP 状态码: ${API_CODE}"
fi
echo ""

# 检查 5: 环境变量配置
echo "5. 检查环境变量配置..."
if [ -f ".env.production" ]; then
    DOMAIN_IN_ENV=$(grep "PROJECT_DOMAIN" .env.production | cut -d '=' -f2)
    if [[ $DOMAIN_IN_ENV == *"${DOMAIN}"* ]]; then
        echo -e "   ${GREEN}✓ 环境变量配置正确${NC}"
        echo "   PROJECT_DOMAIN=${DOMAIN_IN_ENV}"
    else
        echo -e "   ${RED}✗ 环境变量配置错误${NC}"
        echo "   当前值: ${DOMAIN_IN_ENV}"
        echo "   预期值: ${PROTOCOL}://${DOMAIN}"
    fi
else
    echo -e "   ${RED}✗ 未找到 .env.production 文件${NC}"
fi
echo ""

echo "================================"
echo "检查完成"
echo "================================"
echo ""
echo "下一步操作："
echo "1. 在 Vercel 控制台触发重新部署"
echo "2. 在微信公众平台配置服务器域名"
echo "3. 在小程序开发者工具中测试"
echo ""
