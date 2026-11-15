<template>
  <div class="countdown-timer d-inline-flex align-items-center gap-2">
    <span v-if="isExpired" class="badge bg-danger px-3 py-2 rounded-pill font-monospace fw-bold">
      ⏱️ Kedaluwarsa (00:00:00)
    </span>
    <span
      v-else
      class="badge px-3 py-2 rounded-pill font-monospace fw-bold shadow-sm"
      :class="isUrgent ? 'bg-danger text-white pulse' : 'bg-warning text-dark'"
    >
      ⏱️ Sisa Waktu Bayar: {{ timeRemaining }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  deadline: {
    type: String,
    required: true,
  },
})

const now = ref(Date.now())
let intervalId = null

const diffMs = computed(() => {
  if (!props.deadline) return 0
  const deadlineTime = new Date(props.deadline).getTime()
  return Math.max(0, deadlineTime - now.value)
})

const isExpired = computed(() => diffMs.value <= 0)

const isUrgent = computed(() => diffMs.value > 0 && diffMs.value <= 2 * 60 * 60 * 1000) // <= 2 jam

const timeRemaining = computed(() => {
  const totalSeconds = Math.floor(diffMs.value / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
})

onMounted(() => {
  intervalId = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.pulse {
  animation: pulse-anim 1.5s infinite;
}

@keyframes pulse-anim {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>

