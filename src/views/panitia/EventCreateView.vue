<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { eventService } from '../../services/eventService'
import { categoryService } from '../../services/categoryService'

const router = useRouter()

// Loading & error state
const isLoadingCategories = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const activeTab = ref('editor') // 'editor' | 'preview'

// Kategori dari database / fallback
const categories = ref([
  { id: 1, name: 'Teknologi' },
  { id: 2, name: 'Desain' },
  { id: 3, name: 'Bisnis' },
  { id: 4, name: 'Seni & Musik' },
  { id: 5, name: 'Karir' },
])

// Preset banner untuk kemudahan pengujian
const presetBanners = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80'
]

// Metadata event (BR-05)
const form = ref({
  title: '',
  category_id: '',
  description: '',
  location: '',
  quota: 50,
  start_date: '',
  end_date: '',
  banner_url: presetBanners[0],
})

// Dynamic form fields (US-02, BR-06, BR-07, BR-08, BR-09)
const formFields = ref([
  {
    id: 'f_1',
    label: 'Nama Lengkap / Instansi Asal',
    field_type: 'text',
    is_required: true,
    placeholder: 'Contoh: Universitas Sebelas Maret / PT Maju Jaya',
    options: []
  },
  {
    id: 'f_2',
    label: 'Nomor WhatsApp Aktif',
    field_type: 'text',
    is_required: true,
    placeholder: 'Contoh: 081234567890',
    options: []
  }
])

const MAX_FIELDS = 10 // Sesuai BR-06

// Computed
const fieldCount = computed(() => formFields.value.length)
const canAddField = computed(() => formFields.value.length < MAX_FIELDS)

// Fetch kategori dari backend live jika tersedia
onMounted(async () => {
  try {
    isLoadingCategories.value = true
    const res = await categoryService.getCategories()
    if (res && res.data && res.data.length > 0) {
      categories.value = res.data
    }
  } catch (err) {
    console.warn('[EventCreateView] Menggunakan fallback kategori lokal:', err.message)
  } finally {
    isLoadingCategories.value = false
    // Set default category
    if (!form.value.category_id && categories.value.length > 0) {
      form.value.category_id = categories.value[0].id
    }
  }

  // Set default datetime (besok jam 09:00 dan jam 12:00)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const pad = (n) => String(n).padStart(2, '0')
  const dateStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`
  form.value.start_date = `${dateStr}T09:00`
  form.value.end_date = `${dateStr}T12:00`
})

// Tambah pertanyaan baru
const addField = () => {
  if (!canAddField.value) return

  const newId = `f_${Date.now()}`
  formFields.value.push({
    id: newId,
    label: '',
    field_type: 'text',
    is_required: false,
    placeholder: '',
    options: ['Opsi 1', 'Opsi 2'] // default 2 opsi jika nanti diubah ke dropdown
  })
}

// Hapus pertanyaan
const removeField = (index) => {
  if (confirm(`Hapus pertanyaan #${index + 1}?`)) {
    formFields.value.splice(index, 1)
  }
}

// Tambah opsi dropdown
const addOption = (field) => {
  if (!field.options) field.options = []
  field.options.push(`Opsi ${field.options.length + 1}`)
}

// Hapus opsi dropdown
const removeOption = (field, optIndex) => {
  if (field.options.length <= 2) {
    alert('Tipe dropdown wajib memiliki minimal 2 opsi (BR-08).')
    return
  }
  field.options.splice(optIndex, 1)
}

// Ganti tipe pertanyaan
const handleTypeChange = (field) => {
  if (field.field_type === 'dropdown') {
    if (!field.options || field.options.length < 2) {
      field.options = ['Pilihan 1', 'Pilihan 2']
    }
  }
}

