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
import ConfirmationService from "primevue/confirmationservice";
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
import Listbox from "primevue/listbox";
import Checkbox from "primevue/checkbox";
import RadioButton from "primevue/radiobutton";
import Menu from "primevue/menu";
import MultiSelect from "primevue/multiselect";
import ConfirmDialog from "primevue/confirmdialog";

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
const SyncDayPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{orange.50}",
      100: "{orange.100}",
      200: "{orange.200}",
      300: "{orange.300}",
      400: "{orange.400}",
      500: "{orange.500}",
      600: "{orange.600}",
      700: "{orange.700}",
      800: "{orange.800}",
      900: "{orange.900}",
      950: "{orange.950}",
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
app.component("RadioButton", RadioButton);
app.component("ConfirmDialog", ConfirmDialog);
/* mount */
app.mount("#app");
