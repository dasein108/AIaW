import type { User } from "@supabase/supabase-js"
import { defineStore } from "pinia"
import { ref, computed } from "vue"

import { supabase } from "@/services/data/supabase/client"

/**
 * Core store for user authentication state
 *
 * This is a fundamental store that many other stores depend on. It provides
 * the authenticated user information and login status, which is essential
 * for user-specific operations throughout the application.
 *
 * @dependencies
 * - No direct store dependencies
 *
 * @dependents
 * - Many stores depend on this store for user identification
 * - {@link createKeyValueDbStore} - For user-specific data storage
 * - {@link useChatsStore} - For chat operations
 * - {@link useProfileStore} - For profile management
 *
 * @database
 * - Uses Supabase Auth, not a specific table
 */
export const useUserStore = defineStore("user", () => {
  const currentUser = ref<User | null>(null)
  const isInitialized = ref(false)

  // Initialize user on store creation
  async function init () {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    currentUser.value = session?.user ?? null
    supabase.auth.onAuthStateChange((event, session) => {
      currentUser.value = session?.user ?? null
    })
    isInitialized.value = true
  }

  const currentUserId = computed(() => currentUser.value?.id ?? null)
  const isLoggedIn = computed(() => !!currentUser.value?.id)

  return {
    currentUser,
    currentUserId,
    isLoggedIn,
    init,
    isInitialized,
  }
})
