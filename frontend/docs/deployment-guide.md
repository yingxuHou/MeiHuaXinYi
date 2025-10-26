# 梅花心易前端部署指南

## 项目概述

梅花心易是一个基于Vue 3的现代化占卜应用，采用星空主题设计，完全适配移动端。本指南将帮助您完成从开发到生产环境的部署。

## 技术栈

- **前端框架**: Vue 3 + Vite
- **状态管理**: Pinia
- **UI组件**: Element Plus
- **路由**: Vue Router 4
- **样式**: CSS3 + 响应式设计
- **图标**: Font Awesome
- **构建工具**: Vite
- **包管理**: npm

## 环境要求

### 开发环境
- Node.js >= 16.0.0
- npm >= 8.0.0
- 现代浏览器 (Chrome 90+, Firefox 88+, Safari 14+)

### 生产环境
- Web服务器 (Nginx, Apache, 或 CDN)
- HTTPS支持 (推荐)
- Gzip压缩支持

## 本地开发

### 1. 克隆项目
```bash
git clone <repository-url>
cd MeiHuaXinYi/frontend
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 访问应用
打开浏览器访问 `http://localhost:5173`

## 构建生产版本

### 1. 环境配置
确保 `.env.production` 文件配置正确：

```env
# 生产环境API地址
VITE_API_BASE_URL=https://api.yourdomain.com/api

# 第三方服务配置
VITE_WECHAT_APP_ID=your_wechat_app_id
VITE_ANALYTICS_ID=your_analytics_id

# 其他配置...
```

### 2. 构建项目
```bash
npm run build
```

构建完成后，`dist` 目录包含所有生产文件。

### 3. 预览构建结果
```bash
npm run preview
```

## 部署方案

### 方案一：静态文件服务器部署

#### Nginx配置示例
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL配置
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # 强制HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }

    root /var/www/meihuaxinyi/dist;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # 缓存策略
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML文件不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Vue Router历史模式支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理（如果需要）
    location /api/ {
        proxy_pass http://your-backend-server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;" always;
}
```

#### Apache配置示例
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/meihuaxinyi/dist

    # 重定向到HTTPS
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /var/www/meihuaxinyi/dist

    # SSL配置
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key

    # Gzip压缩
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>

    # 缓存策略
    <FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </FilesMatch>

    # Vue Router历史模式支持
    <Directory "/var/www/meihuaxinyi/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### 方案二：CDN部署

#### 使用Vercel
1. 连接GitHub仓库
2. 配置构建命令：`npm run build`
3. 配置输出目录：`dist`
4. 配置环境变量
5. 部署

#### 使用Netlify
1. 连接GitHub仓库
2. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
3. 配置重定向规则（`_redirects`文件）：
   ```
   /*    /index.html   200
   ```
4. 配置环境变量
5. 部署

### 方案三：Docker部署

#### Dockerfile
```dockerfile
# 构建阶段
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## 后端API集成

### 1. API接口替换
当前项目使用模拟数据，部署前需要：

1. **更新API基础URL**
   ```javascript
   // .env.production
   VITE_API_BASE_URL=https://api.yourdomain.com/api
   ```

2. **替换模拟API调用**
   - 移除 `src/api/` 目录下所有模拟数据代码
   - 实现真实的HTTP请求
   - 更新错误处理逻辑

3. **配置认证系统**
   - 实现JWT token管理
   - 配置token刷新机制
   - 实现权限验证

### 2. 后端API要求
后端需要提供以下接口：

#### 认证接口
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `POST /auth/logout` - 用户登出
- `POST /auth/refresh` - 刷新token
- `GET /auth/user` - 获取用户信息

#### 占卜接口
- `POST /divination/start` - 开始占卜
- `GET /divination/result/:id` - 获取占卜结果
- `GET /divination/history` - 获取历史记录
- `DELETE /divination/:id` - 删除记录
- `PUT /divination/favorite/:id` - 收藏/取消收藏

## 性能优化

### 1. 构建优化
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### 2. 资源优化
- 图片压缩和WebP格式
- 字体子集化
- CSS和JS压缩
- Tree shaking

### 3. 缓存策略
- 静态资源长期缓存
- HTML文件不缓存
- API响应适当缓存

## 监控和分析

### 1. 错误监控
集成Sentry或其他错误监控服务：

```javascript
// main.js
import * as Sentry from "@sentry/vue"

if (import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true') {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_ERROR_TRACKING_DSN,
    environment: import.meta.env.MODE
  })
}
```

### 2. 用户分析
集成Google Analytics或其他分析工具：

```javascript
// utils/analytics.js
export function initAnalytics() {
  if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
    // 初始化分析工具
  }
}
```

## 安全配置

### 1. HTTPS配置
- 使用有效的SSL证书
- 配置HSTS头
- 重定向HTTP到HTTPS

### 2. 安全头配置
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; ...";
```

### 3. 环境变量安全
- 不要在前端暴露敏感信息
- 使用环境变量管理配置
- 定期轮换API密钥

## 维护和更新

### 1. 版本管理
- 使用语义化版本号
- 维护更新日志
- 标记重要版本

### 2. 备份策略
- 定期备份源代码
- 备份构建产物
- 备份配置文件

### 3. 更新流程
1. 测试新版本
2. 备份当前版本
3. 部署新版本
4. 验证功能正常
5. 监控错误和性能

## 故障排除

### 常见问题
1. **路由404错误**: 检查服务器配置是否支持SPA
2. **API请求失败**: 检查CORS配置和API地址
3. **静态资源加载失败**: 检查资源路径和缓存配置
4. **移动端显示异常**: 检查viewport配置和CSS适配

### 调试工具
- 浏览器开发者工具
- Vue DevTools
- 网络监控工具
- 性能分析工具

---

**注意事项：**
1. 部署前务必进行充分测试
2. 确保所有环境变量正确配置
3. 监控部署后的性能和错误
4. 定期更新依赖和安全补丁
