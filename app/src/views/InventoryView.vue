<template>
  <div class="grid h-screen grid-cols-12 gap-4">
    <!-- left col -->
    <div class="dark:border-surface-700 dark:bg-surface-900 col-span-3 rounded-md border border-gray-200 bg-white p-6 shadow">
      <div class="flex h-full flex-col justify-between gap-4">
        <div class="flex h-full flex-col gap-4">
          <span class="text-2xl font-semibold">Inventory</span>
          <Button label="View Full Inventory" @click="$router.push({ name: 'inventory', params: { collectionId: 'full' } })" />
        </div>
      </div>
    </div>

    <!-- main content-->
    <div class="dark:bg-surface-900 dark:border-surface-700 col-span-9 h-full rounded-md border border-gray-200 bg-white p-6 shadow">
      <!-- collections list -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="text-xl font-semibold">Collections</div>
          <Button icon="pi pi-plus" text rounded />
        </div>
        <InputText placeholder="Search collections" />
      </div>

      <div class="flex flex-col gap-2">
        <div
          v-for="collection in collections"
          :key="collection.id"
          class="dark:border-surface-700 group flex cursor-pointer items-center justify-between rounded-md border border-gray-200 p-6"
          @click="handleCollectionSelect(collection.id)"
        >
          <div class="flex gap-4 transition-opacity group-hover:opacity-50">
            <Knob :model-value="50" :size="75" value-template="{value}%" readonly></Knob>
            <div class="flex flex-col">
              <span class="text-lg">{{ collection.name }}</span>
              <span class="text-muted-color text-sm">{{ collection.purchasedFrom }}</span>
              <span class="text-muted-color text-sm">{{ new Date(collection.purchased ?? '').toLocaleDateString() }}</span>
            </div>
          </div>
          <i class="pi pi-chevron-right transition-opacity group-hover:opacity-50"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { useInventoryStore } from '@/store/inventory-store';
import { Collections, type CollectionsRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { InputText, Knob, Button } from 'primevue';
import { onMounted, ref } from 'vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------
defineProps<{ collectionId?: string }>();

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------
const inventoryStore = useInventoryStore();

// Reactive Variables -----------------------------------------------------------------
const collections = ref<CollectionsRecord[]>([]);

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const handleCollectionSelect = (collectionId: string) => {
  router.push({ name: 'inventory', params: { collectionId } });
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  inventoryStore.refresh();
  collections.value = await pb.collection(Collections.Collections).getFullList();
});
</script>
