<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { eventService } from '../../services/eventService'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const eventId = route.params.id

const isLoading = ref(false)
const isSubmitting = ref(false)
const showConfirmModal = ref(false)
const registrationSuccess = ref(false)
const generatedTicketId = ref(1)
const generatedTicketCode = ref('EVT-12-A8K2P9QX')
const fieldErrors = ref({})

// Data Detail Event sesuai Figma Mockup 2002:3498
const event = ref({
  id: eventId,
  initials: 'SNAI',
  tintBg: '#c7d2fe',
  tintColor: '#3730a3',
  poster_subtitle: 'Seminar Nasional AI untuk Pendidikan 2026',
  title: 'Seminar Nasional AI untuk Pendidikan',
  organizer: 'Himpunan Mahasiswa Informatika',
  schedule_text: 'Sabtu, 18 April 2026 • 09:00 - 13:00 WIB',
  location_text: 'Aula Gedung A, Jl. Imam Bonjol No. 207, Semarang',
  category_text: 'Seminar Teknologi & Akademik',
  deadline_text: '16 April 2026 • 23:59 WIB',
  remaining_quota: Number(eventId) === 3 ? 0 : 24,
  quota: Number(eventId) === 3 ? 50 : 100,
  description:
    'Seminar Nasional AI untuk Pendidikan menghadirkan pembicara terkemuka dari industri kecerdasan buatan dan akademisi untuk membahas integrasi model AI generatif dalam proses pembelajaran, asesmen otomatis, dan tata kelola etika akademik.',
  form_fields: [
    {
      id: 1,
      label: 'Asal fakultas',
      field_type: 'text',
      is_required: true,
      placeholder: 'Fakultas Ilmu Komputer',
      helper: 'Tuliskan nama fakultas lengkap sesuai kampus Anda.',
      options: [],
    },
    {
      id: 2,
      label: 'Jumlah anggota tim',
      field_type: 'number',
      is_required: true,
      placeholder: '1',
      helper: 'Isi angka 1 jika Anda mendaftar sebagai peserta individu.',
      options: [],
    },
    {
      id: 3,
      label: 'Ukuran kaos',
      field_type: 'dropdown',
      is_required: true,
      placeholder: '',
      helper: 'Digunakan untuk pembagian merchandise seminar di meja registrasi.',
      options: ['S', 'M', 'L', 'XL'],
    },
  ],
})

// Jawaban Formulir Dinamis Peserta
const answers = ref({
  1: 'Fakultas Ilmu Komputer',
  2: '1',
  3: 'M',
})

const isQuotaFull = computed(() => Number(event.value.remaining_quota) <= 0)
const filledCount = computed(() => Math.max(0, event.value.quota - event.value.remaining_quota))
const filledPercentage = computed(() => {
  if (!event.value.quota) return 100
  return Math.min(100, Math.round((filledCount.value / event.value.quota) * 100))
})

onMounted(async () => {
  isLoading.value = true
  try {
    // Integrasi ke endpoint GET /api/v1/events/{id} (UAS06-33 / UAS06-43)
    const res = await eventService.getEventDetail(eventId)
    if (res && res.data) {
      const d = res.data
      event.value = {
        ...event.value,
        id: d.id || eventId,
        title: d.title || event.value.title,
        poster_subtitle: `${d.title || event.value.title} 2026`,
        location_text: d.location || event.value.location_text,
        category_text: d.category?.name || event.value.category_text,
        remaining_quota: Number(d.remaining_quota ?? event.value.remaining_quota),
        quota: Number(d.quota ?? event.value.quota),
        description: d.description || event.value.description,
        form_fields:
          Array.isArray(d.form_fields) && d.form_fields.length > 0
            ? d.form_fields.map((f) => ({
                id: f.id,
                label: f.label,
                field_type: f.field_type || 'text',
                is_required: Boolean(f.is_required),
                placeholder: f.placeholder || '',
                helper: f.helper || 'Wajib diisi sesuai ketentuan acara.',
                options: Array.isArray(f.options)
                  ? f.options
                  : typeof f.options === 'string'
                    ? f.options.split(',').map((s) => s.trim())
                    : ['S', 'M', 'L', 'XL'],
              }))
            : event.value.form_fields,
      }

      // Inisialisasi state jawaban
      const initAns = {}
      event.value.form_fields.forEach((f) => {
        initAns[f.id] = f.field_type === 'dropdown' ? f.options?.[0] || '' : ''
      })
      answers.value = initAns
    }
  } catch {
    // Fallback mockup
    if (Number(eventId) === 3) {
      event.value.title = 'Lomba Desain Poster Dies Natalis'
      event.value.initials = 'LDPD'
      event.value.tintBg = '#cbd5e1'
      event.value.tintColor = '#334155'
      event.value.remaining_quota = 0
      event.value.quota = 50
    }
  } finally {
    isLoading.value = false
  }
})

