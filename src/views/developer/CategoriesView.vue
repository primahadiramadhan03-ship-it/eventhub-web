<script setup>
import { ref, onMounted } from 'vue'
import { categoryService } from '../../services/categoryService'

const activeTab = ref('categories') // 'categories' | 'venues'
const showFormModal = ref(false)
const editingItem = ref(null)
const deleteError = ref('')

// Master Kategori sesuai Figma Mockup 2002:2736
const categories = ref([
  {
    id: 1,
    name: 'Seminar',
    description: 'Konferensi, talkshow, seminar akademik dan panel diskusi narasumber',
    events_count: 8,
  },
  {
    id: 2,
    name: 'Workshop',
    description: 'Pelatihan praktis hands-on, bootcamp skill teknologi, dan workshop desain',
    events_count: 5,
  },
  {
    id: 3,
    name: 'Lomba',
    description: 'Kompetisi akademik, hackathon, lomba desain poster, dan turnamen mahasiswa',
    events_count: 4,
  },
  {
    id: 4,
    name: 'Perekrutan',
    description: 'Open recruitment organisasi mahasiswa, kepanitiaan, dan bursa karir kampus',
    events_count: 0,
  },
  {
    id: 5,
    name: 'Konser & Seni',
    description: 'Pentas seni budaya, konser musik kampus, dan pameran karya kreatif',
    events_count: 2,
  },
])

// Master Venue sesuai Tab Venue (8)
const venues = ref([
  { id: 1, name: 'Auditorium Gedung B Fasilkom', location: 'Kampus UI Depok, Lantai 2', capacity: 120 },
  { id: 2, name: 'Lab Rekayasa Perangkat Lunak', location: 'Gedung H Lantai 3', capacity: 45 },
  { id: 3, name: 'Aula Utama Rektorat', location: 'Gedung Pusat Administrasi', capacity: 350 },
  { id: 4, name: 'Ruang Seminar Gedung A', location: 'Gedung A Lantai 1', capacity: 80 },
  { id: 5, name: 'Online via Zoom Meeting', location: 'Virtual Conference Room', capacity: 500 },
])

const formModel = ref({
  name: '',
  description: '',
  capacity: 100,
})

onMounted(async () => {
  try {
    const res = await categoryService.getCategories()
    if (res && res.data && res.data.length > 0) {
      categories.value = res.data.map((c, idx) => ({
        id: c.id,
        name: c.name,
        description: c.description || categories.value[idx]?.description || 'Kategori acara resmi kampus EventHub',
        events_count: c.events_count ?? categories.value[idx]?.events_count ?? 2,
      }))
    }
  } catch {
    // Gunakan default mockup
  }
})

const openCreateModal = () => {
  editingItem.value = null
  formModel.value = { name: '', description: '', capacity: 100 }
  showFormModal.value = true
}

const openEditModal = (item) => {
  editingItem.value = item
  formModel.value = {
    name: item.name,
    description: item.description || item.location || '',
    capacity: item.capacity || 100,
  }
  showFormModal.value = true
}

const saveForm = () => {
  if (!formModel.value.name.trim()) return

  if (activeTab.value === 'categories') {
    if (editingItem.value) {
      editingItem.value.name = formModel.value.name.trim()
      editingItem.value.description = formModel.value.description.trim()
    } else {
      categories.value.push({
        id: Date.now(),
        name: formModel.value.name.trim(),
        description: formModel.value.description.trim() || 'Kategori acara baru',
        events_count: 0,
      })
    }
  } else {
    if (editingItem.value) {
      editingItem.value.name = formModel.value.name.trim()
      editingItem.value.location = formModel.value.description.trim()
      editingItem.value.capacity = Number(formModel.value.capacity) || 100
    } else {
      venues.value.push({
        id: Date.now(),
        name: formModel.value.name.trim(),
        location: formModel.value.description.trim() || 'Lokasi Kampus',
        capacity: Number(formModel.value.capacity) || 100,
      })
    }
  }

  showFormModal.value = false
}

const handleDeleteCategory = (cat) => {
  deleteError.value = ''
  if (cat.events_count > 0) {
    deleteError.value = `Gagal menghapus kategori "${cat.name}": Masih terdapat ${cat.events_count} event aktif yang terhubung ke kategori ini.`
    return
  }
  categories.value = categories.value.filter((c) => c.id !== cat.id)
}
</script>

