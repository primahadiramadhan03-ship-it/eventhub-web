import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Membuat service worker untuk mock API EventHub
export const worker = setupWorker(...handlers)
