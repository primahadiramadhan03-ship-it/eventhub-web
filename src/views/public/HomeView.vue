<template>
  <div class="container py-4">
    <!-- Banner Status Koneksi API (Milestone M2 Walking Skeleton) -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h1 class="h3 fw-bold mb-1">EventHub — Platform Sewa & Pendaftaran Event</h1>
            <p class="text-secondary mb-0">
              Front-End Vue 3 terhubung ke Live Backend Laravel & TiDB Cloud.
            </p>
          </div>
          <div>
            <span v-if="loading" class="badge bg-warning text-dark py-2 px-3">
              <span class="spinner-border spinner-border-sm me-1"></span> Menghubungkan ke API...
            </span>
            <span v-else-if="apiConnected" class="badge bg-success py-2 px-3">
              ● Live API Terhubung
            </span>
            <span v-else class="badge bg-danger py-2 px-3">
              ✕ Gagal Terhubung ke API
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Kategori dari Database Cloud -->
    <div class="mb-4">
      <h4 class="fw-bold mb-3">Kategori Event (Live dari Cloud DB)</h4>
      
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Memuat kategori...</p>
      </div>

      <div v-else-if="categories.length" class="row g-3">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="col-sm-6 col-md-4 col-lg"
        >
          <div class="card h-100 shadow-sm border-0 text-center p-3">
            <div class="fw-bold fs-5 text-primary mb-1">{{ cat.name }}</div>
            <p class="text-secondary small mb-0">{{ cat.description || 'Kategori resmi' }}</p>
          </div>
        </div>
      </div>

      <div v-else class="alert alert-secondary">
        Tidak ada data kategori yang diterima dari backend.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoryService } from '../../services/categoryService'

const categories = ref([])
const loading = ref(true)
const apiConnected = ref(false)

onMounted(async () => {
  try {
    const res = await categoryService.getCategories()
    categories.value = res.data || []
    apiConnected.value = true
  } catch (err) {
    console.error('Gagal mengambil kategori dari backend:', err)
    apiConnected.value = false
  } finally {
    loading.value = false
  }
})
</script>