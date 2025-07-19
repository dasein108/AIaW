<template>
  <div
    flex
    :class="{
      'flex-row-reverse': message.type === 'user',
      'flex-col': colMode,
    }"
    relative
  >
    <!-- Main Message Content -->
    <div min-w-0>
      <base-message-item
        :message="messageWithContents"
        :profile="profile"
        :position="message.type === 'user' ? 'right' : 'left'"
        @rendered="$emit('rendered')"
      >
        <!-- Text Selection Overlay -->
        <template v-if="perfs.messageSelectionBtn">
          <div
            v-for="(content, index) in selectableTextContent"
            :key="`selection-${index}`"
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
                  <template v-if="isPlatformEnabled(perfs.artifactsEnabled)">
                    <q-separator vertical />
                    <q-btn
                      icon="sym_o_convert_to_text"
                      :label="$t('messageItem.convertToArtifact')"
                      :title="$t('messageItem.convertToArtifactTitle')"
                      @click="selectedConvertArtifact"
                      no-caps
                      sm-icon
                    />
                  </template>
                </template>
              </q-btn-group>
            </transition>
          </div>
        </template>

        <!-- Custom Actions Slot -->
        <template #actions="{ message: msg }">
          <div
            flex
            items-center
          >
            <!-- Branch Pagination -->
            <template v-if="childNum > 1">
              <q-pagination
                v-model="model"
                :max="childNum"
                input
                :boundary-links="false"
              />
              <q-btn
                icon="sym_o_delete"
                v-if="!['pending', 'streaming'].includes(msg.status)"
                flat
                dense
                round
                text="sec xs hover:err"
                un-size="32px"
                :title="$t('messageItem.deleteBranch')"
                @click="deleteBranch"
              />
            </template>

            <!-- Main Actions -->
            <template v-if="['default', 'failed'].includes(msg.status) && textContent">
              <copy-btn
                round
                flat
                dense
                text="sec xs"
                un-size="32px"
                :value="textContent.text"
              />
              <q-btn
                v-if="canCreateCyberlink"
                icon="sym_o_link"
                round
                flat
                dense
                text="sec xs"
                un-size="32px"
                title="Create Cyberlink"
                @click="$emit('create-cyberlink', textContent.text)"
              />
              <q-btn
                v-if="message.type === 'assistant'"
                icon="sym_o_refresh"
                round
                flat
                dense
                text="sec xs"
                un-size="32px"
                :title="$t('messageItem.regenerate')"
                @click="$emit('regenerate')"
              />
              <q-btn
                v-if="message.type === 'user'"
                icon="sym_o_edit"
                round
                flat
                dense
                text="sec xs"
                un-size="32px"
                :title="$t('messageItem.edit')"
                @click="$emit('edit')"
              />
            </template>
          </div>
        </template>

        <!-- Context Menu Slot -->
        <template #context-menu="{ message: msg }">
          <q-btn
            v-if="['default', 'failed'].includes(msg.status) && textContent"
            icon="sym_o_more_vert"
            round
            flat
            dense
            text="sec xs"
            un-size="32px"
            :title="$t('messageItem.more')"
          >
            <q-menu>
              <q-list>
                <menu-item
                  icon="sym_o_code"
                  :label="$t('messageItem.showSourceCode')"
                  @click="sourceCodeMode = !sourceCodeMode"
                  :class="{ 'route-active': sourceCodeMode }"
                />
                <menu-item
                  icon="sym_o_edit"
                  :label="$t('messageItem.directEdit')"
                  @click="edit"
                />
                <menu-item
                  icon="sym_o_format_quote"
                  :label="$t('messageItem.quote')"
                  @click="quote(textContent.text)"
                />
                <menu-item
                  icon="sym_o_info"
                  :label="$t('messageItem.moreInfo')"
                  @click="moreInfo"
                />
              </q-list>
            </q-menu>
          </q-btn>
        </template>
      </base-message-item>
    </div>

    <!-- Sidebar Catalog -->
    <div
      v-if="!colMode"
      w="xs:20px sm:22.5%"
      shrink-0
    >
      <md-catalog
        pos-sticky
        top-0
        px-2
        pb-4
        v-if="perfs.messageCatalog && scrollContainer && $q.screen.gt.xs"
        :editor-id="mdId"
        :scroll-element="scrollContainer"
        :md-heading-id="mdPreviewProps.mdHeadingId"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MdCatalog } from "md-editor-v3"
import { storeToRefs } from "pinia"
import { copyToClipboard, useQuasar } from "quasar"
import {
  computed,
  ComputedRef,
  inject,
  onUnmounted,
  reactive,
  ref,
  toRef,
  watchEffect,
} from "vue"
import { useI18n } from "vue-i18n"

