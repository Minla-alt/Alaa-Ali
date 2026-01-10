import axios from 'axios'
import { API_ENDPOINTS } from '../../../shared/constants.js'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Auth API calls
export const authApi = {
  register: (userData) => api.post(API_ENDPOINTS.AUTH + '/register', userData),
  login: (credentials) => api.post(API_ENDPOINTS.AUTH + '/login', credentials),
}

// Content API calls
export const contentApi = {
  getContent: (params) => api.get(API_ENDPOINTS.CONTENT, { params }),
  createContent: (contentData) => api.post(API_ENDPOINTS.CONTENT, contentData),
}

// AI API calls
export const aiApi = {
  generateContent: (promptData) => api.post(API_ENDPOINTS.AI + '/generate', promptData),
  translateContent: (translationData) => api.post(API_ENDPOINTS.AI + '/translate', translationData),
}

export default api