<template>
  <div class="panitia-dashboard pb-5">
    <!-- ======================================================================= -->
    <!-- 1. WELCOME BANNER & AKSI CEPAT                                          -->
    <!-- ======================================================================= -->
    <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-gradient-panitia text-white">
      <div class="row align-items-center g-3">
        <div class="col-md-8">
          <span class="badge bg-white bg-opacity-25 px-3 py-1 rounded-pill small mb-2">
            🎪 Organizer Workspace
          </span>
          <h2 class="h3 fw-bold mb-1">
            Halo, {{ auth.userName || 'Panitia Penyelenggara' }}! 👋
          </h2>
          <p class="opacity-90 small mb-0">
            Kelola penayangan event kampus, publikasikan formulir pendaftaran dinamis, dan lakukan presensi check-in peserta.
          </p>
        </div>
        <div class="col-md-4 text-md-end">
          <div class="d-flex gap-2 justify-content-md-end flex-wrap">
            <router-link to="/organizer/events/create" class="btn btn-light fw-bold px-3 py-2 rounded-pill shadow-sm">
              ➕ Buat Event Baru
            </router-link>
            <router-link to="/organizer/check-in" class="btn btn-outline-light px-3 py-2 rounded-pill">
              🎟️ Presensi Hari-H
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- 2. WIDGET HITUNG MUNDUR SEWA DRAFT (Bab 9.2, K-16, BR-08)               -->
    <!-- ======================================================================= -->
    <div v-if="activeDraftEvent" class="card border-warning border-2 shadow-sm rounded-4 mb-4 bg-warning bg-opacity-10 overflow-hidden">
      <div class="card-body p-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3">
            <span class="display-6">⏱️</span>
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <h5 class="fw-bold text-dark mb-0">Menunggu Pembayaran Sewa Penayangan</h5>
                <span class="badge bg-warning text-dark font-monospace small">DRAFT AKTIF</span>
              </div>
              <p class="small text-secondary mb-1">
                Event: <strong>"{{ activeDraftEvent.title }}"</strong> belum aktif karena sewa penayangan Rp50.000 belum dibayar.
              </p>
              <div class="small text-danger fw-semibold">
                ⚠️ Batas Waktu: Draft akan otomatis dihapus permanen oleh sistem jika tidak dibayar dalam 24 jam sejak dibuat.
              </div>
            </div>
          </div>

          <div class="d-flex flex-column align-items-md-end gap-2">
            <!-- Komponen Hitung Mundur Reusable -->
            <CountdownTimer :deadline="activeDraftEvent.payment_deadline" />
            <router-link
              :to="`/organizer/events/${activeDraftEvent.id}/payment`"
              class="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm"
            >
              💳 Bayar Sewa Sekarang (Midtrans) →
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- 3. METRIK STATISTIK EVENT SAYA                                         -->
    <!-- ======================================================================= -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-secondary small fw-semibold">Total Event Saya</span>
            <span class="fs-4">📁</span>
          </div>
          <div class="display-6 fw-bold text-dark">{{ stats.total }}</div>
          <small class="text-muted" style="font-size: 0.75rem;">Semua event yang Anda buat</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-secondary small fw-semibold">Sedang Tayang</span>
            <span class="fs-4">🟢</span>
          </div>
          <div class="display-6 fw-bold text-success">{{ stats.tayang }}</div>
          <small class="text-muted" style="font-size: 0.75rem;">Aktif di katalog publik</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-secondary small fw-semibold">Menunggu Review</span>
            <span class="fs-4">⏳</span>
          </div>
          <div class="display-6 fw-bold text-primary">{{ stats.menunggu_review }}</div>
          <small class="text-muted" style="font-size: 0.75rem;">Dalam antrean verifikasi</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-secondary small fw-semibold">Total Pendaftar</span>
            <span class="fs-4">👥</span>
          </div>
          <div class="display-6 fw-bold text-indigo">{{ stats.totalPendaftar }}</div>
          <small class="text-muted" style="font-size: 0.75rem;">Peserta di semua event Anda</small>
        </div>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- 4. TABEL EVENT TERBARU & WIDGET NOTIFIKASI                             -->
    <!-- ======================================================================= -->
    <div class="row g-4">
      <!-- Kolom Kiri: Tabel Event Terbaru Saya -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white">
          <div class="card-header bg-white p-4 border-bottom d-flex align-items-center justify-content-between">
            <div>
              <h5 class="fw-bold text-dark mb-0">Event Terbaru Saya</h5>
              <small class="text-secondary">Daftar event yang baru saja Anda kelola</small>
            </div>
            <router-link to="/organizer/events" class="btn btn-outline-primary btn-sm rounded-pill px-3">
              Lihat Semua →
            </router-link>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">Event</th>
                  <th>Kategori</th>
                  <th>Jadwal Acara</th>
                  <th>Kuota</th>
                  <th>Status</th>
                  <th class="text-end pe-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="evt in recentEvents" :key="evt.id">
                  <td class="ps-4">
                    <div class="fw-semibold text-dark text-truncate" style="max-width: 220px;" :title="evt.title">
                      {{ evt.title }}
                    </div>
                    <small class="text-muted">{{ evt.location }}</small>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark border">{{ evt.category?.name || 'Umum' }}</span>
                  </td>
                  <td class="small text-secondary">
                    {{ formatDateTime(evt.start_time) }}
                  </td>
                  <td>
                    <div class="small fw-semibold">
                      {{ evt.quota - evt.remaining_quota }} / {{ evt.quota }}
                    </div>
                    <div class="progress" style="height: 4px; width: 60px;">
                      <div
                        class="progress-bar"
                        :style="{ width: `${Math.round(((evt.quota - evt.remaining_quota) / evt.quota) * 100)}%` }"
                      ></div>
                    </div>
                  </td>
                  <td>
                    <!-- Komponen Badge Status Reusable -->
                    <BadgeStatus :status="evt.status" />
                  </td>
                  <td class="text-end pe-4">
                    <div class="btn-group btn-group-sm">
                      <router-link
                        v-if="evt.status === 'draft'"
                        :to="`/organizer/events/${evt.id}/payment`"
                        class="btn btn-outline-warning"
                        title="Bayar Sewa"
                      >
                        💳
                      </router-link>
                      <router-link
                        :to="`/organizer/events/${evt.id}/registrations`"
                        class="btn btn-outline-secondary"
                        title="Data Peserta"
                      >
                        👥
                      </router-link>
                      <router-link
                        :to="`/organizer/events/${evt.id}/report`"
                        class="btn btn-outline-primary"
                        title="Laporan & Unduh Excel"
                      >
                        📊
                      </router-link>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Kolom Kanan: Panel Ringkasan Notifikasi & Bantuan -->
      <div class="col-lg-4">
        <!-- Widget Notifikasi Panitia -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h5 class="fw-bold text-dark mb-0">Pemberitahuan</h5>
            <span class="badge bg-primary rounded-pill small">Terbaru</span>
          </div>

          <div class="d-flex flex-column gap-3">
            <div
              v-for="notif in recentNotifications"
              :key="notif.id"
              class="p-3 rounded-3 border-start border-3 transition-all"
              :class="notif.borderClass"
              style="background-color: #f8fafc;"
            >
              <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="fw-bold small text-dark">{{ notif.title }}</span>
                <span class="text-muted" style="font-size: 0.7rem;">{{ notif.time }}</span>
              </div>
              <p class="small text-secondary mb-0 line-clamp-2">{{ notif.message }}</p>
            </div>
          </div>
        </div>

        <!-- Widget Panduan Singkat Alur Sewa Event (Bab 1.3 & Flow 6 Babak) -->
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-light">
          <h6 class="fw-bold text-dark mb-2">📌 Alur Publikasi Event EventHub:</h6>
          <ol class="small text-secondary ps-3 mb-0 d-flex flex-column gap-1">
            <li>Isi formulir acara & pertanyaan dinamis.</li>
            <li>Simpan sebagai <strong>Draft</strong>.</li>
            <li>Bayar sewa penayangan Rp50.000 via Midtrans sebelum batas 24 jam.</li>
            <li>Developer meninjau & menyetujui acara.</li>
            <li>Event otomatis <strong>Tayang</strong> di katalog publik!</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import CountdownTimer from '../../components/common/CountdownTimer.vue'