import CopyBtn from "@/shared/components/CopyBtn.vue"
import TextareaDialog from "@/shared/components/dialogs/TextareaDialog.vue"
import MenuItem from "@/shared/components/menu/MenuItem.vue"
import BaseMessageItem from "@/shared/components/message/BaseMessageItem.vue"
import { useMdPreviewProps } from "@/shared/composables/mdPreviewProps"
import { useUserPerfsStore } from "@/shared/store"
import { ApiResultItem, ConvertArtifactOptions } from "@/shared/types"
import {
  genId,
  isPlatformEnabled,
  textBeginning,
  wrapCode,
} from "@/shared/utils/functions"
import sessions from "@/shared/utils/sessions"
import { dialogOptions } from "@/shared/utils/values"

import ConvertArtifactDialog from "@/features/artifacts/components/ConvertArtifactDialog.vue"
import { useAssistantsStore } from "@/features/assistants/store"
import MessageInfoDialog from "@/features/dialogs/components/MessageInfoDialog.vue"
import { useDialogMessages } from "@/features/dialogs/composables/useDialogMessages"
import { useDialogsStore } from "@/features/dialogs/store"
// import CyberlinkResult from "./CyberlinkResult.vue"
import {
  AssistantMessageContent,
  UserMessageContent,
} from "@/features/dialogs/types"
import { usePluginsStore } from "@/features/plugins/store"
import { useProfileStore } from "@/features/profile/store"

import { DialogMessageNested } from "@/services/data/types/dialogMessage"
import { MessageContentNested } from "@/services/data/types/messageContents"

const props = defineProps<{
  message: DialogMessageNested
  childNum: number
  scrollContainer: HTMLElement
}>()
const mdId = `md-${genId()}`
const dialogsStore = useDialogsStore()
const { updateMessage } = useDialogMessages(toRef(props.message, "dialogId"))
const $q = useQuasar()

function moreInfo () {
  $q.dialog({
    component: MessageInfoDialog,
    componentProps: { message: props.message },
  })
}
const sourceCodeMode = ref(false)

const contents = computed(() =>
  props.message.messageContents.map((x) => {
    if (x.type === "assistant-message" || x.type === "user-message") {
      return {
        ...x,
        text: sourceCodeMode.value ? wrapCode(x.text, "markdown", 5) : x.text,
      }
    }

    // Vue 3.4 computed is lazy. Force it to trigger.
    return { ...x }
  })
)

const model = defineModel<number>()

const emit = defineEmits<{
  regenerate: []
  edit: []
  quote: [ApiResultItem]
  "extract-artifact": [[string, RegExp | string, ConvertArtifactOptions]]
  rendered: []
  delete: []
  "create-cyberlink": [string]
}>()

watchEffect(async () => {
  const sessionId = props.message.generatingSession

  if (sessionId) {
    !(await sessions.ping(sessionId)) &&
      updateMessage(
        props.message.id,
        {
          generatingSession: null,
          status: "failed",
          error: "aborted",
          messageContents: props.message.messageContents.map((content) => {
            if (
              content.type === "assistant-tool" &&
              content.status === "calling"
            ) {
              return {
                ...content,
                status: "failed",
                error: "Tool call aborted",
              }
            }

            return content
          }) as MessageContentNested[],
        }
      )
  }
})

const textIndex = computed(() =>
  props.message.messageContents.findIndex((c) =>
    ["user-message", "assistant-message"].includes(c.type)
  )
)
const textContent = computed(
  () =>
    props.message.messageContents[textIndex.value] as
      | UserMessageContent
      | AssistantMessageContent
)

const { data: perfs } = useUserPerfsStore()
const assistantsStore = useAssistantsStore()
const pluginsStore = usePluginsStore()
const dialog = computed(() => dialogsStore.dialogs[props.message.dialogId])

const assistant = computed(() => {
  if (!dialog.value?.assistantId) return null

  return assistantsStore.assistants.find(
    (a) => a.id === dialog.value.assistantId
  )
})

const canCreateCyberlink = computed(() => {
  if (!assistant.value?.plugins) return false

  const activePlugins = pluginsStore.plugins.filter(
    (p) => assistant.value.plugins[p.id]?.enabled
  )

  return activePlugins.some(
    (plugin) =>
      plugin.id === "cosmos-authz" ||
      plugin.apis.some((api) => api.name === "create_cyberlink")
  )
})

const { myProfile } = storeToRefs(useProfileStore())

