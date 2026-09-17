const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.__ENV_API_URL__) {
    return window.__ENV_API_URL__;
  }
  return import.meta.env.VITE_API_BASE_URL || '';
};

class ApiService {
  constructor() {
    this.token = localStorage.getItem('meta_autopost_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('meta_autopost_token', token);
    } else {
      localStorage.removeItem('meta_autopost_token');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const baseUrl = getApiUrl().replace(/\/$/, ''); // Remove trailing slash if any
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${formattedEndpoint}`;

    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API Request Failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${url}):`, error.message);
      throw error;
    }
  }

  // Auth Methods
  login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  getProfile() {
    return this.request('/api/auth/me', { method: 'GET' });
  }

  seedAdmin() {
    return this.request('/api/auth/seed-admin', { method: 'POST' });
  }

  // Admin Methods
  getAdminUsers() {
    return this.request('/api/admin/users', { method: 'GET' });
  }

  createUser(userData) {
    return this.request('/api/admin/create-user', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  updateUserStatus(userId, status) {
    return this.request(`/api/admin/user/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  resetUserPassword(userId, newPassword) {
    return this.request(`/api/admin/user/${userId}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword })
    });
  }

  getUserData(userId) {
    return this.request(`/api/admin/user/${userId}/data`, { method: 'GET' });
  }

  updateUserDetails(userId, updateData) {
    return this.request(`/api/admin/user/${userId}/update`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  getAdminStats() {
    return this.request('/api/admin/stats', { method: 'GET' });
  }

  // Account Methods
  getAccounts() {
    return this.request('/api/accounts', { method: 'GET' });
  }

  connectMetaAccount(shortLivedToken) {
    return this.request('/api/accounts/connect-meta', {
      method: 'POST',
      body: JSON.stringify({ shortLivedToken })
    });
  }

  connectMockAccount(accountData) {
    return this.request('/api/accounts/mock-connect', {
      method: 'POST',
      body: JSON.stringify(accountData)
    });
  }

  deleteAccount(accountId) {
    return this.request(`/api/accounts/${accountId}`, { method: 'DELETE' });
  }

  // Post Methods
  getPosts(status = 'all') {
    return this.request(`/api/posts?status=${status}`, { method: 'GET' });
  }

  createPost(postData) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  publishPostNow(postId) {
    return this.request(`/api/posts/${postId}/publish-now`, { method: 'POST' });
  }

  deletePost(postId) {
    return this.request(`/api/posts/${postId}`, { method: 'DELETE' });
  }

  runSchedulerManual() {
    return this.request('/api/posts/run-scheduler-manual', { method: 'POST' });
  }
}

export const api = new ApiService();
