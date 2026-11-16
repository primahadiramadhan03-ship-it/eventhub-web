<template>
  <div class="review-queue-page pb-5">
    <!-- Header Halaman -->
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div>
        <h2 class="h4 fw-bold text-dark mb-1">Antrean Review Event</h2>
        <p class="text-secondary small mb-0">
          Tinjau pengajuan penayangan event kampus, pastikan kelayakan konten, dan berikan persetujuan atau penolakan.
        </p>
      </div>
      <span class="badge bg-danger rounded-pill px-3 py-2 fs-6">
        ⏳ {{ queueList.length }} Event Menunggu
      </span>
    </div>

    <!-- Alert Edukasi Alur Moderasi (Bab 1.3 & BR-13) -->
    <div class="alert alert-info border-0 rounded-4 shadow-sm mb-4 small p-3">
      <strong>ℹ️ Panduan Moderasi Developer:</strong> Seluruh event di halaman ini sudah menyelesaikan pembayaran sewa penayangan Rp50.000. Jika disetujui, event akan langsung tayang di katalog publik. Jika ditolak, Anda wajib mencantumkan alasan penolakan yang jelas (BR-13) agar panitia dapat memperbaikinya.
    </div>

    <!-- Filter & Search Bar -->
    <div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4 bg-white">
      <div class="row g-3 align-items-center">
        <div class="col-12 col-md-8">
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0 text-muted">🔍</span>
            <input
              v-model="filters.search"
              type="text"
              class="form-control bg-light border-start-0"
              placeholder="Cari berdasarkan nama event atau nama penyelenggara..."
            />
          </div>
        </div>

        <div class="col-12 col-md-4">
          <select v-model="filters.category" class="form-select bg-light">
            <option value="all">Semua Kategori</option>
            <option value="Perekrutan">Perekrutan</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Lomba">Lomba</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 1. EMPTY STATE -->
    <div v-if="filteredQueue.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-3">
      <div class="display-3 mb-3">🎉</div>
      <h4 class="fw-bold mb-2">Tidak Ada Antrean Review</h4>
      <p class="text-secondary mb-3">
        Semua pengajuan event panitia telah selesai ditinjau. Kerja bagus!
      </p>
      <router-link to="/admin" class="btn btn-outline-primary px-4 rounded-pill">
        Kembali ke Dashboard Developer
      </router-link>
    </div>

    <!-- 2. TABEL ANTREAN REVIEW INTERAKTIF -->
    <div v-else class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4">Event</th>
              <th>Penyelenggara (Panitia)</th>
              <th>Kategori</th>
              <th>Kapasitas</th>
              <th>Status Sewa</th>
              <th>Tanggal Pengajuan</th>
              <th class="text-end pe-4">Aksi Review</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredQueue" :key="item.id">
              <td class="ps-4">
                <div class="fw-bold text-dark text-truncate" style="max-width: 250px;" :title="item.title">
                  {{ item.title }}
                </div>
                <small class="text-muted d-block text-truncate" style="max-width: 250px;">
                  📍 {{ item.location }}
                </small>
              </td>

              <td>
                <div class="fw-semibold text-dark small">{{ item.organizer }}</div>
                <small class="text-muted">{{ item.organizer_email }}</small>
              </td>

              <td>
                <span class="badge bg-light text-dark border">{{ item.category }}</span>
              </td>

              <td class="small fw-semibold">
                {{ item.quota }} Peserta
              </td>

              <td>
                <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 font-monospace small">
                  ✓ LUNAS Rp50.000
                </span>
              </td>

              <td class="small text-secondary">
                {{ item.submitted_at }}
              </td>

              <td class="text-end pe-4">
                <button
                  class="btn btn-primary btn-sm rounded-pill px-3 fw-semibold shadow-sm"
                  @click="openReviewModal(item)"
                >
                  ⚖️ Tinjau Acara
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- MODAL MODERASI REVIEW EVENT (Bab 9.2, TC-27..TC-28, BR-13)             -->
    <!-- ======================================================================= -->
    <div
      v-if="selectedEvent"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title fw-bold">Tinjau Kelayakan Event</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>

          <div class="modal-body p-4">
            <div class="row g-4 mb-3">
              <div class="col-md-7">
                <span class="badge bg-primary mb-2 px-3 py-1 rounded-pill small">{{ selectedEvent.category }}</span>
                <h4 class="fw-bold text-dark mb-2">{{ selectedEvent.title }}</h4>
                <div class="small text-muted mb-3">
                  Penyelenggara: <strong>{{ selectedEvent.organizer }}</strong> ({{ selectedEvent.organizer_email }})
                </div>

                <div class="bg-light p-3 rounded-3 mb-3 border">
                  <div class="fw-semibold small text-dark mb-1">Deskripsi Kegiatan:</div>
                  <p class="small text-secondary mb-0">{{ selectedEvent.description }}</p>
                </div>

                <div class="small text-secondary d-flex flex-column gap-1">
                  <span>🗓️ <strong>Jadwal:</strong> {{ selectedEvent.start_time }}</span>
                  <span>📍 <strong>Lokasi:</strong> {{ selectedEvent.location }}</span>
                  <span>👥 <strong>Target Kuota:</strong> {{ selectedEvent.quota }} Peserta</span>
                </div>
              </div>

              <div class="col-md-5">
                <!-- Preview Formulir Dinamis yang dibuat Panitia -->
                <div class="card border bg-light rounded-3 p-3">
                  <div class="fw-bold small text-dark mb-2">Pertanyaan Formulir Dinamis:</div>
                  <div v-if="selectedEvent.form_fields && selectedEvent.form_fields.length" class="small d-flex flex-column gap-2">
                    <div v-for="(f, idx) in selectedEvent.form_fields" :key="idx" class="border-bottom pb-1">
                      <span class="fw-semibold text-dark">{{ idx + 1 }}. {{ f.label }}</span>
                      <div class="text-muted" style="font-size: 0.72rem;">Tipe: {{ f.type }} • {{ f.required ? 'Wajib' : 'Opsional' }}</div>
                    </div>
                  </div>
                  <div v-else class="text-muted small">Tidak ada pertanyaan khusus.</div>
                </div>

                <div class="mt-3 p-3 bg-success bg-opacity-10 rounded-3 border border-success">
                  <div class="fw-semibold small text-success mb-1">Status Pembayaran Sewa:</div>
                  <div class="fw-bold text-dark small">Rp50.000 (Telah Terverifikasi)</div>
                </div>
              </div>
            </div>

            <!-- Form Alasan Penolakan (Muncul jika tombol Tolak diklik) -->
            <div v-if="rejectMode" class="mt-3 p-3 bg-danger bg-opacity-10 border border-danger rounded-3">
              <label class="form-label fw-bold text-danger small mb-1">
                Alasan Penolakan Event Wajib Diisi (BR-13):
              </label>
              <textarea
                v-model="rejectReason"
                class="form-control"
                rows="3"
                placeholder="Tuliskan alasan penolakan secara jelas agar panitia dapat memperbaikinya..."
              ></textarea>
              <div v-if="rejectError" class="text-danger small mt-1">{{ rejectError }}</div>
            </div>
          </div>

          <div class="modal-footer bg-light border-0 d-flex justify-content-between">
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4" @click="closeModal">
              Batal
            </button>

            <div class="d-flex gap-2">
              <button
                v-if="!rejectMode"
                type="button"
                class="btn btn-outline-danger rounded-pill px-4 fw-semibold"
                @click="rejectMode = true"
              >
                ✕ Tolak Event...
              </button>

              <button
                v-if="rejectMode"
                type="button"
                class="btn btn-danger rounded-pill px-4 fw-bold"
                @click="confirmReject"
              >
                Kirim Penolakan
              </button>

              <button
                type="button"
                class="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                @click="confirmApprove"
              >
                ✓ Setujui & Tayangkan Event
              </button>
            </div>
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
  category: 'all',
})

