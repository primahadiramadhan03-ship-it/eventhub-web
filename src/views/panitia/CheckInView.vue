<script setup>
import { ref } from 'vue'
import { eventService } from '../../services/eventService'

const ticketCodeInput = ref('EVT-12-A8K2P9QX')
const isVerifying = ref(false)
const verificationResult = ref(null)

// Data simulasi tiket untuk pengujian TC-28 (Valid) & TC-29 (Sudah Hadir / Tidak Valid)
const registeredTickets = ref({
  'EVT-12-A8K2P9QX': {
    name: 'Arya Dimas Prasetya',
    email: 'arya.dimas@student.uns.ac.id',
    event_title: 'Seminar Nasional AI & Masa Depan Pendidikan',
    institution: 'Universitas Sebelas Maret',
    status: 'registered',
    checked_in_at: null,
  },
  'EVT-1-K7X9P2Q1': {
    name: 'Nadia Maharani Putri',
    email: 'nadia.maharani@student.uns.ac.id',
    event_title: 'Pelatihan Pemrograman Web Modern',
    institution: 'Universitas Sebelas Maret',
    status: 'registered',
    checked_in_at: null,
  },
  'EVT-1-USED9999': {
    name: 'Budi Kurniawan',
    email: 'budi.k@student.uns.ac.id',
    event_title: 'Seminar Nasional AI & Masa Depan Pendidikan',
    institution: 'Institut Teknologi Bandung',
    status: 'attended',
    checked_in_at: '10:15 WIB',
  },
})

const handleVerify = async (customCode) => {
  const code = (customCode || ticketCodeInput.value || '').trim().toUpperCase()
  if (!code) return

  ticketCodeInput.value = code
  isVerifying.value = true
  verificationResult.value = null

  try {
    // 1. Coba panggil endpoint live POST /organizer/check-in
    try {
      const res = await eventService.checkInParticipant({ ticket_code: code })
      if (res && res.data) {
        verificationResult.value = {
          type: 'success',
          ticket_code: code,
          name: res.data.user?.name || res.data.participant_name || 'Peserta Terdaftar',
          event_title: res.data.event?.title || 'Event Aktif',
          checked_in_at: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        }
        return
      }
    } catch (apiErr) {
      if (apiErr.response && apiErr.response.status === 422) {
        verificationResult.value = {
          type: 'error',
          code: '422 CHECKIN_NOT_ALLOWED',
          message: apiErr.response.data?.message || 'Tiket sudah tercatat HADIR atau tidak memenuhi syarat check-in (BR-15).',
        }
        return
      }
    }

    // 2. Fallback simulasi lokal sesuai BR-15, TC-28, TC-29
    const ticket = registeredTickets.value[code]

    if (!ticket) {
      if (!code.startsWith('EVT-') || code.length < 8) {
        verificationResult.value = {
          type: 'error',
          code: '422 CHECKIN_NOT_ALLOWED',
          message: `Kode tiket "${code}" tidak ditemukan atau format tidak valid.`,
        }
        return
      }
      // Tiket baru valid berawalan EVT-
      registeredTickets.value[code] = {
        name: 'Peserta Terdaftar EventHub',
        event_title: 'Pelatihan Pemrograman Web Modern',
        status: 'attended',
        checked_in_at: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      }
      verificationResult.value = {
        type: 'success',
        ticket_code: code,
        name: 'Peserta Terdaftar EventHub',
        event_title: 'Pelatihan Pemrograman Web Modern',
        checked_in_at: registeredTickets.value[code].checked_in_at,
      }
      return
    }

    if (ticket.status === 'attended') {
      verificationResult.value = {
        type: 'error',
        code: '422 CHECKIN_NOT_ALLOWED',
        message: `Tiket ${code} atas nama ${ticket.name} sudah melakukan check-in sebelumnya pada pukul ${ticket.checked_in_at}.`,
      }
      return
    }

    // Ubah status menjadi attended (HADIR)
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    ticket.status = 'attended'
    ticket.checked_in_at = nowStr

    verificationResult.value = {
      type: 'success',
      ticket_code: code,
      name: ticket.name,
      event_title: ticket.event_title,
      checked_in_at: nowStr,
    }
  } finally {
    isVerifying.value = false
  }
}
</script>