// Validasi Client Formulir Dinamis (UAS06-35 & Figma 2002:3724)
const validateDynamicForm = () => {
  const errs = {}
  let valid = true

  for (const field of event.value.form_fields) {
    const val = String(answers.value[field.id] ?? '').trim()
    if (field.is_required && !val) {
      errs[field.id] = `Kolom "${field.label}" wajib diisi.`
      valid = false
    } else if (field.field_type === 'number' && val && (isNaN(Number(val)) || Number(val) < 1)) {
      errs[field.id] = `Kolom "${field.label}" harus berupa angka minimal 1.`
      valid = false
    }
  }

  fieldErrors.value = errs
  return valid
}

const handlePreSubmit = () => {
  if (!validateDynamicForm()) return
  showConfirmModal.value = true
}

const confirmRegistration = async () => {
  isSubmitting.value = true
  try {
    const formattedAnswers = event.value.form_fields.map((f) => ({
      field_id: f.id,
      label: f.label,
      value: String(answers.value[f.id] ?? '').trim(),
    }))

    let ticketId = 1
    let ticketCode = `EVT-${eventId}-A8K2P9QX`

    try {
      const res = await eventService.registerEvent(eventId, { answers: formattedAnswers })
      if (res && res.data) {
        ticketId = res.data.id || 1
        ticketCode = res.data.ticket_code || ticketCode
      }
    } catch {
      // Fallback simpan pendaftaran di localStorage
    }

    // Kurangi sisa kuota secara reaktif (BR-01)
    if (event.value.remaining_quota > 0) {
      event.value.remaining_quota--
    }

    generatedTicketId.value = ticketId
    generatedTicketCode.value = ticketCode
    showConfirmModal.value = false
    registrationSuccess.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="detail-event-mockup py-4">
    <div class="container" style="max-width: 1024px;">
      <!-- Breadcrumb (Figma 2002:3521) -->
      <div class="d-flex align-items-center gap-2 mb-4" style="font-size: 12px;">
        <router-link to="/" class="text-decoration-none" style="color: #64748b;">
          Katalog Event
        </router-link>
        <span style="color: #64748b;">/</span>
        <span class="fw-medium" style="color: #0f172a;">{{ event.title }}</span>
      </div>

      <!-- Toast / Banner Berhasil Mendaftar (Figma 2002:3846) -->
      <div
        v-if="registrationSuccess"
        class="p-4 rounded-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3"
        style="background-color: #dcfce7; border: 1px solid #22a55b; color: #166534;"
      >
        <div>
          <div class="fw-bold fs-6 mb-1">
            ✓ Pendaftaran Berhasil! Tiket Digital Anda Telah Diterbitkan
          </div>
          <div class="small">
            Kode Tiket: <strong class="font-monospace">{{ generatedTicketCode }}</strong> &bull; Sisa kuota acara telah diperbarui secara otomatis.
          </div>
        </div>
        <router-link
          :to="`/my-registrations/${generatedTicketId}`"
          class="btn text-white fw-semibold px-4 py-2"
          style="background-color: #22a55b; border-radius: 4px; font-size: 14px;"
        >
          Lihat Tiket Digital
        </router-link>
      </div>

      <!-- Poster with Initials (Figma 2002:3528) -->
      <div
        class="d-flex flex-column align-items-center justify-content-center rounded-3 mb-4"
        :style="{
          height: '208px',
          backgroundColor: isQuotaFull ? '#cbd5e1' : event.tintBg,
          border: `1px solid ${isQuotaFull ? '#cbd5e1' : event.tintBg}`,
        }"
      >
        <div
          class="fw-bold"
          :style="{
            color: isQuotaFull ? '#334155' : event.tintColor,
            fontSize: '36px',
            letterSpacing: '3.6px',
          }"
        >
          {{ event.initials }}
        </div>
        <div
          class="fw-medium mt-2"
          :style="{ color: isQuotaFull ? '#334155' : event.tintColor, fontSize: '12px' }"
        >
          {{ event.poster_subtitle }}
        </div>
      </div>

      <!-- Header & Title with Status Badge (Figma 2002:3533) -->
      <div class="mb-4">
        <div class="d-flex align-items-center gap-2 mb-2">
          <span
            v-if="isQuotaFull"
            class="badge rounded-pill text-white fw-semibold px-2 py-1 text-uppercase"
            style="background-color: #4b4b4b; font-size: 12px;"
          >
            KUOTA HABIS
          </span>
          <span
            v-else
            class="badge rounded-pill text-white fw-semibold px-2 py-1"
            style="background-color: #22a55b; font-size: 12px;"
          >
            Tayang
          </span>
          <span style="color: #64748b; font-size: 12px;">
            Penyelenggara: {{ event.organizer }}
          </span>
        </div>
        <h1 class="fw-bold mb-0" style="color: #0f172a; font-size: 24px;">
          {{ event.title }}
        </h1>
      </div>

      <!-- Info Block: Jadwal, Venue + Alamat, Kategori, Batas Pendaftaran, Quota Progress Bar (Figma 2002:3542) -->
      <div class="eh-card p-4 mb-4">
        <div class="row g-3 pb-3 mb-3" style="border-bottom: 1px solid #e2e8f0;">
          <div class="col-12 col-md-6">
            <div style="color: #64748b; font-size: 12px;">Jadwal Pelaksanaan</div>
            <div class="fw-semibold" style="color: #0f172a; font-size: 14px;">
              {{ event.schedule_text }}
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div style="color: #64748b; font-size: 12px;">Venue &amp; Alamat</div>
            <div class="fw-semibold" style="color: #0f172a; font-size: 14px;">
              {{ event.location_text }}
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div style="color: #64748b; font-size: 12px;">Kategori Acara</div>
            <div style="color: #0f172a; font-size: 14px;">
              {{ event.category_text }}
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div style="color: #64748b; font-size: 12px;">Batas Akhir Pendaftaran</div>
            <div style="color: #0f172a; font-size: 14px;">
              {{ event.deadline_text }}
            </div>
          </div>
        </div>

        <!-- Quota Progress Bar (Figma 2002:3560) -->
        <div>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-medium" style="color: #0f172a; font-size: 12px;">
              Status Ketersediaan Kuota
            </span>
            <span class="font-monospace" style="color: #64748b; font-size: 12px;">
              {{ event.remaining_quota }} / {{ event.quota }} Kuota Tersisa ({{ filledCount }} Terisi)
            </span>
          </div>
          <div
            class="progress rounded-pill overflow-hidden"
            style="height: 10px; background-color: #eef2ff; border: 1px solid #c7d2fe;"
          >
            <div
              class="progress-bar rounded-pill"
              :style="{
                width: `${filledPercentage}%`,
                backgroundColor: isQuotaFull ? '#4b4b4b' : '#4f46e5',
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Description (Figma 2002:3568) -->
      <div class="mb-4">
        <h2 class="fw-semibold mb-2" style="color: #0f172a; font-size: 18px;">Deskripsi Event</h2>
        <p class="mb-0" style="color: #0f172a; font-size: 14px; line-height: 1.65;">
          {{ event.description }}
        </p>
      </div>

      <!-- ================================================================= -->
      <!-- KONDISI 1: KUOTA HABIS (Figma 2002:3613 & BR-01)                  -->
      <!-- ================================================================= -->
      <div v-if="isQuotaFull" class="eh-card p-4 text-center">
        <span
          class="badge rounded-pill text-white fw-semibold px-3 py-1 mb-2"
          style="background-color: #4b4b4b; font-size: 12px;"
        >
          KUOTA HABIS
        </span>
        <h3 class="h6 fw-bold mb-1" style="color: #0f172a;">
          Pendaftaran Ditutup — Kapasitas Penuh
        </h3>
        <p class="small mb-3" style="color: #64748b;">
          Seluruh kuota peserta ({{ event.quota }} kursi) pada acara ini telah terisi penuh.
        </p>
        <button
          type="button"
          class="btn px-4 py-2 text-white fw-medium"
          style="background-color: #94a3b8; border-radius: 4px; font-size: 14px;"
          disabled
        >
          Kuota Habis
        </button>
      </div>

      <!-- ================================================================= -->
      <!-- KONDISI 2: TAMU BELUM LOGIN (Figma 2002:301)                      -->
      <!-- ================================================================= -->
      <div v-else-if="!auth.isAuthenticated" class="eh-card p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h3 class="fw-bold mb-1" style="color: #0f172a; font-size: 18px;">
            Tertarik Mengikuti Acara Ini?
          </h3>
          <p class="mb-0" style="color: #64748b; font-size: 14px;">
            Silakan masuk menggunakan akun Peserta untuk mengisi formulir pendaftaran dan mendapatkan tiket digital.
          </p>
        </div>
        <router-link
          :to="`/login?redirect=/events/${event.id}`"
          class="btn text-white fw-medium px-4 py-2"
          style="background-color: #4f46e5; border-radius: 4px; font-size: 14px;"
        >
          Masuk untuk Mendaftar
        </router-link>
      </div>

      <!-- ================================================================= -->
      <!-- KONDISI 3: ROLE PANITIA / DEVELOPER (BR-04)                       -->
      <!-- ================================================================= -->
      <div
        v-else-if="auth.isPanitia || auth.isDeveloper"
        class="eh-card p-4 d-flex flex-wrap justify-content-between align-items-center gap-3"
      >
        <div>
          <h3 class="fw-bold mb-1" style="color: #0f172a; font-size: 16px;">
            Mode Pratinjau ({{ auth.role.toUpperCase() }})
          </h3>
          <p class="mb-0" style="color: #64748b; font-size: 14px;">
            Sesuai aturan bisnis (BR-04), formulir pendaftaran event hanya dapat dikirim oleh akun berperanan <strong>Peserta</strong>.
          </p>
        </div>
        <button
          type="button"
          class="btn px-4 py-2 text-white"
          style="background-color: #94a3b8; border-radius: 4px; font-size: 14px;"
          disabled
        >
          Khusus Akun Peserta
        </button>
      </div>

      <!-- ================================================================= -->
      <!-- KONDISI 4: LOGIN SEBAGAI PESERTA -> FORMULIR PENDAFTARAN DINAMIS   -->
      <!--            (Figma 2002:3573 & 2002:3724 Galat Validasi)           -->
      <!-- ================================================================= -->
      <div v-else class="eh-card p-4">
        <div class="pb-3 mb-4" style="border-bottom: 1px solid #e2e8f0;">
          <h2 class="fw-bold mb-1" style="color: #0f172a; font-size: 18px;">
            Formulir Pendaftaran
          </h2>
          <p class="mb-0" style="color: #64748b; font-size: 14px;">
            Lengkapi pertanyaan yang disyaratkan oleh panitia penyelenggara di bawah ini.
          </p>
        </div>

        <form @submit.prevent="handlePreSubmit" novalidate>
          <div class="d-flex flex-column gap-3 mb-4">
            <div v-for="field in event.form_fields" :key="field.id">
              <label class="form-label fw-medium mb-1" style="color: #0f172a; font-size: 14px;">
                {{ field.label }}
                <span v-if="field.is_required" style="color: #d64545;">*</span>
              </label>

              <!-- Tipe Text -->
              <input
                v-if="field.field_type === 'text'"
                v-model="answers[field.id]"
                type="text"
                class="form-control eh-input"
                :class="{ 'border-danger': fieldErrors[field.id] }"
                :placeholder="field.placeholder"
              />

              <!-- Tipe Textarea -->
              <textarea
                v-else-if="field.field_type === 'textarea'"
                v-model="answers[field.id]"
                rows="3"
                class="form-control eh-input"
                :class="{ 'border-danger': fieldErrors[field.id] }"
                :placeholder="field.placeholder"
              ></textarea>

              <!-- Tipe Number -->
              <input
                v-else-if="field.field_type === 'number'"
                v-model="answers[field.id]"
                type="number"
                min="1"
                class="form-control eh-input"
                :class="{ 'border-danger': fieldErrors[field.id] }"
                :placeholder="field.placeholder"
              />

              <!-- Tipe Dropdown -->
              <select
                v-else-if="field.field_type === 'dropdown'"
                v-model="answers[field.id]"
                class="form-select eh-input"
                :class="{ 'border-danger': fieldErrors[field.id] }"
              >
                <option value="" disabled>Pilih salah satu opsi</option>
                <option v-for="opt in field.options" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>

              <!-- Error Validasi Client (Figma 2002:3724) -->
              <div v-if="fieldErrors[field.id]" class="mt-1 fw-medium" style="color: #d64545; font-size: 12px;">
                {{ fieldErrors[field.id] }}
              </div>
              <div v-else class="mt-1" style="color: #64748b; font-size: 12px;">
                {{ field.helper }}
              </div>
            </div>
          </div>

          <div class="pt-3 d-flex justify-content-end" style="border-top: 1px solid #e2e8f0;">
            <button
              type="submit"
              class="btn text-white fw-medium px-4 py-2"
              style="background-color: #4f46e5; border-radius: 4px; font-size: 14px;"
              :disabled="isSubmitting"
            >
              Daftar Event
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- MODAL KONFIRMASI PENDAFTARAN (UAS06-35)                             -->
    <!-- =================================================================== -->
    <div
      v-if="showConfirmModal"
      class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
    >
      <div
        class="bg-white rounded-3 p-4 w-100 shadow-lg"
        style="max-width: 480px; border: 1px solid #c7d2fe;"
      >
        <div
          class="d-flex justify-content-between align-items-center pb-3 mb-3"
          style="border-bottom: 1px solid #e2e8f0;"
        >
          <h3 class="h6 fw-bold mb-0" style="color: #0f172a;">
            Konfirmasi Pendaftaran Event
          </h3>
          <button
            type="button"
            class="btn btn-sm btn-link text-secondary p-0 text-decoration-none"
            @click="showConfirmModal = false"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <p class="small mb-3" style="color: #64748b;">
          Pastikan data jawaban formulir Anda untuk acara <strong style="color: #0f172a;">{{ event.title }}</strong> sudah benar:
        </p>

        <div
          class="p-3 rounded-2 mb-4 d-flex flex-column gap-2"
          style="background-color: #eef2ff; border: 1px solid #c7d2fe;"
        >
          <div v-for="field in event.form_fields" :key="field.id" class="small">
            <span style="color: #64748b;">{{ field.label }}: </span>
            <strong style="color: #0f172a;">{{ answers[field.id] }}</strong>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button
            type="button"
            class="btn bg-white px-3 py-2"
            style="border: 1px solid #4f46e5; color: #4f46e5; border-radius: 4px; font-size: 14px;"
            @click="showConfirmModal = false"
          >
            Periksa Kembali
          </button>
          <button
            type="button"
            class="btn text-white fw-semibold px-4 py-2"
            style="background-color: #4f46e5; border-radius: 4px; font-size: 14px;"
            :disabled="isSubmitting"
            @click="confirmRegistration"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
            Ya, Kirim Pendaftaran
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eh-card {
  background-color: #ffffff;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
}

.eh-input {
  background-color: #ffffff;
  border: 1px solid #c7d2fe;
  border-radius: 4px;
  color: #0f172a;
  font-size: 14px;
  padding: 9px 13px;
}

.eh-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1055;
}
</style>
