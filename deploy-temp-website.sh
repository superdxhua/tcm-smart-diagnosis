#!/bin/bash
# 阿里云服务器临时网站部署脚本
# 用途：ICP备案期间部署临时网站

# 服务器配置
SERVER_IP="121.43.243.130"
SERVER_USER="root"

echo "========================================="
echo "  阿里云服务器临时网站部署脚本"
echo "  服务器: $SERVER_IP"
echo "  用途: ICP备案期间临时网站"
echo "========================================="
echo ""

# 检查是否安装了 SSH
if ! command -v ssh &> /dev/null; then
    echo "❌ 错误: 系统未安装 SSH 客户端"
    echo ""
    echo "请按照以下步骤手动执行："
    echo ""
    echo "1. 登录服务器："
    echo "   ssh root@121.43.243.130"
    echo "   （输入密码）"
    echo ""
    echo "2. 安装 Nginx："
    echo "   yum update -y"
    echo "   yum install nginx -y"
    echo "   systemctl start nginx"
    echo "   systemctl enable nginx"
    echo ""
    echo "3. 创建临时网站："
    echo "   mkdir -p /var/www/html"
    echo "   cat > /var/www/html/index.html << 'EOF'"
    echo "   <!DOCTYPE html>"
    echo "   <html lang=\"zh-CN\">"
    echo "   <head>"
    echo "       <meta charset=\"UTF-8\">"
    echo "       <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
    echo "       <title>ICP备案中</title>"
    echo "       <style>"
    echo "       body {"
    echo "           font-family: Arial, sans-serif;"
    echo "           display: flex;"
    echo "           justify-content: center;"
    echo "           align-items: center;"
    echo "           min-height: 100vh;"
    echo "           margin: 0;"
    echo "           background-color: #f5f5f5;"
    echo "       }"
    echo "       .container {"
    echo "           text-align: center;"
    echo "           padding: 40px;"
    echo "           background-color: white;"
    echo "           border-radius: 8px;"
    echo "           box-shadow: 0 2px 10px rgba(0,0,0,0.1);"
    echo "       }"
    echo "       h1 {"
    echo "           color: #333;"
    echo "           margin-bottom: 20px;"
    echo "       }"
    echo "       p {"
    echo "           color: #666;"
    echo "           font-size: 16px;"
    echo "       }"
    echo "       </style>"
    echo "   </head>"
    echo "   <body>"
    echo "       <div class=\"container\">"
    echo "           <h1>ICP备案中</h1>"
    echo "           <p>网站正在进行ICP备案，预计需要7-24个工作日。</p>"
    echo "           <p>备案完成后，将正式上线。</p>"
    echo "           <p>如有疑问，请联系：contact@example.com</p>"
    echo "       </div>"
    echo "   </body>"
    echo "   </html>"
    echo "   EOF"
    echo ""
    echo "4. 配置 Nginx："
    echo "   cat > /etc/nginx/nginx.conf << 'EOF'"
    echo "   user nginx;"
    echo "   worker_processes auto;"
    echo "   error_log /var/log/nginx/error.log;"
    echo "   pid /run/nginx.pid;"
    echo ""
    echo "   events {"
    echo "       worker_connections 1024;"
    echo "   }"
    echo ""
    echo "   http {"
    echo "       log_format main '\$remote_addr - \$remote_user [\$time_local] \"\$request\"'"
    echo "                       '\$status \$body_bytes_sent \"\$http_referer\"'"
    echo "                       '\"\$http_user_agent\" \"\$http_x_forwarded_for\"';"
    echo ""
    echo "       access_log /var/log/nginx/access.log main;"
    echo ""
    echo "       sendfile on;"
    echo "       tcp_nopush on;"
    echo "       tcp_nodelay on;"
    echo "       keepalive_timeout 65;"
    echo "       types_hash_max_size 2048;"
    echo ""
    echo "       include /etc/nginx/mime.types;"
    echo "       default_type application/octet-stream;"
    echo ""
    echo "       server {"
    echo "           listen 80;"
    echo "           listen [::]:80;"
    echo "           server_name _;"
    echo "           root /var/www/html;"
    echo "           index index.html;"
    echo ""
    echo "           location / {"
    echo "               try_files \$uri \$uri/ =404;"
    echo "           }"
    echo "       }"
    echo "   }"
    echo "   EOF"
    echo ""
    echo "5. 重启 Nginx："
    echo "   nginx -t"
    echo "   systemctl restart nginx"
    echo "   systemctl status nginx"
    echo ""
    echo "6. 测试访问："
    echo "   curl http://121.43.243.130"
    echo ""
    exit 1