<template>
  <div class="checkin-mockup-page py-3 mx-auto" style="max-width: 672px;">
    <!-- Heading 1 & Subtitle Centered (Figma 2002:1531) -->
    <div class="text-center pb-4 mb-4" style="border-bottom: 1px solid #c7d2fe;">
      <h1 class="fw-bold mb-1" style="color: #0f172a; font-size: 32px; letter-spacing: -0.5px;">
        Check-in Peserta
      </h1>
      <p class="mb-0" style="color: #64748b; font-size: 14px;">
        Pindai tiket digital peserta di lokasi atau masukkan kode tiket secara manual.
      </p>
    </div>

    <!-- Main White Card (Figma 2002:1536) -->
    <div class="eh-card p-4 p-md-5">
      <!-- Square Viewfinder with Corner Marks #4F46E5 (Figma 2002:1537) -->
      <div class="d-flex flex-column align-items-center justify-content-center mb-4">
        <div
          class="viewfinder-square position-relative d-flex flex-column align-items-center justify-content-center p-4 cursor-pointer"
          title="Klik untuk simulasi pindai QR tiket"
          @click="handleVerify(ticketCodeInput)"
        >
          <!-- 4 Indigo Corner Marks (Figma 2002:1547 - 2002:1550) -->
          <div class="corner-mark top-left"></div>
          <div class="corner-mark top-right"></div>
          <div class="corner-mark bottom-left"></div>
          <div class="corner-mark bottom-right"></div>

          <!-- QR Icon (Figma 2002:1540) -->
          <div class="mb-3" style="color: #4f46e5;">
            <i class="bi bi-qr-code-scan" style="font-size: 36px; line-height: 1;"></i>
          </div>

          <!-- Specified text (Figma 2002:1542) -->
          <div class="fw-medium text-center" style="color: #0f172a; font-size: 14px;">
            Arahkan kamera ke QR tiket
          </div>

          <!-- Subtext (Figma 2002:1544) -->
          <div class="text-center mt-1" style="color: #64748b; font-size: 12px;">
            Kamera Siaga &bull; Meja Registrasi 1
          </div>
        </div>
      </div>

      <!-- Divider 'ATAU INPUT MANUAL' (Figma 2002:1551) -->
      <div class="d-flex align-items-center my-4">
        <div class="flex-grow-1" style="border-top: 1px solid #e2e8f0;"></div>
        <span class="px-3 text-uppercase" style="color: #64748b; font-size: 12px;">
          ATAU INPUT MANUAL
        </span>
        <div class="flex-grow-1" style="border-top: 1px solid #e2e8f0;"></div>
      </div>

      <!-- Form - Input 'Kode Tiket' and Button 'Verifikasi' (Figma 2002:1555) -->
      <form @submit.prevent="handleVerify()">
        <label class="form-label fw-medium mb-1" style="color: #0f172a; font-size: 14px;">
          Kode Tiket
        </label>
        <div class="d-flex gap-2 mb-1">
          <input
            v-model="ticketCodeInput"
            type="text"
            class="form-control font-monospace text-uppercase eh-input"
            placeholder="EVT-12-A8K2P9QX"
            required
          />
          <button
            type="submit"
            class="btn eh-btn-primary px-4 fw-semibold flex-shrink-0"
            :disabled="isVerifying"
          >
            <span v-if="isVerifying" class="spinner-border spinner-border-sm me-1"></span>
            Verifikasi
          </button>
        </div>
        <div style="color: #64748b; font-size: 12px;">
          Format kode 15 karakter alfanumerik tercetak pada tiket digital.
        </div>
      </form>

      <!-- Tombol Contoh Cepat untuk Pengujian TC-28 & TC-29 -->
      <div class="mt-3 pt-3 d-flex flex-wrap align-items-center gap-2" style="border-top: 1px dashed #e2e8f0;">
        <span style="color: #64748b; font-size: 12px;">Uji Cepat:</span>
        <button
          type="button"
          class="btn btn-sm rounded-pill px-3 py-0"
          style="background-color: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; font-size: 12px;"
          @click="handleVerify('EVT-1-K7X9P2Q1')"
        >
          Tiket Valid (EVT-1-K7X9P2Q1)
        </button>
        <button
          type="button"
          class="btn btn-sm rounded-pill px-3 py-0"
          style="background-color: #fef2f2; color: #dc2626; border: 1px solid #fecaca; font-size: 12px;"
          @click="handleVerify('EVT-1-USED9999')"
        >
          Tiket Sudah Hadir (TC-29)
        </button>
      </div>

      <!-- Hasil Verifikasi Check-In (TC-28 Berhasil / TC-29 Galat) -->
      <div v-if="verificationResult" class="mt-4">
        <!-- Berhasil -->
        <div
          v-if="verificationResult.type === 'success'"
          class="p-3 rounded-3"
          style="background-color: #eef2ff; border: 1px solid #22a55b;"
        >
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span
              class="badge rounded-pill text-white px-3 py-1 fw-semibold"
              style="background-color: #22a55b; font-size: 12px;"
            >
              <i class="bi bi-check-circle-fill me-1"></i>HADIR (TERVERIFIKASI)
            </span>
            <span class="font-monospace" style="color: #64748b; font-size: 12px;">
              {{ verificationResult.checked_in_at }}
            </span>
          </div>
          <div class="fw-bold" style="color: #0f172a; font-size: 16px;">
            {{ verificationResult.name }}
          </div>
          <div style="color: #64748b; font-size: 13px;">
            {{ verificationResult.event_title }} &bull; Kode: <strong class="font-monospace text-dark">{{ verificationResult.ticket_code }}</strong>
          </div>
        </div>

        <!-- Galat 422 CHECKIN_NOT_ALLOWED -->
        <div
          v-else
          class="p-3 rounded-3"
          style="background-color: #fef2f2; border: 1px solid #dc2626;"
        >
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="badge bg-danger text-white rounded-pill px-3 py-1 fw-semibold" style="font-size: 12px;">
              <i class="bi bi-x-circle-fill me-1"></i>GAGAL CHECK-IN
            </span>
            <span class="font-monospace fw-bold text-danger" style="font-size: 12px;">
              {{ verificationResult.code }}
            </span>
          </div>
          <div style="color: #0f172a; font-size: 13px;">
            {{ verificationResult.message }}
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

.viewfinder-square {
  width: 256px;
  height: 256px;
  background-color: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  transition: transform 0.15s ease;
}

.viewfinder-square:hover {
  transform: scale(1.01);
}

.corner-mark {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #4f46e5;
  border-style: solid;
}

.top-left {
  top: 12px;
  left: 12px;
  border-width: 2px 0 0 2px;
}

.top-right {
  top: 12px;
  right: 12px;
  border-width: 2px 2px 0 0;
}

.bottom-left {
  bottom: 12px;
  left: 12px;
  border-width: 0 0 2px 2px;
}

.bottom-right {
  bottom: 12px;
  right: 12px;
  border-width: 0 2px 2px 0;
}

.eh-input {
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  color: #0f172a;
  font-size: 14px;
  padding: 9px 13px;
}

.eh-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.eh-btn-primary {
  background-color: #4f46e5;
  border: 1px solid #4f46e5;
  color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
}

.eh-btn-primary:hover {
  background-color: #4338ca;
  border-color: #4338ca;
  color: #ffffff;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