<template>
  <div class="categories-venue-mockup py-2" style="max-width: 1152px;">
    <!-- Header (Figma 2002:2786) -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="fw-bold mb-1" style="color: #0f172a; font-size: 24px;">
          Kategori dan Venue
        </h1>
        <p class="mb-0" style="color: #64748b; font-size: 14px;">
          Kelola master data kategori event dan lokasi venue terdaftar untuk panitia.
        </p>
      </div>

      <button type="button" class="btn eh-btn-primary px-3 py-2 d-flex align-items-center gap-2" @click="openCreateModal">
        <i class="bi bi-plus-lg"></i>
        <span>{{ activeTab === 'categories' ? 'Tambah Kategori Baru' : 'Tambah Venue Baru' }}</span>
      </button>
    </div>

    <!-- Alert Galat Hapus (Sesuai Figma 53:2635) -->
    <div
      v-if="deleteError"
      class="p-3 rounded-2 mb-4 d-flex justify-content-between align-items-center"
      style="background-color: #fef2f2; border: 1px solid #d64545; color: #991b1b; font-size: 13px;"
    >
      <div>
        <i class="bi bi-exclamation-octagon-fill me-2"></i>
        <span>{{ deleteError }}</span>
      </div>
      <button type="button" class="btn-close btn-sm" @click="deleteError = ''"></button>
    </div>

    <!-- Tabs Kategori / Venue (Figma 2002:2797) -->
    <div class="d-flex mb-4" style="border-bottom: 1px solid #c7d2fe;">
      <button
        type="button"
        class="btn rounded-0 px-4 py-2 border-0"
        :style="
          activeTab === 'categories'
            ? 'color: #4f46e5; font-weight: 700; border-bottom: 2px solid #4f46e5 !important;'
            : 'color: #64748b; font-weight: 400;'
        "
        @click="activeTab = 'categories'"
      >
        Kategori ({{ categories.length }})
      </button>
      <button
        type="button"
        class="btn rounded-0 px-4 py-2 border-0"
        :style="
          activeTab === 'venues'
            ? 'color: #4f46e5; font-weight: 700; border-bottom: 2px solid #4f46e5 !important;'
            : 'color: #64748b; font-weight: 400;'
        "
        @click="activeTab = 'venues'"
      >
        Venue ({{ venues.length }})
      </button>
    </div>

    <!-- TAB 1: Categories CRUD Table (Figma 2002:2802) -->
    <div v-if="activeTab === 'categories'" class="eh-card overflow-hidden">
      <div class="table-responsive">
        <table class="table mb-0 align-middle">
          <thead style="background-color: #e0e7ff; border-bottom: 1px solid #c7d2fe;">
            <tr class="text-uppercase fw-bold" style="font-size: 12px; letter-spacing: 0.6px;">
              <th class="py-3 px-4" style="background-color: #e0e7ff; color: #3730a3;">NAMA KATEGORI</th>
              <th class="py-3 px-4" style="background-color: #e0e7ff; color: #3730a3;">DESKRIPSI</th>
              <th class="py-3 px-4" style="background-color: #e0e7ff; color: #3730a3;">JUMLAH EVENT TERHUBUNG</th>
              <th class="py-3 px-4 text-end" style="background-color: #e0e7ff; color: #3730a3;">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in categories" :key="cat.id" style="border-bottom: 1px solid #e2e8f0;">
              <td class="py-3 px-4 fw-bold" style="color: #0f172a; font-size: 14px;">
                {{ cat.name }}
              </td>
              <td class="py-3 px-4" style="color: #64748b; font-size: 12px;">
                {{ cat.description }}
              </td>
              <td class="py-3 px-4" style="color: #0f172a; font-size: 14px;">
                {{ cat.events_count }} Event
              </td>
              <td class="py-3 px-4 text-end">
                <button
                  type="button"
                  class="btn btn-link btn-sm p-0 text-decoration-none me-2"
                  style="color: #4f46e5; font-size: 12px;"
                  @click="openEditModal(cat)"
                >
                  Edit
                </button>
                <span style="color: #e2e8f0;">|</span>
                <button
                  type="button"
                  class="btn btn-link btn-sm p-0 text-decoration-none ms-2"
                  style="color: #d64545; font-size: 12px;"
                  @click="handleDeleteCategory(cat)"
                >
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: Venues Table -->
    <div v-else class="eh-card overflow-hidden">
      <div class="table-responsive">
        <table class="table mb-0 align-middle">
          <thead style="background-color: #e0e7ff; border-bottom: 1px solid #c7d2fe;">
            <tr class="text-uppercase fw-bold" style="font-size: 12px; letter-spacing: 0.6px;">
              <th class="py-3 px-4" style="background-color: #e0e7ff; color: #3730a3;">NAMA VENUE</th>
              <th class="py-3 px-4" style="background-color: #e0e7ff; color: #3730a3;">LOKASI GEDUNG</th>
              <th class="py-3 px-4" style="background-color: #e0e7ff; color: #3730a3;">KAPASITAS MAKSIMAL</th>
              <th class="py-3 px-4 text-end" style="background-color: #e0e7ff; color: #3730a3;">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in venues" :key="v.id" style="border-bottom: 1px solid #e2e8f0;">
              <td class="py-3 px-4 fw-bold" style="color: #0f172a; font-size: 14px;">
                {{ v.name }}
              </td>
              <td class="py-3 px-4" style="color: #64748b; font-size: 12px;">
                {{ v.location }}
              </td>
              <td class="py-3 px-4" style="color: #0f172a; font-size: 14px;">
                {{ v.capacity }} Kursi
              </td>
              <td class="py-3 px-4 text-end">
                <button
                  type="button"
                  class="btn btn-link btn-sm p-0 text-decoration-none"
                  style="color: #4f46e5; font-size: 12px;"
                  @click="openEditModal(v)"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Kategori / Venue (Figma 2007:6405) -->
    <div
      v-if="showFormModal"
      class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
    >
      <div
        class="bg-white rounded-2 overflow-hidden shadow-lg w-100"
        style="max-width: 480px; border: 1px solid #c7d2fe;"
      >
        <div
          class="px-4 py-3 d-flex justify-content-between align-items-center"
          style="border-bottom: 1px solid #e2e8f0;"
        >
          <h2 class="h6 fw-bold mb-0" style="color: #0f172a;">
            {{ editingItem ? 'Edit Data' : 'Tambah Data Baru' }}
          </h2>
          <button
            type="button"
            class="btn btn-sm btn-link text-secondary p-0 text-decoration-none"
            @click="showFormModal = false"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <form @submit.prevent="saveForm">
          <div class="p-4">
            <div class="mb-3">
              <label class="form-label small fw-bold" style="color: #0f172a;">
                {{ activeTab === 'categories' ? 'Nama Kategori' : 'Nama Venue' }}
              </label>
              <input
                v-model="formModel.name"
                type="text"
                class="form-control"
                style="border: 1px solid #c7d2fe;"
                placeholder="Ketik nama..."
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label small fw-bold" style="color: #0f172a;">
                {{ activeTab === 'categories' ? 'Deskripsi Kategori' : 'Detail Lokasi Gedung' }}
              </label>
              <textarea
                v-model="formModel.description"
                rows="3"
                class="form-control"
                style="border: 1px solid #c7d2fe;"
                placeholder="Ketik deskripsi..."
              ></textarea>
            </div>

            <div v-if="activeTab === 'venues'" class="mb-2">
              <label class="form-label small fw-bold" style="color: #0f172a;">Kapasitas Kursi</label>
              <input
                v-model.number="formModel.capacity"
                type="number"
                min="1"
                class="form-control"
                style="border: 1px solid #c7d2fe;"
              />
            </div>
          </div>

          <div
            class="px-4 py-3 d-flex justify-content-end gap-2"
            style="background-color: #eef2ff; border-top: 1px solid #c7d2fe;"
          >
            <button
              type="button"
              class="btn bg-white px-3 py-1"
              style="border: 1px solid #4f46e5; color: #4f46e5; font-size: 14px;"
              @click="showFormModal = false"
            >
              Batal
            </button>
            <button type="submit" class="btn eh-btn-primary px-4 py-1">
              Simpan
            </button>
          </div>
        </form>
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

.eh-btn-primary {
  background-color: #4f46e5;
  border: 1px solid #4f46e5;
  color: #ffffff;
  border-radius: 4px;
  font-size: 14px;
}

.eh-btn-primary:hover {
  background-color: #4338ca;
  color: #ffffff;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1055;
}
</style>
