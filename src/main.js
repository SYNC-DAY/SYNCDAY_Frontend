// 핵심 Vue 관련 임포트
import { createApp } from "vue";
import App from "./App.vue";

// 상태 관리 (Pinia) 관련 임포트
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";
import { useAuthStore } from "./stores/auth";

// 라우터 및 HTTP 클라이언트 임포트
import { setupRouter } from "./router";
import { setupAxiosInterceptors } from "../src/plugins/axios.js";

// PrimeVue 핵심 모듈 임포트
import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";
import PrimeVue from "primevue/config";
import { ConfirmationService } from "primevue";
import ToastService from "primevue/toastservice";
import "primeicons/primeicons.css";

// PrimeVue 컴포넌트 임포트
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Listbox from "primevue/listbox";
import Menu from "primevue/menu";
import Message from "primevue/message";
import MultiSelect from "primevue/multiselect";
import ProgressBar from "primevue/progressbar";
import ProgressSpinner from "primevue/progressspinner";
import Select from "primevue/select";
import Tag from "primevue/tag";
import Toast from "primevue/toast";
import Tooltip from 'primevue/tooltip';

// 스타일 임포트
import "@/assets/styles/syncday/main.css";

// Teal 테마 프리셋 설정
const SyncDayPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{teal.50}",
      100: "{teal.100}",
      200: "{teal.200}",
      300: "{teal.300}",
      400: "{teal.400}",
      500: "{teal.500}",
      600: "{teal.600}",
      700: "{teal.700}",
      800: "{teal.800}",
      900: "{teal.900}",
      950: "{teal.950}",
    },
  },
});

async function initializeApp() {
  const app = createApp(App);

  // Pinia 상태 관리 설정
  const pinia = createPinia();
  const pinia_persisted_state = createPersistedState({
    storage: sessionStorage,
  });
  pinia.use(pinia_persisted_state);
  app.use(pinia);

  // 인증 상태 초기화
  const authStore = useAuthStore();
  await authStore.initializeAuth();

  // Axios 인터셉터 설정
  setupAxiosInterceptors();

  // 라우터 설정
  const router = await setupRouter();
  app.use(router);

  // PrimeVue 설정
  app.use(PrimeVue, {
    theme: {
      preset: SyncDayPreset,
      options: {
        prefix: "p",
        darkModeSelector: ".fake-dark-selector",
        cssLayer: false,
      },
    },
  });

  // PrimeVue 서비스 설정
  app.use(ConfirmationService);
  app.use(ToastService);

  // PrimeVue 디렉티브 등록
  app.directive('tooltip', Tooltip);

  // PrimeVue 컴포넌트 전역 등록
  const components = {
    Accordion, AccordionTab, Avatar, Button, Card,
    Checkbox, Column, DataTable, Dialog, InputText,
    Listbox, Menu, Message, MultiSelect, ProgressBar,
    ProgressSpinner, Select, Tag, Toast
  };

  Object.entries(components).forEach(([name, component]) => {
    app.component(name, component);
  });

  // 앱 마운트
  app.mount("#app");
}

// 앱 초기화 실행
initializeApp();