<template>
  <div class="flex h-full w-full flex-col items-center justify-center">
    <Panel class="w-96">
      <template #header>
        <div class="font-fredoka flex w-full items-center justify-center gap-2 text-3xl"><img :src="tcgliteLogo" class="h-auto w-12" />TCGlite</div>
      </template>
      <Form ref="loginForm" class="flex flex-col gap-2" @submit="login">
        <div class="flex w-full flex-col gap-1">
          <label for="email" class="ml-3 text-sm">Email</label>
          <InputText name="email" fluid />
        </div>
        <div class="flex w-full flex-col gap-1">
          <label for="password" class="ml-3 text-sm">Password</label>
          <Password name="password" :feedback="false" fluid />
        </div>
        <Button type="submit" class="mt-2" label="Submit" />
        <Message v-show="showError" class="mt-2" severity="error" variant="simple">Email/password incorrect</Message>
      </Form>
    </Panel>
  </div>
</template>

<script setup lang="ts">
import tcgliteLogo from '@/assets/tcglitelogo-test-yellow-blue.svg';
import router from '@/router';
import { useOrderStore } from '@/store/order-store';
import { Collections } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { Form, type FormInstance, type FormSubmitEvent } from '@primevue/forms';
import { Button, InputText, Message, Panel, Password } from 'primevue';
import { onMounted, ref, useTemplateRef } from 'vue';

const loginForm = useTemplateRef<FormInstance>('loginForm');

const showError = ref(false);

const login = async (event: FormSubmitEvent) => {
  showError.value = false;

  if (event.valid) {
    pb.collection(Collections.Superusers)
      .authWithPassword(event.values.email, event.values.password)
      .then(() => {
        if (pb.authStore.isValid) {
          router.push({ name: 'home' });
          useOrderStore().refresh();
        }
      })
      .catch(() => {
        showError.value = true;
      });
  }
};

onMounted(() => {
  pb.authStore.clear();
});
</script>
