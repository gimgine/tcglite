<template>
  <div class="flex h-full w-full flex-col items-center justify-center">
    <Panel class="w-96">
      <template #header
        ><div class="font-fredoka flex w-full items-center justify-center gap-2 text-3xl">
          <img :src="tcgliteLogo" class="h-auto w-12" />TCGlite
        </div></template
      >
      <div class="mb-4 text-center text-lg">Login Using</div>
      <Button label="Discord" icon="pi pi-discord" fluid @click="authenticate" />
    </Panel>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { Collections } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { Button, Panel } from 'primevue';
import tcgliteLogo from '@/assets/tcglitelogo-test-yellow-blue.svg';
import { useOrderStore } from '@/store/order-store';

const authenticate = async () => {
  await pb.collection(Collections.Users).authWithOAuth2({ provider: 'discord' });

  if (pb.authStore.isValid) {
    router.push({ name: 'home' });
    useOrderStore().refresh();
  }
};
</script>
