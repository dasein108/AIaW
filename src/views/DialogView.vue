<template>
  <view-common-header
    @toggle-drawer="$emit('toggle-drawer')"
    @contextmenu="createDialog"
  >
    <!-- <q-badge
      bg-pri-c
      text-on-pri-c
      ml-2
      py-1
    >
      <a-avatar
        v-if="workspace"
        size="sm"
        :avatar="workspace.avatar"
      />
      <q-icon
        v-else
        name="sym_o_error"
        text-warn
      />
      <div
        ml-2
      >
        {{ workspace?.name || 'undefined' }}
      </div>
    </q-badge>
    <q-icon
      name="sym_o_chevron_right"
      ml-2
    /> -->
    <!-- TODO: remove / before -->
    <!-- <div>
      <assistant-item
        clickable
        :assistant
        v-if="dialog"
        text-base
        item-rd
        py-1
        min-h-0
        main
      />
      <q-menu>
        <q-list>
          <assistant-item
            clickable
            v-for="a in assistants"
            :key="a.id"
            :assistant="a"
            @click="dialogsStore.updateDialog({ id: dialog.id, assistant_id: a.id })"
            v-close-popup
            py-1.5
            min-h-0
          />
        </q-list>
      </q-menu>
    </div> -->
    <div
      v-if="model && assistant && dialog"
      text-on-sur-var
      my-2
      of-hidden
      whitespace-nowrap
      text-ellipsis
      cursor-pointer
    >
      <q-icon
        name="sym_o_neurology"
        size="24px"
      />
      <code
        bg-sur-c-high
        px="6px"
        py="3px"
        text="xs"
      >{{ model.name }}</code>
      <!-- <q-icon
        name="sym_o_expand_more"
        size="sm"
      /> -->
      <q-menu important:max-w="300px">
        <q-list>
          <template v-if="assistant.model">
            <q-item-label
              header
              pb-2
            >
              {{ $t('dialogView.assistantModel') }}
            </q-item-label>
            <model-item
              v-if="assistant.model"
              :model="assistant.model.name"
              @click="dialogsStore.updateDialog({ id: dialog.id, model_override: null })"
              :selected="!dialog.model_override"
              clickable
              v-close-popup
            />
          </template>
          <template v-else-if="perfs.model">
            <q-item-label
              header
              pb-2
            >
              {{ $t('dialogView.globalDefault') }}
            </q-item-label>
            <model-item
              v-if="perfs.model"
              :model="perfs.model.name"
              @click="dialogsStore.updateDialog({ id: dialog.id, model_override: null })"
              :selected="!dialog.model_override"
              clickable
              v-close-popup
            />
          </template>
          <q-separator spaced />
          <q-item-label
            header
            py-2
          >
            {{ $t('dialogView.commonModels') }}
          </q-item-label>
          <a-tip
            tip-key="configure-common-models"
            rd-0
          >
            {{ $t('dialogView.modelsConfigGuide1') }}<router-link
              to="/settings"
              pri-link
            >
              {{ $t('dialogView.settings') }}
            </router-link> {{ $t('dialogView.modelsConfigGuide2') }}
          </a-tip>
          <model-item
            v-for="m of perfs.commonModelOptions"
            :key="m"
            clickable
            :model="m"
            @click="dialogsStore.updateDialog({ id: dialog.id, model_override: models.find(model => model.name === m) || { name: m, inputTypes: InputTypes.default } })"
            :selected="dialog.model_override?.name === m"
            v-close-popup
          />
        </q-list>
      </q-menu>
    </div>
    <q-space />
  </view-common-header>
  <q-page-container
    bg-sur-c-low
    v-if="dialog"
  >
    <q-page
      flex
      flex-col
      :style-fn="pageFhStyle"
    >
      <div
        grow
        bg-sur
        of-y-auto
        py-4
        ref="scrollContainer"
        pos-relative
        :class="{ 'rd-r-lg': rightDrawerAbove }"
        @scroll="onScroll"
      >
        <template
          v-for="(i, index) in chain"
          :key="i"
        >
          <message-item
            class="message-item"
            v-if="messageMap[i] && !!i"
            :model-value="dialog.msg_route[index - 1] + 1"
            :message="messageMap[i]"
            :child-num="dialog.msg_tree[chain[index - 1]].length"
            :scroll-container
            @update:model-value="switchChain(index - 1, $event - 1)"
            @edit="edit(index)"
            @regenerate="regenerate(index)"
            @delete="deleteBranch(index)"
            @quote="quote"
            @extract-artifact="extractArtifact(messageMap[i], ...$event)"
            @rendered="messageMap[i].generating_session && lockBottom()"
            pt-2
            pb-4
          />
        </template>
      </div>
      <div
        bg-sur-c-low
        p-2
        pos-relative
      >
        <div
          v-if="inputMessageContent?.stored_items.length"
          pos-absolute
          z-3
          top-0
          left-0
          translate-y="-100%"
          flex
          items-end
          p-2
          gap-2
        >
          <message-image
            v-for="image in inputContentItems.filter(i => i.mime_type?.startsWith('image/'))"
            :key="image.id"
            :image="image"
            removable
            h="100px"
            @remove="removeItem(image)"
            shadow
          />
          <message-file
            v-for="file in inputContentItems.filter(i => !i.mime_type?.startsWith('image/'))"
            :key="file.id"
            :file="file"
            removable
            @remove="removeItem(file)"
            shadow
          />
        </div>
        <div
          v-if="isPlatformEnabled(perfs.dialogScrollBtn)"
          pos-absolute
          top--1
          right-2
          flex="~ col"
          text-sec
          translate-y="-100%"
          z-1
        >
          <q-btn
            flat
            round
            dense
            icon="sym_o_first_page"
            rotate-90
            @click="scroll('top')"
          />
          <q-btn
            flat
            round
            dense
            icon="sym_o_keyboard_arrow_up"
            @click="scroll('up')"
          />
          <q-btn
            flat
            round
            dense
            icon="sym_o_keyboard_arrow_down"
            @click="scroll('down')"
          />
          <q-btn
            flat
            round
            dense
            icon="sym_o_last_page"
            rotate-90
            @click="scroll('bottom')"
          />
        </div>
        <div
          flex
          flex-wrap
          justify-end
          text-sec
          items-center
        >
          <q-btn
            v-if="model && mimeTypeMatch('image/webp', model.inputTypes.user)"
            flat
            icon="sym_o_image"
            :title="$t('dialogView.addImage')"
            round
            min-w="2.7em"
            min-h="2.7em"
            @click="imageInput.click()"
          >
            <input
              ref="imageInput"
              type="file"
              multiple
              accept="image/*"
              @change="onInputFiles"
              un-hidden
            >
          </q-btn>
          <q-btn
            flat
            icon="sym_o_folder"
            :title="$t('dialogView.addFile')"
            round
            min-w="2.7em"
            min-h="2.7em"
            @click="fileInput.click()"
          >
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="*"
              @change="onInputFiles"
              un-hidden
            >
          </q-btn>
          <q-btn
            v-if="assistant?.prompt_vars?.length"
            flat
            icon="sym_o_tune"
            :title="showVars ? $t('dialogView.hideVars') : $t('dialogView.showVars')"
            round
            min-w="2.7em"
            min-h="2.7em"
            @click="showVars = !showVars"
            :class="{ 'text-ter': showVars }"
          />
          <model-options-btn
            v-if="sdkModel"
            :provider-name="sdkModel.provider"
            :model-id="sdkModel.modelId"
            v-model="modelOptions"
            flat
            round
            min-w="2.7em"
            min-h="2.7em"
          />
          <add-info-btn
            :plugins="activePlugins"
            :assistant-plugins="assistant?.plugins || {}"
            @add="addInputItems"
            flat
            round
            min-w="2.7em"
            min-h="2.7em"
          />
          <q-btn
            v-if="assistant"
            flat
            :round="!activePlugins.length"
            :class="{ 'px-2': activePlugins.length }"
            min-w="2.7em"
            min-h="2.7em"
            icon="sym_o_extension"
            :title="$t('dialogView.plugins')"
          >
            <code
              v-if="activePlugins.length"
              bg-sur-c-high
              px="6px"
            >{{ activePlugins.length }}</code>
            <enable-plugins-menu :assistant-id="assistant.id" />
          </q-btn>
          <q-space />
          <div
            v-if="usage"
            my-2
            ml-2
          >
            <q-icon
              name="sym_o_generating_tokens"
              size="24px"
            />
            <code
              bg-sur-c-high
              px-2
              py-1
            >{{ usage.promptTokens }}+{{ usage.completionTokens }}</code>
            <q-tooltip>
              {{ $t('dialogView.messageTokens') }}<br>
              {{ $t('dialogView.tokenPrompt') }}：{{ usage.promptTokens }}，{{ $t('dialogView.tokenCompletion') }}：{{ usage.completionTokens }}
            </q-tooltip>
          </div>
          <abortable-btn
            icon="sym_o_send"
            :label="$t('dialogView.send')"
            @click="send"
            @abort="abortController?.abort()"
            :loading="isStreaming || !!messageMap[chain.at(-2)]?.generating_session"
            ml-4
            min-h="40px"
          />
        </div>
        <div
          flex
          v-if="assistant"
          v-show="showVars"
        >
          <prompt-var-input
            class="mt-2 mr-2"
            v-for="promptVar of assistant.prompt_vars"
            :key="promptVar.id"
            :prompt-var="promptVar"
            v-model="dialog.input_vars[promptVar.name]"
            :input-props="{
              dense: true,
              outlined: true
            }"
            component="input"
          />
        </div>
        <a-input
          ref="messageInput"
          class="mt-2"
          max-h-50vh
          of-y-auto
          :model-value="inputMessageContent?.text"
          @update:model-value="inputMessageContent && updateInputText($event)"
          outlined
          autogrow
          clearable
          :debounce="30"
          :placeholder="$t('dialogView.chatPlaceholder')"
          @keydown.enter="onEnter"
          @paste="onTextPaste"
        />
      </div>
    </q-page>
  </q-page-container>
  <error-not-found v-else />
