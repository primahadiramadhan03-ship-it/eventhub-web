
import { http, HttpResponse } from 'msw'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
).replace(/\/$/, '')

// -----------------------------------------------------------------------------
// RESPONSE HELPERS
// -----------------------------------------------------------------------------

const successResponse = (data, message = 'Berhasil', options = {}) => {
  const body = { success: true, message, data }

  if (options.meta) body.meta = options.meta

  return HttpResponse.json(body, {
    status: options.status ?? 200,
  })
}

const errorResponse = (status, code, message, errors = null) => {
  const body = {
    success: false,
    message,
    code,
  }

  if (errors) body.errors = errors

  return HttpResponse.json(body, { status })
}

const paginate = (items, url) => {
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(
    50,
    Math.max(1, Number(url.searchParams.get('per_page')) || 10),
  )

  const total = items.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))

  return {
    data: items.slice((page - 1) * perPage, page * perPage),
    meta: {
      current_page: page,
      per_page: perPage,
      total,
      last_page: lastPage,
    },
  }
}

const nowIso = () => new Date().toISOString()

const nextId = (items) =>
  Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1

const isValidDate = (value) =>
  value && !Number.isNaN(new Date(value).getTime())

// -----------------------------------------------------------------------------
// DEMO USERS
// -----------------------------------------------------------------------------

const users = [
  {
    id: 1,
    name: 'Peserta Demo',
    email: 'peserta@eventhub.test',
    password: 'password123',
    role: 'peserta',
    token: 'mock-token-peserta',
  },
  {
    id: 2,
    name: 'Panitia Demo',
    email: 'panitia@eventhub.test',
    password: 'password123',
    role: 'panitia',
    token: 'mock-token-panitia',
  },
  {
    id: 3,
    name: 'Developer Demo',
    email: 'developer@eventhub.test',
    password: 'password123',
    role: 'developer',
    token: 'mock-token-developer',
  },
  {
    id: 4,
    name: 'Budi Santoso',
    email: 'budi@eventhub.test',
    password: 'password123',
    role: 'peserta',
    token: 'mock-token-budi',
  },
  {
    id: 5,
    name: 'Siti Aminah',
    email: 'siti@eventhub.test',
    password: 'password123',
    role: 'peserta',
    token: 'mock-token-siti',
  },
  {
    id: 6,
    name: 'Panitia Himpunan Mahasiswa',
    email: 'panitia2@eventhub.test',
    password: 'password123',
    role: 'panitia',
    token: 'mock-token-panitia2',
  },
]

function getUserFromRequest(request) {
  const authorization = request.headers.get('Authorization')

  if (!authorization?.startsWith('Bearer ')) return null

  const token = authorization.slice(7)

  return users.find((user) => user.token === token) ?? null
}

function publicUser(user) {
  if (!user) return null

  const { password, token, ...userData } = user

  return userData
}

function authorize(request, allowedRoles = []) {
  const user = getUserFromRequest(request)

  if (!user) {
    return {
      user: null,
      response: errorResponse(
        401,
        'UNAUTHENTICATED',
        'Silakan login terlebih dahulu.',
      ),
    }
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      response: errorResponse(
        403,
        'FORBIDDEN',
        'Anda tidak memiliki izin untuk mengakses resource ini.',
      ),
    }
  }

  return {
    user,
    response: null,
  }
}

// -----------------------------------------------------------------------------
// MOCK DATA
// Semua data disimpan sementara di memori.
// -----------------------------------------------------------------------------

const categories = [
  { id: 1, name: 'Seminar', description: 'Acara seminar dan webinar akademis/profesional' },
  { id: 2, name: 'Workshop', description: 'Pelatihan dan lokakarya teknis hands-on' },
  { id: 3, name: 'Lomba', description: 'Kompetisi, hackathon, dan perlombaan' },
  { id: 4, name: 'Kepanitiaan', description: 'Open recruitment dan kegiatan kepanitiaan' },
  { id: 5, name: 'Komunitas', description: 'Meetup, sharing session, dan gathering komunitas' },
]

