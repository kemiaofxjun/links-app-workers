// CORS 配置
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

// 处理 CORS 预检请求
export function handleCORS(request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// 添加 CORS 头到响应
export function addCORSHeaders(response) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// 创建带 CORS 头的 JSON 响应
export function jsonResponse(data, options = {}) {
  return new Response(JSON.stringify(data), {
    status: options.status || 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...options.headers,
    },
  });
}

// 创建带 CORS 头的错误响应
export function errorResponse(message, status = 500) {
  return jsonResponse({ error: message }, { status });
}
