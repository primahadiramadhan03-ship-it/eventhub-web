<template>
  <div class="katalog-page pb-5">
    <!-- ======================================================================= -->
    <!-- HERO SECTION                                                            -->
    <!-- ======================================================================= -->
    <section class="bg-gradient-primary text-white py-5 mb-4 shadow-sm">
      <div class="container py-3">
        <div class="row align-items-center g-4">
          <div class="col-lg-8">
            <span class="badge bg-white text-primary fw-semibold px-3 py-2 rounded-pill mb-3">
              🚀 Platform Event Kampus & Komunitas
            </span>
            <h1 class="display-5 fw-bold mb-3">
              Temukan & Ikuti Berbagai Event Menarik Kampus
            </h1>
            <p class="lead opacity-90 mb-0">
              Jelajahi seminar akademik, workshop skill teknologi, lomba nasional, hingga festival seni budaya mahasiswa di satu tempat.
            </p>
          </div>
          <div class="col-lg-4 text-lg-end">
            <div class="card bg-white bg-opacity-10 border-0 text-white p-3 rounded-4 backdrop-blur">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="small">Status Koneksi API:</span>
                <span v-if="apiConnected" class="badge bg-success">● Terhubung</span>
                <span v-else class="badge bg-warning text-dark">● Mode Demo / Mock</span>
              </div>
              <div class="small opacity-75">
                {{ apiConnected ? 'Data disinkronkan langsung dari Cloud API' : 'Menampilkan data katalog interaktif lokal' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- FILTER & SEARCH BAR SECTION                                             -->
    <!-- ======================================================================= -->
    <div class="container mb-4">
      <div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
        <div class="row g-3 align-items-center">
          <!-- Search input -->
          <div class="col-12 col-md-5">
            <label class="form-label small fw-bold text-secondary mb-1">Cari Judul Event</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted">
                🔍
              </span>
              <input
                v-model="filters.search"
                type="text"
                class="form-control bg-light border-start-0"
                placeholder="Ketik nama event yang dicari..."
                @input="applyFilters"
              />
            </div>
          </div>

          <!-- Kategori dropdown -->
          <div class="col-12 col-sm-6 col-md-4">
            <label class="form-label small fw-bold text-secondary mb-1">Kategori</label>
            <select
              v-model="filters.categoryId"
              class="form-select bg-light"
              @change="applyFilters"
            >
              <option value="">Semua Kategori</option>
              <option
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Ketersediaan Kuota -->
          <div class="col-12 col-sm-6 col-md-3">
            <label class="form-label small fw-bold text-secondary mb-1">Ketersediaan Kuota</label>
            <select
              v-model="filters.availability"
              class="form-select bg-light"
              @change="applyFilters"
            >
              <option value="all">Semua Kuota</option>
              <option value="available">Masih Tersedia</option>
              <option value="full">Kuota Habis</option>
            </select>
          </div>
        </div>

        <!-- Filter info / active filter badges -->
        <div v-if="hasActiveFilter" class="d-flex align-items-center gap-2 mt-3 pt-3 border-top flex-wrap">
          <span class="small text-secondary">Filter aktif:</span>
          <span v-if="filters.search" class="badge bg-light text-dark border">
            Pencarian: "{{ filters.search }}"
          </span>
          <span v-if="filters.categoryId" class="badge bg-light text-dark border">
            Kategori: {{ selectedCategoryName }}
          </span>
          <span v-if="filters.availability !== 'all'" class="badge bg-light text-dark border">
            Status: {{ filters.availability === 'available' ? 'Tersedia' : 'Kuota Habis' }}
          </span>
          <button
            class="btn btn-link btn-sm text-decoration-none text-danger p-0 ms-auto"
            @click="resetFilters"
          >
            ✕ Reset Semua Filter
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- EVENT LIST SECTION (4 STATES: LOADING, EMPTY, ERROR, SUCCESS)           -->
    <!-- ======================================================================= -->
    <div class="container">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h2 class="h4 fw-bold mb-0">
          Katalog Event
          <span class="badge bg-secondary ms-2 fs-6 fw-normal">{{ filteredEvents.length }} Acara</span>
        </h2>
      </div>

      <!-- 1. LOADING SKELETON STATE (Bab 9.2) -->
      <div v-if="loading" class="row g-4">
        <div v-for="n in 6" :key="n" class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden" aria-hidden="true">
            <div class="placeholder-glow">
              <div class="placeholder w-100" style="height: 190px;"></div>
            </div>
            <div class="card-body p-4">
              <p class="placeholder-glow mb-2">
                <span class="placeholder col-4 rounded-pill"></span>
              </p>
              <h5 class="card-title placeholder-glow mb-3">
                <span class="placeholder col-10"></span>
                <span class="placeholder col-7"></span>
              </h5>
              <p class="placeholder-glow mb-2">
                <span class="placeholder col-6"></span>
              </p>
              <p class="placeholder-glow mb-4">
                <span class="placeholder col-8"></span>
              </p>
              <div class="placeholder-glow">
                <span class="placeholder col-12 btn btn-primary disabled"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. ERROR STATE (Bab 9.2 & 9.3) -->
      <div v-else-if="errorMessage" class="card border-0 shadow-sm rounded-4 p-5 text-center my-4">
        <div class="text-danger fs-1 mb-2">⚠️</div>
        <h4 class="fw-bold mb-2">Gagal Memuat Katalog Event</h4>
        <p class="text-secondary mb-4">{{ errorMessage }}</p>
        <div>
          <button class="btn btn-primary px-4 rounded-pill" @click="fetchData">
            🔄 Coba Muat Ulang
          </button>
        </div>
      </div>

      <!-- 3. EMPTY STATE (Bab 9.2) -->
      <div v-else-if="paginatedEvents.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center my-4">
        <div class="display-3 mb-3">📅</div>
        <h4 class="fw-bold mb-2">Tidak Ada Event yang Sesuai</h4>
        <p class="text-secondary mb-4">
          Coba gunakan kata kunci lain atau bersihkan filter pencarian untuk menemukan event menarik lainnya.
        </p>
        <div>
          <button class="btn btn-outline-primary px-4 rounded-pill" @click="resetFilters">
            Bersihkan Filter Pencarian
          </button>
        </div>
      </div>

      <!-- 4. SUCCESS STATE: GRID EVENT CARDS (Bab 9.2: Mobile 360, Tablet 768, Desktop 1280) -->
      <div v-else class="row g-4">
        <div
          v-for="event in paginatedEvents"
          :key="event.id"
          class="col-12 col-md-6 col-lg-4"
        >
          <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden event-card transition-all">
            <!-- Poster Event -->
            <div class="position-relative overflow-hidden poster-container">
              <img
                :src="event.poster_url || getPlaceholderImage(event.id)"
                :alt="event.title"
                class="card-img-top event-poster"
                @error="onImageError($event, event.id)"
              />
              <!-- Badge Kategori -->
              <span class="badge bg-white text-dark shadow-sm position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill fw-semibold small">
                {{ event.category?.name || 'Umum' }}
              </span>

              <!-- Badge Status Kuota (Bab 9.2: KUOTA HABIS = Abu gelap / bg-dark) -->
              <span
                v-if="event.remaining_quota <= 0"
                class="badge bg-dark text-white shadow-sm position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill fw-bold small"
              >
                KUOTA HABIS
              </span>
              <span
                v-else-if="event.remaining_quota <= 5"
                class="badge bg-warning text-dark shadow-sm position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill fw-bold small"
              >
                🔥 Sisa {{ event.remaining_quota }} Kursi!
              </span>
              <span
                v-else
                class="badge bg-success text-white shadow-sm position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill fw-semibold small"
              >
                Sisa {{ event.remaining_quota }} Kursi
              </span>
            </div>

            <!-- Card Body -->
            <div class="card-body p-4 d-flex flex-column">
              <!-- Judul Event -->
              <h5 class="card-title fw-bold text-dark mb-2 line-clamp-2 event-title" :title="event.title">
                {{ event.title }}
              </h5>

              <!-- Deskripsi Singkat -->
              <p class="text-secondary small mb-3 line-clamp-2">
                {{ event.description }}
              </p>

              <!-- Metadata: Waktu & Lokasi -->
              <div class="mt-auto pt-3 border-top">
                <div class="d-flex align-items-center text-secondary small mb-2">
                  <span class="me-2 fs-6">🗓️</span>
                  <span>{{ formatDateTime(event.start_time) }}</span>
                </div>
                <div class="d-flex align-items-center text-secondary small mb-3">
                  <span class="me-2 fs-6">📍</span>
                  <span class="text-truncate" :title="event.location">{{ event.location }}</span>
                </div>

                <!-- Progress Kuota -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between small text-muted mb-1">
                    <span>Terisi: {{ event.quota - event.remaining_quota }} / {{ event.quota }}</span>
                    <span>{{ Math.round(((event.quota - event.remaining_quota) / event.quota) * 100) }}%</span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div
                      class="progress-bar"
                      :class="event.remaining_quota <= 0 ? 'bg-secondary' : 'bg-primary'"
                      role="progressbar"
                      :style="{ width: `${Math.min(100, Math.round(((event.quota - event.remaining_quota) / event.quota) * 100))}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Action CTA -->
                <div class="d-grid">
                  <router-link
                    :to="`/events/${event.id}`"
                    class="btn rounded-pill fw-semibold py-2"
                    :class="event.remaining_quota <= 0 ? 'btn-outline-secondary' : 'btn-primary'"
                  >
                    {{ event.remaining_quota <= 0 ? 'Lihat Detail Acara' : 'Lihat Detail & Daftar →' }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- PAGINATION CONTROLS (Bab 9.2)                                         -->
      <!-- ===================================================================== -->
      <div v-if="totalPages > 1" class="d-flex justify-content-center mt-5">
        <nav aria-label="Navigasi Halaman Katalog">
          <ul class="pagination pagination-md shadow-sm rounded-pill overflow-hidden">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="changePage(currentPage - 1)">
                ‹ Sebelumnya
              </button>
            </li>
            <li
              v-for="page in totalPages"
              :key="page"
              class="page-item"
              :class="{ active: currentPage === page }"
            >
              <button class="page-link" @click="changePage(page)">
                {{ page }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="changePage(currentPage + 1)">
                Selanjutnya ›
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { categoryService } from '../../services/categoryService'
import { eventService } from '../../services/eventService'

// -----------------------------------------------------------------------------
// DUMMY SAMPLE EVENTS (Sesuai Bab 7.5 Dokumen Konsep Proyek v3.0)
// Menjamin visual slicing selalu tampil sempurna meskipun API backend offline.
// -----------------------------------------------------------------------------
const DUMMY_EVENTS = [
  {
    id: 1,
    title: 'Seminar Nasional Artificial Intelligence & Masa Depan Pendidikan',
    description: 'Eksplorasi potensi kecerdasan buatan dalam mentransformasi proses belajar-mengajar di perguruan tinggi.',
    poster_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    location: 'Auditorium Utama UNS, Surakarta',
    start_time: '2026-12-15T09:00:00+07:00',
    end_time: '2026-12-15T15:00:00+07:00',
    quota: 250,
    remaining_quota: 247,
    status: 'tayang',
    category: { id: 1, name: 'Seminar' },
  },
  {
    id: 2,
    title: 'UI/UX Design Boot Camp: From Zero to Prototype',
    description: 'Pelatihan intensif merancang antarmuka aplikasi digital berbasis metodologi Design Thinking dan Figma.',
    poster_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
    location: 'Lab Komputer Kampus Mesen UNS, Surakarta',
    start_time: '2026-12-18T08:30:00+07:00',
    end_time: '2026-12-19T16:00:00+07:00',
    quota: 40,
    remaining_quota: 39,
    status: 'tayang',
    category: { id: 2, name: 'Workshop' },
  },
  {
    id: 3,
    title: 'Kompetisi Desain Poster Digital Kreatif Mahasiswa Nasional',
    description: 'Ajang kompetisi kreativitas visual tingkat nasional dengan tema Inovasi Berkelanjutan.',
    poster_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop&q=80',
    location: 'Online via Zoom Meeting & Submisi Karya',
    start_time: '2026-12-20T08:00:00+07:00',
    end_time: '2026-12-20T17:00:00+07:00',
    quota: 100,
    remaining_quota: 98,
    status: 'tayang',
    category: { id: 3, name: 'Lomba' },
  },
  {
    id: 4,
    title: 'International Symposium on Green Energy & Environmental Sustainability',
    description: 'Simposium internasional membahas teknologi ramah lingkungan, panel surya, dan dekarbonisasi industri.',
    poster_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    location: 'Hotel Alila Solo, Surakarta',
    start_time: '2026-12-10T09:00:00+07:00',
    end_time: '2026-12-10T16:30:00+07:00',
    quota: 50,
    remaining_quota: 0, // Demonstrasi status KUOTA HABIS (Bab 9.2 & BR-01)
    status: 'tayang',
    category: { id: 1, name: 'Seminar' },
  },
  {
    id: 5,
    title: 'Festival Musik & Seni Budaya Mahasiswa Nusantara 2026',
    description: 'Pagelaran panggung kolaborasi karya musik daerah, teater tari, dan bazaar kuliner UMKM mahasiswa.',
    poster_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    location: 'Lapangan Rektorat UNS, Surakarta',
    start_time: '2026-12-28T15:00:00+07:00',
    end_time: '2026-12-28T22:30:00+07:00',
    quota: 500,
    remaining_quota: 500,
    status: 'tayang',
    category: { id: 5, name: 'Konser' },
  },
  {
    id: 6,
    title: 'Hands-on Cyber Security: Network Penetration & Defensive Security',
    description: 'Workshop praktik pengujian celah keamanan web, simulasi CTF, dan konfigurasi firewall modern.',
    poster_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    location: 'Lab Jaringan Komputer Informatika UNS',
    start_time: '2026-12-22T09:00:00+07:00',
    end_time: '2026-12-22T16:00:00+07:00',
    quota: 35,
    remaining_quota: 4, // Demonstrasi sisa kuota sedikit (< 5)
    status: 'tayang',
    category: { id: 2, name: 'Workshop' },
  },
]

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Seminar' },
  { id: 2, name: 'Workshop' },
  { id: 3, name: 'Lomba' },
  { id: 4, name: 'Perekrutan' },
  { id: 5, name: 'Konser' },
]

// -----------------------------------------------------------------------------
// STATE
// -----------------------------------------------------------------------------
const events = ref([])
const categories = ref([])
const loading = ref(true)
const apiConnected = ref(false)
const errorMessage = ref('')

const filters = reactive({
  search: '',
  categoryId: '',
  availability: 'all',
})

const currentPage = ref(1)
const itemsPerPage = 6

// -----------------------------------------------------------------------------
// COMPUTED FILTER & PAGINATION
// -----------------------------------------------------------------------------
const filteredEvents = computed(() => {
  return events.value.filter((item) => {
    // 1. Pencarian judul / lokasi
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      const matchTitle = item.title?.toLowerCase().includes(q)
      const matchDesc = item.description?.toLowerCase().includes(q)
      const matchLoc = item.location?.toLowerCase().includes(q)
      if (!matchTitle && !matchDesc && !matchLoc) return false
    }

    // 2. Kategori
    if (filters.categoryId) {
      const catId = item.category?.id || item.category_id
      if (Number(catId) !== Number(filters.categoryId)) return false
    }

    // 3. Ketersediaan Kuota
    if (filters.availability === 'available') {
      if (item.remaining_quota <= 0) return false
    } else if (filters.availability === 'full') {
      if (item.remaining_quota > 0) return false
    }

    return true
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredEvents.value.length / itemsPerPage) || 1
})

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredEvents.value.slice(start, start + itemsPerPage)
})

const hasActiveFilter = computed(() => {
  return Boolean(
    filters.search.trim() ||
    filters.categoryId ||
    filters.availability !== 'all'
  )
})

const selectedCategoryName = computed(() => {
  const found = categories.value.find((c) => Number(c.id) === Number(filters.categoryId))
  return found ? found.name : ''
})

// -----------------------------------------------------------------------------
// METHODS
// -----------------------------------------------------------------------------
function applyFilters() {
  currentPage.value = 1
}

function resetFilters() {
  filters.search = ''
  filters.categoryId = ''
  filters.availability = 'all'
  currentPage.value = 1
}

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 350, behavior: 'smooth' })
  }
}