const events = [
  // 1. Tayang (Aktif, sisa kuota aman)
  {
    id: 1,
    created_by: 2,
    category_id: 1,
    title: 'Seminar Teknologi Informasi 2026',
    description: 'Seminar perkembangan teknologi informasi, cloud, dan kecerdasan buatan.',
    poster_url: 'https://placehold.co/600x400?text=Seminar+TI+2026',
    location: 'Auditorium UNS, Surakarta',
    start_time: '2026-11-20T09:00:00+07:00',
    end_time: '2026-11-20T15:00:00+07:00',
    quota: 100,
    remaining_quota: 65,
    status: 'tayang',
    payment_deadline: null,
    reject_reason: null,
    reviewed_by: 3,
    reviewed_at: '2026-11-10T08:00:00+07:00',
    published_at: '2026-11-10T08:00:00+07:00',
    created_at: '2026-11-09T08:00:00+07:00',
    updated_at: '2026-11-10T08:00:00+07:00',
  },
  // 2. Tayang (KUOTA HABIS / remaining_quota = 0, BR-01)
  {
    id: 2,
    created_by: 2,
    category_id: 2,
    title: 'Web Development Workshop (Vue & Laravel)',
    description: 'Workshop intensif pengembangan aplikasi web menggunakan Vue 3 dan Laravel 12.',
    poster_url: 'https://placehold.co/600x400?text=Workshop+Web+Full',
    location: 'Gedung Sekolah Vokasi UNS, Surakarta',
    start_time: '2026-11-25T08:00:00+07:00',
    end_time: '2026-11-25T16:00:00+07:00',
    quota: 50,
    remaining_quota: 0,
    status: 'tayang',
    payment_deadline: null,
    reject_reason: null,
    reviewed_by: 3,
    reviewed_at: '2026-11-10T09:00:00+07:00',
    published_at: '2026-11-10T09:00:00+07:00',
    created_at: '2026-11-09T09:00:00+07:00',
    updated_at: '2026-11-10T09:00:00+07:00',
  },
  // 3. Tayang (Selesai / Tanggal Lampau, K-19)
  {
    id: 3,
    created_by: 2,
    category_id: 3,
    title: 'UI/UX Design Competition 2026',
    description: 'Kompetisi desain antarmuka dan pengalaman pengguna tingkat nasional.',
    poster_url: 'https://placehold.co/600x400?text=UI+UX+Competition',
    location: 'Surakarta (Online & Offline)',
    start_time: '2026-11-01T08:00:00+07:00',
    end_time: '2026-11-01T17:00:00+07:00',
    quota: 80,
    remaining_quota: 10,
    status: 'tayang',
    payment_deadline: null,
    reject_reason: null,
    reviewed_by: 3,
    reviewed_at: '2026-10-28T10:00:00+07:00',
    published_at: '2026-10-28T10:00:00+07:00',
    created_at: '2026-10-27T10:00:00+07:00',
    updated_at: '2026-10-28T10:00:00+07:00',
  },
  // 4. Tayang (National Tech Summit)
  {
    id: 4,
    created_by: 6,
    category_id: 1,
    title: 'National Technology Summit 2026',
    description: 'Konferensi teknologi tahunan menghadirkan praktisi industri digital.',
    poster_url: 'https://placehold.co/600x400?text=Tech+Summit+2026',
    location: 'Grand Ballroom Solo, Surakarta',
    start_time: '2026-12-05T08:30:00+07:00',
    end_time: '2026-12-05T16:30:00+07:00',
    quota: 200,
    remaining_quota: 140,
    status: 'tayang',
    payment_deadline: null,
    reject_reason: null,
    reviewed_by: 3,
    reviewed_at: '2026-11-10T11:00:00+07:00',
    published_at: '2026-11-10T11:00:00+07:00',
    created_at: '2026-11-09T11:00:00+07:00',
    updated_at: '2026-11-10T11:00:00+07:00',
  },
  // 5. Tayang (Data Science Intensive Bootcamp)
  {
    id: 5,
    created_by: 6,
    category_id: 2,
    title: 'Data Science Intensive Bootcamp',
    description: 'Bootcamp 3 hari menguasai analisis data, visualisasi, dan machine learning praktis.',
    poster_url: 'https://placehold.co/600x400?text=Data+Science+Bootcamp',
    location: 'Lab Komputasi FMIPA UNS, Surakarta',
    start_time: '2026-12-12T09:00:00+07:00',
    end_time: '2026-12-14T17:00:00+07:00',
    quota: 30,
    remaining_quota: 12,
    status: 'tayang',
    payment_deadline: null,
    reject_reason: null,
    reviewed_by: 3,
    reviewed_at: '2026-11-11T10:00:00+07:00',
    published_at: '2026-11-11T10:00:00+07:00',
    created_at: '2026-11-10T09:00:00+07:00',
    updated_at: '2026-11-11T10:00:00+07:00',
  },
  // 6. Tayang (Game Development Hackathon)
  {
    id: 6,
    created_by: 2,
    category_id: 3,
    title: '24-Hour Game Development Hackathon',
    description: 'Kompetisi membuat game 2D/3D bertema kearifan lokal dalam 24 jam.',
    poster_url: 'https://placehold.co/600x400?text=Game+Hackathon',
    location: 'Gedung Haris UNS, Surakarta',
    start_time: '2026-12-18T08:00:00+07:00',
    end_time: '2026-12-19T20:00:00+07:00',
    quota: 60,
    remaining_quota: 25,
    status: 'tayang',
    payment_deadline: null,
    reject_reason: null,
    reviewed_by: 3,
    reviewed_at: '2026-11-11T13:00:00+07:00',
    published_at: '2026-11-11T13:00:00+07:00',
    created_at: '2026-11-10T11:00:00+07:00',
    updated_at: '2026-11-11T13:00:00+07:00',
  },
  // 7. Tayang (Cyber Security Meetup)
  {
    id: 7,
    created_by: 2,
    category_id: 5,
    title: 'Cyber Security & Ethical Hacking Meetup',
    description: 'Sharing session seputar keamanan siber, bug bounty, dan defensif security.',
    poster_url: 'https://placehold.co/600x400?text=Cyber+Security',
    location: 'Ruang Kolaborasi Lantai 2 Solo Techno Park',
    start_time: '2026-11-28T13:00:00+07:00',
    end_time: '2026-11-28T17:00:00+07:00',
    quota: 75,
    remaining_quota: 45,
    status: 'tayang',
    payment_deadline: null,
    reject_reason: null,
    reviewed_by: 3,
    reviewed_at: '2026-11-12T08:00:00+07:00',
    published_at: '2026-11-12T08:00:00+07:00',
    created_at: '2026-11-11T08:00:00+07:00',
    updated_at: '2026-11-12T08:00:00+07:00',
  },
  // 8. Tayang (Festival Seni Kampus)
  {
    id: 8,
    created_by: 6,
    category_id: 4,
    title: 'Festival Seni & Budaya Kampus 2026',
    description: 'Pergelaran pentas seni musik, teater, dan pameran karya visual mahasiswa.',
    poster_url: 'https://placehold.co/600x400?text=Festival+Seni',
    location: 'Halaman Gedung Rektorat UNS, Surakarta',
    start_time: '2026-12-02T10:00:00+07:00',
    end_time: '2026-12-03T21:00:00+07:00',
    quota: 120,
    remaining_quota: 85,
    status: 'tayang',
    payment_deadline: null,
    reject_reason: null,
    reviewed_by: 3,
    reviewed_at: '2026-11-12T10:00:00+07:00',
    published_at: '2026-11-12T10:00:00+07:00',
    created_at: '2026-11-11T10:00:00+07:00',
    updated_at: '2026-11-12T10:00:00+07:00',
  },
  // 9. Menunggu Review (Antrean review Developer /admin/review)
  {
    id: 9,
    created_by: 2,
    category_id: 4,
    title: 'Open Recruitment Panitia Dies Natalis 2026',
    description: 'Pendaftaran panitia mahasiswa untuk rangkaian perayaan Dies Natalis kampus.',
    poster_url: 'https://placehold.co/600x400?text=Oprec+Dies+Natalis',
    location: 'Student Center UNS, Surakarta',
    start_time: '2026-12-01T09:00:00+07:00',
    end_time: '2026-12-02T17:00:00+07:00',
    quota: 150,
    remaining_quota: 150,
    status: 'menunggu_review',
    payment_deadline: null,
    reject_reason: null,
    reviewed_by: null,
    reviewed_at: null,
    published_at: null,
    created_at: '2026-11-12T10:00:00+07:00',
    updated_at: '2026-11-12T11:00:00+07:00',
  },
  // 10. Menunggu Review (Antrean review Developer kedua)
  {
    id: 10,
    created_by: 6,
    category_id: 2,
    title: 'Pelatihan Public Speaking & Pitching Mahasiswa',
    description: 'Pelatihan teknik komunikasi percaya diri dan presentasi ide bisnis rintisan.',
    poster_url: 'https://placehold.co/600x400?text=Public+Speaking',
    location: 'Ruang Seminar LPPM UNS, Surakarta',
    start_time: '2026-12-08T09:00:00+07:00',
    end_time: '2026-12-08T15:00:00+07:00',
    quota: 50,
    remaining_quota: 50,
    status: 'menunggu_review',
    payment_deadline: null,
    reject_reason: null,
    reviewed_by: null,
    reviewed_at: null,
    published_at: null,
    created_at: '2026-11-13T08:30:00+07:00',
    updated_at: '2026-11-13T09:00:00+07:00',
  },
  // 11. Ditolak (Memuat alasan penolakan BR-13, K-15)
  {
    id: 11,
    created_by: 2,
    category_id: 5,
    title: 'Gathering Komunitas Game Liar Solo',
    description: 'Kumpul komunitas gaming santai akhir pekan di warung kopi.',
    poster_url: 'https://placehold.co/600x400?text=Event+Ditolak',
    location: 'Warkop Area Manahan, Surakarta',
    start_time: '2026-11-30T10:00:00+07:00',
    end_time: '2026-11-30T18:00:00+07:00',
    quota: 30,
    remaining_quota: 30,
    status: 'ditolak',
    payment_deadline: null,
    reject_reason: 'Deskripsi acara tidak jelas dan lokasi tidak memenuhi syarat perizinan kampus.',
    reviewed_by: 3,
    reviewed_at: '2026-11-11T14:00:00+07:00',
    published_at: null,
    created_at: '2026-11-11T09:00:00+07:00',
    updated_at: '2026-11-11T14:00:00+07:00',
  },
  // 12. Draft Aktif (Timer 24 jam berjalan, K-16, BR-08)
  {
    id: 12,
    created_by: 2,
    category_id: 2,
    title: 'Workshop Cloud Native & Kubernetes Essentials',
    description: 'Praktik arsitektur microservices dan orchestrasi container menggunakan Kubernetes.',
    poster_url: 'https://placehold.co/600x400?text=Workshop+Kubernetes',
    location: 'Lab Jaringan Komputer UNS',
    start_time: '2026-12-10T09:00:00+07:00',
    end_time: '2026-12-10T16:00:00+07:00',
    quota: 40,
    remaining_quota: 40,
    status: 'draft',
    payment_deadline: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    reject_reason: null,
    reviewed_by: null,
    reviewed_at: null,
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // 13. Draft Kedaluwarsa (Untuk demo purge draft Q7 / Bab 14)
  {
    id: 13,
    created_by: 2,
    category_id: 1,
    title: 'Seminar Bisnis Digital Mahasiswa (Draft Expired)',
    description: 'Draft seminar yang tidak dibayar selama 24 jam dan siap dibersihkan oleh purge scheduler.',
    poster_url: 'https://placehold.co/600x400?text=Expired+Draft',
    location: 'Ruang Teater UNS',
    start_time: '2026-12-15T09:00:00+07:00',
    end_time: '2026-12-15T15:00:00+07:00',
    quota: 100,
    remaining_quota: 100,
    status: 'draft',
    payment_deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reject_reason: null,
    reviewed_by: null,
    reviewed_at: null,
    published_at: null,
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
]

const eventFormFields = {
  1: [
    {
      id: 11,
      event_id: 1,
      label: 'Asal Universitas / Instansi',
      field_type: 'text',
      options: null,
      is_required: true,
      sort_order: 1,
    },
    {
      id: 12,
      event_id: 1,
      label: 'Nomor WhatsApp Aktif',
      field_type: 'text',
      options: null,
      is_required: true,
      sort_order: 2,
    },
  ],
  2: [
    {
      id: 21,
      event_id: 2,
      label: 'Asal Kampus / Program Studi',
      field_type: 'text',
      options: null,
      is_required: true,
      sort_order: 1,
    },
    {
      id: 22,
      event_id: 2,
      label: 'Ukuran Kaos Peserta',
      field_type: 'dropdown',
      options: ['S', 'M', 'L', 'XL', 'XXL'],
      is_required: true,
      sort_order: 2,
    },
  ],
  3: [
    {
      id: 31,
      event_id: 3,
      label: 'Nama Tim Desain',
      field_type: 'text',
      options: null,
      is_required: true,
      sort_order: 1,
    },
    {
      id: 32,
      event_id: 3,
      label: 'Jumlah Anggota Tim',
      field_type: 'number',
      options: null,
      is_required: true,
      sort_order: 2,
    },
  ],
  4: [
    {
      id: 41,
      event_id: 4,
      label: 'Kategori Peserta',
      field_type: 'dropdown',
      options: ['Mahasiswa', 'Akademisi / Dosen', 'Praktisi Industri', 'Umum'],
      is_required: true,
      sort_order: 1,
    },
    {
      id: 42,
      event_id: 4,
      label: 'Nama Institusi / Perusahaan',
      field_type: 'text',
      options: null,
      is_required: false,
      sort_order: 2,
    },
  ],
  5: [
    {
      id: 51,
      event_id: 5,
      label: 'Motivasi Mengikuti Bootcamp',
      field_type: 'textarea',
      options: null,
      is_required: true,
      sort_order: 1,
    },
    {
      id: 52,
      event_id: 5,
      label: 'Tautan Portofolio / GitHub',
      field_type: 'text',
      options: null,
      is_required: false,
      sort_order: 2,
    },
  ],
  9: [
    {
      id: 91,
      event_id: 9,
      label: 'Pilihan Divisi Kepanitiaan',
      field_type: 'dropdown',
      options: ['Acara', 'Humas & Sponsorship', 'Logistik', 'Dekorasi & Dokumentasi'],
      is_required: true,
      sort_order: 1,
    },
    {
      id: 92,
      event_id: 9,
      label: 'Pengalaman Organisasi',
      field_type: 'textarea',
      options: null,
      is_required: true,
      sort_order: 2,
    },
  ],
  10: [
    {
      id: 101,
      event_id: 10,
      label: 'Tujuan Mengikuti Pelatihan',
      field_type: 'text',
      options: null,
      is_required: true,
      sort_order: 1,
    },
  ],
  12: [
    {
      id: 121,
      event_id: 12,
      label: 'Pengalaman Dasar Container / Docker',
      field_type: 'dropdown',
      options: ['Pemula (Belum Pernah)', 'Menengah (Pernah Pakai)', 'Mahir'],
      is_required: true,
      sort_order: 1,
    },
  ],
  13: [],
}

const payments = [
  {
    id: 1,
    event_id: 1,
    user_id: 2,
    amount: 50000,
    reference_no: 'TRX-20261109-001',
    proof_url: 'https://placehold.co/600x800?text=Bukti+Transfer+001',
    status: 'terverifikasi',
    paid_at: '2026-11-09T08:30:00+07:00',
    verified_at: '2026-11-10T08:00:00+07:00',
  },
  {
    id: 2,
    event_id: 2,
    user_id: 2,
    amount: 50000,
    reference_no: 'TRX-20261109-002',
    proof_url: 'https://placehold.co/600x800?text=Bukti+Transfer+002',
    status: 'terverifikasi',
    paid_at: '2026-11-09T09:30:00+07:00',
    verified_at: '2026-11-10T09:00:00+07:00',
  },
  {
    id: 3,
    event_id: 3,
    user_id: 2,
    amount: 50000,
    reference_no: 'TRX-20261027-003',
    proof_url: 'https://placehold.co/600x800?text=Bukti+Transfer+003',
    status: 'terverifikasi',
    paid_at: '2026-10-27T10:30:00+07:00',
    verified_at: '2026-10-28T10:00:00+07:00',
  },
  {
    id: 4,
    event_id: 4,
    user_id: 6,
    amount: 50000,
    reference_no: 'TRX-20261109-004',
    proof_url: 'https://placehold.co/600x800?text=Bukti+Transfer+004',
    status: 'terverifikasi',
    paid_at: '2026-11-09T11:30:00+07:00',
    verified_at: '2026-11-10T11:00:00+07:00',
  },
  {
    id: 5,
    event_id: 5,
    user_id: 6,
    amount: 50000,
    reference_no: 'TRX-20261110-005',
    proof_url: 'https://placehold.co/600x800?text=Bukti+Transfer+005',
    status: 'terverifikasi',
    paid_at: '2026-11-10T09:30:00+07:00',
    verified_at: '2026-11-11T10:00:00+07:00',
  },
  {
    id: 6,
    event_id: 6,
    user_id: 2,
    amount: 50000,
    reference_no: 'TRX-20261110-006',
    proof_url: 'https://placehold.co/600x800?text=Bukti+Transfer+006',
    status: 'terverifikasi',
    paid_at: '2026-11-10T11:30:00+07:00',
    verified_at: '2026-11-11T13:00:00+07:00',
  },
  {
    id: 7,
    event_id: 7,
    user_id: 2,
    amount: 50000,
    reference_no: 'TRX-20261111-007',
    proof_url: 'https://placehold.co/600x800?text=Bukti+Transfer+007',
    status: 'terverifikasi',
    paid_at: '2026-11-11T08:30:00+07:00',
    verified_at: '2026-11-12T08:00:00+07:00',
  },
  {
    id: 8,
    event_id: 8,
    user_id: 6,
    amount: 50000,
    reference_no: 'TRX-20261111-008',
    proof_url: 'https://placehold.co/600x800?text=Bukti+Transfer+008',
    status: 'terverifikasi',
    paid_at: '2026-11-11T10:30:00+07:00',
    verified_at: '2026-11-12T10:00:00+07:00',
  },
  {
    id: 9,
    event_id: 9,
    user_id: 2,
    amount: 50000,
    reference_no: 'TRX-20261112-009',
    proof_url: 'https://placehold.co/600x800?text=Bukti+Transfer+009',
    status: 'menunggu_verifikasi',
    paid_at: '2026-11-12T11:00:00+07:00',
    verified_at: null,
  },
  {
    id: 10,
    event_id: 10,
    user_id: 6,
    amount: 50000,
    reference_no: 'TRX-20261113-010',
    proof_url: 'https://placehold.co/600x800?text=Bukti+Transfer+010',
    status: 'menunggu_verifikasi',
    paid_at: '2026-11-13T09:00:00+07:00',
    verified_at: null,
  },
  {
    id: 11,
    event_id: 11,
    user_id: 2,
    amount: 50000,
    reference_no: 'TRX-20261111-011',
    proof_url: 'https://placehold.co/600x800?text=Bukti+Transfer+011',
    status: 'dikembalikan',
    paid_at: '2026-11-11T09:30:00+07:00',
    verified_at: '2026-11-11T14:00:00+07:00',
  },
]

const registrations = [
  {
    id: 1,
    user_id: 1,
    event_id: 1,
    status: 'registered',
    ticket_code: 'EVT-1-K3M9QX2A',
    registered_at: '2026-11-12T09:15:00+07:00',
    checked_in_at: null,
    checked_in_by: null,
  },
  {
    id: 2,
    user_id: 1,
    event_id: 3,
    status: 'attended',
    ticket_code: 'EVT-3-P8L2ZW1Q',
    registered_at: '2026-10-29T10:00:00+07:00',
    checked_in_at: '2026-11-01T08:45:00+07:00',
    checked_in_by: 2,
  },
  {
    id: 3,
    user_id: 4,
    event_id: 1,
    status: 'registered',
    ticket_code: 'EVT-1-B7X4MN2P',
    registered_at: '2026-11-12T11:00:00+07:00',
    checked_in_at: null,
    checked_in_by: null,
  },
  {
    id: 4,
    user_id: 5,
    event_id: 1,
    status: 'attended',
    ticket_code: 'EVT-1-S9T1KL5R',
    registered_at: '2026-11-12T14:20:00+07:00',
    checked_in_at: '2026-11-13T09:00:00+07:00',
    checked_in_by: 2,
  },
  {
    id: 5,
    user_id: 4,
    event_id: 2,
    status: 'registered',
    ticket_code: 'EVT-2-W4J8VC3D',
    registered_at: '2026-11-10T15:30:00+07:00',
    checked_in_at: null,
    checked_in_by: null,
  },
  {
    id: 6,
    user_id: 5,
    event_id: 3,
    status: 'attended',
    ticket_code: 'EVT-3-C5N2TY8E',
    registered_at: '2026-10-30T11:00:00+07:00',
    checked_in_at: '2026-11-01T08:50:00+07:00',
    checked_in_by: 2,
  },
]

const registrationAnswers = [
  {
    id: 1,
    registration_id: 1,
    form_field_id: 11,
    answer: 'Universitas Sebelas Maret',
  },
  {
    id: 2,
    registration_id: 1,
    form_field_id: 12,
    answer: '081234567890',
  },
  {
    id: 3,
    registration_id: 2,
    form_field_id: 31,
    answer: 'Tim Solopreneur Creative',
  },
  {
    id: 4,
    registration_id: 2,
    form_field_id: 32,
    answer: '3',
  },
  {
    id: 5,
    registration_id: 3,
    form_field_id: 11,
    answer: 'Universitas Indonesia',
  },
  {
    id: 6,
    registration_id: 3,
    form_field_id: 12,
    answer: '085678901234',
  },
  {
    id: 7,
    registration_id: 4,
    form_field_id: 11,
    answer: 'Institut Teknologi Bandung',
  },
  {
    id: 8,
    registration_id: 4,
    form_field_id: 12,
    answer: '089876543210',
  },
  {
    id: 9,
    registration_id: 5,
    form_field_id: 21,
    answer: 'D3 Teknik Informatika UNS',
  },
  {
    id: 10,
    registration_id: 5,
    form_field_id: 22,
    answer: 'L',
  },
  {
    id: 11,
    registration_id: 6,
    form_field_id: 31,
    answer: 'PixelCraft Studio',
  },
  {
    id: 12,
    registration_id: 6,
    form_field_id: 32,
    answer: '2',
  },
]

const notifications = [
  {
    id: 1,
    user_id: 2,
    title: 'Event Disetujui & Tayang',
    message: 'Event "Seminar Teknologi Informasi 2026" telah disetujui Developer dan sedang tayang.',
    is_read: false,
    created_at: '2026-11-10T08:00:00+07:00',
  },
  {
    id: 2,
    user_id: 2,
    title: 'Event Disetujui & Tayang',
    message: 'Event "Web Development Workshop" telah disetujui Developer dan sedang tayang.',
    is_read: true,
    created_at: '2026-11-10T09:00:00+07:00',
  },
  {
    id: 3,
    user_id: 2,
    title: 'Pengajuan Event Ditolak',
    message: 'Event "Gathering Komunitas Game Liar Solo" ditolak: Deskripsi acara tidak jelas dan lokasi tidak memenuhi syarat perizinan kampus.',
    is_read: false,
    created_at: '2026-11-11T14:00:00+07:00',
  },
  {
    id: 4,
    user_id: 2,
    title: 'Pembayaran Sewa Diterima',
    message: 'Pembayaran sewa penayangan Rp 50.000 untuk event #1 telah terverifikasi oleh Developer.',
    is_read: true,
    created_at: '2026-11-10T08:00:00+07:00',
  },
  {
    id: 5,
    user_id: 1,
    title: 'Pendaftaran Berhasil',
    message: 'Pendaftaran Anda di "Seminar Teknologi Informasi 2026" berhasil. Kode tiket: EVT-1-K3M9QX2A.',
    is_read: false,
    created_at: '2026-11-12T09:15:00+07:00',
  },
  {
    id: 6,
    user_id: 1,
    title: 'Kehadiran Terverifikasi',
    message: 'Check-in Anda untuk acara "UI/UX Design Competition 2026" berhasil dicatat oleh panitia.',
    is_read: true,
    created_at: '2026-11-01T08:45:00+07:00',
  },
]

// -----------------------------------------------------------------------------
// DATA HELPERS
// -----------------------------------------------------------------------------

function getOwnedEvent(eventId, userId, { allowExpired = false } = {}) {
  const event = events.find(
    (item) =>
      item.id === Number(eventId) &&
      item.created_by === userId,
  )

  if (!event) return null

  // BR-09: Draft yang melewati payment_deadline dianggap tidak ada saat diakses (K-04)
  if (
    !allowExpired &&
    event.status === 'draft' &&
    event.payment_deadline &&
    new Date(event.payment_deadline).getTime() < Date.now()
  ) {
    return null
  }

  return event
}

function eventWithRelations(event) {
  return {
    ...event,
    category:
      categories.find((category) => category.id === event.category_id) ?? null,
    form_fields: eventFormFields[event.id] ?? [],
    payment:
      payments.find((payment) => payment.event_id === event.id) ?? null,
  }
}

// -----------------------------------------------------------------------------
// VALIDATION HELPERS
// -----------------------------------------------------------------------------

function validateEventPayload(body, { partial = false } = {}) {
  const errors = {}

  const required = [
    'title',
    'description',
    'category_id',
    'location',
    'start_time',
    'end_time',
    'quota',
  ]

  if (!partial) {
    for (const field of required) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ''
      ) {
        errors[field] = [`${field} wajib diisi.`]
      }
    }
  }

  if (
    body.title !== undefined &&
    (typeof body.title !== 'string' || !body.title.trim())
  ) {
    errors.title = ['Judul event wajib diisi.']
  }

  if (
    body.description !== undefined &&
    (typeof body.description !== 'string' || !body.description.trim())
  ) {
    errors.description = ['Deskripsi wajib diisi.']
  }

  if (
    body.category_id !== undefined &&
    !categories.some((item) => item.id === Number(body.category_id))
  ) {
    errors.category_id = ['Kategori tidak valid.']
  }

  if (
    body.location !== undefined &&
    (typeof body.location !== 'string' || !body.location.trim())
  ) {
    errors.location = ['Lokasi wajib diisi.']
  }

  if (body.start_time !== undefined && !isValidDate(body.start_time)) {
    errors.start_time = ['Tanggal mulai tidak valid.']
  }

  if (body.end_time !== undefined && !isValidDate(body.end_time)) {
    errors.end_time = ['Tanggal selesai tidak valid.']
  }

  if (
    isValidDate(body.start_time) &&
    isValidDate(body.end_time) &&
    new Date(body.end_time) <= new Date(body.start_time)
  ) {
    errors.end_time = ['Tanggal selesai harus setelah tanggal mulai.']
  }

  if (body.quota !== undefined) {
    const quota = Number(body.quota)

    if (!Number.isInteger(quota) || quota < 1 || quota > 10000) {
      errors.quota = [
        'Kuota harus berupa angka bulat 1 sampai 10000.',
      ]
    }
  }

  return errors
}

