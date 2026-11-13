<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/">
        EventHub
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#eventhubNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="eventhubNavbar">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Katalog Event</router-link>
          </li>

          <!-- Menu Peserta -->
          <template v-if="auth.isPeserta">
            <li class="nav-item">
              <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/my-registrations">Tiket Saya</router-link>
            </li>
          </template>

          <!-- Menu Panitia -->
          <template v-if="auth.isPanitia">
            <li class="nav-item">
              <router-link class="nav-link" to="/organizer">Dashboard</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/organizer/events">Event Saya</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/organizer/check-in">Check-In</router-link>
            </li>
          </template>

          <!-- Menu Developer -->
          <template v-if="auth.isDeveloper">
            <li class="nav-item">
              <router-link class="nav-link" to="/admin">Dashboard</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/review">Antrean Review</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/payments">Pembayaran</router-link>
            </li>
          </template>
        </ul>

        <!-- Profil & Tombol Aksi -->
        <div class="d-flex align-items-center gap-2">
          <template v-if="auth.isAuthenticated">
            <span class="badge bg-primary text-uppercase me-2">
              {{ auth.role }}
            </span>
            <span class="text-light small me-3">
              {{ auth.userName }}
            </span>
            <button
              @click="handleLogout"
              class="btn btn-sm btn-outline-light"
            >
              Keluar
            </button>
          </template>

          <template v-else>
            <router-link to="/login" class="btn btn-sm btn-outline-light">
              Masuk
            </router-link>
            <router-link to="/register" class="btn btn-sm btn-primary">
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