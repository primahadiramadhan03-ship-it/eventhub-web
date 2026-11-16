<template>
  <div class="panitia-events-page pb-5">
    <!-- Header Halaman & Aksi Tambah -->
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div>
        <h2 class="h4 fw-bold text-dark mb-1">Kelola Event Saya</h2>
        <p class="text-secondary small mb-0">
          Pantau status penayangan, batas waktu pembayaran sewa, dan kelola pendaftar acara Anda.
        </p>
      </div>
      <router-link to="/organizer/events/create" class="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm">
        ➕ Buat Event Baru
      </router-link>
    </div>

    <!-- Filter & Search Bar -->
    <div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4 bg-white">
      <div class="row g-3 align-items-center">
        <!-- Search Input -->
        <div class="col-12 col-md-5">
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0 text-muted">🔍</span>
            <input
              v-model="filters.search"
              type="text"
              class="form-control bg-light border-start-0"
              placeholder="Cari judul event atau lokasi..."
            />
          </div>
        </div>

        <!-- Filter Status Event -->
        <div class="col-12 col-sm-6 col-md-4">
          <select v-model="filters.status" class="form-select bg-light">
            <option value="all">Semua Status Event</option>
            <option value="draft">Draft (Menunggu Bayar)</option>
            <option value="menunggu_review">Menunggu Review</option>
            <option value="tayang">Tayang (Aktif)</option>
            <option value="ditolak">Ditolak</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>

        <!-- Filter Kategori -->
        <div class="col-12 col-sm-6 col-md-3">
          <select v-model="filters.category" class="form-select bg-light">
            <option value="all">Semua Kategori</option>
            <option value="Seminar">Seminar</option>
            <option value="Workshop">Workshop</option>
            <option value="Lomba">Lomba</option>
            <option value="Perekrutan">Perekrutan</option>
            <option value="Komunitas">Komunitas</option>
          </select>
        </div>
      </div>

      <!-- Filter Active Tags -->
      <div v-if="filters.search || filters.status !== 'all' || filters.category !== 'all'" class="d-flex align-items-center gap-2 mt-3 pt-3 border-top flex-wrap">
        <span class="small text-secondary">Filter aktif:</span>
        <span v-if="filters.search" class="badge bg-light text-dark border">
          Pencarian: "{{ filters.search }}"
        </span>
        <span v-if="filters.status !== 'all'" class="badge bg-light text-dark border">
          Status: {{ filters.status }}
        </span>
        <span v-if="filters.category !== 'all'" class="badge bg-light text-dark border">
          Kategori: {{ filters.category }}
        </span>
        <button class="btn btn-link btn-sm text-danger text-decoration-none p-0 ms-auto" @click="resetFilters">
          ✕ Reset Filter
        </button>
      </div>
    </div>

    <!-- 1. EMPTY STATE -->
    <div v-if="filteredEvents.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-3">
      <div class="display-3 mb-3">📅</div>
      <h4 class="fw-bold mb-2">Tidak Ada Event Ditemukan</h4>
      <p class="text-secondary mb-4">
        {{ filters.search || filters.status !== 'all' ? 'Tidak ada event yang sesuai dengan kriteria filter Anda.' : 'Anda belum membuat event apapun. Mulai buat acara kampus Anda sekarang!' }}
      </p>
      <div>
        <button v-if="filters.search || filters.status !== 'all'" class="btn btn-outline-secondary px-4 rounded-pill me-2" @click="resetFilters">
          Bersihkan Filter
        </button>
        <router-link to="/organizer/events/create" class="btn btn-primary px-4 rounded-pill">
          ➕ Buat Event Baru
        </router-link>
      </div>
    </div>

    <!-- 2. TABEL INTERAKTIF EVENT SAYA -->
    <div v-else class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4" style="min-width: 260px;">Event</th>
              <th>Kategori</th>
              <th>Jadwal Pelaksanaan</th>
              <th>Keterisian Kuota</th>
              <th>Status Event</th>
              <th>Batas Waktu Bayar</th>
              <th class="text-end pe-4" style="min-width: 160px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="evt in paginatedEvents" :key="evt.id">
              <!-- Event & Lokasi -->
              <td class="ps-4">
                <div class="fw-bold text-dark text-truncate" style="max-width: 250px;" :title="evt.title">
                  {{ evt.title }}
                </div>
                <small class="text-muted d-block text-truncate" style="max-width: 250px;">
                  📍 {{ evt.location }}
                </small>
              </td>

              <!-- Kategori -->
              <td>
                <span class="badge bg-light text-dark border">{{ evt.category?.name || 'Umum' }}</span>
              </td>

              <!-- Jadwal -->
              <td class="small text-secondary">
                {{ formatDateTime(evt.start_time) }}
              </td>

              <!-- Keterisian Kuota -->
              <td>
                <div class="small fw-semibold mb-1">
                  {{ evt.quota - evt.remaining_quota }} / {{ evt.quota }} Kursi
                </div>
                <div class="progress" style="height: 6px; width: 80px;">
                  <div
                    class="progress-bar"
                    :class="evt.remaining_quota <= 0 ? 'bg-secondary' : 'bg-primary'"
                    :style="{ width: `${Math.round(((evt.quota - evt.remaining_quota) / evt.quota) * 100)}%` }"
                  ></div>
                </div>
              </td>

              <!-- Status Event (BadgeStatus) -->
              <td>
                <BadgeStatus :status="evt.status" />
              </td>

              <!-- Batas Waktu Bayar 24 Jam (CountdownTimer) -->
              <td>
                <CountdownTimer
                  v-if="evt.status === 'draft' && evt.payment_deadline"
                  :deadline="evt.payment_deadline"
                />
                <span v-else class="text-muted small">-</span>
              </td>

              <!-- Aksi Lengkap Sesuai Status -->
              <td class="text-end pe-4">
                <div class="d-flex justify-content-end gap-1">
                  <!-- Aksi Jika DRAFT: Bayar Sewa & Edit -->
                  <template v-if="evt.status === 'draft'">
                    <router-link
                      :to="`/organizer/events/${evt.id}/payment`"
                      class="btn btn-warning btn-sm rounded-pill px-3 fw-bold shadow-sm"
                      title="Bayar Sewa Penayangan"
                    >
                      💳 Bayar
                    </router-link>
                    <router-link
                      :to="`/organizer/events/${evt.id}/edit`"
                      class="btn btn-outline-secondary btn-sm rounded-circle p-1"
                      style="width: 32px; height: 32px;"
                      title="Edit Data Event"
                    >
                      ✏️
                    </router-link>
                  </template>

                  <!-- Aksi Jika TAYANG: Pendaftar & Laporan -->
                  <template v-else-if="evt.status === 'tayang'">
                    <router-link
                      :to="`/organizer/events/${evt.id}/registrations`"
                      class="btn btn-outline-primary btn-sm rounded-pill px-2"
                      title="Lihat Daftar Peserta"
                    >
                      👥 Peserta
                    </router-link>
                    <router-link
                      :to="`/organizer/events/${evt.id}/report`"
                      class="btn btn-outline-secondary btn-sm rounded-pill px-2"
                      title="Laporan & Unduh Excel"
                    >
                      📊 Laporan
                    </router-link>
                  </template>

                  <!-- Aksi Jika DITOLAK: Modal Alasan Penolakan -->
                  <template v-else-if="evt.status === 'ditolak'">
                    <button
                      class="btn btn-outline-danger btn-sm rounded-pill px-2"
                      @click="showRejectModal(evt)"
                    >
                      ⚠️ Alasan Ditolak
                    </button>
                  </template>

                  <!-- Status Menunggu Review -->
                  <template v-else-if="evt.status === 'menunggu_review'">
                    <span class="badge bg-light text-muted border py-2 px-3 small">
                      ⏳ Ditinjau Developer
                    </span>
                  </template>

                  <!-- Selesai -->
                  <template v-else>
                    <router-link
                      :to="`/organizer/events/${evt.id}/report`"
                      class="btn btn-outline-secondary btn-sm rounded-pill px-2"
                    >
                      📊 Rekap
                    </router-link>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="totalPages > 1" class="card-footer bg-white p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
        <small class="text-secondary">
          Menampilkan {{ ((currentPage - 1) * perPage) + 1 }} - {{ Math.min(currentPage * perPage, filteredEvents.length) }} dari {{ filteredEvents.length }} event
        </small>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="currentPage--">‹</button>
          </li>
          <li
            v-for="p in totalPages"
            :key="p"
            class="page-item"
            :class="{ active: currentPage === p }"
          >
            <button class="page-link" @click="currentPage = p">{{ p }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="currentPage++">›</button>
          </li>
        </ul>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- MODAL ALASAN PENOLAKAN DEVELOPER (Bab 9.2, K-15, BR-13)                 -->
    <!-- ======================================================================= -->
    <div
      v-if="selectedRejectedEvent"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title fw-bold">⚠️ Alasan Penolakan Event</h5>
            <button type="button" class="btn-close btn-close-white" @click="selectedRejectedEvent = null"></button>
          </div>
          <div class="modal-body p-4">
            <h6 class="fw-bold text-dark mb-1">{{ selectedRejectedEvent.title }}</h6>
            <small class="text-secondary d-block mb-3">Kategori: {{ selectedRejectedEvent.category?.name }}</small>

            <div class="alert alert-danger border-0 rounded-3 p-3">
              <strong class="d-block mb-1">Catatan Penolakan dari Developer:</strong>
              <p class="mb-0 small">
                {{ selectedRejectedEvent.reject_reason || 'Deskripsi acara tidak memenuhi standar perizinan kegiatan kampus atau melanggar ketentuan penayangan.' }}
              </p>
            </div>

            <div class="alert alert-info border-0 rounded-3 small mb-0">
              ℹ️ Sesuai aturan bisnis K-15: Anda dapat memperbaiki deskripsi acara pada menu Edit atau mengajukan kembali event baru.
            </div>
          </div>
          <div class="modal-footer bg-light border-0">
            <button type="button" class="btn btn-secondary rounded-pill px-4" @click="selectedRejectedEvent = null">
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
import BadgeStatus from '../../components/common/BadgeStatus.vue'
import CountdownTimer from '../../components/common/CountdownTimer.vue'

const filters = reactive({
  search: '',
  status: 'all',
  category: 'all',
})

const currentPage = ref(1)
const perPage = 5
const selectedRejectedEvent = ref(null)

// Dataset Mock Lengkap Event Panitia sesuai Bab 7.5 Dokumen Konsep
const myEvents = ref([
  {
    id: 1,
    title: 'Seminar Nasional Artificial Intelligence & Masa Depan Pendidikan',
    category: { name: 'Seminar' },
    location: 'Auditorium Utama UNS, Surakarta',
    start_time: '2026-12-15T09:00:00+07:00',
    quota: 250,
    remaining_quota: 247,
    status: 'tayang',
  },
  {
    id: 9,
    title: 'Open Recruitment Panitia Dies Natalis 2026',
    category: { name: 'Perekrutan' },
    location: 'Student Center UNS',
    start_time: '2026-12-01T09:00:00+07:00',
    quota: 150,
    remaining_quota: 150,
    status: 'menunggu_review',
  },
  {
    id: 12,
    title: 'Workshop Cloud Native & Kubernetes Essentials',
    category: { name: 'Workshop' },
    location: 'Lab Jaringan Komputer Informatika UNS',
    start_time: '2026-12-10T09:00:00+07:00',
    quota: 40,
    remaining_quota: 40,
    status: 'draft',
    payment_deadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 11,
    title: 'Gathering Komunitas Game Liar Solo',
    category: { name: 'Komunitas' },
    location: 'Warkop Area Manahan, Surakarta',
    start_time: '2026-11-30T10:00:00+07:00',
    quota: 30,
    remaining_quota: 30,
    status: 'ditolak',
    reject_reason: 'Deskripsi acara tidak jelas dan lokasi tidak memenuhi syarat perizinan kampus.',
  },
  {
    id: 3,
    title: 'Kompetisi Desain Poster Digital Kreatif Mahasiswa Nasional',
    category: { name: 'Lomba' },
    location: 'Online via Zoom Meeting',
    start_time: '2026-11-01T08:00:00+07:00',
    quota: 100,
    remaining_quota: 0,
    status: 'selesai',
  },
])

const filteredEvents = computed(() => {
  return myEvents.value.filter((item) => {
    // 1. Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      const matchTitle = item.title?.toLowerCase().includes(q)
      const matchLoc = item.location?.toLowerCase().includes(q)
      if (!matchTitle && !matchLoc) return false
    }

    // 2. Status
    if (filters.status !== 'all') {
      if (item.status !== filters.status) return false
    }

    // 3. Category
    if (filters.category !== 'all') {
      if (item.category?.name !== filters.category) return false
    }

    return true
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredEvents.value.length / perPage) || 1
})

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredEvents.value.slice(start, start + perPage)
})

function resetFilters() {
  filters.search = ''
  filters.status = 'all'
  filters.category = 'all'
  currentPage.value = 1
}

function showRejectModal(event) {
  selectedRejectedEvent.value = event
}

function formatDateTime(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}
</script>
