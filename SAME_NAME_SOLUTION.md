# 同名同姓问题解决方案

## 问题分析

### 当前问题

1. **仅靠姓名识别患者**：多个同名患者无法区分
2. **手机号非必填**：无法通过手机号唯一标识
3. **前端显示不清晰**：患者列表只显示姓名

### 影响范围

- ❌ 可能选错患者
- ❌ 健康记录关联错误
- ❌ 复诊分析不准确

## 解决方案

### 方案 1：添加显示字段（推荐 ⭐⭐⭐⭐⭐）

**思路**：在患者列表中显示更多识别信息，让用户能够区分同名患者

#### 步骤 1：修改数据库表结构

```sql
-- 添加唯一标识字段（可选）
ALTER TABLE members
ADD COLUMN IF NOT EXISTS identity_card VARCHAR(18) UNIQUE;  -- 身份证号
ALTER TABLE members
ADD COLUMN IF NOT EXISTS phone UNIQUE;  -- 手机号设为唯一

-- 添加索引提高查询性能
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_identity_card ON members(identity_card);
```

**注意**：
- 手机号设为唯一后，一个手机号只能注册一个患者
- 身份证号用于唯一标识（需符合隐私法规）

#### 步骤 2：修改后端接口

**文件**：`server/src/patients/patients.service.ts`

```typescript
// 修改 create 方法，添加唯一性检查
async create(data: any) {
  const supabase = getSupabaseClient()

  // 检查手机号是否已存在
  if (data.phone) {
    const { data: existing } = await supabase
      .from('members')
      .select('uuid')
      .eq('phone', data.phone)
      .single()

    if (existing) {
      throw new BadRequestException('该手机号已注册')
    }
  }

  // 检查身份证号是否已存在
  if (data.identityCard) {
    const { data: existing } = await supabase
      .from('members')
      .select('uuid')
      .eq('identity_card', data.identityCard)
      .single()

    if (existing) {
      throw new BadRequestException('该身份证号已注册')
    }
  }

  // 创建患者
  const { data: member, error } = await supabase
    .from('members')
    .insert({
      uuid: crypto.randomUUID(),
      name: data.name,
      phone: data.phone,
      identity_card: data.identityCard,
      gender: data.gender,
      age: data.age,
      // ... 其他字段
    })
    .select()
    .single()

  if (error) {
    throw new BadRequestException(error.message)
  }

  return convertToCamelCase(member)
}
```

#### 步骤 3：修改前端显示逻辑

**患者列表显示格式**：
```
张三
手机：138****0001 | 年龄：35 | 就诊次数：5

张三
手机：139****0002 | 年龄：28 | 就诊次数：3
```

**实现代码**：

```tsx
// 患者列表项
<View className="flex items-center justify-between p-4 bg-white rounded-lg mb-2">
  <View className="flex-1">
    <Text className="block text-lg font-semibold text-gray-900">
      {patient.name}
    </Text>
    <View className="flex items-center gap-2 mt-1">
      <Text className="block text-sm text-gray-500">
        手机：{maskPhone(patient.phone)}
      </Text>
      <Text className="block text-sm text-gray-500">|</Text>
      <Text className="block text-sm text-gray-500">
        年龄：{patient.age}岁
      </Text>
      <Text className="block text-sm text-gray-500">|</Text>
      <Text className="block text-sm text-gray-500">
        就诊次数：{patient.visitCount}
      </Text>
    </View>
  </View>
</View>

// 手机号脱敏函数
const maskPhone = (phone: string) => {
  if (!phone) return '未设置'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}
```

#### 步骤 4：添加患者确认弹窗

```tsx
// 选择患者时显示详细信息
const handleSelectPatientConfirm = (patient: any) => {
  Taro.showModal({
    title: '确认患者信息',
    content: `
姓名：${patient.name}
性别：${patient.gender}
年龄：${patient.age}岁
手机：${maskPhone(patient.phone)}
地址：${patient.address || '未设置'}
    `.trim(),
    confirmText: '确认选择',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        setSelectedPatient(patient)
      }
    }
  })
}
```

---

### 方案 2：添加患者唯一标识码（推荐 ⭐⭐⭐⭐）

**思路**：为每个患者生成唯一标识码（如就诊编号、患者编号）

#### 步骤 1：添加患者编号字段

```sql
-- 添加患者编号字段
ALTER TABLE members
ADD COLUMN IF NOT EXISTS patient_code VARCHAR(20) UNIQUE;

-- 为现有患者生成编号
UPDATE members
SET patient_code = 'P' || TO_CHAR(created_at, 'YYYYMMDD') || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0')
WHERE patient_code IS NULL;

-- 添加索引
CREATE INDEX idx_members_patient_code ON members(patient_code);
```

**编号格式**：`P202403010001`（P + 日期 + 序号）

#### 步骤 2：修改前端显示

