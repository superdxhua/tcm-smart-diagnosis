@echo off
chcp 65001 >nul
echo 📸 微信审核截图快速启动
echo ==========================
echo.

REM 检查开发服务器是否运行
echo 🔍 检查开发服务器状态...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ✅ 开发服务器已在运行
) else (
    echo 🚀 启动开发服务器...
    start /B coze dev
    echo ⏳ 等待服务器启动...
    timeout /t 5 /nobreak >nul
)

echo.
echo 📋 访问截图导航页面
echo ==========================
echo.
echo 🔗 截图导航页面：
echo    http://localhost:5000/screenshot-navigation.html
echo.
echo 💡 使用说明：
echo    1. 点击上述链接打开截图导航页面
echo    2. 依次访问每个页面并截图
echo    3. 使用浏览器截图工具（Win+Shift+S）
echo    4. 建议将截图保存为：1-首页.png、2-登录页.png 等格式
echo.
echo 📝 截图规范：
echo    - 格式：PNG 或 JPG
echo    - 宽度：750px 或以上
echo    - 大小：单张不超过 2MB
echo    - 数量：最少 3 张，最多 10 张
echo.
echo ✅ 必须截图的页面（5张）：
echo    1. 首页
echo    2. 登录页
echo    3. 免责声明页
echo    4. 患者列表页
echo    5. 智能诊疗页
echo.
echo 📖 详细文档：
echo    - 截图准备指南：docs\wechat-audit-screenshot-guide.md
echo    - 自动化指南：docs\screenshot-automation-guide.md
echo.

REM 自动打开浏览器
echo 🚀 正在打开截图导航页面...
start http://localhost:5000/screenshot-navigation.html

echo.
pause
