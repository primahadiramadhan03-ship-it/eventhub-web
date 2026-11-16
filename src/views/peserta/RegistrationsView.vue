<template>
  <div class="registrations-page py-4 pb-5">
    <div class="container">
      <!-- Breadcrumb & Header -->
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 class="h3 fw-bold text-dark mb-1">Tiket & Riwayat Pendaftaran Saya</h2>
          <p class="text-secondary small mb-0">
            Daftar seluruh event kampus yang telah Anda daftarkan beserta akses e-tiket digital.
          </p>
        </div>
        <router-link to="/" class="btn btn-primary btn-sm rounded-pill px-3 fw-semibold">
          🔍 Cari Event Baru
        </router-link>
      </div>

      <!-- Filter Bar -->
      <div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4 bg-white">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted">🔍</span>
              <input
                v-model="filters.search"
                type="text"
                class="form-control bg-light border-start-0"
                placeholder="Cari berdasarkan judul event atau kode tiket..."
              />
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <select v-model="filters.status" class="form-select bg-light">
              <option value="all">Semua Status Kehadiran</option>
              <option value="registered">Terdaftar (Menunggu Acara)</option>
              <option value="attended">Hadir (Checked-In)</option>
            </select>
          </div>
          <div class="col-12 col-sm-6 col-md-2 text-sm-end">
            <button
              v-if="filters.search || filters.status !== 'all'"
              class="btn btn-link btn-sm text-danger text-decoration-none p-0"
              @click="resetFilters"
            >
              ✕ Reset Filter
            </button>
          </div>
        </div>
      </div>

      <!-- 1. LOADING SKELETON -->
      <div v-if="loading" class="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div class="placeholder-glow">
          <div v-for="n in 4" :key="n" class="placeholder col-12 mb-3 py-3 rounded-3"></div>
        </div>
      </div>

      <!-- 2. EMPTY STATE -->
      <div
        v-else-if="filteredRegistrations.length === 0"
        class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-3"
      >
        <div class="display-3 mb-3">🎫</div>
        <h4 class="fw-bold mb-2">Belum Ada Pendaftaran</h4>
        <p class="text-secondary mb-4">
          {{ filters.search || filters.status !== 'all' ? 'Tidak ada pendaftaran yang sesuai dengan pencarian Anda.' : 'Anda belum mendaftar ke event kampus apapun. Jelajahi katalog sekarang dan dapatkan tiketmu!' }}
        </p>
        <div>
          <button
            v-if="filters.search || filters.status !== 'all'"
            class="btn btn-outline-secondary px-4 rounded-pill me-2"
            @click="resetFilters"
          >
            Bersihkan Filter
          </button>
          <router-link to="/" class="btn btn-primary px-4 rounded-pill">
            Jelajahi Katalog Event
          </router-link>
        </div>
      </div>

      <!-- 3. TABEL INTERAKTIF -->
      <div v-else class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">Kode Tiket</th>
                <th>Judul Event</th>
                <th>Jadwal Acara</th>
                <th>Lokasi</th>
                <th>Waktu Daftar</th>
                <th>Status Presensi</th>
                <th class="text-end pe-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reg in paginatedRegistrations" :key="reg.id">
                <td class="ps-4">
                  <span class="badge bg-light text-primary border font-monospace px-2 py-1">
                    {{ reg.ticket_code }}
                  </span>
                </td>
                <td>
                  <div class="fw-semibold text-dark text-truncate" style="max-width: 240px;" :title="reg.event?.title">
                    {{ reg.event?.title }}
                  </div>
                  <span class="badge bg-secondary-subtle text-secondary small" style="font-size: 0.7rem;">
                    {{ reg.event?.category?.name || 'Umum' }}
                  </span>
                </td>
                <td class="small text-secondary">
                  {{ formatDateTime(reg.event?.start_time) }}
                </td>
                <td class="small text-secondary text-truncate" style="max-width: 180px;" :title="reg.event?.location">
                  📍 {{ reg.event?.location }}
                </td>
                <td class="small text-muted">
                  {{ formatDateOnly(reg.registered_at) }}
                </td>
                <td>
                  <span
                    v-if="reg.status === 'attended'"
                    class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small"
                  >
                    ✓ Hadir
                  </span>
                  <span
                    v-else
                    class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 small"
                  >
                    ● Terdaftar
                  </span>
                </td>
                <td class="text-end pe-4">
                  <router-link
                    :to="`/my-registrations/${reg.id}`"
                    class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold"
                  >
                    Buka E-Tiket →
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="card-footer bg-white p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
          <small class="text-secondary">
            Menampilkan {{ ((currentPage - 1) * perPage) + 1 }} - {{ Math.min(currentPage * perPage, filteredRegistrations.length) }} dari {{ filteredRegistrations.length }} tiket
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { eventService } from '../../services/eventService'

const loading = ref(false)

const filters = reactive({
  search: '',
  status: 'all',
})

const currentPage = ref(1)
const perPage = 5

// Mock dataset pendaftaran sesuai Bab 7.5 Dokumen Konsep
const DUMMY_REGISTRATIONS = [
  {
    id: 1,
    ticket_code: 'EVT-1-K3M9QX2A',
    status: 'registered',
    registered_at: '2026-11-12T09:15:00+07:00',
    event: {
      id: 1,
      title: 'Seminar Nasional Artificial Intelligence & Masa Depan Pendidikan',
      start_time: '2026-12-15T09:00:00+07:00',
      location: 'Auditorium Utama UNS, Surakarta',
      category: { name: 'Seminar' },
    },
  },
  {
    id: 2,
    ticket_code: 'EVT-3-P8L2ZW1Q',
    status: 'attended',
    registered_at: '2026-10-29T10:00:00+07:00',
    event: {
      id: 3,
      title: 'Kompetisi Desain Poster Digital Kreatif Mahasiswa Nasional',
      start_time: '2026-11-01T08:00:00+07:00',
      location: 'Online via Zoom Meeting',
      category: { name: 'Lomba' },
    },
  },
  {
    id: 5,
    ticket_code: 'EVT-2-W4J8VC3D',
    status: 'registered',
    registered_at: '2026-11-10T15:30:00+07:00',
    event: {
      id: 2,
      title: 'UI/UX Design Boot Camp: From Zero to Prototype',
      start_time: '2026-12-18T08:30:00+07:00',
      location: 'Lab Komputer Kampus Mesen UNS',
      category: { name: 'Workshop' },
    },
  },
]

const registrations = ref([])

const filteredRegistrations = computed(() => {
  return registrations.value.filter((item) => {
    // 1. Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      const matchTitle = item.event?.title?.toLowerCase().includes(q)
      const matchCode = item.ticket_code?.toLowerCase().includes(q)
      const matchLoc = item.event?.location?.toLowerCase().includes(q)
      if (!matchTitle && !matchCode && !matchLoc) return false
    }

    // 2. Status filter
    if (filters.status !== 'all') {
      if (item.status !== filters.status) return false
    }

    return true
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredRegistrations.value.length / perPage) || 1
})

const paginatedRegistrations = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredRegistrations.value.slice(start, start + perPage)
})

function resetFilters() {
  filters.search = ''
  filters.status = 'all'
  currentPage.value = 1
}

function formatDateTime(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d) + ' WIB'
}

function formatDateOnly(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

async function loadData() {
  loading.value = true
  try {
    const res = await eventService.getMyRegistrations()
    if (res.data && res.data.length) {
      registrations.value = res.data
    } else {
      registrations.value = DUMMY_REGISTRATIONS
    }
  } catch {
    registrations.value = DUMMY_REGISTRATIONS
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
