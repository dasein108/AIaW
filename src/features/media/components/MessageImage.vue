<template>
  <div
    pos-relative
    rd-md
    of-hidden
    cursor-pointer
    :style="{ height }"
    @click="viewImage"
  >
    <!-- Loading Placeholder -->
    <div
      v-if="!url"
      flex
      items-center
      justify-center
      w-full
      h-full
      bg="sur-c-low"
      text="on-sur-var xs"
      transition="opacity 300"
      opacity-60
    >
      <q-icon
        name="sym_o_image"
        size="24px"
        class="mr-1"
      />
      Loading...
    </div>

    <!-- Image -->
    <img
      v-else
      :src="url"
      w-a
      h-a
      max-w-full
      max-h-full
      block
      :style="{ height }"
    >

    <div
      v-if="removable && url"
      bg-gradient-top-a
      pos-absolute
      top-0
      left-0
      right-0
      h="30px"
    />
    <q-btn
      v-if="removable && url"
      icon="sym_o_close"
      pos-absolute
      top-0
      right-0
      text-0-0-0-a
      flat
      round
      dense
      size="sm"
      @click.prevent.stop="$emit('remove')"
    />
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar"
import { ref, watch } from "vue"

import { getFileUrl } from "@/shared/composables/storage/utils"

import ViewImageDialog from "@/features/media/components/ViewImageDialog.vue"

import { StoredItemResult } from "@/services/data/types/storedItem"

const props = defineProps<{
  image: StoredItemResult
  height: string
  removable?: boolean
}>()

defineEmits(["remove"])

const url = ref<string | null>(null)
const $q = useQuasar()

// Watch for changes to the image URL
watch(
  () => props.image.fileUrl || (props.image as any).file_url,
  (newFileUrl) => {
    if (newFileUrl) {
      url.value = getFileUrl(newFileUrl)
    } else {
      url.value = null
    }
  },
  { immediate: true }
)

function viewImage () {
  if (url.value) {
    $q.dialog({
      component: ViewImageDialog,
      componentProps: {
        url: url.value,
      },
    })
  }
}
</script>
