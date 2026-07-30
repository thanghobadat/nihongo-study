const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface RequestOptions {
  headers?: Record<string, string>;
  token?: string; // Optional override token (e.g. during reset password)
  skipCache?: boolean; // Force fresh fetch, bypassing cache
}

const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export function clearApiCache(pathPrefix?: string) {
  if (!pathPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(pathPrefix)) {
      memoryCache.delete(key);
    }
  }
}

async function request(path: string, method: string, body: any = null, options: RequestOptions = {}) {
  const isGet = method === 'GET';
  const cacheKey = `${path}`;

  // Invalidate cache on mutations
  if (!isGet) {
    clearApiCache();
  }

  // Check cache for GET requests
  if (isGet && !options.skipCache) {
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const url = `${BASE_URL}${path}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Get token from localStorage if available (client side only)
  let token = options.token;
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('token') || undefined;
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  let response = await fetch(url, fetchOptions);
  
  // Handle automatic silent refresh on 401 errors
  if (response.status === 401 && path !== '/api/auth/refresh' && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData?.session) {
            localStorage.setItem('token', refreshData.session.access_token);
            localStorage.setItem('refreshToken', refreshData.session.refresh_token);
            if (refreshData.user) {
              localStorage.setItem('user', JSON.stringify(refreshData.user));
            }
            
            // Retry request with new token
            headers['Authorization'] = `Bearer ${refreshData.session.access_token}`;
            response = await fetch(url, fetchOptions);
          }
        } else {
          // Refresh failed (refresh token expired too) -> force logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login?expired=true';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
      } catch (e) {
        console.error('Silent refresh token error:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
    }
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
    throw new Error(errorMsg);
  }

  // Cache GET request result
  if (isGet && data) {
    memoryCache.set(cacheKey, { data, timestamp: Date.now() });
  }

  return data;
}

export const api = {
  get: (path: string, options?: RequestOptions) => request(path, 'GET', null, options),
  post: (path: string, body?: any, options?: RequestOptions) => request(path, 'POST', body, options),
  put: (path: string, body?: any, options?: RequestOptions) => request(path, 'PUT', body, options),
  delete: (path: string, options?: RequestOptions) => request(path, 'DELETE', null, options),
  clearCache: clearApiCache,
  
  // Auth state management helpers
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
  setRefreshToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  },
  getRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },
  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  getUser: () => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    }
    return null;
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    clearApiCache();
  }
};
