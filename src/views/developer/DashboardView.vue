<template>
  <div class="eh-dev-dashboard pb-5">
    <!-- 1. TOP HEADER (Figma 2002:1951) -->
    <div class="mb-4">
      <h1 class="fw-bold mb-1" style="font-size: 24px; color: #0f172a;">Dashboard Developer</h1>
      <p class="mb-0" style="font-size: 14px; color: #64748b;">
        Ringkasan operasional moderasi event dan transaksi biaya penayangan platform.
      </p>
    </div>

    <!-- 2. 4 STAT CARDS (Figma 2002:1958) -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="eh-stat-card eh-border-indigo bg-white h-100">
          <div class="eh-stat-label">ANTREAN REVIEW</div>
          <div class="eh-stat-value">6</div>
          <div class="eh-stat-sub">Event menunggu moderasi</div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="eh-stat-card eh-border-purple bg-white h-100">
          <div class="eh-stat-label">EVENT TAYANG</div>
          <div class="eh-stat-value">18</div>
          <div class="eh-stat-sub">Aktif di katalog publik</div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="eh-stat-card eh-border-indigo bg-white h-100">
          <div class="eh-stat-label">TOTAL TRANSAKSI</div>
          <div class="eh-stat-value">24</div>
          <div class="eh-stat-sub">Pembayaran biaya sewa</div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="eh-stat-card eh-border-purple bg-white h-100">
          <div class="eh-stat-label">PENDAPATAN SEWA</div>
          <div class="eh-stat-value" style="font-size: 24px;">Rp 1.200.000</div>
          <div class="eh-stat-sub">Flat listing fee Rp 50.000</div>
        </div>
      </div>
    </div>

    <!-- 3. ANTREAN TERBARU TABLE SECTION (Figma 2002:2000) -->
    <div class="eh-table-card bg-white overflow-hidden">
      <div class="d-flex align-items-center justify-content-between px-4 py-3 flex-wrap gap-2" style="border-bottom: 1px solid #e2e8f0;">
        <div>
          <h2 class="fw-bold mb-0" style="font-size: 16px; color: #0f172a;">Antrean Terbaru</h2>
          <div style="font-size: 12px; color: #64748b;">
            Event yang telah membayar listing fee dan menunggu verifikasi
          </div>
        </div>
        <router-link
          to="/admin/review"
          class="fw-medium text-decoration-none d-inline-flex align-items-center gap-1"
          style="font-size: 14px; color: #4f46e5;"
        >
          <span>Lihat Semua Antrean</span>
          <span>→</span>
        </router-link>
      </div>

      <div class="table-responsive">
        <table class="table mb-0 align-middle eh-table">
          <thead>
            <tr>
              <th class="ps-4">JUDUL EVENT</th>
              <th>PANITIA</th>
              <th>KATEGORI</th>
              <th>WAKTU BAYAR</th>
              <th>STATUS</th>
              <th class="text-end pe-4">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in recentQueue" :key="item.id">
              <td class="ps-4 fw-normal" style="font-size: 14px; color: #0f172a;">
                {{ item.title }}
              </td>
              <td style="font-size: 14px; color: #64748b;">
                {{ item.organizer }}
              </td>
              <td>
                <span class="eh-category-chip">{{ item.category }}</span>
              </td>
              <td style="font-size: 12px; color: #64748b;">
                {{ item.paid_at }}
              </td>
              <td>
                <span class="eh-badge eh-badge-blue">Menunggu Review</span>
              </td>
              <td class="text-end pe-4">
                <router-link
                  :to="`/admin/review/${item.id}`"
                  class="btn eh-btn-indigo btn-sm px-3 py-1 fw-bold"
                  style="font-size: 12px;"
                >
                  Tinjau
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 4 baris antrean terbaru sesuai Figma 2002:2027 (17 - Dashboard Developer)
const recentQueue = ref([
  {
    id: 1,
    title: 'Seminar Nasional AI & Karir Digital',
    organizer: 'BEM Fasilkom UI',
    category: 'Seminar',
    paid_at: '14 Okt 2026, 10:15',
  },
  {
    id: 2,
    title: 'Workshop UI/UX Design System 2026',
    organizer: 'HIMASISVO Unair',
    category: 'Workshop',
    paid_at: '14 Okt 2026, 09:40',
  },
  {
    id: 3,
    title: 'Lomba Inovasi Startup Mahasiswa',
    organizer: 'UKM Startup Hub ITB',
    category: 'Lomba',
    paid_at: '14 Okt 2026, 08:22',
  },
  {
    id: 4,
    title: 'Open Recruitment Panitia Dies Natalis 40',
    organizer: 'Panitia Dies Natalis',
    category: 'Kepanitiaan',
    paid_at: '13 Okt 2026, 21:05',
  },
])
</script>

<style scoped>
.eh-stat-card {
  border: 1px solid #c7d2fe;
  border-radius: 4px;
  padding: 18px 20px;
}

.eh-border-indigo {
  border-left: 4px solid #4f46e5;
}

.eh-border-purple {
  border-left: 4px solid #7c3aed;
}

.eh-stat-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.eh-stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  line-height: 36px;
  margin-bottom: 4px;
}

.eh-stat-sub {
  font-size: 12px;
  color: #64748b;
}

.eh-table-card {
  border: 1px solid #c7d2fe;
  border-radius: 4px;
}

.eh-table thead tr {
  background-color: #e0e7ff;
  border-bottom: 1px solid #c7d2fe;
}

.eh-table thead th {
  background-color: #e0e7ff;
  color: #3730a3;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  padding: 14px 20px;
  border-bottom: 1px solid #c7d2fe;
}

.eh-table tbody td {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.eh-table tbody tr:last-child td {
  border-bottom: none;
}

.eh-category-chip {
  display: inline-block;
  background-color: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #0f172a;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 4px;
}

.eh-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
}

.eh-badge-blue {
  background-color: #3b82f6;
  color: #ffffff;
}

.eh-btn-indigo {
  background-color: #4f46e5;
  border-color: #4f46e5;
  color: #ffffff;
  border-radius: 4px;
}

.eh-btn-indigo:hover {
  background-color: #4338ca;
  border-color: #4338ca;
  color: #ffffff;
}
</style>
