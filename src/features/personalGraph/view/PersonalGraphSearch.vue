<template>
  <div>
    <q-input
      v-model="search"
      :placeholder="$t('personalGraph.searchPlaceholder')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const search = ref("")
</script>
