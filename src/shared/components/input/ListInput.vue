<template>
  <q-select
    v-model="model"
    use-input
    use-chips
    multiple
    hide-dropdown-icon
    input-debounce="0"
  />
</template>

<script setup lang="ts">
const model = defineModel<string[]>()
</script>
