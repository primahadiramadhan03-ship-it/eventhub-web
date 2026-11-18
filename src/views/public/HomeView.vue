<script setup>
import { ref, computed, onMounted } from 'vue'
import { eventService } from '../../services/eventService'
import { categoryService } from '../../services/categoryService'

const searchQuery = ref('')
const selectedCategory = ref('Semua')
const currentPage = ref(1)
const isLoading = ref(false)

const categoryTabs = ref(['Semua', 'Seminar', 'Workshop', 'Lomba', 'Kepanitiaan', 'Komunitas'])

// 6 Event Cards sesuai Figma Mockup 2002:3
const DEFAULT_EVENTS = [
  {
    id: 1,
    initials: 'SNAI',
    tintBg: '#c7d2fe',
    tintColor: '#3730a3',
    category_name: 'Seminar',
    title: 'Seminar Nasional AI untuk Pendidikan',
    date_text: '18 April 2026 • 09:00 WIB',
    location: 'Aula Gedung A, Kampus Pusat',
    remaining_quota: 24,
    quota: 100,
    status: 'Tayang',
  },
  {
    id: 2,
    initials: 'WUIX',
    tintBg: '#ddd6fe',
    tintColor: '#5b21b6',
    category_name: 'Workshop',
    title: 'Workshop UI/UX dengan Figma',
    date_text: '25 April 2026 • 13:00 WIB',
    location: 'Lab Komputer 2, Gedung FTI',
    remaining_quota: 18,
    quota: 60,
    status: 'Tayang',
  },
  {
    id: 3,
    initials: 'LDPD',
    tintBg: '#cbd5e1',
    tintColor: '#334155',
    category_name: 'Lomba',
    title: 'Lomba Desain Poster Dies Natalis',
    date_text: '02 Mei 2026 • 10:00 WIB',
    location: 'Online via Zoom',
    remaining_quota: 0,
    quota: 50,
    status: 'KUOTA HABIS',
  },
  {
    id: 4,
    initials: 'OPRN',
    tintBg: '#e9d5ff',
    tintColor: '#6b21a8',
    category_name: 'Kepanitiaan',
    title: 'Open Recruitment Volunteer Techfest',
    date_text: '12 Mei 2026 • 08:30 WIB',
    location: 'Auditorium Gedung D',
    remaining_quota: 35,
    quota: 80,
    status: 'Tayang',
  },
  {
    id: 5,
    initials: 'KGDG',
    tintBg: '#c7d2fe',
    tintColor: '#3730a3',
    category_name: 'Komunitas',
    title: 'Kumpul Rutin Komunitas Developer',
    date_text: '20 Mei 2026 • 15:30 WIB',
    location: 'Co-working Space Perpustakaan',
    remaining_quota: 12,
    quota: 30,
    status: 'Tayang',
  },
  {
    id: 6,
    initials: 'PWMK',
    tintBg: '#ddd6fe',
    tintColor: '#5b21b6',
    category_name: 'Workshop',
    title: 'Pelatihan Pemrograman Web Modern',
    date_text: '28 Mei 2026 • 09:00 WIB',
    location: 'Lab Rekayasa Perangkat Lunak',
    remaining_quota: 40,
    quota: 40,
    status: 'Tayang',
  },
]

const events = ref([...DEFAULT_EVENTS])

const getInitials = (title) => {
  if (!title) return 'EVNT'
  return title
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 4)
    .map((w) => w[0].toUpperCase())
    .join('')
}

const TINT_PALETTE = [
  { bg: '#c7d2fe', color: '#3730a3' },
  { bg: '#ddd6fe', color: '#5b21b6' },
  { bg: '#e9d5ff', color: '#6b21a8' },
]

