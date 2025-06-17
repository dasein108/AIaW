import merge from "lodash/merge"
import { defineStore } from "pinia"
import { reactive } from "vue"

import { supabase } from "@/services/data/supabase/client"
import { DbDialogMessageUpdate, mapDbToDialogMessageNested, mapDialogMessageToDb, DialogMessageNested, DialogMessage, DialogMessageNestedUpdate } from "@/services/data/types/dialogMessage"
import { DbMessageContentInsert, DbMessageContentUpdate, mapDbToMessageContentNested, mapMessageContentToDb, MessageContentNested, MessageContentNestedUpdate } from "@/services/data/types/messageContents"
import { DbStoredItemInsert, DbStoredItemUpdate, mapDbToStoredItem, mapStoredItemToDb, StoredItem } from "@/services/data/types/storedItem"

// const SELECT_DIALOG_MESSAGES = "*, message_contents(*, stored_items(*))"

type UpdateSingleEntityParams = {
  dialogId: string
  messageId: string
  message?: DialogMessageNestedUpdate
  messageContent?: MessageContentNestedUpdate
  storedItem?: StoredItem
  saveDb?: boolean
}
/**
 * Store for managing dialog messages in AI conversations
 *
 * This store handles:
 * - Fetching, creating, updating, and deleting dialog messages
 * - Managing message content and stored items within messages
 * - Tracking message state (active, streaming, complete)
 * - Organizing messages by dialog
 *
 * Dialog messages represent the individual messages within an AI conversation,
 * including both user inputs and AI responses, along with any attachments or
 * generated content.
 *
 * @dependencies
 * - No direct store dependencies, but works closely with useDialogsStore
 *
 * @database
 * - Table: "dialog_messages" - Stores message metadata and relationships
 * - Table: "message_contents" - Stores actual message content
 * - Table: "stored_items" - Stores attachments and generated files
 *
 * @related
 * - Used by {@link useDialogMessages} composable for message operations
 * - Used by {@link useLlmDialog} for managing conversation flow
 */
