<template>
  <div class="event-detail-page py-4">
    <div class="container">
      <!-- ===================================================================== -->
      <!-- BREADCRUMB & BACK BUTTON                                              -->
      <!-- ===================================================================== -->
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/" class="text-decoration-none">Katalog Event</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ event ? event.title : 'Detail Event' }}
            </li>
          </ol>
        </nav>
        <router-link to="/" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          ← Kembali ke Katalog
        </router-link>
      </div>

      <!-- ===================================================================== -->
      <!-- 1. LOADING SKELETON STATE                                             -->
      <!-- ===================================================================== -->
      <div v-if="loading" class="row g-4">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div class="placeholder-glow">
              <div class="placeholder w-100" style="height: 360px;"></div>
            </div>
            <div class="card-body p-4">
              <p class="placeholder-glow">
                <span class="placeholder col-3 rounded-pill me-2"></span>
                <span class="placeholder col-3 rounded-pill"></span>
              </p>
              <h2 class="placeholder-glow mb-4">
                <span class="placeholder col-10"></span>
                <span class="placeholder col-6"></span>
              </h2>
              <div class="placeholder-glow">
                <span class="placeholder col-12 mb-2"></span>
                <span class="placeholder col-12 mb-2"></span>
                <span class="placeholder col-8"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 p-4">
            <div class="placeholder-glow">
              <span class="placeholder col-6 mb-3"></span>
              <span class="placeholder col-12 mb-2" style="height: 48px;"></span>
              <span class="placeholder col-10"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- 2. NOT FOUND / ERROR STATE                                            -->
      <!-- ===================================================================== -->
      <div v-else-if="!event || errorMessage" class="card border-0 shadow-sm rounded-4 p-5 text-center my-4">
        <div class="display-3 mb-3">🔍</div>
        <h3 class="fw-bold mb-2">Event Tidak Ditemukan</h3>
        <p class="text-secondary mb-4">
          {{ errorMessage || 'Event yang Anda cari tidak tersedia, sudah selesai, atau belum disetujui oleh Developer.' }}
        </p>
        <div>
          <router-link to="/" class="btn btn-primary px-4 rounded-pill">
            Kembali ke Katalog Event
          </router-link>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- 3. SUCCESS STATE (DETAIL EVENT LENGKAP)                               -->
      <!-- ===================================================================== -->
      <div v-else class="row g-4">
        <!-- KOLOM UTAMA (Kiri): Poster, Info Lengkap, Preview Form -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <!-- Poster Besar -->
            <div class="position-relative bg-light text-center overflow-hidden poster-hero">
              <img
                :src="event.poster_url || getPlaceholderImage(event.id)"
                :alt="event.title"
                class="img-fluid w-100 detail-poster"
                @error="onImageError"
              />
              <span class="badge bg-primary position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill fw-semibold shadow">
                {{ event.category?.name || 'Umum' }}
              </span>
              <span
                v-if="event.remaining_quota <= 0"
                class="badge bg-dark text-white position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill fw-bold shadow"
              >
                KUOTA HABIS
              </span>
            </div>

            <!-- Konten Detail Event -->
            <div class="card-body p-4 p-md-5">
              <h1 class="h2 fw-bold text-dark mb-3">
                {{ event.title }}
              </h1>

              <!-- Grid Informasi Cepat -->
              <div class="row g-3 py-3 my-2 border-top border-bottom bg-light bg-opacity-50 rounded-3 px-2">
                <div class="col-sm-6 col-md-4">
                  <div class="d-flex align-items-center">
                    <span class="fs-4 me-2">🗓️</span>
                    <div>
                      <div class="text-secondary small">Jadwal Acara</div>
                      <div class="fw-bold small">{{ formatDateTime(event.start_time) }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-sm-6 col-md-4">
                  <div class="d-flex align-items-center">
                    <span class="fs-4 me-2">📍</span>
                    <div>
                      <div class="text-secondary small">Lokasi</div>
                      <div class="fw-bold small text-truncate" :title="event.location">{{ event.location }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-sm-6 col-md-4">
                  <div class="d-flex align-items-center">
                    <span class="fs-4 me-2">👥</span>
                    <div>
                      <div class="text-secondary small">Ketersediaan Kursi</div>
                      <div class="fw-bold small">
                        <span :class="event.remaining_quota <= 0 ? 'text-danger' : 'text-success'">
                          {{ event.remaining_quota }}
                        </span> / {{ event.quota }} Kursi
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Deskripsi Acara -->
              <div class="mt-4">
                <h4 class="fw-bold mb-3">Deskripsi Acara</h4>
                <div class="text-secondary lh-lg event-description">
                  {{ event.description }}
                </div>
              </div>

              <!-- ============================================================= -->
              <!-- PREVIEW FORMULIR PENDAFTARAN DINAMIS (Bab 9.2 & US-03)        -->
              <!-- ============================================================= -->
              <div class="mt-5 pt-4 border-top">
                <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <div>
                    <h4 class="fw-bold mb-1">Pratinjau Pertanyaan Formulir</h4>
                    <p class="text-secondary small mb-0">
                      Pertanyaan yang wajib diisi saat Anda mendaftar acara ini.
                    </p>
                  </div>
                  <span class="badge bg-secondary-subtle text-secondary border px-3 py-2 rounded-pill small">
                    {{ event.form_fields?.length || 0 }} Pertanyaan
                  </span>
                </div>

                <div v-if="event.form_fields && event.form_fields.length > 0" class="list-group list-group-flush rounded-3 border">
                  <div
                    v-for="(field, idx) in event.form_fields"
                    :key="field.id"
                    class="list-group-item p-3 d-flex align-items-start justify-content-between gap-3"
                  >
                    <div>
                      <div class="fw-semibold text-dark">
                        {{ idx + 1 }}. {{ field.label }}
                        <span v-if="field.is_required" class="text-danger" title="Wajib Diisi">*</span>
                      </div>
                      <div v-if="field.options && field.options.length" class="small text-muted mt-1">
                        Pilihan opsi: <span class="badge bg-light text-dark border me-1" v-for="opt in field.options" :key="opt">{{ opt }}</span>
                      </div>
                    </div>
                    <div class="text-end">
                      <span class="badge bg-light text-secondary border text-uppercase small">
                        {{ fieldTypeLabel(field.field_type) }}
                      </span>
                      <div v-if="field.is_required" class="small text-danger mt-1">Wajib</div>
                      <div v-else class="small text-muted mt-1">Opsional</div>
                    </div>
                  </div>
                </div>

                <div v-else class="alert alert-light border small text-muted">
                  Event ini menggunakan formulir pendaftaran standar tanpa pertanyaan khusus tambahan.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SIDEBAR AKSI PENDAFTARAN (Kanan) -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 sticky-top action-card" style="top: 2rem;">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <span class="text-secondary small">Biaya Pendaftaran:</span>
              <span class="badge bg-success-subtle text-success fs-6 fw-bold px-3 py-2 rounded-pill">
                GRATIS
              </span>
            </div>

            <!-- Kuota Progress Bar -->
            <div class="mb-4">
              <div class="d-flex justify-content-between small text-muted mb-1">
                <span>Kuota Terisi:</span>
                <span class="fw-bold">{{ event.quota - event.remaining_quota }} / {{ event.quota }}</span>
              </div>
              <div class="progress" style="height: 8px;">
                <div
                  class="progress-bar"
                  :class="event.remaining_quota <= 0 ? 'bg-secondary' : 'bg-primary'"
                  role="progressbar"
                  :style="{ width: `${Math.min(100, Math.round(((event.quota - event.remaining_quota) / event.quota) * 100))}%` }"
                ></div>
              </div>
              <div v-if="event.remaining_quota <= 0" class="small text-danger mt-1 fw-bold">
                ✕ Seluruh kuota kursi telah terisi penuh.
              </div>
              <div v-else class="small text-muted mt-1">
                Tersisa <strong>{{ event.remaining_quota }} kursi</strong> lagi.
              </div>
            </div>

            <!-- ============================================================= -->
            <!-- LOGIKA TOMBOL CALL TO ACTION (CTA)                            -->
            <!-- ============================================================= -->

            <!-- KONDISI 1: Kuota Habis (BR-01) -->
            <div v-if="event.remaining_quota <= 0" class="d-grid gap-2">
              <button class="btn btn-secondary py-3 rounded-pill fw-bold" disabled>
                KUOTA HABIS
              </button>
              <p class="small text-muted text-center mb-0">
                Pendaftaran ditutup karena kapasitas maksimal telah tercapai.
              </p>
            </div>

            <!-- KONDISI 2: Role Panitia atau Developer (BR-04) -->
            <div v-else-if="auth.isAuthenticated && (auth.isPanitia || auth.isDeveloper)" class="d-grid gap-2">
              <div class="alert alert-warning small mb-2 border-0">
                <strong>Perhatian:</strong> Anda sedang login sebagai <strong>{{ auth.role.toUpperCase() }}</strong>. Fitur pendaftaran event hanya diperuntukkan bagi akun <strong>Peserta</strong> (BR-04).
              </div>
              <button class="btn btn-outline-secondary py-2 rounded-pill fw-semibold" disabled>
                Pendaftaran Khusus Peserta
              </button>
            </div>

            <!-- KONDISI 3: Tamu / Belum Login -->
            <div v-else-if="!auth.isAuthenticated" class="d-grid gap-2">
              <router-link
                :to="`/login?redirect=/events/${event.id}/register`"
                class="btn btn-primary py-3 rounded-pill fw-bold shadow-sm"
              >
                Daftar Sekarang →
              </router-link>
              <p class="small text-muted text-center mb-0">
                Anda akan diarahkan ke halaman login terlebih dahulu.
              </p>
            </div>

            <!-- KONDISI 4: Login sebagai Peserta -->
            <div v-else class="d-grid gap-2">
              <router-link
                :to="`/events/${event.id}/register`"
                class="btn btn-primary py-3 rounded-pill fw-bold shadow-sm"
              >
                Daftar Sekarang →
              </router-link>
              <p class="small text-success text-center mb-0">
                ✓ Anda masuk sebagai {{ auth.user?.name || 'Peserta' }}
              </p>
            </div>

            <!-- Bagikan Event -->
            <div class="mt-4 pt-3 border-top text-center">
              <span class="small text-secondary d-block mb-2">Bagikan event ini ke teman:</span>
              <button class="btn btn-light btn-sm rounded-pill px-3 border" @click="copyShareLink">
                🔗 {{ copySuccess ? 'Tautan Disalin!' : 'Salin Tautan Event' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { eventService } from '../../services/eventService'

const route = useRoute()
const auth = useAuthStore()

const event = ref(null)
const loading = ref(true)
const errorMessage = ref('')
const copySuccess = ref(false)

// Sample database fallback untuk demo slicing
const DUMMY_DETAILS = {
  1: {
    id: 1,
    title: 'Seminar Nasional Artificial Intelligence & Masa Depan Pendidikan',
    description: 'Seminar Nasional yang diselenggarakan oleh Program Studi Teknik Informatika UNS menghadirkan para pakar kecerdasan buatan terkemuka dari akademisi dan industri teknologi. Acara ini akan mengupas tuntas transformasi AI generatif, kurikulum berbasis kecerdasan buatan, serta etika dan tantangan regulasi digital di Indonesia.',
    poster_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
    location: 'Auditorium Utama UNS, Surakarta',
    start_time: '2026-12-15T09:00:00+07:00',
    end_time: '2026-12-15T15:00:00+07:00',
    quota: 250,
    remaining_quota: 247,
    status: 'tayang',
    category: { id: 1, name: 'Seminar' },
    form_fields: [
      { id: 11, label: 'Asal Universitas / Instansi', field_type: 'text', options: null, is_required: true },
      { id: 12, label: 'Nomor WhatsApp Aktif', field_type: 'text', options: null, is_required: true },
    ],
  },
  2: {
    id: 2,
    title: 'UI/UX Design Boot Camp: From Zero to Prototype',
    description: 'Pelatihan intensif dua hari bersama praktisi UI/UX terkemuka. Peserta akan mempraktikkan proses riset pengguna, wireframing, perancangan antarmuka visual berbasis sistem desain modern di Figma, hingga pembuatan prototipe interaktif yang siap diuji ke pengguna sungguhan.',
    poster_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80',
    location: 'Lab Komputer Kampus Mesen UNS, Surakarta',
    start_time: '2026-12-18T08:30:00+07:00',
    end_time: '2026-12-19T16:00:00+07:00',
    quota: 40,
    remaining_quota: 39,
    status: 'tayang',
    category: { id: 2, name: 'Workshop' },
    form_fields: [
      { id: 21, label: 'Asal Kampus / Program Studi', field_type: 'text', options: null, is_required: true },
      { id: 22, label: 'Ukuran Kaos Peserta', field_type: 'dropdown', options: ['S', 'M', 'L', 'XL', 'XXL'], is_required: true },
    ],
  },
  4: {
    id: 4,
    title: 'International Symposium on Green Energy & Environmental Sustainability',
    description: 'Simposium internasional tingkat tinggi yang mempertemukan peneliti iklim, pelaku industri energi terbarukan, dan perumus kebijakan. Diskusi difokuskan pada percepatan transisi energi bersih dan dekarbonisasi industri manufaktur.',
    poster_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
    location: 'Hotel Alila Solo, Surakarta',
    start_time: '2026-12-10T09:00:00+07:00',
    end_time: '2026-12-10T16:30:00+07:00',
    quota: 50,
    remaining_quota: 0,
    status: 'tayang',
    category: { id: 1, name: 'Seminar' },
    form_fields: [
      { id: 41, label: 'Kategori Peserta', field_type: 'dropdown', options: ['Mahasiswa', 'Akademisi / Dosen', 'Praktisi Industri', 'Umum'], is_required: true },
      { id: 42, label: 'Nama Institusi / Perusahaan', field_type: 'text', options: null, is_required: false },
    ],
  },
}

function fieldTypeLabel(type) {
  const map = {
    text: 'Teks Singkat',
    textarea: 'Paragraf Teks',
    number: 'Angka',
    dropdown: 'Pilihan Dropdown',
  }
  return map[type] || type
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
  return `https://picsum.photos/seed/event-${id}/1200/600`
}

function onImageError(e) {
  e.target.src = getPlaceholderImage(route.params.id)
}

function copyShareLink() {
  navigator.clipboard.writeText(window.location.href)
  copySuccess.value = true
  setTimeout(() => {
    copySuccess.value = false
  }, 2500)
}

async function loadEventDetail() {
  loading.value = true
  errorMessage.value = ''
  const id = route.params.id

  try {
    const res = await eventService.getEventDetail(id)
    if (res.data) {
      event.value = res.data
    } else {
      event.value = DUMMY_DETAILS[id] || DUMMY_DETAILS[1]
    }
  } catch {
    // Gunakan fallback dummy dataset agar slicing dapat diuji visualnya langsung
    event.value = DUMMY_DETAILS[id] || DUMMY_DETAILS[1]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEventDetail()
})
</script>

<style scoped>
.poster-hero {
  max-height: 400px;
}

.detail-poster {
  max-height: 400px;
  object-fit: cover;
}

.event-description {
  white-space: pre-line;
  font-size: 1.05rem;
}

.action-card {
  border: 1px solid #e2e8f0;
}
</style>
