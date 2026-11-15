<template>
  <div class="register-page py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-9 col-lg-7 col-xl-6">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <!-- Header Registrasi -->
            <div class="bg-gradient-primary text-white p-4 p-md-5 text-center">
              <span class="fs-1 d-inline-block mb-2">🚀</span>
              <h2 class="fw-bold mb-1">Daftar Akun EventHub</h2>
              <p class="opacity-90 small mb-0">
                Bergabunglah dengan platform pendaftaran dan penayangan event kampus & komunitas.
              </p>
            </div>

            <!-- Card Body Form -->
            <div class="card-body p-4 p-md-5">
              <!-- Alert Error Global -->
              <div v-if="errorMessage" class="alert alert-danger py-2 small mb-4 rounded-3" role="alert">
                <strong>Gagal Mendaftar:</strong> {{ errorMessage }}
              </div>

              <form @submit.prevent="handleRegister">
                <!-- ========================================================= -->
                <!-- 1. PILIHAN PERAN (K-11, TC-01, TC-02)                     -->
                <!-- ========================================================= -->
                <div class="mb-4">
                  <label class="form-label fw-bold text-dark mb-2">
                    Pilih Peran Akun Anda: <span class="text-danger">*</span>
                  </label>

                  <div class="row g-3">
                    <!-- Opsi Peserta -->
                    <div class="col-sm-6">
                      <div
                        class="role-card p-3 rounded-3 border text-center h-100 transition-all cursor-pointer"
                        :class="{ 'role-selected border-primary bg-primary bg-opacity-10': form.role === 'peserta' }"
                        @click="form.role = 'peserta'"
                      >
                        <div class="fs-2 mb-1">🎓</div>
                        <div class="fw-bold text-dark">Peserta</div>
                        <small class="text-secondary d-block mt-1" style="font-size: 0.75rem;">
                          Ikuti seminar, workshop, dan lomba serta dapatkan tiket digital.
                        </small>
                      </div>
                    </div>

                    <!-- Opsi Panitia -->
                    <div class="col-sm-6">
                      <div
                        class="role-card p-3 rounded-3 border text-center h-100 transition-all cursor-pointer"
                        :class="{ 'role-selected border-primary bg-primary bg-opacity-10': form.role === 'panitia' }"
                        @click="form.role = 'panitia'"
                      >
                        <div class="fs-2 mb-1">🎪</div>
                        <div class="fw-bold text-dark">Panitia</div>
                        <small class="text-secondary d-block mt-1" style="font-size: 0.75rem;">
                          Publikasikan event kampus, buat formulir pendaftaran, dan check-in.
                        </small>
                      </div>
                    </div>
                  </div>

                  <small class="text-muted d-block mt-2" style="font-size: 0.75rem;">
                    ℹ️ Catatan: Akun Developer hanya disediakan oleh sistem dan tidak dibuka untuk pendaftaran publik (K-11).
                  </small>
                </div>

                <!-- ========================================================= -->
                <!-- 2. DATA IDENTITAS PENGGUNA                                -->
                <!-- ========================================================= -->
                <!-- Nama Lengkap -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-dark">Nama Lengkap</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light text-muted border-end-0">👤</span>
                    <input
                      v-model="form.name"
                      type="text"
                      class="form-control border-start-0"
                      :class="{ 'is-invalid': errors.name }"
                      placeholder="Masukkan nama lengkap Anda..."
                      required
                    />
                    <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
                  </div>
                </div>

                <!-- Email -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-dark">Alamat Email</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light text-muted border-end-0">✉️</span>
                    <input
                      v-model="form.email"
                      type="email"
                      class="form-control border-start-0"
                      :class="{ 'is-invalid': errors.email }"
                      placeholder="nama@email.com"
                      required
                    />
                    <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
                  </div>
                </div>

                <!-- Password -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-dark">Password</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light text-muted border-end-0">🔒</span>
                    <input
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control border-start-0 border-end-0"
                      :class="{ 'is-invalid': errors.password }"
                      placeholder="Minimal 8 karakter..."
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary border-start-0 text-muted"
                      @click="showPassword = !showPassword"
                    >
                      {{ showPassword ? '🙈' : '👁️' }}
                    </button>
                    <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
                  </div>
                </div>

                <!-- Konfirmasi Password -->
                <div class="mb-4">
                  <label class="form-label small fw-semibold text-dark">Konfirmasi Password</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light text-muted border-end-0">🔑</span>
                    <input
                      v-model="form.password_confirmation"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control border-start-0"
                      :class="{ 'is-invalid': errors.password_confirmation }"
                      placeholder="Ulangi password di atas..."
                      required
                    />
                    <div v-if="errors.password_confirmation" class="invalid-feedback">
                      {{ errors.password_confirmation }}
                    </div>
                  </div>
                </div>

                <!-- Tombol Submit -->
                <button
                  type="submit"
                  class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang →' }}
                </button>
              </form>

              <!-- Footer Tautan Masuk -->
              <div class="text-center mt-4 pt-3 border-top">
                <span class="small text-secondary">Sudah memiliki akun? </span>
                <router-link to="/login" class="small fw-bold text-decoration-none text-primary">
                  Masuk di sini
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
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getDashboardPath } from '../../router'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'peserta', // Default role per K-11
})

const errors = reactive({})

function validateForm() {
  let valid = true
  Object.keys(errors).forEach((key) => delete errors[key])

  if (!form.name.trim()) {
    errors.name = 'Nama lengkap wajib diisi.'
    valid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Alamat email wajib diisi.'
    valid = false
  }

  if (form.password.length < 8) {
    errors.password = 'Password minimal harus 8 karakter.'
    valid = false
  }

  if (form.password !== form.password_confirmation) {
    errors.password_confirmation = 'Konfirmasi password tidak cocok.'
    valid = false
  }

  return valid
}

async function handleRegister() {
  errorMessage.value = ''
  if (!validateForm()) return

  loading.value = true
  try {
    const res = await authStore.register({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      password_confirmation: form.password_confirmation,
      role: form.role,
    })

    const target = getDashboardPath(res.data?.user?.role || form.role)
    router.push(target)
  } catch (err) {
    console.error('Register error:', err)
    if (err.response?.data?.errors) {
      const serverErrors = err.response.data.errors
      Object.keys(serverErrors).forEach((key) => {
        errors[key] = serverErrors[key][0]
      })
    } else {
      errorMessage.value = err.response?.data?.message || 'Registrasi gagal. Silakan coba kembali.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.role-card {
  cursor: pointer;
  border-width: 2px !important;
}

.role-card:hover {
  border-color: #3b82f6 !important;
}

.role-selected {
  border-color: #3b82f6 !important;
}
</style>
