# 🚀 Netlify 部署指南

## 📋 部署前准备

### 1. 检查文件结构
确保您的项目包含以下文件：
```
kimi/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 主要逻辑
├── netlify.toml        # Netlify配置
├── _redirects          # 重定向规则
├── package.json        # 项目配置
└── README.md           # 说明文档
```

### 2. 验证配置
- ✅ API代理配置已就绪
- ✅ CORS重定向规则已配置
- ✅ 多文件上传支持已启用
- ✅ 安全头部已设置

## 🌐 部署方法

### 方法一：拖拽部署（推荐新手）

1. **打包文件**
   - 选择以下文件：`index.html`, `style.css`, `script.js`, `netlify.toml`, `_redirects`
   - 压缩成 ZIP 文件

2. **访问 Netlify**
   - 打开 [netlify.com](https://netlify.com)
   - 登录您的账户

3. **部署**
   - 将 ZIP 文件拖拽到 Netlify 部署区域
   - 等待部署完成
   - 获得自动生成的域名（如：`https://amazing-app-123456.netlify.app`）

### 方法二：Git 部署（推荐开发者）

1. **创建 Git 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Word文档信息提取工具"
   ```

2. **推送到 GitHub**
   ```bash
   # 在GitHub创建新仓库后
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

3. **连接 Netlify**
   - 在 Netlify 控制台选择 "New site from Git"
   - 连接您的 GitHub 账户
   - 选择仓库
   - 保持默认构建设置
   - 点击 "Deploy site"

### 方法三：Netlify CLI 部署

1. **安装 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录并部署**
   ```bash
   netlify login
   netlify deploy --prod
   ```

## ⚙️ 部署后配置

### 1. 自定义域名（可选）
- 在 Netlify 控制台的 "Domain settings" 中
- 添加您的自定义域名
- 配置 DNS 记录

### 2. 环境变量（如需要）
- 在 "Site settings" → "Environment variables" 中
- 添加任何需要的环境变量

### 3. 表单处理（如需要）
- Netlify 自动处理表单提交
- 无需额外配置

## 🔧 故障排除

### 常见问题

1. **API 调用失败**
   - 检查 `netlify.toml` 中的重定向规则
   - 确认 API 密钥有效

2. **文件上传问题**
   - Netlify 默认支持文件上传
   - 检查文件大小限制（默认 10MB）

3. **CORS 错误**
   - 确保 `_redirects` 文件存在
   - 检查代理配置是否正确

### 调试步骤

1. **查看构建日志**
   - 在 Netlify 控制台查看 "Deploy log"

2. **检查网络请求**
   - 打开浏览器开发者工具
   - 查看 Network 标签页

3. **查看控制台错误**
   - 检查浏览器控制台的错误信息

## 📊 性能优化

### 已包含的优化
- ✅ 静态文件压缩
- ✅ CDN 分发
- ✅ HTTP/2 支持
- ✅ 安全头部
- ✅ 自动 HTTPS

### 建议的优化
- 考虑添加 Service Worker 以支持离线使用
- 实施图片优化（如果添加图片功能）
- 考虑添加分析工具

## 🎯 部署后测试

部署成功后，请测试以下功能：

1. **单文件上传**
   - 上传一个 Word 文档
   - 验证信息提取是否正确

2. **多文件上传**
   - 同时选择多个 Word 文档
   - 验证批量处理功能

3. **API 连接**
   - 检查是否能正常调用 Kimi API
   - 验证文件内容提取功能

4. **响应式设计**
   - 在不同设备上测试界面
   - 确保移动端体验良好

## 🚀 部署完成！

部署成功后，您将获得：
- 🌐 公网可访问的 URL
- 🔒 自动 HTTPS 加密
- 📱 响应式设计支持
- 🚀 全球 CDN 加速
- 📊 自动性能优化

享受您的 Word 文档信息提取工具！🎉