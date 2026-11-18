<template>
  <div class="eh-panitia-events pb-5">
    <!-- 1. TOP HEADER (Figma 2002:997) -->
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
      <div>
        <h1 class="fw-bold mb-1" style="font-size: 24px; color: #0f172a;">Kelola Event</h1>
        <p class="mb-0" style="font-size: 14px; color: #64748b;">
          Pantau status, pembayaran biaya tayang, dan pendaftar untuk seluruh event Anda.
        </p>
      </div>
      <router-link
        to="/organizer/events/create"
        class="btn eh-btn-indigo px-3 py-2 fw-semibold"
      >
        Buat Event Baru
      </router-link>
    </div>

    <!-- 2. FILTER & SEARCH BAR (Figma 2002:1004) -->
    <div class="eh-filter-card bg-white p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div class="flex-grow-1" style="max-width: 340px;">
        <input
          v-model="filters.search"
          type="text"
          class="form-control eh-search-input"
          placeholder="Cari judul event..."
        />
      </div>

      <div class="d-flex align-items-center gap-2 flex-wrap">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          class="btn btn-sm eh-filter-pill"
          :class="{ active: filters.status === tab.value }"
          @click="filters.status = tab.value; currentPage = 1"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 3. EVENTS TABLE CARD (Figma 2002:1032) -->
    <div class="eh-table-card bg-white overflow-hidden mb-3">
      <div class="table-responsive">
        <table class="table mb-0 align-middle eh-table">
          <thead>
            <tr>
              <th class="ps-4">JUDUL EVENT</th>
              <th>KATEGORI</th>
              <th>JADWAL</th>
              <th>KUOTA TERISI</th>
              <th>STATUS</th>
              <th class="text-end pe-4">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="evt in filteredEvents" :key="evt.id">
              <!-- JUDUL EVENT + SUBTITLE COUNTDOWN FOR DRAFT -->
              <td class="ps-4">
                <div class="fw-medium" style="font-size: 14px; color: #0f172a;">
                  {{ evt.title }}
                </div>
                <div
                  v-if="evt.status === 'draft'"
                  class="font-monospace mt-1"
                  style="font-size: 12px; color: #b45309;"
                >
                  Sisa waktu bayar: {{ evt.countdown || '05:12:30' }}
                </div>
              </td>

              <!-- KATEGORI -->
              <td style="font-size: 14px; color: #64748b;">
                {{ evt.category }}
              </td>

              <!-- JADWAL -->
              <td style="font-size: 14px; color: #0f172a;">
                {{ evt.date_label }}
              </td>

              <!-- KUOTA TERISI -->
              <td class="font-monospace" style="font-size: 14px; color: #0f172a;">
                {{ evt.filled }} / {{ evt.quota }}
              </td>

              <!-- STATUS -->
              <td>
                <span v-if="evt.status === 'draft'" class="eh-badge eh-badge-yellow">
                  Draft
                </span>
                <span v-else-if="evt.status === 'menunggu_review'" class="eh-badge eh-badge-blue">
                  Menunggu Review
                </span>
                <span v-else-if="evt.status === 'tayang'" class="eh-badge eh-badge-green">
                  Tayang
                </span>
                <span v-else-if="evt.status === 'ditolak'" class="eh-badge eh-badge-red">
                  Ditolak
                </span>
                <span v-else-if="evt.status === 'kuota_habis'" class="eh-badge eh-badge-darkgray">
                  KUOTA HABIS
                </span>
                <span v-else-if="evt.status === 'selesai'" class="eh-badge eh-badge-gray">
                  Selesai
                </span>
              </td>

              <!-- AKSI -->
              <td class="text-end pe-4">
                <!-- 1. Draft: Edit + Bayar -->
                <div v-if="evt.status === 'draft'" class="d-inline-flex align-items-center gap-3">
                  <router-link
                    :to="`/organizer/events/${evt.id}/edit`"
                    class="fw-semibold text-decoration-none"
                    style="font-size: 12px; color: #4f46e5;"
                  >
                    Edit
                  </router-link>
                  <router-link
                    :to="`/organizer/events/${evt.id}/payment`"
                    class="btn eh-btn-indigo btn-sm px-2 py-1"
                    style="font-size: 12px;"
                  >
                    Bayar
                  </router-link>
                </div>

                <!-- 2. Menunggu Review: Lihat -->
                <router-link
                  v-else-if="evt.status === 'menunggu_review'"
                  :to="`/events/${evt.id}`"
                  class="fw-semibold text-decoration-none"
                  style="font-size: 12px; color: #4f46e5;"
                >
                  Lihat
                </router-link>

                <!-- 3. Tayang: Pendaftar + Ekspor -->
                <div v-else-if="evt.status === 'tayang'" class="d-inline-flex align-items-center gap-3">
                  <router-link
                    :to="`/organizer/events/${evt.id}/registrations`"
                    class="fw-semibold text-decoration-none"
                    style="font-size: 12px; color: #4f46e5;"
                  >
                    Pendaftar
                  </router-link>
                  <router-link
                    :to="`/organizer/events/${evt.id}/report`"
                    class="fw-medium text-decoration-none"
                    style="font-size: 12px; color: #64748b;"
                  >
                    Ekspor
                  </router-link>
                </div>

                <!-- 4. Ditolak: Lihat Catatan -->
                <button
                  v-else-if="evt.status === 'ditolak'"
                  type="button"
                  class="btn btn-link p-0 fw-semibold text-decoration-none"
                  style="font-size: 12px; color: #d64545;"
                  @click="selectedRejectedEvent = evt"
                >
                  Lihat Catatan
                </button>

                <!-- 5. Kuota Habis / Selesai: Pendaftar -->
                <router-link
                  v-else
                  :to="`/organizer/events/${evt.id}/registrations`"
                  class="fw-semibold text-decoration-none"
                  style="font-size: 12px; color: #4f46e5;"
                >
                  Pendaftar
                </router-link>
              </td>
            </tr>
            <tr v-if="filteredEvents.length === 0">
              <td colspan="6" class="text-center py-4" style="font-size: 14px; color: #64748b;">
                Tidak ada event yang sesuai dengan filter pencarian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 4. PAGINATION FOOTER (Figma 2002:1141) -->
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
      <div style="font-size: 12px; color: #64748b;">
        Menampilkan 1-{{ filteredEvents.length }} dari {{ filteredEvents.length }} event
      </div>
      <div class="d-flex align-items-center gap-1">
        <button type="button" class="btn eh-page-btn" disabled>Sebelumnya</button>
        <button type="button" class="btn eh-page-num active">1</button>
        <button type="button" class="btn eh-page-btn" disabled>Selanjutnya</button>
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
import { ref, reactive, computed } from 'vue'

