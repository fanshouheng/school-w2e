// 本地开发用的代理服务器
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;

// 静态文件服务
app.use(express.static('.'));

// API代理
app.use('/api', createProxyMiddleware({
    target: 'https://api.moonshot.cn',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '', // 移除/api前缀
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('代理请求:', req.method, req.url, '-> https://api.moonshot.cn' + proxyReq.path);
        // 确保Content-Type正确传递
        if (req.headers['content-type']) {
            proxyReq.setHeader('Content-Type', req.headers['content-type']);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        // 添加CORS头
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    },
    onError: (err, req, res) => {
        console.error('代理错误:', err);
        res.status(500).json({ error: '代理服务器错误', details: err.message });
    }
}));

// SPA路由处理
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 开发服务器运行在 http://localhost:${PORT}`);
    console.log('📝 API代理已配置: /api/* -> https://api.moonshot.cn/*');
});

module.exports = app;