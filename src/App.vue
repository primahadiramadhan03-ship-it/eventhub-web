<template>
  <!-- ======================================================================= -->
  <!-- 1. TATA LETAK DASHBOARD (Khusus Panitia /organizer & Developer /admin)  -->
  <!-- ======================================================================= -->
  <div v-if="isDashboardLayout" class="d-flex min-vh-100 bg-light">
    <!-- Sidebar (Desktop statis + Mobile Offcanvas menu geser) -->
    <Sidebar />

    <!-- Konten Dashboard Kanan -->
    <div class="d-flex flex-column flex-grow-1 min-vw-0 overflow-hidden">
      <!-- Topbar Header -->
      <DashboardHeader />

      <!-- Area Tampilan View Dashboard -->
      <main class="flex-grow-1 p-3 p-md-4 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>

  <!-- ======================================================================= -->
  <!-- 2. TATA LETAK PUBLIK / PESERTA (Katalog, Detail, Login, Register, Tiket)-->
  <!-- ======================================================================= -->
  <div v-else class="d-flex flex-column min-vh-100">
    <!-- Navbar Publik -->
    <Navbar />

    <!-- Area Tampilan Publik / Tamu / Peserta -->
    <main class="flex-grow-1">
      <RouterView />
    </main>

    <!-- Footer Publik Ramah -->
    <footer class="bg-dark text-white py-4 mt-auto border-top border-secondary">
      <div class="container text-center text-md-start">
        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
              <span class="fs-5">🚀</span>
              <span class="fw-bold fs-5 text-white">EventHub</span>
            </div>
            <p class="small text-secondary mb-0">
              Platform Sewa Penayangan dan Pendaftaran Event Kampus & Komunitas Terintegrasi.
            </p>
          </div>
          <div class="col-md-6 text-center text-md-end">
            <small class="text-secondary">
              &copy; 2026 MPTI Kelompok 06 • UAS Rekayasa Perangkat Lunak
            </small>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import DashboardHeader from './components/DashboardHeader.vue'

const route = useRoute()

// Otomatis memilih layout berdasarkan awalan path rute aktif
const isDashboardLayout = computed(() => {
  const path = route.path
  return path.startsWith('/organizer') || path.startsWith('/admin')
})
</script>

<style>
/* Styling Global Transisi */
.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>


<style>
/* Styling Global Transisi */
.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>