<template>
  <div class="eh-auth-page py-5 d-flex align-items-center justify-content-center">
    <div class="eh-login-card bg-white p-4 p-md-4">
      <!-- Header -->
      <div class="text-center mb-4">
        <h1 class="fw-bold mb-1" style="font-size: 20px; color: #0f172a;">Masuk ke EventHub</h1>
        <p class="mb-0" style="font-size: 14px; color: #64748b;">
          Akses tiket digital dan kelola pendaftaran event Anda.
        </p>
      </div>

      <!-- Pesan sesi berakhir jika dialihkan oleh interceptor 401 -->
      <div
        v-if="sessionExpiredNotice"
        class="alert py-2 px-3 small mb-3"
        style="background-color: #fef3c7; border: 1px solid #f5c542; color: #92400e; border-radius: 4px;"
        role="alert"
      >
        Sesi Anda telah berakhir. Silakan masuk kembali.
      </div>

      <!-- Pesan error login gagal -->
      <div
        v-if="errorMessage"
        class="alert py-2 px-3 small mb-3"
        style="background-color: #fef2f2; border: 1px solid #d64545; color: #991b1b; border-radius: 4px;"
        role="alert"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" novalidate>
        <div class="mb-3">
          <label class="form-label mb-1 fw-medium" style="font-size: 14px; color: #0f172a;">Email</label>
          <input
            v-model="email"
            type="email"
            class="form-control eh-input"
            placeholder="aditya.pratama@mhs.kampus.ac.id"
            required
          />
        </div>

        <div class="mb-4">
          <label class="form-label mb-1 fw-medium" style="font-size: 14px; color: #0f172a;">Password</label>
          <input
            v-model="password"
            type="password"
            class="form-control eh-input"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          class="btn eh-btn-indigo w-100 py-2 fw-semibold"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Memverifikasi...' : 'Masuk' }}
        </button>
      </form>

      <!-- Tombol Cepat Akun Demo (Memudahkan Evaluasi Role) -->
      <div class="mt-4 pt-3" style="border-top: 1px solid #e2e8f0;">
        <div class="text-center mb-2" style="font-size: 12px; color: #64748b;">
          Akses Cepat Akun Demo (Uji Role):
        </div>
        <div class="d-flex justify-content-center gap-2 flex-wrap">
          <button
            type="button"
            class="btn btn-sm eh-demo-pill"
            @click="fillDemo('peserta')"
          >
            Peserta
          </button>
          <button
            type="button"
            class="btn btn-sm eh-demo-pill"
            @click="fillDemo('panitia')"
          >
            Panitia Event
          </button>
          <button
            type="button"
            class="btn btn-sm eh-demo-pill"
            @click="fillDemo('developer')"
          >
            Developer
          </button>
        </div>
      </div>

      <!-- Footer Tautan Register -->
      <div class="text-center mt-3 pt-3" style="border-top: 1px solid #e2e8f0; font-size: 14px;">
        <span style="color: #64748b;">Belum punya akun? </span>
        <router-link to="/register" class="fw-medium text-decoration-none" style="color: #4f46e5;">
          Daftar
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getDashboardPath } from '../../router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = computed(() => authStore.loading)

const sessionExpiredNotice = computed(
  () => route.query.session_expired === '1'
)

const demoAccounts = {
  peserta: {
    email: 'peserta@eventhub.test',
    password: 'password123',
  },
  panitia: {
    email: 'panitia@eventhub.test',
    password: 'password123',
  },
  developer: {
    email: 'developer@eventhub.test',
    password: 'password123',
  },
}

function fillDemo(role) {
  if (demoAccounts[role]) {
    email.value = demoAccounts[role].email
    password.value = demoAccounts[role].password
    errorMessage.value = ''
  }
}

async function handleLogin() {
  errorMessage.value = ''
  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Email dan password wajib diisi.'
    return
  }

  try {
    const result = await authStore.login({
      email: email.value,
      password: password.value,
    })

    const targetRoute =
      route.query.redirect || getDashboardPath(result.data.user.role)
    router.push(targetRoute)
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || 'Email atau password tidak sesuai.'
  }
}
</script>

<style scoped>
.eh-auth-page {
  min-height: calc(100vh - 140px);
}

.eh-login-card {
  width: 100%;
  max-width: 448px;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  padding: 32px !important;
}

.eh-input {
  border: 1px solid #c7d2fe;
  border-radius: 4px;
  font-size: 14px;
  color: #0f172a;
  padding: 9px 13px;
}

.eh-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
}

.eh-btn-indigo {
  background-color: #4f46e5;
  border-color: #4f46e5;
  color: #ffffff;
  border-radius: 4px;
  font-size: 14px;
}

.eh-btn-indigo:hover {
  background-color: #4338ca;
  border-color: #4338ca;
  color: #ffffff;
}

.eh-demo-pill {
  background-color: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #3730a3;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  padding: 4px 10px;
}

.eh-demo-pill:hover {
  background-color: #e0e7ff;
  border-color: #4f46e5;
  color: #1e1b4b;
}
</style>
