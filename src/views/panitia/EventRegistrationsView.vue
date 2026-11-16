<template>
  <div class="event-registrations-page pb-5">
    <!-- Breadcrumb & Header Navigasi -->
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-1 small">
            <li class="breadcrumb-item">
              <router-link to="/organizer/events" class="text-decoration-none">Event Saya</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Daftar Pendaftar</li>
          </ol>
        </nav>
        <h2 class="h4 fw-bold text-dark mb-0">Data Peserta & Jawaban Formulir</h2>
      </div>

      <div class="d-flex gap-2">
        <router-link :to="`/organizer/events/${route.params.id}/report`" class="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold">
          📥 Buka Laporan & Ekspor Excel
        </router-link>
        <router-link to="/organizer/events" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          ← Kembali ke Event Saya
        </router-link>
      </div>
    </div>

    <!-- Ringkasan Info Event -->
    <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
      <div class="row align-items-center g-3">
        <div class="col-md-7">
          <span class="badge bg-primary px-3 py-1 rounded-pill small mb-2">Seminar</span>
          <h4 class="fw-bold text-dark mb-1">{{ eventTitle }}</h4>
          <div class="small text-secondary d-flex flex-wrap gap-3">
            <span>🗓️ 15 Des 2026, 09:00 WIB</span>
            <span>📍 Auditorium Utama UNS</span>
          </div>
        </div>

        <div class="col-md-5">
          <div class="bg-light p-3 rounded-3 border">
            <div class="d-flex justify-content-between small fw-semibold text-secondary mb-1">
              <span>Kapasitas Terisi:</span>
              <span class="text-dark">{{ participants.length }} / 250 Peserta</span>
            </div>
            <div class="progress" style="height: 6px;">
              <div
                class="progress-bar bg-primary"
                :style="{ width: `${Math.round((participants.length / 250) * 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Pencarian Peserta -->
    <div class="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
      <div class="row g-3 align-items-center">
        <div class="col-12 col-md-7">
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0 text-muted">🔍</span>
            <input
              v-model="filters.search"
              type="text"
              class="form-control bg-light border-start-0"
              placeholder="Cari nama peserta, email, instansi, atau kode tiket..."
            />
          </div>
        </div>

        <div class="col-12 col-md-5">
          <select v-model="filters.status" class="form-select bg-light">
            <option value="all">Semua Status Presensi</option>
            <option value="registered">Belum Hadir (Terdaftar)</option>
            <option value="attended">Sudah Hadir (Checked-In)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- TABEL PENDAFTAR & JAWABAN FORMULIR DINAMIS -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4" style="width: 50px;">No</th>
              <th>Kode Tiket</th>
              <th>Nama Peserta</th>
              <th>Email</th>
              <th>Asal Instansi / Kampus</th>
              <th>WhatsApp</th>
              <th>Status Presensi</th>
              <th class="text-end pe-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, index) in filteredParticipants" :key="p.id">
              <td class="ps-4 text-muted small">{{ index + 1 }}</td>
              <td>
                <span class="badge bg-light text-primary border font-monospace">
                  {{ p.ticket_code }}
                </span>
              </td>
              <td class="fw-bold text-dark">{{ p.name }}</td>
              <td class="small text-secondary">{{ p.email }}</td>
              <td class="small text-dark">{{ p.answers.instansi }}</td>
              <td class="small font-monospace">{{ p.answers.whatsapp }}</td>
              <td>
                <span
                  v-if="p.status === 'attended'"
                  class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small"
                >
                  ✓ Hadir
                </span>
                <span
                  v-else
                  class="badge bg-secondary-subtle text-secondary border px-2 py-1 small"
                >
                  ● Belum Hadir
                </span>
              </td>
              <td class="text-end pe-4">
                <button
                  v-if="p.status === 'registered'"
                  class="btn btn-outline-success btn-sm rounded-pill px-3"
                  @click="toggleCheckIn(p)"
                >
                  Tandai Hadir
                </button>
                <span v-else class="text-success small fw-semibold">
                  Selesai
                </span>
              </td>
            </tr>

            <tr v-if="filteredParticipants.length === 0">
              <td colspan="8" class="text-center py-4 text-muted">
                Tidak ada data pendaftar yang cocok dengan pencarian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const eventTitle = ref('Seminar Nasional Artificial Intelligence & Masa Depan Pendidikan')

const filters = reactive({
  search: '',
  status: 'all',
})

// Dataset Mock Pendaftar sesuai Bab 7.5 Dokumen Konsep
const participants = ref([
  {
    id: 1,
    ticket_code: 'EVT-1-K3M9QX2A',
    name: 'Peserta Demo',
    email: 'peserta@eventhub.test',
    status: 'registered',
    registered_at: '2026-11-12 09:15',
    answers: {
      instansi: 'Universitas Sebelas Maret',
      whatsapp: '081234567890',
    },
  },
  {
    id: 3,
    ticket_code: 'EVT-1-B7X4MN2P',
    name: 'Budi Santoso',
    email: 'budi@eventhub.test',
    status: 'registered',
    registered_at: '2026-11-12 11:00',
    answers: {
      instansi: 'Universitas Indonesia',
      whatsapp: '085678901234',
    },
  },
  {
    id: 4,
    ticket_code: 'EVT-1-S9T1KL5R',
    name: 'Siti Aminah',
    email: 'siti@eventhub.test',
    status: 'attended',
    registered_at: '2026-11-12 14:20',
    answers: {
      instansi: 'Institut Teknologi Bandung',
      whatsapp: '089876543210',
    },
  },
])

const filteredParticipants = computed(() => {
  return participants.value.filter((p) => {
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      const matchName = p.name.toLowerCase().includes(q)
      const matchEmail = p.email.toLowerCase().includes(q)
      const matchCode = p.ticket_code.toLowerCase().includes(q)
      const matchInstansi = p.answers.instansi.toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchCode && !matchInstansi) return false
    }

    if (filters.status !== 'all') {
      if (p.status !== filters.status) return false
    }

    return true
  })
})

function toggleCheckIn(p) {
  p.status = 'attended'
}
</script>
