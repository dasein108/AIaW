import { supabase } from 'src/services/supabase/client'
import type { ChatMessageWithProfile, Profile } from 'src/services/supabase/types'
import { useUserLoginCallback } from '../auth/useUserLoginCallback'

// Cache for sender profiles
const profileCache = new Map<string, Profile | null>()

// Subscription reference
let subscription: ReturnType<typeof supabase.channel> | null = null

/**
 * Subscribes to all new messages (INSERT events on messages table).
 * Messages are stored in a Record keyed by chat_id.
 * Optionally, a callback can be provided to handle each new message.
 */
export function useChatMessagesSubscription(
  onNewMessage: (message: ChatMessageWithProfile) => void
) {
  // Subscribe only once
  const subscribe = () => {
    if (!subscription) {
      subscription = supabase
        .channel('all-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          async (payload) => {
            const message = payload.new as ChatMessageWithProfile
            // Fetch sender profile with cache
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

            onNewMessage(message)
          }
        )
        .subscribe()
    }
  }

  function unsubscribe() {
    if (subscription) {
      subscription.unsubscribe()
      subscription = null
    }
  }

  subscribe()

  // Watch for currentUser changes
  useUserLoginCallback(async() => {
    unsubscribe()
    subscribe()
  })
}
