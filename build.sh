#!/bin/bash

# 智能中医辅助诊疗系统 - 多平台构建脚本

set -e  # 遇到错误立即退出

echo "========================================="
echo "  智能中医辅助诊疗系统 - 多平台构建脚本"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检测操作系统
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        print_error "不支持的操作系统: $OSTYPE"
        exit 1
    fi
    print_success "检测到操作系统: $OS"
}

# 检查 Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    NODE_VERSION=$(node -v)
    print_success "Node.js 版本: $NODE_VERSION"
}

# 检查 npm/pnpm
check_package_manager() {
    if command -v pnpm &> /dev/null; then
        PKG_MANAGER="pnpm"
    elif command -v npm &> /dev/null; then
        PKG_MANAGER="npm"
    else
        print_error "未找到 npm 或 pnpm，请先安装"
        exit 1
    fi
    print_success "包管理器: $PKG_MANAGER"
}

# 构建 H5 版本
build_web() {
    print_info "开始构建 H5 版本..."
    $PKG_MANAGER build:web
    print_success "H5 版本构建完成！"
    print_info "构建产物位于: dist-web/"
}

# 构建小程序版本
build_weapp() {
    print_info "开始构建微信小程序版本..."
    $PKG_MANAGER build:weapp
    print_success "微信小程序版本构建完成！"
    print_info "构建产物位于: dist/"
}

# 构建电脑版（Electron）
build_electron() {
    print_info "开始构建电脑版（Electron）..."

    # 检查 electron 目录是否存在
    if [ ! -d "electron" ]; then
        print_error "electron 目录不存在！"
        exit 1
    fi

    cd electron

    # 检查图标文件
    ICON_ERROR=0
    if [ "$OS" == "windows" ] && [ ! -f "icon.ico" ]; then
        print_warning "未找到 icon.ico，将使用默认图标"
        ICON_ERROR=1
    elif [ "$OS" == "macos" ] && [ ! -f "icon.icns" ]; then
        print_warning "未找到 icon.icns，将使用默认图标"
        ICON_ERROR=1
    elif [ "$OS" == "linux" ] && [ ! -f "icon.png" ]; then
        print_warning "未找到 icon.png，将使用默认图标"
        ICON_ERROR=1
    fi

    if [ $ICON_ERROR -eq 1 ]; then
        print_info "图标制作指南请参考: electron/图标说明.md"
    fi

    # 安装依赖
    print_info "安装 Electron 依赖..."
    $PKG_MANAGER install

    # 根据平台构建
    if [ "$OS" == "windows" ]; then
        print_info "构建 Windows 版本..."
        $PKG_MANAGER run build:win
        print_success "Windows 版本构建完成！"
        print_info "安装包位于: electron/dist/"
    elif [ "$OS" == "macos" ]; then
        print_info "构建 macOS 版本..."
        $PKG_MANAGER run build:mac
        print_success "macOS 版本构建完成！"
        print_info "安装包位于: electron/dist/"
    elif [ "$OS" == "linux" ]; then
        print_info "构建 Linux 版本..."
        $PKG_MANAGER run build:linux
        print_success "Linux 版本构建完成！"
        print_info "安装包位于: electron/dist/"
    fi

    cd ..
}

# 显示帮助信息
show_help() {
    echo "用法: ./build.sh [选项]"
    echo ""
    echo "选项:"
    echo "  web       构建 H5 网页版"
    echo "  weapp     构建微信小程序版本"
    echo "  electron  构建电脑版（Electron）"
    echo "  all       构建所有版本"
    echo "  help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./build.sh web         # 只构建 H5 版本"
    echo "  ./build.sh electron    # 只构建电脑版"
    echo "  ./build.sh all         # 构建所有版本"
}

# 主函数
main() {
    # 如果没有参数，显示帮助信息
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi

    # 检测环境
    detect_os
    check_node
    check_package_manager

    # 根据参数执行构建
    case "$1" in
        web)
            build_web
            ;;
        weapp)
            build_weapp
            ;;
        electron)
            build_electron
            ;;
        all)
            print_info "开始构建所有版本..."
            echo ""
            build_web
            echo ""
            build_weapp
            echo ""
            build_electron
            echo ""
            print_success "所有版本构建完成！"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知选项: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac

    echo ""
    print_success "构建完成！"
}

# 执行主函数
main "$@"
