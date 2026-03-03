@echo off
REM Vercel 快速部署脚本 (Windows)
REM 使用方法：deploy-to-vercel.bat

echo ==========================================
echo   Vercel 快速部署脚本 (Windows)
echo ==========================================
echo.

REM 检查是否安装了 Vercel CLI
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [YELLOW]正在安装 Vercel CLI...[NC]
    npm install -g vercel
)

REM 检查是否已登录
echo [YELLOW]检查 Vercel 登录状态...[NC]
vercel whoami >nul 2>&1

if %errorlevel% neq 0 (
    echo [YELLOW]请先登录 Vercel...[NC]
    vercel login
)

REM 检查是否有 .env 文件
if not exist .env (
    echo [YELLOW]创建 .env 文件...[NC]
    echo NODE_ENV=production > .env
)

REM 检查 Git 仓库
if not exist .git (
    echo [YELLOW]初始化 Git 仓库...[NC]
    git init
    git add .
    git commit -m "Initial commit"
    echo [GREEN]✓ Git 仓库已初始化[NC]
) else (
    echo [GREEN]✓ Git 仓库已存在[NC]
)

REM 检查远程仓库
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [YELLOW]请设置 GitHub 远程仓库...[NC]
    echo [YELLOW]步骤：[NC]
    echo 1. 在 GitHub 上创建新仓库
    echo 2. 运行：git remote add origin https://github.com/你的用户名/仓库名.git
    echo 3. 运行：git push -u origin main
    echo.
    echo [RED]请先设置远程仓库，然后再运行此脚本[NC]
    pause
    exit /b 1
)

REM 推送代码
echo [YELLOW]推送代码到 GitHub...[NC]
git push -u origin main

if %errorlevel% neq 0 (
    echo [RED]推送失败！请检查网络连接[NC]
    pause
    exit /b 1
)

echo [GREEN]✓ 代码已推送到 GitHub[NC]

REM 部署到 Vercel
echo.
echo [YELLOW]开始部署到 Vercel...[NC]
echo.

vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo [GREEN]==========================================
    echo   🎉 部署成功！
    echo ==========================================
    echo.
    echo [GREEN]✓ 你的网站已成功部署到 Vercel[NC]
    echo.
    echo 访问地址：
    echo   - 首页：https://你的项目名.vercel.app
    echo   - 下载页：https://你的项目名.vercel.app/pages/download/index
    echo.
    echo 手机访问：
    echo   直接在手机浏览器输入上述地址
    echo.
    echo 下一步：
    echo   1. 访问 Vercel 控制台查看部署详情
    echo   2. 配置自定义域名（可选）
    echo   3. 在手机上添加到主屏幕（获得 APP 体验）
    echo.
) else (
    echo.
    echo [RED]==========================================
    echo   ❌ 部署失败
    echo ==========================================
    echo.
    echo 请检查错误信息并重试
    echo.
    pause
    exit /b 1
)

pause
