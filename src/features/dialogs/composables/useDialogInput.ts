import { computed, Ref, watch } from "vue"
import { useStorage } from "../storage/useStorage"
import { FILES_BUCKET } from "../storage/utils"
import { useDialogMessages } from "./useDialogMessages"
import { UserMessageContent } from "@/common/types/dialogs"
import {
  MessageContentMapped,
  StoredItemMapped,
} from "@/services/supabase/types"
import { ApiResultItem } from "@/shared/utils/types"

export const useDialogInput = (
  dialogId: Ref<string>,
) => {
  const { updateMessage, lastMessageId, lastMessage } = useDialogMessages(dialogId)
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
    const storedItems: StoredItemMapped[] = await storage.saveApiResultItems(items, { dialog_id: dialogId.value })

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
      lastMessage.value?.message_contents[0] as UserMessageContent
  )
  const inputContentItems = computed(
    () => inputMessageContent.value.stored_items
  )
  const inputEmpty = computed(
    () =>
      !inputMessageContent.value?.text &&
      !inputMessageContent.value?.stored_items.length
  )

  watch(lastMessage, (newMessage) => {
    console.log("-----useDialogInput lastMessage", newMessage)
  })

  return {
    updateInputText,
    inputMessageContent,
    inputContentItems,
    addInputItems,
    inputEmpty,
  }
}
