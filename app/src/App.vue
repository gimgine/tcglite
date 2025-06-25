<template>
  <Toast />
  <div class="fixed top-0 left-0 z-10 flex h-16 w-full items-center bg-white px-4">
    <span class="text-xl">Gimgine Trading Post</span>
  </div>
  <div class="min-h-screen px-4 pt-20 pb-6 lg:px-20 lg:pt-24 lg:pb-16">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { Toast } from 'primevue';
import { RouterView } from 'vue-router';
</script>

<style>
body {
  background-color: var(--p-surface-100);
}
</style>
