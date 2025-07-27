#!/usr/bin/env python3
"""
梅花心易占卜应用 - 本地开发服务器
解决file://协议的安全限制问题
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# 配置
PORT = 8000
HOST = 'localhost'

def start_server():
    """启动本地HTTP服务器"""
    
    # 确保在正确的目录中
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    print(f"🚀 启动梅花心易占卜应用本地服务器...")
    print(f"📁 服务目录: {script_dir}")
    print(f"🌐 服务地址: http://{HOST}:{PORT}")
    print(f"📱 应用入口: http://{HOST}:{PORT}/index.html")
    print(f"🔧 调试页面: http://{HOST}:{PORT}/debug.html")
    print(f"📋 原型展示: http://{HOST}:{PORT}/prototypes-showcase.html")
    print()
    print("💡 提示: 使用 Ctrl+C 停止服务器")
    print("=" * 60)
    
    # 创建HTTP服务器
    handler = http.server.SimpleHTTPRequestHandler
    
    # 添加CORS头部支持
    class CORSRequestHandler(handler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            super().end_headers()
    
    try:
        with socketserver.TCPServer((HOST, PORT), CORSRequestHandler) as httpd:
            print(f"✅ 服务器已启动在 http://{HOST}:{PORT}")
            
            # 自动打开浏览器
            try:
                webbrowser.open(f'http://{HOST}:{PORT}/index.html')
                print("🌐 已自动打开浏览器")
            except Exception as e:
                print(f"⚠️  无法自动打开浏览器: {e}")
                print(f"请手动访问: http://{HOST}:{PORT}/index.html")
            
            print()
            print("🔄 服务器运行中...")
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 服务器已停止")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ 端口 {PORT} 已被占用")
            print(f"💡 请尝试访问: http://{HOST}:{PORT}/index.html")
            print(f"💡 或者修改脚本中的PORT变量使用其他端口")
        else:
            print(f"❌ 启动服务器失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()