const selectedEvent = ref(null)
const rejectMode = ref(false)
const rejectReason = ref('')
const rejectError = ref('')

// Dataset Mock Antrean Review sesuai Bab 7.5 Dokumen Konsep
const queueList = ref([
  {
    id: 9,
    title: 'Open Recruitment Panitia Dies Natalis 2026',
    description: 'Pendaftaran dan seleksi panitia mahasiswa untuk seluruh rangkaian perayaan Dies Natalis kampus.',
    organizer: 'Panitia Demo',
    organizer_email: 'panitia@eventhub.test',
    category: 'Perekrutan',
    location: 'Student Center UNS, Surakarta',
    start_time: '1 Des 2026, 09:00 WIB',
    quota: 150,
    submitted_at: '12 Nov 2026, 11:00',
    form_fields: [
      { label: 'Pilihan Divisi Kepanitiaan', type: 'dropdown', required: true },
      { label: 'Motivasi Bergabung', type: 'textarea', required: true },
    ],
  },
  {
    id: 10,
    title: 'Pelatihan Public Speaking & Pitching Mahasiswa',
    description: 'Pelatihan teknik komunikasi percaya diri, negosiasi, dan presentasi ide bisnis rintisan di depan audiens.',
    organizer: 'Himpunan Mahasiswa Informatika',
    organizer_email: 'panitia2@eventhub.test',
    category: 'Workshop',
    location: 'Ruang Seminar LPPM UNS',
    start_time: '8 Des 2026, 09:00 WIB',
    quota: 50,
    submitted_at: '13 Nov 2026, 09:00',
    form_fields: [
      { label: 'Asal Program Studi / Angkatan', type: 'text', required: true },
      { label: 'Nomor WhatsApp', type: 'text', required: true },
    ],
  },
])

const filteredQueue = computed(() => {
  return queueList.value.filter((item) => {
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      const matchTitle = item.title.toLowerCase().includes(q)
      const matchOrg = item.organizer.toLowerCase().includes(q)
      if (!matchTitle && !matchOrg) return false
    }

    if (filters.category !== 'all') {
      if (item.category !== filters.category) return false
    }

    return true
  })
})

function openReviewModal(item) {
  selectedEvent.value = item
  rejectMode.value = false
  rejectReason.value = ''
  rejectError.value = ''
}

function closeModal() {
  selectedEvent.value = null
  rejectMode.value = false
}

function confirmApprove() {
  if (!selectedEvent.value) return
  // Simulasi persetujuan
  const id = selectedEvent.value.id
  queueList.value = queueList.value.filter((e) => e.id !== id)
  alert(`Event "${selectedEvent.value.title}" telah disetujui dan kini berstatus TAYANG di katalog publik!`)
  closeModal()
}

function confirmReject() {
  if (!rejectReason.value.trim()) {
    rejectError.value = 'Alasan penolakan wajib diisi (BR-13).'
    return
  }
  const id = selectedEvent.value.id
  queueList.value = queueList.value.filter((e) => e.id !== id)
  alert(`Event "${selectedEvent.value.title}" telah ditolak dengan alasan: "${rejectReason.value}". Panitia akan menerima notifikasi.`)
  closeModal()
}
</script>
