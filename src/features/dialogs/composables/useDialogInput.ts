import { computed, Ref, watch } from "vue"
import { useStorage } from "@/shared/composables/storage/useStorage"
import { useDialogMessages } from "./useDialogMessages"
import { UserMessageContent } from "@/features/dialogs/types"
import {
  MessageContentMapped,
  StoredItemMapped,
} from "@/services/data/supabase/types"
import { ApiResultItem } from "@/shared/types"

/**
 * Composable for managing input in a dialog
 *
 * Provides utilities for managing the input message content in a dialog,
 * including updating text and adding stored items.
 *
 * @param dialogId - Reference to the dialog ID
 * @returns Object with functions and computed properties for managing dialog input
 */
export const useDialogInput = (
  dialogId: Ref<string>,
) => {
  const { updateMessage, lastMessageId, lastMessage } = useDialogMessages(dialogId)
  const storage = useStorage()

  /**
   * Updates the text content of the input message
   *
   * @param text - The new text content
   */
  async function updateInputText(text: string): Promise<void> {
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

  /**
   * Adds items to the input message's stored items
   *
   * Converts API result items to stored items and adds them to the
   * input message.
   *
   * @param items - API result items to add
   */
  async function addInputItems(items: ApiResultItem[]): Promise<void> {
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

  /**
   * The content of the input message
   */
  const inputMessageContent = computed<UserMessageContent>(
    () => lastMessage.value?.message_contents[0] as UserMessageContent
  )

  /**
   * The stored items in the input message
   */
  const inputContentItems = computed<StoredItemMapped[]>(
    () => inputMessageContent.value?.stored_items || []
  )

  /**
   * Whether the input message is empty (no text and no stored items)
   */
  const inputEmpty = computed<boolean>(
    () =>
      !inputMessageContent.value?.text &&
      !inputMessageContent.value?.stored_items.length
  )

  // Debug logging
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
