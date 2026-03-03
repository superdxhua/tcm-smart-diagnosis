#!/usr/bin/env python3
"""
生成 PWA 所需的所有图标尺寸
"""

import os
import sys
from pathlib import Path

# 尝试导入 cairosvg
try:
    import cairosvg
    CAIROSVG_AVAILABLE = True
except ImportError:
    CAIROSVG_AVAILABLE = False

def convert_svg_to_png(svg_path, png_path, size=None):
    """
    将 SVG 转换为 PNG

    参数:
        svg_path: SVG 文件路径
        png_path: 输出 PNG 文件路径
        size: 输出尺寸（可选）
    """
    if not CAIROSVG_AVAILABLE:
        print(f"❌ cairosvg 不可用，请安装：pip install cairosvg")
        return False

    try:
        print(f"转换中: {svg_path} -> {png_path} (尺寸: {size or '原始'})")

        kwargs = {}
        if size:
            kwargs['output_width'] = size
            kwargs['output_height'] = size

        cairosvg.svg2png(url=str(svg_path), write_to=str(png_path), **kwargs)

        # 检查输出文件是否存在
        if os.path.exists(png_path):
            file_size = os.path.getsize(png_path) / 1024  # KB
            print(f"✓ 成功！文件大小: {file_size:.2f} KB")
            return True
        else:
            print(f"❌ 失败：输出文件未生成")
            return False

    except Exception as e:
        print(f"❌ 转换失败：{str(e)}")
        return False

def resize_png(png_path, output_path, size):
    """
    调整 PNG 文件尺寸

    参数:
        png_path: 输入 PNG 文件路径
        output_path: 输出 PNG 文件路径
        size: 目标尺寸
    """
    try:
        from PIL import Image

        print(f"调整尺寸: {png_path} -> {output_path} ({size}x{size})")

        img = Image.open(png_path)
        img_resized = img.resize((size, size), Image.Resampling.LANCZOS)
        img_resized.save(output_path, 'PNG')

        file_size = os.path.getsize(output_path) / 1024  # KB
        print(f"✓ 成功！文件大小: {file_size:.2f} KB")
        return True

    except ImportError:
        print(f"❌ Pillow 不可用，无法调整尺寸")
        return False
    except Exception as e:
        print(f"❌ 调整尺寸失败：{str(e)}")
        return False

def generate_pwa_icons(svg_source, output_dir):
    """
    生成 PWA 所需的所有图标

    参数:
        svg_source: 源 SVG 文件路径
        output_dir: 输出目录
    """
    print("="*60)
    print("生成 PWA 图标")
    print("="*60)

    # 创建输出目录
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # PWA 所需的图标尺寸
    icon_sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]

    # 先生成最大尺寸的 PNG
    max_size = max(icon_sizes)
    base_png = output_path / f"base-{max_size}x{max_size}.png"

    print(f"\n步骤 1: 从 SVG 生成 {max_size}x{max_size} 基础图标")
    print("-"*60)

    if not convert_svg_to_png(svg_source, base_png, max_size):
        print(f"\n❌ 生成基础图标失败，无法继续")
        return False

    print(f"\n步骤 2: 生成所有尺寸的图标")
    print("-"*60)

    success_count = 0
    for size in icon_sizes:
        output_file = output_path / f"icon-{size}x{size}.png"

        if size == max_size:
            # 最大尺寸直接复制
            import shutil
            shutil.copy2(base_png, output_file)
            file_size = os.path.getsize(output_file) / 1024  # KB
            print(f"复制: {output_file.name} ({file_size:.2f} KB)")
            success_count += 1
        else:
            # 其他尺寸从基础图标调整
            if resize_png(base_png, output_file, size):
                success_count += 1

    # 删除基础图标
    if base_png.exists():
        base_png.unlink()

    print("\n" + "="*60)
    print(f"生成完成！成功: {success_count}/{len(icon_sizes)}")
    print("="*60)

    # 列出生成的文件
    print(f"\n生成的图标文件：")
    for size in icon_sizes:
        file_name = f"icon-{size}x{size}.png"
        file_path = output_path / file_name
        if file_path.exists():
            file_size = os.path.getsize(file_path) / 1024  # KB
            print(f"  ✓ {file_name} ({file_size:.2f} KB)")
        else:
            print(f"  ✗ {file_name} (未生成)")

    return success_count == len(icon_sizes)

def main():
    """主函数"""
    print("\n检查依赖...")
    if not CAIROSVG_AVAILABLE:
        print("❌ cairosvg 不可用")
        print("请安装: pip install cairosvg")
        return

    # 检查 Pillow
    try:
        import PIL
        print("✓ Pillow 可用")
    except ImportError:
        print("⚠ Pillow 不可用，将无法调整尺寸")
        print("建议安装: pip install Pillow")

    # 图标源文件
    icons_dir = Path("src/assets/icons")

    # 查找可用的 SVG 图标
    svg_files = list(icons_dir.glob("logo-*.svg"))

    if not svg_files:
        print(f"\n❌ 在 {icons_dir} 中未找到 SVG 图标文件")
        return

    print(f"\n找到以下 SVG 图标:")
    for i, svg_file in enumerate(svg_files, 1):
        print(f"  {i}. {svg_file.name}")

    # 选择一个图标作为主图标
    # 优先选择 logo-herb-tech.svg（科技风格，适合 PWA）
    selected_svg = None
    for svg_name in ["logo-herb-tech.svg", "logo-yin-yang.svg", "logo-medical-cross.svg", "logo-gourd.svg"]:
        for svg_file in svg_files:
            if svg_file.name == svg_name:
                selected_svg = svg_file
                break
        if selected_svg:
            break

    if not selected_svg:
        selected_svg = svg_files[0]

    print(f"\n选择的主图标: {selected_svg.name}")

    # 输出目录
    output_dir = "public/icons"

    # 生成图标
    if generate_pwa_icons(selected_svg, output_dir):
        print(f"\n✓ 所有图标已生成到 {output_dir}/")
        print("\n下一步:")
        print("  1. 检查生成的图标是否满意")
        print("  2. 如需更换图标，修改此脚本中的 selected_svg 选择")
        print("  3. 部署到 Vercel，PWA 功能自动生效")
    else:
        print("\n✗ 图标生成失败，请检查错误信息")

if __name__ == "__main__":
    main()
