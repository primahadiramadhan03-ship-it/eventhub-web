<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { eventService } from '../../services/eventService'

const route = useRoute()
const auth = useAuthStore()
const registrationId = route.params.id

const statusMode = ref('Terdaftar') // 'Terdaftar' | 'Hadir'

// Data Tiket sesuai Figma Mockup 2002:710 & 2002:4172
const ticket = ref({
  id: registrationId,
  ticket_code: 'EVT-12-A8K2P9QX',
  event_title: 'Seminar Nasional AI untuk Pendidikan',
  organizer: 'Himpunan Mahasiswa Informatika',
  participant_name: auth.userName || 'Aditya Pratama',
  schedule_text: '18 April 2026 • 09:00 WIB',
  location_text: 'Aula Gedung A, Kampus Pusat, Jl. Imam Bonjol No. 207, Semarang',
  checked_in_at: '18 April 2026 • 08:42 WIB',
})

onMounted(async () => {
  try {
    const res = await eventService.getRegistrationDetail(registrationId)
    if (res && res.data) {
      const d = res.data
      ticket.value = {
        ...ticket.value,
        ticket_code: d.ticket_code || ticket.value.ticket_code,
        event_title: d.event?.title || ticket.value.event_title,
        location_text: d.event?.location || ticket.value.location_text,
        participant_name: d.user?.name || auth.userName || 'Aditya Pratama',
      }
      if (d.status === 'attended') {
        statusMode.value = 'Hadir'
      }
    }
  } catch {
    // Fallback mockup
  }
})

const handleDownload = () => {
  window.print()
}
</script>

