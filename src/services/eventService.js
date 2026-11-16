import api from './api'

export const eventService = {
  /**
   * Mengambil daftar event publik yang sedang tayang (dengan filter & pagination)
   * @param {Object} params - { search, category_id, availability, date_from, date_to, page, per_page }
   */
  async getEvents(params = {}) {
    const response = await api.get('/events', { params })
    return response.data
  },

  /**
   * Mengambil detail event publik berdasarkan ID (termasuk relasi kategori & form_fields dinamis)
   * @param {number|string} id
   */
  async getEventDetail(id) {
    const response = await api.get(`/events/${id}`)
    return response.data
  },

  /**
   * Mendaftarkan peserta ke event (mengirim jawaban formulir dinamis)
   * @param {number|string} eventId
   * @param {Object} payload - { answers: [{ field_id, value }] }
   */
  async registerEvent(eventId, payload) {
    const response = await api.post(`/events/${eventId}/register`, payload)
    return response.data
  },

  /**
   * Mengambil daftar tiket / riwayat pendaftaran milik akun peserta yang login
   * @param {Object} params - { search, status, page, per_page }
   */
  async getMyRegistrations(params = {}) {
    const response = await api.get('/me/registrations', { params })
    return response.data
  },

  /**
   * Mengambil detail tiket digital spesifik (termasuk jawaban formulir & status check-in)
   * @param {number|string} id
   */
  async getRegistrationDetail(id) {
    const response = await api.get(`/me/registrations/${id}`)
    return response.data
  },

  /**
   * Mengambil daftar event milik panitia yang sedang login
   * @param {Object} params - { search, status, category_id, page, per_page }
   */
  async getOrganizerEvents(params = {}) {
    const response = await api.get('/organizer/events', { params })
    return response.data
  },

  /**
   * Membuat event baru beserta field formulir dinamisnya (Panitia)
   * @param {Object} payload - { title, category_id, description, location, quota, start_date, end_date, banner_url, form_fields }
   */
  async createOrganizerEvent(payload) {
    const response = await api.post('/organizer/events', payload)
    return response.data
  },

  /**
   * Memperbarui event dan formulir dinamisnya (Panitia)
   * @param {number|string} id
   * @param {Object} payload
   */
  async updateOrganizerEvent(id, payload) {
    const response = await api.put(`/organizer/events/${id}`, payload)
    return response.data
  },

  /**
   * Mengambil detail event spesifik milik panitia untuk diedit
   * @param {number|string} id
   */
  async getOrganizerEventDetail(id) {
    const response = await api.get(`/organizer/events/${id}`)
    return response.data
  },

  /**
   * Menghapus event draft (Panitia)
   * @param {number|string} id
   */
  async deleteOrganizerEvent(id) {
    const response = await api.delete(`/organizer/events/${id}`)
    return response.data
  },
}

