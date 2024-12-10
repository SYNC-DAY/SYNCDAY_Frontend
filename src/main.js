import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import installPrimeVue from './plugins/primevue';
import router from './router';
const pinia = createPinia();

/* styles */
import '@/assets/styles.scss';
import '@/assets/syncday/main.css';
import '@/assets/tailwind.css';

const app = createApp(App);

app.use(router);
app.use(pinia);
installPrimeVue(app);

app.mount('#app');
