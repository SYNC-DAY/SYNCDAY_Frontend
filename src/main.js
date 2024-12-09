import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';
import '@/assets/syncday/main.css';
import '@/assets/tailwind.css';
const app = createApp(App);

app.use(router);

const SyncDayPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{purple.50}',
            100: '{purple.100}',
            200: '{purple.200}',
            300: '{purple.300}',
            400: '{purple.400}',
            500: '{purple.500}',
            600: '{purple.600}',
            700: '{purple.700}',
            800: '{purple.800}',
            900: '{purple.900}',
            950: '{purple.950}'
        }
    }
});
app.use(PrimeVue, {
    theme: {
        preset: SyncDayPreset,
        options: {
            prefix: 'p',
            darkModeSelector: 'system'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');
