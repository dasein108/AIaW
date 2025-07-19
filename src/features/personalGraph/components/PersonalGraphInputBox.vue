<template>
  <div
    pos-relative
  >
    <MessageInputControl
      :allow-file-upload="false"
      :allow-image-upload="false"
      ref="messageInputControl"
      :input-text="text"
      :send-caption="$t('personalGraph.process')"
      :send-icon="'sym_o_wallpaper'"
      :loading="isLoading"
      :placeholder="`Describe your personality, facts, or anything else you want to add to your graph`"
      @send="process"
    />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue"

import MessageInputControl from "@/shared/components/input/control/MessageInputControl.vue"

defineProps<{
  text: string
  process:(text: string) => Promise<void>
  isLoading: boolean
}>()

defineEmits(["process", "send"])

const messageInputControl = ref<InstanceType<typeof MessageInputControl>>()

</script>
