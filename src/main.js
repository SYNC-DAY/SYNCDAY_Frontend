import { createApp } from "vue";
import { useAuthStore } from "./stores/auth";
import App from "./App.vue";

/* pinia */
import { createPinia } from "pinia";

/* pinia-persisted-state */
import { createPersistedState } from "pinia-plugin-persistedstate";

/* router */
import { setupRouter } from "./router"; // 이름 변경

/* axios */
import { setupAxiosInterceptors } from "../src/plugins/axios.js";

/* primevue */
import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";
import PrimeVue from "primevue/config";
import { ConfirmationService } from "primevue";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";
import "primeicons/primeicons.css";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import Dialog from "primevue/dialog";
import Card from "primevue/card";
import ProgressBar from "primevue/progressbar";
import Avatar from "primevue/avatar";
import InputText from "primevue/inputtext";
import Tooltip from 'primevue/tooltip';
import Listbox from "primevue/listbox";
import Select from "primevue/select";

import Checkbox from "primevue/checkbox";

import Menu from "primevue/menu";
import MultiSelect from "primevue/multiselect";
/* css */
import "@/assets/styles/syncday/main.css";

/* authStore */

const app = createApp(App);

/* pinia */
const pinia = createPinia();
const pinia_persisted_state = createPersistedState({
  storage: sessionStorage,
});
pinia.use(pinia_persisted_state);
app.use(pinia);
const authStore = useAuthStore();
await authStore.initializeAuth(); // 초기 인증 상태 설정

/* axios */
setupAxiosInterceptors();

/* router */
const router = await setupRouter();
app.use(router);

/* prime vue */
// const SyncDayPreset = definePreset(Aura, {
//   semantic: {
//     primary: {
//       50: "{pink.50}",
//       100: "{pink.100}",
//       200: "{pink.200}",
//       300: "{pink.300}",
//       400: "{pink.400}",
//       500: "{pink.500}",
//       600: "{pink.600}",
//       700: "{pink.700}",
//       800: "{pink.800}",
//       900: "{pink.900}",
//       950: "{pink.950}",
//     },
//   },
// });

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
app.component("Accordion", Accordion);
app.component("AccordionTab", AccordionTab);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("Button", Button);
app.component("Tag", Tag);
app.component("ProgressSpinner", ProgressSpinner);
app.component("Message", Message);
app.use(ConfirmationService);
app.use(ToastService);
app.directive('tooltip', Tooltip);

app.component("Toast", Toast);
app.component("Dialog", Dialog);
app.component("Card", Card);
app.component("ProgressBar", ProgressBar);
app.component("Avatar", Avatar);
app.component("InputText", InputText);
app.component("Menu", Menu);
app.component("Listbox", Listbox);
app.component("Checkbox", Checkbox);
app.component("MultiSelect", MultiSelect);
app.component("Select", Select);
/* mount */
app.mount("#app");