</template>

<script setup lang="ts">
import { computed, inject, onUnmounted, provide, ref, Ref, toRaw, toRef, watch, nextTick, onMounted } from 'vue'
import { almostEqual, displayLength, genId, isPlatformEnabled, isTextFile, JSONEqual, mimeTypeMatch, pageFhStyle, textBeginning, wrapCode, wrapQuote } from 'src/utils/functions'
import { useQuasar } from 'quasar'
import { DialogContent } from 'src/utils/templates'
import PromptVarInput from 'src/components/PromptVarInput.vue'
import { PluginApi, Plugin, ModelSettings, ApiResultItem } from 'src/utils/types'
import { usePluginsStore } from 'src/stores/plugins'
import MessageItem from 'src/components/MessageItem.vue'
import { scaleBlob } from 'src/utils/image-process'
import MessageImage from 'src/components/MessageImage.vue'
import { engine } from 'src/utils/template-engine'
import { until } from '@vueuse/core'
import ViewCommonHeader from 'src/components/ViewCommonHeader.vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import ModelItem from 'src/components/ModelItem.vue'
import ParseFilesDialog from 'src/components/ParseFilesDialog.vue'
import MessageFile from 'src/components/MessageFile.vue'
import { dialogOptions, InputTypes, models } from 'src/utils/values'
import { useUserDataStore } from 'src/stores/user-data'
import ErrorNotFound from 'src/pages/ErrorNotFound.vue'
import { useRoute, useRouter } from 'vue-router'
import AbortableBtn from 'src/components/AbortableBtn.vue'
import { MaxMessageFileSizeMB } from 'src/utils/config'
import ATip from 'src/components/ATip.vue'
import { useListenKey } from 'src/composables/listen-key'
import { useSetTitle } from 'src/composables/set-title'
import ModelOptionsBtn from 'src/components/ModelOptionsBtn.vue'
import AddInfoBtn from 'src/components/AddInfoBtn.vue'
import { useI18n } from 'vue-i18n'
import Mark from 'mark.js'
import { useCreateDialog } from 'src/composables/create-dialog'
import EnablePluginsMenu from 'src/components/EnablePluginsMenu.vue'
import { useUiStateStore } from 'src/stores/ui-state'
import { useDialogsStore } from 'src/stores/dialogs'
import { StoredItemMapped } from '@/services/supabase/types'
import { useActiveWorkspace } from 'src/composables/workspaces/useActiveWorkspace'
import { useLlmDialog } from 'src/composables/llm/useLlmDialog'
import { useAssistantTools } from 'src/composables/llm/useAssistantTools'
import { useDialogChain, useDialogModel, useDialogView } from 'src/composables/useDialogView'
const { t, locale } = useI18n()

