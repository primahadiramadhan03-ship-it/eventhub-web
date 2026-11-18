<template>
  <div class="eh-auth-page py-5 d-flex align-items-center justify-content-center">
    <div class="eh-register-card bg-white">
      <!-- Header -->
      <div class="text-center mb-4">
        <h1 class="fw-bold mb-1" style="font-size: 20px; color: #0f172a;">Buat Akun EventHub</h1>
        <p class="mb-0" style="font-size: 14px; color: #64748b;">
          Pilih peran Anda dan lengkapi data pendaftaran akun.
        </p>
      </div>

      <!-- Alert Error Global / Peran Kosong (2002:4091) -->
      <div
        v-if="errorMessage || errors.role"
        class="alert py-2 px-3 small mb-3"
        style="background-color: #fef2f2; border: 1px solid #d64545; color: #991b1b; border-radius: 4px;"
        role="alert"
      >
        {{ errors.role || errorMessage }}
      </div>

      <form @submit.prevent="handleRegister" novalidate>
        <!-- 1. PILIH PERAN AKUN (Figma 2002:247 & 2002:4091) -->
        <div class="mb-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <label class="form-label mb-0 fw-medium" style="font-size: 14px; color: #0f172a;">
              Pilih Peran Akun
            </label>
            <button
              v-if="form.role"
              type="button"
              class="btn btn-link btn-sm p-0 text-decoration-none"
              style="font-size: 11px; color: #64748b;"
              @click="form.role = ''"
              title="Uji state peran kosong"
            >
              Reset pilihan
            </button>
          </div>

          <div class="row g-3">
            <!-- Role 1: Peserta -->
            <div class="col-sm-6">
              <div
                class="eh-role-card h-100 p-3"
                :class="{
                  'eh-role-selected': form.role === 'peserta',
                  'eh-role-error': errors.role && !form.role
                }"
                @click="selectRole('peserta')"
              >
                <div class="d-flex align-items-center justify-content-between mb-1">
                  <span class="fw-semibold" style="font-size: 14px; color: #0f172a;">Peserta</span>
                  <span
                    class="eh-radio-indicator d-inline-flex align-items-center justify-content-center"
                    :class="{ 'active': form.role === 'peserta' }"
                  >
                    <span v-if="form.role === 'peserta'" class="eh-radio-dot"></span>
                  </span>
                </div>
                <p class="mb-0" style="font-size: 12px; color: #64748b; line-height: 16px;">
                  Daftar dan ikuti event kampus serta komunitas.
                </p>
              </div>
            </div>

            <!-- Role 2: Panitia Event -->
            <div class="col-sm-6">
              <div
                class="eh-role-card h-100 p-3"
                :class="{
                  'eh-role-selected': form.role === 'panitia',
                  'eh-role-error': errors.role && !form.role
                }"
                @click="selectRole('panitia')"
              >
                <div class="d-flex align-items-center justify-content-between mb-1">
                  <span class="fw-semibold" style="font-size: 14px; color: #0f172a;">Panitia Event</span>
                  <span
                    class="eh-radio-indicator d-inline-flex align-items-center justify-content-center"
                    :class="{ 'active': form.role === 'panitia' }"
                  >
                    <span v-if="form.role === 'panitia'" class="eh-radio-dot"></span>
                  </span>
                </div>
                <p class="mb-0" style="font-size: 12px; color: #64748b; line-height: 16px;">
                  Buat dan kelola event serta formulir pendaftaran.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. FORM FIELDS -->
        <div class="mb-3">
          <label class="form-label mb-1 fw-medium" style="font-size: 14px; color: #0f172a;">Nama Lengkap</label>
          <input
            v-model="form.name"
            type="text"
            class="form-control eh-input"
            :class="{ 'is-invalid': errors.name }"
            placeholder="Aditya Pratama"
            required
          />
          <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
        </div>

        <div class="mb-3">
          <label class="form-label mb-1 fw-medium" style="font-size: 14px; color: #0f172a;">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="form-control eh-input"
            :class="{ 'is-invalid': errors.email }"
            placeholder="aditya.pratama@mhs.kampus.ac.id"
            required
          />
          <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
        </div>

        <div class="mb-3">
          <label class="form-label mb-1 fw-medium" style="font-size: 14px; color: #0f172a;">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="form-control eh-input"
            :class="{ 'is-invalid': errors.password }"
            placeholder="Minimal 8 karakter"
            required
          />
          <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
        </div>

        <div class="mb-4">
          <label class="form-label mb-1 fw-medium" style="font-size: 14px; color: #0f172a;">Konfirmasi Password</label>
          <input
            v-model="form.password_confirmation"
            type="password"
            class="form-control eh-input"
            :class="{ 'is-invalid': errors.password_confirmation }"
            placeholder="Ulangi password"
            required
          />
          <div v-if="errors.password_confirmation" class="invalid-feedback">
            {{ errors.password_confirmation }}
          </div>
        </div>

        <button
          type="submit"
          class="btn eh-btn-indigo w-100 py-2 fw-semibold"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Mendaftarkan Akun...' : 'Buat Akun' }}
        </button>
      </form>

      <!-- Footer Tautan Masuk -->
      <div class="text-center mt-4 pt-3" style="border-top: 1px solid #e2e8f0; font-size: 14px;">
        <span style="color: #64748b;">Sudah punya akun? </span>
        <router-link to="/login" class="fw-medium text-decoration-none" style="color: #4f46e5;">
          Masuk
        </router-link>
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
const errorMessage = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'peserta',
})

const errors = reactive({})

function selectRole(role) {
  form.role = role
  delete errors.role
}

function validateForm() {
  let valid = true
  Object.keys(errors).forEach((key) => delete errors[key])

  if (!form.role) {
    errors.role = 'Silakan pilih peran akun terlebih dahulu (Peserta atau Panitia Event).'
    valid = false
  }

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
.eh-auth-page {
  min-height: calc(100vh - 140px);
}

.eh-register-card {
  width: 100%;
  max-width: 512px;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  padding: 33px;
}

.eh-role-card {
  background-color: #ffffff;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.eh-role-card:hover {
  border-color: #4f46e5;
}

.eh-role-selected {
  background-color: #eef2ff;
  border: 2px solid #4f46e5;
}

.eh-role-error {
  border-color: #d64545;
  background-color: #fef2f2;
}

.eh-radio-indicator {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  border: 1px solid #6b7280;
  background-color: #ffffff;
}

.eh-radio-indicator.active {
  background-color: #4f46e5;
  border-color: #4f46e5;
}

.eh-radio-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: #ffffff;
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
</style>
