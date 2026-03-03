# 检查 Supabase PostgreSQL 连接信息

Supabase 项目: dwswtkfbtdohaftnklxx

## PostgreSQL 连接格式

Supabase 的 PostgreSQL 连接字符串通常格式如下：

```
postgresql://postgres.dwswtkfbtdohaftnklxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

或者：

```
postgresql://postgres:[PASSWORD]@db.dwswtkfbtdohaftnklxx.supabase.co:5432/postgres
```

## 尝试使用 service_role key

如果 `sbp_6d0d1e2895b79ebebc25f2ff0e833acd7546c372` 是 PostgreSQL 密码，那么连接字符串应该是：

```
postgresql://postgres.dwswtkfbtdohaftnklxx:sbp_6d0d1e2895b79ebebc25f2ff0e833acd7546c372@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

让我尝试使用这个连接。