// Validasi Form sebelum submit
const validateForm = () => {
  if (!form.value.title.trim() || form.value.title.trim().length < 5) {
    return 'Judul acara minimal 5 karakter (TC-07).'
  }
  if (!form.value.category_id) {
    return 'Silakan pilih kategori acara.'
  }
  if (!form.value.description.trim() || form.value.description.trim().length < 10) {
    return 'Deskripsi acara minimal 10 karakter.'
  }
  if (!form.value.location.trim()) {
    return 'Lokasi acara wajib diisi (lokasi fisik atau link webinar).'
  }
  if (!form.value.quota || Number(form.value.quota) < 1) {
    return 'Kuota maksimal peserta minimal 1 orang (TC-07).'
  }
  if (!form.value.start_date || !form.value.end_date) {
    return 'Tanggal mulai dan selesai wajib diisi.'
  }
  if (new Date(form.value.end_date) < new Date(form.value.start_date)) {
    return 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai (TC-07).'
  }

  // Validasi form fields dinamis (BR-06, BR-08)
  for (let i = 0; i < formFields.value.length; i++) {
    const f = formFields.value[i]
    if (!f.label.trim()) {
      return `Label pertanyaan #${i + 1} tidak boleh kosong.`
    }
    if (f.field_type === 'dropdown') {
      if (!f.options || f.options.length < 2) {
        return `Pertanyaan #${i + 1} (${f.label}) tipe Dropdown wajib memiliki minimal 2 opsi (BR-08).`
      }
      for (let j = 0; j < f.options.length; j++) {
        if (!f.options[j].trim()) {
          return `Opsi #${j + 1} pada pertanyaan #${i + 1} tidak boleh kosong.`
        }
      }
    }
  }

  return null
}

