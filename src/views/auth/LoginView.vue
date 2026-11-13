<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h2 class="fw-bold text-center mb-1">EventHub</h2>
            <p class="text-secondary text-center mb-4">
              Masuk ke akun Anda
            </p>

            <!-- Pesan sesi berakhir jika dialihkan oleh interceptor 401 -->
            <div
              v-if="sessionExpiredNotice"
              class="alert alert-warning py-2 small"
              role="alert"
            >
              Sesi Anda telah berakhir. Silakan masuk kembali.
            </div>

            <!-- Pesan error login gagal -->
            <div
              v-if="errorMessage"
              class="alert alert-danger py-2 small"
              role="alert"
            >
              {{ errorMessage }}
            </div>

            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input
                  v-model="email"
                  type="email"
                  class="form-control"
                  placeholder="nama@email.com"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Password</label>
                <input
                  v-model="password"
                  type="password"
                  class="form-control"
                  placeholder="Masukkan password"
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="loading"
              >
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                {{ loading ? 'Memproses...' : 'Masuk' }}
              </button>
            </form>

            <hr class="my-4" />

            <!-- Tombol Cepat Akun Demo (Memudahkan Pengujian & Evaluasi) -->
            <div class="text-center">
              <p class="text-muted small mb-2">Pilih Cepat Akun Demo:</p>
              <div class="d-flex justify-content-center gap-1 flex-wrap">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  @click="fillDemo('peserta')"
                >
                  Peserta
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  @click="fillDemo('panitia')"
                >
                  Panitia
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  @click="fillDemo('developer')"
                >
                  Developer
                </button>
              </div>
            </div>
          </div>
        </div>
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
      error.response?.data?.message || 'Login gagal. Periksa kredensial Anda.'
  }
}
</script>