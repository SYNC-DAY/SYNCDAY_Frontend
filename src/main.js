import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';
import '@/assets/tailwind.css';

const app = createApp(App);

/* router */
app.use(router);

/* prime vue */
const SyncDayPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{pink.50}',
            100: '{pink.100}',
            200: '{pink.200}',
            300: '{pink.300}',
            400: '{pink.400}',
            500: '{pink.500}',
            600: '{pink.600}',
            700: '{pink.700}',
            800: '{pink.800}',
            900: '{pink.900}',
            950: '{pink.950}'
        }
    }
});
app.use(PrimeVue, {
    theme: {
        preset: SyncDayPreset
    }
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');
