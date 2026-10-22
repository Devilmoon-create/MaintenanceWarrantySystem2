import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Use relative URL to work with Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API Endpoints
export const customerApi = {
  getAll: (params?: { page?: number; pageSize?: number; search?: string }) =>
    api.get('/customers', { params }),
  getById: (id: number) => api.get(`/customers/${id}`),
  getByCode: (code: string) => api.get(`/customers/code/${code}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: number, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

export const deviceApi = {
  getAll: (params?: { page?: number; pageSize?: number; search?: string }) =>
    api.get('/devices', { params }),
  getWarrantyExpiring: (days: number = 30) =>
    api.get('/devices/warranty-expiring', { params: { days } }),
  getById: (id: number) => api.get(`/devices/${id}`),
  getByCode: (code: string) => api.get(`/devices/code/${code}`),
  getBySerial: (serial: string) => api.get(`/devices/serial/${serial}`),
  getByCustomer: (customerId: number) => api.get(`/devices/customer/${customerId}`),
  create: (data: any) => api.post('/devices', data),
  update: (id: number, data: any) => api.put(`/devices/${id}`, data),
  delete: (id: number) => api.delete(`/devices/${id}`),
};

export const maintenanceApi = {
  getAll: (params?: { page?: number; pageSize?: number; search?: string; status?: number }) =>
    api.get('/maintenancerequests', { params }),
  getById: (id: number) => api.get(`/maintenancerequests/${id}`),
  getByDevice: (deviceId: number) => api.get(`/maintenancerequests/device/${deviceId}`),
  getByCustomer: (customerId: number) => api.get(`/maintenancerequests/customer/${customerId}`),
  getByTechnician: (technicianId: number) => api.get(`/maintenancerequests/technician/${technicianId}`),
  create: (data: any) => api.post('/maintenancerequests', data),
  update: (id: number, data: any) => api.put(`/maintenancerequests/${id}`, data),
  updateStatus: (id: number, data: any) => api.patch(`/maintenancerequests/${id}/status`, data),
  delete: (id: number) => api.delete(`/maintenancerequests/${id}`),
  generateCode: () => api.get('/maintenancerequests/generate-code'),
};

export const warrantyApi = {
  getAll: (params?: { page?: number; pageSize?: number; search?: string; status?: number }) =>
    api.get('/warrantyclaims', { params }),
  getById: (id: number) => api.get(`/warrantyclaims/${id}`),
  getByDevice: (deviceId: number) => api.get(`/warrantyclaims/device/${deviceId}`),
  getByCustomer: (customerId: number) => api.get(`/warrantyclaims/customer/${customerId}`),
  create: (data: any) => api.post('/warrantyclaims', data),
  update: (id: number, data: any) => api.put(`/warrantyclaims/${id}`, data),
  updateStatus: (id: number, data: any) => api.patch(`/warrantyclaims/${id}/status`, data),
  delete: (id: number) => api.delete(`/warrantyclaims/${id}`),
  generateCode: () => api.get('/warrantyclaims/generate-code'),
};

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (data: any) => api.post('/auth/register', data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
  updateProfile: (data: any) =>
    api.put('/auth/profile', data),
};

export const userApi = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

export default api;
