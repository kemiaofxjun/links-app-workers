import { corsHeaders } from './cors.js';

// 静态文件内容映射
const staticFiles = {
  'index.html': () => import('../static/index.html.js').then(m => m.default),
  'embed.html': () => import('../static/embed.html.js').then(m => m.default),
  'embed-dark.html': () => import('../static/embed-dark.html.js').then(m => m.default),
  'admin.html': () => import('../static/admin.html.js').then(m => m.default),
  'style.css': () => import('../static/style.css.js').then(m => m.default),
  'app.js': () => import('../static/app.js.js').then(m => m.default),
};

// 获取文件 MIME 类型
function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
  };
  return mimeTypes[ext] || 'text/plain';
}

// 处理静态文件请求
export async function handleStaticFile(request, env, path) {
  try {
    // 如果没有传入 path，从 URL 中提取
    if (!path) {
      const url = new URL(request.url);
      path = url.pathname;
    }

    // 处理根路径
    if (path === '/' || path === '') {
      path = 'index.html';
    }

    // 处理 /static/ 前缀
    if (path.startsWith('/static/')) {
      path = path.substring(8); // 移除 '/static/' 前缀
    }

    // 检查文件是否存在
    const fileLoader = staticFiles[path];
    if (!fileLoader) {
      return new Response('File not found', {
        status: 404,
        headers: corsHeaders
      });
    }

    // 加载文件内容
    const content = await fileLoader();
    const mimeType = getMimeType(path);

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: corsHeaders
    });
  }
}