<template>
  <div class="ticket-mockup-page py-5 px-3">
    <div class="mx-auto" style="max-width: 576px;">
      <!-- Toggle Status Simulasi (Terdaftar vs Hadir sesuai Figma 2002:710 & 2002:4172) -->
      <div class="d-flex justify-content-end mb-2 d-print-none">
        <div class="btn-group btn-group-sm">
          <button
            type="button"
            class="btn btn-sm py-0 px-2"
            :style="
              statusMode === 'Terdaftar'
                ? 'background-color: #4f46e5; color: #fff;'
                : 'background-color: #fff; border: 1px solid #c7d2fe; color: #0f172a;'
            "
            @click="statusMode = 'Terdaftar'"
          >
            Status: Terdaftar
          </button>
          <button
            type="button"
            class="btn btn-sm py-0 px-2"
            :style="
              statusMode === 'Hadir'
                ? 'background-color: #4f46e5; color: #fff;'
                : 'background-color: #fff; border: 1px solid #c7d2fe; color: #0f172a;'
            "
            @click="statusMode = 'Hadir'"
          >
            Status: Hadir
          </button>
        </div>
      </div>

      <!-- Ticket Card Centered (Figma 2002:733) -->
      <div class="eh-ticket-card overflow-hidden">
        <!-- Top Band #4F46E5 with white text (Figma 2002:734) -->
        <div class="p-4" style="background-color: #4f46e5;">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span
              class="badge rounded-pill text-white fw-semibold px-3 py-1"
              :style="{
                backgroundColor: statusMode === 'Hadir' ? '#9e9e9e' : '#22a55b',
                fontSize: '12px',
              }"
            >
              {{ statusMode }}
            </span>
            <span
              class="font-monospace fw-bold text-white"
              style="font-size: 14px; letter-spacing: 0.7px;"
            >
              {{ ticket.ticket_code }}
            </span>
          </div>

          <h1 class="fw-bold text-white mb-1" style="font-size: 20px; line-height: 1.4;">
            {{ ticket.event_title }}
          </h1>
          <div style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">
            {{ ticket.organizer }}
          </div>
        </div>

        <!-- Ticket Body (Figma 2002:744) -->
        <div class="p-4">
          <div class="row g-3 pb-4 mb-4" style="border-bottom: 1px solid #e2e8f0;">
            <div class="col-12 col-sm-6">
              <div style="color: #64748b; font-size: 12px;">Nama Peserta</div>
              <div class="fw-semibold" style="color: #0f172a; font-size: 14px;">
                {{ ticket.participant_name }}
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div style="color: #64748b; font-size: 12px;">Jadwal Acara</div>
              <div class="fw-semibold" style="color: #0f172a; font-size: 14px;">
                {{ ticket.schedule_text }}
              </div>
            </div>
            <div class="col-12">
              <div style="color: #64748b; font-size: 12px;">Lokasi Venue</div>
              <div style="color: #0f172a; font-size: 14px;">
                {{ ticket.location_text }}
              </div>
            </div>
            <!-- Info Waktu Check-in jika status Hadir (Figma 2002:4172) -->
            <div v-if="statusMode === 'Hadir'" class="col-12">
              <div
                class="p-2 px-3 rounded-2 d-flex justify-content-between align-items-center"
                style="background-color: #dcfce7; border: 1px solid #22a55b; color: #166534; font-size: 12px;"
              >
                <span>✓ Presensi Kehadiran Tercatat</span>
                <strong class="font-monospace">{{ ticket.checked_in_at }}</strong>
              </div>
            </div>
          </div>

          <!-- Strict Functional QR Code Container (Figma 2002:758) -->
          <div
            class="p-4 rounded-2 text-center"
            style="background-color: #eef2ff; border: 1px solid #c7d2fe;"
          >
            <div
              class="bg-white d-inline-block p-3 rounded-2 mb-3"
              style="border: 1px solid #e2e8f0;"
            >
              <!-- Clean Black on White QR SVG (160x160) -->
              <svg
                width="160"
                height="160"
                viewBox="0 0 160 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="160" height="160" fill="white" />
                <!-- Top-left finder -->
                <rect x="12" y="12" width="44" height="44" stroke="#0f172a" stroke-width="6" />
                <rect x="24" y="24" width="20" height="20" fill="#0f172a" />
                <!-- Top-right finder -->
                <rect x="104" y="12" width="44" height="44" stroke="#0f172a" stroke-width="6" />
                <rect x="116" y="24" width="20" height="20" fill="#0f172a" />
                <!-- Bottom-left finder -->
                <rect x="12" y="104" width="44" height="44" stroke="#0f172a" stroke-width="6" />
                <rect x="24" y="116" width="20" height="20" fill="#0f172a" />
                <!-- Data matrix pattern -->
                <rect x="68" y="16" width="8" height="8" fill="#0f172a" />
                <rect x="84" y="16" width="8" height="16" fill="#0f172a" />
                <rect x="68" y="32" width="16" height="8" fill="#0f172a" />
                <rect x="68" y="48" width="8" height="16" fill="#0f172a" />
                <rect x="84" y="48" width="8" height="8" fill="#0f172a" />
                <rect x="16" y="68" width="16" height="8" fill="#0f172a" />
                <rect x="40" y="68" width="8" height="16" fill="#0f172a" />
                <rect x="56" y="68" width="24" height="8" fill="#0f172a" />
                <rect x="88" y="68" width="16" height="16" fill="#0f172a" />
                <rect x="112" y="68" width="8" height="8" fill="#0f172a" />
                <rect x="128" y="68" width="20" height="8" fill="#0f172a" />
                <rect x="16" y="84" width="8" height="8" fill="#0f172a" />
                <rect x="56" y="84" width="8" height="16" fill="#0f172a" />
                <rect x="72" y="84" width="8" height="8" fill="#0f172a" />
                <rect x="112" y="84" width="16" height="8" fill="#0f172a" />
                <rect x="136" y="84" width="12" height="16" fill="#0f172a" />
                <rect x="68" y="104" width="16" height="8" fill="#0f172a" />
                <rect x="92" y="104" width="8" height="16" fill="#0f172a" />
                <rect x="108" y="104" width="24" height="8" fill="#0f172a" />
                <rect x="68" y="120" width="8" height="16" fill="#0f172a" />
                <rect x="84" y="128" width="16" height="8" fill="#0f172a" />
                <rect x="108" y="120" width="16" height="16" fill="#0f172a" />
                <rect x="132" y="120" width="16" height="8" fill="#0f172a" />
                <rect x="68" y="140" width="24" height="8" fill="#0f172a" />
                <rect x="100" y="140" width="16" height="8" fill="#0f172a" />
                <rect x="124" y="136" width="24" height="12" fill="#0f172a" />
              </svg>
            </div>

            <div class="font-monospace fw-bold mb-1" style="color: #0f172a; font-size: 14px;">
              {{ ticket.ticket_code }}
            </div>
            <div style="color: #64748b; font-size: 12px;">
              Tunjukkan QR ini kepada panitia saat check-in
            </div>
          </div>
        </div>

        <!-- Action Footer (Figma 2002:797) -->
        <div
          class="p-4 d-flex justify-content-between align-items-center bg-white d-print-none"
          style="border-top: 1px solid #e2e8f0;"
        >
          <router-link
            to="/my-registrations"
            class="btn px-3 py-2 fw-medium"
            style="background-color: #ffffff; border: 1px solid #4f46e5; color: #4f46e5; border-radius: 4px; font-size: 14px;"
          >
            Kembali ke Riwayat
          </router-link>

          <button
            type="button"
            class="btn text-white fw-medium px-3 py-2"
            style="background-color: #4f46e5; border: 1px solid #4f46e5; border-radius: 4px; font-size: 14px;"
            @click="handleDownload"
          >
            Unduh Tiket
          </button>
        </div>
      </div>

      <div class="text-center mt-3" style="color: #64748b; font-size: 12px;">
        EventHub Platform &copy; 2026. Tiket Digital Peserta.
      </div>
    </div>
  </div>
</template>

<style scoped>
.eh-ticket-card {
  background-color: #ffffff;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
}
</style>
