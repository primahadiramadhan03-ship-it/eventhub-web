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
}

