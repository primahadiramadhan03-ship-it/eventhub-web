<template>
  <div class="ticket-page py-4">
    <div class="container">
      <!-- Navigasi & Aksi Atas (Hidden saat Print) -->
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2 no-print">
        <router-link to="/my-registrations" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          ← Riwayat Pendaftaran
        </router-link>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="printTicket">
            🖨️ Cetak / Simpan PDF
          </button>
          <router-link v-if="ticket?.event" :to="`/events/${ticket.event.id}`" class="btn btn-light btn-sm rounded-pill px-3 border">
            Detail Acara
          </router-link>
        </div>
      </div>

      <!-- LOADING STATE -->
      <div v-if="loading" class="text-center py-5 no-print">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Memuat tiket digital...</p>
      </div>

      <!-- ERROR / NOT FOUND STATE -->
      <div v-else-if="!ticket || errorMessage" class="card border-0 shadow-sm rounded-4 p-5 text-center my-4 no-print">
        <div class="display-3 mb-3">🎫</div>
        <h3 class="fw-bold mb-2">Tiket Tidak Ditemukan</h3>
        <p class="text-secondary mb-4">
          {{ errorMessage || 'Data pendaftaran atau tiket tidak ditemukan pada akun Anda.' }}
        </p>
        <div>
          <router-link to="/my-registrations" class="btn btn-primary px-4 rounded-pill">
            Buka Riwayat Pendaftaran
          </router-link>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- TAMPILAN TIKET DIGITAL RESMI (Boarding Pass Style - Bab 9.2 & US-07)  -->
      <!-- ===================================================================== -->
      <div v-else class="row justify-content-center">
        <div class="col-lg-8">
          <div class="ticket-card shadow-lg rounded-4 overflow-hidden bg-white border">
            <!-- TICKET HEADER -->
            <div class="ticket-header bg-primary text-white p-4">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="fs-4">🎟️</span>
                  <div>
                    <h5 class="fw-bold mb-0 text-uppercase tracking-wider">EventHub E-Ticket</h5>
                    <small class="opacity-75">Tiket Masuk Resmi & Bukti Pendaftaran</small>
                  </div>
                </div>
                <div>
                  <span
                    v-if="ticket.status === 'attended'"
                    class="badge bg-success px-3 py-2 rounded-pill fw-bold"
                  >
                    ✓ HADIR (CHECKED-IN)
                  </span>
                  <span
                    v-else
                    class="badge bg-light text-primary px-3 py-2 rounded-pill fw-bold"
                  >
                    ● TERDAFTAR (MENUNGGU ACARA)
                  </span>
                </div>
              </div>
            </div>

            <!-- TICKET MAIN BODY -->
            <div class="ticket-body p-4 p-md-5">
              <!-- Judul Event & Kategori -->
              <div class="mb-4">
                <span class="badge bg-primary-subtle text-primary mb-2 px-3 py-1 rounded-pill small">
                  {{ ticket.event?.category?.name || 'Seminar' }}
                </span>
                <h2 class="h3 fw-bold text-dark mb-1">
                  {{ ticket.event?.title || 'Event Kampus' }}
                </h2>
              </div>

              <!-- Grid Waktu & Lokasi -->
              <div class="row g-3 py-3 border-top border-bottom bg-light bg-opacity-50 rounded-3 px-2 mb-4">
                <div class="col-sm-6">
                  <div class="d-flex align-items-center">
                    <span class="fs-4 me-3">🗓️</span>
                    <div>
                      <div class="text-secondary small">Jadwal Acara:</div>
                      <div class="fw-bold text-dark small">{{ formatDateTime(ticket.event?.start_time) }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="d-flex align-items-center">
                    <span class="fs-4 me-3">📍</span>
                    <div>
                      <div class="text-secondary small">Lokasi Acara:</div>
                      <div class="fw-bold text-dark small">{{ ticket.event?.location || 'Kampus UNS' }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- STUB SECTION / KODE TIKET & QR -->
              <div class="ticket-stub p-4 rounded-3 text-center mb-4">
                <div class="text-secondary small text-uppercase fw-bold mb-1">Kode Tiket Resmi</div>
                <div class="display-6 fw-bold text-primary font-monospace tracking-wide mb-2">
                  {{ ticket.ticket_code }}
                </div>
                <button class="btn btn-outline-primary btn-sm rounded-pill px-3 mb-3 no-print" @click="copyTicketCode">
                  📋 {{ copySuccess ? 'Kode Disalin!' : 'Salin Kode Tiket' }}
                </button>

                <!-- Simulasi Barcode Visual -->
                <div class="barcode-container my-3 mx-auto p-2 bg-white rounded border" style="max-width: 320px;">
                  <div class="barcode-lines"></div>
                  <div class="small font-monospace text-muted mt-1">{{ ticket.ticket_code }}</div>
                </div>

                <p class="small text-muted mb-0">
                  Tunjukkan kode tiket atau barcode ini kepada panitia saat presensi / check-in di lokasi acara.
                </p>
              </div>

              <!-- IDENTITAS PESERTA -->
              <div class="row g-3 mb-4">
                <div class="col-sm-6">
                  <div class="p-3 bg-light rounded-3 h-100">
                    <div class="text-secondary small">Nama Peserta:</div>
                    <div class="fw-bold text-dark">{{ auth.user?.name || 'Peserta EventHub' }}</div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="p-3 bg-light rounded-3 h-100">
                    <div class="text-secondary small">Email:</div>
                    <div class="fw-bold text-dark">{{ auth.user?.email || 'peserta@eventhub.test' }}</div>
                  </div>
                </div>
              </div>

              <!-- REKAP JAWABAN FORMULIR PENDAFTARAN DINAMIS -->
              <div v-if="ticket.answers && ticket.answers.length" class="mt-4 pt-3 border-top">
                <h6 class="fw-bold text-dark mb-3">Data Formulir Tambahan Peserta:</h6>
                <div class="table-responsive">
                  <table class="table table-sm table-bordered mb-0">
                    <thead class="table-light">
                      <tr>
                        <th style="width: 45%;">Pertanyaan</th>
                        <th>Jawaban</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="ans in ticket.answers" :key="ans.id">
                        <td class="text-secondary">{{ ans.field?.label || `Pertanyaan #${ans.form_field_id}` }}</td>
                        <td class="fw-semibold text-dark">{{ ans.answer }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- TICKET FOOTER -->
            <div class="ticket-footer bg-light p-3 text-center border-top text-muted small">
              Diterbitkan secara digital oleh EventHub MPTI • Waktu Registrasi: {{ formatDateTime(ticket.registered_at) }}
            </div>
          </div>

          <!-- Bottom Action Buttons (Hidden saat Print) -->
          <div class="d-flex justify-content-center gap-3 mt-4 no-print">
            <button class="btn btn-primary px-4 py-2 rounded-pill fw-bold" @click="printTicket">
              🖨️ Cetak Tiket Sekarang
            </button>
            <router-link to="/my-registrations" class="btn btn-outline-secondary px-4 py-2 rounded-pill">
              Kembali ke Daftar Tiket Saya
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { eventService } from '../../services/eventService'

const route = useRoute()
const auth = useAuthStore()

const ticket = ref(null)
const loading = ref(true)
const errorMessage = ref('')
const copySuccess = ref(false)

// Sample Dummy Ticket Fallback untuk keperluan Slicing UI
const DUMMY_TICKET = {
  id: 1,
  user_id: 1,
  event_id: 1,
  status: 'registered',
  ticket_code: 'EVT-1-K3M9QX2A',
  registered_at: '2026-11-12T09:15:00+07:00',
  checked_in_at: null,
  event: {
    id: 1,
    title: 'Seminar Nasional Artificial Intelligence & Masa Depan Pendidikan',
    location: 'Auditorium Utama UNS, Surakarta',
    start_time: '2026-12-15T09:00:00+07:00',
    category: { id: 1, name: 'Seminar' },
  },
  answers: [
    {
      id: 1,
      form_field_id: 11,
      answer: 'Universitas Sebelas Maret',
      field: { id: 11, label: 'Asal Universitas / Instansi' },
    },
    {
      id: 2,
      form_field_id: 12,
      answer: '081234567890',
      field: { id: 12, label: 'Nomor WhatsApp Aktif' },
    },
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

function copyTicketCode() {
  if (!ticket.value?.ticket_code) return
  navigator.clipboard.writeText(ticket.value.ticket_code)
  copySuccess.value = true
  setTimeout(() => {
    copySuccess.value = false
  }, 2500)
}

function printTicket() {
  window.print()
}

async function loadTicketData() {
  loading.value = true
  errorMessage.value = ''
  const ticketId = route.params.id

  try {
    const res = await eventService.getRegistrationDetail(ticketId)
    if (res.data) {
      ticket.value = res.data
    } else {
      ticket.value = DUMMY_TICKET
    }
  } catch {
    // Demo Slicing Mode: gunakan data dummy
    ticket.value = DUMMY_TICKET
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTicketData()
})
</script>

<style scoped>
.ticket-card {
  border-radius: 1.25rem;
}

.ticket-header {
  border-bottom: 2px dashed rgba(255, 255, 255, 0.4);
}

.ticket-stub {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
}

.tracking-wide {
  letter-spacing: 0.1em;
}

.tracking-wider {
  letter-spacing: 0.15em;
}

/* Simulasi Barcode CSS */
.barcode-lines {
  height: 48px;
  background: repeating-linear-gradient(
    90deg,
    #0f172a 0px,
    #0f172a 2px,
    transparent 2px,
    transparent 4px,
    #0f172a 4px,
    #0f172a 7px,
    transparent 7px,
    transparent 10px,
    #0f172a 10px,
    #0f172a 14px,
    transparent 14px,
    transparent 16px
  );
  width: 100%;
}

/* PRINT CSS OPTIMIZATION */
@media print {
  .no-print {
    display: none !important;
  }

  body {
    background: white !important;
  }

  .ticket-card {
    border: 1px solid #000 !important;
    box-shadow: none !important;
  }
}
</style>
