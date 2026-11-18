<script setup>
import { ref, computed, onMounted } from 'vue'
import { eventService } from '../../services/eventService'

const statusFilter = ref('all')
const timeFilter = ref('all')
const currentPage = ref(1)

// Default data sesuai Figma Mockup 2002:2530
const transactions = ref([
  {
    id: 'TRX-20261014-9901',
    event_title: 'Seminar Nasional AI & Karir Digital',
    organizer: 'BEM Fasilkom UI',
    amount: 'Rp 50.000',
    status: 'Dibayar',
    time: '14 Okt 2026, 10:15',
  },
  {
    id: 'TRX-20261014-9902',
    event_title: 'Workshop UI/UX Design System 2026',
    organizer: 'HIMASISVO Unair',
    amount: 'Rp 50.000',
    status: 'Dibayar',
    time: '14 Okt 2026, 09:40',
  },
  {
    id: 'TRX-20261014-9903',
    event_title: 'Lomba Inovasi Startup Mahasiswa',
    organizer: 'UKM Startup Hub ITB',
    amount: 'Rp 50.000',
    status: 'Dibayar',
    time: '14 Okt 2026, 08:22',
  },
  {
    id: 'TRX-20261013-8894',
    event_title: 'Turnamen Mobile Legends Se-Jabodetabek',
    organizer: 'Esport Club Jakarta',
    amount: 'Rp 50.000',
    status: 'Refund (Ditolak)',
    time: '13 Okt 2026, 17:15',
  },
  {
    id: 'TRX-20261013-8895',
    event_title: 'Pelatihan Public Speaking Intensif',
    organizer: 'Toastmasters Muda',
    amount: 'Rp 50.000',
    status: 'Menunggu Pembayaran',
    time: '13 Okt 2026, 15:40',
  },
  {
    id: 'TRX-20261012-7781',
    event_title: 'Dies Natalis Fasilkom UI ke-38',
    organizer: 'Panitia Dies Natalis',
    amount: 'Rp 50.000',
    status: 'Dibayar',
    time: '12 Okt 2026, 11:20',
  },
])

onMounted(async () => {
  try {
    const res = await eventService.getDeveloperPayments()
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      transactions.value = res.data
    }
  } catch {
    // Cek tambahan transaksi dari localStorage
    const local = JSON.parse(localStorage.getItem('eventhub_local_payments') || '[]')
    if (local.length > 0) {
      const mapped = local.map((item) => ({
        id: item.id,
        event_title: item.event_title,
        organizer: item.organizer_name || 'Panitia BEM',
        amount: 'Rp 50.000',
        status: item.status || 'Dibayar',
        time: item.paid_at || 'Baru saja',
      }))
      transactions.value = [...mapped, ...transactions.value]
    }
  }
})

const filteredTransactions = computed(() => {
  return transactions.value.filter((t) => {
    if (statusFilter.value === 'paid') return t.status === 'Dibayar'
    if (statusFilter.value === 'pending') return t.status === 'Menunggu Pembayaran'
    if (statusFilter.value === 'refund') return t.status.includes('Refund')
    return true
  })
})
</script>

