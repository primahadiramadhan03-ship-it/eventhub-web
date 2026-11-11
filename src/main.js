import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './style.css'

import App from './App.vue'
import router from './router'

async function startApp() {
  // Aktifkan MSW hanya ketika development dan mock API diaktifkan
  if (
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_MOCK_API === 'true'
  ) {
    const { worker } = await import('./mocks/browser')

    await worker.start({
      onUnhandledRequest: 'bypass',
    })

    console.info('[MSW] Mock API EventHub aktif')
  }

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
}

startApp()
