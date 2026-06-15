const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface RequestOptions {
  headers?: Record<string, string>;
  token?: string; // Optional override token (e.g. during reset password)
}

async function request(path: string, method: string, body: any = null, options: RequestOptions = {}) {
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

  return data;
}

export const api = {
  get: (path: string, options?: RequestOptions) => request(path, 'GET', null, options),
  post: (path: string, body?: any, options?: RequestOptions) => request(path, 'POST', body, options),
  put: (path: string, body?: any, options?: RequestOptions) => request(path, 'PUT', body, options),
  delete: (path: string, options?: RequestOptions) => request(path, 'DELETE', null, options),
  
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
  }
};
