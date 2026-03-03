# DNS配置指南 - 天源堂海王星药店

## 配置目标

1. **主域名（zhongyihskhealth.com）**：解析到阿里云服务器（120.26.175.70），显示静态官网
2. **子域名（www.zhongyihskhealth.com）**：保持解析到Vercel，显示应用

---

## 配置步骤

### Step 1：登录阿里云DNS控制台

1. 访问：https://dns.console.aliyun.com/
2. 选择您的域名：zhongyihskhealth.com

### Step 2：修改主域名A记录

**当前配置**（需要修改）：
```
记录类型：A
主机记录：@ 或留空
记录值：216.198.79.1
```

**修改为**：
```
记录类型：A
主机记录：@ 或留空
记录值：120.26.175.70
TTL：600（10分钟）
```

**操作步骤**：
1. 找到 `@` 或空的主机记录
2. 点击"修改"
3. 将记录值改为 `120.26.175.70`
4. 点击"确定"

### Step 3：确认子域名CNAME记录

**当前配置**（保持不变）：
```
记录类型：CNAME
主机记录：www
记录值：*.vercel.app 或 zhongyihskhealth.com.vercel.app
TTL：600
```

**检查方法**：
1. 找到 `www` 的主机记录
2. 确认记录类型是 `CNAME`
3. 确认记录值指向 `*.vercel.app`
4. **不要修改此记录**

### Step 4：验证DNS解析

等待10-30分钟后，使用以下命令验证：

```bash
# 验证主域名解析
nslookup zhongyihskhealth.com
# 应该返回：120.26.175.70

# 验证子域名解析
nslookup www.zhongyihskhealth.com
# 应该返回：*.vercel.app 或 Vercel的IP
```

---

## DNS配置表格

| 记录类型 | 主机记录 | 记录值 | TTL | 状态 |
|---------|---------|--------|-----|------|
| A | @ | 120.26.175.70 | 600 | ✅ 修改 |
| A | www | （删除此记录，如果存在） | 600 | ⚠️ 删除 |
| CNAME | www | *.vercel.app | 600 | ✅ 保持 |
| CNAME | * | *.vercel.app | 600 | ✅ 保持 |

---

## 注意事项

### ⚠️ 重要提示

1. **主域名修改后**：
   - 域名将不再直接访问Vercel的应用
   - 访问主域名将显示静态官网
   - 需要点击"进入应用"按钮才能使用

2. **子域名保持不变**：
   - www.zhongyihskhealth.com 继续访问Vercel应用
   - 所有应用功能正常使用
   - 用户体验不变

3. **DNS生效时间**：
   - 通常：10-30分钟
   - 最长：24小时（取决于DNS缓存）
   - 建议等待生效后再重新申报备案

4. **测试方法**：
   ```bash
   # Windows用户
   ipconfig /flushdns
   ping zhongyihskhealth.com
   ping www.zhongyihskhealth.com

   # Linux/Mac用户
   sudo systemctl restart nscd  # 或 flush dns
   ping zhongyihskhealth.com
   ping www.zhongyihskhealth.com
   ```

---

## 常见问题

### Q1：修改DNS后多久生效？
A：通常10-30分钟，最长24小时。建议等待生效后再重新申报备案。

### Q2：修改后网站无法访问？
A：
1. 检查阿里云服务器是否已部署官网文件
2. 检查Nginx是否正常启动
3. 检查防火墙是否开放80端口
4. 清除本地DNS缓存

### Q3：子域名www也需要修改吗？
A：不需要！子域名保持CNAME记录，继续指向Vercel。

### Q4：可以保留主域名的应用访问吗？
A：不能。主域名必须解析到阿里云服务器才能通过ICP备案。用户需要通过子域名www访问应用，或点击官网的"进入应用"按钮。

### Q5：ICP备案审核时，审核人员会访问哪个域名？
A：审核人员会访问主域名（zhongyihskhealth.com），所以主域名必须显示静态官网内容。

---

## 下一步

DNS配置完成后，请继续：

1. **在阿里云服务器上部署官网**（参考 `DEPLOY_GUIDE.md`）
2. **配置Nginx**（参考 `nginx.conf`）
3. **测试网站访问**
4. **重新申报ICP备案**

---

## 联系支持

如有问题，请联系技术支持或查看阿里云DNS文档：
https://help.aliyun.com/product/29697.html