const props = defineProps<{
  id: string
}>()

const rightDrawerAbove = inject('rightDrawerAbove')

const { assistant, workspace } = useActiveWorkspace()
const dialogsStore = useDialogsStore()

const dialog = computed(() => dialogsStore.dialogs[props.id])
const { switchChain, updateChain } = useDialogChain(dialog)
const {
  chain, messageMap, itemMap,
  editBranch, deleteBranch, updateInputText,
  inputMessageContent, inputContentItems, addInputItems, inputEmpty, getDialogContents
} = useDialogView(dialog, assistant, workspace)
console.log('-- dialog', dialog.value, chain.value, messageMap.value, itemMap.value)
const pluginsStore = usePluginsStore()

// const { callApi } = useCallApi(workspace, dialog)

const { model, sdkModel, modelOptions } = useDialogModel(dialog, assistant)

const $q = useQuasar()
const { genTitle, extractArtifact, stream, isStreaming } = useLlmDialog(workspace, dialog, assistant)

const { createDialog } = useCreateDialog(workspace.value.id)

const preventLockingBottom = ref(false)
const lockingBottom = computed(() => !preventLockingBottom.value && isStreaming.value && perfs.streamingLockBottom)

// stream abort controller
const abortController = ref<AbortController | null>(null)

const startStream = async (target: string, insert = false) => {
  preventLockingBottom.value = false
  abortController.value = new AbortController()
  await stream(target, insert, abortController.value)
}

