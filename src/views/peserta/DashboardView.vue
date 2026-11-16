<template>
  <div class="peserta-dashboard py-4 pb-5">
    <div class="container">
      <!-- ===================================================================== -->
      <!-- 1. WELCOME BANNER PESERTA                                             -->
      <!-- ===================================================================== -->
      <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 bg-gradient-peserta text-white">
        <div class="row align-items-center g-3">
          <div class="col-md-8">
            <span class="badge bg-white bg-opacity-25 px-3 py-1 rounded-pill small mb-2">
              🎓 Area Peserta EventHub
            </span>
            <h1 class="h3 fw-bold mb-1">
              Selamat Datang, {{ auth.userName || 'Peserta' }}! 👋
            </h1>
            <p class="opacity-90 small mb-0">
              Pantau tiket digital aktif Anda, lihat jadwal acara kampus mendatang, dan temukan berbagai event menarik lainnya.
            </p>
          </div>
          <div class="col-md-4 text-md-end">
            <router-link to="/" class="btn btn-light fw-bold px-4 py-2 rounded-pill shadow-sm">
              🔍 Jelajahi Katalog Event
            </router-link>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- 2. METRIK TIKET PESERTA                                               -->
      <!-- ===================================================================== -->
      <div class="row g-3 mb-4">
        <div class="col-sm-4">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-secondary small fw-semibold">Tiket Aktif</span>
              <span class="fs-4">🎟️</span>
            </div>
            <div class="display-6 fw-bold text-primary">{{ activeTickets.length }}</div>
            <small class="text-muted" style="font-size: 0.75rem;">Siap digunakan hari-H</small>
          </div>
        </div>

        <div class="col-sm-4">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-secondary small fw-semibold">Event Dihadiri</span>
              <span class="fs-4">✅</span>
            </div>
            <div class="display-6 fw-bold text-success">1</div>
            <small class="text-muted" style="font-size: 0.75rem;">Sudah presensi check-in</small>
          </div>
        </div>

        <div class="col-sm-4">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-secondary small fw-semibold">Total Pendaftaran</span>
              <span class="fs-4">📑</span>
            </div>
            <div class="display-6 fw-bold text-dark">{{ activeTickets.length + 1 }}</div>
            <small class="text-muted" style="font-size: 0.75rem;">Riwayat seluruh pendaftaran</small>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- 3. TIKET DIGITAL AKTIF MENDATANG                                      -->
      <!-- ===================================================================== -->
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h4 class="fw-bold text-dark mb-1">Tiket Masuk Aktif Anda</h4>
            <p class="text-secondary small mb-0">Tunjukkan e-tiket ini kepada panitia saat check-in di lokasi acara.</p>
          </div>
          <router-link to="/my-registrations" class="btn btn-outline-primary btn-sm rounded-pill px-3">
            Semua Riwayat Pendaftaran →
          </router-link>
        </div>

        <div class="row g-4">
          <div v-for="t in activeTickets" :key="t.id" class="col-12 col-md-6">
            <div class="card border rounded-4 p-4 h-100 bg-light transition-all ticket-preview-card">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="badge bg-primary px-3 py-1 rounded-pill small">
                  {{ t.category }}
                </span>
                <span class="badge bg-success-subtle text-success border border-success-subtle font-monospace small">
                  ● SIAP DIGUNAKAN
                </span>
              </div>

              <h5 class="fw-bold text-dark mb-2 line-clamp-2">{{ t.title }}</h5>

              <div class="small text-secondary mb-3 d-flex flex-column gap-1">
                <span>🗓️ {{ t.date }}</span>
                <span>📍 {{ t.location }}</span>
              </div>

              <div class="p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between mt-auto">
                <div>
                  <small class="text-muted d-block" style="font-size: 0.7rem;">KODE TIKET RESMI</small>
                  <span class="fw-bold text-primary font-monospace fs-6">{{ t.ticket_code }}</span>
                </div>
                <router-link
                  :to="`/my-registrations/${t.id}`"
                  class="btn btn-primary btn-sm rounded-pill px-3 fw-bold"
                >
                  Buka E-Tiket →
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

const activeTickets = ref([
  {
    id: 1,
    title: 'Seminar Nasional Artificial Intelligence & Masa Depan Pendidikan',
    category: 'Seminar',
    date: '15 Des 2026, 09:00 WIB',
    location: 'Auditorium Utama UNS, Surakarta',
    ticket_code: 'EVT-1-K3M9QX2A',
  },
])
</script>

<style scoped>
.bg-gradient-peserta {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.ticket-preview-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
