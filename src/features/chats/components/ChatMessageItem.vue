<template>
  <div min-w-0>
    <base-message-item
      :message="adaptedMessage"
      :profile="senderProfile"
      :position="isMine ? 'right' : 'left'"
      :always-use-user-style="true"
      @rendered="$emit('rendered')"
    >
      <!-- Text Selection Overlay -->
      <template v-if="showTextSelection">
        <div
          ref="textDiv"
          @mouseup="onSelect('mouse')"
          @touchend="onSelect('touch')"
          pos-absolute
          inset-0
          z-2
          pointer-events-none
          style="pointer-events: none"
        >
          <transition name="fade">
            <q-btn-group
              v-if="showFloatBtns"
              :style="floatBtnStyle"
              pos-absolute
              z-3
              bg-sec-c
              text-on-sec-c
              @click="showFloatBtns = false"
              style="pointer-events: auto"
            >
              <q-btn
                icon="sym_o_format_quote"
                :label="$t('messageItem.quote')"
                @click="quote(selected.text)"
                no-caps
                sm-icon
              />
              <template v-if="selected.original">
                <q-separator vertical />
                <q-btn
                  icon="sym_o_content_copy"
                  :label="$t('messageItem.copyMarkdown')"
                  @click="copyToClipboard(selected.text)"
                  :title="$t('messageItem.copyMarkdown')"
                  no-caps
                  sm-icon
                />
              </template>
            </q-btn-group>
          </transition>
        </div>
      </template>

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
import { copyToClipboard } from "quasar"
import { computed, onUnmounted, reactive, ref } from "vue"

import CopyBtn from "@/shared/components/CopyBtn.vue"
import BaseMessageItem from '@/shared/components/message/BaseMessageItem.vue'
import { useUserStore } from "@/shared/store/user"
import { ApiResultItem } from "@/shared/types"
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

const emit = defineEmits<{
  send: []
  edit: []
  rendered: []
  delete: []
  quote: [ApiResultItem]
  stream: [string]
}>()

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
  // Debug logging to understand the data issue
  console.log('ChatMessageItem - Debug sender data:', {
    messageId: props.message.id,
    senderId: props.message.senderId,
    sender: props.message.sender,
    isMine: isMine.value,
    myProfile: myProfile.value
  })

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
      console.warn('ChatMessageItem - Sender is null/undefined for message:', props.message.id)

      // Fallback when sender is null/undefined
      return {
        profile: {
          id: 'unknown',
          name: 'Unknown User',
          avatar: defaultTextAvatar('Unknown User')
        }
      } as any
    }

    if (!props.message.sender.avatar) {
      console.warn('ChatMessageItem - Sender avatar is missing for user:', props.message.sender.id)
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

const showTextSelection = computed(() => true)

const showFloatBtns = ref(false)
const floatBtnStyle = reactive({
  top: undefined,
  left: undefined,
})
const textDiv = ref()
const selected = reactive({
  text: null,
  original: false,
})

function onSelect (mode: "mouse" | "touch") {
  const selection = document.getSelection()
  const text = selection.toString()

  if (!text) return

  selected.text = text
  selected.original = false

  const range = selection.getRangeAt(0)
  const targetRects = range.getBoundingClientRect()
  const baseRects = textDiv.value.getBoundingClientRect()
  floatBtnStyle.top =
    targetRects.top < 48 || mode === "touch"
      ? targetRects.bottom - baseRects.top + 12 + "px"
      : targetRects.top - baseRects.top - 48 + "px"
  floatBtnStyle.left = targetRects.left - baseRects.left + "px"
  showFloatBtns.value = true
}

// Text selection cleanup
const listener = () => {
  showFloatBtns.value = false
  selected.text = null
}
document.addEventListener("selectionchange", listener)
onUnmounted(() => document.removeEventListener("selectionchange", listener))

function quote (text: string) {
  emit("quote", {
    type: "quote",
    name: `${props.message.sender?.name}`,
    contentText: text,
  })
}
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
