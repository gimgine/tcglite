<template>
  <div class="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-6 shadow">
    <div class="text-sm text-gray-600">{{ label }}</div>
    <div class="flex gap-4 text-lg">
      <div>{{ formattedDetails }}</div>
      <div v-if="change" :class="[change > 0 ? 'text-green-600' : change === 0 ? 'invisible' : 'text-red-600']">
        <i :class="['pi', change >= 0 ? 'pi-arrow-up' : 'pi-arrow-down']" />
        {{ formattedChange }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '@/util/functions';
import { computed } from 'vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------
const props = defineProps<{ label: string; details: string | number; change?: number; isCurrency?: boolean }>();

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------

// Reactive Variables -----------------------------------------------------------------
const formattedDetails = computed(() => {
  if (typeof props.details === 'number') {
    return props.isCurrency ? formatCurrency(props.details) : props.details;
  } else {
    return props.details;
  }
});

const formattedChange = computed(() => (props.isCurrency ? formatCurrency(props.change) : props.change));

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------

// Lifecycle Hooks --------------------------------------------------------------------
</script>
