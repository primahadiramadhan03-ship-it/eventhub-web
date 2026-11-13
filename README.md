# EventHub Web

Frontend aplikasi **EventHub — Platform Sewa Penayangan dan Pendaftaran Event Kampus & Komunitas**.

Dikembangkan oleh MPTI-2026-Kelompok-06 untuk proyek UAS Manajemen Proyek TI.

## 1. Teknologi

| Teknologi | Versi |
|---|---|
| Node.js | 24.21.0 |
| npm | 11.19.0 |
| Vite | 8.3.7 |
| Vue | 3.5.45 |
| Vue Router | 5.4.0 |
| Pinia | 4.1.0 |
| Axios | 1.21.1 |
| Bootstrap | 5.3.8 |
| MSW | 3.0.5 |

## 2. Persyaratan

Pastikan perangkat sudah memiliki:

- Node.js 20 atau lebih baru.
- npm.
- Git.
- Visual Studio Code atau editor kode lainnya.

## 3. Instalasi Proyek

Clone repository:

```bash
git clone https://github.com/primahadiramadhan03-ship-it/eventhub-web.git
```

Masuk ke direktori proyek:

```bash
cd eventhub-web
```

Instal dependency:

```bash
npm install
```

## 4. Konfigurasi Environment

Buat file `.env` dengan menyalin `.env.example`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Isi konfigurasi:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENABLE_MOCK_API=true
```

Keterangan:

- `VITE_API_BASE_URL`: alamat dasar REST API EventHub.
- `VITE_ENABLE_MOCK_API=true`: mengaktifkan Mock Service Worker (MSW) selama development.

File `.env` tidak boleh di-commit ke repository.

## 5. Menjalankan Aplikasi

Jalankan development server:

```bash
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya:

```text
http://localhost:5173
```

Ketika mock aktif, Console browser akan menampilkan pesan:

```text
[MSW] Mock API EventHub aktif
```

MSW digunakan untuk menyimulasikan respons REST API selama backend Laravel belum siap.

## 6. Mock API (MSW)

Mock API menggunakan Mock Service Worker (MSW) versi 3.

Service Worker berada di:

```text
public/mockServiceWorker.js
```

Handler endpoint berada di:

```text
src/mocks/handlers.js
```

Inisialisasi browser:

```text
src/mocks/browser.js
```

Mock API mengikuti rancangan kontrak REST API EventHub dengan base URL:

```text
/api/v1
```

Endpoint yang disimulasikan meliputi:

**Autentikasi**
- POST `/auth/login`
- POST `/auth/register`
- POST `/auth/logout`
- GET `/auth/me`

**Publik**
- GET `/categories`
- GET `/events`
- GET `/events/{id}`

**Peserta**
- POST `/events/{id}/register`
- GET `/me/registrations`
- GET `/me/registrations/{id}`
- GET `/me/dashboard`

**Panitia**
- GET, POST `/organizer/events`
- GET, PUT, DELETE `/organizer/events/{id}`
- PUT `/organizer/events/{id}/form-fields`
- POST `/organizer/events/{id}/payment`
- GET `/organizer/events/{id}/registrations`
- POST `/organizer/check-in`
- GET `/organizer/events/{id}/report`
- GET `/organizer/events/{id}/export`

**Developer**
- GET `/admin/events`
- GET `/admin/events/{id}`
- POST `/admin/events/{id}/approve`
- POST `/admin/events/{id}/reject`
- GET `/admin/payments`
- GET `/admin/dashboard`
- CRUD `/admin/categories`

**Notifikasi**
- GET `/notifications`
- PATCH `/notifications/{id}/read`

**Internal**
- POST `/internal/purge-expired-drafts`

### Akun Demo

| Role | Email | Password |
|---|---|---|
| Peserta | peserta@eventhub.test | password123 |
| Panitia | panitia@eventhub.test | password123 |
| Developer | developer@eventhub.test | password123 |

Akun tersebut hanya untuk pengujian mock API, bukan akun backend produksi.

### Catatan Mock API

- Data mock disimpan sementara di memori browser.
- Data kembali ke kondisi awal setelah halaman dimuat ulang.
- Mock tidak menggunakan database MySQL.
- Operasi transaksi atomik dan `lockForUpdate` tetap harus diterapkan pada backend Laravel.
- Endpoint ekspor masih berupa simulasi data JSON, bukan file XLSX sebenarnya.

### Simulasi Purge Draft Kedaluwarsa Secara Lokal (Bab 14)

Sesuai aturan bisnis **BR-08** dan **BR-09**, draft event yang tidak dibayar dalam 24 jam akan dihapus otomatis.

Untuk menguji pembersihan draft kedaluwarsa pada mock API MSW:

Kirim request `POST` ke endpoint internal purge:

```bash
curl -X POST http://localhost:5173/api/v1/internal/purge-expired-drafts \
  -H "X-Internal-Secret: eventhub-purge-secret"
```

Response yang dihasilkan:

```json
{
  "success": true,
  "message": "Purge draft kedaluwarsa selesai",
  "data": {
    "purged_count": 1
  }
}
```

Draft dengan ID 13 (yang memiliki `payment_deadline` lampau) akan terhapus otomatis dari memori.

## 7. Struktur Folder

```text
eventhub-web/
├── public/
│   └── mockServiceWorker.js
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── mocks/
│   │   ├── browser.js
│   │   └── handlers.js
│   ├── router/
│   │   └── index.js
│   ├── services/
│   │   ├── api.js
│   │   └── authService.js
│   ├── stores/
│   │   └── auth.js
│   ├── utils/
│   ├── views/
│   │   ├── auth/
│   │   ├── developer/
│   │   ├── panitia/
│   │   └── peserta/
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

## 8. Menjalankan Build

Untuk memeriksa aplikasi:

```bash
npm run build
```

Untuk melihat hasil build secara lokal:

```bash
npm run preview
```

## 9. Integrasi dengan Backend

Backend EventHub menggunakan Laravel 12, PHP 8.3, Laravel Sanctum, dan MySQL 8.4 LTS.

Ketika backend sudah siap, ubah konfigurasi `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENABLE_MOCK_API=false
```

Kemudian jalankan ulang development server.

Frontend menggunakan Axios untuk mengirim request JSON ke REST API Laravel dengan header Bearer Token untuk endpoint yang membutuhkan autentikasi.

## 10. Tim Pengembang

**MPTI-2026-Kelompok-06 — EventHub**

- UI/UX Designer & Front-End Developer 1
- Front-End Developer 2
- Back-End Developer
- Database Engineer & Back-End Support
- Project Manager & System Analyst

Repository Frontend: `eventhub-web`

Repository Backend: `eventhub-api`