import BadgeStatus from '../../components/common/BadgeStatus.vue'

const auth = useAuthStore()

// Sample Dataset Mock Panitia Sesuai Bab 7.5 Dokumen Konsep Proyek v3.0
const recentEvents = ref([
  {
    id: 1,
    title: 'Seminar Nasional Artificial Intelligence & Masa Depan Pendidikan',
    category: { name: 'Seminar' },
    location: 'Auditorium Utama UNS',
    start_time: '2026-12-15T09:00:00+07:00',
    quota: 250,
    remaining_quota: 247,
    status: 'tayang',
  },
  {
    id: 9,
    title: 'Open Recruitment Panitia Dies Natalis 2026',
    category: { name: 'Perekrutan' },
    location: 'Student Center UNS',
    start_time: '2026-12-01T09:00:00+07:00',
    quota: 150,
    remaining_quota: 150,
    status: 'menunggu_review',
  },
  {
    id: 12,
    title: 'Workshop Cloud Native & Kubernetes Essentials',
    category: { name: 'Workshop' },
    location: 'Lab Jaringan Komputer',
    start_time: '2026-12-10T09:00:00+07:00',
    quota: 40,
    remaining_quota: 40,
    status: 'draft',
    payment_deadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 jam lagi
  },
  {
    id: 11,
    title: 'Gathering Komunitas Game Liar Solo',
    category: { name: 'Komunitas' },
    location: 'Warkop Manahan',
    start_time: '2026-11-30T10:00:00+07:00',
    quota: 30,
    remaining_quota: 30,
    status: 'ditolak',
  },
])

