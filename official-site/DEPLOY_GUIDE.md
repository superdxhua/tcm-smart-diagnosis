# 阿里云服务器部署指南 - 天源堂海王星药店官网

## 部署目标

在阿里云服务器（120.26.175.70）上部署静态官网，让主域名 `zhongyihskhealth.com` 显示ICP备案页面。

---

## 前置要求

1. **服务器配置**：
   - 操作系统：CentOS 7.9 或 Ubuntu 20.04+
   - 公网IP：120.26.175.70
   - 权限：root或sudo权限

2. **所需文件**：
   - `official-site/index.html`（官网HTML文件）
   - `official-site/nginx.conf`（Nginx配置文件）

---

## 部署步骤（Ubuntu系统）

### Step 1：登录服务器

```bash
ssh root@120.26.175.70
# 或使用密钥：
# ssh -i /path/to/your-key.pem root@120.26.175.70
```

### Step 2：更新系统并安装Nginx

```bash
# 更新软件包
sudo apt update && sudo apt upgrade -y

# 安装Nginx
sudo apt install nginx -y

# 启动Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 检查Nginx状态
sudo systemctl status nginx
```

### Step 3：创建网站目录

```bash
# 创建网站根目录
sudo mkdir -p /var/www/zhongyihskhealth.com

# 设置权限
sudo chown -R $USER:$USER /var/www/zhongyihskhealth.com
sudo chmod -R 755 /var/www/zhongyihskhealth.com
```

### Step 4：上传官网文件

**方法1：使用SCP上传（推荐）**

在本地电脑执行：

```bash
# 上传index.html
scp official-site/index.html root@120.26.175.70:/var/www/zhongyihskhealth.com/

# 或上传整个目录
scp -r official-site/* root@120.26.175.70:/var/www/zhongyihskhealth.com/
```

**方法2：使用Git克隆（如果文件在Git仓库）**

```bash
cd /var/www/zhongyihskhealth.com
sudo git clone https://github.com/superdxhua/tcm-smart-diagnosis.git temp
sudo cp temp/official-site/index.html .
sudo rm -rf temp
```

**方法3：在服务器上直接创建**

```bash
# 使用nano编辑器
sudo nano /var/www/zhongyihskhealth.com/index.html

# 粘贴HTML内容，保存并退出（Ctrl+X，然后Y，然后Enter）
```

### Step 5：配置Nginx

```bash
# 复制Nginx配置文件（如果已上传）
# sudo cp nginx.conf /etc/nginx/sites-available/zhongyihskhealth.com

# 或直接创建配置文件
sudo nano /etc/nginx/sites-available/zhongyihskhealth.com
```

粘贴以下内容：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name zhongyihskhealth.com;

    root /var/www/zhongyihskhealth.com;
    index index.html;

    access_log /var/log/nginx/zhongyihskhealth.com.access.log;
    error_log /var/log/nginx/zhongyihskhealth.com.error.log;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

保存并退出。

### Step 6：启用Nginx配置

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/zhongyihskhealth.com /etc/nginx/sites-enabled/

# 测试Nginx配置
sudo nginx -t

# 如果测试通过，重新加载Nginx
sudo systemctl reload nginx
```

### Step 7：配置防火墙

```bash
# 检查防火墙状态
sudo ufw status

# 如果防火墙已启用，开放80端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 重新加载防火墙
sudo ufw reload
```

### Step 8：配置阿里云安全组

1. 登录阿里云ECS控制台
2. 找到您的ECS实例（120.26.175.70）
3. 点击"安全组" → "配置规则"
4. 添加入方向规则：
   - 端口范围：80/80
   - 授权对象：0.0.0.0/0
   - 协议类型：TCP

### Step 9：测试网站访问

```bash
# 在服务器上测试
curl http://localhost

# 应该返回HTML内容

# 在本地电脑测试
curl http://120.26.175.70
# 或在浏览器访问：http://120.26.175.70
```

### Step 10：（可选）配置SSL证书

使用Let's Encrypt免费证书：

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取SSL证书（会自动配置Nginx）
sudo certbot --nginx -d zhongyihskhealth.com

# 按提示输入邮箱，同意条款

# 测试证书续期
sudo certbot renew --dry-run
```

证书会自动续期，无需手动干预。

---

## 部署步骤（CentOS系统）

### Step 1：登录服务器

```bash
ssh root@120.26.175.70
```

### Step 2：更新系统并安装Nginx

```bash
# 更新软件包
sudo yum update -y

# 安装EPEL仓库
sudo yum install epel-release -y

# 安装Nginx
sudo yum install nginx -y

# 启动Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 检查Nginx状态
sudo systemctl status nginx
```

### Step 3-10：与Ubuntu相同

后续步骤与Ubuntu系统相同，参考上述步骤3-10。

---

## 验证部署

### 1. 检查Nginx状态

```bash
sudo systemctl status nginx
# 应该显示：Active: active (running)
```

### 2. 检查网站文件

```bash
ls -la /var/www/zhongyihskhealth.com/
# 应该看到：index.html
```

### 3. 检查Nginx配置

```bash
sudo nginx -t
# 应该显示：syntax is ok, test is successful
```

### 4. 测试网站访问

在浏览器访问：
- http://120.26.175.70
- http://zhongyihskhealth.com（DNS生效后）

应该看到天源堂海王星药店官网页面。

---

## 故障排查

### 问题1：无法访问网站

**检查步骤**：

```bash
# 1. 检查Nginx是否运行
sudo systemctl status nginx

# 2. 检查端口是否监听
sudo netstat -tlnp | grep :80

# 3. 检查防火墙
sudo ufw status  # Ubuntu
sudo firewall-cmd --list-all  # CentOS

# 4. 检查Nginx日志
sudo tail -f /var/log/nginx/error.log

# 5. 测试本地访问
curl http://localhost
```

### 问题2：403 Forbidden

**原因**：文件权限问题

**解决方案**：

```bash
sudo chmod -R 755 /var/www/zhongyihskhealth.com
sudo chown -R www-data:www-data /var/www/zhongyihskhealth.com  # Ubuntu
# 或
sudo chown -R nginx:nginx /var/www/zhongyihskhealth.com  # CentOS
```

### 问题3：502 Bad Gateway

**原因**：Nginx配置错误

**解决方案**：

```bash
# 检查Nginx配置
sudo nginx -t

# 重新加载Nginx
sudo systemctl reload nginx
```

---

## 下一步

部署完成后，请继续：

1. **修改DNS解析**（参考 `DNS_CONFIG.md`）
2. **等待DNS生效**（10-30分钟）
3. **测试网站访问**
4. **重新申报ICP备案**

---

## 维护指南

### 更新网站内容

```bash
# 1. 上传新的index.html
scp official-site/index.html root@120.26.175.70:/var/www/zhongyihskhealth.com/

# 2. 在服务器上验证
ssh root@120.26.175.70
ls -la /var/www/zhongyihskhealth.com/
```

### 查看访问日志

```bash
# 查看访问日志
sudo tail -f /var/log/nginx/zhongyihskhealth.com.access.log

# 查看错误日志
sudo tail -f /var/log/nginx/zhongyihskhealth.com.error.log
```

### 重启Nginx

```bash
# 重新加载配置（推荐，不会中断服务）
sudo systemctl reload nginx

# 重启服务
sudo systemctl restart nginx
```

---

## 联系支持

如有问题，请联系技术支持或查看Nginx官方文档：
https://nginx.org/en/docs/
