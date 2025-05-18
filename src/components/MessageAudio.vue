<template>
  <audio
    v-if="url"
    :src="url"
    controls
  />
</template>

<script setup lang="ts">
import { StoredItem } from '@/services/supabase/types'
import { getFileUrl } from 'src/composables/storage/utils'

const props = defineProps<{
  audio: StoredItem,
}>()

defineEmits(['remove'])

// const url = useFileURL(toRef(props, 'audio'))
const url = getFileUrl(props.audio.file_url)
</script>
