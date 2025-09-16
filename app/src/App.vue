<template>
  <Toast />

  <div class="bg-surface-100 dark:bg-surface-950 flex h-svh gap-4 p-4">
    <div class="dark:bg-surface-900 dark:border-surface-700 flex flex-col items-center gap-4 rounded-md border border-gray-200 bg-white p-1 shadow">
      <span class="font-fredoka px-1 pt-3 pb-1 text-xl text-sky-600">TCGlite</span>

      <Button
        v-for="item in items"
        :key="item.label"
        v-tooltip="item.label"
        :icon="item.icon"
        :variant="route.matched[0]?.name === item.routeName ? 'outlined' : 'text'"
        @click="$router.push({ name: item.routeName })"
      />

      <div class="relative mt-auto px-4 py-4">
        <a class="transition-opacity hover:opacity-50" :href="pbUrl" target="_blank">
          <img :src="pbLogo" />
        </a>
      </div>
    </div>

    <div class="flex flex-1 flex-col">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import pbLogo from '@/assets/pb_logo.svg';
import { Button, Toast } from 'primevue';
import { onMounted, ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useOrderStore } from './store/order-store';

const route = useRoute();

const orderStore = useOrderStore();

const items = ref([
  { label: 'Orders', icon: 'pi pi-receipt', routeName: 'home' },
  { label: 'Expenses', icon: 'pi pi-credit-card', routeName: 'expenses' },
  { label: 'Stats', icon: 'pi pi-chart-line', routeName: 'stats' },
  { label: 'Order Helper', icon: 'pi pi-box', routeName: 'orderHelper' },
  { label: 'Pricing', icon: 'pi pi-dollar', routeName: 'pricing' }
]);

const pbUrl = import.meta.env.DEV ? 'http://localhost:8090/_/' : 'https://tcglite.pockethost.io/_/';

onMounted(() => {});

onMounted(() => {
  orderStore.refresh();
  if (import.meta.env.DEV) document.title = 'DEV - TCGlite';
});
</script>
