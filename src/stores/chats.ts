import { useChatsWithSubscription } from 'src/composables/chats/useChatsWithSubscription'
import { Chat } from '@/services/supabase/types'
import { defineStore } from 'pinia'
import { supabase } from 'src/services/supabase/client'

export const useChatsStore = defineStore('chats', () => {
  const chats = useChatsWithSubscription()

  const add = async (chat: Omit<Chat, 'id' | 'created_at' | 'updated_at' | 'owner_id'>) => {
    console.log('addChat', chat)
    const { data, error } = await supabase.from('chats').insert(chat).select().single()
    if (error) {
      console.error('error', error)
    }
    return data
  }

  const update = async (id: string, chat: Partial<Chat>) => {
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
  return {
    chats,
    add,
    update,
    remove
  }
})
