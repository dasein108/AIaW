<template>
  <audio
    v-if="url"
    :src="url"
    controls
  />
</template>

<script setup lang="ts">
import { useFileURL } from 'src/composables/file-url'
import { StoredItem } from '@/services/supabase/types'
import { toRef } from 'vue'

const props = defineProps<{
  audio: StoredItem,
}>()

defineEmits(['remove'])

const url = useFileURL(toRef(props, 'audio'))
</script>
