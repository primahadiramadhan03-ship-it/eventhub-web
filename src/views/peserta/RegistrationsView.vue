<script setup>
import { ref, computed, onMounted } from 'vue'
import { eventService } from '../../services/eventService'

const statusFilter = ref('all') // 'all' | 'Terdaftar' | 'Hadir'
const searchQuery = ref('')

// 7 Baris Pendaftaran sesuai Figma Mockup 2002:534
const registrations = ref([
  {
    id: 1,
    event_title: 'Seminar Nasional AI untuk Pendidikan',
    location: 'Aula Gedung A, Kampus Pusat',
    date: '18 April 2026',
    ticket_code: 'EVT-12-A8K2P9QX',
    status: 'Terdaftar',
  },
  {
    id: 2,
    event_title: 'Workshop UI/UX dengan Figma',
    location: 'Lab Komputer 2, Gedung FTI',
    date: '25 April 2026',
    ticket_code: 'EVT-12-B3J7M1NW',
    status: 'Terdaftar',
  },
  {
    id: 3,
    event_title: 'Open Recruitment Volunteer Techfest',
    location: 'Auditorium Gedung D',
    date: '12 Mei 2026',
    ticket_code: 'EVT-12-C9K4P2LR',
    status: 'Terdaftar',
  },
  {
    id: 4,
    event_title: 'Seminar Kewirausahaan Digital Kampus',
    location: 'Aula Fakultas Ekonomi',
    date: '10 Maret 2026',
    ticket_code: 'EVT-12-D4M8Q1KZ',
    status: 'Hadir',
  },
  {
    id: 5,
    event_title: 'Webinar Keamanan Siber Mahasiswa',
    location: 'Online via Zoom',
    date: '22 Februari 2026',
    ticket_code: 'EVT-12-E5P2V7WB',
    status: 'Hadir',
  },
  {
    id: 6,
    event_title: 'Workshop Git & GitHub Workflow',
    location: 'Lab Software Engineering',
    date: '05 Februari 2026',
    ticket_code: 'EVT-12-F6T9X4JH',
    status: 'Hadir',
  },
  {
    id: 7,
    event_title: 'Kuliah Umum: Tren Cloud Native 2026',
    location: 'Gedung Teater Utama',
    date: '18 Januari 2026',
    ticket_code: 'EVT-12-G7Y3R8MN',
    status: 'Hadir',
  },
])

onMounted(async () => {
  try {
    const res = await eventService.getMyRegistrations()
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      registrations.value = res.data.map((r) => ({
        id: r.id,
        event_title: r.event?.title || 'Event Kampus',
        location: r.event?.location || 'Kampus Pusat',
        date: r.event?.start_time
          ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(
              new Date(r.event.start_time),
            )
          : '18 April 2026',
        ticket_code: r.ticket_code || 'EVT-12-A8K2P9QX',
        status: r.status === 'attended' ? 'Hadir' : 'Terdaftar',
      }))
    }
  } catch {
    // Fallback mockup
  }
})

const filteredRegistrations = computed(() => {
  return registrations.value.filter((item) => {
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) {
      return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchTitle = item.event_title.toLowerCase().includes(q)
      const matchCode = item.ticket_code.toLowerCase().includes(q)
      const matchLoc = item.location.toLowerCase().includes(q)
      if (!matchTitle && !matchCode && !matchLoc) return false
    }
    return true
  })
})
</script>

