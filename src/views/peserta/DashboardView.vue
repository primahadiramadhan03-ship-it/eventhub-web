<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

// Data Event Mendatang Saya sesuai Figma Mockup 2002:438
const upcomingEvents = ref([
  {
    id: 1,
    ticket_code: 'EVT-12-A8K2P9QX',
    title: 'Seminar Nasional AI untuk Pendidikan',
    schedule_location: '18 April 2026 • 09:00 WIB • Aula Gedung A, Kampus Pusat',
    status: 'Terdaftar',
  },
  {
    id: 2,
    ticket_code: 'EVT-12-B3J7M1NW',
    title: 'Workshop UI/UX dengan Figma',
    schedule_location: '25 April 2026 • 13:00 WIB • Lab Komputer 2, Gedung FTI',
    status: 'Terdaftar',
  },
  {
    id: 3,
    ticket_code: 'EVT-12-C9K4P2LR',
    title: 'Open Recruitment Volunteer Techfest',
    schedule_location: '12 Mei 2026 • 08:30 WIB • Auditorium Gedung D',
    status: 'Terdaftar',
  },
])
</script>

<template>
  <div class="dashboard-peserta-mockup py-4">
    <div class="container" style="max-width: 1280px;">
      <!-- Greeting 'Halo, Aditya' (Figma 2002:460) -->
      <div class="pb-4 mb-4" style="border-bottom: 1px solid #c7d2fe;">
        <h1 class="fw-bold mb-1" style="color: #0f172a; font-size: 24px; letter-spacing: -0.6px;">
          Halo, {{ auth.userName ? auth.userName.split(' ')[0] : 'Aditya' }}
        </h1>
        <p class="mb-0" style="color: #64748b; font-size: 14px;">
          Pantau status keikutsertaan event kampus dan kelola tiket digital terverifikasi Anda.
        </p>
      </div>

      <!-- 3 Summary Cards: white with 4px left bar alternating #4F46E5 and #7C3AED (Figma 2002:465) -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-md-4">
          <div class="stat-card stat-indigo p-4 h-100">
            <div style="color: #64748b; font-size: 12px;">Event Terdaftar</div>
            <div class="fw-bold my-1" style="color: #0f172a; font-size: 30px;">7</div>
            <div style="color: #64748b; font-size: 12px;">Total seluruh pendaftaran aktif</div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="stat-card stat-violet p-4 h-100">
            <div style="color: #64748b; font-size: 12px;">Event Mendatang</div>
            <div class="fw-bold my-1" style="color: #4f46e5; font-size: 30px;">3</div>
            <div style="color: #64748b; font-size: 12px;">Tiket siap dipindai di lokasi</div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="stat-card stat-indigo p-4 h-100">
            <div style="color: #64748b; font-size: 12px;">Sudah Hadir</div>
            <div class="fw-bold my-1" style="color: #22a55b; font-size: 30px;">4</div>
            <div style="color: #64748b; font-size: 12px;">Presensi check-in selesai</div>
          </div>
        </div>
      </div>

      <!-- List 'Event Mendatang Saya' with 3 rows (Figma 2002:484) -->
      <div class="eh-card overflow-hidden">
        <div
          class="p-3 px-4 d-flex justify-content-between align-items-center"
          style="border-bottom: 1px solid #e2e8f0;"
        >
          <h2 class="fw-semibold mb-0" style="color: #0f172a; font-size: 16px;">
            Event Mendatang Saya
          </h2>
          <router-link
            to="/my-registrations"
            class="text-decoration-none fw-semibold"
            style="color: #4f46e5; font-size: 14px;"
          >
            Lihat Semua Riwayat
          </router-link>
        </div>

        <div>
          <div
            v-for="(item, idx) in upcomingEvents"
            :key="item.id"
            class="p-4 d-flex flex-wrap justify-content-between align-items-center gap-3"
            :style="idx > 0 ? 'border-top: 1px solid #e2e8f0;' : ''"
          >
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <span
                  class="badge rounded-pill text-white fw-semibold px-2 py-1"
                  style="background-color: #22a55b; font-size: 12px;"
                >
                  {{ item.status }}
                </span>
                <span class="font-monospace" style="color: #64748b; font-size: 12px;">
                  {{ item.ticket_code }}
                </span>
              </div>
              <h3 class="fw-semibold mb-1" style="color: #0f172a; font-size: 16px;">
                {{ item.title }}
              </h3>
              <div style="color: #64748b; font-size: 14px;">
                {{ item.schedule_location }}
              </div>
            </div>

            <router-link
              :to="`/my-registrations/${item.id}`"
              class="btn text-white fw-medium px-3 py-2"
              style="background-color: #4f46e5; border-radius: 4px; font-size: 14px;"
            >
              Lihat Tiket
            </router-link>
          </div>
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

.stat-card {
  background-color: #ffffff;
  border-top: 1px solid #c7d2fe;
  border-right: 1px solid #c7d2fe;
  border-bottom: 1px solid #c7d2fe;
  border-radius: 8px;
}

.stat-indigo {
  border-left: 4px solid #4f46e5;
}

.stat-violet {
  border-left: 4px solid #7c3aed;
}
</style>
