<template>
  <div class="login-page py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <!-- Header Login -->
            <div class="bg-gradient-primary text-white p-4 p-md-5 text-center">
              <span class="fs-1 d-inline-block mb-2">🔐</span>
              <h2 class="fw-bold mb-1">Masuk ke EventHub</h2>
              <p class="opacity-90 small mb-0">
                Kelola event kampus, pendaftaran, dan tiket digital Anda.
              </p>
            </div>

            <!-- Card Body Form -->
            <div class="card-body p-4 p-md-5">
              <!-- Pesan sesi berakhir jika dialihkan oleh interceptor 401 -->
              <div
                v-if="sessionExpiredNotice"
                class="alert alert-warning py-2 small rounded-3"
                role="alert"
              >
                ⚠️ Sesi Anda telah berakhir. Silakan masuk kembali.
              </div>

              <!-- Pesan error login gagal -->
              <div
                v-if="errorMessage"
                class="alert alert-danger py-2 small rounded-3"
                role="alert"
              >
                {{ errorMessage }}
              </div>

              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-dark">Alamat Email</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light text-muted border-end-0">✉️</span>
                    <input
                      v-model="email"
                      type="email"
                      class="form-control border-start-0"
                      placeholder="nama@email.com"
                      required
                    />
                  </div>
                </div>

                <div class="mb-4">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <label class="form-label small fw-semibold text-dark mb-0">Password</label>
                  </div>
                  <div class="input-group">
                    <span class="input-group-text bg-light text-muted border-end-0">🔒</span>
                    <input
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control border-start-0 border-end-0"
                      placeholder="Masukkan password Anda..."
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary border-start-0 text-muted"
                      @click="showPassword = !showPassword"
                    >
                      {{ showPassword ? '🙈' : '👁️' }}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm"
                  :disabled="loading"
                >
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  {{ loading ? 'Memverifikasi...' : 'Masuk Sekarang →' }}
                </button>
              </form>

              <!-- Tombol Cepat Akun Demo (Memudahkan Pengujian & Evaluasi Dosen/Asisten) -->
              <div class="mt-4 pt-3 border-top">
                <p class="text-secondary small text-center mb-2 fw-semibold">
                  ⚡ Masuk Cepat Akun Demo (Uji Role):
                </p>
                <div class="d-flex justify-content-center gap-2 flex-wrap">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                    @click="fillDemo('peserta')"
                  >
                    🎓 Peserta
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-success rounded-pill px-3 py-1"
                    @click="fillDemo('panitia')"
                  >
                    🎪 Panitia
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-dark rounded-pill px-3 py-1"
                    @click="fillDemo('developer')"
                  >
                    ⚙️ Developer
                  </button>
                </div>
              </div>

              <!-- Footer Tautan Register -->
              <div class="text-center mt-4 pt-3 border-top">
                <span class="small text-secondary">Belum memiliki akun? </span>
                <router-link to="/register" class="small fw-bold text-decoration-none text-primary">
                  Daftar akun baru
                </router-link>
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
const showPassword = ref(false)
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
      error.response?.data?.message || 'Email atau password tidak sesuai.'
  }
}
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}
</style>