```tsx
<View className="flex items-center justify-between p-4 bg-white rounded-lg mb-2">
  <View className="flex-1">
    <View className="flex items-center gap-2">
      <Text className="block text-lg font-semibold text-gray-900">
        {patient.name}
      </Text>
      <Text className="block text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
        {patient.patientCode}
      </Text>
    </View>
    <View className="flex items-center gap-2 mt-1">
      <Text className="block text-sm text-gray-500">
        年龄：{patient.age}岁
      </Text>
      <Text className="block text-sm text-gray-500">|</Text>
      <Text className="block text-sm text-gray-500">
        就诊次数：{patient.visitCount}
      </Text>
    </View>
  </View>
</View>
```

---

### 方案 3：智能搜索与模糊匹配（推荐 ⭐⭐⭐）

**思路**：提供多维度搜索，帮助用户快速找到目标患者

#### 步骤 1：添加搜索接口

```typescript
// server/src/patients/patients.service.ts
async search(keyword: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .or(`name.ilike.%${keyword}%,phone.ilike.%${keyword}%,patient_code.ilike.%${keyword}%`)
    .order('created_at', { ascending: false })

  if (error) {
    throw new BadRequestException(error.message)
  }

  return convertToCamelCase(data || [])
}
```

#### 步骤 2：前端搜索功能

```tsx
// 患者列表页面
const [keyword, setKeyword] = useState('')

const handleSearch = async (value: string) => {
  setKeyword(value)

  if (value.length === 0) {
    // 显示所有患者
    fetchPatients()
    return
  }

  if (value.length < 2) return  // 至少输入 2 个字符

  const res = await Network.request({
    url: `/api/members/search?keyword=${encodeURIComponent(value)}`,
    method: 'GET'
  })

  setPatients(res.data.data)
}

// 搜索框
<View className="mb-4">
  <Input
    className="w-full bg-gray-100 rounded-lg px-4 py-3"
    placeholder="搜索姓名/手机号/患者编号"
    value={keyword}
    onInput={(e) => handleSearch(e.detail.value)}
  />
</View>
```

---

### 方案 4：患者头像（推荐 ⭐⭐⭐）

**思路**：为每个患者添加头像，更容易识别

#### 步骤 1：添加头像字段

```sql
ALTER TABLE members
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
```

#### 步骤 2：修改前端显示

```tsx
<Image
  src={patient.avatarUrl || '/assets/default-avatar.png'}
  className="w-12 h-12 rounded-full mr-3"
/>
```

---

## 推荐实施组合

### 最佳实践组合（推荐）：

**方案 1 + 方案 2 + 方案 3**

1. **手机号唯一性**：防止重复注册
2. **患者编号**：便于快速识别
3. **智能搜索**：方便查找
4. **确认弹窗**：防止误选

### 实施优先级：

1. **立即实施**（高优先级）：
   - ✅ 手机号唯一性检查
   - ✅ 患者列表显示更多信息（手机号、年龄、就诊次数）
   - ✅ 选择患者时的确认弹窗

2. **短期实施**（中优先级）：
   - ✅ 添加患者编号
   - ✅ 智能搜索功能

3. **长期优化**（低优先级）：
   - ⭕ 患者头像
   - ⭕ 身份证号唯一性（需评估隐私法规）

---

## 数据隐私注意事项

1. **手机号脱敏显示**：138****0001
2. **身份证号加密存储**：使用 AES 加密
3. **访问权限控制**：只有医生可以查看完整信息
4. **操作日志记录**：记录患者信息访问历史

---

## 测试用例

### 场景 1：创建同名患者

```
输入：
- 姓名：张三
- 手机号：13800138001
- 年龄：35

结果：
✅ 创建成功
✅ 患者编号：P202403010001
```

### 场景 2：重复手机号

```
输入：
- 姓名：李四
- 手机号：13800138001（已存在）

结果：
❌ 创建失败
❌ 提示：该手机号已注册
```

### 场景 3：选择同名患者

```
患者列表：
- 张三 | 138****0001 | 35岁 | 就诊5次 | P202403010001
- 张三 | 139****0002 | 28岁 | 就诊3次 | P202403010002

操作：点击第一个张三

结果：
✅ 弹出确认弹窗
✅ 显示详细信息
✅ 用户确认后才选中
```

### 场景 4：搜索患者

```
搜索关键词：138

结果：
- 张三 | 138****0001 | 35岁 | 就诊5次 | P202403010001
- 李四 | 138****0003 | 30岁 | 就诊2次 | P202403010003
```

---

## 总结

**推荐实施方案**：方案 1 + 方案 2 + 方案 3

**核心改进**：
1. ✅ 手机号唯一性检查
2. ✅ 患者编号生成
3. ✅ 患者列表显示更多信息
4. ✅ 选择患者时的确认弹窗
5. ✅ 智能搜索功能

**效果**：
- ✅ 可以准确区分同名患者
- ✅ 防止选错患者
- ✅ 提高操作效率
- ✅ 保护数据隐私
