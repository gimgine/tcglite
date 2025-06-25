<template>
  <Toast />
  <div class="fixed top-0 left-0 z-10 flex h-16 w-full items-center bg-white px-4">
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
  <div class="min-h-screen px-4 pt-20 pb-6 lg:px-20 lg:pt-24 lg:pb-16">
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
}
</style>
