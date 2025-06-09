import { LanguageModelUsage } from "ai"
import merge from "lodash/merge"
import { defineStore } from "pinia"
import { useUserLoginCallback } from "src/composables/auth/useUserLoginCallback"
import { supabase } from "src/services/supabase/client"
import { reactive, ref } from "vue"
import { Database } from "@/services/supabase/database.types"
import {
  DialogMapped,
  DialogMessageMapped,
  MessageContentMapped,
  StoredItemMapped,
} from "@/services/supabase/types"

type StoredItemInput = Omit<
  Database["public"]["Tables"]["stored_items"]["Insert"],
  "message_content_id" | "dialog_id"
>
type MessageContentInput = Omit<
  Database["public"]["Tables"]["message_contents"]["Insert"],
  "message_id"
> & { stored_items?: StoredItemInput[] }
type DialogMessageInput = Omit<
  Database["public"]["Tables"]["dialog_messages"]["Insert"],
  "dialog_id"
> & { message_contents: MessageContentInput[] }
type DialogInput = Database["public"]["Tables"]["dialogs"]["Insert"]

const SELECT_DIALOG_MESSAGES = "*, message_contents(*, stored_items(*))"

const mapDialogMessage = (message): DialogMessageMapped => {
  return {
    ...message,
    usage: message.usage as LanguageModelUsage,
  }
}

