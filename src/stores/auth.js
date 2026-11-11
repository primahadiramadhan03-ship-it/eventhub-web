
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const role = computed(() => user.value?.role ?? null)

  function setAuth(userData, accessToken) {
    user.value = userData
    token.value = accessToken

    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  async function login(credentials) {
    loading.value = true

    try {
      const result = await authService.login(credentials)

      setAuth(result.data.user, result.data.token)

      return result
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    const result = await authService.getMe()

    user.value = result.data
    localStorage.setItem('user', JSON.stringify(result.data))

    return result.data
  }

  async function logout() {
    try {
      if (token.value) {
        await authService.logout()
      }
    } finally {
      clearAuth()
    }
  }

  function clearAuth() {
    user.value = null
    token.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function initializeAuth() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      } catch {
        clearAuth()
      }
    }
  }

  return {
    user,
    token,
    loading,
    role,
    isAuthenticated,
    login,
    logout,
    fetchUser,
    setAuth,
    clearAuth,
    initializeAuth,
  }
})
