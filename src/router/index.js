import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  // ===========================================================================
  // 1. RUTE PUBLIK / TAMU
  // ===========================================================================
  {
    path: '/',
    name: 'public.events',
    component: () => import('../views/public/HomeView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/events/:id',
    name: 'public.events.detail',
    component: () => import('../views/public/EventDetailView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/RegisterView.vue'),
    meta: { guestOnly: true },
  },

  // ===========================================================================
  // 2. RUTE PESERTA (role: peserta)
  // ===========================================================================
  {
    path: '/dashboard',
    name: 'peserta.dashboard',
    component: () => import('../views/peserta/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['peserta'] },
  },
  {
    path: '/my-registrations',
    name: 'peserta.registrations',
    component: () => import('../views/peserta/RegistrationsView.vue'),
    meta: { requiresAuth: true, roles: ['peserta'] },
  },
  {
    path: '/my-registrations/:id',
    name: 'peserta.ticket',
    component: () => import('../views/peserta/TicketView.vue'),
    meta: { requiresAuth: true, roles: ['peserta'] },
  },
  {
    path: '/events/:id/register',
    name: 'peserta.events.register',
    component: () => import('../views/peserta/EventRegisterView.vue'),
    meta: { requiresAuth: true, roles: ['peserta'] },
  },

  // ===========================================================================
  // 3. RUTE PANITIA (role: panitia)
  // ===========================================================================
  {
    path: '/organizer',
    name: 'panitia.dashboard',
    component: () => import('../views/panitia/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['panitia'] },
  },
  {
    path: '/organizer/events',
    name: 'panitia.events',
    component: () => import('../views/panitia/EventsView.vue'),
    meta: { requiresAuth: true, roles: ['panitia'] },
  },
  {
    path: '/organizer/events/create',
    name: 'panitia.events.create',
    component: () => import('../views/panitia/EventCreateView.vue'),
    meta: { requiresAuth: true, roles: ['panitia'] },
  },
  {
    path: '/organizer/events/:id/edit',
    name: 'panitia.events.edit',
    component: () => import('../views/panitia/EventEditView.vue'),
    meta: { requiresAuth: true, roles: ['panitia'] },
  },
  {
    path: '/organizer/events/:id/payment',
    name: 'panitia.events.payment',
    component: () => import('../views/panitia/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['panitia'] },
  },
  {
    path: '/organizer/events/:id/registrations',
    name: 'panitia.events.registrations',
    component: () => import('../views/panitia/EventRegistrationsView.vue'),
    meta: { requiresAuth: true, roles: ['panitia'] },
  },
  {
    path: '/organizer/check-in',
    name: 'panitia.checkin',
    component: () => import('../views/panitia/CheckInView.vue'),
    meta: { requiresAuth: true, roles: ['panitia'] },
  },
  {
    path: '/organizer/events/:id/report',
    name: 'panitia.events.report',
    component: () => import('../views/panitia/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['panitia'] },
  },

  // ===========================================================================
  // 4. RUTE DEVELOPER (role: developer)
  // ===========================================================================
  {
    path: '/admin',
    name: 'developer.dashboard',
    component: () => import('../views/developer/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['developer'] },
  },
  {
    path: '/admin/review',
    name: 'developer.review',
    component: () => import('../views/developer/ReviewQueueView.vue'),
    meta: { requiresAuth: true, roles: ['developer'] },
  },
  {
    path: '/admin/review/:id',
    name: 'developer.review.detail',
    component: () => import('../views/developer/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['developer'] },
  },
  {
    path: '/admin/payments',
    name: 'developer.payments',
    component: () => import('../views/developer/PaymentsView.vue'),
    meta: { requiresAuth: true, roles: ['developer'] },
  },
  {
    path: '/admin/categories',
    name: 'developer.categories',
    component: () => import('../views/developer/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['developer'] },
  },

  // ===========================================================================
  // 5. HALAMAN GALAT (Bab 9.1 & 9.3)
  // ===========================================================================
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('../views/errors/ForbiddenView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/errors/NotFoundView.vue'),
    meta: { requiresAuth: false },
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

// Global Navigation Guard
router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.initializeAuth()

  // 1. Pengguna sudah login mencoba membuka halaman tamu (misal /login)
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return getDashboardPath(auth.role)
  }

  // 2. Rute terproteksi namun belum login -> redirect ke login dengan query redirect
  if ((to.meta.requiresAuth || to.meta.roles) && !auth.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  // 3. Pemeriksaan hak akses peran (Guard 3 Role) -> jika tidak berhak, arahkan ke 403
  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return '/403'
  }

  return true
})

export default router