import axios from 'axios'
import router from '../router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request Interceptor: Sisipkan token Bearer otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Penanganan respons dan error terpusat (Bab 9.3)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    // HTTP 401: Token tidak valid / sesi habis -> bersihkan auth & arahkan ke login
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session_expired=1'
      }
    }

    // HTTP 403: Role tidak sesuai / akses ditolak -> arahkan ke halaman 403
    if (status === 403) {
      if (window.location.pathname !== '/403') {
        router.push('/403')
      }
    }

    return Promise.reject(error)
  }
)

export default api