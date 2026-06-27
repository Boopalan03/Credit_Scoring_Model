import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://credit-score-backend-8hrn.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if token is expired/invalid
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 1. Auth Services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  register: async (name, email, password, role = 'user') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }
};

// 2. Loan Application Services
export const applicationService = {
  submit: async (applicationData) => {
    const response = await api.post('/applications/apply', applicationData);
    return response.data;
  },
  getMyApplications: async () => {
    const response = await api.get('/applications/my-applications');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },
  verifyBank: async (accountNumber, ifsc, fullName) => {
    const response = await api.post('/applications/verify-bank', { accountNumber, ifsc, fullName });
    return response.data;
  }
};

// 3. Admin Services
export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getAllApplicants: async () => {
    const response = await api.get('/admin/applicants');
    return response.data;
  }
};

// 4. Chatbot Services
export const chatService = {
  sendMessage: async (message) => {
    const response = await api.post('/chat', { message });
    return response.data;
  }
};

export default api;
