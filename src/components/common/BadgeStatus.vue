<template>
  <span
    class="badge px-3 py-1 rounded-pill fw-semibold text-uppercase font-monospace small"
    :class="badgeClass"
  >
    {{ labelText }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

// Sesuai Aturan Warna Badge Bab 9.2 Dokumen Konsep Proyek v3.0:
// Draft (kuning), Menunggu review (biru), Ditolak (merah), Tayang (hijau), KUOTA HABIS (abu gelap), Selesai (abu).
const statusConfig = {
  draft: {
    label: 'Draft',
    class: 'bg-warning text-dark',
  },
  menunggu_review: {
    label: 'Menunggu Review',
    class: 'bg-primary text-white',
  },
  menunggu_pembayaran: {
    label: 'Menunggu Bayar',
    class: 'bg-warning text-dark',
  },
  ditolak: {
    label: 'Ditolak',
    class: 'bg-danger text-white',
  },
  tayang: {
    label: 'Tayang',
    class: 'bg-success text-white',
  },
  kuota_habis: {
    label: 'KUOTA HABIS',
    class: 'bg-dark text-white',
  },
  selesai: {
    label: 'Selesai',
    class: 'bg-secondary text-white',
  },
  registered: {
    label: 'Terdaftar',
    class: 'bg-info text-white',
  },
  attended: {
    label: 'Hadir',
    class: 'bg-success text-white',
  },
}

const badgeClass = computed(() => {
  return statusConfig[props.status]?.class || 'bg-secondary text-white'
})

const labelText = computed(() => {
  return statusConfig[props.status]?.label || props.status
})
</script>

