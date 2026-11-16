<template>
  <div class="developer-dashboard pb-5">
    <!-- ======================================================================= -->
    <!-- 1. WELCOME BANNER DEVELOPER                                             -->
    <!-- ======================================================================= -->
    <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-gradient-developer text-white">
      <div class="row align-items-center g-3">
        <div class="col-md-8">
          <span class="badge bg-white bg-opacity-25 px-3 py-1 rounded-pill small mb-2">
            ⚙️ Administrator & Moderasi Platform
          </span>
          <h2 class="h3 fw-bold mb-1">
            Dashboard Developer — EventHub
          </h2>
          <p class="opacity-90 small mb-0">
            Pusat kendali persetujuan penayangan event kampus, verifikasi bukti bayar sewa, dan pengelolaan data kategori.
          </p>
        </div>
        <div class="col-md-4 text-md-end">
          <router-link to="/admin/review" class="btn btn-light fw-bold px-4 py-2 rounded-pill shadow-sm">
            📋 Buka Antrean Review ({{ reviewQueue.length }})
          </router-link>
        </div>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- 2. METRIK UTAMA PLATFORM                                                -->
    <!-- ======================================================================= -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-secondary small fw-semibold">Butuh Review</span>
            <span class="fs-4">⏳</span>
          </div>
          <div class="display-6 fw-bold text-danger">{{ reviewQueue.length }}</div>
          <small class="text-danger fw-semibold" style="font-size: 0.75rem;">Perlu ditinjau Developer</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-secondary small fw-semibold">Event Tayang Aktif</span>
            <span class="fs-4">🟢</span>
          </div>
          <div class="display-6 fw-bold text-success">8</div>
          <small class="text-muted" style="font-size: 0.75rem;">Sedang tampil di publik</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-secondary small fw-semibold">Sewa Terverifikasi</span>
            <span class="fs-4">💳</span>
          </div>
          <div class="display-6 fw-bold text-primary">Rp450.000</div>
          <small class="text-muted" style="font-size: 0.75rem;">9 transaksi x Rp50.000</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-secondary small fw-semibold">Total Pengguna</span>
            <span class="fs-4">👥</span>
          </div>
          <div class="display-6 fw-bold text-dark">6 Akun</div>
          <small class="text-muted" style="font-size: 0.75rem;">3 Peserta, 2 Panitia, 1 Dev</small>
        </div>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- 3. TABEL ANTREAN REVIEW EVENT TERBARU                                  -->
    <!-- ======================================================================= -->
    <div class="row g-4 mb-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white">
          <div class="card-header bg-white p-4 border-bottom d-flex align-items-center justify-content-between">
            <div>
              <h5 class="fw-bold text-dark mb-0">Antrean Review Event Terbaru</h5>
              <small class="text-secondary">Event yang sudah dibayar sewa dan siap ditinjau kelayakannya</small>
            </div>
            <router-link to="/admin/review" class="btn btn-outline-primary btn-sm rounded-pill px-3">
              Semua Antrean →
            </router-link>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">Event & Penyelenggara</th>
                  <th>Kategori</th>
                  <th>Kapasitas</th>
                  <th>Status Sewa</th>
                  <th class="text-end pe-4">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in reviewQueue" :key="item.id">
                  <td class="ps-4">
                    <div class="fw-semibold text-dark text-truncate" style="max-width: 250px;">
                      {{ item.title }}
                    </div>
                    <small class="text-muted">Diajukan oleh: {{ item.organizer }}</small>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark border">{{ item.category }}</span>
                  </td>
                  <td class="small">{{ item.quota }} Peserta</td>
                  <td>
                    <span class="badge bg-success-subtle text-success border border-success-subtle small">
                      Lunas Rp50.000
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <router-link
                      to="/admin/review"
                      class="btn btn-primary btn-sm rounded-pill px-3 fw-semibold"
                    >
                      Tinjau Acara →
                    </router-link>
                  </td>
                </tr>
                <tr v-if="reviewQueue.length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">
                    Tidak ada antrean review event saat ini.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Kolom Kanan: Verifikasi Pembayaran Masuk Terbaru -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h5 class="fw-bold text-dark mb-0">Sewa Terbaru</h5>
            <router-link to="/admin/payments" class="btn btn-link btn-sm text-decoration-none p-0 text-primary">
              Lihat Semua
            </router-link>
          </div>

          <div class="d-flex flex-column gap-3">
            <div
              v-for="pay in recentPayments"
              :key="pay.id"
              class="p-3 rounded-3 border bg-light"
            >
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="badge bg-success font-monospace small">TERVERIFIKASI</span>
                <span class="fw-bold text-dark font-monospace small">Rp50.000</span>
              </div>
              <div class="fw-semibold small text-dark text-truncate" :title="pay.event_title">
                {{ pay.event_title }}
              </div>
              <div class="d-flex justify-content-between text-muted mt-2" style="font-size: 0.72rem;">
                <span>Ref: {{ pay.ref }}</span>
                <span>{{ pay.date }}</span>
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

const reviewQueue = ref([
  {
    id: 9,
    title: 'Open Recruitment Panitia Dies Natalis 2026',
    organizer: 'Panitia Demo (Himpunan)',
    category: 'Perekrutan',
    quota: 150,
  },
  {
    id: 10,
    title: 'Pelatihan Public Speaking & Pitching Mahasiswa',
    organizer: 'Panitia Himpunan Mahasiswa',
    category: 'Workshop',
    quota: 50,
  },
])

const recentPayments = ref([
  {
    id: 1,
    event_title: 'Open Recruitment Panitia Dies Natalis 2026',
    ref: 'TRX-20261112-009',
    date: '12 Nov 2026',
  },
  {
    id: 2,
    event_title: 'Pelatihan Public Speaking Mahasiswa',
    ref: 'TRX-20261113-010',
    date: '13 Nov 2026',
  },
  {
    id: 3,
    event_title: 'Seminar Nasional AI & Pendidikan',
    ref: 'TRX-20261111-001',
    date: '11 Nov 2026',
  },
])
</script>

<style scoped>
.bg-gradient-developer {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}
</style>