function validateFormFields(fields) {
  const errors = {}
  const validTypes = ['text', 'textarea', 'number', 'dropdown']

  if (!Array.isArray(fields)) {
    return { fields: ['Definisi formulir harus berupa array.'] }
  }

  if (fields.length > 10) {
    return { fields: ['Maksimal 10 pertanyaan.'] }
  }

  fields.forEach((field, index) => {
    if (!field.label?.trim()) {
      errors[`fields.${index}.label`] = [
        'Pertanyaan wajib memiliki label.',
      ]
    }

    if (!validTypes.includes(field.field_type)) {
      errors[`fields.${index}.field_type`] = [
        'Tipe pertanyaan tidak valid.',
      ]
    }

    if (
      field.field_type === 'dropdown' &&
      (!Array.isArray(field.options) || field.options.length < 2)
    ) {
      errors[`fields.${index}.options`] = [
        'Dropdown harus memiliki minimal 2 opsi.',
      ]
    }
  })

  return errors
}

function registrationAnswerErrors(fields, answers) {
  const errors = {}

  if (!Array.isArray(answers)) {
    return { answers: ['Jawaban harus berupa array.'] }
  }

  const answerMap = new Map(
    answers.map((answer) => [
      Number(answer.field_id),
      answer.value,
    ]),
  )

  for (const field of fields) {
    const value = answerMap.get(field.id)

    if (
      field.is_required &&
      (value === undefined ||
        value === null ||
        String(value).trim() === '')
    ) {
      errors[`answers.${field.id}`] = [
        `${field.label} wajib diisi.`,
      ]
      continue
    }

    if (value === undefined || value === null || value === '') continue

    if (
      field.field_type === 'number' &&
      !Number.isFinite(Number(value))
    ) {
      errors[`answers.${field.id}`] = [
        `${field.label} harus berupa angka.`,
      ]
    }

    if (
      field.field_type === 'dropdown' &&
      !field.options?.includes(value)
    ) {
      errors[`answers.${field.id}`] = [
        `Pilihan ${field.label} tidak valid.`,
      ]
    }
  }

  for (const answer of answers) {
    if (
      !fields.some(
        (field) => field.id === Number(answer.field_id),
      )
    ) {
      errors[`answers.${answer.field_id}`] = [
        'Pertanyaan formulir tidak ditemukan.',
      ]
    }
  }

  return errors
}

