import { computed, Ref } from "vue"
import { useStorage } from "../storage/useStorage"
import { FILES_BUCKET } from "../storage/utils"
import { useDialogMessages } from "./useDialogMessages"
import { UserMessageContent } from "@/common/types/dialogs"
import {
  MessageContentMapped,
  StoredItemMapped,
} from "@/services/supabase/types"
import { ApiResultItem } from "@/utils/types"

export const useDialogInput = (
  dialogId: Ref<string>,
) => {
  const { messageMap, updateMessage, lastMessageId } = useDialogMessages(dialogId)
  const storage = useStorage(FILES_BUCKET)

  async function updateInputText (text) {
    await updateMessage(
      lastMessageId.value,
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

    await updateMessage(
      lastMessageId.value,
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
      messageMap.value[lastMessageId.value]
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

  return {
    updateInputText,
    inputMessageContent,
    inputContentItems,
    addInputItems,
    inputEmpty,
  }
}