<template>
  <div class="monitoring-transaksi-mockup py-2" style="max-width: 1152px;">
    <!-- Header (Figma 2002:2580) -->
    <div class="mb-4">
      <h1 class="fw-bold mb-1" style="color: #0f172a; font-size: 24px;">
        Monitoring Transaksi
      </h1>
      <p class="mb-0" style="color: #64748b; font-size: 14px;">
        Audit seluruh penerimaan pembayaran listing fee Rp 50.000 dan proses refund transaksi.
      </p>
    </div>

    <!-- 3 Summary Blocks with 4px left bar alternating #4F46E5 and #7C3AED (Figma 2002:2585) -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <div class="kpi-block kpi-indigo p-3 h-100">
          <div class="fw-bold text-uppercase mb-1" style="color: #64748b; font-size: 12px; letter-spacing: 0.6px;">
            DIBAYAR (SELESAI)
          </div>
          <div class="fw-bold mb-1" style="color: #22a55b; font-size: 24px;">
            24 Transaksi
          </div>
          <div style="color: #64748b; font-size: 12px;">
            Total: Rp 1.200.000 (Diterima)
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="kpi-block kpi-violet p-3 h-100">
          <div class="fw-bold text-uppercase mb-1" style="color: #64748b; font-size: 12px; letter-spacing: 0.6px;">
            MENUNGGU PEMBAYARAN
          </div>
          <div class="fw-bold mb-1" style="color: #0f172a; font-size: 24px;">
            3 Draft
          </div>
          <div style="color: #64748b; font-size: 12px;">
            Dalam batas 24 jam pembayaran
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="kpi-block kpi-indigo p-3 h-100">
          <div class="fw-bold text-uppercase mb-1" style="color: #64748b; font-size: 12px; letter-spacing: 0.6px;">
            REFUND (EVENT DITOLAK)
          </div>
          <div class="fw-bold mb-1" style="color: #d64545; font-size: 24px;">
            2 Transaksi
          </div>
          <div style="color: #64748b; font-size: 12px;">
            Total: Rp 100.000 (Dikembalikan)
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Bar (Figma 2002:2607) -->
    <div class="eh-card p-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
      <div class="d-flex flex-wrap gap-3">
        <select v-model="statusFilter" class="form-select eh-select" style="width: 192px;">
          <option value="all">Semua Status</option>
          <option value="paid">Dibayar</option>
          <option value="pending">Menunggu Pembayaran</option>
          <option value="refund">Refund (Ditolak)</option>
        </select>

        <select v-model="timeFilter" class="form-select eh-select" style="width: 192px;">
          <option value="all">Semua Waktu</option>
          <option value="today">Hari Ini</option>
          <option value="week">7 Hari Terakhir</option>
        </select>
      </div>

      <div style="color: #64748b; font-size: 12px;">
        Menampilkan <strong style="color: #0f172a;">{{ filteredTransactions.length }}</strong> dari 29 catatan
      </div>
    </div>

    <!-- Transactions Table (Figma 2002:2623) -->
    <div class="eh-card overflow-hidden mb-3">
      <div class="table-responsive">
        <table class="table mb-0 align-middle">
          <thead style="background-color: #e0e7ff; border-bottom: 1px solid #c7d2fe;">
            <tr style="color: #3730a3; font-size: 12px; letter-spacing: 0.6px;" class="text-uppercase fw-bold">
              <th class="py-3 px-4" style="background-color: #e0e7ff; color: #3730a3;">ID TRANSAKSI</th>
              <th class="py-3 px-4" style="background-color: #e0e7ff; color: #3730a3;">EVENT</th>
              <th class="py-3 px-4" style="background-color: #e0e7ff; color: #3730a3;">PANITIA</th>
              <th class="py-3 px-4" style="background-color: #e0e7ff; color: #3730a3;">NOMINAL</th>
              <th class="py-3 px-4" style="background-color: #e0e7ff; color: #3730a3;">STATUS</th>
              <th class="py-3 px-4" style="background-color: #e0e7ff; color: #3730a3;">WAKTU</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trx in filteredTransactions" :key="trx.id" style="border-bottom: 1px solid #e2e8f0;">
              <td class="py-3 px-4 font-monospace fw-bold" :style="{ color: trx.status === 'Dibayar' ? '#4f46e5' : '#64748b', fontSize: '12px' }">
                {{ trx.id }}
              </td>
              <td class="py-3 px-4" style="color: #0f172a; font-size: 14px;">
                {{ trx.event_title }}
              </td>
              <td class="py-3 px-4" style="color: #64748b; font-size: 14px;">
                {{ trx.organizer }}
              </td>
              <td
                class="py-3 px-4 fw-bold"
                :style="{
                  color: trx.status.includes('Refund') ? '#d64545' : trx.status === 'Dibayar' ? '#0f172a' : '#64748b',
                  fontSize: '14px',
                }"
              >
                {{ trx.amount }}
              </td>
              <td class="py-3 px-4">
                <span
                  v-if="trx.status === 'Dibayar'"
                  class="badge rounded-pill text-white fw-bold px-3 py-1"
                  style="background-color: #22a55b; font-size: 12px;"
                >
                  Dibayar
                </span>
                <span
                  v-else-if="trx.status.includes('Refund')"
                  class="badge rounded-pill text-white fw-bold px-3 py-1"
                  style="background-color: #d64545; font-size: 12px;"
                >
                  Refund (Ditolak)
                </span>
                <span
                  v-else
                  class="badge rounded-pill fw-bold px-3 py-1"
                  style="background-color: #f5c542; color: #0f172a; font-size: 12px;"
                >
                  Menunggu Pembayaran
                </span>
              </td>
              <td class="py-3 px-4" style="color: #64748b; font-size: 12px;">
                {{ trx.time }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination (Figma 2002:2724) -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
      <div style="color: #64748b; font-size: 12px;">
        Menampilkan 1-{{ filteredTransactions.length }} dari 29 catatan
      </div>
      <div class="d-flex align-items-center gap-1">
        <button
          type="button"
          class="btn btn-sm bg-white px-3 py-1"
          style="border: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;"
          disabled
        >
          Sebelumnya
        </button>
        <button
          type="button"
          class="btn btn-sm fw-bold text-white d-flex align-items-center justify-content-center"
          style="width: 32px; height: 32px; background-color: #4f46e5; font-size: 12px;"
          @click="currentPage = 1"
        >
          1
        </button>
        <button
          type="button"
          class="btn btn-sm bg-white d-flex align-items-center justify-content-center"
          style="width: 32px; height: 32px; border: 1px solid #c7d2fe; color: #0f172a; font-size: 12px;"
          @click="currentPage = 2"
        >
          2
        </button>
        <button
          type="button"
          class="btn btn-sm bg-white px-3 py-1"
          style="border: 1px solid #4f46e5; color: #4f46e5; font-size: 12px;"
        >
          Selanjutnya
        </button>
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

.kpi-block {
  background-color: #ffffff;
  border-top: 1px solid #c7d2fe;
  border-right: 1px solid #c7d2fe;
  border-bottom: 1px solid #c7d2fe;
  border-radius: 4px;
}

.kpi-indigo {
  border-left: 4px solid #4f46e5;
}

.kpi-violet {
  border-left: 4px solid #7c3aed;
}

.eh-select {
  border: 1px solid #c7d2fe;
  border-radius: 4px;
  color: #0f172a;
  font-size: 14px;
}
</style>
