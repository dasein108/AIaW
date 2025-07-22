<template>
  <div min-w-0>
    <base-message-item
      :message="adaptedMessage"
      :profile="senderProfile"
      :position="isMine ? 'right' : 'left'"
      :always-use-user-style="true"
    >
      <!-- Simple Actions Slot -->
      <template #actions="{ message: msg }">
        <copy-btn
          v-if="msg.messageContents?.[0]?.text"
          round
          flat
          dense
          text="sec xs"
          un-size="32px"
          :value="msg.messageContents[0].text"
        />
      </template>
    </base-message-item>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { computed } from "vue"

import CopyBtn from "@/shared/components/CopyBtn.vue"
import BaseMessageItem from '@/shared/components/message/BaseMessageItem.vue'
import { useUserStore } from "@/shared/store/user"
import { defaultTextAvatar } from "@/shared/utils/functions"

import { useProfileStore } from "@/features/profile/store"

import { ChatMessage } from "@/services/data/types/chat"

const props = defineProps<{
  message: ChatMessage
  scrollContainer: HTMLElement
}>()

const userStore = useUserStore()
const isMine = computed(
  () => props.message.sender?.id === userStore.currentUserId
)

const { myProfile } = storeToRefs(useProfileStore())

// Computed properties for BaseMessageItem
const adaptedMessage = computed(() => ({
  id: props.message.id,
  messageContents: [{
    type: (isMine.value ? "user-message" : "assistant-message") as "user-message" | "assistant-message",
    text: props.message.content,
    id: `${props.message.id}-content`,
    storedItems: props.message.storedItems || []
  }],
  status: 'default' as const,
  modelName: null,
  error: null,
  warnings: []
}))

const senderProfile = computed(() => {
  if (isMine.value) {
    return {
      profile: {
        id: myProfile.value.id,
        name: myProfile.value.name,
        avatar: myProfile.value.avatar
      }
    } as any
  } else {
    if (!props.message.sender) {
      // Fallback when sender is null/undefined
      return {
        profile: {
          id: 'unknown',
          name: 'Unknown User',
          avatar: defaultTextAvatar('Unknown User')
        }
      } as any
    }

    return {
      profile: {
        id: props.message.sender.id,
        name: props.message.sender.name || 'Unknown User',
        avatar: props.message.sender.avatar || defaultTextAvatar(props.message.sender.name || 'Unknown User')
      }
    } as any
  }
})

</script>

<style lang="scss">
.md-editor-preview-wrapper {
  --at-apply: "py-0";
}
.content-reasoning {
  code {
    white-space: pre-wrap !important;
  }

  details {
    margin: 8px 0 0 0 !important;
  }
}
</style>
