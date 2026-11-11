
import axios from 'axios'

// Konfigurasi utama Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request Interceptor
// Menambahkan Bearer Token secara otomatis ke setiap request.
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

// Response Interceptor
// Menangani respons dan error dari backend.
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const status = error.response?.status

    // HTTP 401: Token tidak valid atau sesi berakhir.
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    // HTTP 403: Pengguna tidak memiliki izin.
    if (status === 403) {
      console.error(
        'Akses ditolak: Anda tidak memiliki izin untuk melakukan tindakan ini.'
      )
    }

    // HTTP 404: Resource tidak ditemukan.
    if (status === 404) {
      console.error('Resource yang diminta tidak ditemukan.')
    }

    // HTTP 422: Validasi gagal.
    if (status === 422) {
      console.error('Validasi gagal:', error.response?.data?.errors)
    }

    // HTTP 429: Terlalu banyak request.
    if (status === 429) {
      console.error('Terlalu banyak permintaan. Silakan coba kembali.')
    }

    // Error jaringan atau server lainnya.
    if (!error.response) {
      console.error('Tidak dapat terhubung ke server API.')
    }

    return Promise.reject(error)
  }
)

export default api
