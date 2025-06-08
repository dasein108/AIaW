import { AssistantMapped, DialogMapped, DialogMessageMapped, MessageContentMapped, StoredItem, StoredItemMapped, WorkspaceMapped } from "@/services/supabase/types"
import { useDialogsStore } from "src/stores/dialogs"
import { genId, mimeTypeMatch } from "src/utils/functions"
import { CoreMessage } from "ai"
import { computed, readonly, Ref, ref, toRaw, watch } from "vue"
import { getFileUrl } from "./storage/utils"
import { useAssistantTools } from "./llm/useAssistantTools"
import { UserMessageContent } from "@/common/types/dialogs"
import { ApiResultItem } from "@/utils/types"
import { useStorage } from "./storage/useStorage"
import { useGetModel } from "./get-model"
import { useUserPerfsStore } from "src/stores/user-perfs"

export const useDialogModel = (dialog: Ref<DialogMapped>, assistant: Ref<AssistantMapped>) => {
  const { getModel, getSdkModel } = useGetModel()
  const modelOptions = ref({})
  const { data: perfs } = useUserPerfsStore()

  const model = computed(() => getModel(dialog.value?.model_override || assistant.value?.model))

  const sdkModel = computed(() => getSdkModel(assistant.value?.provider, model.value, modelOptions.value))

  const systemSdkModel = computed(() => getSdkModel(perfs.systemProvider, perfs.systemModel))

  return { model, sdkModel, modelOptions, systemSdkModel }
}

export const useDialogChain = (dialog: Ref<DialogMapped>) => {
  const historyChain = ref<string[]>([])
  const dialogsStore = useDialogsStore()

  const chain = computed<string[]>(() => dialog.value ? getChain(null, dialog.value.msg_route)[0] : [])

  async function updateChain(route) {
    const res = getChain(null, route)
    historyChain.value = res[0]
    await dialogsStore.updateDialog({ id: dialog.value.id, msg_route: res[1] })
  }

  function getChain(node, route: number[]) {
    const children = dialog.value.msg_tree[node]
    const r = route.at(0) || 0
    if (children[r]) {
      const [restChain, restRoute] = getChain(children[r], route.slice(1))
      return [[node, ...restChain], [r, ...restRoute]]
    } else {
      return [[node], [r]]
    }
  }

  async function switchChain(index: number, value: number) {
    const route = [...dialog.value.msg_route.slice(0, index), value]
    await updateChain(route)
  }

  return { chain, historyChain, updateChain, switchChain }
}