export const useDialogMessagesStore = defineStore("dialogMessages", () => {
  const dialogMessages = reactive<Record<string, DialogMessageNested[]>>({})

  async function fetchDialogMessages(dialogId: string) {
    const { data, error } = await supabase
      .from("dialog_messages")
      .select("*, message_contents(*, stored_items(*))")
      .eq("dialog_id", dialogId)

    if (error) {
      console.error(error)
    }

    if (data) {
      dialogMessages[dialogId] = data.map(mapDbToDialogMessageNested)
    } else {
      dialogMessages[dialogId] = []
    }

    return dialogMessages[dialogId]
  }

  // Insert or update message content with stored items
  async function upsertMessageContent<T extends MessageContentNested<DbMessageContentUpdate, DbStoredItemUpdate>>(dialogId: string, messageId: string, messageContent: T) {
    const { storedItems = [], ...messageContentRaw } = messageContent
    const dbItem = mapMessageContentToDb({ ...messageContentRaw, messageId })
    console.log("---upsertMessageContent messageContentRaw", messageContentRaw)

    const { data, error } = await supabase.from("message_contents")
      .upsert(dbItem as DbMessageContentInsert)
      .select("*, stored_items(*)")
      .single()

    if (error) {
      console.error(error)
      throw error
    }

    const result = mapDbToMessageContentNested(data)

    for (const item of storedItems) {
      const storedItem = await upsertStoredItem({ type: item.type, ...item, dialogId, messageContentId: result.id })
      result.storedItems.push(storedItem)
    }

    return result
  }

  // Insert or update stored item related to message content
  async function upsertStoredItem<T extends StoredItem<DbStoredItemInsert>>(storedItem: T) {
    const { data, error } = await supabase.from("stored_items")
      .upsert(mapStoredItemToDb(storedItem) as DbStoredItemInsert)
      .select()
      .single()

    if (error) {
      console.error(error)
      throw error
    }

    return mapDbToStoredItem(data)
  }

  async function addDialogMessage(
    dialogId: string,
    parentId: string | null,
    message: DialogMessageNested<DbDialogMessageUpdate, DbMessageContentUpdate, DbStoredItemUpdate>,
  ) {
    const dialogMessage = await upsertDialogMessageNested(dialogId, { ...message, parentId })

    return dialogMessage
  }

  function updateDialogMessageCache(dialogId: string, message: DialogMessageNested) {
    if (dialogMessages[dialogId]) {
      const hasMessage = dialogMessages[dialogId].find((m) => m.id === message.id)

      if (hasMessage) {
        dialogMessages[dialogId] = dialogMessages[dialogId].map((m) =>
          m.id === message.id ? message : m
        )
      } else {
        dialogMessages[dialogId].push(message)
      }
    } else {
      dialogMessages[dialogId] = [message]
    }
  }

  async function upsertDialogMessage(
    dialogId: string,
    message: DialogMessageNestedUpdate,
  ) {
    const { data, error } = await supabase.from("dialog_messages")
      .upsert(mapDialogMessageToDb({ ...message, dialogId }))
      .select("*, message_contents(*, stored_items(*))")
      .single()

    if (error) {
      console.error(error)
      throw error
    }

    return mapDbToDialogMessageNested(data)
  }

  async function upsertDialogMessageNested<T extends DialogMessageNested<DbDialogMessageUpdate, DbMessageContentUpdate, DbStoredItemUpdate>>(
    dialogId: string,
    message: T,
  ) {
    const { messageContents, ...messageRaw } = message

    const result = await upsertDialogMessage(dialogId, messageRaw as DialogMessage)

    if (messageContents) {
      for (const content of messageContents) {
        const messageContent = await upsertMessageContent(dialogId, result.id, content)

        if (content.id) {
          result.messageContents = result.messageContents.map((c) =>
            c.id === content.id ? messageContent : c
          )
        } else {
          result.messageContents.push(messageContent)
        }
      }
    }

    console.log("[---! upsertDialogMessageNested AFTER", result.messageContents)

    // update dialogMessages cache
    updateDialogMessageCache(dialogId, result)

    return result as DialogMessageNested
  }

  async function switchActiveDialogMessage(dialogId: string, activeMessageId: string, siblingMessageIds: string[]) {
    const { error: activeMessageError } = await supabase
      .from("dialog_messages")
      .select("*")
      .eq("id", activeMessageId)
      .eq("dialog_id", dialogId)
      .single()

    if (activeMessageError) {
      console.error(activeMessageError)
      throw activeMessageError
    }

    const { error: restMessagesError } = await supabase
      .from("dialog_messages")
      .update({ is_active: false })
      .in("id", siblingMessageIds.filter((id) => id !== activeMessageId))
      .eq("dialog_id", dialogId)

    if (restMessagesError) {
      console.error(restMessagesError)
      throw restMessagesError
    }

    dialogMessages[dialogId] = dialogMessages[dialogId].map((m) =>
      siblingMessageIds.includes(m.id) ? { ...m, isActive: m.id === activeMessageId } : m
    )
  }

  async function updateDialogMessageNested(
    dialogId: string,
    messageId: string,
    message: DialogMessageNested<DbDialogMessageUpdate, DbMessageContentUpdate, DbStoredItemUpdate>
  ) {
    const dialogMessage = merge(
      dialogMessages[dialogId].find((m) => m.id === messageId) || {},
      message
    ) as DialogMessageNested

    const shouldSave =
      dialogMessage.status &&
      !["streaming", "inputing", "pending"].includes(dialogMessage.status)

    if (!shouldSave) {
      updateDialogMessageCache(dialogId, dialogMessage)
    } else {
      await upsertDialogMessageNested(dialogId, dialogMessage)
    }
  }

  /**
   * Deletes a dialog message from the database
   * Uses the delete operation to permanently remove the message
   */
  async function deleteDialogMessage(dialogId: string, messageId: string) {
    const { error } = await supabase
      .from("dialog_messages")
      .delete()
      .eq("id", messageId)

    if (error) {
      console.error(error)
      throw error
    }

    // TO SYNC with CASCADE DELETE - refetch all dialog messages
    await fetchDialogMessages(dialogId)
  }

  /**
   * Deletes a stored item from the database
   * Uses the delete operation to permanently remove the stored item
   */
  async function deleteStoredItem(storedItem: StoredItem) {
    // TODO: remove stored item from dialog messages, with message_content_id or without
    const { error } = await supabase
      .from("stored_items")
      .delete()
      .eq("id", storedItem.id)

    if (error) {
      console.error(error)
      throw error
    }

    dialogMessages[storedItem.dialogId] = dialogMessages[
      storedItem.dialogId
    ].map((m) =>
      m.id === storedItem.messageContentId
        ? {
            ...m,
            messageContents: m.messageContents.map((c) =>
              c.id === storedItem.messageContentId
                ? {
                    ...c,
                    storedItems: c.storedItems.filter(
                      (i) => i.id !== storedItem.id
                    ),
                  }
                : c
            ),
          }
        : m
    )
  }

  const upsertSingleEntity = async (entity: UpdateSingleEntityParams) => {
    const result: Partial<UpdateSingleEntityParams> = {}

    const message = dialogMessages[entity.dialogId].find((m) => m.id === entity.messageId)
    const messageContents = message?.messageContents

    if (entity.message) {
      const { messageContents, ...messageRaw } = entity.message
      const resultMessage = !entity.saveDb ? merge(message, entity.message) : await upsertDialogMessage(entity.dialogId, messageRaw)

      dialogMessages[entity.dialogId] = dialogMessages[entity.dialogId].map((m) =>
        m.id === entity.messageId ? { ...m, ...resultMessage } : m
      )
      result.message = resultMessage
    }

    if (entity.messageContent) {
      const cacheMessageContent = messageContents.find((c) => c.id === entity.messageContent.id)
      const messageContent = !entity.saveDb ? merge(cacheMessageContent, entity.messageContent) : await upsertMessageContent(entity.dialogId, entity.messageId, entity.messageContent)

      if (entity.messageContent.id) {
        const newMessageContents = messageContents.map((c) =>
          c.id === entity.messageContent.id ? messageContent : c
        )
        dialogMessages[entity.dialogId] = dialogMessages[entity.dialogId].map((m) =>
          m.id === entity.messageId ? { ...m, messageContents: newMessageContents } : m
        )
      } else {
        dialogMessages[entity.dialogId] = dialogMessages[entity.dialogId].map((m) =>
          m.id === entity.messageId ? { ...m, messageContents: [...m.messageContents, messageContent] } : m
        )
      }

      result.messageContent = messageContent
    }

    if (entity.storedItem) {
      const storedItem = await upsertStoredItem(entity.storedItem)
      const messageContent = messageContents.find((c) => c.id === storedItem.messageContentId)

      if (storedItem.id) {
        messageContent.storedItems = messageContent.storedItems.map((i) =>
          i.id === storedItem.id ? storedItem : i
        )
      } else {
        messageContent.storedItems = [...messageContent.storedItems, storedItem]
      }

      dialogMessages[entity.dialogId] = dialogMessages[entity.dialogId].map((m) =>
        m.id === entity.messageId ? { ...m, messageContents: [messageContent] } : m
      )

      result.storedItem = storedItem
    }

    return result
  }

  return {
    dialogMessages,
    fetchDialogMessages,
    addDialogMessage,
    updateDialogMessageNested,
    deleteDialogMessage,
    deleteStoredItem,
    switchActiveDialogMessage,
    upsertSingleEntity
  }
})
