import { Chat } from "@/services/supabase/types"
import { computed, Ref } from "vue"
import { useChatsStore } from "src/stores/chats"

export function useWorkspaceChats(workspaceId: Ref<string>) {
  const chatsStore = useChatsStore()

  const chats = computed<Chat[]>(() => chatsStore.chats.filter(chat => chat.workspace_id === workspaceId.value))

  const addChat = async (chat: Omit<Chat, 'id' | 'created_at' | 'updated_at' | 'owner_id' | 'workspace_id'>) => {
    await chatsStore.add({ ...chat, workspace_id: workspaceId.value })
  }
  const updateChat = async (id: string, chat: Partial<Chat>) => {
    await chatsStore.update(id, { ...chat, workspace_id: workspaceId.value })
  }
  const removeChat = async (id: string) => {
    await chatsStore.remove(id)
  }
  return {
    chats,
    addChat,
    updateChat,
    removeChat
  }
}
