<template>
  <div class="container py-5 text-center">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm border-0 p-4">
          <div class="card-body">
            <h1 class="display-3 fw-bold text-danger mb-3">403</h1>
            <h4 class="mb-3">Akses Ditolak</h4>
            <p class="text-secondary mb-4">
              Anda tidak memiliki izin untuk mengakses halaman ini sesuai peran akun Anda.
            </p>
            <div class="d-flex justify-content-center gap-2">
              <router-link to="/" class="btn btn-outline-secondary">
                Kembali ke Beranda
              </router-link>
              <button @click="goToDashboard" class="btn btn-primary">
                Ke Dashboard Saya
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getDashboardPath } from '../../router'

const router = useRouter()
const auth = useAuthStore()

function goToDashboard() {
  if (auth.isAuthenticated) {
    router.push(getDashboardPath(auth.role))
  } else {
    router.push('/login')
  }
}
</script>