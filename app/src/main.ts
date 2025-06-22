import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { PrimeVue } from '@primevue/core';
import Aura from '@primeuix/themes/aura';
import App from './App.vue';
import router from './router';

import './tailwind.css';
import 'primeicons/primeicons.css';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(PrimeVue, { theme: { preset: Aura, options: { darkModeSelector: false } } });
app.mount('#app');
