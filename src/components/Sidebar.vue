<template>
  <!-- ======================================================================= -->
  <!-- 1. DESKTOP SIDEBAR (Tampil permanen pada layar >= 992px)               -->
  <!--    Panitia: #1E1B4B | Developer: #0F172A | Active: #4F46E5             -->
  <!-- ======================================================================= -->
  <aside
    class="sidebar-desktop d-none d-lg-flex flex-column flex-shrink-0 justify-content-between"
    :class="auth.isDeveloper ? 'sidebar-developer' : 'sidebar-panitia'"
  >
    <div class="p-4">
      <!-- Brand Header (Figma 2002:1783 / 2002:2360) -->
      <router-link to="/" class="text-decoration-none d-flex align-items-center gap-2 mb-4">
        <div
          class="d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
          style="width: 32px; height: 32px; background-color: #4f46e5; border-radius: 8px; font-size: 16px;"
        >
          EH
        </div>
        <span class="fw-bold text-white" style="font-size: 17px; letter-spacing: -0.4px;">
          EventHub
        </span>
        <span
          v-if="auth.isDeveloper"
          class="badge fw-bold ms-1"
          style="background-color: #1e293b; border: 1px solid #334155; color: #94a3b8; font-size: 10px; letter-spacing: 0.5px;"
        >
          MOD
        </span>
      </router-link>

      <!-- Navigasi Menu Panitia (Figma 2002:4638) -->
      <template v-if="auth.isPanitia">
        <ul class="nav flex-column gap-1">
          <li class="nav-item">
            <router-link
              to="/organizer"
              exact
              class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
            >
              <i class="bi bi-grid-1x2"></i>
              <span>Dashboard</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/organizer/events"
              class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
            >
              <i class="bi bi-calendar2-event"></i>
              <span>Kelola Event</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/organizer/check-in"
              class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
            >
              <i class="bi bi-qr-code-scan"></i>
              <span>Check-in</span>
            </router-link>
          </li>
          <li class="nav-item mt-1">
            <button
              type="button"
              class="eh-nav-link w-100 border-0 bg-transparent d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-start"
              @click="handleLogout"
            >
              <i class="bi bi-box-arrow-right"></i>
              <span>Keluar</span>
            </button>
          </li>
        </ul>
      </template>

      <!-- Navigasi Menu Developer (Figma 2002:5248) -->
      <template v-if="auth.isDeveloper">
        <ul class="nav flex-column gap-1">
          <li class="nav-item">
            <router-link
              to="/admin"
              exact
              class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
            >
              <i class="bi bi-grid-1x2"></i>
              <span>Dashboard</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/admin/review"
              class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
            >
              <i class="bi bi-shield-check"></i>
              <span>Antrean Moderasi</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/admin/payments"
              class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
            >
              <i class="bi bi-receipt"></i>
              <span>Transaksi</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              to="/admin/categories"
              class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
            >
              <i class="bi bi-tags"></i>
              <span>Kategori dan Venue</span>
            </router-link>
          </li>
          <li class="nav-item mt-1">
            <button
              type="button"
              class="eh-nav-link w-100 border-0 bg-transparent d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-start"
              @click="handleLogout"
            >
              <i class="bi bi-box-arrow-right"></i>
              <span>Keluar</span>
            </button>
          </li>
        </ul>
      </template>
    </div>

    <!-- Bottom Avatar Section (Figma 2002:1809 / 2002:2397) -->
    <div
      class="p-3"
      :style="
        auth.isDeveloper
          ? 'border-top: 1px solid #1e293b;'
          : 'border-top: 1px solid #312e81;'
      "
    >
      <div class="d-flex align-items-center gap-3">
        <div
          class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
          style="width: 40px; height: 40px; background-color: #312e81; font-size: 13px;"
        >
          {{ auth.isDeveloper ? 'DEV' : 'PB' }}
        </div>
        <div class="text-truncate">
          <div class="fw-semibold text-white text-truncate" style="font-size: 14px;">
            {{ auth.userName || (auth.isDeveloper ? 'Developer' : 'Panitia BEM') }}
          </div>
          <div
            class="text-truncate"
            :style="{ color: auth.isDeveloper ? '#94a3b8' : '#c7d2fe', fontSize: '12px' }"
          >
            {{ auth.isDeveloper ? 'Moderator Platform' : 'Penyelenggara Resmi' }}
          </div>
        </div>
      </div>
    </div>
  </aside>

  <!-- ======================================================================= -->
  <!-- 2. MOBILE & TABLET OFFCANVAS (Menu geser untuk layar < 992px)          -->
  <!-- ======================================================================= -->
  <div
    class="offcanvas offcanvas-start text-white d-lg-none"
    :class="auth.isDeveloper ? 'sidebar-developer' : 'sidebar-panitia'"
    tabindex="-1"
    id="dashboardSidebar"
    aria-labelledby="dashboardSidebarLabel"
    style="width: 260px;"
  >
    <div
      class="offcanvas-header pb-3"
      :style="auth.isDeveloper ? 'border-bottom: 1px solid #1e293b;' : 'border-bottom: 1px solid #312e81;'"
    >
      <div class="d-flex align-items-center gap-2">
        <div
          class="d-flex align-items-center justify-content-center fw-bold text-white"
          style="width: 32px; height: 32px; background-color: #4f46e5; border-radius: 8px; font-size: 15px;"
        >
          EH
        </div>
        <h5 class="offcanvas-title fw-bold text-white mb-0" id="dashboardSidebarLabel">
          EventHub
        </h5>
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
        <!-- Menu Panitia Mobile -->
        <template v-if="auth.isPanitia">
          <ul class="nav flex-column gap-1">
            <li class="nav-item">
              <router-link
                to="/organizer"
                exact
                class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
                @click="closeOffcanvas"
              >
                <i class="bi bi-grid-1x2"></i>
                <span>Dashboard</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/organizer/events"
                class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
                @click="closeOffcanvas"
              >
                <i class="bi bi-calendar2-event"></i>
                <span>Kelola Event</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/organizer/check-in"
                class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
                @click="closeOffcanvas"
              >
                <i class="bi bi-qr-code-scan"></i>
                <span>Check-in</span>
              </router-link>
            </li>
            <li class="nav-item mt-1">
              <button
                type="button"
                class="eh-nav-link w-100 border-0 bg-transparent d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-start"
                @click="handleLogout"
              >
                <i class="bi bi-box-arrow-right"></i>
                <span>Keluar</span>
              </button>
            </li>
          </ul>
        </template>

        <!-- Menu Developer Mobile -->
        <template v-if="auth.isDeveloper">
          <ul class="nav flex-column gap-1">
            <li class="nav-item">
              <router-link
                to="/admin"
                exact
                class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
                @click="closeOffcanvas"
              >
                <i class="bi bi-grid-1x2"></i>
                <span>Dashboard</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/admin/review"
                class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
                @click="closeOffcanvas"
              >
                <i class="bi bi-shield-check"></i>
                <span>Antrean Moderasi</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/admin/payments"
                class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
                @click="closeOffcanvas"
              >
                <i class="bi bi-receipt"></i>
                <span>Transaksi</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/admin/categories"
                class="eh-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none"
                @click="closeOffcanvas"
              >
                <i class="bi bi-tags"></i>
                <span>Kategori dan Venue</span>
              </router-link>
            </li>
            <li class="nav-item mt-1">
              <button
                type="button"
                class="eh-nav-link w-100 border-0 bg-transparent d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-start"
                @click="handleLogout"
              >
                <i class="bi bi-box-arrow-right"></i>
                <span>Keluar</span>
              </button>
            </li>
          </ul>
        </template>
      </div>

      <!-- Footer Profil Mobile -->
      <div
        class="pt-3"
        :style="auth.isDeveloper ? 'border-top: 1px solid #1e293b;' : 'border-top: 1px solid #312e81;'"
      >
        <div class="d-flex align-items-center gap-2">
          <div
            class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style="width: 36px; height: 36px; background-color: #312e81; font-size: 12px;"
          >
            {{ auth.isDeveloper ? 'DEV' : 'PB' }}
          </div>
          <div class="text-truncate">
            <div class="fw-semibold text-white small text-truncate">
              {{ auth.userName || (auth.isDeveloper ? 'Developer' : 'Panitia BEM') }}
            </div>
            <div class="small text-truncate" style="color: #c7d2fe; font-size: 11px;">
              {{ auth.isDeveloper ? 'Moderator Platform' : 'Penyelenggara Resmi' }}
            </div>
          </div>
        </div>
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
  if (el && window.bootstrap) {
    const instance = window.bootstrap.Offcanvas.getInstance(el)
    if (instance) instance.hide()
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
  width: 256px;
  min-height: 100vh;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-panitia {
  background-color: #1e1b4b !important;
  border-right: 1px solid #1e1b4b;
}

.sidebar-developer {
  background-color: #0f172a !important;
  border-right: 1px solid #0f172a;
}

.eh-nav-link {
  color: #c7d2fe;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.sidebar-developer .eh-nav-link {
  color: #cbd5e1;
}

.eh-nav-link:hover {
  background-color: rgba(79, 70, 229, 0.25);
  color: #ffffff;
}

.router-link-exact-active {
  background-color: #4f46e5 !important;
  color: #ffffff !important;
  font-weight: 600;
}
</style>
