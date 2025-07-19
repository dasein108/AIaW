import { defineStore } from "pinia"
import { ref } from "vue"

import { useUserStore } from "@/shared/store"
import { ApiResultItem } from "@/shared/types"

import { useChatMessagesSubscription } from "@/features/chats/composables/useChatMessagesSubscription"
import { useProfileStore } from "@/features/profile/store"
import { useStoredItemsStore } from "@/features/storedItems/store"

import { supabase } from "@/services/data/supabase/client"
import { ChatMessage, DbChatMessageInsert, mapChatMessageToDb, mapDbToChatMessage } from "@/services/data/types/chat"
import { mapDbToStoredItem } from "@/services/data/types/storedItem"

import { useChatsStore } from "./index"

export const useChatMessagesStore = defineStore("chat-messages", () => {
  const chatsStore = useChatsStore()
  const userStore = useUserStore()
  const storedItemsStore = useStoredItemsStore()
  const messagesByChat = ref<Record<string, ChatMessage[]>>({})

  const onNewMessage = (message: ChatMessage) => {
    // Skip messages from current user since we add them directly in the add() function
    if (message.senderId === userStore.currentUserId) {
      return
    }

    if (!messagesByChat.value[message.chatId]) {
      messagesByChat.value[message.chatId] = []
    }

    // Check if message already exists (to avoid duplicates)
    const existingMessage = messagesByChat.value[message.chatId].find(m => m.id === message.id)

    if (existingMessage) {
      return
    }

    chatsStore.incrementUnreadCount(message.chatId)
    messagesByChat.value[message.chatId].push(message)
  }

  useChatMessagesSubscription(onNewMessage)

  // TODO: improve to able to fetch messages with lazy loading
  const fetchMessages = async (chatId: string, offset = 0, limit = 100) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*, sender:profiles(*), stored_items(*)")
      .eq("chat_id", chatId)
      // .gt('created_at', date)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit)

    if (error) {
      console.error("❌ Failed to fetch messages:", error.message)

      return
    }

    // Map the data to include storedItems
    const mappedMessages = data.map(msg => {
      const message = mapDbToChatMessage(msg)
      message.storedItems = msg.stored_items ? msg.stored_items.map(mapDbToStoredItem) : []

      return message
    })

    // TODO: temporary solution for lazy loading
    if (offset === 0) {
      messagesByChat.value[chatId] = mappedMessages
    } else {
      messagesByChat.value[chatId].unshift(...mappedMessages)
    }

    return data
  }

  const add = async (
    message: ChatMessage<DbChatMessageInsert>,
    items: ApiResultItem[]
  ) => {
    const { data, error } = await supabase.from("messages").insert(mapChatMessageToDb(message) as DbChatMessageInsert).select().single()

    if (error) {
      console.error("❌ Failed to add message:", error.message)
      throw error
    }

    let storedItems = []

    if (items.length > 0) {
      // Create stored items and collect them
      storedItems = await Promise.all(items.map(async (item) => {
        return await storedItemsStore.createAndUpload({ messageId: data.id }, item)
      }))
    }

    // Create the complete message with stored items and add it to local state
    const completeMessage = mapDbToChatMessage(data)
    completeMessage.storedItems = storedItems

    // Fetch sender profile for the message
    const { fetchProfile } = useProfileStore()
    const profile = await fetchProfile(completeMessage.senderId)
    completeMessage.sender = profile as any

    // Add to local state directly (don't wait for subscription)
    if (!messagesByChat.value[completeMessage.chatId]) {
      messagesByChat.value[completeMessage.chatId] = []
    }

    messagesByChat.value[completeMessage.chatId].push(completeMessage)

    return data
  }

  return {
    messagesByChat,
    fetchMessages,
    add,
  }
})
