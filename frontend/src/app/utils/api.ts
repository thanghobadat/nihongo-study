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

  const response = await fetch(url, fetchOptions);
  
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
      localStorage.removeItem('user');
    }
  }
};