// Event Draft yang butuh pembayaran sewa segera
const activeDraftEvent = computed(() => {
  return recentEvents.value.find((e) => e.status === 'draft' && e.payment_deadline)
})

const stats = computed(() => {
  const all = recentEvents.value
  return {
    total: all.length,
    tayang: all.filter((e) => e.status === 'tayang').length,
    menunggu_review: all.filter((e) => e.status === 'menunggu_review').length,
    draft: all.filter((e) => e.status === 'draft').length,
    totalPendaftar: all.reduce((acc, curr) => acc + (curr.quota - curr.remaining_quota), 0),
  }
})

const recentNotifications = ref([
  {
    id: 1,
    title: 'Event Disetujui Developer',
    message: 'Event "Seminar Nasional AI" telah diverifikasi dan sedang tayang di katalog publik.',
    time: 'Hari ini, 09:30',
    borderClass: 'border-success',
  },
  {
    id: 2,
    title: 'Pengajuan Ditolak',
    message: 'Event "Gathering Komunitas Game Liar Solo" ditolak: Deskripsi tidak memenuhi syarat perizinan kampus.',
    time: 'Kemarin, 14:15',
    borderClass: 'border-danger',
  },
  {
    id: 3,
    title: 'Pembayaran Dikonfirmasi',
    message: 'Sewa penayangan Rp50.000 untuk draft acara telah tercatat di sistem.',
    time: '3 hari lalu',
    borderClass: 'border-primary',
  },
])

function formatDateTime(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}
</script>

<style scoped>
.bg-gradient-panitia {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
}

.text-indigo {
  color: #4f46e5;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
