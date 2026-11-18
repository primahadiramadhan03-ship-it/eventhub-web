<template>
  <div class="eh-review-queue pb-5">
    <!-- 1. TOP HEADER (Figma 2002:2139) -->
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
      <div>
        <h1 class="fw-bold mb-1" style="font-size: 24px; color: #0f172a;">Antrean Moderasi Event</h1>
        <p class="mb-0" style="font-size: 14px; color: #64748b;">
          Daftar pengajuan event yang telah menyelesaikan pembayaran biaya sewa dan menunggu keputusan penayangan.
        </p>
      </div>
      <div class="eh-queue-count-badge">
        {{ filteredQueue.length }} Menunggu Review
      </div>
    </div>

    <!-- 2. FILTER & SEARCH BAR (Figma 2002:2150) -->
    <div class="eh-filter-card bg-white p-3 mb-4">
      <div class="row g-3 align-items-center">
        <div class="col-12 col-md-6">
          <input
            v-model="filters.search"
            type="text"
            class="form-control eh-input"
            placeholder="Cari judul event atau nama panitia..."
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <select v-model="filters.category" class="form-select eh-input">
            <option value="all">Semua Kategori</option>
            <option value="Seminar">Seminar</option>
            <option value="Workshop">Workshop</option>
            <option value="Lomba">Lomba</option>
            <option value="Kepanitiaan">Kepanitiaan</option>
            <option value="Komunitas">Komunitas</option>
          </select>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <select v-model="filters.sort" class="form-select eh-input">
            <option value="fifo">Urutkan: Terlama menunggu (FIFO)</option>
            <option value="lifo">Urutkan: Terbaru dibayar</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 3. MODERATION QUEUE TABLE (Figma 2002:2166) -->
    <div class="eh-table-card bg-white overflow-hidden mb-3">
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
            <tr v-for="item in filteredQueue" :key="item.id">
              <td class="ps-4" style="font-size: 14px; color: #0f172a;">
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
            <tr v-if="filteredQueue.length === 0">
              <td colspan="6" class="text-center py-4" style="font-size: 14px; color: #64748b;">
                Tidak ada antrean event yang sesuai dengan pencarian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 4. PAGINATION FOOTER (Figma 2002:2276) -->
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
      <div style="font-size: 12px; color: #64748b;">
        Menampilkan 1-{{ filteredQueue.length }} dari {{ filteredQueue.length }} event
      </div>
      <div class="d-flex align-items-center gap-1">
        <button type="button" class="btn eh-page-btn" disabled>Sebelumnya</button>
        <button type="button" class="btn eh-page-num active">1</button>
        <button type="button" class="btn eh-page-btn" disabled>Selanjutnya</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const filters = reactive({
  search: '',
  category: 'all',
  sort: 'fifo',
})

// 6 Baris sesuai Figma 2002:2092 (18 - Antrean Moderasi)
const queueList = ref([
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
  {
    id: 5,
    title: 'Webinar Cybersecurity Awareness 2026',
    organizer: 'HMF Ilmu Komputer UGM',
    category: 'Seminar',
    paid_at: '13 Okt 2026, 18:30',
  },
  {
    id: 6,
    title: 'Meetup Komunitas Python Bandung #12',
    organizer: 'Bandung Python Dev',
    category: 'Komunitas',
    paid_at: '13 Okt 2026, 16:10',
  },
])

const filteredQueue = computed(() => {
  const list = queueList.value.filter((item) => {
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      if (
        !item.title.toLowerCase().includes(q) &&
        !item.organizer.toLowerCase().includes(q)
      ) {
        return false
      }
    }
    if (filters.category !== 'all') {
      if (item.category !== filters.category) return false
    }
    return true
  })

  if (filters.sort === 'lifo') {
    return [...list].reverse()
  }
  return list
})
</script>

<style scoped>
.eh-queue-count-badge {
  background-color: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 4px;
}

.eh-filter-card {
  border: 1px solid #c7d2fe;
  border-radius: 4px;
}

.eh-input {
  border: 1px solid #c7d2fe;
  border-radius: 4px;
  font-size: 14px;
  color: #0f172a;
  padding: 8px 12px;
}

.eh-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
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

.eh-page-btn {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
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
  font-weight: 700;
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
