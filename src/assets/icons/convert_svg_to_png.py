#!/usr/bin/env python3
"""
SVG 转 PNG 工具
将 SVG 图标转换为微信小程序所需的 PNG 格式
"""

import subprocess
import sys
import os
from pathlib import Path

def check_dependencies():
    """检查是否安装了必要的转换工具"""
    tools = {
        'convert': 'ImageMagick',
        'inkscape': 'Inkscape',
        'rsvg-convert': 'librsvg'
    }

    available_tools = []
    for tool, name in tools.items():
        try:
            result = subprocess.run(
                ['which', tool],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                available_tools.append(tool)
                print(f"✓ 检测到 {name} ({tool})")
        except Exception as e:
            print(f"✗ 未检测到 {name}")

    return available_tools

def convert_svg_to_png(svg_path, png_path, size=512, tool=None):
    """
    将 SVG 文件转换为 PNG

    参数:
        svg_path: SVG 文件路径
        png_path: 输出 PNG 文件路径
        size: 输出尺寸（默认 512x512）
        tool: 使用的转换工具
    """
    if not tool:
        available_tools = check_dependencies()
        if not available_tools:
            print("\n❌ 未检测到任何转换工具！")
            print("\n请安装以下工具之一：")
            print("  1. ImageMagick: brew install imagemagick (macOS) 或 sudo apt-get install imagemagick (Ubuntu)")
            print("  2. Inkscape: brew install --cask inkscape (macOS) 或 sudo apt-get install inkscape (Ubuntu)")
            print("  3. librsvg: brew install librsvg (macOS) 或 sudo apt-get install librsvg2-bin (Ubuntu)")
            print("\n或者使用在线转换工具：")
            print("  https://cloudconvert.com/svg-to-png")
            return False
        tool = available_tools[0]
        print(f"\n使用 {tool} 进行转换")

    try:
        print(f"\n正在转换: {svg_path} -> {png_path}")

        if tool == 'convert':
            # 使用 ImageMagick
            cmd = [
                'convert',
                svg_path,
                '-resize', f'{size}x{size}',
                png_path
            ]
        elif tool == 'inkscape':
            # 使用 Inkscape
            cmd = [
                'inkscape',
                svg_path,
                '--export-filename', png_path,
                '--export-width', str(size),
                '--export-height', str(size)
            ]
        elif tool == 'rsvg-convert':
            # 使用 rsvg-convert
            cmd = [
                'rsvg-convert',
                '-w', str(size),
                '-h', str(size),
                svg_path,
                '-o', png_path
            ]
        else:
            print(f"❌ 不支持的转换工具: {tool}")
            return False

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            # 检查输出文件是否存在
            if os.path.exists(png_path):
                file_size = os.path.getsize(png_path) / 1024  # KB
                print(f"✓ 转换成功！文件大小: {file_size:.2f} KB")
                return True
            else:
                print("❌ 转换失败：输出文件未生成")
                return False
        else:
            print(f"❌ 转换失败：{result.stderr}")
            return False

    except Exception as e:
        print(f"❌ 转换失败：{str(e)}")
        return False

def batch_convert(icon_dir='src/assets/icons', size=512):
    """批量转换目录中的所有 SVG 文件"""
    icon_path = Path(icon_dir)

    if not icon_path.exists():
        print(f"❌ 目录不存在: {icon_path}")
        return

    svg_files = list(icon_path.glob('logo-*.svg'))

    if not svg_files:
        print(f"❌ 在 {icon_path} 中未找到 SVG 文件")
        return

    print(f"\n找到 {len(svg_files)} 个 SVG 文件")

    # 检查可用的转换工具
    available_tools = check_dependencies()
    if not available_tools:
        print("\n提示：您可以使用在线工具进行转换")
        print("https://cloudconvert.com/svg-to-png")
        return

    tool = available_tools[0]

    # 转换每个文件
    success_count = 0
    for svg_file in svg_files:
        png_file = svg_file.with_suffix('.png')
        if convert_svg_to_png(str(svg_file), str(png_file), size, tool):
            success_count += 1
        print()

    print(f"\n{'='*50}")
    print(f"转换完成！成功: {success_count}/{len(svg_files)}")
    print(f"{'='*50}")

    # 显示转换后的文件
    png_files = list(icon_path.glob('logo-*.png'))
    if png_files:
        print(f"\n生成的 PNG 文件：")
        for png_file in png_files:
            file_size = png_file.stat().st_size / 1024  # KB
            print(f"  - {png_file.name} ({file_size:.2f} KB)")

def main():
    """主函数"""
    print("="*50)
    print("SVG 转 PNG 工具")
    print("="*50)

    if len(sys.argv) > 1:
        # 命令行参数模式
        svg_file = sys.argv[1]
        png_file = sys.argv[2] if len(sys.argv) > 2 else svg_file.replace('.svg', '.png')
        convert_svg_to_png(svg_file, png_file)
    else:
        # 批量转换模式
        print("\n正在检查可用的转换工具...\n")
        batch_convert()

    print("\n提示：您也可以使用在线转换工具")
    print("https://cloudconvert.com/svg-to-png")

if __name__ == '__main__':
    main()
