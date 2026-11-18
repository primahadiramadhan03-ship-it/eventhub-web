<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { eventService } from '../../services/eventService'

const route = useRoute()
const router = useRouter()
const eventId = route.params.id

const isLoading = ref(false)
const isProcessing = ref(false)
const showRejectModal = ref(false)
const rejectionReason = ref('')
const reasonError = ref('')
const actionSuccessBanner = ref(null) // 'approved' | 'rejected'

// Data Event sesuai Figma Mockup 2002:2357
const event = ref({
  id: eventId,
  mod_code: `#EVT-MOD-${String(eventId).padStart(4, '8821')}`,
  title: 'Seminar Nasional AI & Karir Digital',
  organizer: 'BEM Fasilkom UI',
  submitted_at: '14 Okt 2026, 10:15 WIB',
  status: 'menunggu_review',
  payment_status: 'Sewa Rp 50.000, Dibayar',
  transaction_id: 'TRX-20261014-9901',
  category_name: 'Seminar',
  quota_text: '100 Orang (Kapasitas Venue: 120 Orang)',
  schedule_text: '28 Oktober 2026, 09:00 - 13:00 WIB',
  deadline_text: '26 Oktober 2026, 23:59 WIB',
  location_text: 'Auditorium Gedung B, Fasilkom Kampus UI Depok',
  description_p1:
    'Seminar nasional ini ditujukan bagi mahasiswa dan praktisi pemula untuk memahami lanskap industri kecerdasan buatan, prospek karir engineering, product management, dan etika AI di Indonesia.',
  description_p2:
    'Acara tidak dipungut biaya pendaftaran (Gratis). Seluruh peserta terdaftar akan memperoleh e-sertifikat, kudapan siang, dan materi presentasi narasumber.',
  form_fields: [
    {
      id: 1,
      label: 'Asal fakultas dan program studi',
      is_required: true,
      type_label: 'Teks Singkat',
      helper: 'Input teks terbuka oleh peserta',
    },
    {
      id: 2,
      label: 'Jumlah anggota tim pendamping',
      is_required: true,
      type_label: 'Angka',
      helper: 'Input angka numerik (0 jika individu)',
    },
    {
      id: 3,
      label: 'Ukuran kaos seminar',
      is_required: true,
      type_label: 'Pilihan Dropdown',
      helper: 'Opsi: S, M, L, XL, XXL',
    },
  ],
})

onMounted(async () => {
  isLoading.value = true
  try {
    const res = await eventService.getDeveloperReviewDetail(eventId)
    if (res && res.data) {
      event.value = {
        ...event.value,
        ...res.data,
      }
    }
  } catch {
    // Fallback ke mockup default
  } finally {
    isLoading.value = false
  }
})

// Setujui dan Tayangkan (BR-12 & Figma 2007:6015)
const handleApprove = async () => {
  isProcessing.value = true
  try {
    try {
      await eventService.approveDeveloperEvent(eventId)
    } catch {
      // Fallback local
    }
    event.value.status = 'tayang'
    actionSuccessBanner.value = 'approved'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isProcessing.value = false
  }
}

// Buka Modal Konfirmasi Tolak (BR-13 & Figma 2007:6365)
const openRejectConfirmation = () => {
  reasonError.value = ''
  if (!rejectionReason.value.trim()) {
    // Jika belum diisi, isi contoh atau tampilkan peringatan
    reasonError.value = 'Catatan alasan penolakan wajib diisi sebelum menolak pengajuan (BR-13).'
    return
  }
  showRejectModal.value = true
}

const fillSampleReason = () => {
  rejectionReason.value =
    'Kapasitas venue Auditorium Gedung B Fasilkom hanya 100 kursi fisik, namun kuota pendaftaran disetel 150 peserta tanpa konfirmasi penambahan kursi cadangan. Silakan ajukan ulang dengan penyesuaian kuota atau surat izin kapasitas.'
  reasonError.value = ''
}

