
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/peserta/dashboard',
    name: 'peserta.dashboard',
    component: () => import('../views/peserta/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['peserta'],
    },
  },
  {
    path: '/panitia/dashboard',
    name: 'panitia.dashboard',
    component: () => import('../views/panitia/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['panitia'],
    },
  },
  {
    path: '/developer/dashboard',
    name: 'developer.dashboard',
    component: () => import('../views/developer/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['developer'],
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

function getDashboardPath(role) {
  const dashboards = {
    peserta: '/peserta/dashboard',
    panitia: '/panitia/dashboard',
    developer: '/developer/dashboard',
  }

  return dashboards[role] ?? '/login'
}

router.beforeEach((to) => {
  const auth = useAuthStore()

  auth.initializeAuth()

  // Pengguna yang sudah login tidak perlu kembali ke halaman login
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return getDashboardPath(auth.role)
  }

  // Halaman yang membutuhkan autentikasi
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }

  // Memeriksa kesesuaian role pengguna
  if (
    to.meta.roles &&
    !to.meta.roles.includes(auth.role)
  ) {
    return getDashboardPath(auth.role)
  }

  return true
})

export default router
