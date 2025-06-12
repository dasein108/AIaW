<template>
  <q-item
    v-bind="$attrs"
    min-h-0
  >
    <q-item-section
      v-if="selected"
      side
    >
      <q-icon
        name="sym_o_check"
        class="text-primary"
        size="xs"
      />
    </q-item-section>
    <q-item-section>{{ model }}</q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineProps<{
  model: string
  selected?: boolean
}>()
</script>
