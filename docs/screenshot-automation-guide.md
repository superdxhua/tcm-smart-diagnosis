# 微信审核截图自动化脚本

本脚本帮助您快速生成所有需要审核的页面截图。

## 准备工作

### 1. 确保开发服务器运行

```bash
cd /workspace/projects
coze dev
```

服务器将在以下地址运行：
- **H5 前端**：http://localhost:5000
- **后端 API**：http://localhost:3000

### 2. 准备测试数据

在生成截图前，请确保以下数据已准备好：

#### 必需数据
- ✅ 至少一个测试用户（admin / 密码）
- ✅ 至少一个示例患者（姓名、性别、年龄）
- ✅ 至少一份示例病历
- ✅ 至少一份示例处方
- ✅ 示例签到记录

#### 创建测试数据

```bash
# 创建测试用户
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456","role":"user"}'

# 登录获取 token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 截图页面列表

### 必须截图（5张）

#### 1. 首页

**URL**: http://localhost:5000
**说明**: 展示小程序主要功能
**关键内容**:
- 标题：「中医智能诊疗好帮手」
- 主要功能按钮：「开始诊疗」、「患者管理」、「病历管理」
- 每日签到入口
- AI 对话入口
- 学习中心入口

**截图要点**:
- ✅ 确保所有按钮可见
- ✅ 显示签到状态（如「已连续签到 3 天」）
- ✅ 使用真实数据

---

#### 2. 登录页

**URL**: http://localhost:5000/pages/login/index
**说明**: 展示用户登录流程
**关键内容**:
- 登录表单
- 用户名输入框
- 密码输入框
- 登录按钮
- 「扫码登录」选项

**截图要点**:
- ✅ 输入框有占位符（如「请输入用户名」）
- ✅ 登录按钮清晰可见
- ✅ 密码输入框显示为圆点

---

#### 3. 免责声明页

**URL**: http://localhost:5000/pages/disclaimer/index
**说明**: 展示免责声明内容（医疗小程序必需）
**关键内容**:
- 完整的免责声明文本
- 「我已阅读并同意」勾选框
- 确认按钮

**截图要点**:
- ✅ 确保免责声明内容完整显示
- ✅ 勾选框和按钮清晰可见
- ✅ 文字清晰可读

---

#### 4. 患者列表页

**URL**: http://localhost:5000/pages/patients-list/index
**说明**: 展示患者管理功能
**关键内容**:
- 患者列表
- 添加患者按钮
- 搜索框
- 示例患者数据

**截图要点**:
- ✅ 至少显示 2-3 个示例患者
- ✅ 患者信息完整（姓名、性别、年龄）
- ✅ 添加患者按钮可见

**示例数据**:
```
患者 1: 张三, 男, 45岁
患者 2: 李四, 女, 38岁
```

---

#### 5. 智能诊疗页

**URL**: http://localhost:5000/pages/index/index（点击「开始诊疗」）
**说明**: 展示核心诊疗功能
**关键内容**:
- 症状输入框
- 提交按钮
- 历史记录
- AI 分析结果示例

**截图要点**:
- ✅ 显示症状输入界面
- ✅ 显示诊断结果（如有）
- ✅ 处方建议清晰可见

**示例数据**:
```
症状: 头痛，失眠，食欲不振
诊断: 肝郁脾虚
建议: 疏肝健脾，调理脾胃
```

---

### 建议截图（3张）

#### 6. 病历列表页

**URL**: http://localhost:5000/pages/records-list/index
**说明**: 展示病历管理功能
**关键内容**:
- 病历列表
- 「待开方」标记
- 病历日期

**截图要点**:
- ✅ 显示示例病历（2-3 条）
- ✅ 标记「待开方」状态

---

#### 7. 病历详情页

**URL**: http://localhost:5000/pages/record-detail/index?id=[病历ID]
**说明**: 展示病历详情
**关键内容**:
- 患者信息
- 主诉症状
- 诊断结果
- 处方内容
- 风险提示（如有）

**截图要点**:
- ✅ 显示完整的病历信息
- ✅ 处方内容清晰
- ✅ 显示风控提示（如有）

---

#### 8. 处方页面

**URL**: http://localhost:5000/pages/prescription-adjust/index?id=[病历ID]
**说明**: 展示处方功能
**关键内容**:
- 处方标题
- 药材列表
- 用法用量
- 风险提示（如有）

**截图要点**:
- ✅ 显示完整处方
- ✅ 药材列表清晰
- ✅ 显示用法用量

---

### 可选截图（2张）

#### 9. 学习中心页

**URL**: http://localhost:5000/pages/learning-center/index
**说明**: 展示学习资源
**关键内容**:
- 学习资源列表
- 经典医案
- 中医理论

**截图要点**:
- ✅ 显示示例学习资源

---

#### 10. AI 聊天页

**URL**: http://localhost:5000/pages/ai-chat/index
**说明**: 展示 AI 对话功能
**关键内容**:
- 聊天界面
- 对话记录
- 输入框

**截图要点**:
- ✅ 显示示例对话

---

## 快速截图流程

### 步骤 1：启动开发服务器

```bash
cd /workspace/projects
coze dev
```

### 步骤 2：打开浏览器

使用浏览器（Chrome/Edge/Firefox）访问 H5 版本：
```
http://localhost:5000
```

### 步骤 3：依次访问页面并截图

按照以下顺序访问页面并截图：

1. **首页**
   - URL: http://localhost:5000
   - 截图：`1-首页.png`

2. **登录页**
   - URL: http://localhost:5000/pages/login/index
   - 截图：`2-登录页.png`

3. **免责声明页**
   - URL: http://localhost:5000/pages/disclaimer/index
   - 截图：`3-免责声明.png`

4. **患者列表页**
   - 先登录（使用 admin / admin123）
   - URL: http://localhost:5000/pages/patients-list/index
   - 截图：`4-患者列表.png`

5. **智能诊疗页**
   - URL: http://localhost:5000/pages/index/index
   - 点击「开始诊疗」
   - 截图：`5-智能诊疗.png`

6. **病历列表页**
   - URL: http://localhost:5000/pages/records-list/index
   - 截图：`6-病历列表.png`

7. **病历详情页**
   - 从病历列表点击任意病历
   - 截图：`7-病历详情.png`

8. **处方页面**
   - 从病历详情点击处方
   - 截图：`8-处方页面.png`

9. **学习中心页**
   - URL: http://localhost:5000/pages/learning-center/index
   - 截图：`9-学习中心.png`

10. **AI 聊天页**
    - URL: http://localhost:5000/pages/ai-chat/index
    - 截图：`10-AI聊天.png`

### 步骤 4：检查截图质量

- ✅ 图片格式：PNG 或 JPG
- ✅ 图片宽度：750px 或以上
- ✅ 图片大小：单张不超过 2MB
- ✅ 内容完整：显示完整页面
- ✅ 数据真实：包含示例数据

### 步骤 5：上传到微信公众平台

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入小程序管理
3. 点击「版本管理」→「提交审核」
4. 按顺序上传截图
5. 提交审核

---

## 截图技巧

### 浏览器截图快捷键

- **Windows**: `Win + Shift + S`（截图工具）
- **Mac**: `Cmd + Shift + 4`（区域截图）
- **Chrome 开发者工具**: `Ctrl + Shift + P` → 输入 "Capture screenshot"

### 保持截图一致

1. **使用相同的浏览器**
2. **使用相同的缩放比例**（100%）
3. **使用相同的截图方式**
4. **保持相同的图片尺寸**

### 优化截图质量

1. **使用高清屏幕**（1080p 或更高）
2. **确保页面加载完成**
3. **避免模糊**（检查截图清晰度）
4. **保存为 PNG 格式**

---

## 自动化截图脚本（可选）

如果需要自动化截图，可以使用以下方法：

### 方法 1：使用 Puppeteer（推荐）

1. 安装 Puppeteer：
   ```bash
   pnpm add -D -w puppeteer
   ```

2. 创建截图脚本 `scripts/screenshot.js`：
   ```javascript
   const puppeteer = require('puppeteer');

   const pages = [
     { url: 'http://localhost:5000', name: '1-首页' },
     { url: 'http://localhost:5000/pages/login/index', name: '2-登录页' },
     { url: 'http://localhost:5000/pages/disclaimer/index', name: '3-免责声明' },
     // ... 添加其他页面
   ];

   (async () => {
     const browser = await puppeteer.launch();
     const page = await browser.newPage();

     for (const pageInfo of pages) {
       await page.goto(pageInfo.url);
       await page.screenshot({ path: `screenshots/${pageInfo.name}.png`, fullPage: true });
       console.log(`已截图: ${pageInfo.name}`);
     }

     await browser.close();
   })();
   ```

3. 运行脚本：
   ```bash
   node scripts/screenshot.js
   ```

### 方法 2：使用 Playwright

1. 安装 Playwright：
   ```bash
   pnpm add -D -w @playwright/test
   ```

2. 创建截图脚本并运行。

---

## 常见问题

### Q1: 如何获取病历 ID？

**A**: 访问病历列表页，查看 URL 参数或从页面中获取。

### Q2: 截图需要登录吗？

**A**:
- 首页、登录页、免责声明页：不需要登录
- 其他页面：需要登录（使用 admin / admin123）

### Q3: 截图可以修改吗？

**A**: ❌ 不建议。应使用原始截图，保持真实性。

### Q4: H5 版和小程序版截图有区别吗？

**A**: 有轻微区别，但审核通常接受 H5 版截图。建议使用 H5 版截图更方便。

---

## 检查清单

上传截图前，使用此清单检查：

### 截图完整性
- [ ] 首页截图（`1-首页.png`）
- [ ] 登录页截图（`2-登录页.png`）
- [ ] 免责声明截图（`3-免责声明.png`）
- [ ] 患者列表截图（`4-患者列表.png`）
- [ ] 智能诊疗截图（`5-智能诊疗.png`）
- [ ] 病历列表截图（`6-病历列表.png`）
- [ ] 病历详情截图（`7-病历详情.png`）
- [ ] 处方页面截图（`8-处方页面.png`）

### 截图质量
- [ ] 图片格式正确（PNG 或 JPG）
- [ ] 图片宽度符合要求（750px+）
- [ ] 图片大小符合要求（< 2MB）
- [ ] 内容完整清晰
- [ ] 包含真实数据

### 内容合规
- [ ] 无违规医疗信息
- [ ] 无虚假宣传
- [ ] 免责声明完整
- [ ] 文字清晰可读

---

## 总结

### 快速流程

1. 启动开发服务器：`coze dev`
2. 访问 H5 版：http://localhost:5000
3. 依次访问 10 个页面并截图
4. 检查截图质量
5. 上传到微信公众平台

### 预计时间

- 准备工作：10 分钟
- 截图：30 分钟
- 检查：10 分钟
- **总计**：约 50 分钟

### 关键要点

- ✅ 使用 H5 版截图更方便
- ✅ 确保页面有真实数据
- ✅ 免责声明必须清晰完整
- ✅ 按顺序截图并命名
- ✅ 检查图片质量和大小

---

**最后更新时间**：2024-02-15
