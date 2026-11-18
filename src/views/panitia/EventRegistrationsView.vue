<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { eventService } from '../../services/eventService'

const route = useRoute()
const eventId = route.params.id

const statusFilter = ref('all') // 'all' | 'registered' | 'attended'
const searchQuery = ref('')
const selectedParticipant = ref(null)

// Data Event sesuai Figma Mockup 2002:1305
const event = ref({
  id: eventId,
  code: `EVT-2026-${String(eventId).padStart(4, '0012')}`,
  title: 'Seminar Nasional AI untuk Pendidikan',
  subtitle: 'Sabtu, 18 April 2026 • 09:00 WIB • Aula Gedung A, Kampus Pusat',
  status: 'Tayang',
  registered_count: 76,
  quota: 100,
  attended_count: 52,
  remaining_quota: 24,
})

// Daftar Pendaftar sesuai Figma Mockup 2002:1407 & 2007:5915
const participants = ref([
  {
    id: 1,
    name: 'Aditya Pratama',
    email: 'aditya.pratama@mhs.kampus.ac.id',
    ticket_code: 'EVT-12-A8K2P9QX',
    registered_at: '14 Apr 2026, 10:24',
    registered_full: '14 April 2026, 10:24 WIB',
    status: 'Terdaftar',
    answers: [
      { label: '1. Asal fakultas', value: 'Fakultas Ilmu Komputer' },
      { label: '2. Jumlah anggota tim', value: '1 orang (Peserta Individu)' },
      { label: '3. Ukuran kaos', value: 'M (Medium)' },
    ],
  },
  {
    id: 2,
    name: 'Siti Nurhaliza',
    email: 'siti.nurhaliza@student.ac.id',
    ticket_code: 'EVT-12-B3J7M1NW',
    registered_at: '14 Apr 2026, 11:15',
    registered_full: '14 April 2026, 11:15 WIB',
    status: 'Hadir',
    answers: [
      { label: '1. Asal fakultas', value: 'Fakultas Teknik' },
      { label: '2. Jumlah anggota tim', value: '1 orang (Peserta Individu)' },
      { label: '3. Ukuran kaos', value: 'L (Large)' },
    ],
  },
  {
    id: 3,
    name: 'Rizky Maulana',
    email: 'rizky.maulana@itb.ac.id',
    ticket_code: 'EVT-12-C9K4P2LR',
    registered_at: '14 Apr 2026, 14:02',
    registered_full: '14 April 2026, 14:02 WIB',
    status: 'Hadir',
    answers: [
      { label: '1. Asal fakultas', value: 'Sekolah Teknik Elektro dan Informatika' },
      { label: '2. Jumlah anggota tim', value: '2 orang' },
      { label: '3. Ukuran kaos', value: 'XL (Extra Large)' },
    ],
  },
  {
    id: 4,
    name: 'Dewi Lestari',
    email: 'dewi.lestari@ui.ac.id',
    ticket_code: 'EVT-12-D8N5K3XW',
    registered_at: '15 Apr 2026, 09:12',
    registered_full: '15 April 2026, 09:12 WIB',
    status: 'Terdaftar',
    answers: [
      { label: '1. Asal fakultas', value: 'Fakultas Ilmu Komputer' },
      { label: '2. Jumlah anggota tim', value: '1 orang (Peserta Individu)' },
      { label: '3. Ukuran kaos', value: 'S (Small)' },
    ],
  },
  {
    id: 5,
    name: 'Bambang Wijaya',
    email: 'bambang.wijaya@undip.ac.id',
    ticket_code: 'EVT-12-E2R7T9PQ',
    registered_at: '15 Apr 2026, 16:45',
    registered_full: '15 April 2026, 16:45 WIB',
    status: 'Hadir',
    answers: [
      { label: '1. Asal fakultas', value: 'Fakultas Sains dan Matematika' },
      { label: '2. Jumlah anggota tim', value: '1 orang (Peserta Individu)' },
      { label: '3. Ukuran kaos', value: 'L (Large)' },
    ],
  },
])

