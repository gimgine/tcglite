<template>
  <Toast />
  <div class="sticky top-0 left-0 z-10 flex h-16 w-full items-center bg-white px-4">
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
          route.name === 'orderHelper' ? 'font-semibold text-purple-500' : 'text-gray-500 hover:text-gray-900'
        ]"
        :to="{ name: 'orderHelper' }"
      >
        <i class="pi pi-box" />
        <span>Order Helper</span>
      </RouterLink>
    </div>
  </div>
  <div class="flex min-h-[calc(100vh-4rem)] flex-col px-4 lg:px-20 lg:py-10">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { Toast } from 'primevue';
import { RouterView, useRoute } from 'vue-router';

const route = useRoute();
</script>

<style>
body {
  background-color: var(--p-surface-100);
  height: 100%;
}
</style>
