
<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h2 class="fw-bold text-center mb-2">EventHub</h2>
            <p class="text-secondary text-center mb-4">
              Masuk ke akun Anda
            </p>

            <form>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  placeholder="nama@email.com"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  placeholder="Masukkan password"
                />
              </div>

              <button type="button" class="btn btn-primary w-100">
                Masuk
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
