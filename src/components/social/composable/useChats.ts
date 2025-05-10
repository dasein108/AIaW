import { ref, readonly } from 'vue'
import { supabase } from 'src/services/supabase/client'
import type { Chat } from 'src/services/supabase/types'

const chats = ref<Chat[]>([])
let isSubscribed = false
let subscription: ReturnType<typeof supabase.channel> | null = null

async function fetchChats() {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Failed to fetch chats:', error.message)
    return
  }

  chats.value = data ?? []
}

function subscribeToChats() {
  if (isSubscribed) return
  isSubscribed = true

  subscription = supabase
    .channel('chats-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chats'
      },
      (payload) => {
        chats.value.unshift(payload.new as Chat)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'chats'
      },
      (payload) => {
        const deletedId = (payload.old as Chat).id
        chats.value = chats.value.filter(c => c.id !== deletedId)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chats'
      },
      (payload) => {
        const updated = payload.new as Chat
        chats.value = chats.value.map(c => (c.id === updated.id ? updated : c))
      }
    )
    .subscribe()
}

export function useChats() {
  if (!isSubscribed) {
    fetchChats()
    subscribeToChats()
  }

  return {
    chats: readonly(chats)
  }
}
