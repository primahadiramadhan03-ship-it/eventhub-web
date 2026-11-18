<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { eventService } from '../../services/eventService'

const route = useRoute()
const eventId = route.params.id

// State halaman: 'billing' | 'success' | 'expired'
const viewState = ref('billing')
const isLoading = ref(true)
const isSubmitting = ref(false)
const showPaymentModal = ref(false)

// Pilihan metode pembayaran sesuai Figma Mockup 2007:5818
const paymentMethods = [
  {
    id: 'va_a',
    name: 'Virtual Account Bank A',
    code: 'Kode Bayar: 89012-08129876',
    fee: 'Biaya Rp 0',
  },
  {
    id: 'va_b',
    name: 'Virtual Account Bank B',
    code: 'Kode Bayar: 98801-4458921',
    fee: 'Biaya Rp 0',
  },
  {
    id: 'transfer_bank',
    name: 'Transfer Antar Bank',
    code: 'Verifikasi Otomatis',
    fee: 'Biaya Rp 0',
  },
]
const selectedMethod = ref('va_a')

// Data Event (Default sesuai Figma Mockup 2002:1780)
const event = ref({
  id: eventId,
  code: `EVT-2026-${String(eventId).padStart(4, '0')}`,
  title: 'Pelatihan Pemrograman Web Modern',
  schedule: '10 Mei 2026 • 09:00 WIB',
  location: 'Lab Rekayasa Perangkat Lunak, Gedung H',
  quota: 40,
  form_summary: 'Kustom (3 Pertanyaan Siap)',
  status: 'draft',
})

// Countdown 24 jam (default: 23:41:09 sesuai Figma Mockup 2002:1835)
const remainingSeconds = ref(23 * 3600 + 41 * 60 + 9)
let timerInterval = null

const hours = computed(() => String(Math.floor(remainingSeconds.value / 3600)).padStart(2, '0'))
const minutes = computed(() => String(Math.floor((remainingSeconds.value % 3600) / 60)).padStart(2, '0'))
const seconds = computed(() => String(remainingSeconds.value % 60).padStart(2, '0'))
const isUrgent = computed(() => remainingSeconds.value > 0 && remainingSeconds.value <= 7200)

