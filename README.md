# 🌐 AI Web Translator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue)](https://chrome.google.com/webstore)

一个强大的 Chrome 浏览器插件，使用大模型实时翻译网页内容。

![AI Web Translator](screenshots/banner.png)

## ✨ 特性

### 🎯 核心功能
- **左右分屏显示** - 左侧原文，右侧翻译，对比阅读
- **按需翻译** - 瀑布式加载，翻译可见内容，节省 token
- **同步滚动** - 两侧窗口自动同步滚动位置
- **悬浮高亮** - 鼠标悬浮时，原文和翻译同时高亮
- **模型可配置** - 支持 OpenAI/Claude/Gemini/Azure 等主流模型

### 🔧 智能过滤
- ✅ 过滤代码块（`<code>`, `<pre>`）
- ✅ 过滤数学公式
- ✅ 过滤导航栏和广告
- ✅ 仅翻译文本内容

### 🌍 多语言支持
- 简体中文
- 繁体中文
- 英语
- 日语
- 韩语
- 法语
- 德语
- 西班牙语
- 俄语

## 📦 安装

### 方法 1：开发者模式

1. 下载项目文件夹
2. 打开 Chrome 浏览器
3. 访问 `chrome://extensions/`
4. 开启右上角的 **开发者模式**
5. 点击 **加载已解压的扩展程序**
6. 选择 `chrome-web-translator` 文件夹
7. 完成！

### 方法 2：打包安装

1. 在 `chrome://extensions/` 页面
2. 点击 **打包扩展程序**
3. 选择项目文件夹
4. 生成 `.crx` 文件
5. 拖拽到扩展页面安装

## ⚙️ 配置

### 1. 获取 API Key

**OpenAI:**
- 访问 https://platform.openai.com/api-keys
- 创建新的 API Key

**Anthropic (Claude):**
- 访问 https://console.anthropic.com/settings/keys
- 创建 API Key

**Google (Gemini):**
- 访问 https://makersuite.google.com/app/apikey
- 创建 API Key

**Azure OpenAI:**
- 在 Azure Portal 创建资源
- 获取 Endpoint 和 Key

### 2. 插件配置

1. 点击浏览器工具栏的插件图标
2. 填写 API Key
3. 选择模型
4. 选择目标语言
5. 点击 **保存配置**

## 🚀 使用

### 开始翻译

1. 打开任意网页
2. 点击插件图标
3. 点击 **开始翻译**
4. 右侧会出现翻译面板

### 快捷操作

- **点击图标** - 启动/关闭翻译
- **关闭按钮 (×)** - 关闭翻译面板
- **悬浮文本** - 高亮对应的原文和翻译

### 高级设置

在配置页面可以调整：

| 设置 | 说明 | 默认 |
|------|------|------|
| 自动翻译 | 打开网页自动翻译 | 关 |
| 同步滚动 | 两侧同步滚动 | 开 |
| 悬浮高亮 | 鼠标悬浮高亮 | 开 |
| 过滤代码 | 不翻译代码块 | 开 |
| 过滤公式 | 不翻译数学公式 | 开 |
| 过滤导航 | 不翻译导航栏 | 开 |

## 🏗️ 技术架构

```
chrome-web-translator/
├── manifest.json      # 扩展配置
├── popup.html         # 配置界面
├── popup.js           # 配置逻辑
├── background.js      # 后台服务
├── content.js         # 页面脚本
├── content.css        # 页面样式
└── README.md          # 说明文档
```

### 工作流程

1. **用户点击图标** → Content Script 接收消息
2. **创建侧边面板** → 左右分屏布局
3. **提取页面内容** → 过滤不需要的元素
4. **批量翻译** → 调用大模型 API
5. **渲染结果** → 显示在右侧面板
6. **同步交互** → 滚动/悬浮同步

## 🔒 隐私与安全

- ✅ 所有 API 调用直接使用用户的 API Key
- ✅ 不收集任何用户数据
- ✅ 不上传浏览历史
- ✅ 本地存储配置

## 🐛 故障排除

### 翻译失败

**问题：** 点击开始翻译后没有反应

**解决方案：**
1. 检查 API Key 是否正确（设置 → API Key）
2. 确认模型名称正确
3. 检查网络连接
4. 按 F12 打开控制台查看错误信息
5. 确保 API Key 有足够余额

### 面板不显示

**问题：** 点击图标后翻译面板没有出现

**解决方案：**
1. 刷新网页（Ctrl+R / Cmd+R）
2. 重新点击插件图标
3. 检查扩展是否启用（chrome://extensions/）
4. 检查控制台是否有错误

### 翻译质量差

**问题：** 翻译结果不准确或不流畅

**解决方案：**
1. 尝试更强大的模型（GPT-4 > GPT-3.5）
2. 调整目标语言设置
3. 关闭过滤选项重试
4. 检查原文是否包含特殊格式

### 同步滚动失效

**问题：** 两侧窗口不同步滚动

**解决方案：**
1. 在设置中关闭再重新开启"同步滚动"
2. 刷新页面
3. 检查是否滚动到了未翻译区域

### API 速率限制

**问题：** 收到 "Rate limit exceeded" 错误

**解决方案：**
1. 等待几分钟后重试
2. 减少批量翻译的大小
3. 升级 API 套餐
4. 使用缓存（已翻译的内容会缓存）

## 💬 常见问题

### Q: 支持哪些语言？
A: 支持几乎所有语言，包括中文、英文、日文、韩文、法文、德文、西班牙文等。

### Q: 翻译的内容会保存吗？
A: 翻译结果会缓存在本地，但刷新页面后需要重新翻译。

### Q: 可以在手机上使用吗？
A: 不行，Chrome 扩展仅支持桌面版 Chrome 浏览器。

### Q: 是否免费？
A: 扩展本身免费，但需要自备大模型 API Key（会产生 API 调用费用）。

### Q: 安全吗？
A: 非常安全。所有 API 调用直接使用你的 API Key，不经过任何中间服务器。

## 📝 开发

### 调试

```bash
# 查看扩展日志
chrome://extensions/ → 检查视图 (content script)

# 查看后台日志
chrome://extensions/ → Service Worker → 检查视图
```

### 修改配置

编辑 `popup.html` 和 `popup.js` 修改界面和逻辑

### 添加新模型

在 `background.js` 和 `content.js` 中添加新的 provider 支持

## 📄 许可证

MIT License

## 🙏 致谢

感谢以下大模型提供商：
- OpenAI
- Anthropic
- Google
- Microsoft Azure

---

**享受无障碍浏览！** 🌍✨
