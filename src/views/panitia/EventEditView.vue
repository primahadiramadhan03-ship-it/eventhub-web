<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { eventService } from '../../services/eventService'
import { categoryService } from '../../services/categoryService'

const route = useRoute()
const router = useRouter()
const eventId = route.params.id

// Loading & error state
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const activeTab = ref('editor') // 'editor' | 'preview'
const currentStatus = ref('draft')
const rejectionReason = ref('')

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
const formFields = ref([])
const MAX_FIELDS = 10 // Sesuai BR-06

// Computed
const fieldCount = computed(() => formFields.value.length)
const canAddField = computed(() => formFields.value.length < MAX_FIELDS)

// Load event data
onMounted(async () => {
  try {
    isLoading.value = true

    // Load categories
    try {
      const catRes = await categoryService.getCategories()
      if (catRes && catRes.data && catRes.data.length > 0) {
        categories.value = catRes.data
      }
    } catch (e) {
      console.warn('[EventEditView] Fallback kategori:', e.message)
    }

    // Load event detail from API or LocalStorage
    let eventData = null
    try {
      const res = await eventService.getOrganizerEventDetail(eventId)
      if (res && res.data) {
        eventData = res.data
      }
    } catch (e) {
      console.warn('[EventEditView] API detail offline, memeriksa localStorage:', e.message)
    }

    if (!eventData) {
      // Check local storage
      const localEvents = JSON.parse(localStorage.getItem('eventhub_local_events') || '[]')
      eventData = localEvents.find(e => String(e.id) === String(eventId))
    }

    // Default mock data jika belum ada di database
    if (!eventData) {
      eventData = {
        id: eventId,
        title: 'Workshop Vue 3 & Clean Architecture Frontend',
        category_id: 1,
        description: 'Pelajari implementasi arsitektur frontend modern menggunakan Vue 3, Pinia, dan RESTful API terintegrasi.',
        location: 'Lab Komputer 3, Gedung Vokasi UNS',
        quota: 80,
        start_date: '2026-11-20T09:00',
        end_date: '2026-11-20T13:00',
        banner_url: presetBanners[0],
        status: 'draft',
        rejection_reason: null,
        form_fields: [
          {
            id: 'f_1',
            order_index: 1,
            label: 'Nama Lengkap / Instansi',
            field_type: 'text',
            is_required: true,
            placeholder: 'Contoh: Budi Santoso / UNS',
            options: []
          },
          {
            id: 'f_2',
            order_index: 2,
            label: 'Tingkat Kemampuan Vue',
            field_type: 'dropdown',
            is_required: true,
            placeholder: '',
            options: ['Pemula (Baru Belajar)', 'Menengah (Pernah Membuat Project)', 'Mahir']
          }
        ]
      }
    }

    // Populate state
    form.value.title = eventData.title || ''
    form.value.category_id = eventData.category_id || categories.value[0]?.id || 1
    form.value.description = eventData.description || ''
    form.value.location = eventData.location || ''
    form.value.quota = eventData.quota || 50
    form.value.start_date = eventData.start_date ? eventData.start_date.substring(0, 16) : ''
    form.value.end_date = eventData.end_date ? eventData.end_date.substring(0, 16) : ''
    form.value.banner_url = eventData.banner_url || presetBanners[0]
    currentStatus.value = eventData.status || 'draft'
    rejectionReason.value = eventData.rejection_reason || ''

    if (eventData.form_fields && Array.isArray(eventData.form_fields)) {
      formFields.value = eventData.form_fields.map((f, i) => ({
        id: f.id || `f_${i}`,
        label: f.label || '',
        field_type: f.field_type || 'text',
        is_required: Boolean(f.is_required),
        placeholder: f.placeholder || '',
        options: Array.isArray(f.options) ? [...f.options] : (f.options ? JSON.parse(f.options) : ['Opsi 1', 'Opsi 2'])
      }))
    }

  } catch (err) {
    errorMessage.value = 'Gagal memuat data event: ' + err.message
  } finally {
    isLoading.value = false
  }
})

