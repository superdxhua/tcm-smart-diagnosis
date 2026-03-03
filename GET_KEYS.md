# 请提供正确的 Supabase API Keys

我尝试使用了你提供的密钥，但都遇到了验证失败的问题。请从 Supabase Dashboard 获取正确的密钥。

## 获取步骤（只需 2 分钟）

### 1. 访问 Supabase Settings 页面

点击这个链接：
https://app.supabase.com/project/dwswtkfbtdohaftnklxx/settings/api

### 2. 复制两个密钥

在 "Project API keys" 部分，你会看到：

1. **anon public** - 复制这个密钥
2. **service_role (secret)** - 复制这个密钥

这两个密钥的格式应该是以 `eyJ` 开头的长字符串。

### 3. 提供给我

请复制这两个密钥，按照下面的格式提供给我：

```
ANON KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE ROLE KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 备选方案：手动执行 SQL（最简单）

如果你觉得获取密钥太麻烦，可以直接执行 SQL 脚本：

1. 打开：https://app.supabase.com/project/dwswtkfbtdohaftnklxx/sql/new
2. 复制 `QUICK_START.md` 中的 SQL 代码
3. 粘贴并执行
4. 完成！

这个方案只需要 2 分钟，完全不需要密钥！

---

**请选择一个方案，告诉我你的选择！**
