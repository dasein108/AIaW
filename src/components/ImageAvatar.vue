<template>
  <q-avatar>
    <img
      v-if="url"
      :src="url"
    >
  </q-avatar>
</template>

<script setup lang="ts">
import { useAvatarImage } from 'src/composables/avatar-image'
import { toRef } from 'vue'

const props = defineProps<{
  id: string
}>()
const BASE_AVATAR_URL = process.env.SUPABASE_URL + '/storage/v1/object/public/avatar.images'

const url = `${BASE_AVATAR_URL}/${props.id}`
</script>