// Computed properties for BaseMessageItem
const messageWithContents = computed(() => ({
  id: props.message.id,
  messageContents: contents.value
    .filter(content => content.type === 'user-message' || content.type === 'assistant-message')
    .map(content => ({
      type: content.type as 'user-message' | 'assistant-message',
      text: content.text,
      id: content.id,
      storedItems: content.storedItems || [],
      reasoning: (content as any).reasoning
    })),
  status: props.message.status === 'failed' ? 'error' : props.message.status as any,
  modelName: props.message.modelName,
  error: props.message.error,
  warnings: props.message.warnings
}))

const profile = computed(() => {
  if (props.message.type === "user") {
    return {
      profile: {
        id: myProfile.value.id,
        name: myProfile.value.name,
        avatar: myProfile.value.avatar
      }
    } as any
  } else {
    const assistant = assistantsStore.assistants.find(
      (a) => a.id === props.message.assistantId
    )

    return assistant ? {
      id: assistant.id,
      name: assistant.name,
      avatar: assistant.avatar
    } as any : null
  }
})

// Computed property for text content that can be selected
const selectableTextContent = computed(() =>
  messageWithContents.value.messageContents.filter(content =>
    (content.type === 'assistant-message' || content.type === 'user-message') &&
    content.text
  )
)

const showArtifacts = inject<ComputedRef>("showArtifacts")
const denseMode = computed(() => showArtifacts.value || $q.screen.lt.md)
const colMode = computed(
  () => denseMode.value && props.message.type === "assistant"
)

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

function getDataLine (node: Node, ttl = 3) {
  if (ttl === 0) return -1

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return getDataLine(node.parentElement, ttl - 1)
  }

  const val = (node as Element).getAttribute("data-line")

  return val ? parseInt(val) : getDataLine(node.parentElement, ttl - 1)
}

function onSelect (mode: "mouse" | "touch") {
  if (!perfs.messageSelectionBtn) return

  const selection = document.getSelection()
  const text = selection.toString()

  if (!text) return

  const start = getDataLine(selection.anchorNode)
  const end = getDataLine(selection.focusNode)

  if (start === -1 || end === -1 || start === end) {
    selected.text = text
    selected.original = false
  } else {
    selected.text = textContent.value.text
      .split("\n")
      .slice(start, end + 1)
      .join("\n")
    selected.original = true
  }

  const range = selection.getRangeAt(0)
  const targetRects = range.getBoundingClientRect()
  const baseRects = textDiv.value[0].getBoundingClientRect()
  floatBtnStyle.top =
    targetRects.top < 48 || mode === "touch"
      ? targetRects.bottom - baseRects.top + 12 + "px"
      : targetRects.top - baseRects.top - 48 + "px"
  floatBtnStyle.left = targetRects.left - baseRects.left + "px"
  showFloatBtns.value = true
}

if (perfs.messageSelectionBtn) {
  const listener = () => {
    showFloatBtns.value = false
    selected.text = null
  }
  document.addEventListener("selectionchange", listener)
  onUnmounted(() => document.removeEventListener("selectionchange", listener))
}

function quote (text: string) {
  const name =
    props.message.type === "assistant"
      ? t("messageItem.assistantMessageQuote")
      : t("messageItem.userMessageQuote")
  emit("quote", {
    type: "quote",
    name: `${name}：${textBeginning(text, 10)}`,
    contentText: text,
  })
}

function edit () {
  $q.dialog({
    component: TextareaDialog,
    componentProps: {
      title: t("messageItem.editMessage"),
      model: textContent.value.text,
    },
  })// .onOk((text) => {
  // db.messages.update(props.message.id, {
  //   [`contents.${textIndex.value}.text`]: text
  // })
  // })
}

function deleteBranch () {
  if (["inputing", "failed"].includes(props.message.status)) {
    emit("delete")

    return
  }

  $q.dialog({
    title: t("messageItem.deleteBranch"),
    message: t("messageItem.deleteBranchMessage"),
    cancel: true,
    ok: {
      label: t("messageItem.delete"),
      color: "err",
      flat: true,
    },
    ...dialogOptions,
  }).onOk(() => {
    emit("delete")
  })
}

function convertArtifact (text: string, pattern, lang: string) {
  if (perfs.artifactsAutoName) {
    emit("extract-artifact", [
      text,
      pattern,
      {
        lang,
        reserveOriginal: perfs.artifactsReserveOriginal,
      },
    ])
  } else {
    $q.dialog({
      component: ConvertArtifactDialog,
      componentProps: {
        lang,
      },
    }).onOk(async (options: ConvertArtifactOptions) => {
      emit("extract-artifact", [text, pattern, options])
    })
  }
}

function selectedConvertArtifact () {
  const text = selected.text
  convertArtifact(text, text, "markdown")
}

const mdPreviewProps = useMdPreviewProps()
const { t } = useI18n()
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
