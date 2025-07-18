# 部署指南

## 📋 部署前准备

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
# 或者
npm install wrangler --save-dev
```

### 2. 登录 Cloudflare

```bash
wrangler auth login
```

## 🚀 详细部署步骤

### 步骤 1: 创建 KV 命名空间

```bash
# 创建生产环境 KV 命名空间
wrangler kv namespace create "LINKS_KV"

# 输出示例：
# 🌀 Creating namespace with title "links-app-workers-LINKS_KV"
# ✨ Success!
# Add the following to your configuration file in your kv_namespaces array:
# { binding = "LINKS_KV", id = "abcdef1234567890" }

# 创建预览环境 KV 命名空间
wrangler kv namespace create "LINKS_KV" --preview

# 输出示例：
# 🌀 Creating namespace with title "links-app-workers-LINKS_KV_preview"
# ✨ Success!
# Add the following to your configuration file in your kv_namespaces array:
# { binding = "LINKS_KV", preview_id = "0987654321fedcba" }
```

### 步骤 2: 更新 wrangler.toml

将上一步获得的 ID 更新到 `wrangler.toml` 文件中：

```toml
[[kv_namespaces]]
binding = "LINKS_KV"
id = "abcdef1234567890"  # 替换为实际的 ID
preview_id = "0987654321fedcba"  # 替换为实际的预览 ID
```

### 步骤 3: 创建 GitHub OAuth 应用

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写信息：
   ```
   Application name: 友链申请系统
   Homepage URL: https://your-worker.your-subdomain.workers.dev
   Authorization callback URL: https://your-worker.your-subdomain.workers.dev/api/auth/callback
   ```
4. 创建后记录 Client ID 和 Client Secret

### 步骤 4: 设置环境变量

```bash
# 设置 GitHub OAuth 配置
wrangler secret put GITHUB_CLIENT_ID
# 输入你的 GitHub Client ID

wrangler secret put GITHUB_CLIENT_SECRET
# 输入你的 GitHub Client Secret

# 设置 JWT 密钥
wrangler secret put JWT_SECRET
# 输入一个随机字符串，例如：openssl rand -base64 32 生成的结果

# 设置管理员用户（可选）
wrangler secret put ADMIN_USERS
# 输入管理员的 GitHub 用户名，用逗号分隔，例如：admin1,admin2
```

### 步骤 5: 测试部署

```bash
# 本地开发测试
npm run dev

# 访问 http://localhost:8787 测试功能
```

### 步骤 6: 部署到生产环境

```bash
# 部署
npm run deploy

# 输出示例：
# ✨ Success! Deployed to https://links-app-workers.your-subdomain.workers.dev
```

## 🔧 自定义域名配置

### 1. 在 Cloudflare 中添加域名

1. 登录 Cloudflare Dashboard
2. 添加你的域名到 Cloudflare
3. 更新域名的 DNS 服务器

### 2. 配置 Workers 路由

1. 在 Cloudflare Dashboard 中进入 Workers & Pages
2. 选择你的 Worker
3. 点击 "Triggers" 标签
4. 添加自定义域名或路由

### 3. 更新 wrangler.toml

```toml
# 使用自定义域名
[[routes]]
pattern = "links.yourdomain.com/*"
zone_name = "yourdomain.com"

# 或者使用路由模式
# route = "yourdomain.com/links/*"
```

### 4. 更新 GitHub OAuth 应用

将 GitHub OAuth 应用的回调 URL 更新为你的自定义域名：
```
https://links.yourdomain.com/api/auth/callback
```

## 📊 监控和日志

### 查看实时日志

```bash
npm run tail
```

### 查看 KV 存储内容

```bash
# 列出所有键
wrangler kv key list --binding=LINKS_KV

# 查看特定键的值
wrangler kv key get "links_data" --binding=LINKS_KV

# 手动设置键值（用于测试）
wrangler kv key put "test_key" "test_value" --binding=LINKS_KV
```

### 查看 Workers 分析

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 选择你的 Worker
4. 查看 "Analytics" 标签

## 🔄 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新部署
npm run deploy
```

## 🐛 故障排除

### 常见问题

1. **KV 命名空间错误**
   ```
   Error: KV namespace with binding "LINKS_KV" not found
   ```
   解决：检查 wrangler.toml 中的 KV 命名空间 ID 是否正确

2. **GitHub OAuth 错误**
   ```
   Error: Invalid client_id or client_secret
   ```
   解决：检查 GitHub OAuth 应用配置和环境变量设置

3. **JWT 错误**
   ```
   Error: JWT verification failed
   ```
   解决：检查 JWT_SECRET 环境变量是否设置正确

4. **CORS 错误**
   ```
   Access to fetch blocked by CORS policy
   ```
   解决：检查请求的域名是否在允许列表中

### 调试技巧

1. **查看详细日志**
   ```bash
   wrangler tail --format=pretty
   ```

2. **本地调试**
   ```bash
   wrangler dev --local
   ```

3. **检查环境变量**
   ```bash
   wrangler secret list
   ```

## 📈 性能优化

### 1. KV 存储优化

- 合理设计键名结构
- 使用 TTL 自动清理过期数据
- 批量操作减少请求次数

### 2. 响应优化

- 启用 Gzip 压缩
- 设置合适的缓存头
- 优化静态资源大小

### 3. 监控指标

- CPU 使用时间
- 内存使用量
- 请求响应时间
- 错误率

## 🔐 安全建议

1. **定期更新密钥**
   ```bash
   # 更新 JWT 密钥
   wrangler secret put JWT_SECRET
   ```

2. **限制管理员权限**
   - 只添加信任的用户到 ADMIN_USERS
   - 定期审查管理员列表

3. **监控异常活动**
   - 查看访问日志
   - 监控错误率
   - 设置告警规则

## 💰 成本估算

Cloudflare Workers 免费套餐包括：
- 每天 100,000 次请求
- 每次请求最多 10ms CPU 时间
- 1GB KV 存储

对于大多数友链申请系统来说，免费套餐已经足够使用。

