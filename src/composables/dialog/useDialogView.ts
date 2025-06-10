import { useDialogsStore } from "src/stores/dialogs"
import { computed, Ref, toRaw } from "vue"
import { useStorage } from "../storage/useStorage"
import { FILES_BUCKET } from "../storage/utils"
import { useDialogChain } from "./useDialogChain"
import { useDialogMessages } from "./useDialogMessages"
import { UserMessageContent } from "@/common/types/dialogs"
import {
  MessageContentMapped,
  StoredItemMapped,
} from "@/services/supabase/types"
import { ApiResultItem } from "@/utils/types"

export const useDialogView = (
  dialogId: Ref<string>,
) => {
  const dialogsStore = useDialogsStore()
  const { messageMap, dialog } = useDialogMessages(dialogId)

  const storage = useStorage(FILES_BUCKET)
  const { chain, updateMsgRoute, switchChain } =
    useDialogChain(dialogId)

  async function updateInputText (text) {
    await dialogsStore.updateDialogMessage(
      dialogId.value,
      chain.value.at(-1),
      {
        // use shallow keyPath to avoid dexie's sync bug
        message_contents: [
          {
            ...inputMessageContent.value,
            text,
          },
        ] as MessageContentMapped[],
        status: "inputing",
      }
    )
  }

  async function addInputItems (items: ApiResultItem[]) {
    const storedItems: StoredItemMapped[] = await Promise.all(
      items.map((r) => storage.apiResultItemToStoredItem(r, dialogId.value))
    )

    await dialogsStore.updateDialogMessage(
      dialogId.value,
      chain.value.at(-1),
      {
        message_contents: [
          {
            ...inputMessageContent.value,
            stored_items: [
              ...inputMessageContent.value.stored_items,
              ...storedItems.filter((i) => i),
            ],
          },
        ],
      }
    )
  }

  const inputMessageContent = computed(
    () =>
      messageMap.value[chain.value.at(-1)]
        ?.message_contents[0] as UserMessageContent
  )
  const inputContentItems = computed(
    () => inputMessageContent.value.stored_items
  )
  const inputEmpty = computed(
    () =>
      !inputMessageContent.value?.text &&
      !inputMessageContent.value?.stored_items.length
  )

  async function editBranch (index: number) {
    const target_id = chain.value[index - 1]
    const current_id = chain.value[index]
    const { type, message_contents } = messageMap.value[chain.value[index]]
    console.log("current_id", current_id, messageMap.value[current_id], target_id, messageMap.value[target_id])
    console.log("--c0 editBranch before", chain.value, dialog.value.msg_tree)
    await switchChain(index - 1, dialog.value.msg_tree[target_id].length)
    console.log("--c0 editBranch after", chain.value, dialog.value.msg_route)
    // console.log("--c1 editBranch", messageMap.value, dialog.value.msg_tree[target_id].length,
    //   chain.value[index], messageMap.value[chain.value[index]], dialog.value.msg_tree[target_id]
    // )
    await dialogsStore.addDialogMessage(dialogId.value, target_id, {
      type,
      message_contents,
      status: "inputing",
    })
  }

  function expandMessageTree (root): string[] {
    return [
      root,
      ...dialog.value.msg_tree[root].flatMap((id) => expandMessageTree(id)),
    ]
  }

  async function deleteBranch (index) {
    const parent = chain.value[index - 1]
    const anchor = chain.value[index]
    const branch = dialog.value.msg_route[index - 1]
    branch === dialog.value.msg_tree[parent].length - 1 &&
      switchChain(index - 1, branch - 1)
    const ids = expandMessageTree(anchor)

    await dialogsStore.removeDialogMessages(ids)

    const msgTree = { ...toRaw(dialog.value.msg_tree) }
    msgTree[parent] = msgTree[parent].filter((id) => id !== anchor)
    ids.forEach((id) => {
      delete msgTree[id]
    })

    await dialogsStore.removeDialogMessages(ids)

    await dialogsStore.updateDialog({ id: dialog.value.id, msg_tree: msgTree })
  }

  function getDialogContents (from: number = 1, to: number = -1) {
    return chain.value
      .slice(from, to)
      .map((id) => messageMap.value[id].message_contents)
      .flat()
  }

  async function removeStoredItem (stored_item: StoredItemMapped) {
    await dialogsStore.removeStoreItem(stored_item)
  }

  return {
    switchChain,
    updateMsgRoute,
    editBranch,
    deleteBranch,
    updateInputText,
    inputMessageContent,
    inputContentItems,
    addInputItems,
    inputEmpty,
    getDialogContents,
    removeStoredItem,
  }
}
