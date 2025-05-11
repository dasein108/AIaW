import { ref, readonly, watchEffect, Ref } from 'vue'
import { supabase } from 'src/services/supabase/client'
import type { MessageWithProfile, Chat, Profile } from 'src/services/supabase/types'

const messageCache = new Map<string, ReturnType<typeof ref<MessageWithProfile[]>>>()
const subscriptionCache = new Map<string, ReturnType<typeof supabase.channel>>()
const chatCache = new Map<string, ReturnType<typeof ref<Chat | null>>>()

// Add a cache for profiles
const profileCache = new Map<string, Profile | null>()

export function useChatMessages(chatId: Ref<string>) {
  if (!messageCache.has(chatId.value)) {
    messageCache.set(chatId.value, ref<MessageWithProfile[]>([]))
  }

  if (!chatCache.has(chatId.value)) {
    chatCache.set(chatId.value, ref<Chat | null>(null))
  }

  const messages = messageCache.get(chatId.value)!
  const chat = chatCache.get(chatId.value)!

  const fetchMessages = async () => {
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId.value)
      .single()

    if (chatError) {
      console.error('❌ Failed to fetch chat:', chatError.message)
      return
    }
    chat.value = chatData
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('chat_id', chatId.value)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Failed to fetch messages:', error.message)
      return
    }

    messages.value = data ?? []
  }

  const subscribeToMessages = () => {
    if (subscriptionCache.has(chatId.value)) return

    const channel = supabase
      .channel(`chat-${chatId.value}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId.value}`
        },
        async (payload) => {
          const message = payload.new as MessageWithProfile

          // fetch sender profile with cache
          let profile = profileCache.get(message.sender_id)
          if (profile === undefined) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', message.sender_id)
              .single()
            profile = data ?? null
            profileCache.set(message.sender_id, profile)
          }
          message.sender = profile
          messages.value.push(message)
        }
      )
      // .on(
      //   'postgres_changes',
      //   {
      //     event: 'DELETE',
      //     schema: 'public',
      //     table: 'messages',
      //     filter: `chat_id=eq.${chatId}`
      //   },
      //   (payload) => {
      //     const deletedId = payload.old.id
      //     messages.value = messages.value.filter(m => m.id !== deletedId)
      //   }
      // )
      .subscribe()

    subscriptionCache.set(chatId.value, channel)
  }

  // Auto-start when used
  watchEffect(() => {
    fetchMessages()
    subscribeToMessages()
  })

  return {
    messages: readonly(messages),
    chat: readonly(chat)
  }
}
