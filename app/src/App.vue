<template>
  <div class="fixed left-0 top-0 h-16 bg-white w-full flex items-center px-4">
    <span class="text-xl">Gimgine Trading Post</span>
  </div>
  <div class="pt-24 px-20 min-h-screen">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style>
body {
  background-color: var(--p-surface-100);
}
</style>
