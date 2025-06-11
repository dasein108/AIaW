<template>
  <audio
    v-if="url"
    :src="url"
    controls
  />
</template>

<script setup lang="ts">
import { StoredItem } from "@/services/supabase/types"
import { getFileUrl } from "@/shared/composables/storage/utils"

const props = defineProps<{
  audio: StoredItem
}>()

defineEmits(["remove"])

const url = getFileUrl(props.audio.file_url)
</script>
