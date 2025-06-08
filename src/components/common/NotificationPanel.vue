<template>
  <q-page>
    <q-card>
      <q-card-section
        :class="{ 'bg-red': warning, 'bg-grey-3': !warning, 'shadow-1': true }"
      >
        {{ title }}
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  warning?: boolean
}>()
</script>