const confirmRejectAndRefund = async () => {
  isProcessing.value = true
  try {
    try {
      await eventService.rejectDeveloperEvent(eventId, {
        rejection_reason: rejectionReason.value.trim(),
      })
    } catch {
      // Fallback local
    }
    event.value.status = 'ditolak'
    event.value.payment_status = 'Rp 50.000, Refund Diproses'
    showRejectModal.value = false
    actionSuccessBanner.value = 'rejected'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="review-detail-mockup py-2" style="max-width: 1152px;">
    <!-- Breadcrumb & Back (Figma 2002:2407) -->
    <div class="d-flex align-items-center gap-2 mb-3" style="font-size: 12px;">
      <router-link
        to="/admin/review"
        class="text-decoration-none d-inline-flex align-items-center gap-1"
        style="color: #64748b;"
      >
        <i class="bi bi-arrow-left"></i>
        <span>Antrean Moderasi</span>
      </router-link>
      <span style="color: #64748b;">/</span>
      <span style="color: #0f172a;">Tinjau Event {{ event.mod_code }}</span>
    </div>

    <!-- Banner Notifikasi Keputusan Moderasi (Figma 2007:6015 Setuju / Tolak) -->
    <div
      v-if="actionSuccessBanner === 'approved'"
      class="p-3 rounded-2 mb-4 d-flex justify-content-between align-items-center"
      style="background-color: #dcfce7; border: 1px solid #22a55b; color: #166534;"
    >
      <div>
        <strong class="d-block">✓ Event Berhasil Disetujui &amp; Ditayangkan!</strong>
        <span class="small">Acara kini telah tampil secara live di Katalog Event Publik.</span>
      </div>
      <router-link to="/admin/review" class="btn btn-sm btn-success">
        Kembali ke Antrean
      </router-link>
    </div>

    <div
      v-if="actionSuccessBanner === 'rejected'"
      class="p-3 rounded-2 mb-4 d-flex justify-content-between align-items-center"
      style="background-color: #fef2f2; border: 1px solid #d64545; color: #991b1b;"
    >
      <div>
        <strong class="d-block">✕ Pengajuan Event Ditolak &amp; Refund Dicatat</strong>
        <span class="small">Alasan penolakan telah dikirimkan ke Panitia dan dana Rp 50.000 dikembalikan.</span>
      </div>
      <router-link to="/admin/review" class="btn btn-sm btn-danger">
        Kembali ke Antrean
      </router-link>
    </div>

    <!-- Header Title & Status + Payment Info Banner (Figma 2002:2417) -->
    <div
      class="d-flex flex-wrap justify-content-between align-items-start gap-3 pb-4 mb-4"
      style="border-bottom: 1px solid #c7d2fe;"
    >
      <div>
        <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
          <h1 class="fw-bold mb-0" style="color: #0f172a; font-size: 24px;">
            {{ event.title }}
          </h1>
          <span
            v-if="event.status === 'menunggu_review'"
            class="badge rounded-pill text-white px-3 py-1 fw-bold"
            style="background-color: #3b82f6; font-size: 12px;"
          >
            Menunggu Review
          </span>
          <span
            v-else-if="event.status === 'tayang'"
            class="badge rounded-pill text-white px-3 py-1 fw-bold"
            style="background-color: #22a55b; font-size: 12px;"
          >
            Tayang
          </span>
          <span
            v-else
            class="badge rounded-pill text-white px-3 py-1 fw-bold"
            style="background-color: #d64545; font-size: 12px;"
          >
            Ditolak
          </span>
        </div>
        <div style="color: #64748b; font-size: 14px;">
          Diajukan oleh <strong style="color: #0f172a;">{{ event.organizer }}</strong> pada {{ event.submitted_at }}
        </div>
      </div>

      <!-- Payment Info Banner (Figma 2002:2426) -->
      <div class="eh-card px-3 py-2 text-md-end">
        <div style="color: #64748b; font-size: 12px;">Status Listing Fee</div>
        <div
          class="fw-bold"
          :style="{ color: event.status === 'ditolak' ? '#d64545' : '#22a55b', fontSize: '16px' }"
        >
          {{ event.payment_status }}
        </div>
        <div style="color: #64748b; font-size: 12px;">ID: {{ event.transaction_id }}</div>
      </div>
    </div>

    <!-- Two-Column Review Layout (Figma 2002:2433) -->
    <div class="row g-4">
      <!-- LEFT COLUMN (8 Cols): Event Information & Dynamic Form Preview -->
      <div class="col-12 col-lg-8 d-flex flex-column gap-4">
        <!-- Event Core Data Card (Figma 2002:2435) -->
        <div class="eh-card p-4">
          <div class="pb-3 mb-3" style="border-bottom: 1px solid #e2e8f0;">
            <h2 class="fw-bold mb-0" style="color: #0f172a; font-size: 16px;">Informasi Event</h2>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-12 col-sm-6">
              <div style="color: #64748b; font-size: 12px;">Kategori</div>
              <div style="color: #0f172a; font-size: 14px;">{{ event.category_name }}</div>
            </div>
            <div class="col-12 col-sm-6">
              <div style="color: #64748b; font-size: 12px;">Kuota Peserta</div>
              <div style="color: #0f172a; font-size: 14px;">{{ event.quota_text }}</div>
            </div>
            <div class="col-12 col-sm-6">
              <div style="color: #64748b; font-size: 12px;">Jadwal Pelaksanaan</div>
              <div style="color: #0f172a; font-size: 14px;">{{ event.schedule_text }}</div>
            </div>
            <div class="col-12 col-sm-6">
              <div style="color: #64748b; font-size: 12px;">Batas Akhir Pendaftaran</div>
              <div style="color: #0f172a; font-size: 14px;">{{ event.deadline_text }}</div>
            </div>
            <div class="col-12">
              <div style="color: #64748b; font-size: 12px;">Venue &amp; Lokasi</div>
              <div style="color: #0f172a; font-size: 14px;">{{ event.location_text }}</div>
            </div>
          </div>

          <div>
            <div class="mb-1" style="color: #64748b; font-size: 12px;">Deskripsi Lengkap</div>
            <div
              class="p-3 rounded-1"
              style="background-color: #eef2ff; border: 1px solid #c7d2fe; color: #0f172a; font-size: 14px; line-height: 1.6;"
            >
              <p class="mb-2">{{ event.description_p1 }}</p>
              <p class="mb-0">{{ event.description_p2 }}</p>
            </div>
          </div>
        </div>

        <!-- Dynamic Form Preview Card (Figma 2002:2467) -->
        <div class="eh-card p-4">
          <div
            class="d-flex justify-content-between align-items-center pb-3 mb-3"
            style="border-bottom: 1px solid #e2e8f0;"
          >
            <h2 class="fw-bold mb-0" style="color: #0f172a; font-size: 16px;">
              Pratinjau Formulir Pendaftaran
            </h2>
            <span style="color: #64748b; font-size: 12px;">
              {{ event.form_fields.length }} Pertanyaan Kustom
            </span>
          </div>

          <div class="d-flex flex-column gap-3">
            <div
              v-for="(field, idx) in event.form_fields"
              :key="field.id"
              class="p-3 rounded-1"
              style="background-color: #eef2ff; border: 1px solid #c7d2fe;"
            >
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span style="color: #0f172a; font-size: 12px;">
                  {{ idx + 1 }}. {{ field.label }}
                  <strong v-if="field.is_required" style="color: #d64545;">*</strong>
                </span>
                <span style="color: #64748b; font-size: 12px;">{{ field.type_label }}</span>
              </div>
              <div class="fst-italic" style="color: #64748b; font-size: 12px;">
                {{ field.helper }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN (4 Cols): Moderation Actions & Notes (Figma 2002:2498) -->
      <div class="col-12 col-lg-4 d-flex flex-column gap-4">
        <div class="eh-card p-4">
          <h2 class="fw-bold mb-2" style="color: #0f172a; font-size: 16px;">Keputusan Moderasi</h2>
          <p class="mb-3" style="color: #64748b; font-size: 12px; line-height: 1.5;">
            Pilih tindakan untuk event ini. Jika ditolak, listing fee Rp 50.000 akan otomatis dikembalikan (refund) ke panitia dan catatan alasan wajib diisi.
          </p>

          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="fw-bold mb-0" style="color: #0f172a; font-size: 12px;">
                Catatan alasan (wajib jika menolak)
              </label>
              <button
                type="button"
                class="btn btn-link btn-sm p-0 text-decoration-none"
                style="font-size: 11px; color: #4f46e5;"
                @click="fillSampleReason"
              >
                + Isi Contoh Alasan
              </button>
            </div>
            <textarea
              v-model="rejectionReason"
              rows="4"
              class="form-control"
              style="border: 1px solid #c7d2fe; border-radius: 4px; font-size: 13px;"
              placeholder="Tuliskan alasan penolakan secara jelas dan objektif untuk panitia..."
            ></textarea>
            <div v-if="reasonError" class="text-danger small mt-1" style="font-size: 12px;">
              {{ reasonError }}
            </div>
            <div class="mt-2" style="color: #64748b; font-size: 11px;">
              Catatan akan dikirimkan langsung ke dashboard panitia.
            </div>
          </div>

          <div class="pt-3 d-grid gap-2" style="border-top: 1px solid #e2e8f0;">
            <button
              type="button"
              class="btn fw-bold text-white py-2"
              style="background-color: #22a55b; border-radius: 4px; font-size: 14px;"
              :disabled="isProcessing || event.status === 'tayang'"
              @click="handleApprove"
            >
              Setujui dan Tayangkan
            </button>
            <button
              type="button"
              class="btn fw-bold py-2 bg-white"
              style="border: 1px solid #d64545; color: #d64545; border-radius: 4px; font-size: 14px;"
              :disabled="isProcessing || event.status === 'ditolak'"
              @click="openRejectConfirmation"
            >
              Tolak dan Refund
            </button>
          </div>
        </div>

        <!-- Ketentuan Kebijakan Platform (Figma 2002:2517) -->
        <div class="eh-card p-3">
          <div class="fw-bold mb-2" style="color: #0f172a; font-size: 12px;">
            Ketentuan Kebijakan Platform:
          </div>
          <ul class="mb-0 ps-3 d-flex flex-column gap-2" style="color: #64748b; font-size: 12px;">
            <li>Pastikan deskripsi event tidak mengandung ujaran kebencian, sara, atau konten ilegal.</li>
            <li>Pastikan kuota tidak melebihi kapasitas fisik venue terdaftar.</li>
            <li>Penolakan akan mengembalikan dana Rp 50.000 secara otomatis ke metode asal.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- MODAL KONFIRMASI PENOLAKAN EVENT (Figma 2007:6365)                  -->
    <!-- =================================================================== -->
    <div
      v-if="showRejectModal"
      class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
    >
      <div
        class="bg-white rounded-1 overflow-hidden shadow-lg w-100"
        style="max-width: 520px; border: 1px solid #c7d2fe;"
      >
        <!-- Modal Header (Figma 2007:6371) -->
        <div
          class="px-4 py-3 d-flex justify-content-between align-items-center"
          style="border-bottom: 1px solid #e2e8f0;"
        >
          <div class="d-flex align-items-center gap-2 fw-bold" style="color: #d64545; font-size: 16px;">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>Konfirmasi Penolakan Event</span>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-link text-secondary p-0 text-decoration-none"
            @click="showRejectModal = false"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Modal Body (Figma 2007:6380) -->
        <div class="p-4">
          <p class="mb-3" style="color: #64748b; font-size: 12px; line-height: 1.6;">
            Apakah kamu yakin ingin menolak event <strong style="color: #0f172a;">{{ event.title }}</strong>?
            Tindakan ini akan mengembalikan listing fee <strong style="color: #0f172a;">Rp 50.000</strong> ke saldo/rekening panitia dan mengubah status event menjadi
            <span
              class="badge rounded-pill text-white px-2"
              style="background-color: #d64545; font-size: 10px;"
            >
              Ditolak
            </span>.
          </p>

          <!-- Reason Filled In Box (Figma 2007:6386) -->
          <div
            class="p-3 rounded-1 mb-3"
            style="background-color: #eef2ff; border: 1px solid #c7d2fe;"
          >
            <div class="fw-bold mb-1" style="color: #64748b; font-size: 12px;">
              Catatan Alasan Penolakan:
            </div>
            <div style="color: #0f172a; font-size: 12px; line-height: 1.6;">
              "{{ rejectionReason }}"
            </div>
          </div>

          <div class="d-flex align-items-center gap-2" style="color: #64748b; font-size: 12px;">
            <i class="bi bi-info-circle"></i>
            <span>Refund dana sewa Rp 50.000 akan diproses secara instan oleh sistem.</span>
          </div>
        </div>

        <!-- Modal Footer (Figma 2007:6396) -->
        <div
          class="px-4 py-3 d-flex justify-content-end gap-2"
          style="background-color: #eef2ff; border-top: 1px solid #c7d2fe;"
        >
          <button
            type="button"
            class="btn bg-white px-3 py-2"
            style="border: 1px solid #4f46e5; color: #4f46e5; border-radius: 4px; font-size: 14px;"
            @click="showRejectModal = false"
          >
            Batal
          </button>
          <button
            type="button"
            class="btn text-white fw-bold px-3 py-2"
            style="background-color: #d64545; border-radius: 4px; font-size: 14px;"
            :disabled="isProcessing"
            @click="confirmRejectAndRefund"
          >
            Ya, Tolak dan Refund
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
  border-radius: 4px;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1055;
}
</style>
