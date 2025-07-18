<template>
  <Toast />
  <div class="sticky top-0 left-0 z-10 flex h-16 w-full items-center justify-between bg-white px-4">
    <div class="flex items-center">
      <span class="text-xl">Gimgine Trading Post</span>
      <div class="ml-8 flex h-full items-center gap-8">
        <RouterLink
          :class="[
            'flex h-full items-center gap-2 transition-colors',
            route.name === 'home' ? 'font-semibold text-purple-500' : 'text-gray-500 hover:text-gray-900'
          ]"
          :to="{ name: 'home' }"
        >
          <i class="pi pi-receipt" />
          <span>Orders</span>
        </RouterLink>
        <RouterLink
          :class="[
            'flex h-full items-center gap-2 transition-colors',
            route.name === 'expenses' ? 'font-semibold text-purple-500' : 'text-gray-500 hover:text-gray-900'
          ]"
          :to="{ name: 'expenses' }"
        >
          <i class="pi pi-credit-card" />
          <span>Expenses</span>
        </RouterLink>
        <RouterLink
          :class="[
            'flex h-full items-center gap-2 transition-colors',
            route.name === 'stats' ? 'font-semibold text-purple-500' : 'text-gray-500 hover:text-gray-900'
          ]"
          :to="{ name: 'stats' }"
        >
          <i class="pi pi-chart-line" />
          <span>Stats</span>
        </RouterLink>
        <RouterLink
          :class="[
            'flex h-full items-center gap-2 transition-colors',
            route.name === 'orderHelper' ? 'font-semibold text-purple-500' : 'text-gray-500 hover:text-gray-900'
          ]"
          :to="{ name: 'orderHelper' }"
        >
          <i class="pi pi-box" />
          <span>Order Helper</span>
        </RouterLink>
        <RouterLink
          :class="[
            'flex h-full items-center gap-2 transition-colors',
            route.name === 'pricing' ? 'font-semibold text-purple-500' : 'text-gray-500 hover:text-gray-900'
          ]"
          :to="{ name: 'pricing' }"
        >
          <i class="pi pi-dollar" />
          <span>Pricing</span>
        </RouterLink>
      </div>
    </div>
    <a class="transition-opacity hover:opacity-50" :href="pbUrl" target="_blank">
      <img :src="pbLogo" />
    </a>
  </div>
  <div class="flex min-h-[calc(100vh-4rem)] flex-col px-4 lg:px-20 lg:py-10">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import pbLogo from '@/assets/pb_logo.svg';
import { Toast } from 'primevue';
import { onMounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useOrderStore } from './store/order-store';

const route = useRoute();

const orderStore = useOrderStore();

const pbUrl = import.meta.env.DEV ? 'http://localhost:8090/_/' : 'https://gimgine-tcg.pockethost.io/_/';

onMounted(() => {});

onMounted(() => {
  orderStore.refresh();
  if (import.meta.env.DEV) document.title = 'DEV - Gimgine Trading Post';
});
</script>

<style>
body {
  background-color: var(--p-surface-100);
  height: 100%;
}
</style>