export const useDialogView = (dialog: Ref<DialogMapped>, assistant: Ref<AssistantMapped>, workspace: Ref<WorkspaceMapped>) => {
  const dialogsStore = useDialogsStore()
  const dialogMessages = computed(() => dialogsStore.dialogMessages[dialog.value.id] || [])
  const { model } = useDialogModel(dialog, assistant)

  const { toToolResultContent } = useAssistantTools(assistant, workspace, dialog)
  const storage = useStorage()
  const { chain, historyChain, updateChain, switchChain } = useDialogChain(dialog)

  watch([() => dialogMessages.value.length, () => dialog.value?.id], () => {
    dialog.value && updateChain(dialog.value.msg_route)
  })
  const messageMap = computed<Record<string, DialogMessageMapped>>(() => {
    const map = {}
    dialogMessages.value.forEach(m => { map[m.id] = m })
    return map
  })
  const itemMap = computed<Record<string, StoredItemMapped>>(() => {
    const map = {}
    dialogMessages.value.flatMap(m => m.message_contents).flatMap(c => c.stored_items).forEach(i => { map[i.id] = i })
    return map
  })

  async function updateInputText(text) {
    await dialogsStore.updateDialogMessage(dialog.value.id, chain.value.at(-1), {
      // use shallow keyPath to avoid dexie's sync bug
      message_contents: [{
        ...inputMessageContent.value,
        text
      }] as MessageContentMapped[],
      status: 'inputing'
    })
  }

  async function addInputItems(items: ApiResultItem[]) {
    const storedItems: StoredItemMapped[] = await Promise.all(items.map(r => storage.apiResultItemToStoredItem(r, dialog.value.id)))

    await dialogsStore.updateDialogMessage(dialog.value.id, chain.value.at(-1), {
      message_contents: [{
        ...inputMessageContent.value,
        stored_items: [...inputMessageContent.value.stored_items, ...storedItems.filter(i => i)]
      }]
    })
  }
  const inputMessageContent = computed(() => messageMap.value[chain.value.at(-1)]?.message_contents[0] as UserMessageContent)
  const inputContentItems = computed(() => inputMessageContent.value.stored_items.map(item => itemMap.value[item.id]).filter(x => x))
  const inputEmpty = computed(() => !inputMessageContent.value?.text && !inputMessageContent.value?.stored_items.length)

  async function editBranch(index: number) {
    const target_index = chain.value[index - 1]
    const { type, message_contents } = messageMap.value[chain.value[index]]
    await switchChain(index - 1, dialog.value.msg_tree[target_index].length)

    await dialogsStore.addDialogMessage(dialog.value.id, target_index, {
      type,
      message_contents,
      status: 'inputing'
    })
  }

  function expandMessageTree(root): string[] {
    return [root, ...dialog.value.msg_tree[root].flatMap(id => expandMessageTree(id))]
  }

  async function deleteBranch(index) {
    const parent = chain.value[index - 1]
    const anchor = chain.value[index]
    const branch = dialog.value.msg_route[index - 1]
    branch === dialog.value.msg_tree[parent].length - 1 && switchChain(index - 1, branch - 1)
    const ids = expandMessageTree(anchor)

    await dialogsStore.removeDialogMessages(ids)

    const msgTree = { ...toRaw(dialog.value.msg_tree) }
    msgTree[parent] = msgTree[parent].filter(id => id !== anchor)
    ids.forEach(id => {
      delete msgTree[id]
    })
    await dialogsStore.updateDialog({ id: dialog.value.id, msg_tree: msgTree })
    // })
  }

  function getChainMessages() {
    const val: CoreMessage[] = []
    historyChain.value
      .slice(1)
      .slice(-assistant.value.context_num || 0)
      .filter(id => messageMap.value[id].status !== 'inputing')
      .map(id => messageMap.value[id].message_contents)
      .flat()
      .forEach(content => {
        if (content.type === 'user-message') {
          val.push({
            role: 'user',
            content: [
              { type: 'text', text: content.text },
              ...content.stored_items.map(item => itemMap.value[item.id]).map(i => {
                if (i.content_text != null) {
                  if (i.type === 'file') {
                    return { type: 'text' as const, text: `<file_content filename="${i.name}">\n${i.content_text}\n</file_content>` }
                  } else if (i.type === 'quote') {
                    return { type: 'text' as const, text: `<quote name="${i.name}">${i.content_text}</quote>` }
                  } else {
                    return { type: 'text' as const, text: i.content_text }
                  }
                } else {
                  if (!mimeTypeMatch(i.mime_type, model.value.inputTypes.user)) {
                    return null
                  } else if (i.mime_type.startsWith('image/')) {
                    return { type: 'image' as const, image: getFileUrl(i.file_url), mimeType: i.mime_type }
                  } else {
                    return { type: 'file' as const, mimeType: i.mime_type, data: getFileUrl(i.file_url) }
                  }
                }
              }).filter(x => x)
            ]
          })
        } else if (content.type === 'assistant-message') {
          val.push({
            role: 'assistant',
            content: [
              { type: 'text', text: content.text }
            ]
          })
        } else if (content.type === 'assistant-tool') {
          if (content.status !== 'completed') return
          const { name, args, result, plugin_id } = content
          const id = genId()
          val.push({
            role: 'assistant',
            content: [{
              type: 'tool-call',
              toolName: `${plugin_id}-${name}`,
              toolCallId: id,
              args
            }]
          })
          val.push({
            role: 'tool',
            content: [{
              type: 'tool-result',
              toolName: `${plugin_id}-${name}`,
              toolCallId: id,
              result: toToolResultContent(result.map(id => itemMap.value[id])),
              experimental_content: toToolResultContent(result.map(id => itemMap.value[id]))
            }]
          })
        }
      })
    return val
  }

  function getDialogContents(from: number = 1, to: number = -1) {
    return chain.value.slice(from, to).map(id => messageMap.value[id].message_contents).flat()
  }

  return {
    dialog,
    chain,
    historyChain,
    messageMap,
    itemMap,
    switchChain,
    updateChain,
    editBranch,
    deleteBranch,
    getChainMessages,
    updateInputText,
    inputMessageContent,
    inputContentItems,
    addInputItems,
    inputEmpty,
    getDialogContents
  }
}
