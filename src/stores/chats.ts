import { useChatsWithSubscription } from 'src/composables/chats/useChatsWithSubscription'
import { ChatMapped } from '@/services/supabase/types'
import { defineStore } from 'pinia'
import { supabase } from 'src/services/supabase/client'
import { throttle } from 'lodash'
import { useProfileStore } from './profile'
import { toRef } from 'vue'

export const useChatsStore = defineStore('chats', () => {
  const profileStore = useProfileStore()
  const chats = useChatsWithSubscription(toRef(profileStore, 'profiles'))

  const add = async (chat: Omit<ChatMapped, 'id' | 'created_at' | 'updated_at' | 'owner_id'>) => {
    console.log('addChat', chat)
    const { data, error } = await supabase.from('chats').insert(chat).select().single()
    if (error) {
      console.error('error', error)
    }
    return data
  }

  const update = async (id: string, chat: Partial<ChatMapped>) => {
    const { data, error } = await supabase.from('chats').update(chat).eq('id', id).select().single()
    if (error) {
      console.error('error', error)
    }
    return data
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('chats').delete().eq('id', id)
    if (error) {
      console.error('error', error)
      throw error
    }
  }

  const search = async (query: string, workspaceId: string | null) => {
    const queryBuilder = supabase
      .from('messages')
      .select(`
        id,
        chat_id,
        content,
        chat:chats (
          workspace_id,
          name
        )
      `)
    if (workspaceId) {
      queryBuilder.eq('chats.workspace_id', workspaceId)
    }
    const { data, error } = await queryBuilder.textSearch('content', query)
    return data
  }

  const throttleUpdate = throttle(update, 1000)

  const putItem = async(chat: Partial<ChatMapped>) => {
    if (chat.id) {
      throttleUpdate(chat.id, chat)
    } else {
      await add(chat as Omit<ChatMapped, 'id' | 'created_at' | 'updated_at' | 'owner_id'>)
    }
  }

  return {
    chats,
    add,
    update,
    remove,
    search,
    putItem
  }
})
