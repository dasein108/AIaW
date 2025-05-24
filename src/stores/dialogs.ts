import { Database } from '@/services/supabase/database.types'
import { Dialog, DialogMapped, DialogMessageMapped, MessageContentMapped, StoredItem, StoredItemMapped } from '@/services/supabase/types'
import { LanguageModelUsage } from 'ai'
import { defineStore } from 'pinia'
import { supabase } from 'src/services/supabase/client'
import { reactive, ref } from 'vue'
import merge from 'lodash/merge'

type StoredItemInput = Omit<Database['public']['Tables']['stored_items']['Insert'], 'message_content_id' | 'dialog_id'>
type MessageContentInput = Omit<Database['public']['Tables']['message_contents']['Insert'], 'message_id'> & { stored_items?: StoredItemInput[] }
type DialogMessageInput = Omit<Database['public']['Tables']['dialog_messages']['Insert'], 'dialog_id'> & { message_contents: MessageContentInput[] }
type DialogInput = Database['public']['Tables']['dialogs']['Insert']

const SELECT_DIALOG_MESSAGES = '*, message_contents(*, stored_items(*))'

const mapDialogMessage = (message): DialogMessageMapped => {
  return {
    ...message,
    usage: message.usage as LanguageModelUsage
  }
}

export const useDialogsStore = defineStore('dialogs', () => {
  const dialogs = reactive<Record<string, DialogMapped>>({})
  const dialogMessages = reactive<Record<string, DialogMessageMapped[]>>({})
  async function fetchDialogs() {
    const { data, error } = await supabase.from('dialogs').select('*')// .eq('workspace_id', workspaceId)
    if (error) {
      console.error(error)
    }
    Object.assign(dialogs, data.reduce((acc, dialog) => {
      acc[dialog.id] = dialog
      return acc
    }, {}))
    // console.log('---fetchDialogs dialogs', dialogs)
  }

  async function fetchDialogMessages(dialogId: string) {
    const { data, error } = await supabase
      .from('dialog_messages')
      .select(SELECT_DIALOG_MESSAGES)
      .eq('dialog_id', dialogId)

    if (error) {
      console.error(error)
    }
    const messages = data.map(mapDialogMessage)

    dialogMessages[dialogId] = messages
    console.log("---fetchDialogMessages: ", dialogMessages[dialogId])
    return messages as DialogMessageMapped[]
  }

  async function removeDialog(dialogId: string) {
    const { error } = await supabase.from('dialogs').delete().eq('id', dialogId)

    if (error) {
      console.error(error)
      throw error
    }

    delete dialogs[dialogId]
    delete dialogMessages[dialogId]
  }

  async function addDialog(dialog: DialogInput, initialMessage?: DialogMessageInput) {
    const { data, error } = await supabase.from('dialogs').insert(dialog).select().single()
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

  async function updateDialog(dialog: Partial<DialogMapped>) {
    const { data, error } = await supabase.from('dialogs').update(dialog).eq('id', dialog.id).select().single()
    if (error) {
      console.error(error)
      throw error
    }
    dialogs[dialog.id] = data as DialogMapped
  }

  async function addDialogMessage(dialogId: string, rootMessageId: string | null, message: DialogMessageInput, insert = false) {
    const { message_contents, ...messageInput } = message
    // 1. create dialog message
    const { data, error } = await supabase.from('dialog_messages').insert({ ...messageInput, dialog_id: dialogId }).select(SELECT_DIALOG_MESSAGES).single()
    if (error) {
      console.error(error)
      throw error
    }
    const dialogMessage = mapDialogMessage(data)
    // 2. create message contents
    for (const content of message_contents) {
      const { stored_items = [], id, ...contentInput } = content
      const { data: contentData, error: contentError } = await supabase.from('message_contents').insert({ ...contentInput, message_id: data.id }).select('*, stored_items(*)').single()
      if (contentError) {
        console.error(contentError)
        throw contentError
      }
      const messageContent = contentData as MessageContentMapped
      // 3. create stored items
      for (const item of stored_items) {
        const { data: itemData, error: itemError } = await supabase.from('stored_items').insert({ ...item, message_content_id: contentData.id, dialog_id: dialogId }).select().single()
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

    // 4. update dialog msg_tree
    const { msg_tree } = dialogs[dialogId]
    const children = msg_tree[rootMessageId]
    const changes = insert ? {
      [rootMessageId]: [dialogMessage.id],
      [dialogMessage.id]: children
    } : {
      [rootMessageId]: [...children, dialogMessage.id],
      [dialogMessage.id]: []
    }

    await updateDialog({
      id: dialogId,
      msg_tree: {
        ...msg_tree,
        ...changes
      }
    })

    return mapDialogMessage(data)
  }

  async function updateDialogMessage(dialogId: string, messageId: string, message: Partial<DialogMessageInput>) {
    let dialogMessage = merge(dialogMessages[dialogId].find(m => m.id === messageId) || {}, message) as DialogMessageMapped
    const shouldSave = dialogMessage.status && dialogMessage.status !== 'streaming' && dialogMessage.status !== 'inputing'

    if (!shouldSave) {
      dialogMessages[dialogId] = dialogMessages[dialogId].map(m => m.id === messageId ? dialogMessage : m)
      return
    }

    const { message_contents, ...messageInput } = dialogMessage
    if (Object.keys(messageInput).length > 0) {
      const { data, error } = await supabase.from('dialog_messages').update(messageInput).eq('id', messageId).eq('dialog_id', dialogId).select(SELECT_DIALOG_MESSAGES).single()
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
        const { data: contentData, error: contentError } = await supabase.from('message_contents').update({ ...contentInput, message_id: dialogMessage.id }).eq('id', content.id).select('*, stored_items(*)').single()
        if (contentError) {
          console.error(contentError)
          throw contentError
        }
        messageContent = contentData as MessageContentMapped
      } else {
        const { data: contentData, error: contentError } = await supabase.from('message_contents').insert({ ...contentInput, message_id: dialogMessage.id }).select('*, stored_items(*)').single()
        if (contentError) {
          console.error(contentError)
          throw contentError
        }
        messageContent = contentData as MessageContentMapped
      }

      for (const item of stored_items) {
        if (item.id) {
          const { data: itemData, error: itemError } = await supabase.from('stored_items').update({ ...item, message_content_id: messageContent.id, dialog_id: dialogId }).eq('id', item.id).select().single()
          if (itemError) {
            console.error(itemError)
            throw itemError
          }
          messageContent.stored_items.map(i => i.id === item.id ? itemData as StoredItemMapped : i)
        } else {
          const { data: itemData, error: itemError } = await supabase.from('stored_items').insert({ ...item, message_content_id: messageContent.id, dialog_id: dialogId }).select().single()
          if (itemError) {
            console.error(itemError)
            throw itemError
          }
          messageContent.stored_items.push(itemData as StoredItemMapped)
        }
      }

      dialogMessage.message_contents = dialogMessage.message_contents.map(c => c.id === messageContent.id ? messageContent : c)
    }
    dialogMessages[dialogId] = dialogMessages[dialogId].map(m => m.id === messageId ? dialogMessage : m)
  }

  const init = async () => {
    await fetchDialogs()
  }

  async function removeDialogMessages(messageIds: string[]) {
    const { error } = await supabase.from('dialog_messages').delete().in('id', messageIds)
    if (error) {
      console.error(error)
      throw error
    }
  }

  async function removeStoreItem(stored_item: StoredItemMapped) {
    // TODO: remove stored item from dialog messages, with message_content_id or without
    const { error } = await supabase.from('stored_items').delete().eq('id', stored_item.id)
    if (error) {
      console.error(error)
      throw error
    }
    dialogMessages[stored_item.dialog_id] = dialogMessages[stored_item.dialog_id].map(m => m.id === stored_item.message_content_id ? {
      ...m,
      message_contents: m.message_contents.map(c => c.id === stored_item.message_content_id ? {
        ...c,
        stored_items: c.stored_items.filter(i => i.id !== stored_item.id)
      } : c)
    } : m)
  }

  async function searchDialogs(query: string, workspaceId: string | null = null) {
    const queryBuilder = supabase.from('message_contents')
      .select(`
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
      queryBuilder.eq('dialog_message.dialogs.workspace_id', workspaceId)
    }

    const { data, error } = await queryBuilder.textSearch('text', query)

    return data
  }

  return {
    init,
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
    searchDialogs
  }
})
