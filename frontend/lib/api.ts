const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  products: {
    getAll: () => fetchAPI('/api/products'),
    getById: (id: string) => fetchAPI(`/api/products/${id}`),
  },
  checkout: {
    create: (data: { customer_email: string; items: Array<{ product_id: string; qty: number }> }) =>
      fetchAPI('/api/checkout', { method: 'POST', body: JSON.stringify(data) }),
  },
  payments: {
    createIntent: (orderId: string) =>
      fetchAPI('/api/payments/stripe/create-intent', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId }),
      }),
  },
  admin: {
    login: (email: string, password: string) =>
      fetchAPI('/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    orders: {
      getAll: (token: string) =>
        fetchAPI('/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      getById: (id: string, token: string) =>
        fetchAPI(`/api/admin/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      updateStatus: (id: string, status: string, token: string) =>
        fetchAPI(`/api/admin/orders/${id}/status`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status }),
        }),
    },
    products: {
      getAll: (token: string) =>
        fetchAPI('/api/admin/products', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      create: (data: any, token: string) =>
        fetchAPI('/api/admin/products', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any, token: string) =>
        fetchAPI(`/api/admin/products/${id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(data),
        }),
      delete: (id: string, token: string) =>
        fetchAPI(`/api/admin/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }),
    },
  },
};
