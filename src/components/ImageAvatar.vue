<template>
  <q-avatar>
    <img
      v-if="url"
      :src="url"
    >
  </q-avatar>
</template>

<script setup lang="ts">
import { getAvatarUrl } from 'src/composables/storage/utils'

const props = defineProps<{
  id: string
}>()

const url = getAvatarUrl(props.id)
</script>