const filters = reactive({
  search: '',
  status: 'all',
})

const currentPage = ref(1)
const selectedRejectedEvent = ref(null)

const statusTabs = [
  { label: 'Semua', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Menunggu Review', value: 'menunggu_review' },
  { label: 'Tayang', value: 'tayang' },
  { label: 'Ditolak', value: 'ditolak' },
  { label: 'Selesai', value: 'selesai' },
]

// 6 Baris sesuai Figma 2002:969 (10 - Kelola Event)
const myEvents = ref([
  {
    id: 3,
    title: 'Pelatihan Pemrograman Web Modern',
    category: 'Workshop',
    date_label: '10 Mei 2026',
    filled: 0,
    quota: 40,
    status: 'draft',
    countdown: '05:12:30',
  },
  {
    id: 2,
    title: 'Workshop UI/UX dengan Figma',
    category: 'Workshop',
    date_label: '25 April 2026',
    filled: 0,
    quota: 60,
    status: 'menunggu_review',
  },
  {
    id: 1,
    title: 'Seminar Nasional AI untuk Pendidikan',
    category: 'Seminar',
    date_label: '18 April 2026',
    filled: 24,
    quota: 100,
    status: 'tayang',
  },
  {
    id: 5,
    title: 'Turnamen Game Kampus Tanpa Izin Dekanat',
    category: 'Kompetisi',
    date_label: '01 April 2026',
    filled: 0,
    quota: 32,
    status: 'ditolak',
    reject_reason: 'Belum melampirkan surat izin kegiatan resmi dari Kemahasiswaan / Dekanat.',
  },
  {
    id: 4,
    title: 'Lomba Desain Poster Dies Natalis',
    category: 'Lomba',
    date_label: '02 Mei 2026',
    filled: 50,
    quota: 50,
    status: 'kuota_habis',
  },
  {
    id: 6,
    title: 'Webinar Pengenalan Cloud Computing',
    category: 'Seminar',
    date_label: '15 Februari 2026',
    filled: 150,
    quota: 150,
    status: 'selesai',
  },
])

const filteredEvents = computed(() => {
  return myEvents.value.filter((item) => {
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      if (!item.title.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) {
        return false
      }
    }
    if (filters.status !== 'all') {
      if (item.status !== filters.status) return false
    }
    return true
  })
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

.eh-filter-card {
  border: 1px solid #c7d2fe;
  border-radius: 4px;
}

.eh-search-input {
  border: 1px solid #c7d2fe;
  border-radius: 4px;
  font-size: 14px;
  color: #0f172a;
  padding: 7px 12px;
}

.eh-search-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
}

.eh-filter-pill {
  background-color: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #3730a3;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  padding: 6px 12px;
}

.eh-filter-pill.active {
  background-color: #4f46e5;
  border-color: #4f46e5;
  color: #ffffff;
  font-weight: 600;
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
  padding: 16px;
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

.eh-badge-gray {
  background-color: #9e9e9e;
  color: #ffffff;
}

.eh-page-btn {
  background-color: #e2e8f0;
  border: 1px solid #c7d2fe;
  color: #94a3b8;
  font-size: 12px;
  border-radius: 4px;
  padding: 6px 12px;
}

.eh-page-num {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.eh-page-num.active {
  background-color: #4f46e5;
  color: #ffffff;
  border: none;
}
</style>
