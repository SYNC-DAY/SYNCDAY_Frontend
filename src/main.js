import { createApp } from 'vue';
import App from './App.vue';
import installPrimeVue from './plugins/primevue';
import router from './router';

/* styles */
import '@/assets/styles.scss';
import '@/assets/syncday/main.css';
import '@/assets/tailwind.css';

const app = createApp(App);

app.use(router);
installPrimeVue(app);

app.mount('#app');
