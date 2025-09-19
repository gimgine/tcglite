<template>
  <Toast />

  <div class="bg-surface-100 dark:bg-surface-950 flex h-svh gap-4 p-4">
    <div
      class="dark:bg-surface-900 dark:border-surface-700 flex flex-col items-center gap-4 rounded-md border border-gray-200 bg-white p-1 pb-4 shadow"
    >
      <img :src="tcgliteLogo" class="mx-1 mt-2 h-auto w-14" />

      <Button
        v-for="item in items"
        :key="item.label"
        v-tooltip="item.label"
        :icon="item.icon"
        :variant="route.matched[0]?.name === item.routeName ? 'outlined' : 'text'"
        @click="$router.push({ name: item.routeName })"
      />

      <Button
        v-tooltip="'Settings'"
        class="mt-auto"
        icon="pi pi-cog"
        :variant="route.matched[0]?.name === 'settings' ? 'outlined' : 'text'"
        severity="secondary"
        @click="$router.push({ name: 'settings' })"
      />
      <Button v-tooltip="'Support development'" icon="pi pi-heart" severity="danger" text rounded @click="openSupportPage" />
    </div>

    <div class="flex flex-1 flex-col">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import tcgliteLogo from '@/assets/tcglitelogo-test-yellow-blue.svg';
import { Button, Toast } from 'primevue';
import { onMounted, ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useOrderStore } from './store/order-store';
import { usePreferencesStore } from './store/store-preferences-store';

const route = useRoute();

const orderStore = useOrderStore();
const preferencesStore = usePreferencesStore();

const isDev = import.meta.env.DEV;

const items = ref([
  { label: 'Orders', icon: 'pi pi-receipt', routeName: 'home' },
  { label: 'Expenses', icon: 'pi pi-credit-card', routeName: 'expenses' },
  { label: 'Stats', icon: 'pi pi-chart-line', routeName: 'stats' },
  { label: 'Order Helper', icon: 'pi pi-box', routeName: 'orderHelper' },
  { label: 'Pricing', icon: 'pi pi-dollar', routeName: 'pricing' }
]);

const openSupportPage = () => {
  window.open('https://buymeacoffee.com/gimgine', '_blank');
};

onMounted(() => {
  orderStore.refresh();
  preferencesStore.refresh();
  if (isDev) document.title = 'DEV - TCGlite';
});
</script>
