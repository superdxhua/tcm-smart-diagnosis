# 数据库备份指南

## 当前状态

- 数据库大小：16 MB
- Supabase 提供自动备份（7 天保留期）
- **建议：添加手动备份机制**

## 备份策略

### 1. Supabase 自动备份（已启用）

Supabase 默认提供：
- 每日自动备份
- 保留 7 天
- 可在 Dashboard 中恢复

**查看备份：**
1. 登录 Supabase Dashboard
2. 进入你的项目
3. Database → Backups

### 2. 手动备份（推荐）

#### 方法 A：使用 Supabase CLI

```bash
# 安装 Supabase CLI
brew install supabase/tap/supabase

# 备份整个数据库
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# 备份特定表
supabase db dump -f backup_members.sql --data-only --table members
supabase db dump -f backup_health_records.sql --data-only --table health_records
```

#### 方法 B：使用 pg_dump（连接字符串）

```bash
# 获取连接字符串（从 Supabase Dashboard → Settings → Database）
export DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/postgres"

# 备份整个数据库
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 备份特定表
pg_dump $DATABASE_URL -t members > backup_members.sql
pg_dump $DATABASE_URL -t health_records > backup_health_records.sql
```

#### 方法 C：使用 Supabase API

创建备份脚本 `scripts/backup-database.js`：

```javascript
const { createClient } = require('@supabase/supabase-js')

require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  // 备份 members 表
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('*')

  if (membersError) {
    console.error('备份 members 失败:', membersError)
    return
  }

  // 备份 health_records 表
  const { data: records, error: recordsError } = await supabase
    .from('health_records')
    .select('*')

  if (recordsError) {
    console.error('备份 health_records 失败:', recordsError)
    return
  }

  // 保存到文件
  const fs = require('fs')
  const backup = {
    timestamp,
    members: members || [],
    healthRecords: records || []
  }

  fs.writeFileSync(
    `backup_${timestamp}.json`,
    JSON.stringify(backup, null, 2)
  )

  console.log(`备份完成：backup_${timestamp}.json`)
  console.log(`患者数量：${members.length}`)
  console.log(`健康记录数量：${records.length}`)
}

backupDatabase()
```

### 3. 自动化备份

#### 使用 Cron 定时任务

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点执行备份
0 2 * * * /path/to/backup-script.sh >> /var/log/backup.log 2>&1
```

#### 使用 GitHub Actions（推荐）

创建 `.github/workflows/backup.yml`：

```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨 2 点
  workflow_dispatch:      # 手动触发

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Backup database
        run: |
          npm install
          node scripts/backup-database.js

      - name: Upload to S3
        uses: jakejarvis/s3-sync-action@master
        with:
          args: --acl-private
        env:
          AWS_S3_BUCKET: ${{ secrets.BACKUP_BUCKET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: us-east-1
          SOURCE_DIR: './backups'
```

## 恢复指南

### 从 SQL 恢复

```bash
# 恢复整个数据库
psql $DATABASE_URL < backup_20240301_020000.sql

# 恢复特定表
psql $DATABASE_URL < backup_members.sql
```

### 从 JSON 恢复

创建恢复脚本 `scripts/restore-database.js`：

```javascript
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function restoreDatabase(backupFile) {
  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'))

  // 恢复 members 表
  for (const member of backup.members) {
    const { error } = await supabase
      .from('members')
      .upsert(member, { onConflict: 'uuid' })

    if (error) {
      console.error('恢复 member 失败:', error)
    }
  }

  // 恢复 health_records 表
  for (const record of backup.healthRecords) {
    const { error } = await supabase
      .from('health_records')
      .upsert(record, { onConflict: 'id' })

    if (error) {
      console.error('恢复 health_records 失败:', error)
    }
  }

  console.log('恢复完成')
}

restoreDatabase('backup_20240301_020000.json')
```

## 推荐备份频率

- **每天一次**：完整备份（凌晨）
- **每周一次**：保留备份（7 天）
- **每月一次**：归档备份（永久保留）

## 存储位置

- **本地**：开发环境
- **S3/Cloudflare R2**：生产环境（推荐）
- **GitHub Releases**：长期归档

## 注意事项

1. **加密备份**：敏感数据加密后再上传
2. **验证备份**：定期验证备份文件完整性
3. **测试恢复**：每季度测试一次恢复流程
4. **保留多个版本**：至少保留 7 个版本
