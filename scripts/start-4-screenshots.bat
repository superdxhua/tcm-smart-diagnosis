@echo off
chcp 65001 >nul
echo 📸 微信平台审核4张截图快速启动
echo ================================
echo.
echo 微信平台要求提供以下4张截图：
echo   1. APP首页截图
echo   2. 尾页截图（免责声明）
echo   3. 应用内截图
echo   4. 支付页截图
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
echo 📋 截图清单和访问地址
echo ================================
echo.
echo 🏠 第1张：APP首页截图
echo    说明：小程序主入口，展示主要功能
echo    访问地址：http://localhost:5000/pages/index/index
echo    保存为：1-APP首页.png
echo.
echo 📄 第2张：尾页截图（免责声明）
echo    说明：免责声明页面，风险提示（医疗类必需）
echo    访问地址：http://localhost:5000/pages/disclaimer/index
echo    保存为：2-尾页（免责声明）.png
echo.
echo 🔍 第3张：应用内截图
echo    说明：智能诊疗功能，核心功能展示
echo    访问地址：http://localhost:5000/pages/index/index
echo    操作：点击「开始诊疗」按钮
echo    保存为：3-应用内（智能诊疗）.png
echo.
echo 💳 第4张：支付页截图
echo    说明：购买服务页面，套餐选择
echo    访问地址：http://localhost:5000/pages/index/index
echo    操作：点击「购买服务」或相关按钮
echo    保存为：4-支付页.png
echo.

echo 💡 截图工具快捷键：
echo    Windows: Win + Shift + S
echo.

echo 📝 截图规范：
echo    - 格式：PNG 或 JPG（推荐 PNG）
echo    - 宽度：750px 或以上
echo    - 大小：单张不超过 2MB
echo.

echo 📖 详细指南：
echo    - 4张截图详解：docs\wechat-4-screenshots-guide.md
echo.

echo 🚀 自动打开浏览器...
echo.

REM 打开第1张：APP首页
echo 打开第1张：APP首页...
start http://localhost:5000/pages/index/index

REM 等待2秒
timeout /t 2 /nobreak >nul

REM 打开第2张：免责声明
echo 打开第2张：免责声明...
start http://localhost:5000/pages/disclaimer/index

echo.
echo ⏱️ 预计时间：
echo    准备工作：5 分钟
echo    截图4个页面：15 分钟
echo    检查质量：5 分钟
echo    总计：约 25 分钟
echo.
echo 提示：浏览器已自动打开前2张截图页面，请依次截图
echo.
pause
