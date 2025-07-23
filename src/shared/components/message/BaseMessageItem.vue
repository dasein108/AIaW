<template>
  <div
    flex
    :class="{
      'flex-row-reverse': position === 'right',
      'flex-col': colMode,
    }"
    relative
  >
    <!-- Avatar and Name Section -->
    <div>
      <div
        flex
        :class="[
          colMode ? 'flex-row items-center' : 'flex-col pos-sticky top-0',
          position === 'left' ? 'pl-2' : '',
        ]"
      >
        <a-avatar
          v-if="profileAvatar"
          :avatar="profileAvatar"
          :size="colMode ? '36px' : denseMode ? '40px' : '48px'"
          :class="colMode ? 'mx-3' : 'xs:mx-3 sm:mx-4'"
        />
        <div
          v-if="profileName"
          :class="colMode ? 'ml-2' : 'my-2 text-xs'"
          text="center on-sur-var"
        >
          {{ profileName }}
        </div>
      </div>
    </div>

    <!-- Message Content Section -->
    <div min-w-0>
      <div
        position-relative
        :class="
          position === 'right' ? 'min-h-48px min-w-100px' : 'min-h-24px min-w-100px'
        "
        class="group"
      >
        <!-- Message Content Loop -->
        <div
          v-for="(content, index) in message.messageContents"
          :key="index"
          :class="backgroundClass"
          rd-lg
        >
          <!-- Assistant Reasoning -->
          <md-preview
            v-if="content.type === 'assistant-message' && content.reasoning"
            :model-value="`\`\`\`Reasoning\n${content.reasoning}\n\`\`\``"
            v-bind="mdPreviewProps"
            class="content-reasoning"
            bg-sur
            no-highlight
            :show-code-row-number="false"
            :auto-fold-threshold="0"
          />

          <!-- Text Content -->
          <div
            v-if="
              (content.type === 'assistant-message' ||
                content.type === 'user-message') &&
                content.text
            "
            pos-relative
            overflow-visible
          >
            <md-preview
              :class="backgroundClass"
              :id="`md-${contentId}-${index}`"
              rd-lg
              :model-value="content.text"
              v-bind="mdPreviewProps"
            />
          </div>

          <!-- Stored Items (Images and Files) -->
          <div
            v-if="content.type === 'user-message' && content.storedItems?.length"
            flex
            flex-wrap
            px-4
            py-3
            gap-2
          >
            <message-image
              v-for="image in content.storedItems.filter((i) =>
                i.mimeType?.startsWith('image/')
              )"
              :key="image.id"
              :image="image"
              h="100px"
            />
            <message-file
              v-for="file in content.storedItems.filter(
                (i) => !i.mimeType?.startsWith('image/')
              )"
              :key="file.id"
              :file="file"
            />
          </div>

          <!-- Tool Content - Not supported in simplified message structure -->
          <!-- <tool-content
            v-if="content.type === 'assistant-tool'"
            :content="content as any"
            my-2
            :class="colMode ? 'mx-4' : 'mx-2'"
          /> -->
        </div>

        <!-- Error Messages -->
        <div
          v-if="message.error"
          text-err
          break-word
          px-5
          mt-2
          pb-2
        >
          {{ message.error }}
        </div>

        <!-- Warning Messages -->
        <div v-if="message.warnings?.length">
          <div
            v-for="(warning, index) in message.warnings"
            :key="index"
            text-warn
            break-word
            px-5
            my-2
          >
            {{ warning }}
          </div>
        </div>

        <!-- Status Icons -->
        <q-icon
          v-if="message.status === 'inputing'"
          name="sym_o_edit"
          pos-absolute
          left--1
          bottom-0
          translate-x="-100%"
          text-on-sur-var
        />

        <!-- Model Name and Timestamp -->
        <div
          v-if="message.status !== 'streaming'"
          text="out xs"
          pos-absolute
          right-1
          bottom--1
          translate-y="100%"
          opacity-0
          group-hover:opacity-100
          transition="opacity 250"
          whitespace-nowrap
        >
          <span>{{ message.modelName }}</span>
          <span
            v-if="message.id"
            ml-3
          >{{ formatTimestamp(message.id) }}</span>
        </div>
      </div>

      <!-- Loading Progress -->
      <div
        v-if="['pending', 'streaming'].includes(message.status)"
        :class="colMode ? 'mx-4' : 'mx-2'"
      >
        <q-linear-progress indeterminate />
      </div>

      <!-- Actions Section -->
      <div
        text-on-sur-var
        :class="
          position === 'left' ? (colMode ? 'mx-4' : 'mx-2') : 'mt-1'
        "
        flex
        items-center
      >
        <slot
          name="actions"
          :message="message"
        >
          <!-- Default Copy Button -->
          <copy-btn
            v-if="textContent"
            round
            flat
            dense
            text="sec xs"
            un-size="32px"
            :value="textContent.text"
          />
        </slot>

        <!-- Context Menu Slot -->
        <slot
          name="context-menu"
          :message="message"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MdPreview } from "md-editor-v3"
