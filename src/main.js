// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { setupRouter } from './router'  // 이름 변경
import { setupAxiosInterceptors } from '../src/plugins/axios.js'
import '@/assets/styles/main.css'

async function setupApp() {
    const app = createApp(App)
    const pinia = createPinia()

    // 1. Pinia 설정
    app.use(pinia)

    // 2. Axios 인터셉터 설정
    setupAxiosInterceptors()

    // 3. Router 설정 (비동기로 처리)
    const router = await setupRouter()
    app.use(router)

    // 4. 앱 마운트
    app.mount('#app')
}

setupApp()