onMounted(async () => {
  isLoading.value = true
  try {
    // Integrasi ke endpoint GET /api/v1/events (UAS06-33 / UAS06-43)
    const res = await eventService.getEvents()
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      events.value = res.data.map((item, idx) => {
        const isFull = Number(item.remaining_quota) <= 0
        const tint = isFull
          ? { bg: '#cbd5e1', color: '#334155' }
          : TINT_PALETTE[idx % TINT_PALETTE.length]
        return {
          id: item.id,
          initials: getInitials(item.title),
          tintBg: tint.bg,
          tintColor: tint.color,
          category_name: item.category?.name || item.category_name || 'Seminar',
          title: item.title,
          date_text: item.start_time
            ? new Intl.DateTimeFormat('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(item.start_time)) + ' WIB'
            : '18 April 2026 • 09:00 WIB',
          location: item.location || 'Kampus Pusat',
          remaining_quota: Number(item.remaining_quota ?? item.quota ?? 24),
          quota: Number(item.quota ?? 100),
          status: isFull ? 'KUOTA HABIS' : 'Tayang',
        }
      })
    }

    const catRes = await categoryService.getCategories()
    if (catRes && catRes.data && Array.isArray(catRes.data) && catRes.data.length > 0) {
      const apiNames = catRes.data.map((c) => c.name)
      categoryTabs.value = ['Semua', ...new Set([...apiNames, 'Kepanitiaan', 'Komunitas'])].slice(0, 6)
    }
  } catch {
    // Fallback ke 6 kartu mockup Figma
    events.value = [...DEFAULT_EVENTS]
  } finally {
    isLoading.value = false
  }
})

const filteredEvents = computed(() => {
  return events.value.filter((ev) => {
    if (selectedCategory.value !== 'Semua') {
      if (ev.category_name.toLowerCase() !== selectedCategory.value.toLowerCase()) {
        return false
      }
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchTitle = ev.title.toLowerCase().includes(q)
      const matchLoc = ev.location.toLowerCase().includes(q)
      const matchCat = ev.category_name.toLowerCase().includes(q)
      if (!matchTitle && !matchLoc && !matchCat) return false
    }
    return true
  })
})
</script>

