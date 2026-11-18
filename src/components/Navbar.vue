<template>
  <nav class="navbar navbar-expand-lg navbar-dark eh-navbar shadow-sm py-2">
    <div class="container">
      <!-- Brand Logo EH + EventHub (Figma 2002:3213) -->
      <router-link class="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
        <div
          class="d-flex align-items-center justify-content-center fw-bold text-white"
          style="width: 32px; height: 32px; background-color: #4f46e5; border-radius: 8px; font-size: 15px;"
        >
          EH
        </div>
        <span class="text-white" style="font-size: 17px; letter-spacing: -0.4px;">EventHub</span>
      </router-link>

      <button
        class="navbar-toggler border-0"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#eventhubNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="eventhubNavbar">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-1 ms-lg-3">
          <li class="nav-item">
            <router-link class="nav-link eh-pill-link px-3 py-1 rounded-2" exact to="/">
              Katalog Event
            </router-link>
          </li>

          <!-- Menu Peserta (Figma 2002:3213: Katalog, Dashboard, Riwayat, Keluar) -->
          <template v-if="auth.isPeserta">
            <li class="nav-item">
              <router-link class="nav-link eh-pill-link px-3 py-1 rounded-2" to="/dashboard">
                Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link eh-pill-link px-3 py-1 rounded-2" to="/my-registrations">
                Riwayat Pendaftaran
              </router-link>
            </li>
          </template>

          <!-- Menu Panitia -->
          <template v-if="auth.isPanitia">
            <li class="nav-item">
              <router-link class="nav-link eh-pill-link px-3 py-1 rounded-2" to="/organizer">
                Dashboard Panitia
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link eh-pill-link px-3 py-1 rounded-2" to="/organizer/events">
                Kelola Event
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link eh-pill-link px-3 py-1 rounded-2" to="/organizer/check-in">
                Check-in
              </router-link>
            </li>
          </template>

          <!-- Menu Developer -->
          <template v-if="auth.isDeveloper">
            <li class="nav-item">
              <router-link class="nav-link eh-pill-link px-3 py-1 rounded-2" to="/admin">
                Dashboard Developer
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link eh-pill-link px-3 py-1 rounded-2" to="/admin/review">
                Antrean Moderasi
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link eh-pill-link px-3 py-1 rounded-2" to="/admin/payments">
                Transaksi
              </router-link>
            </li>
          </template>
        </ul>

        <!-- Profil & Tombol Aksi -->
        <div class="d-flex align-items-center gap-2">
          <template v-if="auth.isAuthenticated">
            <span
              class="badge text-uppercase px-2 py-1"
              style="background-color: #312e81; color: #c7d2fe; font-size: 11px;"
            >
              {{ auth.role }}
            </span>
            <span class="text-white small me-2 fw-medium">
              {{ auth.userName }}
            </span>
            <button
              @click="handleLogout"
              class="btn btn-sm px-3"
              style="background-color: #312e81; color: #ffffff; border: 1px solid #4f46e5; border-radius: 6px; font-size: 13px;"
            >
              Keluar
            </button>
          </template>

          <template v-else>
            <router-link
              to="/login"
              class="btn btn-sm px-3"
              style="color: #ffffff; border: 1px solid #c7d2fe; border-radius: 6px; font-size: 13px;"
            >
              Masuk
            </router-link>
            <router-link
              to="/register"
              class="btn btn-sm px-3 text-white fw-medium"
              style="background-color: #4f46e5; border: 1px solid #4f46e5; border-radius: 6px; font-size: 13px;"
            >
              Daftar
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.eh-navbar {
  background-color: #1e1b4b !important;
  border-bottom: 1px solid #312e81;
}

.eh-pill-link {
  color: #c7d2fe !important;
  font-size: 14px;
  font-weight: 500;
}

.eh-pill-link:hover {
  color: #ffffff !important;
  background-color: rgba(79, 70, 229, 0.25);
}

.router-link-exact-active.eh-pill-link {
  background-color: #4f46e5 !important;
  color: #ffffff !important;
  font-weight: 600;
}
</style>
