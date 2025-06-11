import { throttle } from "lodash"
import { defineStore } from "pinia"
import { useChatsWithSubscription } from "src/features/chats/composables/useChatsWithSubscription"
import { supabase } from "src/services/supabase/client"
import { readonly } from "vue"
import { useUserStore } from "src/stores/user"
import { ChatMapped } from "@/services/supabase/types"

export const useChatsStore = defineStore("chats", () => {
  const { chats, isLoaded } = useChatsWithSubscription()
  const userStore = useUserStore()

  const add = async (
    chat: Omit<ChatMapped, "id" | "created_at" | "updated_at" | "owner_id">
  ) => {
    console.log("addChat", chat)
    const { data, error } = await supabase
      .from("chats")
      .insert(chat)
      .select()
      .single()

    if (error) {
      console.error("error", error)
    }

    return data
  }

  const update = async (id: string, chat: Partial<ChatMapped>) => {
    const { data, error } = await supabase
      .from("chats")
      .update(chat)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("error", error)
    }

    return data
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from("chats").delete().eq("id", id)

    if (error) {
      console.error("error", error)
      throw error
    }
  }

  const search = async (query: string, workspaceId: string | null) => {
    const queryBuilder = supabase.from("messages").select(`
        id,
        chat_id,
        content,
        chat:chats (
          workspace_id,
          name
        )
      `)

    if (workspaceId) {
      queryBuilder.eq("chats.workspace_id", workspaceId)
    }

    const { data, error } = await queryBuilder.textSearch("content", query)
    console.log("-- search chats error", error)

    return data
  }

  const throttleUpdate = throttle(update, 1000)

  const putItem = async (chat: Partial<ChatMapped>) => {
    if (chat.id) {
      throttleUpdate(chat.id, chat)
    } else {
      await add(
        chat as Omit<
          ChatMapped,
          "id" | "created_at" | "updated_at" | "owner_id"
        >
      )
    }
  }

  const startPrivateChatWith = async (targetUserId: string) => {
    const { data: chatId, error } = await supabase.rpc(
      "start_private_chat_with",
      {
        target_user_id: targetUserId,
        current_user_id: userStore.currentUserId,
      }
    )

    if (error) {
      console.error("error", error)
      throw error
    }

    return chatId
  }

  return {
    chats: readonly(chats),
    isLoaded,
    add,
    update,
    remove,
    search,
    putItem,
    startPrivateChatWith,
  }
})
