function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'admin_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

async function adminFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
      window.location.href = '/admin/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const adminApi = {
  products: {
    getAll: (params?: { search?: string; page?: number; limit?: number; is_active?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.is_active !== undefined) query.set('is_active', params.is_active.toString());
      return adminFetch(`/api/admin/products?${query.toString()}`);
    },
    getById: (id: string) => adminFetch(`/api/admin/products/${id}`),
    create: (data: any) => adminFetch('/api/admin/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      adminFetch(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' }),
  },
  orders: {
    getAll: (params?: { status?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      return adminFetch(`/api/admin/orders?${query.toString()}`);
    },
    getById: (id: string) => adminFetch(`/api/admin/orders/${id}`),
    updateStatus: (id: string, status: string) =>
      adminFetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
};
