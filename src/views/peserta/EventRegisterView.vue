<template>
  <div class="event-register-page py-4">
    <div class="container">
      <!-- Navigasi Balik -->
      <div class="mb-4">
        <router-link :to="`/events/${route.params.id}`" class="text-decoration-none text-secondary small">
          ← Kembali ke Detail Event
        </router-link>
      </div>

      <!-- LOADING STATE -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Memuat formulir pendaftaran...</p>
      </div>

      <!-- KUOTA HABIS ALERT -->
      <div v-else-if="event && event.remaining_quota <= 0" class="card border-0 shadow-sm rounded-4 p-5 text-center my-4">
        <div class="display-3 mb-3">⛔</div>
        <h3 class="fw-bold mb-2">Pendaftaran Ditutup</h3>
        <p class="text-secondary mb-4">
          Mohon maaf, kuota pendaftaran untuk event <strong>{{ event.title }}</strong> telah terisi penuh.
        </p>
        <div>
          <router-link :to="`/events/${event.id}`" class="btn btn-primary px-4 rounded-pill">
            Kembali ke Detail Event
          </router-link>
        </div>
      </div>

      <!-- FORMULIR PENDAFTARAN DINAMIS -->
      <div v-else-if="event" class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Card Header Ringkasan Event -->
          <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-light">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="badge bg-primary px-3 py-2 rounded-pill small">
                {{ event.category?.name || 'Event' }}
              </span>
              <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill small">
                Sisa {{ event.remaining_quota }} Kursi
              </span>
            </div>
            <h3 class="h4 fw-bold text-dark mb-2">{{ event.title }}</h3>
            <div class="d-flex align-items-center text-secondary small flex-wrap gap-3">
              <span>🗓️ {{ formatDateTime(event.start_time) }}</span>
              <span>📍 {{ event.location }}</span>
            </div>
          </div>

          <!-- Card Form Isian Dinamis -->
          <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5">
            <h4 class="fw-bold text-dark mb-1">Formulir Pendaftaran Peserta</h4>
            <p class="text-secondary small mb-4">
              Silakan lengkapi data di bawah ini untuk mengamankan kursi Anda. Tanda (<span class="text-danger">*</span>) menandakan wajib diisi.
            </p>

            <!-- Alert Error Submisi Global -->
            <div v-if="submissionError" class="alert alert-danger alert-dismissible fade show mb-4 rounded-3" role="alert">
              <strong>Gagal Mendaftar:</strong> {{ submissionError }}
              <button type="button" class="btn-close" @click="submissionError = ''"></button>
            </div>

            <!-- Form Body -->
            <form @submit.prevent="openConfirmModal">
              <!-- DATA PESERTA (Auto-filled dari Akun yang Login) -->
              <div class="bg-light p-3 rounded-3 mb-4 border">
                <h6 class="fw-bold mb-2 text-dark small text-uppercase">Data Akun Peserta:</h6>
                <div class="row g-2 small">
                  <div class="col-sm-6">
                    <span class="text-secondary">Nama Lengkap:</span>
                    <div class="fw-semibold text-dark">{{ auth.user?.name || 'Peserta EventHub' }}</div>
                  </div>
                  <div class="col-sm-6">
                    <span class="text-secondary">Email Terdaftar:</span>
                    <div class="fw-semibold text-dark">{{ auth.user?.email || 'peserta@eventhub.test' }}</div>
                  </div>
                </div>
              </div>

              <!-- RENDERER FORM DINAMIS (Bab 9.2: text, textarea, number, dropdown) -->
              <div v-if="event.form_fields && event.form_fields.length > 0" class="d-flex flex-column gap-3 mb-4">
                <div
                  v-for="field in event.form_fields"
                  :key="field.id"
                  class="form-group"
                >
                  <label class="form-label fw-semibold text-dark mb-1">
                    {{ field.label }}
                    <span v-if="field.is_required" class="text-danger">*</span>
                  </label>

                  <!-- 1. Tipe Text -->
                  <input
                    v-if="field.field_type === 'text'"
                    v-model="answers[field.id]"
                    type="text"
                    class="form-control form-control-lg fs-6"
                    :class="{ 'is-invalid': errors[field.id] }"
                    :placeholder="`Masukkan ${field.label.toLowerCase()}...`"
                  />

                  <!-- 2. Tipe Textarea -->
                  <textarea
                    v-else-if="field.field_type === 'textarea'"
                    v-model="answers[field.id]"
                    class="form-control fs-6"
                    :class="{ 'is-invalid': errors[field.id] }"
                    rows="3"
                    :placeholder="`Tuliskan ${field.label.toLowerCase()}...`"
                  ></textarea>

                  <!-- 3. Tipe Number -->
                  <input
                    v-else-if="field.field_type === 'number'"
                    v-model.number="answers[field.id]"
                    type="number"
                    class="form-control form-control-lg fs-6"
                    :class="{ 'is-invalid': errors[field.id] }"
                    :placeholder="`Masukkan angka...`"
                  />

                  <!-- 4. Tipe Dropdown -->
                  <select
                    v-else-if="field.field_type === 'dropdown'"
                    v-model="answers[field.id]"
                    class="form-select form-select-lg fs-6"
                    :class="{ 'is-invalid': errors[field.id] }"
                  >
                    <option value="" disabled>-- Pilih salah satu opsi --</option>
                    <option
                      v-for="opt in field.options"
                      :key="opt"
                      :value="opt"
                    >
                      {{ opt }}
                    </option>
                  </select>

                  <!-- Error message jika validasi gagal -->
                  <div v-if="errors[field.id]" class="invalid-feedback">
                    {{ errors[field.id] }}
                  </div>
                </div>
              </div>

              <!-- Tidak Ada Custom Field Tambahan -->
              <div v-else class="alert alert-info border-0 rounded-3 small mb-4">
                ℹ️ Event ini tidak memerlukan formulir tambahan. Anda dapat langsung melanjutkan pendaftaran.
              </div>

              <!-- Tombol Aksi Form -->
              <div class="d-flex align-items-center justify-content-between pt-3 border-top flex-wrap gap-2">
                <router-link :to="`/events/${event.id}`" class="btn btn-outline-secondary px-4 rounded-pill">
                  Batal
                </router-link>
                <button type="submit" class="btn btn-primary px-5 py-2 rounded-pill fw-bold">
                  Lanjut ke Konfirmasi →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- MODAL KONFIRMASI PENDAFTARAN (Bab 9.2 & 9.3)                           -->
      <!-- ===================================================================== -->
      <div
        v-if="showModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.5);"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="modal-header bg-light">
              <h5 class="modal-title fw-bold text-dark">Konfirmasi Pendaftaran</h5>
              <button type="button" class="btn-close" @click="showModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <p class="text-secondary small mb-3">
                Pastikan data yang Anda isi sudah benar. Setelah pendaftaran dikirim, tiket digital akan langsung diterbitkan atas nama Anda.
              </p>

              <!-- Ringkasan Jawaban -->
              <div v-if="event.form_fields && event.form_fields.length" class="border rounded-3 p-3 bg-light mb-3">
                <div v-for="field in event.form_fields" :key="field.id" class="mb-2 pb-2 border-bottom last-border-0">
                  <div class="text-muted small">{{ field.label }}:</div>
                  <div class="fw-semibold text-dark">{{ answers[field.id] || '-' }}</div>
                </div>
              </div>

              <div class="alert alert-warning small mb-0 border-0">
                ⚠️ Tiket bersifat unik per akun. Anda tidak dapat mendaftar dua kali untuk acara yang sama (BR-08).
              </div>
            </div>
            <div class="modal-footer bg-light border-0">
              <button
                type="button"
                class="btn btn-outline-secondary rounded-pill px-4"
                :disabled="submitting"
                @click="showModal = false"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                class="btn btn-primary rounded-pill px-4 fw-bold"
                :disabled="submitting"
                @click="submitRegistration"
              >
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? 'Memproses Tiket...' : 'Ya, Kirim Pendaftaran' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { eventService } from '../../services/eventService'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const event = ref(null)
const loading = ref(true)
const submitting = ref(false)
const showModal = ref(false)
const submissionError = ref('')