export const useDialogsStore = defineStore("dialogs", () => {
  const dialogs = reactive<Record<string, DialogMapped>>({})
  const dialogMessages = reactive<Record<string, DialogMessageMapped[]>>({})
  const isLoaded = ref(false)

  async function fetchDialogs () {
    const { data, error } = await supabase
      .from("dialogs")
      .select("*")
      .order("created_at", { ascending: true }) // .eq('workspace_id', workspaceId)

    if (error) {
      console.error(error)
    }

    console.log("[DEBUG] Fetch dialogs", data)

    Object.assign(
      dialogs,
      data.reduce((acc, dialog) => {
        acc[dialog.id] = dialog

        return acc
      }, {})
    )
    isLoaded.value = true
  }

  async function fetchDialogMessages (dialogId: string) {
    const { data, error } = await supabase
      .from("dialog_messages")
      .select(SELECT_DIALOG_MESSAGES)
      .eq("dialog_id", dialogId)

    if (error) {
      console.error(error)
    }

    dialogMessages[dialogId] = data as DialogMessageMapped[]

    // console.log(`-- fetchDialogMessages ${dialogId}`, dialogs[dialogId].msg_route, dialogs[dialogId].msg_tree, Object.values(dialogMessages[dialogId]).map(m => toRaw(m)))
    // for (const rootId of Object.keys(dialogs[dialogId].msg_tree)) {
    //   const rootContents = dialogMessages[dialogId].find(m => m.id === rootId)?.message_contents[0].text || '[root]'
    //   const childContents = dialogMessages[dialogId].filter(m => dialogs[dialogId].msg_tree[rootId].includes(m.id)).map(m => m.message_contents[0].text)
    //   console.log(`-- fetchDialogMessages msg_tree`, rootContents, childContents)
    // }
    return dialogMessages[dialogId]
  }

  async function removeDialog (dialogId: string) {
    const { error } = await supabase.from("dialogs").delete().eq("id", dialogId)

    if (error) {
      console.error(error)
      throw error
    }

    delete dialogs[dialogId]
    delete dialogMessages[dialogId]
  }

  async function addDialog (
    dialog: DialogInput,
    initialMessage?: DialogMessageInput
  ) {
    const { data, error } = await supabase
      .from("dialogs")
      .insert(dialog)
      .select()
      .single()

    if (error) {
      console.error(error)
      throw error
    }

    dialogs[data.id] = data as DialogMapped

    if (initialMessage) {
      await addDialogMessage(data.id, null, initialMessage)
    }

    return data
  }

  async function updateDialog (dialog: Partial<DialogMapped>) {
    console.log("-- updateDialog", dialog)
    const { data, error } = await supabase
      .from("dialogs")
      .update(dialog)
      .eq("id", dialog.id)
      .select()
      .single()

    if (error) {
      console.error(error)
      throw error
    }

    dialogs[dialog.id] = data as DialogMapped
  }

  async function addDialogMessage (
    dialogId: string,
    rootMessageId: string | null,
    message: DialogMessageInput,
    insert = false
  ) {
    const { message_contents, ...messageInput } = message

    console.log("-- addDialogMessage", message)
    // 1. create dialog message
    const { data: dialogMessage, error } = await supabase
      .from("dialog_messages")
      .insert({ ...messageInput, dialog_id: dialogId })
      .select(SELECT_DIALOG_MESSAGES)
      .single<DialogMessageMapped>()

    if (error) {
      console.error(error)
      throw error
    }

    // 2. create message contents
    for (const content of message_contents) {
      const { stored_items = [], id, ...contentInput } = content
      const { data: contentData, error: contentError } = await supabase
        .from("message_contents")
        .insert({ ...contentInput, message_id: dialogMessage.id })
        .select("*, stored_items(*)")
        .single()

      if (contentError) {
        console.error(contentError)
        throw contentError
      }

      const messageContent = contentData as MessageContentMapped
      // 3. create stored items
      for (const item of stored_items) {
        const { data: itemData, error: itemError } = await supabase
          .from("stored_items")
          .insert({
            ...item,
            message_content_id: contentData.id,
            dialog_id: dialogId,
          })
          .select()
          .single()

        if (itemError) {
          console.error(itemError)
          throw itemError
        }

        messageContent.stored_items.push(itemData as StoredItemMapped)
      }
      dialogMessage.message_contents.push(messageContent)
    }

    if (!dialogMessages[dialogId]) {
      dialogMessages[dialogId] = []
    }

    dialogMessages[dialogId].push(dialogMessage)

    await updateDialogMsgTree(dialogId, rootMessageId, dialogMessage.id, insert)

    return dialogMessage
  }

  async function updateDialogMsgTree (
    dialogId: string,
    rootMessageId: string,
    newMessageId: string,
    insert = false
  ) {
    const { msg_tree } = dialogs[dialogId]
    const children = msg_tree[rootMessageId] || []
    const changes = insert
      ? {
          [rootMessageId]: [newMessageId],
          [newMessageId]: children,
        }
      : {
          [rootMessageId]: [...children, newMessageId],
          [newMessageId]: [],
        }

    await updateDialog({
      id: dialogId,
      msg_tree: {
        ...msg_tree,
        ...changes,
      },
    })
  }

  async function updateDialogMessage (
    dialogId: string,
    messageId: string,
    message: Partial<DialogMessageInput>
  ) {
    let dialogMessage = merge(
      dialogMessages[dialogId].find((m) => m.id === messageId) || {},
      message
    ) as DialogMessageMapped
    const shouldSave =
      dialogMessage.status &&
      !["streaming", "inputing", "pending"].includes(dialogMessage.status)

    if (!shouldSave) {
      dialogMessages[dialogId] = dialogMessages[dialogId].map((m) =>
        m.id === messageId ? dialogMessage : m
      )

      return
    }

    const { message_contents, ...messageInput } = dialogMessage

    if (Object.keys(messageInput).length > 0) {
      const { data, error } = await supabase
        .from("dialog_messages")
        .update(messageInput)
        .eq("id", messageId)
        .eq("dialog_id", dialogId)
        .select(SELECT_DIALOG_MESSAGES)
        .single()
      console.log("-- updateDialogMessage shouldSave", messageInput, data)

      if (error) {
        console.error(error)
        throw error
      }

      dialogMessage = merge(mapDialogMessage(data), dialogMessage)
    }

    for (const content of dialogMessage.message_contents) {
      const { stored_items = [], ...contentInput } = content
      let messageContent = content as MessageContentMapped

      if (content.id) {
        const { data: contentData, error: contentError } = await supabase
          .from("message_contents")
          .update({ ...contentInput, message_id: dialogMessage.id })
          .eq("id", content.id)
          .select("*, stored_items(*)")
          .single()

        if (contentError) {
          console.error(contentError)
          throw contentError
        }

        messageContent = contentData as MessageContentMapped
      } else {
        const { data: contentData, error: contentError } = await supabase
          .from("message_contents")
          .insert({ ...contentInput, message_id: dialogMessage.id })
          .select("*, stored_items(*)")
          .single()

        if (contentError) {
          console.error(contentError)
          throw contentError
        }

        messageContent = contentData as MessageContentMapped
      }

      for (const item of stored_items) {
        if (item.id) {
          const { data: itemData, error: itemError } = await supabase
            .from("stored_items")
            .update({
              ...item,
              message_content_id: messageContent.id,
              dialog_id: dialogId,
            })
            .eq("id", item.id)
            .select()
            .single()

          if (itemError) {
            console.error(itemError)
            throw itemError
          }

          messageContent.stored_items.map((i) =>
            i.id === item.id ? (itemData as StoredItemMapped) : i
          )
        } else {
          const { data: itemData, error: itemError } = await supabase
            .from("stored_items")
            .insert({
              ...item,
              message_content_id: messageContent.id,
              dialog_id: dialogId,
            })
            .select()
            .single()

          if (itemError) {
            console.error(itemError)
            throw itemError
          }

          messageContent.stored_items.push(itemData as StoredItemMapped)
        }
      }

      dialogMessage.message_contents = dialogMessage.message_contents.map(
        (c) => (c.id === messageContent.id ? messageContent : c)
      )
    }
    dialogMessages[dialogId] = dialogMessages[dialogId].map((m) =>
      m.id === messageId ? dialogMessage : m
    )
  }

  const init = async () => {
    isLoaded.value = false
    Object.assign(dialogs, {})
    Object.assign(dialogMessages, {})
    await fetchDialogs()
    isLoaded.value = true
  }

  useUserLoginCallback(init)

  async function removeDialogMessages (messageIds: string[]) {
    const { error } = await supabase
      .from("dialog_messages")
      .delete()
      .in("id", messageIds)

    if (error) {
      console.error(error)
      throw error
    }
  }

  async function removeStoreItem (stored_item: StoredItemMapped) {
    // TODO: remove stored item from dialog messages, with message_content_id or without
    const { error } = await supabase
      .from("stored_items")
      .delete()
      .eq("id", stored_item.id)

    if (error) {
      console.error(error)
      throw error
    }

    dialogMessages[stored_item.dialog_id] = dialogMessages[
      stored_item.dialog_id
    ].map((m) =>
      m.id === stored_item.message_content_id
        ? {
            ...m,
            message_contents: m.message_contents.map((c) =>
              c.id === stored_item.message_content_id
                ? {
                    ...c,
                    stored_items: c.stored_items.filter(
                      (i) => i.id !== stored_item.id
                    ),
                  }
                : c
            ),
          }
        : m
    )
  }

  async function searchDialogs (
    query: string,
    workspaceId: string | null = null
  ) {
    const queryBuilder = supabase.from("message_contents").select(`
      message_id,
      text,
      dialog_message:dialog_messages(
        dialog_id,
        dialog:dialogs(
          workspace_id,
          name,
          msg_tree
        )
      )
    `)

    if (workspaceId) {
      queryBuilder.eq("dialog_message.dialogs.workspace_id", workspaceId)
    }

    const { data, error } = await queryBuilder.textSearch("text", query)
    console.log("-- searchDialogs error", error)

    return data
  }

  return {
    init,
    isLoaded,
    dialogs,
    dialogMessages,
    addDialog,
    removeDialog,
    updateDialog,
    fetchDialogs,
    fetchDialogMessages,
    addDialogMessage,
    updateDialogMessage,
    removeDialogMessages,
    removeStoreItem,
    searchDialogs,
  }
})
