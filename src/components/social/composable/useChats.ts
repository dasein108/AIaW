import { ref, readonly, inject, watch } from 'vue'
import { supabase } from 'src/services/supabase/client'
import type { Chat } from 'src/services/supabase/types'
import type { UserProvider } from 'src/services/supabase/userProvider'

const chats = ref<Chat[]>([])
let isSubscribed = false
let subscription: ReturnType<typeof supabase.channel> | null = null

async function extendChatsWithDisplayName(chatsArr: Chat[], currentUserId: string | null) {
  // For each chat, if not group, fetch members and set displayName
  const extended = await Promise.all(
    chatsArr.map(async chat => {
      if (chat.is_group) {
        return chat
      } else {
        // Fetch chat members with profile
        const { data: members, error } = await supabase
          .from('chat_members')
          .select('user_id, profiles(name)')
          .eq('chat_id', chat.id)
        if (error || !members) {
          return { ...chat, name: 'no members' }
        }

        // Find first member that is not myself
        console.log(chat, 'members', members)
        const other = members.find((m: any) => m.user_id !== currentUserId)
        const displayName = other?.profiles?.name || chat.name || ''
        return { ...chat, name: displayName }
      }
    })
  )
  return extended
}

async function fetchChats(currentUserId: string | null) {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Failed to fetch chats:', error.message)
    return
  }

  chats.value = await extendChatsWithDisplayName(data ?? [], currentUserId)
}

function subscribeToChats(currentUserId: string | null) {
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
      async (payload) => {
        // On insert, extend with displayName
        const userProvider = inject<UserProvider>('user')
        const currentUserId = userProvider?.currentUser.value?.id || null
        const extended = await extendChatsWithDisplayName([payload.new as Chat], currentUserId)
        chats.value.unshift(extended[0])
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
      async (payload) => {
        const extended = await extendChatsWithDisplayName([payload.new as Chat], currentUserId)
        chats.value = chats.value.map(c => (c.id === extended[0].id ? extended[0] : c))
      }
    )
    .subscribe()
}

function unsubscribeFromChats() {
  if (subscription) {
    subscription.unsubscribe()
    subscription = null
  }
  isSubscribed = false
}

export function useChats() {
  const { currentUser } = inject<UserProvider>('user')

  // Initial fetch and subscribe
  if (!isSubscribed) {
    fetchChats(currentUser.value?.id)
    subscribeToChats(currentUser.value?.id)
  }

  // Watch for currentUser changes
  watch(
    () => currentUser.value?.id,
    (newId, oldId) => {
      if (newId !== oldId) {
        unsubscribeFromChats()
        chats.value = []
        fetchChats(newId)
        subscribeToChats(newId)
      }
    }
  )

  return {
    chats: readonly(chats)
  }
}