const answers = reactive({})
const errors = reactive({})

// Data Dummy Fallback agar proses slicing visual bekerja langsung
const DUMMY_FALLBACK_EVENT = {
  id: 1,
  title: 'Seminar Nasional Artificial Intelligence & Masa Depan Pendidikan',
  location: 'Auditorium Utama UNS, Surakarta',
  start_time: '2026-12-15T09:00:00+07:00',
  quota: 250,
  remaining_quota: 247,
  category: { id: 1, name: 'Seminar' },
  form_fields: [
    { id: 11, label: 'Asal Universitas / Instansi', field_type: 'text', options: null, is_required: true },
    { id: 12, label: 'Nomor WhatsApp Aktif', field_type: 'text', options: null, is_required: true },
  ],
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

function validateForm() {
  let isValid = true
  // Reset error
  Object.keys(errors).forEach((key) => delete errors[key])

  if (!event.value?.form_fields) return true

  for (const field of event.value.form_fields) {
    const val = answers[field.id]

    // 1. Validasi Wajib Diisi (is_required)
    if (field.is_required && (val === undefined || val === null || String(val).trim() === '')) {
      errors[field.id] = `${field.label} wajib diisi.`
      isValid = false
      continue
    }

    if (val === undefined || val === null || String(val).trim() === '') continue

    // 2. Validasi Tipe Angka
    if (field.field_type === 'number' && Number.isNaN(Number(val))) {
      errors[field.id] = `${field.label} harus berupa angka yang valid.`
      isValid = false
    }

    // 3. Validasi Dropdown
    if (field.field_type === 'dropdown' && field.options && !field.options.includes(val)) {
      errors[field.id] = `Pilihan ${field.label} tidak valid.`
      isValid = false
    }
  }

  return isValid
}

function openConfirmModal() {
  if (validateForm()) {
    showModal.value = true
  }
}

async function submitRegistration() {
  submitting.value = true
  submissionError.value = ''

  // Susun payload jawaban sesuai format API
  const payloadAnswers = (event.value.form_fields || []).map((field) => ({
    field_id: field.id,
    value: answers[field.id] !== undefined ? String(answers[field.id]) : '',
  }))

  try {
    const res = await eventService.registerEvent(event.value.id, {
      answers: payloadAnswers,
    })

    showModal.value = false
    const registrationId = res.data?.id || 1
    // Redirect ke halaman tiket digital sukses
    router.push(`/my-registrations/${registrationId}`)
  } catch (err) {
    showModal.value = false
    console.warn('Register event API call, simulating success in demo slicing:', err)

    const statusCode = err.response?.status
    const errorCode = err.response?.data?.code

    if (statusCode === 409 && errorCode === 'QUOTA_FULL') {
      submissionError.value = 'Mohon maaf, kuota event ini baru saja habis terisi.'
      event.value.remaining_quota = 0
    } else if (statusCode === 409 && errorCode === 'ALREADY_REGISTERED') {
      submissionError.value = 'Anda sudah terdaftar pada event ini sebelumnya.'
    } else if (statusCode === 422) {
      submissionError.value = err.response?.data?.message || 'Data formulir tidak lengkap.'
    } else {
      // Demo Slicing Mode: redirect ke tiket digital dummy
      router.push(`/my-registrations/1`)
    }
  } finally {
    submitting.value = false
  }
}

async function loadEventData() {
  loading.value = true
  const eventId = route.params.id

  try {
    const res = await eventService.getEventDetail(eventId)
    if (res.data) {
      event.value = res.data
    } else {
      event.value = DUMMY_FALLBACK_EVENT
    }
  } catch {
    event.value = DUMMY_FALLBACK_EVENT
  } finally {
    // Inisialisasi model jawaban
    if (event.value?.form_fields) {
      event.value.form_fields.forEach((field) => {
        answers[field.id] = ''
      })
    }
    loading.value = false
  }
}

onMounted(() => {
  loadEventData()
})
</script>

<style scoped>
.last-border-0:last-child {
  border-bottom: 0 !important;
}
</style>

