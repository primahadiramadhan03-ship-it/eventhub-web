<template>
  <!-- ======================================================================= -->
  <!-- 1. DESKTOP SIDEBAR (Tampil permanen pada layar >= 992px)               -->
  <!-- ======================================================================= -->
  <aside class="sidebar-desktop d-none d-lg-flex flex-column flex-shrink-0 bg-dark text-white p-3 shadow">
    <div class="d-flex flex-column h-100 justify-content-between">
      <div>
        <!-- Brand & Badge Peran Desktop -->
        <div class="d-flex align-items-center gap-2 mb-4 px-2">
          <span class="fs-4">🚀</span>
          <div>
            <div class="fw-bold fs-5 text-white lh-1">EventHub</div>
            <small class="text-secondary text-uppercase tracking-wider" style="font-size: 0.7rem;">
              Workspace Panel
            </small>
          </div>
        </div>

        <div class="px-2 mb-3">
          <span
            class="badge text-uppercase px-2 py-1 small"
            :class="auth.isPanitia ? 'bg-primary' : 'bg-success'"
          >
            ● Peran: {{ auth.role }}
          </span>
        </div>

        <hr class="border-secondary my-2" />

        <!-- Navigasi Menu Panitia -->
        <template v-if="auth.isPanitia">
          <div class="text-secondary small fw-bold text-uppercase px-2 my-2" style="font-size: 0.72rem;">
            Menu Panitia
          </div>
          <ul class="nav nav-pills flex-column gap-1 mb-auto">
            <li class="nav-item">
              <router-link to="/organizer" exact class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3">
                <span>📊</span> <span>Dashboard</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/organizer/events" class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3">
                <span>📅</span> <span>Event Saya</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/organizer/events/create" class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3">
                <span>➕</span> <span>Buat Event Baru</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/organizer/check-in" class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3">
                <span>🎟️</span> <span>Presensi Check-In</span>
              </router-link>
            </li>
          </ul>
        </template>

        <!-- Navigasi Menu Developer -->
        <template v-if="auth.isDeveloper">
          <div class="text-secondary small fw-bold text-uppercase px-2 my-2" style="font-size: 0.72rem;">
            Menu Developer
          </div>
          <ul class="nav nav-pills flex-column gap-1 mb-auto">
            <li class="nav-item">
              <router-link to="/admin" exact class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3">
                <span>📊</span> <span>Dashboard Admin</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/review" class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3">
                <span>📋</span> <span>Antrean Review</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/payments" class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3">
                <span>💳</span> <span>Verifikasi Bayar</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/categories" class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3">
                <span>🏷️</span> <span>Kelola Kategori</span>
              </router-link>
            </li>
          </ul>
        </template>

        <hr class="border-secondary my-3" />

        <!-- Tautan Luar -->
        <div class="text-secondary small fw-bold text-uppercase px-2 mb-2" style="font-size: 0.72rem;">
          Tautan Luar
        </div>
        <ul class="nav nav-pills flex-column gap-1">
          <li class="nav-item">
            <router-link to="/" class="nav-link text-white-50 d-flex align-items-center gap-2 py-2 px-3 rounded-3">
              <span>🌐</span> <span>Katalog Publik</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Footer Profil & Logout Desktop -->
      <div class="pt-3 border-top border-secondary">
        <div class="d-flex align-items-center gap-2 text-truncate px-2 mb-2">
          <span class="fs-5">👤</span>
          <div class="text-truncate">
            <div class="fw-semibold text-white small text-truncate">{{ auth.userName || 'Pengguna' }}</div>
            <div class="text-secondary small text-truncate" style="font-size: 0.75rem;">{{ auth.user?.email }}</div>
          </div>
        </div>
        <button class="btn btn-outline-danger btn-sm w-100 rounded-3 mt-1 py-1" @click="handleLogout">
          🚪 Keluar Akun
        </button>
      </div>
    </div>
  </aside>

  <!-- ======================================================================= -->
  <!-- 2. MOBILE & TABLET OFFCANVAS (Menu geser untuk layar < 992px, Bab 9.2)  -->
  <!-- ======================================================================= -->
  <div
    class="offcanvas offcanvas-start bg-dark text-white d-lg-none"
    tabindex="-1"
    id="dashboardSidebar"
    aria-labelledby="dashboardSidebarLabel"
    style="width: 280px;"
  >
    <div class="offcanvas-header border-bottom border-secondary pb-3">
      <div class="d-flex align-items-center gap-2">
        <span class="fs-4">🚀</span>
        <h5 class="offcanvas-title fw-bold text-white mb-0" id="dashboardSidebarLabel">EventHub</h5>
      </div>
      <button
        type="button"
        class="btn-close btn-close-white"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>

    <div class="offcanvas-body p-3 d-flex flex-column justify-content-between">
      <div>
        <div class="px-2 mb-3">
          <span
            class="badge text-uppercase px-2 py-1 small"
            :class="auth.isPanitia ? 'bg-primary' : 'bg-success'"
          >
            ● Peran: {{ auth.role }}
          </span>
        </div>

        <hr class="border-secondary my-2" />

        <!-- Menu Panitia Mobile -->
        <template v-if="auth.isPanitia">
          <div class="text-secondary small fw-bold text-uppercase px-2 my-2" style="font-size: 0.72rem;">
            Menu Panitia
          </div>
          <ul class="nav nav-pills flex-column gap-1 mb-auto">
            <li class="nav-item">
              <router-link to="/organizer" exact class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3" @click="closeOffcanvas">
                <span>📊</span> <span>Dashboard</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/organizer/events" class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3" @click="closeOffcanvas">
                <span>📅</span> <span>Event Saya</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/organizer/events/create" class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3" @click="closeOffcanvas">
                <span>➕</span> <span>Buat Event Baru</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/organizer/check-in" class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3" @click="closeOffcanvas">
                <span>🎟️</span> <span>Presensi Check-In</span>
              </router-link>
            </li>
          </ul>
        </template>

        <!-- Menu Developer Mobile -->
        <template v-if="auth.isDeveloper">
          <div class="text-secondary small fw-bold text-uppercase px-2 my-2" style="font-size: 0.72rem;">
            Menu Developer
          </div>
          <ul class="nav nav-pills flex-column gap-1 mb-auto">
            <li class="nav-item">
              <router-link to="/admin" exact class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3" @click="closeOffcanvas">
                <span>📊</span> <span>Dashboard Admin</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/review" class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3" @click="closeOffcanvas">
                <span>📋</span> <span>Antrean Review</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/payments" class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3" @click="closeOffcanvas">
                <span>💳</span> <span>Verifikasi Bayar</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin/categories" class="nav-link text-white d-flex align-items-center gap-2 py-2 px-3 rounded-3" @click="closeOffcanvas">
                <span>🏷️</span> <span>Kelola Kategori</span>
              </router-link>
            </li>
          </ul>
        </template>

        <hr class="border-secondary my-3" />

        <!-- Tautan Luar Mobile -->
        <ul class="nav nav-pills flex-column gap-1">
          <li class="nav-item">
            <router-link to="/" class="nav-link text-white-50 d-flex align-items-center gap-2 py-2 px-3 rounded-3" @click="closeOffcanvas">
              <span>🌐</span> <span>Katalog Publik</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Footer Profil & Logout Mobile -->
      <div class="pt-3 border-top border-secondary">
        <div class="d-flex align-items-center gap-2 text-truncate px-2 mb-2">
          <span class="fs-5">👤</span>
          <div class="text-truncate">
            <div class="fw-semibold text-white small text-truncate">{{ auth.userName || 'Pengguna' }}</div>
            <div class="text-secondary small text-truncate" style="font-size: 0.75rem;">{{ auth.user?.email }}</div>
          </div>
        </div>
        <button class="btn btn-outline-danger btn-sm w-100 rounded-3 mt-1 py-1" @click="handleLogout">
          🚪 Keluar Akun
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

function closeOffcanvas() {
  const el = document.getElementById('dashboardSidebar')
  if (el) {
    const bsOffcanvas = window.bootstrap?.Offcanvas?.getInstance(el)
    bsOffcanvas?.hide()
  }
}

async function handleLogout() {
  closeOffcanvas()
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar-desktop {
  width: 260px;
  min-height: 100vh;
  position: sticky;
  top: 0;
  z-index: 1020;
}

.nav-link {
  transition: all 0.2s ease;
  font-size: 0.92rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff !important;
}

.nav-link.router-link-active {
  background-color: #3b82f6 !important;
  color: #fff !important;
  font-weight: 600;
}
</style>
