<template>
  <div class="dropdown notification-dropdown">
    <button
      class="btn btn-light position-relative p-2 rounded-circle border shadow-sm"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      title="Notifikasi"
    >
      <span class="fs-5">🔔</span>
      <!-- Badge Unread Count -->
      <span
        v-if="unreadCount > 0"
        class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light"
      >
        {{ unreadCount }}
      </span>
    </button>

    <div class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 p-0 notification-panel">
      <!-- Header Dropdown -->
      <div class="d-flex align-items-center justify-content-between p-3 border-bottom bg-light rounded-top-4">
        <h6 class="fw-bold mb-0 text-dark">Notifikasi Sistem</h6>
        <button
          v-if="unreadCount > 0"
          class="btn btn-link btn-sm text-decoration-none p-0 text-primary small"
          @click="markAllAsRead"
        >
          Tandai Dibaca
        </button>
      </div>

      <!-- List Notifikasi -->
      <div class="notification-list overflow-auto" style="max-height: 320px;">
        <div
          v-for="item in notifications"
          :key="item.id"
          class="p-3 border-bottom notification-item transition-all"
          :class="{ 'bg-light bg-opacity-50': !item.is_read }"
          @click="markAsRead(item.id)"
        >
          <div class="d-flex align-items-start gap-2">
            <span class="fs-5 mt-1">{{ getNotificationIcon(item.type) }}</span>
            <div class="flex-grow-1">
              <div class="d-flex align-items-center justify-content-between">
                <span class="fw-bold small text-dark">{{ item.title }}</span>
                <span class="text-muted" style="font-size: 0.75rem;">{{ item.time }}</span>
              </div>
              <p class="small text-secondary mb-0 mt-1 line-clamp-2">
                {{ item.message }}
              </p>
            </div>
            <span v-if="!item.is_read" class="unread-dot rounded-circle bg-primary mt-2"></span>
          </div>
        </div>

        <div v-if="notifications.length === 0" class="p-4 text-center text-muted small">
          Belum ada notifikasi baru.
        </div>
      </div>

      <!-- Footer Dropdown -->
      <div class="p-2 border-top text-center bg-light rounded-bottom-4">
        <small class="text-secondary">Pemberitahuan resmi EventHub</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const notifications = ref([
  {
    id: 1,
    title: 'Event Disetujui & Tayang',
    message: 'Event "Seminar Teknologi Informasi 2026" telah disetujui Developer dan sedang tayang di katalog publik.',
    time: '10 mnt lalu',
    type: 'success',
    is_read: false,
  },
  {
    id: 2,
    title: 'Pengajuan Event Ditolak',
    message: 'Event "Gathering Komunitas Game Liar Solo" ditolak: Deskripsi acara tidak jelas dan lokasi tidak memenuhi syarat perizinan kampus.',
    time: '2 jam lalu',
    type: 'danger',
    is_read: false,
  },
  {
    id: 3,
    title: 'Pembayaran Sewa Diterima',
    message: 'Pembayaran sewa penayangan Rp50.000 untuk event "UI/UX Boot Camp" telah berhasil diverifikasi.',
    time: '1 hari lalu',
    type: 'info',
    is_read: true,
  },
])

const unreadCount = computed(() => {
  return notifications.value.filter((n) => !n.is_read).length
})

function getNotificationIcon(type) {
  switch (type) {
    case 'success':
      return '✅'
    case 'danger':
      return '⚠️'
    case 'info':
      return '💳'
    default:
      return '📢'
  }
}

function markAllAsRead() {
  notifications.value.forEach((n) => {
    n.is_read = true
  })
}

function markAsRead(id) {
  const item = notifications.value.find((n) => n.id === id)
  if (item) item.is_read = true
}
</script>

<style scoped>
.notification-panel {
  width: 340px;
  max-width: 90vw;
}

.notification-item {
  cursor: pointer;
}

.notification-item:hover {
  background-color: #f1f5f9 !important;
}

.unread-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

