export function getBaseUrl(): string {
  // If explicitly configured to a remote HTTPS domain
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // If running in browser
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Localhost, LAN IP (192.168.*, 10.*, 100.*, 172.*), or local domain
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('100.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
      host.endsWith('.local')
    ) {
      return `http://${host}:8080`;
    }
    return 'https://nihongo-flow-backend.onrender.com';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
}

export interface RequestOptions {
  headers?: Record<string, string>;
  token?: string; // Optional override token (e.g. during reset password)
  skipCache?: boolean; // Force fresh fetch, bypassing cache
}

const memoryCache = new Map<string, { data: any; timestamp: number }>();
const inFlightGets = new Map<string, Promise<any>>();
let refreshInFlight: Promise<string | null> | null = null;

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

function clearApiCacheMany(prefixes: string[]) {
  for (const prefix of prefixes) {
    clearApiCache(prefix);
  }
}

/**
 * Smart scoped cache invalidation so background heartbeats (e.g. every-30s study-time ping)
 * do not wipe out static lesson/syllabus caches, while real data mutations immediately
 * invalidate all affected views.
 */
function invalidateCacheForMutation(path: string) {
  if (path.startsWith('/api/user/study-time')) {
    clearApiCache('/api/user/study-time');
    return;
  }
  if (
    path.startsWith('/api/user/check-daily-notification') ||
    path.startsWith('/api/user/push-subscription') ||
    path.startsWith('/api/user/send-test-push') ||
    path.startsWith('/api/user/send-study-plan-notification')
  ) {
    clearApiCache('/api/user/push-subscription-status');
    return;
  }
  if (path.startsWith('/api/user/daily-report-ack')) {
    clearApiCache('/api/user/daily-report-status');
    return;
  }
  if (path.startsWith('/api/ai/')) {
    clearApiCache('/api/ai/quota');
    return;
  }
  if (path.startsWith('/api/user/custom/') || path.startsWith('/api/user/knowledge-items')) {
    clearApiCacheMany([
      '/api/user/custom/',
      '/api/user/knowledge-items',
      '/api/user/course-summary'
    ]);
    return;
  }
  if (
    path.startsWith('/api/user/progress') ||
    path.startsWith('/api/user/daily-tasks/') ||
    path.startsWith('/api/user/review-sessions') ||
    path.startsWith('/api/user/study-plan') ||
    path.startsWith('/api/user/replan-debt') ||
    path.startsWith('/api/user/target-plan')
  ) {
    clearApiCacheMany([
      '/api/user/progress',
      '/api/lessons/',
      '/api/user/lessons/',
      '/api/user/course-summary',
      '/api/user/review-sessions',
      '/api/user/dashboard-bundle',
      '/api/user/study-overview',
      '/api/user/study-plan',
      '/api/user/daily-history',
      '/api/user/study-debt',
      '/api/user/target-plan'
    ]);
    return;
  }
  // Fallback for admin mutations, auth changes, or unknown write endpoints
  clearApiCache();
}

/**
 * Single-flight silent JWT refresh mutex so concurrent 401 responses share 1 refresh request
 */
async function refreshAccessTokenSingleFlight(baseUrl: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (refreshInFlight) {
    return refreshInFlight;
  }

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  refreshInFlight = (async () => {
    try {
      const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData?.session?.access_token) {
          localStorage.setItem('token', refreshData.session.access_token);
          if (refreshData.session.refresh_token) {
            localStorage.setItem('refreshToken', refreshData.session.refresh_token);
          }
          if (refreshData.user) {
            localStorage.setItem('user', JSON.stringify(refreshData.user));
          }
          return refreshData.session.access_token as string;
        }
      }

      // Refresh failed (refresh token expired too) -> force logout
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      clearApiCache();
      window.location.href = '/login?expired=true';
      return null;
    } catch (e) {
      console.error('Silent refresh token error:', e);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      clearApiCache();
      window.location.href = '/login?expired=true';
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function executeRequest(path: string, method: string, body: any = null, options: RequestOptions = {}) {
  const isGet = method === 'GET';
  const cacheKey = `${path}`;

  // When skipping cache, append timestamp query parameter to bust any browser/proxy cache
  let finalPath = path;
  if (options.skipCache && isGet) {
    const separator = finalPath.includes('?') ? '&' : '?';
    if (!finalPath.includes('_t=')) {
      finalPath = `${finalPath}${separator}_t=${Date.now()}`;
    }
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${finalPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.skipCache) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  }

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
    cache: options.skipCache ? 'no-store' : 'default',
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  let response = await fetch(url, fetchOptions);

  // Handle automatic silent refresh on 401 errors with single-flight mutex
  if (response.status === 401 && path !== '/api/auth/refresh' && typeof window !== 'undefined') {
    const newAccessToken = await refreshAccessTokenSingleFlight(baseUrl);
    if (newAccessToken) {
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(url, { ...fetchOptions, headers });
    } else if (localStorage.getItem('refreshToken') === null) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
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

  // Cache GET request result (even when skipCache was used, update memoryCache for instant SWR peeks!)
  if (isGet && data) {
    memoryCache.set(cacheKey, { data, timestamp: Date.now() });
  }

  return data;
}

async function request(path: string, method: string, body: any = null, options: RequestOptions = {}) {
  const isGet = method === 'GET';
  const cacheKey = `${path}`;

  // Scoped cache invalidation on mutations
  if (!isGet) {
    invalidateCacheForMutation(path);
    return executeRequest(path, method, body, options);
  }

  // Check valid cache for GET requests
  if (!options.skipCache) {
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  // Deduplicate concurrent identical GET requests (when using cache or fetching dashboard-bundle)
  const canDeduplicate = !options.skipCache || path.startsWith('/api/user/dashboard-bundle');
  if (canDeduplicate) {
    const existingPromise = inFlightGets.get(cacheKey);
    if (existingPromise) {
      return existingPromise;
    }
  }

  const reqPromise = executeRequest(path, method, body, options).finally(() => {
    if (canDeduplicate) {
      inFlightGets.delete(cacheKey);
    }
  });

  if (canDeduplicate) {
    inFlightGets.set(cacheKey, reqPromise);
  }

  return reqPromise;
}

export const api = {
  get: (path: string, options?: RequestOptions) => request(path, 'GET', null, options),
  post: (path: string, body?: any, options?: RequestOptions) => request(path, 'POST', body, options),
  put: (path: string, body?: any, options?: RequestOptions) => request(path, 'PUT', body, options),
  delete: (path: string, options?: RequestOptions) => request(path, 'DELETE', null, options),
  clearCache: clearApiCache,
  /**
   * Synchronously peek at the latest cached GET data (for 0ms Stale-While-Revalidate UI rendering)
   */
  peekCache: (path: string) => {
    const entry = memoryCache.get(path);
    return entry ? entry.data : null;
  },
  primeCache: (path: string, data: any) => {
    if (data !== undefined && data !== null) {
      memoryCache.set(path, { data, timestamp: Date.now() });
    }
  },

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