onMounted(async () => {
  try {
    const res = await eventService.getOrganizerEventReport(eventId)
    if (res && res.data && res.data.participants) {
      participants.value = res.data.participants
    }
  } catch {
    // Fallback ke mockup default
  }
})

const filteredParticipants = computed(() => {
  return participants.value.filter((p) => {
    if (statusFilter.value === 'registered' && p.status !== 'Terdaftar') return false
    if (statusFilter.value === 'attended' && p.status !== 'Hadir') return false

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchName = p.name.toLowerCase().includes(q)
      const matchEmail = p.email.toLowerCase().includes(q)
      const matchCode = p.ticket_code.toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchCode) return false
    }
    return true
  })
})

const openAnswersModal = (participant) => {
  selectedParticipant.value = participant
}

// Ekspor Excel / CSV (US-17 & BR-16)
const exportExcel = () => {
  const headers = [
    'Nama Peserta',
    'Email',
    'Kode Tiket',
    'Waktu Daftar',
    'Status Kehadiran',
    '1. Asal Fakultas',
    '2. Jumlah Anggota Tim',
    '3. Ukuran Kaos',
  ]
  const rows = participants.value.map((p) => [
    p.name,
    p.email,
    p.ticket_code,
    p.registered_at,
    p.status,
    p.answers[0]?.value || '-',
    p.answers[1]?.value || '-',
    p.answers[2]?.value || '-',
  ])

  const csvContent = '\uFEFF' + [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Laporan_Pendaftar_${event.value.code}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="pendaftar-event-mockup py-2" style="max-width: 1152px;">
    <!-- Back Link (Figma 2002:1345) -->
    <div class="mb-3">
      <router-link
        to="/organizer/events"
        class="text-decoration-none d-inline-flex align-items-center gap-2 fw-medium"
        style="color: #64748b; font-size: 14px;"
      >
        <i class="bi bi-arrow-left"></i>
        <span>Kembali ke Kelola Event</span>
      </router-link>
    </div>

    <!-- Event Summary Header with Badge & Stats (Figma 2002:1349) -->
    <div class="eh-card p-4 mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 mb-3" style="border-bottom: 1px solid #e2e8f0;">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span
              class="badge rounded-pill text-white fw-semibold px-3 py-1"
              style="background-color: #22a55b; font-size: 12px;"
            >
              {{ event.status }}
            </span>
            <span class="font-monospace" style="color: #64748b; font-size: 12px;">
              ID: {{ event.code }}
            </span>
          </div>
          <h1 class="fw-bold mb-1" style="color: #0f172a; font-size: 32px; letter-spacing: -0.5px;">
            {{ event.title }}
          </h1>
          <div style="color: #64748b; font-size: 14px;">
            {{ event.subtitle }}
          </div>
        </div>

        <!-- Button 'Ekspor Excel (.xlsx)' (Figma 2002:1361) -->
        <button
          type="button"
          class="btn eh-btn-outline px-3 py-2 d-flex align-items-center gap-2"
          @click="exportExcel"
        >
          <i class="bi bi-file-earmark-spreadsheet"></i>
          <span>Ekspor Excel (.xlsx)</span>
        </button>
      </div>

      <!-- 3 Stats Boxes: Terdaftar 76 / 100, Hadir 52, Sisa 24 (Figma 2002:1366) -->
      <div class="row g-3">
        <div class="col-12 col-md-4">
          <div class="p-3 rounded-3" style="background-color: #eef2ff; border: 1px solid #c7d2fe;">
            <div style="color: #64748b; font-size: 12px;">Terdaftar</div>
            <div class="fw-bold" style="color: #0f172a; font-size: 24px; letter-spacing: -0.25px;">
              {{ event.registered_count }} / {{ event.quota }}
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="p-3 rounded-3" style="background-color: #eef2ff; border: 1px solid #c7d2fe;">
            <div style="color: #64748b; font-size: 12px;">Hadir (Check-in)</div>
            <div class="fw-bold" style="color: #22a55b; font-size: 24px; letter-spacing: -0.25px;">
              {{ event.attended_count }}
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="p-3 rounded-3" style="background-color: #eef2ff; border: 1px solid #c7d2fe;">
            <div style="color: #64748b; font-size: 12px;">Sisa Kuota</div>
            <div class="fw-bold" style="color: #4f46e5; font-size: 24px; letter-spacing: -0.25px;">
              {{ event.remaining_quota }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search & Status Filter Pills (Figma 2002:1379) -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="d-flex flex-wrap gap-2">
        <button
          type="button"
          class="btn rounded-pill px-3 py-1"
          :style="
            statusFilter === 'all'
              ? 'background-color: #4f46e5; color: #ffffff; font-size: 12px; font-weight: 500;'
              : 'background-color: #ffffff; border: 1px solid #c7d2fe; color: #0f172a; font-size: 12px; font-weight: 600;'
          "
          @click="statusFilter = 'all'"
        >
          Semua (76)
        </button>
        <button
          type="button"
          class="btn rounded-pill px-3 py-1"
          :style="
            statusFilter === 'registered'
              ? 'background-color: #4f46e5; color: #ffffff; font-size: 12px; font-weight: 500;'
              : 'background-color: #ffffff; border: 1px solid #c7d2fe; color: #0f172a; font-size: 12px; font-weight: 600;'
          "
          @click="statusFilter = 'registered'"
        >
          Terdaftar (24)
        </button>
        <button
          type="button"
          class="btn rounded-pill px-3 py-1"
          :style="
            statusFilter === 'attended'
              ? 'background-color: #4f46e5; color: #ffffff; font-size: 12px; font-weight: 500;'
              : 'background-color: #ffffff; border: 1px solid #c7d2fe; color: #0f172a; font-size: 12px; font-weight: 600;'
          "
          @click="statusFilter = 'attended'"
        >
          Hadir (52)
        </button>
      </div>

      <div style="width: 320px;">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          style="border: 1px solid #c7d2fe; border-radius: 8px; font-size: 14px;"
          placeholder="Cari nama, email, tiket..."
        />
      </div>
    </div>

    <!-- Table Pendaftar Event (Figma 2002:1391) -->
    <div class="eh-card overflow-hidden mb-3">
      <div class="table-responsive">
        <table class="table mb-0 align-middle">
          <thead style="background-color: #e0e7ff; border-bottom: 1px solid #c7d2fe;">
            <tr class="text-uppercase fw-semibold" style="font-size: 12px; letter-spacing: 0.6px;">
              <th class="py-3 px-3" style="background-color: #e0e7ff; color: #3730a3;">NAMA</th>
              <th class="py-3 px-3" style="background-color: #e0e7ff; color: #3730a3;">EMAIL</th>
              <th class="py-3 px-3" style="background-color: #e0e7ff; color: #3730a3;">KODE TIKET</th>
              <th class="py-3 px-3" style="background-color: #e0e7ff; color: #3730a3;">WAKTU DAFTAR</th>
              <th class="py-3 px-3" style="background-color: #e0e7ff; color: #3730a3;">STATUS</th>
              <th class="py-3 px-3 text-end" style="background-color: #e0e7ff; color: #3730a3;">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredParticipants" :key="p.id" style="border-bottom: 1px solid #e2e8f0;">
              <td class="py-3 px-3 fw-medium" style="color: #0f172a; font-size: 14px;">
                {{ p.name }}
              </td>
              <td class="py-3 px-3" style="color: #64748b; font-size: 14px;">
                {{ p.email }}
              </td>
              <td
                class="py-3 px-3 font-monospace fw-bold"
                :style="{ color: p.status === 'Terdaftar' ? '#4f46e5' : '#64748b', fontSize: '12px' }"
              >
                {{ p.ticket_code }}
              </td>
              <td class="py-3 px-3" style="color: #64748b; font-size: 14px;">
                {{ p.registered_at }}
              </td>
              <td class="py-3 px-3">
                <span
                  v-if="p.status === 'Terdaftar'"
                  class="badge rounded-pill text-white fw-semibold px-3 py-1"
                  style="background-color: #22a55b; font-size: 12px;"
                >
                  Terdaftar
                </span>
                <span
                  v-else
                  class="badge rounded-pill text-white fw-semibold px-3 py-1"
                  style="background-color: #9e9e9e; font-size: 12px;"
                >
                  Hadir
                </span>
              </td>
              <td class="py-3 px-3 text-end">
                <button
                  type="button"
                  class="btn btn-link p-0 text-decoration-none fw-medium"
                  style="color: #4f46e5; font-size: 14px;"
                  @click="openAnswersModal(p)"
                >
                  Lihat Jawaban
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination (Figma 2002:1478) -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
      <div style="color: #64748b; font-size: 12px;">
        Menampilkan 1-{{ filteredParticipants.length }} dari 76 pendaftar
      </div>
      <div class="d-flex align-items-center gap-1">
        <button
          type="button"
          class="btn btn-sm bg-white px-3 py-1"
          style="border: 1px solid #e2e8f0; color: #94a3b8; border-radius: 8px; font-size: 14px;"
          disabled
        >
          Sebelumnya
        </button>
        <button
          type="button"
          class="btn btn-sm text-white fw-semibold d-flex align-items-center justify-content-center"
          style="width: 32px; height: 32px; background-color: #4f46e5; border-radius: 8px; font-size: 12px;"
        >
          1
        </button>
        <button
          type="button"
          class="btn btn-sm bg-white fw-semibold d-flex align-items-center justify-content-center"
          style="width: 32px; height: 32px; border: 1px solid #c7d2fe; color: #0f172a; border-radius: 8px; font-size: 12px;"
        >
          2
        </button>
        <button
          type="button"
          class="btn btn-sm bg-white px-3 py-1"
          style="border: 1px solid #4f46e5; color: #4f46e5; border-radius: 8px; font-size: 14px;"
        >
          Selanjutnya
        </button>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- MODAL JAWABAN FORMULIR PESERTA (Figma 2007:5915)                    -->
    <!-- =================================================================== -->
    <div
      v-if="selectedParticipant"
      class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
    >
      <div
        class="bg-white rounded-3 p-4 w-100 shadow-lg"
        style="max-width: 512px; border: 1px solid #c7d2fe;"
      >
        <!-- Modal Header (Figma 2007:5962) -->
        <div
          class="d-flex justify-content-between align-items-start pb-3 mb-3"
          style="border-bottom: 1px solid #e2e8f0;"
        >
          <div>
            <h2 class="fw-bold mb-1" style="color: #0f172a; font-size: 24px; letter-spacing: -0.25px;">
              Jawaban Formulir Peserta
            </h2>
            <div style="font-size: 12px;">
              <span style="color: #64748b;">{{ selectedParticipant.name }} &bull; </span>
              <strong class="font-monospace" style="color: #4f46e5;">{{ selectedParticipant.ticket_code }}</strong>
            </div>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-link text-secondary p-0 text-decoration-none"
            @click="selectedParticipant = null"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Dynamic Form Answers (Figma 2007:5972) -->
        <div class="d-flex flex-column gap-3 mb-4">
          <div
            v-for="(ans, aIdx) in selectedParticipant.answers"
            :key="aIdx"
            class="p-3 rounded-3"
            style="background-color: #eef2ff; border: 1px solid #c7d2fe;"
          >
            <div class="fw-medium mb-1" style="color: #64748b; font-size: 12px;">
              {{ ans.label }}
            </div>
            <div class="fw-semibold" style="color: #0f172a; font-size: 14px;">
              {{ ans.value }}
            </div>
          </div>
        </div>

        <!-- Action Footer (Figma 2007:5985) -->
        <div
          class="d-flex justify-content-between align-items-center pt-3"
          style="border-top: 1px solid #e2e8f0;"
        >
          <span style="color: #64748b; font-size: 12px;">
            Terdaftar: {{ selectedParticipant.registered_full }}
          </span>
          <button
            type="button"
            class="btn eh-btn-outline px-4 py-2"
            @click="selectedParticipant = null"
          >
            Tutup
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

.eh-btn-outline {
  background-color: #ffffff;
  border: 1px solid #4f46e5;
  color: #4f46e5;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.eh-btn-outline:hover {
  background-color: #eef2ff;
  color: #4f46e5;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1055;
}
</style>