function formatDateTime(isoString) {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date) + ' WIB'
}

function getPlaceholderImage(id) {
  return `https://picsum.photos/seed/event-${id}/800/450`
}

function onImageError(e, id) {
  e.target.src = getPlaceholderImage(id)
}

async function fetchData() {
  loading.value = true
  errorMessage.value = ''

  try {
    // 1. Ambil data kategori
    try {
      const catRes = await categoryService.getCategories()
      categories.value = catRes.data?.length ? catRes.data : DEFAULT_CATEGORIES
    } catch {
      categories.value = DEFAULT_CATEGORIES
    }

    // 2. Ambil data event dari backend / MSW
    try {
      const res = await eventService.getEvents()
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        events.value = res.data
        apiConnected.value = true
      } else {
        // Fallback ke dummy dataset jika API kosong
        events.value = DUMMY_EVENTS
        apiConnected.value = false
      }
    } catch {
      // Fallback ke dataset mock jika API tidak reachable (Mode Demo / Slicing)
      events.value = DUMMY_EVENTS
      apiConnected.value = false
    }
  } catch (err) {
    console.error('Katalog Fetch Error:', err)
    errorMessage.value = 'Terjadi kendala saat memuat data katalog.'
    events.value = DUMMY_EVENTS
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.backdrop-blur {
  backdrop-filter: blur(8px);
}

.poster-container {
  height: 200px;
  background-color: #f1f5f9;
}

.event-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.event-card:hover .event-poster {
  transform: scale(1.05);
}

.event-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
