// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupAxiosInterceptors } from '../src/plugins/axios.js'
// import '@/assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// axios 인터셉터 설정 적용
setupAxiosInterceptors()

app.mount('#app')