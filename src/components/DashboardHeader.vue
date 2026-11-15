<template>
  <header class="dashboard-header bg-white border-bottom px-3 px-md-4 py-3 sticky-top shadow-sm">
    <div class="d-flex align-items-center justify-content-between">
      <!-- Sisi Kiri: Tombol Hamburger Mobile + Judul Halaman -->
      <div class="d-flex align-items-center gap-3">
        <!-- Tombol Menu Geser (Hanya tampil di Mobile & Tablet < 992px) -->
        <button
          class="btn btn-outline-secondary d-lg-none p-2 rounded-3 lh-1"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#dashboardSidebar"
          aria-controls="dashboardSidebar"
          title="Buka Menu"
        >
          <span class="fs-5">☰</span>
        </button>

        <!-- Judul Halaman Dinamis -->
        <div>
          <h1 class="h5 fw-bold mb-0 text-dark">{{ pageTitle }}</h1>
          <small class="text-secondary d-none d-sm-block">{{ pageSubtitle }}</small>
        </div>
      </div>

      <!-- Sisi Kanan: Bel Notifikasi + Profil Akun -->
      <div class="d-flex align-items-center gap-3">
        <!-- Komponen Bel Notifikasi -->
        <NotificationBell />

        <!-- Profil Dropdown -->
        <div class="dropdown">
          <button
            class="btn btn-light d-flex align-items-center gap-2 p-1 pe-3 rounded-pill border shadow-sm"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div
              class="avatar-circle rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
              style="width: 34px; height: 34px;"
            >
              {{ userInitial }}
            </div>
            <span class="d-none d-md-block fw-semibold text-dark small">
              {{ auth.userName || 'Pengguna' }}
            </span>
          </button>

          <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2">
            <li class="px-3 py-2 border-bottom">
              <div class="fw-bold text-dark small">{{ auth.userName }}</div>
              <div class="text-muted" style="font-size: 0.75rem;">{{ auth.user?.email }}</div>
              <span class="badge bg-primary text-uppercase mt-1" style="font-size: 0.65rem;">
                {{ auth.role }}
              </span>
            </li>
            <li>
              <router-link to="/" class="dropdown-item py-2 small">
                🌐 Lihat Katalog Event
              </router-link>
            </li>
            <li><hr class="dropdown-divider my-1" /></li>
            <li>
              <button class="dropdown-item py-2 small text-danger" @click="handleLogout">
                🚪 Keluar
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import NotificationBell from './common/NotificationBell.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const userInitial = computed(() => {
  const name = auth.userName || 'U'
  return name.charAt(0).toUpperCase()
})

const pageTitle = computed(() => {
  const path = route.path

  // Map Judul Halaman Panitia
  if (path === '/organizer') return 'Dashboard Panitia'
  if (path === '/organizer/events') return 'Kelola Event Saya'
  if (path === '/organizer/events/create') return 'Buat Event Baru'
  if (path.includes('/organizer/events/') && path.includes('/edit')) return 'Edit Event'
  if (path.includes('/organizer/events/') && path.includes('/payment')) return 'Pembayaran Sewa'
  if (path.includes('/organizer/events/') && path.includes('/report')) return 'Laporan Acara'
  if (path === '/organizer/check-in') return 'Presensi Check-In Hari-H'

  // Map Judul Halaman Developer
  if (path === '/admin') return 'Dashboard Administrator'
  if (path.startsWith('/admin/review')) return 'Antrean Review Event'
  if (path === '/admin/payments') return 'Verifikasi Pembayaran Sewa'
  if (path === '/admin/categories') return 'Manajemen Kategori Event'

  return 'Dashboard EventHub'
})

const pageSubtitle = computed(() => {
  if (auth.isPanitia) {
    return 'Panel pengelolaan event, pendaftaran, dan laporan panitia'
  }
  if (auth.isDeveloper) {
    return 'Panel moderasi event, verifikasi transaksi, dan konfigurasi master data'
  }
  return 'Selamat datang di EventHub'
})

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard-header {
  z-index: 1010;
}
</style>