// Tambah pertanyaan baru
const addField = () => {
  if (!canAddField.value) return
  formFields.value.push({
    id: `f_${Date.now()}`,
    label: '',
    field_type: 'text',
    is_required: false,
    placeholder: '',
    options: ['Opsi 1', 'Opsi 2']
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
    return 'Lokasi acara wajib diisi.'
  }
  if (!form.value.quota || Number(form.value.quota) < 1) {
    return 'Kuota maksimal peserta minimal 1 orang.'
  }
  if (!form.value.start_date || !form.value.end_date) {
    return 'Tanggal mulai dan selesai wajib diisi.'
  }
  if (new Date(form.value.end_date) < new Date(form.value.start_date)) {
    return 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai (TC-07).'
  }

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

// Submit Perubahan
const handleUpdate = async () => {
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

    try {
      await eventService.updateOrganizerEvent(eventId, payload)
    } catch (apiErr) {
      console.warn('[EventEditView] API update offline, memperbarui localStorage:', apiErr.message)
    }

    // Update di localStorage
    const localEvents = JSON.parse(localStorage.getItem('eventhub_local_events') || '[]')
    const idx = localEvents.findIndex(e => String(e.id) === String(eventId))
    if (idx !== -1) {
      localEvents[idx] = {
        ...localEvents[idx],
        ...payload,
        updated_at: new Date().toISOString()
      }
      localStorage.setItem('eventhub_local_events', JSON.stringify(localEvents))
    }

    successMessage.value = 'Perubahan event dan formulir dinamis berhasil disimpan!'
    setTimeout(() => {
      router.push('/organizer/events')
    }, 1200)

  } catch (err) {
    errorMessage.value = err.message || 'Gagal menyimpan perubahan event.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="event-edit-view py-4">
    <!-- Header Title & Back Link -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
      <div>
        <router-link to="/organizer/events" class="text-decoration-none text-muted small d-inline-flex align-items-center mb-1">
          <i class="bi bi-arrow-left me-1"></i> Kembali ke Event Saya
        </router-link>
        <h2 class="h3 fw-bold mb-0 text-dark">Edit Event & Formulir Dinamis</h2>
        <p class="text-muted small mb-0">Ubah detail metadata dan kelola pertanyaan formulir untuk event #{{ eventId }}.</p>
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

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Memuat data...</span>
      </div>
      <p class="text-muted mt-2">Memuat data event dan formulir...</p>
    </div>

    <div v-else>
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

      <!-- Banner Status Ditolak jika ada (BR-13) -->
      <div v-if="currentStatus === 'ditolak'" class="alert alert-danger border-danger d-flex align-items-start mb-4">
        <i class="bi bi-x-circle-fill fs-4 text-danger me-3 mt-1"></i>
        <div>
          <strong class="d-block text-danger">Event Ini Ditolak oleh Developer:</strong>
          <span class="small">{{ rejectionReason || 'Silakan perbaiki informasi konten, banner, atau formulir sesuai catatan review sebelum diajukan kembali.' }}</span>
        </div>
      </div>

      <!-- TAB 1: FORM EDITOR -->
      <div v-show="activeTab === 'editor'">
        <form @submit.prevent="handleUpdate">
          <div class="row g-4">
            <!-- KOLOM KIRI: METADATA ACARA -->
            <div class="col-lg-7">
              <div class="card border-0 shadow-sm rounded-4 mb-4">
                <div class="card-header bg-white py-3 border-bottom">
                  <h5 class="fw-bold mb-0 text-dark">Informasi Acara (BR-05)</h5>
                </div>
                <div class="card-body p-4">
                  <!-- Judul Event -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Judul Event <span class="text-danger">*</span></label>
                    <input
                      v-model="form.title"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>

                  <!-- Kategori & Kuota -->
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Kategori Acara <span class="text-danger">*</span></label>
                      <select v-model="form.category_id" class="form-select" required>
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
                        required
                      />
                    </div>
                  </div>

                  <!-- Lokasi -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Lokasi / Tautan Acara <span class="text-danger">*</span></label>
                    <input
                      v-model="form.location"
                      type="text"
                      class="form-control"
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
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Poster Acara -->
              <div class="card border-0 shadow-sm rounded-4 mb-4">
                <div class="card-header bg-white py-3 border-bottom">
                  <h5 class="fw-bold mb-0 text-dark">Poster Acara</h5>
                </div>
                <div class="card-body p-4">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">URL Banner Poster</label>
                    <input
                      v-model="form.banner_url"
                      type="url"
                      class="form-control"
                    />
                  </div>

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

                  <div v-if="form.banner_url" class="text-center bg-light p-2 rounded-3">
                    <img
                      :src="form.banner_url"
                      alt="Preview Poster"
                      class="img-fluid rounded shadow-sm"
                      style="max-height: 180px; width: 100%; object-fit: cover;"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- KOLOM KANAN: FORM BUILDER DINAMIS -->
            <div class="col-lg-5">
              <div class="card border-0 shadow-sm rounded-4 mb-4 sticky-top" style="top: 85px; z-index: 10;">
                <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="fw-bold mb-0 text-dark">Formulir Dinamis</h5>
                    <small class="text-muted">Kelola kolom data pendaftaran</small>
                  </div>
                  <span
                    class="badge px-3 py-2 rounded-pill fs-6"
                    :class="fieldCount >= MAX_FIELDS ? 'bg-danger text-white' : 'bg-primary-subtle text-primary'"
                  >
                    {{ fieldCount }} / {{ MAX_FIELDS }} Pertanyaan
                  </span>
                </div>

                <div class="card-body p-3 p-md-4" style="max-height: calc(100vh - 280px); overflow-y: auto;">
                  <div v-if="formFields.length === 0" class="text-center py-4 bg-light rounded-4">
                    <i class="bi bi-journal-x fs-1 text-muted mb-2 d-block"></i>
                    <p class="text-muted small mb-3">Belum ada pertanyaan kustom.</p>
                    <button type="button" class="btn btn-sm btn-primary" @click="addField">
                      <i class="bi bi-plus-lg me-1"></i> Tambah Pertanyaan
                    </button>
                  </div>

                  <div v-else class="d-flex flex-column gap-3">
                    <div
                      v-for="(field, index) in formFields"
                      :key="field.id"
                      class="card border border-2 rounded-3 shadow-none"
                    >
                      <div class="card-header bg-light py-2 px-3 d-flex justify-content-between align-items-center">
                        <span class="fw-bold small text-secondary">
                          Pertanyaan #{{ index + 1 }}
                        </span>
                        <button
                          type="button"
                          class="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                          @click="removeField(index)"
                        >
                          <i class="bi bi-trash"></i> Hapus
                        </button>
                      </div>

                      <div class="card-body p-3">
                        <div class="mb-2">
                          <label class="form-label small fw-semibold mb-1">Pertanyaan / Label <span class="text-danger">*</span></label>
                          <input
                            v-model="field.label"
                            type="text"
                            class="form-control form-control-sm"
                            required
                          />
                        </div>

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
                                :id="`edit_req_${field.id}`"
                              />
                              <label class="form-check-label small fw-semibold" :for="`edit_req_${field.id}`">
                                Wajib
                              </label>
                            </div>
                          </div>
                        </div>

                        <div v-if="field.field_type !== 'dropdown'" class="mb-1">
                          <label class="form-label small text-muted mb-0">Contoh Placeholder:</label>
                          <input
                            v-model="field.placeholder"
                            type="text"
                            class="form-control form-control-sm"
                          />
                        </div>

                        <div v-if="field.field_type === 'dropdown'" class="mt-2 p-2 bg-light rounded-2 border">
                          <div class="d-flex justify-content-between align-items-center mb-1">
                            <label class="form-label small fw-bold mb-0 text-dark">
                              Opsi Pilihan (Min. 2) <span class="text-danger">*</span>
                            </label>
                            <button
                              type="button"
                              class="btn btn-xs btn-outline-primary py-0 px-2"
                              style="font-size: 0.75rem;"
                              @click="addOption(field)"
                            >
                              <i class="bi bi-plus"></i> Tambah
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

                  <button
                    type="button"
                    class="btn btn-outline-primary w-100 rounded-3 mt-3 py-2 fw-semibold"
                    :disabled="!canAddField"
                    @click="addField"
                  >
                    <i class="bi bi-plus-circle me-1"></i>
                    {{ canAddField ? 'Tambah Pertanyaan Kustom' : 'Maksimal 10 Pertanyaan' }}
                  </button>
                </div>

                <div class="card-footer bg-white p-3 border-top">
                  <div class="row g-2">
                    <div class="col-5">
                      <router-link to="/organizer/events" class="btn btn-outline-secondary w-100 py-2 rounded-3">
                        Batal
                      </router-link>
                    </div>
                    <div class="col-7">
                      <button
                        type="submit"
                        class="btn btn-primary w-100 py-2 rounded-3 fw-semibold"
                        :disabled="isSubmitting"
                      >
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                        Simpan Perubahan
                      </button>
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
              <h3 class="fw-bold mb-1">{{ form.title || 'Judul Event' }}</h3>
              <p class="small mb-0 opacity-75">
                <i class="bi bi-geo-alt me-1"></i> {{ form.location }} &bull;
                <i class="bi bi-people ms-2 me-1"></i> Kuota: {{ form.quota }} Peserta
              </p>
            </div>
          </div>

          <div class="card-body p-4 p-md-5">
            <h5 class="fw-bold mb-3 pb-2 border-bottom">Formulir Pendaftaran Peserta (Pratinjau)</h5>
            <div v-if="formFields.length === 0" class="text-center py-4 bg-light rounded-3 text-muted">
              Tidak ada kolom pertanyaan kustom.
            </div>
            <div v-else class="d-flex flex-column gap-3">
              <div v-for="(f, fIdx) in formFields" :key="f.id" class="mb-2">
                <label class="form-label fw-semibold">
                  {{ fIdx + 1 }}. {{ f.label }}
                  <span v-if="f.is_required" class="text-danger">*</span>
                  <span v-else class="badge bg-light text-muted fw-normal ms-1">Opsional</span>
                </label>
                <input
                  v-if="f.field_type === 'text'"
                  type="text"
                  class="form-control"
                  :placeholder="f.placeholder || 'Isian teks...'"
                  disabled
                />
                <textarea
                  v-else-if="f.field_type === 'textarea'"
                  rows="3"
                  class="form-control"
                  :placeholder="f.placeholder || 'Isian teks panjang...'"
                  disabled
                ></textarea>
                <input
                  v-else-if="f.field_type === 'number'"
                  type="number"
                  class="form-control"
                  disabled
                />
                <select
                  v-else-if="f.field_type === 'dropdown'"
                  class="form-select"
                  disabled
                >
                  <option value="">-- Pilih opsi --</option>
                  <option v-for="(opt, oIdx) in f.options" :key="oIdx" :value="opt">
                    {{ opt }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
