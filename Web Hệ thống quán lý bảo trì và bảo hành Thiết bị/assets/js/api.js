/**
 * API Layer - Hệ thống quản lý Bảo Trì & Bảo Hành
 * Vanilla JS Fetch API wrapper for backend communication
 */

const API = (function() {
  'use strict';

  // Configuration
  const CONFIG = {
    baseURL: 'http://localhost:5193/api', // Backend API base URL
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  // State
  let authToken = null;

  // Utility: Get stored token
  function loadToken() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      authToken = token;
      return token;
    }
    return null;
  }

  // Utility: Save token
  function saveToken(token, refreshToken) {
    authToken = token;
    localStorage.setItem('auth_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  // Utility: Clear token
  function clearToken() {
    authToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
  }

  // Build headers with auth
  function getHeaders(customHeaders = {}) {
    const headers = { ...CONFIG.headers, ...customHeaders };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }

  // Core request function
  async function request(endpoint, options = {}) {
    const url = `${CONFIG.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

    const config = {
      ...options,
      headers: getHeaders(options.headers),
      signal: controller.signal
    };

    // Handle FormData (don't set Content-Type)
    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Handle 401 - token expired
      if (response.status === 401) {
        clearToken();
        // Redirect to login if not already there
        if (!window.location.pathname.includes('login.html')) {
          window.location.href = 'login.html';
        }
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error = new Error(data?.message || `HTTP Error: ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Yêu cầu hết thời gian chờ. Vui lòng thử lại.');
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      }
      throw error;
    }
  }

  // HTTP Methods
  const http = {
    get: (endpoint, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      return request(url, { method: 'GET' });
    },

    post: (endpoint, data) => request(endpoint, {
      method: 'POST',
      body: data
    }),

    put: (endpoint, data) => request(endpoint, {
      method: 'PUT',
      body: data
    }),

    patch: (endpoint, data) => request(endpoint, {
      method: 'PATCH',
      body: data
    }),

    delete: (endpoint) => request(endpoint, {
      method: 'DELETE'
    }),

    upload: (endpoint, formData) => request(endpoint, {
      method: 'POST',
      body: formData
    })
  };

  // ========================================
  // AUTH API
  // ========================================
  const auth = {
    async login(username, password) {
      const data = await http.post('/auth/login', { username, password });
      if (data.accessToken) {
        saveToken(data.accessToken, data.refreshToken);
        // Store user info
        if (data.user) {
          localStorage.setItem('user_info', JSON.stringify(data.user));
        }
      }
      return data;
    },

    async logout() {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await http.post('/auth/logout', { refreshToken });
        }
      } finally {
        clearToken();
      }
    },

    async register(userData) {
      const data = await http.post('/auth/register', userData);
      if (data.accessToken) {
        saveToken(data.accessToken, data.refreshToken);
        if (data.user) {
          localStorage.setItem('user_info', JSON.stringify(data.user));
        }
      }
      return data;
    },

    async refreshToken() {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return null;
      const data = await http.post('/auth/refresh', { refreshToken });
      if (data.accessToken) {
        saveToken(data.accessToken, data.refreshToken);
      }
      return data;
    },

    async getProfile() {
      return http.get('/auth/me');
    },

    async updateProfile(profileData) {
      return http.put('/auth/profile', profileData);
    },

    async changePassword(currentPassword, newPassword) {
      return http.put('/auth/change-password', { currentPassword, newPassword });
    },

    getStoredUser() {
      try {
        const stored = localStorage.getItem('user_info');
        return stored ? JSON.parse(stored) : null;
      } catch { return null; }
    },

    isAuthenticated() {
      return !!authToken;
    },

    getToken() {
      return authToken;
    }
  };

  // ========================================
  // DEVICES API (Thiết bị)
  // ========================================
  const devices = {
    // Lấy danh sách thiết bị với phân trang, tìm kiếm, lọc
    async getList(params = {}) {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        status: params.status || '',
        categoryId: params.categoryId || '',
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      };
      return http.get('/devices', queryParams);
    },

    // Lấy chi tiết một thiết bị
    async getById(id) {
      return http.get(`/devices/${id}`);
    },

    // Tạo thiết bị mới
    async create(deviceData) {
      return http.post('/devices', deviceData);
    },

    // Cập nhật thiết bị
    async update(id, deviceData) {
      return http.put(`/devices/${id}`, deviceData);
    },

    // Xóa thiết bị
    async delete(id) {
      return http.delete(`/devices/${id}`);
    },

    // Lấy danh sách danh mục thiết bị
    async getCategories() {
      return http.get('/devices/categories');
    },

    // Xuất báo cáo thiết bị
    async exportReport(params = {}) {
      const queryParams = {
        format: params.format || 'excel',
        ...params
      };
      const response = await fetch(`${CONFIG.baseURL}/devices/export?${new URLSearchParams(queryParams)}`, {
        method: 'GET',
        headers: getHeaders(),
        signal: AbortSignal.timeout(CONFIG.timeout)
      });
      if (!response.ok) throw new Error('Xuất báo cáo thất bại');
      return response.blob();
    },

    // Import thiết bị từ file Excel
    async importFromExcel(file) {
      const formData = new FormData();
      formData.append('file', file);
      return http.upload('/devices/import', formData);
    }
  };

  // ========================================
  // MAINTENANCE API (Bảo trì / Bảo hành)
  // ========================================
  const maintenance = {
    // Lấy danh sách phiếu bảo trì/bảo hành
    async getList(params = {}) {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        status: params.status || '',
        type: params.type || '', // 'maintenance' | 'warranty'
        deviceId: params.deviceId || '',
        startDate: params.startDate || '',
        endDate: params.endDate || '',
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      };
      return http.get('/maintenance', queryParams);
    },

    // Lấy chi tiết phiếu
    async getById(id) {
      return http.get(`/maintenance/${id}`);
    },

    // Tạo phiếu bảo trì/bảo hành mới
    async create(ticketData) {
      return http.post('/maintenance', ticketData);
    },

    // Cập nhật phiếu
    async update(id, ticketData) {
      return http.put(`/maintenance/${id}`, ticketData);
    },

    // Cập nhật trạng thái phiếu
    async updateStatus(id, status, note = '') {
      return http.patch(`/maintenance/${id}/status`, { status, note });
    },

    // Gán kỹ thuật viên
    async assignTechnician(id, technicianId) {
      return http.patch(`/maintenance/${id}/assign`, { technicianId });
    },

    // Xóa phiếu
    async delete(id) {
      return http.delete(`/maintenance/${id}`);
    },

    // Lấy thống kê
    async getStats(params = {}) {
      return http.get('/maintenance/stats', params);
    },

    // Lấy lịch bảo trì sắp tới
    async getUpcoming(days = 7) {
      return http.get('/maintenance/upcoming', { days });
    },

    // Xuất báo cáo
    async exportReport(params = {}) {
      const queryParams = {
        format: params.format || 'excel',
        ...params
      };
      const response = await fetch(`${CONFIG.baseURL}/maintenance/export?${new URLSearchParams(queryParams)}`, {
        method: 'GET',
        headers: getHeaders(),
        signal: AbortSignal.timeout(CONFIG.timeout)
      });
      if (!response.ok) throw new Error('Xuất báo cáo thất bại');
      return response.blob();
    }
  };

  // ========================================
  // DASHBOARD API
  // ========================================
  const dashboard = {
    // Lấy thống kê tổng quan
    async getOverview() {
      return http.get('/dashboard/overview');
    },

    // Lấy biểu đồ thiết bị theo trạng thái
    async getDeviceStats() {
      return http.get('/dashboard/devices/stats');
    },

    // Lấy biểu đồ bảo trì theo tháng
    async getMaintenanceChart(months = 12) {
      return http.get('/dashboard/maintenance/chart', { months });
    },

    // Lấy hoạt động gần đây
    async getRecentActivity(limit = 10) {
      return http.get('/dashboard/recent-activity', { limit });
    },

    // Lấy cảnh báo (thiết bị sắp hết bảo hành, bảo trì quá hạn)
    async getAlerts() {
      return http.get('/dashboard/alerts');
    }
  };

  // ========================================
  // USERS API (Quản lý người dùng)
  // ========================================
  const users = {
    async getList(params = {}) {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        role: params.role || '',
        status: params.status || ''
      };
      return http.get('/users', queryParams);
    },

    async getById(id) {
      return http.get(`/users/${id}`);
    },

    async create(userData) {
      return http.post('/users', userData);
    },

    async update(id, userData) {
      return http.put(`/users/${id}`, userData);
    },

    async delete(id) {
      return http.delete(`/users/${id}`);
    },

    async resetPassword(id, newPassword) {
      return http.post(`/users/${id}/reset-password`, { newPassword });
    },

    async getRoles() {
      return http.get('/users/roles');
    }
  };

  // ========================================
  // CUSTOMERS API (Khách hàng)
  // ========================================
  const customers = {
    async getList(params = {}) {
      const queryParams = {
        page: params.page || 1,
        pageSize: params.pageSize || params.limit || 10,
        search: params.search || ''
      };
      return http.get('/customers', queryParams);
    },

    async getById(id) {
      return http.get(`/customers/${id}`);
    },

    async getByCode(code) {
      return http.get(`/customers/code/${code}`);
    },

    async create(customerData) {
      return http.post('/customers', customerData);
    },

    async update(id, customerData) {
      return http.put(`/customers/${id}`, { id, ...customerData });
    },

    async delete(id) {
      return http.delete(`/customers/${id}`);
    }
  };

  // ========================================
  // WARRANTY CLAIMS API (Bảo hành)
  // ========================================
  const warrantyClaims = {
    async getList(params = {}) {
      const queryParams = {
        page: params.page || 1,
        pageSize: params.pageSize || params.limit || 10,
        search: params.search || '',
        status: params.status || ''
      };
      return http.get('/warrantyclaims', queryParams);
    },

    async getById(id) {
      return http.get(`/warrantyclaims/${id}`);
    },

    async getByDeviceId(deviceId) {
      return http.get(`/warrantyclaims/device/${deviceId}`);
    },

    async getByCustomerId(customerId) {
      return http.get(`/warrantyclaims/customer/${customerId}`);
    },

    async create(claimData) {
      return http.post('/warrantyclaims', claimData);
    },

    async update(id, claimData) {
      return http.put(`/warrantyclaims/${id}`, { id, ...claimData });
    },

    async updateStatus(id, statusData) {
      return http.patch(`/warrantyclaims/${id}/status`, { id, ...statusData });
    },

    async delete(id) {
      return http.delete(`/warrantyclaims/${id}`);
    },

    async generateCode() {
      return http.get('/warrantyclaims/generate-code');
    }
  };

  // ========================================
  // MAINTENANCE REQUESTS API (Bảo trì)
  // ========================================
  const maintenanceRequests = {
    async getList(params = {}) {
      const queryParams = {
        page: params.page || 1,
        pageSize: params.pageSize || params.limit || 10,
        search: params.search || '',
        status: params.status || ''
      };
      return http.get('/maintenancerequests', queryParams);
    },

    async getById(id) {
      return http.get(`/maintenancerequests/${id}`);
    },

    async getByDeviceId(deviceId) {
      return http.get(`/maintenancerequests/device/${deviceId}`);
    },

    async getByCustomerId(customerId) {
      return http.get(`/maintenancerequests/customer/${customerId}`);
    },

    async getByTechnicianId(technicianId) {
      return http.get(`/maintenancerequests/technician/${technicianId}`);
    },

    async create(requestData) {
      return http.post('/maintenancerequests', requestData);
    },

    async update(id, requestData) {
      return http.put(`/maintenancerequests/${id}`, { id, ...requestData });
    },

    async updateStatus(id, statusData) {
      return http.patch(`/maintenancerequests/${id}/status`, { id, ...statusData });
    },

    async delete(id) {
      return http.delete(`/maintenancerequests/${id}`);
    },

    async generateCode() {
      return http.get('/maintenancerequests/generate-code');
    }
  };

  // ========================================
  // NOTIFICATIONS API
  // ========================================
  const notifications = {
    async getList(params = {}) {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        unreadOnly: params.unreadOnly || false
      };
      return http.get('/notifications', queryParams);
    },

    async markAsRead(id) {
      return http.patch(`/notifications/${id}/read`);
    },

    async markAllAsRead() {
      return http.patch('/notifications/read-all');
    },

    async getUnreadCount() {
      return http.get('/notifications/unread-count');
    }
  };

  // ========================================
  // SETTINGS API
  // ========================================
  const settings = {
    async getSystemSettings() {
      return http.get('/settings/system');
    },

    async updateSystemSettings(data) {
      return http.put('/settings/system', data);
    },

    async getNotificationSettings() {
      return http.get('/settings/notifications');
    },

    async updateNotificationSettings(data) {
      return http.put('/settings/notifications', data);
    }
  };

  // ========================================
  // FILE UPLOAD API
  // ========================================
  const files = {
    async upload(file, folder = 'general') {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      return http.upload('/files/upload', formData);
    },

    async uploadMultiple(files, folder = 'general') {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('folder', folder);
      return http.upload('/files/upload-multiple', formData);
    },

    async delete(fileId) {
      return http.delete(`/files/${fileId}`);
    }
  };

  // Initialize token on load
  loadToken();

  // Public API
  return {
    // Core
    request,
    http,
    setBaseURL: (url) => { CONFIG.baseURL = url; },

    // Auth
    auth,

    // Modules
    devices,
    maintenance,
    maintenanceRequests,
    warrantyClaims,
    customers,
    dashboard,
    users,
    notifications,
    settings,
    files
  };
})();

// Export for ES modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
