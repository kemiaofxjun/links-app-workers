import { SignJWT, jwtVerify } from 'jose';
import { jsonResponse, errorResponse } from '../utils/cors.js';

// GitHub OAuth 配置
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

// 生成随机状态字符串
function generateState() {
  return crypto.randomUUID();
}

// 创建 JWT Token
async function createJWT(payload, secret) {
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
}

// 验证 JWT Token
async function verifyJWT(token, secret) {
  try {
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}

// 处理 GitHub OAuth 登录
export async function handleAuth(request, env) {
  try {
    const url = new URL(request.url);
    const redirectUri = `${url.origin}/api/auth/callback`;
    const state = generateState();

    // 构建 GitHub OAuth URL
    const authUrl = new URL(GITHUB_AUTH_URL);
    authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'read:user user:email');
    authUrl.searchParams.set('state', state);

    // 将 state 存储到 KV (5分钟过期)
    await env.LINKS_KV.put(`auth_state:${state}`, 'valid', { expirationTtl: 300 });

    return Response.redirect(authUrl.toString(), 302);
  } catch (error) {
    console.error('Auth error:', error);
    return errorResponse('Authentication failed', 500);
  }
}

// 处理 GitHub OAuth 回调
export async function handleAuthCallback(request, env) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    console.log('Callback received:', { code: !!code, state, error });

    if (error) {
      console.error('GitHub OAuth error:', error);
      return errorResponse(`GitHub OAuth error: ${error}`, 400);
    }

    if (!code || !state) {
      console.error('Missing parameters:', { code: !!code, state: !!state });
      return errorResponse('Missing code or state parameter', 400);
    }

    // 验证 state
    const storedState = await env.LINKS_KV.get(`auth_state:${state}`);
    console.log('State validation:', { provided: state, stored: !!storedState });

    if (!storedState) {
      return errorResponse('Invalid or expired state', 400);
    }

    // 删除已使用的 state
    await env.LINKS_KV.delete(`auth_state:${state}`);

    // 检查环境变量
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      console.error('Missing GitHub OAuth credentials');
      return errorResponse('GitHub OAuth not configured', 500);
    }

    // 交换 code 获取 access token
    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Links-App-Workers/1.0',
      },
      body: new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token response error:', errorText);
      return errorResponse(`GitHub token request failed: ${tokenResponse.status}`, 400);
    }

    // 解析 token 响应
    let tokenData;
    try {
      const responseText = await tokenResponse.text();
      console.log('Raw token response length:', responseText.length);
      console.log('Raw token response preview:', responseText.substring(0, 100));

      if (responseText.includes('access_token=')) {
        const params = new URLSearchParams(responseText);
        tokenData = {
          access_token: params.get('access_token'),
          token_type: params.get('token_type'),
          scope: params.get('scope'),
          error: params.get('error'),
          error_description: params.get('error_description')
        };
      } else {
        tokenData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse token response:', parseError);
      return errorResponse('Failed to parse GitHub token response', 500);
    }

    console.log('Token data parsed:', {
      has_access_token: !!tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      error: tokenData.error
    });

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error, tokenData.error_description);
      return errorResponse(`Token exchange error: ${tokenData.error}`, 400);
    }

    if (!tokenData.access_token) {
      console.error('No access token received:', tokenData);
      return errorResponse('Failed to get access token from GitHub', 400);
    }

    // 获取用户信息 - 使用更严格的错误处理
    console.log('Fetching user data from GitHub API...');

    const userResponse = await fetch(GITHUB_USER_URL, {
      method: 'GET',
      headers: {
        'Authorization': `token ${tokenData.access_token}`, // 使用 'token' 而不是 'Bearer'
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Links-App-Workers/1.0',
      },
      // 添加超时控制
      signal: AbortSignal.timeout(10000), // 10秒超时
    });

    console.log('User API response status:', userResponse.status);
    console.log('User API response headers:', Object.fromEntries(userResponse.headers.entries()));

    // 详细的错误处理
    if (!userResponse.ok) {
      const userErrorText = await userResponse.text();
      console.error('GitHub User API error details:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        headers: Object.fromEntries(userResponse.headers.entries()),
        body: userErrorText
      });

      // 根据不同的错误状态码提供更具体的错误信息
      switch (userResponse.status) {
        case 401:
          return errorResponse('GitHub access token is invalid or expired', 401);
        case 403:
          return errorResponse('GitHub API rate limit exceeded or access forbidden', 403);
        case 404:
          return errorResponse('GitHub user not found', 404);
        default:
          return errorResponse(`GitHub API error: ${userResponse.status} ${userResponse.statusText}`, 400);
      }
    }

    // 安全地解析用户数据
    let userData;
    try {
      const userResponseText = await userResponse.text();
      console.log('User response length:', userResponseText.length);
      console.log('User response preview:', userResponseText.substring(0, 200));

      if (!userResponseText.trim()) {
        throw new Error('Empty response from GitHub User API');
      }

      userData = JSON.parse(userResponseText);

      // 验证必需的用户数据字段
      if (!userData.id || !userData.login) {
        throw new Error('Invalid user data: missing required fields');
      }

    } catch (userParseError) {
      console.error('Failed to parse user response:', userParseError);
      return errorResponse('Failed to parse GitHub user data', 500);
    }

    console.log('User data received successfully:', {
      id: userData.id,
      login: userData.login,
      name: userData.name,
      has_email: !!userData.email
    });

    // 创建 JWT token
    const jwtPayload = {
      id: userData.id,
      login: userData.login,
      name: userData.name || userData.login,
      email: userData.email || null,
      avatar_url: userData.avatar_url || null,
      iat: Math.floor(Date.now() / 1000),
    };

    const jwtToken = await createJWT(jwtPayload, env.JWT_SECRET);

    // 重定向到主页，带上 token
    const redirectUrl = new URL(url.origin);
    redirectUrl.searchParams.set('token', jwtToken);

    console.log('Authentication successful, redirecting to:', redirectUrl.toString());
    return Response.redirect(redirectUrl.toString(), 302);

  } catch (error) {
    console.error('Callback error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return errorResponse(`Authentication callback failed: ${error.message}`, 500);
  }
}

// 验证用户认证状态
export async function verifyAuth(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, env.JWT_SECRET);

    return payload;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// 从请求中获取 token
export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}





