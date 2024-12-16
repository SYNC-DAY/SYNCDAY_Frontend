import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

const SyncDayPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#fff1f4', // 더 밝은 색조들
            100: '#ffe4ea',
            200: '#ffc8d6',
            300: '#ff9db5',
            400: '#fe7a94',
            500: '#FE5D86', // 기본 primary 색상
            600: '#e54d77', // 더 어두운 색조들
            700: '#bf3c60',
            800: '#9c314d',
            900: '#802b42',
            950: '#4c1525'
        }
        // secondary: {}
    }
});

export default function installPrimeVue(app) {
    app.use(PrimeVue, {
        theme: {
            preset: SyncDayPreset,
            options: {
                prefix: 'p',
                darkModeSelector: '.app-dark'
            }
        }
    });
    app.use(ToastService);
    app.use(ConfirmationService);
}