watch(() => props.id, () => {
  dialogsStore.fetchDialogMessages(props.id)
}, { immediate: true })

provide('dialog', dialog)
provide('messageMap', messageMap)
provide('itemMap', itemMap)

const messageInput = ref()

function focusInput() {
  isPlatformEnabled(perfs.autoFocusDialogInput) && messageInput.value?.focus()
}
async function edit(index: number) {
  await editBranch(index)
  await nextTick()
  focusInput()
}

function ensureAssistantAndModel() {
  if (!assistant.value) {
    $q.notify({ message: t('dialogView.errors.setAssistant'), color: 'negative' })
    return false
  }
  if (!sdkModel.value) {
    $q.notify({ message: t('dialogView.errors.configModel'), color: 'negative' })
    return false
  }

  return true
}

async function regenerate(index) {
  if (!ensureAssistantAndModel()) return

  const target = chain.value[index - 1]
  switchChain(index - 1, dialog.value.msg_tree[target].length)
  await startStream(target, false)
}

function onTextPaste(ev: ClipboardEvent) {
  if (!perfs.codePasteOptimize) return
  const { clipboardData } = ev
  const i = clipboardData.types.findIndex(t => t === 'vscode-editor-data')
  if (i !== -1) {
    const code = clipboardData.getData('text/plain')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
    if (!/\n/.test(code)) return
    const data = clipboardData.getData('vscode-editor-data')
    const lang = JSON.parse(data).mode ?? ''
    if (lang === 'markdown') return
    const wrappedCode = wrapCode(code, lang)
    document.execCommand('insertText', false, wrappedCode)
    ev.preventDefault()
  }
}

