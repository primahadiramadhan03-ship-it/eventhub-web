<template>
  <div class="eh-panitia-dashboard pb-5">
    <!-- 1. TOP HEADER (Figma 2002:851) -->
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
      <div>
        <h1 class="fw-bold mb-1" style="font-size: 24px; color: #0f172a;">Dashboard Panitia</h1>
        <p class="mb-0" style="font-size: 14px; color: #64748b;">
          Ringkasan operasional penyelenggaraan event dan pantauan status pengajuan.
        </p>
      </div>
      <router-link
        to="/organizer/events/create"
        class="btn eh-btn-indigo px-3 py-2 fw-semibold"
      >
        Buat Event Baru
      </router-link>
    </div>

    <!-- 2. DRAFT EXPIRATION NOTICE BANNER (Figma 2002:858) -->
    <div
      v-if="activeDraftEvent"
      class="eh-draft-banner bg-white d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4"
    >
      <div class="d-flex align-items-start gap-3">
        <span class="eh-yellow-dot mt-1 flex-shrink-0"></span>
        <div>
          <div class="fw-semibold" style="font-size: 14px; color: #0f172a;">
            1 draft akan kedaluwarsa dalam <span class="font-monospace">{{ countdownDisplay }}</span>
          </div>
          <div style="font-size: 12px; color: #64748b;">
            Segera selesaikan pembayaran biaya sewa (Rp 50.000) agar draft event Anda masuk ke antrean review.
          </div>
        </div>
      </div>
      <router-link
        :to="`/organizer/events/${activeDraftEvent.id}/payment`"
        class="btn eh-btn-indigo btn-sm px-3 py-2 fw-medium"
      >
        Bayar Sekarang
      </router-link>
    </div>

    <!-- 3. 4 STAT CARDS (Figma 2002:868) -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="eh-stat-card eh-border-indigo bg-white h-100">
          <div class="eh-stat-label">TOTAL EVENT</div>
          <div class="eh-stat-value">5</div>
          <div class="eh-stat-sub">Semua status event Anda</div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="eh-stat-card eh-border-purple bg-white h-100">
          <div class="eh-stat-label">EVENT AKTIF</div>
          <div class="eh-stat-value">2</div>
          <div class="eh-stat-sub">Sedang tayang di katalog</div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="eh-stat-card eh-border-indigo bg-white h-100">
          <div class="eh-stat-label">MENUNGGU REVIEW</div>
          <div class="eh-stat-value">1</div>
          <div class="eh-stat-sub">Proses verifikasi moderator</div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="eh-stat-card eh-border-purple bg-white h-100">
          <div class="eh-stat-label">TOTAL PENDAFTAR</div>
          <div class="eh-stat-value">74</div>
          <div class="eh-stat-sub">Peserta terdaftar aktif</div>
        </div>
      </div>
    </div>

    <!-- 4. RECENT EVENTS TABLE CARD (Figma 2002:889) -->
    <div class="eh-table-card bg-white overflow-hidden">
      <div class="d-flex align-items-center justify-content-between px-4 py-3" style="border-bottom: 1px solid #e2e8f0;">
        <h2 class="fw-bold mb-0" style="font-size: 16px; color: #0f172a;">Event Terbaru</h2>
        <router-link
          to="/organizer/events"
          class="fw-semibold text-decoration-none"
          style="font-size: 14px; color: #4f46e5;"
        >
          Lihat Semua Event
        </router-link>
      </div>

      <div class="table-responsive">
        <table class="table mb-0 align-middle eh-table">
          <thead>
            <tr>
              <th class="ps-4">JUDUL EVENT</th>
              <th>JADWAL</th>
              <th>STATUS</th>
              <th>KUOTA TERISI</th>
              <th class="text-end pe-4">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="evt in recentEvents" :key="evt.id">
              <td class="ps-4 fw-medium" style="font-size: 14px; color: #0f172a;">
                {{ evt.title }}
              </td>
              <td style="font-size: 14px; color: #0f172a;">
                {{ evt.date_label }}
              </td>
              <td>
                <span
                  v-if="evt.status === 'tayang'"
                  class="eh-badge eh-badge-green"
                >
                  Tayang
                </span>
                <span
                  v-else-if="evt.status === 'menunggu_review'"
                  class="eh-badge eh-badge-blue"
                >
                  Menunggu Review
                </span>
                <span
                  v-else-if="evt.status === 'draft'"
                  class="eh-badge eh-badge-yellow"
                >
                  Draft
                </span>
                <span
                  v-else-if="evt.status === 'kuota_habis'"
                  class="eh-badge eh-badge-darkgray"
                >
                  KUOTA HABIS
                </span>
                <span
                  v-else-if="evt.status === 'ditolak'"
                  class="eh-badge eh-badge-red"
                >
                  Ditolak
                </span>
              </td>
              <td class="font-monospace" style="font-size: 14px; color: #0f172a;">
                {{ evt.filled }} / {{ evt.quota }}
              </td>
              <td class="text-end pe-4">
                <router-link
                  v-if="evt.status === 'tayang'"
                  :to="`/organizer/events/${evt.id}/registrations`"
                  class="fw-semibold text-decoration-none"
                  style="font-size: 12px; color: #4f46e5;"
                >
                  Kelola
                </router-link>
                <span
                  v-else-if="evt.status === 'menunggu_review'"
                  style="font-size: 12px; color: #64748b;"
                >
                  Menunggu Moderator
                </span>
                <router-link
                  v-else-if="evt.status === 'draft'"
                  :to="`/organizer/events/${evt.id}/payment`"
                  class="fw-semibold text-decoration-none"
                  style="font-size: 12px; color: #4f46e5;"
                >
                  Bayar Fee
                </router-link>
                <router-link
                  v-else-if="evt.status === 'kuota_habis'"
                  :to="`/organizer/events/${evt.id}/registrations`"
                  class="fw-semibold text-decoration-none"
                  style="font-size: 12px; color: #4f46e5;"
                >
                  Pendaftar
                </router-link>
                <button
                  v-else-if="evt.status === 'ditolak'"
                  type="button"
                  class="btn btn-link p-0 fw-semibold text-decoration-none"
                  style="font-size: 12px; color: #d64545;"
                  @click="selectedRejectedEvent = evt"
                >
                  Lihat Catatan
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL CATATAN PENOLAKAN -->
    <div
      v-if="selectedRejectedEvent"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(15, 23, 42, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border: 1px solid #c7d2fe; border-radius: 8px;">
          <div class="modal-header" style="border-bottom: 1px solid #e2e8f0;">
            <h5 class="modal-title fw-bold" style="font-size: 16px; color: #0f172a;">
              Catatan Penolakan Moderator
            </h5>
            <button type="button" class="btn-close" @click="selectedRejectedEvent = null"></button>
          </div>
          <div class="modal-body p-4">
            <div class="fw-semibold mb-1" style="font-size: 14px; color: #0f172a;">
              {{ selectedRejectedEvent.title }}
            </div>
            <div class="p-3 mt-2 rounded" style="background-color: #fef2f2; border: 1px solid #d64545; color: #991b1b; font-size: 13px;">
              {{ selectedRejectedEvent.reject_reason }}
            </div>
          </div>
          <div class="modal-footer" style="border-top: 1px solid #e2e8f0;">
            <button
              type="button"
              class="btn btn-sm px-3 py-1"
              style="background-color: #e2e8f0; color: #0f172a; border-radius: 4px;"
              @click="selectedRejectedEvent = null"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const countdownDisplay = ref('05:12:30')
const selectedRejectedEvent = ref(null)

// Data sesuai Figma 2002:908 (09 - Dashboard Panitia)
const recentEvents = ref([
  {
    id: 1,
    title: 'Seminar Nasional AI untuk Pendidikan',
    date_label: '18 April 2026',
    status: 'tayang',
    filled: 24,
    quota: 100,
  },
  {
    id: 2,
    title: 'Workshop UI/UX dengan Figma',
    date_label: '25 April 2026',
    status: 'menunggu_review',
    filled: 0,
    quota: 60,
  },
  {
    id: 3,
    title: 'Pelatihan Pemrograman Web Modern',
    date_label: '10 Mei 2026',
    status: 'draft',
    filled: 0,
    quota: 40,
  },
  {
    id: 4,
    title: 'Lomba Desain Poster Dies Natalis',
    date_label: '02 Mei 2026',
    status: 'kuota_habis',
    filled: 50,
    quota: 50,
  },
  {
    id: 5,
    title: 'Turnamen Game Kampus Tanpa Izin Dekanat',
    date_label: '01 April 2026',
    status: 'ditolak',
    filled: 0,
    quota: 32,
    reject_reason: 'Belum melampirkan surat izin kegiatan resmi dari Kemahasiswaan / Dekanat.',
  },
])

const activeDraftEvent = computed(() => {
  return recentEvents.value.find((e) => e.status === 'draft')
})
</script>

<style scoped>
.eh-btn-indigo {
  background-color: #4f46e5;
  border-color: #4f46e5;
  color: #ffffff;
  border-radius: 4px;
  font-size: 14px;
}

.eh-btn-indigo:hover {
  background-color: #4338ca;
  border-color: #4338ca;
  color: #ffffff;
}

.eh-draft-banner {
  border: 2px solid #f5c542;
  border-radius: 4px;
  padding: 16px 18px;
}

.eh-yellow-dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background-color: #f5c542;
}

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
  border-bottom: 1px solid #e2e8f0;
}

.eh-table thead th {
  background-color: #e0e7ff;
  color: #3730a3;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.eh-table tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.eh-table tbody tr:last-child td {
  border-bottom: none;
}

.eh-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}

.eh-badge-green {
  background-color: #22a55b;
  color: #ffffff;
}

.eh-badge-blue {
  background-color: #3b82f6;
  color: #ffffff;
}

.eh-badge-yellow {
  background-color: #f5c542;
  color: #0f172a;
}

.eh-badge-darkgray {
  background-color: #4b4b4b;
  color: #ffffff;
}

.eh-badge-red {
  background-color: #d64545;
  color: #ffffff;
}
</style>
