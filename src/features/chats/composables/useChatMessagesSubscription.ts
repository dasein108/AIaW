import { useUserLoginCallback } from "@/features/auth/composables/useUserLoginCallback"
import { useProfileStore } from "@/features/profile/store"
import { useStoredItemsStore } from "@/features/storedItems/store"

import { supabase } from "@/services/data/supabase/client"
import { ChatMessage, DbChatMessage, mapDbToChatMessage } from "@/services/data/types/chat"
import { Profile } from "@/services/data/types/profile"

// Cache for sender profiles
const profileCache = new Map<string, Profile | null>()

// Subscription reference
let subscription: ReturnType<typeof supabase.channel> | null = null

/**
 * Subscribes to all new messages (INSERT events on messages table).
 * Messages are stored in a Record keyed by chat_id.
 * Optionally, a callback can be provided to handle each new message.
 */
export function useChatMessagesSubscription (
  onNewMessage: (message: ChatMessage) => void
) {
  const { fetchProfile } = useProfileStore()
  const storedItemsStore = useStoredItemsStore()

  // Subscribe only once
  const subscribe = () => {
    if (!subscription) {
      subscription = supabase
        .channel("all-messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          async (payload) => {
            const message = mapDbToChatMessage(payload.new as DbChatMessage)

            // Fetch sender profile with cache
            const profile = await fetchProfile(message.senderId)
            profileCache.set(message.senderId, profile)
            message.sender = profile as Profile

            // Fetch stored items for this message with retry logic
            const fetchStoredItemsWithRetry = async (retries = 3, delay = 500) => {
              for (let i = 0; i < retries; i++) {
                try {
                  const storedItems = await storedItemsStore.fetchAll({ messageId: message.id })

                  if (storedItems.length > 0 || i === retries - 1) {
                    console.log(`📎 Fetched ${storedItems.length} stored items for message ${message.id} (attempt ${i + 1})`)

                    return storedItems
                  }

                  // Wait before retrying if no items found and not the last attempt
                  await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
                } catch (error) {
                  console.error(`Failed to fetch stored items for message (attempt ${i + 1}):`, error)

                  if (i === retries - 1) {
                    return []
                  }

                  await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
                }
              }

              return []
            }

            message.storedItems = await fetchStoredItemsWithRetry()

            onNewMessage(message)
          }
        )
        .subscribe()
    }
  }

  function unsubscribe () {
    if (subscription) {
      subscription.unsubscribe()
      subscription = null
    }
  }

  subscribe()

  // Watch for currentUser changes
  useUserLoginCallback(async () => {
    unsubscribe()
    subscribe()
  })
}
