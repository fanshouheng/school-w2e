# 📄 Word文档信息提取工具

> 基于 Kimi AI 的智能 Word 文档信息提取工具，支持多文件批量处理

[![部署状态](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)

## ✨ 功能特点

- 🤖 **AI智能提取**：使用 Kimi K2-0905-preview 模型
- 📄 **多文件支持**：支持同时处理多个 Word 文档
- 📊 **自动表格**：智能生成结构化表格
- ⏰ **时间标记**：自动添加处理时间
- 📱 **响应式设计**：完美支持移动设备
- 🚀 **即时处理**：上传后实时处理

## 🎯 提取信息

- 🏫 **学校名称**（第一行自动加时间）
- 📚 **学科**
- 👨‍🏫 **讲课教师** 
- 🏛️ **班级**

## 🌐 在线使用

访问：[https://school-w2e.netlify.app](https://school-w2e.netlify.app)

## 🚀 快速开始

### 在线使用
1. 访问在线版本
2. 上传 Word 文档（支持多文件）
3. 点击"开始处理"
4. 查看提取结果

### 本地运行
```bash
git clone https://github.com/fanshouheng/school-w2e.git
cd school-w2e
python -m http.server 8080
```

## 📁 项目结构

```
school-w2e/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 核心逻辑
├── netlify.toml        # Netlify 配置
├── _redirects          # API 代理规则
└── README.md           # 说明文档
```

## 🔧 技术栈

- **前端**: HTML5 + CSS3 + JavaScript
- **AI服务**: Kimi K2 (Moonshot AI)
- **部署**: Netlify
- **API**: RESTful

## 📝 使用说明

1. **单文件处理**：直接选择一个 Word 文档
2. **多文件批量**：按住 Ctrl/Cmd 选择多个文件
3. **拖拽上传**：支持直接拖拽文件到上传区域
4. **结果导出**：支持复制表格和下载 CSV

## 🌟 支持格式

- `.docx` - Microsoft Word
- `.doc` - Microsoft Word 97-2003

## ⚙️ 部署配置

项目已配置自动部署到 Netlify：
- ✅ API 代理已配置
- ✅ CORS 问题已解决
- ✅ 静态文件优化
- ✅ 安全头部设置

## 📞 技术支持

如有问题，请提交 [Issue](https://github.com/fanshouheng/school-w2e/issues)

## 📄 许可证

MIT License