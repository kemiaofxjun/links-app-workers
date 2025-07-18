import { Router } from 'itty-router';
import { handleAuth, handleAuthCallback } from './auth/github.js';
import { handleSubmitLink, handleGetLinks, handleManageLink } from './api/links.js';
import { handleStaticFile } from './utils/static.js';
import { corsHeaders, handleCORS } from './utils/cors.js';

// 创建路由器
const router = Router();

// CORS 预检请求
router.options('*', handleCORS);

// 静态文件路由
router.get('/', (request, env) => handleStaticFile(request, env, 'index.html'));
router.get('/embed', (request, env) => handleStaticFile(request, env, 'embed.html'));
router.get('/embed/dark', (request, env) => handleStaticFile(request, env, 'embed-dark.html'));
router.get('/admin', async (request, env) => {
  // 这里可以添加简单的权限检查，但主要验证在前端进行
  return handleStaticFile(request, env, 'admin.html');
});

// API 路由
router.get('/api/auth/github', handleAuth);
router.get('/api/auth/callback', handleAuthCallback);
router.post('/api/submit', handleSubmitLink);
router.get('/api/links', handleGetLinks);
router.get('/json', handleGetLinks); // 兼容原项目的路由
router.put('/api/links/:id', handleManageLink); // 管理友链状态

// 静态资源路由
router.get('/static/*', (request, env) => handleStaticFile(request, env));

// 404 处理
router.all('*', () => new Response('Not Found', {
  status: 404,
  headers: corsHeaders
}));

// Workers 主入口
export default {
  async fetch(request, env, ctx) {
    try {
      // 添加环境变量到请求对象
      request.env = env;
      request.ctx = ctx;

      return await router.handle(request, env, ctx);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};