// Submit Simpan Event
const handleSubmit = async (proceedToPayment = false) => {
  errorMessage.value = ''
  successMessage.value = ''

  const error = validateForm()
  if (error) {
    errorMessage.value = error
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  try {
    isSubmitting.value = true

    // Sanitasi data field dinamis
    const cleanFields = formFields.value.map((f, idx) => ({
      order_index: idx + 1,
      label: f.label.trim(),
      field_type: f.field_type,
      is_required: Boolean(f.is_required),
      placeholder: f.placeholder ? f.placeholder.trim() : '',
      options: f.field_type === 'dropdown' ? f.options.map(o => o.trim()) : null
    }))

    const payload = {
      title: form.value.title.trim(),
      category_id: Number(form.value.category_id),
      description: form.value.description.trim(),
      location: form.value.location.trim(),
      quota: Number(form.value.quota),
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      banner_url: form.value.banner_url || presetBanners[0],
      form_fields: cleanFields
    }

    // Panggil service atau fallback simpan ke LocalStorage
    let savedEventId = null
    try {
      const res = await eventService.createOrganizerEvent(payload)
      if (res && res.data && res.data.id) {
        savedEventId = res.data.id
      }
    } catch (apiErr) {
      console.warn('[EventCreateView] API offline/gagal, menyimpan ke storage lokal:', apiErr.message)
    }

    // Jika API belum tersedia / offline, generate ID lokal
    if (!savedEventId) {
      savedEventId = Date.now()
      const localEvents = JSON.parse(localStorage.getItem('eventhub_local_events') || '[]')
      const newLocalEvent = {
        id: savedEventId,
        ...payload,
        status: 'draft',
        registered_count: 0,
        remaining_quota: payload.quota,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString() // 24 jam tenggat sewa
      }
      localEvents.unshift(newLocalEvent)
      localStorage.setItem('eventhub_local_events', JSON.stringify(localEvents))
    }

    successMessage.value = 'Event berhasil dibuat dengan status Draft!'

    // Redirect
    setTimeout(() => {
      if (proceedToPayment) {
        router.push(`/organizer/events/${savedEventId}/payment`)
      } else {
        router.push('/organizer/events')
      }
    }, 1000)

  } catch (err) {
    errorMessage.value = err.message || 'Terjadi kesalahan saat menyimpan event.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="event-create-view py-4">
    <!-- Header Title & Back Link -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
      <div>
        <router-link to="/organizer/events" class="text-decoration-none text-muted small d-inline-flex align-items-center mb-1">
          <i class="bi bi-arrow-left me-1"></i> Kembali ke Event Saya
        </router-link>
        <h2 class="h3 fw-bold mb-0 text-dark">Buat Event Baru</h2>
        <p class="text-muted small mb-0">Lengkapi informasi acara dan susun formulir pendaftaran khusus untuk peserta.</p>
      </div>

      <!-- Tab Preview Toggle -->
      <div class="btn-group mt-3 mt-md-0" role="group">
        <button
          type="button"
          class="btn btn-sm"
          :class="activeTab === 'editor' ? 'btn-primary' : 'btn-outline-secondary'"
          @click="activeTab = 'editor'"
        >
          <i class="bi bi-pencil-square me-1"></i> Form Editor
        </button>
        <button
          type="button"
          class="btn btn-sm"
          :class="activeTab === 'preview' ? 'btn-primary' : 'btn-outline-secondary'"
          @click="activeTab = 'preview'"
        >
          <i class="bi bi-eye me-1"></i> Preview Tampilan Peserta
        </button>
      </div>
    </div>

    <!-- Alert Feedback -->
    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
      <i class="bi bi-exclamation-triangle-fill fs-5 me-2"></i>
      <div>{{ errorMessage }}</div>
      <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
    </div>

    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
      <i class="bi bi-check-circle-fill fs-5 me-2"></i>
      <div>{{ successMessage }}</div>
      <button type="button" class="btn-close" @click="successMessage = ''" aria-label="Close"></button>
    </div>

    <!-- Alert Edukasi Status Draft & Sewa (BR-10) -->
    <div class="alert alert-warning border-warning d-flex align-items-start mb-4">
      <i class="bi bi-info-circle-fill fs-5 text-warning me-3 mt-1"></i>
      <div>
        <strong class="d-block text-dark">Ketentuan Publikasi Event (Sewa Slot Rp50.000):</strong>
        <span class="small text-muted">
          Setelah disimpan, event baru akan berstatus <strong>Draft</strong>. Anda memiliki waktu <strong>24 jam</strong> untuk menyelesaikan biaya sewa slot penayangan agar masuk ke antrean verifikasi Developer (Status: <em>Menunggu Review</em>).
        </span>
      </div>
    </div>

    <!-- TAB 1: FORM EDITOR -->
    <div v-show="activeTab === 'editor'">
      <form @submit.prevent="handleSubmit(false)">
        <div class="row g-4">
          <!-- KOLOM KIRI: METADATA ACARA -->
          <div class="col-lg-7">
            <!-- Card Informasi Utama -->
            <div class="card border-0 shadow-sm rounded-4 mb-4">
              <div class="card-header bg-white py-3 border-bottom">
                <h5 class="fw-bold mb-0 text-dark d-flex align-items-center">
                  <span class="badge bg-primary-subtle text-primary rounded-circle p-2 me-2">
                    <i class="bi bi-info-lg"></i>
                  </span>
                  1. Informasi Acara (BR-05)
                </h5>
              </div>
              <div class="card-body p-4">
                <!-- Judul Event -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Judul Event <span class="text-danger">*</span></label>
                  <input
                    v-model="form.title"
                    type="text"
                    class="form-control"
                    placeholder="Contoh: Seminar Nasional AI & Masa Depan Industri Web"
                    required
                  />
                  <div class="form-text">Minimal 5 karakter. Berikan judul yang menarik dan jelas.</div>
                </div>

                <!-- Kategori & Kuota -->
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Kategori Acara <span class="text-danger">*</span></label>
                    <select v-model="form.category_id" class="form-select" required>
                      <option value="" disabled>Pilih Kategori</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Kuota Peserta <span class="text-danger">*</span></label>
                    <input
                      v-model.number="form.quota"
                      type="number"
                      min="1"
                      class="form-control"
                      placeholder="Contoh: 100"
                      required
                    />
                    <div class="form-text">Minimal 1 orang (Sistem auto-close jika penuh).</div>
                  </div>
                </div>

                <!-- Lokasi / Platform -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Lokasi / Tautan Acara <span class="text-danger">*</span></label>
                  <input
                    v-model="form.location"
                    type="text"
                    class="form-control"
                    placeholder="Contoh: Auditorium Gedung Ki Hadjar Dewantara / Zoom Meeting"
                    required
                  />
                </div>

                <!-- Waktu Mulai & Waktu Selesai -->
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Waktu Mulai <span class="text-danger">*</span></label>
                    <input
                      v-model="form.start_date"
                      type="datetime-local"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Waktu Selesai <span class="text-danger">*</span></label>
                    <input
                      v-model="form.end_date"
                      type="datetime-local"
                      class="form-control"
                      required
                    />
                  </div>
                </div>

                <!-- Deskripsi Acara -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">Deskripsi Lengkap <span class="text-danger">*</span></label>
                  <textarea
                    v-model="form.description"
                    rows="4"
                    class="form-control"
                    placeholder="Jelaskan agenda, pembicara, fasilitas, dan ketentuan peserta..."
                    required
                  ></textarea>
                  <div class="form-text">Minimal 10 karakter.</div>
                </div>
              </div>
            </div>

            <!-- Card Banner & Media -->
            <div class="card border-0 shadow-sm rounded-4 mb-4">
              <div class="card-header bg-white py-3 border-bottom">
                <h5 class="fw-bold mb-0 text-dark d-flex align-items-center">
                  <span class="badge bg-primary-subtle text-primary rounded-circle p-2 me-2">
                    <i class="bi bi-image"></i>
                  </span>
                  2. Poster Acara
                </h5>
              </div>
              <div class="card-body p-4">
                <div class="mb-3">
                  <label class="form-label fw-semibold">URL Banner Poster</label>
                  <input
                    v-model="form.banner_url"
                    type="url"
                    class="form-control"
                    placeholder="https://..."
                  />
                  <div class="form-text">Gunakan URL gambar publik atau pilih salah satu preset di bawah.</div>
                </div>

                <!-- Pilihan Cepat Preset -->
                <div class="mb-3">
                  <label class="form-label small text-muted">Pilihan Cepat Preset:</label>
                  <div class="d-flex gap-2 flex-wrap">
                    <button
                      v-for="(banner, bIdx) in presetBanners"
                      :key="bIdx"
                      type="button"
                      class="btn btn-sm btn-outline-secondary p-1"
                      :class="{ 'border-primary border-2': form.banner_url === banner }"
                      @click="form.banner_url = banner"
                    >
                      <img :src="banner" alt="preset" style="width: 60px; height: 35px; object-fit: cover;" class="rounded" />
                    </button>
                  </div>
                </div>

                <!-- Live Poster Preview -->
                <div v-if="form.banner_url" class="mt-2 text-center bg-light p-2 rounded-3">
                  <p class="small text-muted mb-1">Preview Poster:</p>
                  <img
                    :src="form.banner_url"
                    alt="Preview Poster"
                    class="img-fluid rounded shadow-sm"
                    style="max-height: 180px; width: 100%; object-fit: cover;"
                    @error="form.banner_url = presetBanners[0]"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- KOLOM KANAN: FORM BUILDER DINAMIS (US-02, BR-06, BR-07, BR-08, BR-09) -->
          <div class="col-lg-5">
            <div class="card border-0 shadow-sm rounded-4 mb-4 sticky-top" style="top: 85px; z-index: 10;">
              <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="fw-bold mb-0 text-dark d-flex align-items-center">
                    <span class="badge bg-primary-subtle text-primary rounded-circle p-2 me-2">
                      <i class="bi bi-ui-checks"></i>
                    </span>
                    Formulir Dinamis
                  </h5>
                  <small class="text-muted">Kumpulkan data kustom dari calon peserta</small>
                </div>
                <!-- Counter Pertanyaan (BR-06: Max 10) -->
                <span
                  class="badge px-3 py-2 rounded-pill fs-6"
                  :class="fieldCount >= MAX_FIELDS ? 'bg-danger text-white' : 'bg-primary-subtle text-primary'"
                >
                  {{ fieldCount }} / {{ MAX_FIELDS }} Pertanyaan
                </span>
              </div>

              <div class="card-body p-3 p-md-4" style="max-height: calc(100vh - 280px); overflow-y: auto;">
                <!-- Empty state form fields -->
                <div v-if="formFields.length === 0" class="text-center py-4 bg-light rounded-4">
                  <i class="bi bi-journal-x fs-1 text-muted mb-2 d-block"></i>
                  <p class="text-muted small mb-3">Belum ada pertanyaan kustom.<br>Peserta hanya akan mendaftar dengan data profil dasarnya.</p>
                  <button type="button" class="btn btn-sm btn-primary" @click="addField">
                    <i class="bi bi-plus-lg me-1"></i> Tambah Pertanyaan Pertama
                  </button>
                </div>

                <!-- List Pertanyaan Dinamis -->
                <div v-else class="d-flex flex-column gap-3">
                  <div
                    v-for="(field, index) in formFields"
                    :key="field.id"
                    class="card border border-2 rounded-3 shadow-none field-card"
                  >
                    <div class="card-header bg-light py-2 px-3 d-flex justify-content-between align-items-center">
                      <span class="fw-bold small text-secondary">
                        <i class="bi bi-grip-vertical me-1"></i> Pertanyaan #{{ index + 1 }}
                      </span>
                      <button
                        type="button"
                        class="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                        title="Hapus Pertanyaan"
                        @click="removeField(index)"
                      >
                        <i class="bi bi-trash"></i> Hapus
                      </button>
                    </div>

                    <div class="card-body p-3">
                      <!-- Label Pertanyaan -->
                      <div class="mb-2">
                        <label class="form-label small fw-semibold mb-1">Pertanyaan / Label <span class="text-danger">*</span></label>
                        <input
                          v-model="field.label"
                          type="text"
                          class="form-control form-control-sm"
                          placeholder="Contoh: Ukuran Baju / Link Github / NIM"
                          required
                        />
                      </div>

                      <!-- Tipe Field & Wajib Diisi (BR-07 & BR-09) -->
                      <div class="row g-2 mb-2">
                        <div class="col-7">
                          <label class="form-label small fw-semibold mb-1">Tipe Isian</label>
                          <select
                            v-model="field.field_type"
                            class="form-select form-select-sm"
                            @change="handleTypeChange(field)"
                          >
                            <option value="text">Teks Pendek (text)</option>
                            <option value="textarea">Teks Panjang (textarea)</option>
                            <option value="number">Angka (number)</option>
                            <option value="dropdown">Pilihan Ganda (dropdown)</option>
                          </select>
                        </div>
                        <div class="col-5 d-flex align-items-end">
                          <div class="form-check form-switch mb-1">
                            <input
                              v-model="field.is_required"
                              class="form-check-input"
                              type="checkbox"
                              :id="`req_${field.id}`"
                            />
                            <label class="form-check-label small fw-semibold" :for="`req_${field.id}`">
                              Wajib Diisi
                            </label>
                          </div>
                        </div>
                      </div>

                      <!-- Placeholder -->
                      <div v-if="field.field_type !== 'dropdown'" class="mb-1">
                        <label class="form-label small text-muted mb-0">Contoh Placeholder (opsional):</label>
                        <input
                          v-model="field.placeholder"
                          type="text"
                          class="form-control form-control-sm"
                          placeholder="Placeholder petunjuk isian..."
                        />
                      </div>

                      <!-- Opsi Pilihan Dropdown (BR-08) -->
                      <div v-if="field.field_type === 'dropdown'" class="mt-2 p-2 bg-light rounded-2 border">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <label class="form-label small fw-bold mb-0 text-dark">
                            Opsi Pilihan (Min. 2 Opsi) <span class="text-danger">*</span>
                          </label>
                          <button
                            type="button"
                            class="btn btn-xs btn-outline-primary py-0 px-2"
                            style="font-size: 0.75rem;"
                            @click="addOption(field)"
                          >
                            <i class="bi bi-plus"></i> Tambah Opsi
                          </button>
                        </div>

                        <div class="d-flex flex-column gap-1">
                          <div
                            v-for="(opt, optIdx) in field.options"
                            :key="optIdx"
                            class="input-group input-group-sm"
                          >
                            <span class="input-group-text bg-white">{{ optIdx + 1 }}</span>
                            <input
                              v-model="field.options[optIdx]"
                              type="text"
                              class="form-control"
                              placeholder="Ketik opsi..."
                              required
                            />
                            <button
                              type="button"
                              class="btn btn-outline-danger"
                              :disabled="field.options.length <= 2"
                              @click="removeOption(field, optIdx)"
                            >
                              <i class="bi bi-x"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tombol Tambah Pertanyaan (BR-06) -->
                <button
                  type="button"
                  class="btn btn-outline-primary w-100 rounded-3 mt-3 py-2 fw-semibold"
                  :disabled="!canAddField"
                  @click="addField"
                >
                  <i class="bi bi-plus-circle me-1"></i>
                  {{ canAddField ? 'Tambah Pertanyaan Kustom' : 'Batas Maksimal 10 Pertanyaan Tercapai' }}
                </button>
              </div>

              <!-- Footer Aksi Simpan -->
              <div class="card-footer bg-white p-3 border-top">
                <div class="d-grid gap-2">
                  <button
                    type="button"
                    class="btn btn-success fw-bold py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center"
                    :disabled="isSubmitting"
                    @click="handleSubmit(true)"
                  >
                    <i class="bi bi-credit-card me-2"></i>
                    Simpan & Lanjut Bayar Sewa (Rp50.000)
                  </button>

                  <div class="row g-2">
                    <div class="col-6">
                      <router-link to="/organizer/events" class="btn btn-outline-secondary w-100 py-2 rounded-3">
                        Batal
                      </router-link>
                    </div>
                    <div class="col-6">
                      <button
                        type="submit"
                        class="btn btn-primary w-100 py-2 rounded-3 fw-semibold"
                        :disabled="isSubmitting"
                      >
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                        Simpan Draft
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- TAB 2: LIVE PREVIEW TAMPILAN PESERTA -->
    <div v-show="activeTab === 'preview'" class="container" style="max-width: 800px;">
      <div class="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
        <!-- Banner Preview -->
        <div style="height: 260px; position: relative;">
          <img
            :src="form.banner_url || presetBanners[0]"
            alt="Event Banner"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
          <div class="position-absolute top-0 start-0 w-100 h-100" style="background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8));"></div>
          <div class="position-absolute bottom-0 start-0 p-4 text-white">
            <span class="badge bg-primary mb-2">
              {{ categories.find(c => c.id === form.category_id)?.name || 'Kategori' }}
            </span>
            <h3 class="fw-bold mb-1">{{ form.title || 'Judul Event Anda' }}</h3>
            <p class="small mb-0 opacity-75">
              <i class="bi bi-geo-alt me-1"></i> {{ form.location || 'Lokasi Acara' }} &bull;
              <i class="bi bi-people ms-2 me-1"></i> Kuota: {{ form.quota }} Peserta
            </p>
          </div>
        </div>

        <!-- Form Registration Simulation Preview -->
        <div class="card-body p-4 p-md-5">
          <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
            <i class="bi bi-card-checklist fs-2 text-primary me-3"></i>
            <div>
              <h5 class="fw-bold mb-0">Formulir Pendaftaran Peserta</h5>
              <p class="text-muted small mb-0">Ini adalah tampilan yang akan dilihat dan diisi oleh peserta saat mendaftar ke acara Anda.</p>
            </div>
          </div>

          <!-- Empty Preview -->
          <div v-if="formFields.length === 0" class="text-center py-4 bg-light rounded-3 text-muted">
            <i class="bi bi-emoji-smile fs-3 mb-2 d-block"></i>
            Tidak ada kolom pertanyaan kustom. Peserta akan langsung terdaftar dengan akun EventHub mereka.
          </div>

          <!-- Simulated Field Inputs -->
          <div v-else class="d-flex flex-column gap-3">
            <div v-for="(f, fIdx) in formFields" :key="f.id" class="mb-2">
              <label class="form-label fw-semibold">
                {{ fIdx + 1 }}. {{ f.label || `Pertanyaan #${fIdx + 1}` }}
                <span v-if="f.is_required" class="text-danger">*</span>
                <span v-else class="badge bg-light text-muted fw-normal ms-1">Opsional</span>
              </label>

              <!-- Text -->
              <input
                v-if="f.field_type === 'text'"
                type="text"
                class="form-control"
                :placeholder="f.placeholder || 'Isian teks...'"
                disabled
              />

              <!-- Textarea -->
              <textarea
                v-else-if="f.field_type === 'textarea'"
                rows="3"
                class="form-control"
                :placeholder="f.placeholder || 'Isian teks panjang...'"
                disabled
              ></textarea>

              <!-- Number -->
              <input
                v-else-if="f.field_type === 'number'"
                type="number"
                class="form-control"
                :placeholder="f.placeholder || 'Contoh: 12345'"
                disabled
              />

              <!-- Dropdown -->
              <select
                v-else-if="f.field_type === 'dropdown'"
                class="form-select"
                disabled
              >
                <option value="">-- Pilih salah satu --</option>
                <option v-for="(opt, oIdx) in f.options" :key="oIdx" :value="opt">
                  {{ opt }}
                </option>
              </select>
            </div>

            <!-- Simulated Submit CTA -->
            <button type="button" class="btn btn-primary rounded-pill py-2 mt-3 fw-bold" disabled>
              Kirim Pendaftaran & Dapatkan E-Tiket
            </button>
          </div>
        </div>

        <div class="card-footer bg-light p-3 text-center">
          <button type="button" class="btn btn-outline-primary btn-sm" @click="activeTab = 'editor'">
            <i class="bi bi-arrow-left me-1"></i> Kembali ke Form Editor untuk Melakukan Perubahan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-card {
  transition: all 0.2s ease-in-out;
  border-color: #dee2e6;
}
.field-card:hover {
  border-color: #0d6efd;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.08);
}
</style>
