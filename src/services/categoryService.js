import api from './api'

export const categoryService = {
    async getCategories() {
        const response = await api.get('/categories')
        return response.data
    },
    async checkHealth() {
        const response = await api.get('/health')
        return response.data
    },
}