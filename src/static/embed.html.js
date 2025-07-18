export default `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>友链申请 - 嵌入模式</title>
    <link rel="stylesheet" href="/static/style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔗</text></svg>">
    <style>
        /* 嵌入模式特定样式 */
        body {
            padding: 16px;
        }
        
        .container {
            max-width: 500px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 1.5rem;
            margin-bottom: 8px;
        }
        
        .header .subtitle {
            font-size: 0.875rem;
        }
        
        .footer {
            margin-top: 30px;
            padding: 15px 0;
            font-size: 0.75rem;
        }
        
        /* 隐藏不需要的元素 */
        .links-section {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🔗 友链申请</h1>
            <p class="subtitle">通过 GitHub 登录提交友链申请</p>
        </header>

        <main class="main">
            <!-- 认证状态显示 -->
            <div id="auth-status" class="auth-status" style="display: none;">
                <div class="user-info">
                    <img id="user-avatar" src="" alt="用户头像" class="user-avatar">
                    <div class="user-details">
                        <span id="user-name" class="user-name"></span>
                        <span id="user-login" class="user-login"></span>
                    </div>
                    <button id="logout-btn" class="btn btn-secondary">退出</button>
                </div>
            </div>

            <!-- 登录部分 -->
            <div id="login-section" class="login-section">
                <div class="login-card">
                    <h3>请使用 GitHub 账号登录</h3>
                    <p>登录后可以提交您的友链申请</p>
                    <button id="login-btn" class="btn btn-primary">
                        <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub 登录
                    </button>
                </div>
            </div>

            <!-- 友链提交表单 -->
            <div id="submit-section" class="submit-section" style="display: none;">
                <div class="form-card">
                    <h3>提交友链申请</h3>
                    <form id="link-form" class="link-form">
                        <div class="form-group">
                            <label for="name">网站名称 *</label>
                            <input type="text" id="name" name="name" required maxlength="100" 
                                   placeholder="请输入您的网站名称">
                        </div>

                        <div class="form-group">
                            <label for="link">网站链接 *</label>
                            <input type="url" id="link" name="link" required 
                                   placeholder="https://example.com">
                        </div>

                        <div class="form-group">
                            <label for="avatar">网站图标 *</label>
                            <input type="url" id="avatar" name="avatar" required
                                   placeholder="https://example.com/avatar.png">
                        </div>

                        <div class="form-group">
                            <label for="descr">网站描述</label>
                            <textarea id="descr" name="descr" rows="3" maxlength="500" 
                                      placeholder="简单介绍一下您的网站 (可选)"></textarea>
                        </div>

                        <div class="form-actions">
                            <button type="submit" id="submit-btn" class="btn btn-primary">
                                提交申请
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- 消息提示 -->
            <div id="message" class="message" style="display: none;"></div>
        </main>

        <footer class="footer">
            <p>&copy; 2025 友链申请系统 | 
                <a href="https://github.com/HeLongaa/links-app-workers" target="_blank" rel="noopener noreferrer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 4px;">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                </a>
            </p>
        </footer>
    </div>

    <script src="/static/app.js"></script>
</body>
</html>`;

