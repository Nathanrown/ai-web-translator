#!/bin/bash
# AI Web Translator - Installation Script

echo "🌐 AI Web Translator - 安装脚本"
echo "================================"
echo ""

# 检查 Chrome
if [ "$(uname)" == "Darwin" ]; then
  CHROME_PATH="/Applications/Google Chrome.app"
elif [ "$(uname)" == "Linux" ]; then
  CHROME_PATH="/usr/bin/google-chrome"
else
  echo "❌ 不支持的操作系统"
  exit 1
fi

if [ ! -d "$CHROME_PATH" ] && [ ! -f "$CHROME_PATH" ]; then
  echo "⚠️  未找到 Google Chrome，请确保已安装"
fi

# 创建图标（简单 PNG）
echo "📦 创建图标..."
cd icons

# 使用 ImageMagick 创建图标（如果可用）
if command -v convert &> /dev/null; then
  convert -size 128x128 gradient:'#667eea-#764ba2' \
    -fill white -draw "circle 64,64 64,30" \
    -fill '#667eea' -draw "circle 52,58 52,48" \
    -fill '#667eea' -draw "circle 76,68 76,60" \
    -font Arial -pointsize 40 -fill white -gravity center \
    -annotate 0 "A" icon128.png
  
  convert icon128.png -resize 48x48 icon48.png
  convert icon128.png -resize 16x16 icon16.png
  
  echo "✅ 图标创建完成"
else
  echo "⚠️  ImageMagick 未安装，请手动创建图标或使用 SVG"
  echo "   或者运行：brew install imagemagick (macOS) / apt-get install imagemagick (Linux)"
fi

cd ..

echo ""
echo "✅ 安装完成！"
echo ""
echo "📖 使用方法："
echo "1. 打开 Chrome 浏览器"
echo "2. 访问 chrome://extensions/"
echo "3. 开启 开发者模式"
echo "4. 点击 加载已解压的扩展程序"
echo "5. 选择此文件夹：$(pwd)"
echo ""
echo "🎉 开始使用吧！"
