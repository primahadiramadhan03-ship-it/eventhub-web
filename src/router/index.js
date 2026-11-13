import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  // Katalog publik (Tamu & pengguna login)
  {
    path: '/',
    name: 'public.events',
    component: () => import('../views/peserta/DashboardView.vue'), // Sementara mengarah ke placeholder sebelum halaman katalog dibuat di UAS06-28
    meta: {
      requiresAuth: false,
    },
  },
  // Autentikasi
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: {
      guestOnly: true,
    },
  },
  // Area Peserta
  {
    path: '/dashboard',
    name: 'peserta.dashboard',
    component: () => import('../views/peserta/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['peserta'],
    },
  },
  // Area Panitia
  {
    path: '/organizer',
    name: 'panitia.dashboard',
    component: () => import('../views/panitia/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['panitia'],
    },
  },
  // Area Developer
  {
    path: '/admin',
    name: 'developer.dashboard',
    component: () => import('../views/developer/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['developer'],
    },
  },
  // Halaman Galat
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('../views/errors/ForbiddenView.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/errors/NotFoundView.vue'),
    meta: {
      requiresAuth: false,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export function getDashboardPath(role) {
  const dashboards = {
    peserta: '/dashboard',
    panitia: '/organizer',
    developer: '/admin',
  }

  return dashboards[role] ?? '/'
}

router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.initializeAuth()

  // 1. Pengguna login yang membuka halaman khusus tamu (misal /login)
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return getDashboardPath(auth.role)
  }

  // 2. Halaman yang mewajibkan login
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  // 3. Hak akses role tidak sesuai -> arahkan ke Halaman 403 (Bab 9.3)
  if (
    to.meta.roles &&
    !to.meta.roles.includes(auth.role)
  ) {
    return '/403'
  }

  return true
})

export default router