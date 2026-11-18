<template>
  <!-- ======================================================================= -->
  <!-- 1. TATA LETAK DASHBOARD (Khusus Panitia /organizer & Developer /admin)  -->
  <!-- ======================================================================= -->
  <div v-if="isDashboardLayout" class="d-flex min-vh-100" style="background-color: #eef2ff;">
    <!-- Sidebar (Desktop statis + Mobile Offcanvas menu geser) -->
    <Sidebar />

    <!-- Konten Dashboard Kanan -->
    <div class="d-flex flex-column flex-grow-1 min-vw-0 overflow-hidden">
      <!-- Topbar Header (Tampil pada mobile/tablet & bar notifikasi) -->
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
  <div v-else class="d-flex flex-column min-vh-100" style="background-color: #eef2ff;">
    <!-- Navbar Publik -->
    <Navbar />

    <!-- Area Tampilan Publik / Tamu / Peserta -->
    <main class="flex-grow-1">
      <RouterView />
    </main>

    <!-- Footer Publik -->
    <footer class="py-4 mt-auto" style="background-color: #1e1b4b; border-top: 1px solid #312e81; color: #c7d2fe;">
      <div class="container text-center text-md-start">
        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
              <div
                class="d-flex align-items-center justify-content-center fw-bold text-white"
                style="width: 26px; height: 26px; background-color: #4f46e5; border-radius: 6px; font-size: 12px;"
              >
                EH
              </div>
              <span class="fw-bold text-white" style="font-size: 16px;">EventHub</span>
            </div>
            <p class="small mb-0" style="color: #c7d2fe;">
              Platform Sewa Penayangan dan Pendaftaran Event Kampus &amp; Komunitas Terintegrasi.
            </p>
          </div>
          <div class="col-md-6 text-center text-md-end">
            <small style="color: #c7d2fe;">
              &copy; 2026 MPTI Kelompok 06 &bull; UAS Rekayasa Perangkat Lunak
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