<template>
  <div class="katalog-mockup-page py-4">
    <div class="container" style="max-width: 1280px;">
      <!-- Title & Search Input + Category Chips (Figma 2002:20) -->
      <div class="pb-4 mb-4" style="border-bottom: 1px solid #c7d2fe;">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h1 class="fw-bold mb-1" style="color: #0f172a; font-size: 24px; letter-spacing: -0.6px;">
              Event Mendatang
            </h1>
            <p class="mb-0" style="color: #64748b; font-size: 14px;">
              Jelajahi dan ikuti berbagai kegiatan akademik, kompetisi, dan komunitas kampus.
            </p>
          </div>

          <div style="width: 320px;">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control eh-search-input"
              placeholder="Cari event..."
            />
          </div>
        </div>

        <!-- Category Chips (Figma 2002:31) -->
        <div class="d-flex flex-wrap gap-2">
          <button
            v-for="cat in categoryTabs"
            :key="cat"
            type="button"
            class="btn rounded-pill px-3 py-1"
            :style="
              selectedCategory === cat
                ? 'background-color: #4f46e5; color: #ffffff; font-size: 12px; font-weight: 500;'
                : 'background-color: #ffffff; border: 1px solid #c7d2fe; color: #0f172a; font-size: 12px;'
            "
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Loading Skeleton State (Figma 46:900) -->
      <div v-if="isLoading" class="row g-4 mb-4">
        <div v-for="n in 6" :key="n" class="col-12 col-md-6 col-lg-4">
          <div class="eh-card p-3 placeholder-glow">
            <div class="placeholder w-100 rounded-1 mb-3" style="height: 144px; background-color: #c7d2fe;"></div>
            <span class="placeholder col-4 mb-2"></span>
            <span class="placeholder col-9 mb-2"></span>
            <span class="placeholder col-6"></span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredEvents.length === 0" class="eh-card p-5 text-center my-4">
        <h3 class="h6 fw-bold mb-1" style="color: #0f172a;">Tidak ada event yang cocok</h3>
        <p class="small mb-3" style="color: #64748b;">
          Coba ubah kata kunci pencarian atau pilih kategori lainnya.
        </p>
        <button
          type="button"
          class="btn btn-sm text-white px-3 py-1"
          style="background-color: #4f46e5; border-radius: 4px;"
          @click="searchQuery = ''; selectedCategory = 'Semua'"
        >
          Reset Filter
        </button>
      </div>

      <!-- 6 Event Cards Grid (3x2) (Figma 2002:44) -->
      <div v-else class="row g-4 mb-4">
        <div
          v-for="ev in filteredEvents"
          :key="ev.id"
          class="col-12 col-md-6 col-lg-4"
        >
          <router-link
            :to="`/events/${ev.id}`"
            class="eh-card p-3 h-100 d-flex flex-column justify-content-between text-decoration-none"
            :class="{ 'opacity-90': ev.remaining_quota <= 0 }"
          >
            <div>
              <!-- Poster Tint Box with Initials (Figma 2002:47) -->
              <div
                class="d-flex align-items-center justify-content-center rounded-1 mb-3"
                :style="{
                  height: '144px',
                  backgroundColor: ev.tintBg,
                  border: `1px solid ${ev.tintBg}`,
                }"
              >
                <span
                  class="fw-bold"
                  :style="{
                    color: ev.tintColor,
                    fontSize: '24px',
                    letterSpacing: '2.4px',
                  }"
                >
                  {{ ev.initials }}
                </span>
              </div>

              <!-- Category & Status Badge (Figma 2002:50) -->
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-semibold" style="color: #64748b; font-size: 12px;">
                  {{ ev.category_name }}
                </span>
                <span
                  v-if="ev.remaining_quota <= 0"
                  class="badge rounded-pill text-white fw-semibold px-2 py-1 text-uppercase"
                  style="background-color: #4b4b4b; font-size: 11px;"
                >
                  KUOTA HABIS
                </span>
                <span
                  v-else
                  class="badge rounded-pill text-white fw-semibold px-2 py-1"
                  style="background-color: #22a55b; font-size: 11px;"
                >
                  Tayang
                </span>
              </div>

              <!-- Title (Figma 2002:55) -->
              <h2 class="fw-semibold mb-2" style="color: #0f172a; font-size: 16px; line-height: 1.4;">
                {{ ev.title }}
              </h2>

              <!-- Date & Venue (Figma 2002:57) -->
              <div class="mb-3" style="color: #64748b; font-size: 14px;">
                <div class="mb-1">{{ ev.date_text }}</div>
                <div>{{ ev.location }}</div>
              </div>
            </div>

            <!-- Card Footer: Quota & Detail Link (Figma 2002:62) -->
            <div
              class="d-flex justify-content-between align-items-center pt-3"
              style="border-top: 1px solid #e2e8f0;"
            >
              <span style="color: #64748b; font-size: 12px;">
                Sisa kuota {{ ev.remaining_quota }} / {{ ev.quota }}
              </span>
              <span
                class="fw-semibold"
                :style="{ color: ev.remaining_quota <= 0 ? '#64748b' : '#4f46e5', fontSize: '12px' }"
              >
                Detail
              </span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Numbered Pagination (Figma 2002:177) -->
      <div
        class="d-flex justify-content-center align-items-center gap-2 pt-3"
        style="border-top: 1px solid #c7d2fe;"
      >
        <button
          type="button"
          class="btn btn-sm px-3 py-2"
          style="background-color: #e2e8f0; border: 1px solid #c7d2fe; color: #94a3b8; font-size: 12px; border-radius: 4px;"
          disabled
        >
          Sebelumnya
        </button>
        <button
          type="button"
          class="btn btn-sm text-white fw-semibold d-flex align-items-center justify-content-center"
          style="width: 36px; height: 36px; background-color: #4f46e5; font-size: 12px; border-radius: 4px;"
          @click="currentPage = 1"
        >
          1
        </button>
        <button
          type="button"
          class="btn btn-sm bg-white d-flex align-items-center justify-content-center"
          style="width: 36px; height: 36px; border: 1px solid #c7d2fe; color: #0f172a; font-size: 12px; border-radius: 4px;"
          @click="currentPage = 2"
        >
          2
        </button>
        <button
          type="button"
          class="btn btn-sm bg-white d-flex align-items-center justify-content-center"
          style="width: 36px; height: 36px; border: 1px solid #c7d2fe; color: #0f172a; font-size: 12px; border-radius: 4px;"
          @click="currentPage = 3"
        >
          3
        </button>
        <span class="px-1" style="color: #64748b;">...</span>
        <button
          type="button"
          class="btn btn-sm bg-white d-flex align-items-center justify-content-center"
          style="width: 36px; height: 36px; border: 1px solid #c7d2fe; color: #0f172a; font-size: 12px; border-radius: 4px;"
        >
          8
        </button>
        <button
          type="button"
          class="btn btn-sm bg-white px-3 py-2"
          style="border: 1px solid #c7d2fe; color: #0f172a; font-size: 12px; border-radius: 4px;"
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
  border-radius: 8px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.eh-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.08);
}

.eh-search-input {
  background-color: #ffffff;
  border: 1px solid #c7d2fe;
  border-radius: 4px;
  font-size: 14px;
  padding: 9px 13px;
}

.eh-search-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}
</style>
