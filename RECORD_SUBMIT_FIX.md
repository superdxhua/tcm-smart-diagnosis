# 病历提交问题修复说明

## 问题描述
用户在新增病历页面输入主诉后无法提交。

## 问题原因
前端提交的数据格式不符合后端要求，缺少以下必填字段：
1. `prescription`（处方）：后端要求必填
2. `visitNumber`（就诊次数）：后端要求必填
3. 字段名不匹配（如 `symptoms` vs `history`，`doctorName` vs `doctorId`）

## 修复内容

### 1. 修复提交数据格式
修改 `src/pages/record-detail/index.tsx` 中的 `handleSave` 函数：

```typescript
// 构建符合后端要求的数据格式
const submitData = {
  patientId: formData.patientId,
  doctorId: formData.doctorName || 'default-doctor',
  visitNumber: 1, // 默认为 1
  chiefComplaint: formData.chiefComplaint,
  history: formData.symptoms || '',
  pastHistory: '',
  diagnosis: formData.diagnosis || '',
  differentiation: '',
  treatmentPrinciple: '',
  prescription: '待开方', // 默认处方
  advice: '',
  status: '进行中'
}
```

### 2. 改进错误提示
如果 `patientId` 缺失，显示更详细的错误信息：
- 提示"患者信息缺失，请重新添加患者"
- 自动跳转到患者列表页面

### 3. 添加调试日志
在提交过程中打印详细的调试信息：
- `formData` 完整内容
- `patientId` 值和类型
- `chiefComplaint` 值
- 提交的完整数据
- 响应状态码和数据

## 后端接口要求

### 创建病历（POST /api/medical-records）

**必填字段**：
- `patientId`: 患者ID
- `visitNumber`: 就诊次数
- `chiefComplaint`: 主诉
- `prescription`: 处方

**可选字段**：
- `doctorId`: 医师ID（默认 'default-doctor'）
- `history`: 现病史
- `pastHistory`: 既往史
- `diagnosis`: 诊断
- `differentiation`: 辨证
- `treatmentPrinciple`: 治则
- `advice`: 建议
- `status`: 状态（默认 'active'）

## 使用流程

### 正常流程
1. 进入患者列表页面
2. 点击"添加患者"
3. 填写患者信息（姓名、年龄为必填）
4. 点击"下一步：填写病历"
5. 自动跳转到病历页面，携带 `patientId`
6. 填写主诉（必填）
7. 点击"提交"按钮
8. 病历保存成功

### 调试方法
1. 打开浏览器控制台
2. 按照正常流程操作
3. 查看控制台日志：
   - `=== 开始保存病历 ===`
   - `formData: {...}`
   - `patientId: ...`
   - `chiefComplaint: ...`
   - `提交病历数据: {...}`
   - `响应状态码: ...`
   - `响应数据: ...`

## 常见问题

### 问题1：提示"患者信息缺失"
**原因**：`patientId` 没有正确传递
**解决**：
- 确保从患者页面点击"下一步"跳转
- 不要直接访问病历页面
- 如果提示出现，点击"确定"后会自动跳转到患者列表

### 问题2：提示"请输入主诉"
**原因**：主诉字段为空
**解决**：填写主诉后再提交

### 问题3：提交失败，后端报错"患者不存在"
**原因**：`patientId` 对应的患者在数据库中不存在
**解决**：
- 确保先保存患者信息
- 检查患者是否被删除
- 查看浏览器控制台的请求详情

## 验证测试

### 测试步骤
1. 创建新患者
   - 姓名：张三
   - 年龄：30
   - 性别：男
2. 点击"下一步：填写病历"
3. 填写主诉：头痛3天
4. 点击"提交"
5. 预期结果：提交成功，提示"添加成功"

### 检查点
- ✅ 患者信息保存成功
- ✅ 跳转到病历页面成功
- ✅ patientId 正确传递
- ✅ 主诉可以正常输入
- ✅ 提交按钮可以点击
- ✅ 提交成功显示提示
- ✅ 1.5秒后自动返回

## 修改文件清单
- `src/pages/record-detail/index.tsx` - 修复提交数据格式和错误提示

## 注意事项
1. `prescription` 字段默认为"待开方"，后续可以在首页生成处方
2. `visitNumber` 默认为 1，后续就诊会在后端自动递增
3. 所有调试日志都会在浏览器控制台显示，便于问题排查
4. 如果 `patientId` 缺失，会自动跳转到患者列表页面