fi

echo "✅ 检测到 SSH 客户端"
echo ""

# 连接到服务器并执行部署命令
echo "📡 正在连接到服务器 $SERVER_IP..."
echo ""

ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 $SERVER_USER@$SERVER_IP << 'ENDSSH'
echo "========================================="
echo "  开始部署临时网站"
echo "========================================="
echo ""

# 步骤 1：更新系统
echo "📦 [1/6] 更新系统..."
yum update -y

# 步骤 2：安装 Nginx
echo "🌐 [2/6] 安装 Nginx..."
yum install nginx -y

# 步骤 3：创建网站目录
echo "📁 [3/6] 创建网站目录..."
mkdir -p /var/www/html

# 步骤 4：创建临时网站
echo "📝 [4/6] 创建临时网站页面..."
cat > /var/www/html/index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ICP备案中</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .container {
            text-align: center;
            padding: 40px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 32px;
        }
        p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>ICP备案中</h1>
        <p>网站正在进行ICP备案，预计需要7-24个工作日。</p>
        <p>备案完成后，将正式上线。</p>
        <p>如有疑问，请联系：contact@example.com</p>
    </div>
</body>
</html>
EOF

# 步骤 5：配置 Nginx
echo "⚙️  [5/6] 配置 Nginx..."
cat > /etc/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request"'
                    '$status $body_bytes_sent "$http_referer"'
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        listen [::]:80;
        server_name _;
        root /var/www/html;
        index index.html;

        location / {
            try_files $uri $uri/ =404;
        }
    }
}
EOF

# 步骤 6：启动 Nginx
echo "🚀 [6/6] 启动 Nginx..."
nginx -t
systemctl start nginx
systemctl enable nginx

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "✅ 服务器信息："
echo "   IP: $(hostname -I | awk '{print $1}')"
echo "   状态: $(systemctl is-active nginx)"
echo ""
echo "🌐 测试访问："
echo "   http://$(hostname -I | awk '{print $1}')"
echo ""
echo "📝 查看日志："
echo "   tail -f /var/log/nginx/access.log"
echo "   tail -f /var/log/nginx/error.log"
echo ""
ENDSSH

if [ $? -eq 0 ]; then
    echo "========================================="
    echo "  部署成功！"
    echo "========================================="
    echo ""
    echo "✅ 临时网站已部署成功！"
    echo ""
    echo "🌐 请在浏览器中访问："
    echo "   http://121.43.243.130"
    echo ""
    echo "📋 下一步操作："
    echo "   1. 确认可以看到'ICP备案中'页面"
    echo "   2. 修改 DNS 解析，将 zhongyihskhealth.com 指向 121.43.243.130"
    echo "   3. 等待 DNS 生效（10-30 分钟）"
    echo "   4. 测试访问 http://zhongyihskhealth.com"
    echo "   5. 提交 ICP 备案申请"
    echo ""
else
    echo "========================================="
    echo "  部署失败"
    echo "========================================="
    echo ""
    echo "❌ 连接服务器失败，请检查："
    echo "   1. 服务器 IP 是否正确: 121.43.243.130"
    echo "   2. 服务器状态是否为'运行中'"
    echo "   3. 密码是否正确"
    echo ""
    echo "请手动按照上面的步骤执行部署。"
    echo ""
fi