const imageInput = ref()
const fileInput = ref()
function onInputFiles({ target }) {
  const files = target.files
  parseFiles(Array.from(files))
  target.value = ''
}
function onPaste(ev: ClipboardEvent) {
  const { clipboardData } = ev
  if (clipboardData.types.includes('text/plain')) {
    if (
      !['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName) &&
      !['true', 'plaintext-only'].includes((document.activeElement as HTMLElement).contentEditable)
    ) {
      const text = clipboardData.getData('text/plain')
      addInputItems([{
        type: 'text',
        name: t('dialogView.pastedText', { text: textBeginning(text, 12) }),
        contentText: text
      }])
    }
    return
  }
  parseFiles(Array.from(clipboardData.files) as File[])
}
addEventListener('paste', onPaste)
onUnmounted(() => removeEventListener('paste', onPaste))
async function removeItem(stored_item: StoredItemMapped) {
  await dialogsStore.removeStoreItem(stored_item)
}

async function parseFiles(files: File[]) {
  if (!files.length) return
  const textFiles = []
  const supportedFiles = []
  const otherFiles = []
  for (const file of files) {
    if (await isTextFile(file)) textFiles.push(file)
    else if (mimeTypeMatch(file.type, model.value.inputTypes.user)) supportedFiles.push(file)
    else otherFiles.push(file)
  }

  const parsedFiles: ApiResultItem[] = []
  for (const file of textFiles) {
    parsedFiles.push({
      type: 'text',
      name: file.name,
      contentText: await file.text()
    })
  }
  for (const file of supportedFiles) {
    if (file.size > MaxMessageFileSizeMB * 1024 * 1024) {
      $q.notify({ message: t('dialogView.fileTooLarge', { maxSize: MaxMessageFileSizeMB }), color: 'negative' })
      continue
    }
    const f = file.type.startsWith('image/') && file.size > 512 * 1024 ? await scaleBlob(file, 2048 * 2048) : file
    parsedFiles.push({
      type: 'file',
      name: file.name,
      mimeType: file.type,
      contentBuffer: await f.arrayBuffer() // TODO: fix this
    })
  }

  await addInputItems(parsedFiles)

  otherFiles.length && $q.dialog({
    component: ParseFilesDialog,
    componentProps: { files: otherFiles, plugins: assistant.value.plugins }
  }).onOk((files: ApiResultItem[]) => {
    addInputItems(files)
  })
}
async function quote(item: ApiResultItem) {
  if (displayLength(item.contentText) > 200) {
    await addInputItems([item])
  } else {
    const { text } = inputMessageContent.value
    const content = wrapQuote(item.contentText) + '\n\n'
    await updateInputText(text ? text + '\n' + content : content)
    focusInput()
  }
}

async function send() {
  if (!ensureAssistantAndModel()) return

  // TODO: Noob alert - probably not needed
  // if (!data.noobAlertDismissed && chain.value.length > 10 && dialogs.value.length < 3) {
  //   $q.dialog({
  //     title: t('dialogView.noobAlert.title'),
  //     message: t('dialogView.noobAlert.message'),
  //     persistent: true,
  //     ok: t('dialogView.noobAlert.okBtn'),
  //     cancel: t('dialogView.noobAlert.cancelBtn'),
  //     ...dialogOptions
  //   }).onCancel(() => {
  //     data.noobAlertDismissed = true
  //     send()
  //   })
  //   return
  // }

  showVars.value = false
  if (inputEmpty.value) {
    await startStream(chain.value.at(-2), true)
  } else {
    const target = chain.value.at(-1)
    await dialogsStore.updateDialogMessage(props.id, target, { status: 'default' })
    until(chain).changed().then(() => {
      nextTick().then(() => {
        scroll('bottom')
      })
    })
    await startStream(target, false)
  }
  perfs.autoGenTitle && chain.value.length === 4 && genTitle(getDialogContents())
}

let lastScrollTop
function scrollListener() {
  const container = scrollContainer.value
  if (container.scrollTop < lastScrollTop) {
    preventLockingBottom.value = true
  }
  lastScrollTop = container.scrollTop
}

function lockBottom() {
  lockingBottom.value && scroll('bottom', 'auto')
}

watch(lockingBottom, val => {
  if (val) {
    lastScrollTop = scrollContainer.value.scrollTop
    scrollContainer.value.addEventListener('scroll', scrollListener)
  } else {
    lastScrollTop = null
    scrollContainer.value.removeEventListener('scroll', scrollListener)
  }
})
const activePlugins = computed<Plugin[]>(() => assistant.value ? pluginsStore.plugins.filter(p => p.available && assistant.value.plugins[p.id]?.enabled) : [])
const usage = computed(() => messageMap.value[chain.value.at(-2)]?.usage)

async function copyContent() {
  await navigator.clipboard.writeText(await engine.parseAndRender(DialogContent, {
    contents: getDialogContents(),
    title: dialog.value.name
  }))
}
const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()
watch(route, to => {
  userDataStore.data.lastDialogIds[workspace.value.id] = props.id
  until(dialog).toMatch(val => val?.id === props.id).then(async () => {
    focusInput()
    if (to.hash === '#genTitle') {
      genTitle(getDialogContents())
      router.replace({ hash: '' })
    } else if (to.hash === '#copyContent') {
      copyContent()
      router.replace({ hash: '' })
    }
    if (to.query.goto) {
      const { route, highlight } = JSON.parse(to.query.goto as string)
      if (!JSONEqual(route, dialog.value.msg_route.slice(0, route.length))) {
        updateChain(route)
        await until(chain).changed()
      }
      await nextTick()
      const { items } = getEls()
      const item = items[route.length - 1]
      if (highlight) {
        const mark = new Mark(item)
        mark.unmark()
        mark.mark(highlight)
      }
      item.querySelector('mark[data-markjs]')?.scrollIntoView()
      router.replace({ query: {} })
    }
  })
}, { immediate: true })

function onEnter(ev) {
  if (perfs.sendKey === 'ctrl+enter') {
    ev.ctrlKey && send()
  } else if (perfs.sendKey === 'shift+enter') {
    ev.shiftKey && send()
  } else {
    if (ev.ctrlKey) document.execCommand('insertText', false, '\n')
    else if (!ev.shiftKey) send()
  }
}

const showVars = ref(true)

const scrollContainer = ref<HTMLElement>()
function getEls() {
  const container = scrollContainer.value
  const items: HTMLElement[] = Array.from(document.querySelectorAll('.message-item'))
  return { container, items }
}
function itemInView(item: HTMLElement, container: HTMLElement) {
  return item.offsetTop <= container.scrollTop + container.clientHeight &&
  item.offsetTop + item.clientHeight > container.scrollTop
}
function switchTo(target: 'prev' | 'next' | 'first' | 'last') {
  const { container, items } = getEls()
  const index = items.findIndex((item, i) =>
    itemInView(item, container) &&
    dialog.value.msg_tree[chain.value[i]].length > 1
  )
  if (index === -1) return

  const id = chain.value[index]
  let to
  const curr = dialog.value.msg_route[index]
  const num = dialog.value.msg_tree[id].length
  if (target === 'first') {
    to = 0
  } else if (target === 'last') {
    to = num - 1
  } else if (target === 'prev') {
    to = curr - 1
  } else if (target === 'next') {
    to = curr + 1
  }
  if (to < 0 || to >= num || to === curr) return
  switchChain(index, to)
}
function scroll(action: 'up' | 'down' | 'top' | 'bottom', behavior: 'smooth' | 'auto' = 'smooth') {
  const { container, items } = getEls()
  if (action === 'top') {
    container.scrollTo({ top: 0, behavior })
    return
  } else if (action === 'bottom') {
    container.scrollTo({ top: container.scrollHeight, behavior })
    return
  }

  // Get current position
  const index = items.findIndex(item => itemInView(item, container))
  const itemTypes = items.map(i => i.clientHeight > container.clientHeight ? 'partial' : 'entire')
  let position: 'start' | 'inner' | 'end' | 'out'
  const item = items[index]
  const type = itemTypes[index]
  if (type === 'partial') {
    if (almostEqual(container.scrollTop, item.offsetTop, 5)) {
      position = 'start'
    } else if (almostEqual(container.scrollTop + container.clientHeight, item.offsetTop + item.clientHeight, 5)) {
      position = 'end'
    } else if (container.scrollTop + container.clientHeight < item.offsetTop + item.clientHeight) {
      position = 'inner'
    } else {
      position = 'out'
    }
  } else {
    if (almostEqual(container.scrollTop, item.offsetTop, 5)) {
      position = 'start'
    } else {
      position = 'out'
    }
  }

  // Scroll
  let top
  if (type === 'entire') {
    if (action === 'up') {
      if (position === 'start') {
        if (index === 0) return
        top = itemTypes[index - 1] === 'entire'
          ? items[index - 1].offsetTop
          : items[index - 1].offsetTop + items[index - 1].clientHeight - container.clientHeight
      } else {
        top = item.offsetTop
      }
    } else {
      if (index === items.length - 1) return
      top = items[index + 1].offsetTop
    }
  } else {
    if (action === 'up') {
      if (position === 'start') {
        if (index === 0) return
        top = itemTypes[index - 1] === 'entire'
          ? items[index - 1].offsetTop
          : items[index - 1].offsetTop + items[index - 1].clientHeight - container.clientHeight
      } else if (position === 'out') {
        top = item.offsetTop + item.clientHeight - container.clientHeight
      } else {
        top = item.offsetTop
      }
    } else {
      if (position === 'end' || position === 'out') {
        if (index === items.length - 1) return
        top = items[index + 1].offsetTop
      } else {
        top = item.offsetTop + item.clientHeight - container.clientHeight
      }
    }
  }
  container.scrollTo({ top: top + 2, behavior: 'smooth' })
}
function regenerateCurr() {
  const { container, items } = getEls()
  const index = items.findIndex(
    (item, i) => itemInView(item, container) && messageMap.value[chain.value[i + 1]].type === 'assistant'
  )
  if (index === -1) return
  regenerate(index + 1)
}
function editCurr() {
  const { container, items } = getEls()
  const index = items.findIndex(
    (item, i) => itemInView(item, container) && messageMap.value[chain.value[i + 1]].type === 'user'
  )
  if (index === -1) return
  edit(index + 1)
}
const { data: perfs } = useUserPerfsStore()
if (isPlatformEnabled(perfs.enableShortcutKey)) {
  useListenKey(toRef(perfs, 'scrollUpKeyV2'), () => scroll('up'))
  useListenKey(toRef(perfs, 'scrollDownKeyV2'), () => scroll('down'))
  useListenKey(toRef(perfs, 'scrollTopKey'), () => scroll('top'))
  useListenKey(toRef(perfs, 'scrollBottomKey'), () => scroll('bottom'))
  useListenKey(toRef(perfs, 'switchPrevKeyV2'), () => switchTo('prev'))
  useListenKey(toRef(perfs, 'switchNextKeyV2'), () => switchTo('next'))
  useListenKey(toRef(perfs, 'switchFirstKey'), () => switchTo('first'))
  useListenKey(toRef(perfs, 'switchLastKey'), () => switchTo('last'))
  useListenKey(toRef(perfs, 'regenerateCurrKey'), () => regenerateCurr())
  useListenKey(toRef(perfs, 'editCurrKey'), () => editCurr())
  useListenKey(toRef(perfs, 'focusDialogInputKey'), () => focusInput())
}

const uiStateStore = useUiStateStore()
const scrollTops = uiStateStore.dialogScrollTops
function onScroll(ev) {
  scrollTops[props.id] = ev.target.scrollTop
}
watch(() => dialog.value?.id, id => {
  if (!id) return
  nextTick(() => {
    scrollContainer.value?.scrollTo({ top: scrollTops[id] ?? 0 })
  })
})

defineEmits(['toggle-drawer'])

useSetTitle(computed(() => dialog.value?.name))
</script>