// -----------------------------------------------------------------------------
// API HANDLERS
// -----------------------------------------------------------------------------

export const handlers = [

  // ===========================================================================
  // AUTHENTICATION
  // ===========================================================================

  // POST /auth/login
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json()

    const user = users.find(
      (item) =>
        item.email === body.email &&
        item.password === body.password,
    )

    if (!user) {
      return errorResponse(
        401,
        'UNAUTHENTICATED',
        'Email atau password tidak sesuai.',
      )
    }

    return successResponse(
      {
        token: user.token,
        user: publicUser(user),
      },
      'Login berhasil',
    )
  }),

  // POST /auth/register
  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = await request.json()
    const errors = {}

    if (!body.name?.trim()) {
      errors.name = ['Nama wajib diisi.']
    }

    if (!body.email?.trim()) {
      errors.email = ['Email wajib diisi.']
    }

    if (
      body.email &&
      users.some(
        (user) =>
          user.email.toLowerCase() === body.email.toLowerCase(),
      )
    ) {
      errors.email = ['Email sudah digunakan.']
    }

    if (!body.password || body.password.length < 8) {
      errors.password = ['Password minimal 8 karakter.']
    }

    if (body.password !== body.password_confirmation) {
      errors.password_confirmation = [
        'Konfirmasi password tidak sesuai.',
      ]
    }

    if (!['peserta', 'panitia'].includes(body.role)) {
      errors.role = ['Role hanya boleh peserta atau panitia.']
    }

    if (Object.keys(errors).length) {
      return errorResponse(
        422,
        'VALIDATION_ERROR',
        'Validasi gagal.',
        errors,
      )
    }

    const id = nextId(users)

    const user = {
      id,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      password: body.password,
      role: body.role,
      token: `mock-token-${body.role}-${id}`,
    }

    users.push(user)

    return successResponse(
      {
        token: user.token,
        user: publicUser(user),
      },
      'Registrasi berhasil',
      { status: 201 },
    )
  }),

  // POST /auth/logout
  http.post(`${API_BASE_URL}/auth/logout`, ({ request }) => {
    const { response } = authorize(request, [
      'peserta',
      'panitia',
      'developer',
    ])

    if (response) return response

    return successResponse(null, 'Logout berhasil')
  }),

  // GET /auth/me
  http.get(`${API_BASE_URL}/auth/me`, ({ request }) => {
    const { user, response } = authorize(request, [
      'peserta',
      'panitia',
      'developer',
    ])

    if (response) return response

    return successResponse(
      publicUser(user),
      'Data pengguna berhasil diambil',
    )
  }),

  // ===========================================================================
  // PUBLIC
  // ===========================================================================

  // GET /categories
  http.get(`${API_BASE_URL}/categories`, () => {
    return successResponse(
      categories,
      'Kategori berhasil diambil',
    )
  }),

  // GET /events
  http.get(`${API_BASE_URL}/events`, ({ request }) => {
    const url = new URL(request.url)

    const search = url.searchParams.get('search')?.toLowerCase()
    const categoryId = url.searchParams.get('category_id')
    const dateFrom = url.searchParams.get('date_from')
    const dateTo = url.searchParams.get('date_to')
    const availability = url.searchParams.get('availability')

    let result = events.filter(
      (event) => event.status === 'tayang',
    )

    if (search) {
      result = result.filter((event) =>
        event.title.toLowerCase().includes(search),
      )
    }

    if (categoryId) {
      result = result.filter(
        (event) => event.category_id === Number(categoryId),
      )
    }

    if (dateFrom) {
      result = result.filter(
        (event) => event.start_time.slice(0, 10) >= dateFrom,
      )
    }

    if (dateTo) {
      result = result.filter(
        (event) => event.start_time.slice(0, 10) <= dateTo,
      )
    }

    if (availability === 'available') {
      result = result.filter(
        (event) => event.remaining_quota > 0,
      )
    }

    if (availability === 'full') {
      result = result.filter(
        (event) => event.remaining_quota === 0,
      )
    }

    const resultPage = paginate(result, url)

    return successResponse(
      resultPage.data,
      'Daftar event berhasil diambil',
      { meta: resultPage.meta },
    )
  }),

  // GET /events/:id
  http.get(`${API_BASE_URL}/events/:id`, ({ params }) => {
    const event = events.find(
      (item) =>
        item.id === Number(params.id) &&
        item.status === 'tayang',
    )

    if (!event) {
      return errorResponse(
        404,
        'NOT_FOUND',
        'Event tidak ditemukan.',
      )
    }

    return successResponse(
      eventWithRelations(event),
      'Detail event berhasil diambil',
    )
  }),

  // ===========================================================================
  // PARTICIPANT
  // ===========================================================================

  // POST /events/:id/register
  http.post(
    `${API_BASE_URL}/events/:id/register`,
    async ({ request, params }) => {
      const { user, response } = authorize(request, ['peserta'])

      if (response) return response

      const event = events.find(
        (item) =>
          item.id === Number(params.id) &&
          item.status === 'tayang',
      )

      if (!event) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Event tidak ditemukan.',
        )
      }

      if (new Date() >= new Date(event.start_time)) {
        return errorResponse(
          422,
          'REGISTRATION_CLOSED',
          'Pendaftaran event sudah ditutup.',
        )
      }

      if (event.remaining_quota <= 0) {
        return errorResponse(
          409,
          'QUOTA_FULL',
          'Kuota event sudah habis.',
        )
      }

      if (
        registrations.some(
          (item) =>
            item.user_id === user.id &&
            item.event_id === event.id,
        )
      ) {
        return errorResponse(
          409,
          'ALREADY_REGISTERED',
          'Anda sudah terdaftar pada event ini.',
        )
      }

      const body = await request.json()
      const fields = eventFormFields[event.id] ?? []
      const errors = registrationAnswerErrors(
        fields,
        body.answers,
      )

      if (Object.keys(errors).length) {
        return errorResponse(
          422,
          'VALIDATION_ERROR',
          'Validasi jawaban gagal.',
          errors,
        )
      }

      const registration = {
        id: nextId(registrations),
        user_id: user.id,
        event_id: event.id,
        status: 'registered',
        ticket_code: `EVT-${event.id}-${Math.random()
          .toString(36)
          .slice(2, 10)
          .toUpperCase()}`,
        registered_at: nowIso(),
        checked_in_at: null,
        checked_in_by: null,
      }

      registrations.push(registration)

      for (const answer of body.answers) {
        registrationAnswers.push({
          id: nextId(registrationAnswers),
          registration_id: registration.id,
          form_field_id: Number(answer.field_id),
          answer: String(answer.value),
        })
      }

      event.remaining_quota -= 1

      return successResponse(
        registration,
        'Pendaftaran berhasil',
        { status: 201 },
      )
    },
  ),

  // GET /me/registrations
  http.get(`${API_BASE_URL}/me/registrations`, ({ request }) => {
    const { user, response } = authorize(request, ['peserta'])

    if (response) return response

    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const status = url.searchParams.get('status')

    let result = registrations
      .filter((registration) => registration.user_id === user.id)
      .map((registration) => ({
        ...registration,
        event:
          events.find(
            (event) => event.id === registration.event_id,
          ) ?? null,
      }))

    if (search) {
      result = result.filter((item) =>
        item.event?.title.toLowerCase().includes(search),
      )
    }

    if (status) {
      result = result.filter(
        (item) => item.status === status,
      )
    }

    const resultPage = paginate(result, url)

    return successResponse(
      resultPage.data,
      'Riwayat pendaftaran berhasil diambil',
      { meta: resultPage.meta },
    )
  }),

  // GET /me/registrations/:id
  http.get(
    `${API_BASE_URL}/me/registrations/:id`,
    ({ request, params }) => {
      const { user, response } = authorize(request, ['peserta'])

      if (response) return response

      const registration = registrations.find(
        (item) =>
          item.id === Number(params.id) &&
          item.user_id === user.id,
      )

      if (!registration) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Tiket atau pendaftaran tidak ditemukan.',
        )
      }

      const answers = registrationAnswers
        .filter(
          (item) => item.registration_id === registration.id,
        )
        .map((item) => ({
          ...item,
          field:
            (eventFormFields[registration.event_id] ?? []).find(
              (field) => field.id === item.form_field_id,
            ) ?? null,
        }))

      return successResponse(
        {
          ...registration,
          event: events.find(
            (event) => event.id === registration.event_id,
          ) ?? null,
          answers,
        },
        'Detail tiket berhasil diambil',
      )
    },
  ),

  // GET /me/dashboard
  http.get(`${API_BASE_URL}/me/dashboard`, ({ request }) => {
    const { user, response } = authorize(request, ['peserta'])

    if (response) return response

    const mine = registrations.filter(
      (item) => item.user_id === user.id,
    )

    return successResponse(
      {
        total_registrations: mine.length,
        total_attended: mine.filter(
          (item) => item.status === 'attended',
        ).length,
        upcoming_events: mine.filter((item) => {
          const event = events.find(
            (entry) => entry.id === item.event_id,
          )

          return event && new Date(event.start_time) > new Date()
        }).length,
      },
      'Dashboard peserta berhasil diambil',
    )
  }),

  // ===========================================================================
  // ORGANIZER: EVENT CRUD
  // ===========================================================================

  // GET /organizer/events
  http.get(`${API_BASE_URL}/organizer/events`, ({ request }) => {
    const { user, response } = authorize(request, ['panitia'])

    if (response) return response

    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const status = url.searchParams.get('status')

    let result = events.filter((event) => {
      if (event.created_by !== user.id) return false

      // BR-09: Draft kedaluwarsa dianggap tidak ada di listing panitia
      if (
        event.status === 'draft' &&
        event.payment_deadline &&
        new Date(event.payment_deadline).getTime() < Date.now()
      ) {
        return false
      }

      return true
    })

    if (search) {
      result = result.filter((event) =>
        event.title.toLowerCase().includes(search),
      )
    }

    if (status) {
      result = result.filter(
        (event) => event.status === status,
      )
    }

    const resultPage = paginate(result, url)

    return successResponse(
      resultPage.data,
      'Daftar event panitia berhasil diambil',
      { meta: resultPage.meta },
    )
  }),

  // POST /organizer/events
  http.post(
    `${API_BASE_URL}/organizer/events`,
    async ({ request }) => {
      const { user, response } = authorize(request, ['panitia'])

      if (response) return response

      const body = await request.json()
      const errors = validateEventPayload(body)

      if (Object.keys(errors).length) {
        return errorResponse(
          422,
          'VALIDATION_ERROR',
          'Validasi gagal.',
          errors,
        )
      }

      const now = nowIso()

      const event = {
        id: nextId(events),
        created_by: user.id,
        category_id: Number(body.category_id),
        title: body.title.trim(),
        description: body.description.trim(),
        poster_url: body.poster_url || null,
        location: body.location.trim(),
        start_time: body.start_time,
        end_time: body.end_time,
        quota: Number(body.quota),
        remaining_quota: Number(body.quota),
        status: 'draft',
        payment_deadline: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(),
        reject_reason: null,
        reviewed_by: null,
        reviewed_at: null,
        published_at: null,
        created_at: now,
        updated_at: now,
      }

      events.push(event)
      eventFormFields[event.id] = []

      return successResponse(
        event,
        'Draft event berhasil dibuat',
        { status: 201 },
      )
    },
  ),

  // GET /organizer/events/:id
  http.get(
    `${API_BASE_URL}/organizer/events/:id`,
    ({ request, params }) => {
      const { user, response } = authorize(request, ['panitia'])

      if (response) return response

      const event = getOwnedEvent(params.id, user.id)

      if (!event) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Event tidak ditemukan.',
        )
      }

      return successResponse(
        eventWithRelations(event),
        'Detail event berhasil diambil',
      )
    },
  ),

  // PUT /organizer/events/:id
  http.put(
    `${API_BASE_URL}/organizer/events/:id`,
    async ({ request, params }) => {
      const { user, response } = authorize(request, ['panitia'])

      if (response) return response

      const event = getOwnedEvent(params.id, user.id)

      if (!event) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Event tidak ditemukan.',
        )
      }

      if (event.status !== 'draft') {
        return errorResponse(
          422,
          'EVENT_LOCKED',
          'Event tidak dapat diubah setelah pembayaran dikirim.',
        )
      }

      const body = await request.json()
      const errors = validateEventPayload(body, { partial: true })

      if (Object.keys(errors).length) {
        return errorResponse(
          422,
          'VALIDATION_ERROR',
          'Validasi gagal.',
          errors,
        )
      }

      const editableFields = [
        'title',
        'description',
        'poster_url',
        'location',
        'start_time',
        'end_time',
      ]

      for (const field of editableFields) {
        if (body[field] !== undefined) {
          event[field] = body[field]
        }
      }

      if (body.category_id !== undefined) {
        event.category_id = Number(body.category_id)
      }

      if (body.quota !== undefined) {
        event.quota = Number(body.quota)
        event.remaining_quota = Number(body.quota)
      }

      event.updated_at = nowIso()

      return successResponse(
        event,
        'Draft event berhasil diperbarui',
      )
    },
  ),

  // DELETE /organizer/events/:id
  http.delete(
    `${API_BASE_URL}/organizer/events/:id`,
    ({ request, params }) => {
      const { user, response } = authorize(request, ['panitia'])

      if (response) return response

      const event = getOwnedEvent(params.id, user.id)

      if (!event) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Event tidak ditemukan.',
        )
      }

      if (event.status !== 'draft') {
        return errorResponse(
          422,
          'INVALID_TRANSITION',
          'Hanya draft yang dapat dihapus.',
        )
      }

      events.splice(events.indexOf(event), 1)
      delete eventFormFields[event.id]

      return successResponse(
        null,
        'Draft event berhasil dihapus',
      )
    },
  ),

  // ===========================================================================
  // ORGANIZER: DYNAMIC FORM
  // ===========================================================================

  // PUT /organizer/events/:id/form-fields
  http.put(
    `${API_BASE_URL}/organizer/events/:id/form-fields`,
    async ({ request, params }) => {
      const { user, response } = authorize(request, ['panitia'])

      if (response) return response

      const event = getOwnedEvent(params.id, user.id)

      if (!event) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Event tidak ditemukan.',
        )
      }

      if (event.status !== 'draft') {
        return errorResponse(
          422,
          'EVENT_LOCKED',
          'Formulir terkunci setelah pembayaran dikirim.',
        )
      }

      const body = await request.json()
      const errors = validateFormFields(body.fields)

      if (Object.keys(errors).length) {
        return errorResponse(
          422,
          'VALIDATION_ERROR',
          'Validasi formulir gagal.',
          errors,
        )
      }

      const existingIds = Object.values(eventFormFields)
        .flat()
        .map((field) => field.id)

      let fieldId = Math.max(0, ...existingIds) + 1

      const fields = body.fields.map((field, index) => ({
        id: fieldId++,
        event_id: event.id,
        label: field.label.trim(),
        field_type: field.field_type,
        options:
          field.field_type === 'dropdown' ? field.options : null,
        is_required: field.is_required ?? true,
        sort_order: index + 1,
      }))

      eventFormFields[event.id] = fields
      event.updated_at = nowIso()

      return successResponse(
        fields,
        'Definisi formulir berhasil disimpan',
      )
    },
  ),

  // ===========================================================================
  // ORGANIZER: PAYMENT
  // ===========================================================================

  // POST /organizer/events/:id/payment
  http.post(
    `${API_BASE_URL}/organizer/events/:id/payment`,
    async ({ request, params }) => {
      const { user, response } = authorize(request, ['panitia'])

      if (response) return response

      const event = getOwnedEvent(params.id, user.id)

      if (!event) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Event tidak ditemukan.',
        )
      }

      if (event.status !== 'draft') {
        return errorResponse(
          422,
          'INVALID_TRANSITION',
          'Event bukan berstatus draft.',
        )
      }

      if (
        !event.payment_deadline ||
        Date.now() > new Date(event.payment_deadline).getTime()
      ) {
        return errorResponse(
          422,
          'PAYMENT_EXPIRED',
          'Batas waktu pembayaran sudah lewat.',
        )
      }

      const body = await request.json()
      const errors = {}

      if (!body.reference_no?.trim()) {
        errors.reference_no = [
          'Nomor referensi pembayaran wajib diisi.',
        ]
      }

      if (
        payments.some(
          (payment) => payment.event_id === event.id,
        )
      ) {
        errors.event_id = [
          'Pembayaran untuk event ini sudah tercatat.',
        ]
      }

      if (Object.keys(errors).length) {
        return errorResponse(
          422,
          'VALIDATION_ERROR',
          'Validasi pembayaran gagal.',
          errors,
        )
      }

      const payment = {
        id: nextId(payments),
        event_id: event.id,
        user_id: user.id,
        amount: 50000,
        reference_no: body.reference_no.trim(),
        proof_url: body.proof_url || null,
        status: 'menunggu_verifikasi',
        paid_at: nowIso(),
        verified_by: null,
        verified_at: null,
      }

      payments.push(payment)

      event.status = 'menunggu_review'
      event.payment_deadline = null
      event.updated_at = nowIso()

      return successResponse(
        { payment, event },
        'Pembayaran berhasil dikirim dan menunggu verifikasi.',
        { status: 201 },
      )
    },
  ),

  // ===========================================================================
  // ORGANIZER: REGISTRATIONS, CHECK-IN, REPORT
  // ===========================================================================

  // GET /organizer/events/:id/registrations
  http.get(
    `${API_BASE_URL}/organizer/events/:id/registrations`,
    ({ request, params }) => {
      const { user, response } = authorize(request, ['panitia'])

      if (response) return response

      const event = getOwnedEvent(params.id, user.id)

      if (!event) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Event tidak ditemukan.',
        )
      }

      const url = new URL(request.url)
      const search = url.searchParams.get('search')?.toLowerCase()
      const status = url.searchParams.get('status')

      let result = registrations
        .filter(
          (registration) => registration.event_id === event.id,
        )
        .map((registration) => ({
          ...registration,
          user: publicUser(
            users.find(
              (item) => item.id === registration.user_id,
            ),
          ),
          answers: registrationAnswers.filter(
            (answer) =>
              answer.registration_id === registration.id,
          ),
        }))

      if (search) {
        result = result.filter(
          (item) =>
            item.user?.name.toLowerCase().includes(search) ||
            item.user?.email.toLowerCase().includes(search),
        )
      }

      if (status) {
        result = result.filter(
          (item) => item.status === status,
        )
      }

      const resultPage = paginate(result, url)

      return successResponse(
        resultPage.data,
        'Data pendaftar berhasil diambil',
        { meta: resultPage.meta },
      )
    },
  ),

  // POST /organizer/check-in
  http.post(
    `${API_BASE_URL}/organizer/check-in`,
    async ({ request }) => {
      const { user, response } = authorize(request, ['panitia'])

      if (response) return response

      const body = await request.json()

      const registration = registrations.find(
        (item) => item.ticket_code === body.ticket_code,
      )

      if (!registration) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Kode tiket tidak ditemukan.',
        )
      }

      const event = getOwnedEvent(
        registration.event_id,
        user.id,
      )

      if (!event) {
        return errorResponse(
          403,
          'FORBIDDEN',
          'Anda bukan pemilik event ini.',
        )
      }

      const checkInStart =
        new Date(event.start_time).getTime() -
        2 * 60 * 60 * 1000

      const checkInEnd = new Date(event.end_time).getTime()

      if (
        event.status !== 'tayang' ||
        Date.now() < checkInStart ||
        Date.now() > checkInEnd ||
        registration.status !== 'registered'
      ) {
        return errorResponse(
          422,
          'CHECKIN_NOT_ALLOWED',
          'Check-in tidak memenuhi syarat waktu atau status.',
        )
      }

      registration.status = 'attended'
      registration.checked_in_at = nowIso()
      registration.checked_in_by = user.id

      return successResponse(
        registration,
        'Check-in berhasil',
      )
    },
  ),

  // GET /organizer/events/:id/report
  http.get(
    `${API_BASE_URL}/organizer/events/:id/report`,
    ({ request, params }) => {
      const { user, response } = authorize(request, ['panitia'])

      if (response) return response

      const event = getOwnedEvent(params.id, user.id)

      if (!event) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Event tidak ditemukan.',
        )
      }

      const eventRegistrations = registrations.filter(
        (item) => item.event_id === event.id,
      )

      const attended = eventRegistrations.filter(
        (item) => item.status === 'attended',
      ).length

      return successResponse(
        {
          event_id: event.id,
          title: event.title,
          quota: event.quota,
          remaining_quota: event.remaining_quota,
          total_registered: eventRegistrations.length,
          total_attended: attended,
          attendance_percentage: eventRegistrations.length
            ? Number(
                (
                  (attended / eventRegistrations.length) *
                  100
                ).toFixed(2),
              )
            : 0,
        },
        'Laporan event berhasil diambil',
      )
    },
  ),

  // GET /organizer/events/:id/export
  // Mock mengembalikan data JSON, bukan file XLSX asli.
  http.get(
    `${API_BASE_URL}/organizer/events/:id/export`,
    ({ request, params }) => {
      const { user, response } = authorize(request, ['panitia'])

      if (response) return response

      const event = getOwnedEvent(params.id, user.id)

      if (!event) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Event tidak ditemukan.',
        )
      }

      const data = registrations
        .filter((item) => item.event_id === event.id)
        .map((registration) => ({
          ...registration,
          user: publicUser(
            users.find(
              (item) => item.id === registration.user_id,
            ),
          ),
          answers: registrationAnswers.filter(
            (answer) =>
              answer.registration_id === registration.id,
          ),
        }))

      return successResponse(
        {
          mock_export: true,
          format: 'xlsx',
          rows: data,
        },
        'Data mock ekspor berhasil disiapkan; file XLSX asli tersedia dari backend.',
      )
    },
  ),

  // ===========================================================================
  // NOTIFICATIONS
  // ===========================================================================

  // GET /notifications
  http.get(`${API_BASE_URL}/notifications`, ({ request }) => {
    const { user, response } = authorize(request, [
      'peserta',
      'panitia',
      'developer',
    ])

    if (response) return response

    const url = new URL(request.url)

    const result = notifications
      .filter((item) => item.user_id === user.id)
      .sort((a, b) => b.id - a.id)

    const resultPage = paginate(result, url)

    return successResponse(
      resultPage.data,
      'Notifikasi berhasil diambil',
      { meta: resultPage.meta },
    )
  }),

  // PATCH /notifications/:id/read
  http.patch(
    `${API_BASE_URL}/notifications/:id/read`,
    ({ request, params }) => {
      const { user, response } = authorize(request, [
        'peserta',
        'panitia',
        'developer',
      ])

      if (response) return response

      const notification = notifications.find(
        (item) =>
          item.id === Number(params.id) &&
          item.user_id === user.id,
      )

      if (!notification) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Notifikasi tidak ditemukan.',
        )
      }

      notification.read_at = nowIso()

      return successResponse(
        notification,
        'Notifikasi ditandai sudah dibaca',
      )
    },
  ),

  // ===========================================================================
  // DEVELOPER: REVIEW QUEUE
  // ===========================================================================

  // GET /admin/events
  http.get(`${API_BASE_URL}/admin/events`, ({ request }) => {
    const { response } = authorize(request, ['developer'])

    if (response) return response

    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const status = url.searchParams.get('status')

    let result = [...events]

    if (status) {
      result = result.filter(
        (event) => event.status === status,
      )
    }

    if (search) {
      result = result.filter((event) =>
        event.title.toLowerCase().includes(search),
      )
    }

    result.sort(
      (a, b) =>
        new Date(a.created_at) - new Date(b.created_at),
    )

    const resultPage = paginate(
      result.map(eventWithRelations),
      url,
    )

    return successResponse(
      resultPage.data,
      'Daftar event Developer berhasil diambil',
      { meta: resultPage.meta },
    )
  }),

  // GET /admin/events/:id
  http.get(
    `${API_BASE_URL}/admin/events/:id`,
    ({ request, params }) => {
      const { response } = authorize(request, ['developer'])

      if (response) return response

      const event = events.find(
        (item) => item.id === Number(params.id),
      )

      if (!event) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Event tidak ditemukan.',
        )
      }

      return successResponse(
        {
          ...eventWithRelations(event),
          organizer: publicUser(
            users.find(
              (item) => item.id === event.created_by,
            ),
          ),
        },
        'Detail event untuk review berhasil diambil',
      )
    },
  ),

  // POST /admin/events/:id/approve
  http.post(
    `${API_BASE_URL}/admin/events/:id/approve`,
    ({ request, params }) => {
      const { user, response } = authorize(request, ['developer'])

      if (response) return response

      const event = events.find(
        (item) => item.id === Number(params.id),
      )

      if (!event) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Event tidak ditemukan.',
        )
      }

      if (event.status !== 'menunggu_review') {
        return errorResponse(
          422,
          'INVALID_TRANSITION',
          'Hanya event yang menunggu review yang dapat ditayangkan.',
        )
      }

      const payment = payments.find(
        (item) => item.event_id === event.id,
      )

      if (payment) {
        payment.status = 'terverifikasi'
        payment.verified_by = user.id
        payment.verified_at = nowIso()
      }

      event.status = 'tayang'
      event.reviewed_by = user.id
      event.reviewed_at = nowIso()
      event.published_at = nowIso()
      event.updated_at = nowIso()

      notifications.push({
        id: nextId(notifications),
        user_id: event.created_by,
        event_id: event.id,
        type: 'event_tayang',
        message: `Event "${event.title}" berhasil ditayangkan.`,
        read_at: null,
        created_at: nowIso(),
      })

      return successResponse(
        eventWithRelations(event),
        'Event berhasil ditayangkan',
      )
    },
  ),

  // POST /admin/events/:id/reject
  http.post(
    `${API_BASE_URL}/admin/events/:id/reject`,
    async ({ request, params }) => {
      const { user, response } = authorize(request, ['developer'])

      if (response) return response

      const event = events.find(
        (item) => item.id === Number(params.id),
      )

      if (!event) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Event tidak ditemukan.',
        )
      }

      if (event.status !== 'menunggu_review') {
        return errorResponse(
          422,
          'INVALID_TRANSITION',
          'Hanya event yang menunggu review yang dapat ditolak.',
        )
      }

      const body = await request.json()
      const reason = body.reason?.trim() ?? ''

      if (reason.length < 10) {
        return errorResponse(
          422,
          'VALIDATION_ERROR',
          'Alasan penolakan minimal 10 karakter.',
          {
            reason: [
              'Alasan penolakan minimal 10 karakter.',
            ],
          },
        )
      }

      const payment = payments.find(
        (item) => item.event_id === event.id,
      )

      if (payment) {
        payment.status = 'dikembalikan'
        payment.verified_by = user.id
        payment.verified_at = nowIso()
      }

      event.status = 'ditolak'
      event.reject_reason = reason
      event.reviewed_by = user.id
      event.reviewed_at = nowIso()
      event.updated_at = nowIso()

      notifications.push({
        id: nextId(notifications),
        user_id: event.created_by,
        event_id: event.id,
        type: 'event_ditolak',
        message: `Event "${event.title}" ditolak. Alasan: ${reason}`,
        read_at: null,
        created_at: nowIso(),
      })

      return successResponse(
        eventWithRelations(event),
        'Event berhasil ditolak dan pembayaran dicatat dikembalikan',
      )
    },
  ),

  // ===========================================================================
  // DEVELOPER: PAYMENTS AND DASHBOARD
  // ===========================================================================

  // GET /admin/payments
  http.get(`${API_BASE_URL}/admin/payments`, ({ request }) => {
    const { response } = authorize(request, ['developer'])

    if (response) return response

    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    let result = payments.map((payment) => ({
      ...payment,
      event:
        events.find(
          (event) => event.id === payment.event_id,
        ) ?? null,
      user: publicUser(
        users.find((user) => user.id === payment.user_id),
      ),
    }))

    if (status) {
      result = result.filter(
        (payment) => payment.status === status,
      )
    }

    const resultPage = paginate(result, url)

    return successResponse(
      resultPage.data,
      'Daftar pembayaran berhasil diambil',
      { meta: resultPage.meta },
    )
  }),

  // GET /admin/dashboard
  http.get(`${API_BASE_URL}/admin/dashboard`, ({ request }) => {
    const { response } = authorize(request, ['developer'])

    if (response) return response

    const countByStatus = (status) =>
      events.filter((event) => event.status === status).length

    return successResponse(
      {
        total_events: events.length,
        draft: countByStatus('draft'),
        menunggu_review: countByStatus('menunggu_review'),
        ditolak: countByStatus('ditolak'),
        tayang: countByStatus('tayang'),
        total_payments: payments.length,
        payments_pending: payments.filter(
          (payment) => payment.status === 'menunggu_verifikasi',
        ).length,
        payments_verified: payments.filter(
          (payment) => payment.status === 'terverifikasi',
        ).length,
        payments_refunded: payments.filter(
          (payment) => payment.status === 'dikembalikan',
        ).length,
        verified_amount: payments
          .filter((payment) => payment.status === 'terverifikasi')
          .reduce(
            (sum, payment) => sum + payment.amount,
            0,
          ),
      },
      'Dashboard Developer berhasil diambil',
    )
  }),

  // ===========================================================================
  // DEVELOPER: CATEGORY CRUD (FITUR COULD)
  // ===========================================================================

  // GET /admin/categories
  http.get(`${API_BASE_URL}/admin/categories`, ({ request }) => {
    const { response } = authorize(request, ['developer'])

    if (response) return response

    return successResponse(
      categories,
      'Daftar kategori berhasil diambil',
    )
  }),

  // POST /admin/categories
  http.post(
    `${API_BASE_URL}/admin/categories`,
    async ({ request }) => {
      const { response } = authorize(request, ['developer'])

      if (response) return response

      const body = await request.json()
      const name = body.name?.trim()

      if (!name) {
        return errorResponse(
          422,
          'VALIDATION_ERROR',
          'Nama kategori wajib diisi.',
          {
            name: ['Nama kategori wajib diisi.'],
          },
        )
      }

      if (
        categories.some(
          (category) =>
            category.name.toLowerCase() === name.toLowerCase(),
        )
      ) {
        return errorResponse(
          422,
          'VALIDATION_ERROR',
          'Nama kategori sudah digunakan.',
          {
            name: ['Nama kategori sudah digunakan.'],
          },
        )
      }

      const category = {
        id: nextId(categories),
        name,
        description: body.description || null,
      }

      categories.push(category)

      return successResponse(
        category,
        'Kategori berhasil dibuat',
        { status: 201 },
      )
    },
  ),

  // PUT /admin/categories/:id
  http.put(
    `${API_BASE_URL}/admin/categories/:id`,
    async ({ request, params }) => {
      const { response } = authorize(request, ['developer'])

      if (response) return response

      const category = categories.find(
        (item) => item.id === Number(params.id),
      )

      if (!category) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Kategori tidak ditemukan.',
        )
      }

      const body = await request.json()

      if (body.name !== undefined) {
        const name = body.name.trim()

        if (!name) {
          return errorResponse(
            422,
            'VALIDATION_ERROR',
            'Nama kategori wajib diisi.',
            {
              name: ['Nama kategori wajib diisi.'],
            },
          )
        }

        if (
          categories.some(
            (item) =>
              item.id !== category.id &&
              item.name.toLowerCase() === name.toLowerCase(),
          )
        ) {
          return errorResponse(
            422,
            'VALIDATION_ERROR',
            'Nama kategori sudah digunakan.',
            {
              name: ['Nama kategori sudah digunakan.'],
            },
          )
        }

        category.name = name
      }

      if (body.description !== undefined) {
        category.description = body.description
      }

      return successResponse(
        category,
        'Kategori berhasil diperbarui',
      )
    },
  ),

  // DELETE /admin/categories/:id
  http.delete(
    `${API_BASE_URL}/admin/categories/:id`,
    ({ request, params }) => {
      const { response } = authorize(request, ['developer'])

      if (response) return response

      const category = categories.find(
        (item) => item.id === Number(params.id),
      )

      if (!category) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Kategori tidak ditemukan.',
        )
      }

      if (
        events.some(
          (event) => event.category_id === category.id,
        )
      ) {
        return errorResponse(
          422,
          'INVALID_TRANSITION',
          'Kategori tidak dapat dihapus karena masih digunakan oleh event.',
        )
      }

      categories.splice(categories.indexOf(category), 1)

      return successResponse(
        null,
        'Kategori berhasil dihapus',
      )
    },
  ),

  // ===========================================================================
  // INTERNAL: PURGE EXPIRED DRAFTS (BR-09, K-04, Bab 8.2)
  // ===========================================================================

  // POST /internal/purge-expired-drafts
  http.post(
    `${API_BASE_URL}/internal/purge-expired-drafts`,
    async ({ request }) => {
      const secret = request.headers.get('X-Internal-Secret')
      const expectedSecret =
        import.meta.env.VITE_INTERNAL_PURGE_SECRET || 'eventhub-purge-secret'

      if (secret !== expectedSecret) {
        return errorResponse(
          401,
          'UNAUTHENTICATED',
          'Akses internal ditolak: Secret header tidak valid.',
        )
      }

      const now = Date.now()
      const expiredDrafts = events.filter(
        (event) =>
          event.status === 'draft' &&
          event.payment_deadline &&
          new Date(event.payment_deadline).getTime() < now,
      )

      const purgedCount = expiredDrafts.length

      for (const draft of expiredDrafts) {
        delete eventFormFields[draft.id]
        const index = events.indexOf(draft)
        if (index !== -1) {
          events.splice(index, 1)
        }
      }

      return successResponse(
        {
          purged_count: purgedCount,
        },
        'Purge draft kedaluwarsa selesai',
      )
    },
  ),
]
