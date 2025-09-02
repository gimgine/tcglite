<template>
  <Toast />

  <div class="bg-surface-100 dark:bg-surface-950 flex h-svh gap-4 p-4">
    <Menu :model="items" class="flex w-full flex-col justify-between shadow md:w-60" pt:list:class="flex-1 overflow-y-auto">
      <template #start>
        <div class="px-4 pt-3 pb-2">
          <span class="font-fredoka text-3xl text-sky-600">TCGlite</span>
        </div>
      </template>

      <template #item="{ item, props }">
        <router-link
          v-if="item.routeName"
          :to="{ name: item.routeName }"
          :class="['transition-colors', route.matched[0]?.name === item.routeName ? 'text-[var(--p-primary-500)]' : '']"
        >
          <a v-bind="props.action">
            <i :class="item.icon" />
            <span>{{ item.label }}</span>
          </a>
        </router-link>
      </template>

      <template #end>
        <div
          class="relative flex items-center justify-between px-4 py-4 before:absolute before:top-0 before:right-0 before:left-0 before:mx-1 before:block before:h-px before:bg-[var(--p-menu-separator-border-color)] before:content-['']"
        >
          <Button
            v-show="pb.authStore.isValid"
            variant="text"
            severity="secondary"
            icon="pi pi-sign-out"
            label="Log out"
            @click="pb.authStore.clear()"
          />
          <Button v-show="!pb.authStore.isValid" variant="text" icon="pi pi-sign-in" label="Log in" @click="router.push({ name: 'login' })" />
          <a class="transition-opacity hover:opacity-50" :href="pbUrl" target="_blank">
            <img :src="pbLogo" />
          </a>
        </div>
      </template>
    </Menu>

    <div class="flex flex-1 flex-col">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import pbLogo from '@/assets/pb_logo.svg';
import { Toast, Menu, Button } from 'primevue';
import { onMounted, ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useOrderStore } from './store/order-store';
import pb from './util/pocketbase';
import router from './router';

const route = useRoute();

const orderStore = useOrderStore();

const items = ref([
  { separator: true },
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

  if (!pb.authStore.isValid) {
    router.push({ name: 'login' });
  }
});
</script>