import { useQuasar } from "quasar"
import { computed, inject, ComputedRef } from "vue"

import AAvatar from "@/shared/components/avatar/AAvatar.vue"
import CopyBtn from "@/shared/components/CopyBtn.vue"
import { useMdPreviewProps } from "@/shared/composables/mdPreviewProps"
import { genId, idDateString } from "@/shared/utils/functions"

import MessageFile from "@/features/media/components/MessageFile.vue"
import MessageImage from "@/features/media/components/MessageImage.vue"

import { Assistant } from "@/services/data/types/assistant"
import { UserProfile } from "@/services/data/types/profile"
import { StoredItem } from "@/services/data/types/storedItem"

// Simplified message content interface
interface SimpleMessageContent {
  type: 'user-message' | 'assistant-message'
  text: string
  id?: string
  storedItems?: StoredItem[]
  reasoning?: string
}

// Simplified message interface
interface SimpleMessage {
  id: string
  messageContents: SimpleMessageContent[]
  error?: string
  warnings?: string[]
  status?: 'default' | 'pending' | 'streaming' | 'inputing' | 'error'
  modelName?: string
}

interface Props {
  message: SimpleMessage
  storedItem?: StoredItem[]
  profile?: UserProfile | Assistant
  position?: 'left' | 'right'
  // TODO: remove this prop
  alwaysUseUserStyle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'left',
  alwaysUseUserStyle: false,
  storedItem: undefined,
  profile: undefined
})
const $q = useQuasar()

// Generate unique content ID
const contentId = genId()

// Computed properties
const showArtifacts = inject<ComputedRef>("showArtifacts")
const denseMode = computed(() => showArtifacts?.value || $q.screen.lt.md)

const colMode = computed(() =>
  $q.screen.lt.md && props.position === "left"
)

const backgroundClass = computed(() =>
  props.alwaysUseUserStyle || props.position === 'right' ? 'bg-sur-c-low' : 'bg-sur'
)

const profileAvatar = computed(() => {
  if (!props.profile) return null

  // Handle UserProfile (nested structure)
  if ('profile' in props.profile) {
    return props.profile.profile.avatar
  }

  // Handle Assistant (direct structure)
  return props.profile.avatar
})

const profileName = computed(() => {
  if (!props.profile) return null

  // Handle UserProfile (nested structure)
  if ('profile' in props.profile) {
    return props.profile.profile.name
  }

  // Handle Assistant (direct structure)
  return props.profile.name
})

const textContent = computed(() => {
  const textIndex = props.message.messageContents.findIndex((c) =>
    ["user-message", "assistant-message"].includes(c.type)
  )

  return props.message.messageContents[textIndex] as any
})

// Utility functions
const formatTimestamp = (id: string) => {
  try {
    return idDateString(id)
  } catch {
    return ''
  }
}

const mdPreviewProps = useMdPreviewProps()
</script>

<style lang="scss" scoped>
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
