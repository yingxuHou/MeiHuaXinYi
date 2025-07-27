/**
 * 梅花心易占卜应用 - Node.js本地服务器
 * 解决file://协议的安全限制问题
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8000;
const HOST = 'localhost';

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
    // 解析URL
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // 安全检查：防止目录遍历攻击
    if (filePath.includes('..')) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    // 设置CORS头部
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 读取文件
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 文件不存在
                res.writeHead(404);
                res.end(`
                    <html>
                        <head><title>404 - 页面未找到</title></head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <h1>404 - 页面未找到</h1>
                            <p>请求的文件 <code>${req.url}</code> 不存在</p>
                            <a href="/">返回首页</a>
                        </body>
                    </html>
                `);
            } else {
                // 其他错误
                res.writeHead(500);
                res.end(`服务器错误: ${err.code}`);
            }
        } else {
            // 成功读取文件
            const contentType = getContentType(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// 启动服务器
server.listen(PORT, HOST, () => {
    console.log('🚀 梅花心易占卜应用本地服务器已启动');
    console.log('📁 服务目录:', __dirname);
    console.log(`🌐 服务地址: http://${HOST}:${PORT}`);
    console.log(`📱 应用入口: http://${HOST}:${PORT}/index.html`);
    console.log(`🔧 调试页面: http://${HOST}:${PORT}/debug.html`);
    console.log(`📋 原型展示: http://${HOST}:${PORT}/prototypes-showcase.html`);
    console.log('💡 提示: 使用 Ctrl+C 停止服务器');
    console.log('=' * 60);

    // 自动打开浏览器
    const url = `http://${HOST}:${PORT}/index.html`;
    const start = process.platform === 'darwin' ? 'open' : 
                  process.platform === 'win32' ? 'start' : 'xdg-open';
    
    exec(`${start} ${url}`, (err) => {
        if (err) {
            console.log('⚠️  无法自动打开浏览器，请手动访问:', url);
        } else {
            console.log('🌐 已自动打开浏览器');
        }
    });
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 服务器已停止');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 服务器已停止');
    process.exit(0);
});
