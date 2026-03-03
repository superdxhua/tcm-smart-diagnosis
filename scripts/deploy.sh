#!/bin/bash

# ==================== 中医智能诊疗小程序 - 快速部署脚本 ====================
# 使用方法：bash deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署中医智能诊疗小程序后端服务..."
echo ""

# ==================== 配置变量 ====================
APP_NAME="tcm-server"
APP_DIR="/app/tcm-server"
NGINX_CONF="/etc/nginx/sites-available/tcm-server"
DOMAIN="your-domain.com"  # 请修改为你的域名

# ==================== 检查系统环境 ====================
echo "📋 检查系统环境..."

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请使用 root 用户或 sudo 运行此脚本"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，正在安装..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ npm 版本: $(npm -v)"

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 正在安装 PM2..."
    npm install -g pm2
fi

echo "✅ PM2 版本: $(pm2 -v)"

# ==================== 创建应用目录 ====================
echo ""
echo "📁 创建应用目录..."
mkdir -p $APP_DIR
cd $APP_DIR

# ==================== 上传代码 ====================
echo ""
echo "⚠️  请将后端代码上传到 $APP_DIR 目录"
echo "   或者使用以下命令上传："
echo "   scp -r /workspace/projects/server/* user@your-server:$APP_DIR/"
echo ""
read -p "代码已上传完成？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 部署已取消"
    exit 1
fi

# ==================== 安装依赖 ====================
echo ""
echo "📦 安装项目依赖..."
npm install --production

# ==================== 配置环境变量 ====================
echo ""
echo "⚙️  配置环境变量..."
if [ ! -f "$APP_DIR/.env" ]; then
    echo "⚠️  .env 文件不存在，请手动创建并配置"
    echo "   可以参考 .env.production.example 文件"
    read -p "现在创建 .env 文件？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        nano $APP_DIR/.env
    fi
fi

# ==================== 启动服务 ====================
echo ""
echo "🚀 启动服务..."
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start dist/main.js --name $APP_NAME

# 设置 PM2 开机自启
pm2 startup systemd -u root --hp /root
pm2 save

echo "✅ 服务已启动"
pm2 status

# ==================== 配置 Nginx ====================
echo ""
echo "🌐 配置 Nginx..."

# 安装 Nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 正在安装 Nginx..."
    apt update
    apt install -y nginx
fi

# 创建 Nginx 配置文件
cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 启用 Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
EOF

# 启用配置
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
systemctl enable nginx

echo "✅ Nginx 已配置并启动"

# ==================== 配置防火墙 ====================
echo ""
echo "🔒 配置防火墙..."

# 安装 UFW
if ! command -v ufw &> /dev/null; then
    apt install -y ufw
fi

# 配置防火墙规则
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "✅ 防火墙已配置"

# ==================== 提示配置 SSL ====================
echo ""
echo "🔐 配置 SSL 证书（HTTPS）..."
echo ""
echo "⚠️  为了使用 HTTPS，需要配置 SSL 证书"
echo "   建议使用 Let's Encrypt 免费证书"
echo ""
read -p "现在配置 SSL 证书？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 安装 Certbot
    apt install -y certbot python3-certbot-nginx
    
    # 获取证书
    certbot --nginx -d $DOMAIN
    
    # 设置自动续期
    (crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet") | crontab -
    
    echo "✅ SSL 证书已配置"
fi

# ==================== 部署完成 ====================
echo ""
echo "=========================================="
echo "🎉 部署完成！"
echo "=========================================="
echo ""
echo "📊 服务状态："
pm2 status
echo ""
echo "🌐 访问地址："
echo "   HTTP:  http://$DOMAIN"
echo "   HTTPS: https://$DOMAIN"
echo ""
echo "📝 常用命令："
echo "   查看日志: pm2 logs $APP_NAME"
echo "   重启服务: pm2 restart $APP_NAME"
echo "   停止服务: pm2 stop $APP_NAME"
echo "   查看监控: pm2 monit"
echo "   查看 Nginx 日志: tail -f /var/log/nginx/access.log"
echo ""
echo "⚠️  下一步："
echo "   1. 修改 $APP_DIR/.env 配置文件"
echo "   2. 测试 API 接口是否正常"
echo "   3. 配置微信小程序服务器域名"
echo "   4. 提交小程序审核"
echo ""
echo "=========================================="
