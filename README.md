# 友链申请系统 - Cloudflare Workers 版本

这是一个基于 Cloudflare Workers 和 KV 存储的友链申请系统，允许用户通过 GitHub 登录提交友链信息，并提供管理员审核功能。

## ✨ 功能特性

- 🔐 **GitHub OAuth 认证**：安全的用户登录系统
- 📝 **友链提交**：用户可以提交网站名称、链接、头像和描述
- 🗄️ **KV 存储**：使用 Cloudflare KV 作为数据存储
- 👨‍💼 **管理员审核**：支持批准、拒绝和删除友链
- 🎨 **多种模式**：主页面 + 嵌入模式（亮色/暗色主题）
- 📱 **响应式设计**：完美适配桌面和移动设备
- 🚀 **高性能**：基于 Cloudflare Workers 的边缘计算
- 🌍 **全球部署**：自动在全球边缘节点部署

## 🏗️ 技术架构

- **运行环境**: Cloudflare Workers
- **数据存储**: Cloudflare KV
- **认证系统**: GitHub OAuth + JWT
- **前端技术**: 原生 HTML/CSS/JavaScript
- **路由管理**: itty-router
- **部署平台**: Cloudflare

## 📦 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd links-app-workers
```

### 2. 安装依赖

```bash
npm install
```

### 3. 创建 GitHub OAuth 应用

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - **Application name**: 友链申请系统
   - **Homepage URL**: `https://your-worker.your-subdomain.workers.dev`
   - **Authorization callback URL**: `https://your-worker.your-subdomain.workers.dev/api/auth/callback`
4. 记录 Client ID 和 Client Secret

### 4. 创建 KV 命名空间

```bash
# 创建生产环境 KV 命名空间
wrangler kv:namespace create "LINKS_KV"

# 创建开发环境 KV 命名空间
wrangler kv:namespace create "LINKS_KV" --preview
```

### 5. 配置环境变量

```bash
# 设置 GitHub OAuth 配置
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET

# 设置 JWT 密钥（用于签名用户会话）
wrangler secret put JWT_SECRET

# 设置管理员用户（GitHub 用户名，用逗号分隔）
wrangler secret put ADMIN_USERS
```

### 6. 更新 wrangler.toml

将步骤 4 中获得的 KV 命名空间 ID 更新到 `wrangler.toml` 文件中：

```toml
[[kv_namespaces]]
binding = "LINKS_KV"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"
```

### 7. 部署

```bash
# 开发环境测试
npm run dev

# 部署到生产环境
npm run deploy
```

## 🔧 配置说明

### 环境变量

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth 应用的 Client ID |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth 应用的 Client Secret |
| `JWT_SECRET` | ✅ | JWT 签名密钥，建议使用随机字符串 |
| `ADMIN_USERS` | ❌ | 管理员 GitHub 用户名，用逗号分隔 |

### KV 存储结构

- `links_data`: 存储所有友链数据的 JSON 数组
- `link:{id}`: 单个友链的详细信息
- `auth_state:{state}`: OAuth 状态验证（临时）
- `log:{timestamp}_{action}`: 操作日志记录

## 📖 API 文档

### 认证相关

- `GET /api/auth/github` - 发起 GitHub OAuth 登录
- `GET /api/auth/callback` - GitHub OAuth 回调处理

### 友链管理

- `POST /api/submit` - 提交友链申请
- `GET /api/links` - 获取友链列表
- `PUT /api/links/{id}` - 管理友链状态（需要管理员权限）

### 页面路由

- `/` - 主页面
- `/embed` - 嵌入模式（亮色主题）
- `/embed/dark` - 嵌入模式（暗色主题）
- `/json` - 友链数据 JSON 接口（兼容原项目）

## 🎨 嵌入使用

### iframe 嵌入

```html
<!-- 亮色主题 -->
<iframe src="https://your-worker.your-subdomain.workers.dev/embed" 
        width="100%" height="600" frameborder="0"></iframe>

<!-- 暗色主题 -->
<iframe src="https://your-worker.your-subdomain.workers.dev/embed/dark" 
        width="100%" height="600" frameborder="0"></iframe>
```

### 获取友链数据

```javascript
// 获取已批准的友链
fetch('https://your-worker.your-subdomain.workers.dev/api/links?status=approved')
  .then(response => response.json())
  .then(links => {
    console.log('友链列表:', links);
  });
```

## 👨‍💼 管理员功能

管理员可以通过 API 管理友链状态：

```javascript
// 批准友链
fetch('/api/links/{linkId}', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    action: 'approve',
    reason: '友链质量很好'
  })
});

// 拒绝友链
fetch('/api/links/{linkId}', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    action: 'reject',
    reason: '不符合要求'
  })
});
```

## 🔒 安全特性

- JWT Token 认证，24小时过期
- CORS 跨域保护
- 输入数据验证和清理
- XSS 防护
- 管理员权限验证
- OAuth 状态验证防止 CSRF

## 🚀 性能优化

- 边缘计算，全球低延迟
- 静态资源内联，减少请求
- KV 存储高性能读写
- 响应式设计，移动端友好

## 📝 开发说明

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 查看日志
npm run tail
```

### 项目结构

```
links-app-workers/
├── src/
│   ├── index.js              # 主入口文件
│   ├── auth/
│   │   └── github.js         # GitHub OAuth 认证
│   ├── api/
│   │   └── links.js          # 友链 API
│   ├── static/
│   │   ├── index.html.js     # 主页面
│   │   ├── embed.html.js     # 嵌入模式
│   │   ├── embed-dark.html.js # 暗色嵌入模式
│   │   ├── style.css.js      # 样式文件
│   │   └── app.js.js         # 前端逻辑
│   └── utils/
│       ├── cors.js           # CORS 处理
│       └── static.js         # 静态文件服务
├── wrangler.toml             # Workers 配置
├── package.json              # 项目配置
└── README.md                 # 说明文档
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🆚 与原版本对比

| 特性 | Next.js 版本 | Workers 版本 |
|------|-------------|-------------|
| 运行环境 | Node.js | Cloudflare Workers |
| 数据存储 | GitHub Issues | Cloudflare KV |
| 认证系统 | NextAuth.js | 自定义 GitHub OAuth |
| 前端框架 | React | 原生 HTML/CSS/JS |
| 部署平台 | Vercel | Cloudflare |
| 冷启动时间 | ~1s | ~0ms |
| 全球延迟 | 中等 | 极低 |
| 成本 | 中等 | 极低 |
