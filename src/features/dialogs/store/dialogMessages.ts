import merge from "lodash/merge"
import { defineStore } from "pinia"
import { reactive } from "vue"

import { supabase } from "@/services/data/supabase/client"
import { DbDialogMessageUpdate, mapDbToDialogMessageNested, mapDialogMessageToDb, DialogMessageNested } from "@/services/data/types/dialogMessage"
import { DbMessageContentInsert, DbMessageContentUpdate, mapDbToMessageContentNested, mapMessageContentToDb, MessageContentDbType, TMessageContentNested } from "@/services/data/types/messageContents"
import { DbStoredItemInsert, DbStoredItemUpdate, mapDbToStoredItem, mapStoredItemToDb, StoredItem, StoredItemDbType, TStoredItem } from "@/services/data/types/storedItem"

// const SELECT_DIALOG_MESSAGES = "*, message_contents(*, stored_items(*))"

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
  async function upsertMessageContent<T extends TMessageContentNested<MessageContentDbType, StoredItemDbType>>(dialogId: string, messageId: string, messageContent: T) {
    const { storedItems = [], ...messageContentRaw } = messageContent

    // const query = "id" in messageContentRaw && messageContentRaw.id
    //   ? queryFrom.up.update(mapMessageContentToDb<DbMessageContentUpdate>({ ...messageContentRaw, messageId }))
    //     .eq("id", messageContentRaw!.id)
    //   : queryFrom.insert(mapMessageContentToDb<DbMessageContentInsert>({ ...messageContentRaw, messageId }))
    const dbItem = mapMessageContentToDb({ ...messageContentRaw, messageId })
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
      const storedItem = await upsertStoredItem(dialogId, result.id, item)
      result.storedItems.push(storedItem)
    }

    return result
  }

  // Insert or update stored item related to message content
  async function upsertStoredItem<T extends TStoredItem<StoredItemDbType>>(dialogId: string, messageContentId: string, storedItem: T) {
    // const queryFrom = supabase.from("stored_items")
    // const query = "id" in storedItem && storedItem.id
    //   ? queryFrom.update(mapStoredItemToDb({ ...storedItem, messageContentId }))
    //     .eq("id", storedItem.id)
    //   : queryFrom.insert(mapStoredItemToDb({ ...storedItem, messageContentId }))

    // const { data, error } = await query
    //   .select()
    //   .single()
    const { data, error } = await supabase.from("stored_items")
      .upsert(mapStoredItemToDb({ ...storedItem, dialogId, messageContentId } as TStoredItem<DbStoredItemInsert>))
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
    const dialogMessage = await upserDialogMessage(dialogId, { ...message, parentId })

    return dialogMessage
  }

  async function upserDialogMessage<T extends DialogMessageNested<DbDialogMessageUpdate, DbMessageContentUpdate, DbStoredItemUpdate>>(
    dialogId: string,
    message: T,
  ) {
    const { messageContents, ...messageRaw } = message

    const { data, error } = await supabase.from("dialog_messages")
      .upsert(mapDialogMessageToDb({ ...messageRaw, dialogId }))
      .select("*, message_contents(*, stored_items(*))")
      .single()

    const result = mapDbToDialogMessageNested(data)

    if (error) {
      console.error(error)
      throw error
    }

    if (messageContents) {
      for (const content of messageContents) {
        const messageContent = await upsertMessageContent(dialogId, result.id, content)
        result.messageContents.push(messageContent)
      }
    }

    return result
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

  async function updateDialogMessage(
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
      dialogMessages[dialogId] = dialogMessages[dialogId].map((m) =>
        m.id === messageId ? dialogMessage : m
      )

      return
    }

    const dialogMessageResult = await upserDialogMessage(dialogId, dialogMessage)

    dialogMessages[dialogId] = dialogMessages[dialogId].map((m) =>
      m.id === messageId ? dialogMessageResult : m
    )
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

  return {
    dialogMessages,
    fetchDialogMessages,
    addDialogMessage,
    updateDialogMessage,
    deleteDialogMessage,
    deleteStoredItem,
    switchActiveDialogMessage,
  }
})