<template>
  <div class="riwayat-pendaftaran-mockup py-4">
    <div class="container" style="max-width: 1280px;">
      <!-- Title & Subtitle (Figma 2002:556) -->
      <div class="pb-4 mb-4" style="border-bottom: 1px solid #c7d2fe;">
        <h1 class="fw-bold mb-1" style="color: #0f172a; font-size: 24px; letter-spacing: -0.6px;">
          Riwayat Pendaftaran
        </h1>
        <p class="mb-0" style="color: #64748b; font-size: 14px;">
          Daftar seluruh event yang telah Anda daftarkan beserta akses tiket digital.
        </p>
      </div>

      <!-- Search & Status Filter Pills (Figma 2002:561) -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div class="d-flex flex-wrap gap-2">
          <button
            type="button"
            class="btn rounded-pill px-3 py-1"
            :style="
              statusFilter === 'all'
                ? 'background-color: #4f46e5; color: #ffffff; font-size: 12px; font-weight: 500;'
                : 'background-color: #ffffff; border: 1px solid #c7d2fe; color: #0f172a; font-size: 12px;'
            "
            @click="statusFilter = 'all'"
          >
            Semua (7)
          </button>
          <button
            type="button"
            class="btn rounded-pill px-3 py-1"
            :style="
              statusFilter === 'Terdaftar'
                ? 'background-color: #4f46e5; color: #ffffff; font-size: 12px; font-weight: 500;'
                : 'background-color: #ffffff; border: 1px solid #c7d2fe; color: #0f172a; font-size: 12px;'
            "
            @click="statusFilter = 'Terdaftar'"
          >
            Terdaftar (3)
          </button>
          <button
            type="button"
            class="btn rounded-pill px-3 py-1"
            :style="
              statusFilter === 'Hadir'
                ? 'background-color: #4f46e5; color: #ffffff; font-size: 12px; font-weight: 500;'
                : 'background-color: #ffffff; border: 1px solid #c7d2fe; color: #0f172a; font-size: 12px;'
            "
            @click="statusFilter = 'Hadir'"
          >
            Hadir (4)
          </button>
        </div>

        <div style="width: 320px;">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            style="border: 1px solid #c7d2fe; border-radius: 4px; font-size: 14px;"
            placeholder="Cari event atau kode tiket..."
          />
        </div>
      </div>

      <!-- Real Table: Header #E0E7FF with text #3730A3 (Figma 2002:573) -->
      <div class="eh-card overflow-hidden mb-3">
        <div class="table-responsive">
          <table class="table mb-0 align-middle">
            <thead style="background-color: #e0e7ff; border-bottom: 1px solid #e2e8f0;">
              <tr class="text-uppercase fw-semibold" style="font-size: 12px; letter-spacing: 0.6px;">
                <th class="py-3 px-3" style="background-color: #e0e7ff; color: #3730a3;">EVENT</th>
                <th class="py-3 px-3" style="background-color: #e0e7ff; color: #3730a3;">TANGGAL</th>
                <th class="py-3 px-3" style="background-color: #e0e7ff; color: #3730a3;">KODE TIKET</th>
                <th class="py-3 px-3" style="background-color: #e0e7ff; color: #3730a3;">STATUS</th>
                <th class="py-3 px-3 text-end" style="background-color: #e0e7ff; color: #3730a3;">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredRegistrations.length === 0">
                <td colspan="5" class="py-5 text-center" style="color: #64748b; font-size: 14px;">
                  Tidak ada riwayat pendaftaran yang ditemukan.
                </td>
              </tr>
              <tr
                v-for="row in filteredRegistrations"
                :key="row.id"
                style="border-bottom: 1px solid #e2e8f0;"
              >
                <td class="py-3 px-3">
                  <div class="fw-medium" style="color: #0f172a; font-size: 14px;">
                    {{ row.event_title }}
                  </div>
                  <div style="color: #64748b; font-size: 12px;">
                    {{ row.location }}
                  </div>
                </td>
                <td class="py-3 px-3" style="color: #0f172a; font-size: 14px;">
                  {{ row.date }}
                </td>
                <td
                  class="py-3 px-3 font-monospace fw-bold"
                  :style="{ color: row.status === 'Terdaftar' ? '#4f46e5' : '#64748b', fontSize: '12px' }"
                >
                  {{ row.ticket_code }}
                </td>
                <td class="py-3 px-3">
                  <span
                    v-if="row.status === 'Terdaftar'"
                    class="badge rounded-pill text-white fw-semibold px-2 py-1"
                    style="background-color: #22a55b; font-size: 12px;"
                  >
                    Terdaftar
                  </span>
                  <span
                    v-else
                    class="badge rounded-pill text-white fw-semibold px-2 py-1"
                    style="background-color: #9e9e9e; font-size: 12px;"
                  >
                    Hadir
                  </span>
                </td>
                <td class="py-3 px-3 text-end">
                  <router-link
                    v-if="row.status === 'Terdaftar'"
                    :to="`/my-registrations/${row.id}`"
                    class="btn btn-sm text-white fw-medium px-3 py-1"
                    style="background-color: #4f46e5; border-radius: 4px; font-size: 12px;"
                  >
                    Lihat Tiket
                  </router-link>
                  <router-link
                    v-else
                    :to="`/my-registrations/${row.id}`"
                    class="text-decoration-none fw-semibold"
                    style="color: #4f46e5; font-size: 12px;"
                  >
                    Lihat Tiket
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination (Figma 2002:696) -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div style="color: #64748b; font-size: 12px;">
          Menampilkan 1-{{ filteredRegistrations.length }} dari 7 pendaftaran
        </div>
        <div class="d-flex align-items-center gap-1">
          <button
            type="button"
            class="btn btn-sm px-3 py-1"
            style="background-color: #e2e8f0; border: 1px solid #c7d2fe; color: #94a3b8; border-radius: 4px; font-size: 12px;"
            disabled
          >
            Sebelumnya
          </button>
          <button
            type="button"
            class="btn btn-sm text-white fw-semibold d-flex align-items-center justify-content-center"
            style="width: 32px; height: 32px; background-color: #4f46e5; border-radius: 4px; font-size: 12px;"
          >
            1
          </button>
          <button
            type="button"
            class="btn btn-sm px-3 py-1"
            style="background-color: #e2e8f0; border: 1px solid #c7d2fe; color: #94a3b8; border-radius: 4px; font-size: 12px;"
            disabled
          >
            Selanjutnya
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
</style>
