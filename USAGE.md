# 使用指南

## 🎯 基本使用

### 用户端功能

#### 1. 访问主页
访问部署后的 Workers URL，例如：`https://your-worker.your-subdomain.workers.dev`

#### 2. GitHub 登录
- 点击"使用 GitHub 登录"按钮
- 授权应用访问您的 GitHub 账户
- 登录成功后自动跳转回主页

#### 3. 提交友链
- 填写网站名称（必填）
- 填写网站链接（必填）
- 填写头像链接（可选）
- 填写网站描述（可选）
- 点击"提交友链申请"

#### 4. 查看友链列表
主页下方会显示所有已批准的友链

### 管理员功能

#### 1. 访问管理后台
访问：`https://your-worker.your-subdomain.workers.dev/admin`

#### 2. 管理员登录
- 使用 GitHub 登录
- 只有在 `ADMIN_USERS` 环境变量中配置的用户才能访问管理功能

#### 3. 审核友链
- 查看所有友链申请
- 批准、拒绝或删除友链
- 查看统计信息

## 📡 API 使用

### 获取友链数据

#### 获取已批准的友链
```javascript
fetch('https://your-worker.your-subdomain.workers.dev/api/links?status=approved')
  .then(response => response.json())
  .then(links => {
    console.log('友链列表:', links);
  });
```

#### 获取所有友链（需要管理员权限）
```javascript
fetch('https://your-worker.your-subdomain.workers.dev/api/links?status=all', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
})
  .then(response => response.json())
  .then(links => {
    console.log('所有友链:', links);
  });
```

### 提交友链

```javascript
const linkData = {
  name: '示例网站',
  link: 'https://example.com',
  avatar: 'https://example.com/avatar.png',
  descr: '这是一个示例网站'
};

fetch('https://your-worker.your-subdomain.workers.dev/api/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify(linkData)
})
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log('提交成功:', result);
    } else {
      console.error('提交失败:', result.error);
    }
  });
```

### 管理友链（管理员）

#### 批准友链
```javascript
fetch('https://your-worker.your-subdomain.workers.dev/api/links/LINK_ID', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    action: 'approve',
    reason: '友链质量很好'
  })
})
  .then(response => response.json())
  .then(result => console.log(result));
```

#### 拒绝友链
```javascript
fetch('https://your-worker.your-subdomain.workers.dev/api/links/LINK_ID', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    action: 'reject',
    reason: '不符合友链要求'
  })
})
  .then(response => response.json())
  .then(result => console.log(result));
```

## 🎨 自定义样式

### 嵌入模式自定义

如果您想自定义嵌入模式的样式，可以通过 CSS 覆盖：

```html
<style>
  iframe {
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
  }
</style>
```

### 主题色自定义

您可以修改 `src/static/style.css.js` 中的 CSS 变量来自定义主题色：

```css
:root {
  --primary-color: #your-color;
  --primary-hover: #your-hover-color;
  /* 其他颜色变量 */
}
```

## 🔧 高级配置

### 自定义域名

1. 在 Cloudflare 中配置自定义域名
2. 更新 `wrangler.toml` 中的路由配置
3. 更新 GitHub OAuth 应用的回调 URL

### CORS 配置

如果需要限制跨域访问，可以在环境变量中设置：

```bash
wrangler secret put ALLOWED_ORIGINS
# 输入允许的域名，用逗号分隔：https://yourdomain.com,https://anotherdomain.com
```

### 数据导出

您可以通过 Wrangler CLI 导出 KV 中的数据：

```bash
# 导出所有友链数据
wrangler kv:key get "links_data" --binding=LINKS_KV > links_backup.json

# 列出所有键
wrangler kv:key list --binding=LINKS_KV
```

### 数据导入

```bash
# 导入友链数据
wrangler kv:key put "links_data" --path=links_backup.json --binding=LINKS_KV
```

## 📊 监控和维护

### 查看访问日志
```bash
wrangler tail --format=pretty
```

### 查看 KV 使用情况
```bash
wrangler kv:key list --binding=LINKS_KV | wc -l
```

### 清理过期数据
```bash
# 删除特定的日志记录
wrangler kv:key delete "log:old_log_key" --binding=LINKS_KV
```

## 🐛 常见问题

### Q: 提交友链后没有反应？
A: 检查浏览器控制台是否有错误，确认已正确登录 GitHub。

### Q: 管理员无法访问后台？
A: 确认您的 GitHub 用户名已添加到 `ADMIN_USERS` 环境变量中。

### Q: 嵌入模式显示不正常？
A: 检查父页面是否有 CSP 策略阻止了 iframe 加载。

### Q: 友链数据丢失？
A: KV 存储是持久化的，数据不会丢失。可以通过 Wrangler CLI 检查数据。

### Q: 如何备份数据？
A: 定期使用 `wrangler kv:key get "links_data" --binding=LINKS_KV` 导出数据。

## 💡 最佳实践

1. **定期备份数据**：建议每周备份一次友链数据
2. **监控访问日志**：定期查看日志，发现异常访问
3. **更新依赖**：定期更新 Wrangler 和相关依赖
4. **安全配置**：定期更换 JWT 密钥，审查管理员列表
5. **性能优化**：监控 Workers 的 CPU 使用时间和内存使用

## 🔄 版本升级

当有新版本发布时：

1. 备份当前数据
2. 更新代码
3. 检查配置文件变更
4. 重新部署
5. 测试功能正常

```bash
# 备份数据
wrangler kv:key get "links_data" --binding=LINKS_KV > backup_$(date +%Y%m%d).json

# 更新代码
git pull origin main

# 重新部署
npm run deploy
```
