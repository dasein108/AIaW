<template>
  <div
    flex
    :class="{ 'flex-row-reverse': isMine, 'flex-col': colMode }"
    relative
  >
    <div>
      <div
        flex
        :class="[
          colMode ? 'flex-row items-center' : 'flex-col items-center top-0',
        ]"
      >
        <a-avatar
          v-if="avatar"
          :avatar
          :size="colMode ? '36px' : denseMode ? '40px' : '48px'"
          :class="colMode ? 'mx-3' : 'xs:mx-3 sm:mx-4'"
          @click="onAvatarClick"
          cursor-pointer
        />
        <div
          v-if="message.sender?.name"
          :class="colMode ? '' : 'my-2 text-xs'"
          text="center on-sur-var"
        >
          {{ message.sender?.name }}
        </div>
      </div>
    </div>
    <div
      min-w-0
    >
      <div
        position-relative
        :class="'min-h-24px min-w-100px'"
        class="group"
      >
        <div
          :class="'bg-sur-c-low'"
          rd-lg
        >
          <div
            ref="textDiv"
            pos-relative
            overflow-visible
          >
            <md-preview
              :class="'bg-sur-c-low'"
              :id="mdId"
              rd-lg
              :model-value="message.content"
              v-bind="mdPreviewProps"
            />
            <transition name="fade">
              <q-btn-group
                v-if="showFloatBtns"
                :style="floatBtnStyle"
                pos-absolute
                z-3
                bg-sec-c
                text-on-sec-c
                @click="showFloatBtns = false"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import { computed, inject, reactive, ref } from 'vue'
import { ApiResultItem, TextAvatar } from 'src/utils/types'
import AAvatar from 'src/components/AAvatar.vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { copyToClipboard, useQuasar } from 'quasar'
import { genId, textBeginning } from 'src/utils/functions'
import { useMdPreviewProps } from 'src/composables/md-preview-props'
import { ChatMessageWithProfile } from '@/services/supabase/types'
import { useUserStore } from 'src/stores/user'

const props = defineProps<{
  message: ChatMessageWithProfile,
  scrollContainer: HTMLElement
}>()

const userStore = useUserStore()
const isMine = computed(() => props.message.sender_id === userStore.currentUserId)
const mdId = `md-${genId()}`

const $q = useQuasar()

const emit = defineEmits<{
  send: [],
  edit: [],
  rendered: [],
  delete: [],
  quote: [ApiResultItem]
  stream: [string]
}>()

const { data: perfs } = useUserPerfsStore()

const denseMode = computed(() => $q.screen.lt.md)
const colMode = computed(() => denseMode.value && !isMine.value)
const avatar = computed(() =>
  isMine.value
    ? perfs.userAvatar
    : { type: 'text', text: props.message.sender?.name.slice(0, 1), hue: 100 } as TextAvatar
)

// const router = useRouter()
function onAvatarClick() {
  console.log('onAvatarClick', props.message)
}

const showFloatBtns = ref(false)
const floatBtnStyle = reactive({
  top: undefined,
  left: undefined
})
const textDiv = ref()
const selected = reactive({
  text: null,
  original: false
})

function quote(text: string) {
  emit('quote', {
    type: 'quote',
    name: `${props.message.sender?.name}`,
    contentText: text
  })
}

const mdPreviewProps = useMdPreviewProps()
</script>

<style lang="scss">
.md-editor-preview-wrapper {
  --at-apply: 'py-0';
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
