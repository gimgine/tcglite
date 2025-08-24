import Aura from '@primeuix/themes/aura';
import { PrimeVue } from '@primevue/core';
import Tooltip from 'primevue/tooltip';
import { createPinia } from 'pinia';
import { ToastService } from 'primevue';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import 'primeicons/primeicons.css';
import './tailwind.css';

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(PrimeVue, { theme: { preset: Aura } });
app.directive('tooltip', Tooltip);
app.use(ToastService);
app.mount('#app');
