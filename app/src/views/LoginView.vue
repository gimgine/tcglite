<template>
  <div class="flex h-full w-full flex-col items-center justify-center">
    <Card class="w-96">
      <template #title>
        <div class="my-2">Welcome</div>
      </template>
      <template #content>
        <Button label="Discord" icon="pi pi-discord" fluid @click="authenticate" />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { Collections } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { Button, Card } from 'primevue';

const authenticate = async () => {
  await pb.collection(Collections.Users).authWithOAuth2({ provider: 'discord' });

  if (pb.authStore.isValid) {
    router.push({ name: 'home' });
    console.log(pb.authStore.record);
  }
};
</script>