onMounted(async () => {
  isLoading.value = true
  try {
    let loaded = null
    try {
      const res = await eventService.getOrganizerEventDetail(eventId)
      if (res && res.data) loaded = res.data
    } catch {
      // Fallback ke localStorage
    }

    if (!loaded) {
      const localEvents = JSON.parse(localStorage.getItem('eventhub_local_events') || '[]')
      loaded = localEvents.find((e) => String(e.id) === String(eventId))
    }

    if (loaded) {
      const qCount = loaded.form_fields?.length || 3
      event.value = {
        ...event.value,
        title: loaded.title || event.value.title,
        location: loaded.location || event.value.location,
        quota: loaded.quota || event.value.quota,
        form_summary: `Kustom (${qCount} Pertanyaan Siap)`,
        status: loaded.status || 'draft',
      }
      if (loaded.status === 'menunggu_review' || loaded.status === 'tayang') {
        viewState.value = 'success'
      }
    }
  } finally {
    isLoading.value = false
  }

  timerInterval = setInterval(() => {
    if (remainingSeconds.value > 0 && viewState.value === 'billing') {
      remainingSeconds.value--
      if (remainingSeconds.value === 0) {
        viewState.value = 'expired'
        showPaymentModal.value = false
      }
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const confirmPayment = async () => {
  isSubmitting.value = true
  try {
    const chosen = paymentMethods.find((m) => m.id === selectedMethod.value) || paymentMethods[0]
    const refNo = `TRX-20261014-${Math.floor(1000 + Math.random() * 9000)}`

    try {
      await eventService.payOrganizerEvent(eventId, {
        payment_method: chosen.name,
        reference_no: refNo,
        amount: 50000,
      })
    } catch {
      // Simpan ke localStorage fallback
    }

    const localEvents = JSON.parse(localStorage.getItem('eventhub_local_events') || '[]')
    const idx = localEvents.findIndex((e) => String(e.id) === String(eventId))
    if (idx !== -1) {
      localEvents[idx].status = 'menunggu_review'
      localEvents[idx].payment_deadline = null
      localEvents[idx].paid_at = new Date().toISOString()
      localStorage.setItem('eventhub_local_events', JSON.stringify(localEvents))
    }

    const localPayments = JSON.parse(localStorage.getItem('eventhub_local_payments') || '[]')
    localPayments.unshift({
      id: refNo,
      event_id: eventId,
      event_title: event.value.title,
      organizer_name: 'BEM Fasilkom UI',
      amount: 50000,
      status: 'Dibayar',
      paid_at: '14 Okt 2026, 10:15',
    })
    localStorage.setItem('eventhub_local_payments', JSON.stringify(localPayments))

    showPaymentModal.value = false
    viewState.value = 'success'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="payment-mockup-page py-2" style="max-width: 896px;">
    <!-- =================================================================== -->
    <!-- STATE 1: PEMBAYARAN SEWA PENAYANGAN (Figma 2002:1780)               -->
    <!-- =================================================================== -->
    <div v-if="viewState === 'billing'">
      <!-- Back Link (Figma 2002:1821) -->
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

      <!-- Heading & Subtitle (Figma 2002:1825) -->
      <div class="pb-4 mb-4" style="border-bottom: 1px solid #c7d2fe;">
        <h1 class="fw-bold mb-1" style="color: #0f172a; font-size: 32px; letter-spacing: -0.5px;">
          Pembayaran Sewa Penayangan
        </h1>
        <p class="mb-0" style="color: #64748b; font-size: 14px;">
          Selesaikan biaya penayangan event untuk meneruskan draf ke antrean review Developer platform.
        </p>
      </div>

      <!-- Prominent COUNTDOWN TIMER Card (Figma 2002:1830) -->
      <div class="eh-card text-center p-4 mb-4">
        <div
          class="fw-semibold text-uppercase mb-3"
          :style="{ color: isUrgent ? '#dc2626' : '#64748b', fontSize: '12px', letterSpacing: '0.6px' }"
        >
          SISA WAKTU PEMBAYARAN
        </div>

        <div class="d-flex justify-content-center align-items-center gap-3 mb-3">
          <!-- Jam -->
          <div class="d-flex flex-column align-items-center">
            <div class="timer-digit-box" :class="{ 'timer-urgent': isUrgent }">
              {{ hours }}
            </div>
            <span class="mt-1" style="color: #64748b; font-size: 12px;">Jam</span>
          </div>

          <div class="fw-bold pb-4" style="color: #1e1b4b; font-size: 32px;">:</div>

          <!-- Menit -->
          <div class="d-flex flex-column align-items-center">
            <div class="timer-digit-box" :class="{ 'timer-urgent': isUrgent }">
              {{ minutes }}
            </div>
            <span class="mt-1" style="color: #64748b; font-size: 12px;">Menit</span>
          </div>

          <div class="fw-bold pb-4" style="color: #1e1b4b; font-size: 32px;">:</div>

          <!-- Detik -->
          <div class="d-flex flex-column align-items-center">
            <div class="timer-digit-box" :class="{ 'timer-urgent': isUrgent }">
              {{ seconds }}
            </div>
            <span class="mt-1" style="color: #64748b; font-size: 12px;">Detik</span>
          </div>
        </div>

        <p class="mb-0" style="color: #64748b; font-size: 12px;">
          Draft akan dihapus otomatis jika tidak dibayar dalam 24 jam.
        </p>
      </div>

      <!-- Event Summary Card with yellow 'Draft' badge (Figma 2002:1862) -->
      <div class="eh-card p-4 mb-4">
        <div
          class="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-3"
          style="border-bottom: 1px solid #e2e8f0;"
        >
          <div class="d-flex align-items-center gap-2">
            <span
              class="badge rounded-pill fw-semibold px-3 py-1"
              style="background-color: #f5c542; color: #0f172a; font-size: 12px;"
            >
              Draft
            </span>
            <h2 class="h6 fw-semibold mb-0" style="color: #0f172a; font-size: 16px;">
              {{ event.title }}
            </h2>
          </div>
          <span class="font-monospace" style="color: #64748b; font-size: 12px;">
            ID: {{ event.code }}
          </span>
        </div>

        <!-- 2x2 Grid Info (Figma 2002:1871) -->
        <div class="row g-3 mb-4">
          <div class="col-12 col-sm-6">
            <div style="color: #64748b; font-size: 12px;">Jadwal Acara</div>
            <div style="color: #0f172a; font-size: 14px;">{{ event.schedule }}</div>
          </div>
          <div class="col-12 col-sm-6">
            <div style="color: #64748b; font-size: 12px;">Lokasi Venue</div>
            <div style="color: #0f172a; font-size: 14px;">{{ event.location }}</div>
          </div>
          <div class="col-12 col-sm-6">
            <div style="color: #64748b; font-size: 12px;">Alokasi Kuota</div>
            <div class="font-monospace" style="color: #0f172a; font-size: 14px;">{{ event.quota }} Peserta</div>
          </div>
          <div class="col-12 col-sm-6">
            <div style="color: #64748b; font-size: 12px;">Formulir Pendaftaran</div>
            <div style="color: #0f172a; font-size: 14px;">{{ event.form_summary }}</div>
          </div>
        </div>

        <!-- Cost Breakdown Box (Figma 2002:1888) -->
        <div class="p-3 rounded-3" style="background-color: #eef2ff; border: 1px solid #c7d2fe;">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span style="color: #64748b; font-size: 14px;">Sewa Penayangan</span>
            <span style="color: #0f172a; font-size: 14px;">Rp 50.000</span>
          </div>
          <div
            class="d-flex justify-content-between align-items-center pt-2"
            style="border-top: 1px solid #c7d2fe;"
          >
            <span class="fw-bold" style="color: #0f172a; font-size: 16px;">Total Pembayaran</span>
            <span class="fw-bold" style="color: #4f46e5; font-size: 16px;">Rp 50.000</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons (Figma 2002:1899) -->
      <div class="d-flex justify-content-between align-items-center pt-2">
        <router-link to="/organizer/events" class="btn eh-btn-outline px-4 py-2">
          Kembali ke Kelola Event
        </router-link>
        <button type="button" class="btn eh-btn-primary px-4 py-2" @click="showPaymentModal = true">
          Bayar Sekarang
        </button>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- STATE 2: HASIL PEMBAYARAN BERHASIL (Figma 2002:2286)                -->
    <!-- =================================================================== -->
    <div v-else-if="viewState === 'success'" class="py-4">
      <div class="eh-card p-5 text-center mx-auto" style="max-width: 768px;">
        <!-- Green Check Circle (Figma 2002:2327) -->
        <div
          class="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
          style="width: 56px; height: 56px; background-color: #eef2ff; border: 1px solid #22a55b; color: #22a55b;"
        >
          <i class="bi bi-check-circle-fill fs-3"></i>
        </div>

        <!-- Blue 'Menunggu Review' badge #3B82F6 (Figma 2002:2331) -->
        <div class="mb-2">
          <span
            class="badge rounded-pill fw-semibold px-3 py-1 text-white"
            style="background-color: #3b82f6; font-size: 12px;"
          >
            Menunggu Review
          </span>
        </div>

        <!-- Heading 1 (Figma 2002:2333) -->
        <h1 class="fw-bold mb-2" style="color: #0f172a; font-size: 32px; letter-spacing: -0.5px;">
          Pembayaran Berhasil!
        </h1>

        <p class="mx-auto mb-4" style="color: #64748b; font-size: 16px; max-width: 512px;">
          Pembayaran berhasil. Event kamu menunggu review Developer sebelum tayang di katalog publik.
        </p>

        <!-- Summary Box #EEF2FF (Figma 2002:2337) -->
        <div
          class="p-3 rounded-3 mx-auto text-start mb-4"
          style="max-width: 448px; background-color: #eef2ff; border: 1px solid #c7d2fe;"
        >
          <div class="d-flex justify-content-between mb-2" style="font-size: 14px;">
            <span style="color: #64748b;">Event</span>
            <span class="fw-medium" style="color: #0f172a;">{{ event.title }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2" style="font-size: 14px;">
            <span style="color: #64748b;">Jumlah Biaya Listing</span>
            <span class="fw-semibold" style="color: #0f172a;">Rp 50.000</span>
          </div>
          <div class="d-flex justify-content-between" style="font-size: 14px;">
            <span style="color: #64748b;">Status Transaksi</span>
            <span class="fw-semibold" style="color: #22a55b;">Lunas Terverifikasi</span>
          </div>
        </div>

        <!-- Button 'Lihat Kelola Event' (Figma 2002:2353) -->
        <router-link to="/organizer/events" class="btn eh-btn-primary px-4 py-2 fw-semibold">
          Lihat Kelola Event
        </router-link>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- MODAL POP-UP PILIH METODE PEMBAYARAN (Figma 2007:5818)              -->
    <!-- =================================================================== -->
    <div
      v-if="showPaymentModal"
      class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
    >
      <div
        class="bg-white rounded-3 p-4 w-100 shadow-lg"
        style="max-width: 512px; border: 1px solid #c7d2fe;"
      >
        <!-- Modal Header (Figma 2007:5865) -->
        <div
          class="d-flex justify-content-between align-items-start pb-3 mb-3"
          style="border-bottom: 1px solid #e2e8f0;"
        >
          <div>
            <h2 class="fw-bold mb-1" style="color: #0f172a; font-size: 24px; letter-spacing: -0.25px;">
              Pilih Metode Pembayaran
            </h2>
            <div style="color: #64748b; font-size: 12px;">
              Sewa Penayangan Event &bull; Total: <strong style="color: #0f172a;">Rp 50.000</strong>
            </div>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-link text-secondary p-0 text-decoration-none"
            @click="showPaymentModal = false"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Plain Rows for Payment Methods (Figma 2007:5874) -->
        <div class="d-flex flex-column gap-3 mb-4">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            class="p-3 rounded-3 d-flex align-items-center justify-content-between cursor-pointer"
            :style="
              selectedMethod === method.id
                ? 'background-color: #eef2ff; border: 2px solid #4f46e5;'
                : 'background-color: #ffffff; border: 1px solid #e2e8f0;'
            "
            @click="selectedMethod = method.id"
          >
            <div class="d-flex align-items-center gap-3">
              <div
                class="rounded-circle d-flex align-items-center justify-content-center"
                :style="
                  selectedMethod === method.id
                    ? 'width: 18px; height: 18px; background-color: #4f46e5; border: 2px solid #4f46e5;'
                    : 'width: 18px; height: 18px; background-color: #ffffff; border: 1px solid #6b7280;'
                "
              >
                <span
                  v-if="selectedMethod === method.id"
                  class="rounded-circle bg-white"
                  style="width: 6px; height: 6px;"
                ></span>
              </div>
              <div>
                <div class="fw-semibold" style="color: #0f172a; font-size: 14px;">
                  {{ method.name }}
                </div>
                <div class="font-monospace" style="color: #64748b; font-size: 12px;">
                  {{ method.code }}
                </div>
              </div>
            </div>
            <span
              :class="selectedMethod === method.id ? 'fw-semibold' : ''"
              :style="{ color: selectedMethod === method.id ? '#4f46e5' : '#64748b', fontSize: '12px' }"
            >
              {{ method.fee }}
            </span>
          </div>
        </div>

        <!-- Action Buttons Footer (Figma 2007:5907) -->
        <div
          class="d-flex justify-content-end align-items-center gap-2 pt-3"
          style="border-top: 1px solid #e2e8f0;"
        >
          <button
            type="button"
            class="btn eh-btn-outline px-3 py-2"
            @click="showPaymentModal = false"
          >
            Batal
          </button>
          <button
            type="button"
            class="btn eh-btn-primary px-4 py-2 fw-semibold"
            :disabled="isSubmitting"
            @click="confirmPayment"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
            Konfirmasi Pembayaran Rp 50.000
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

.timer-digit-box {
  width: 80px;
  height: 64px;
  background-color: #eef2ff;
  border: 1px solid #4f46e5;
  border-radius: 8px;
  color: #1e1b4b;
  font-size: 32px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.5px;
}

.timer-urgent {
  background-color: #fef2f2;
  border-color: #dc2626;
  color: #dc2626;
}

.eh-btn-primary {
  background-color: #4f46e5;
  border: 1px solid #4f46e5;
  color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.eh-btn-primary:hover {
  background-color: #4338ca;
  border-color: #4338ca;
  color: #ffffff;
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

.cursor-pointer {
  cursor: pointer;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1055;
}
</style>
