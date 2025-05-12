import { onMounted, ref } from 'vue'
import { supabase } from 'src/services/supabase/client'
import type { User } from '@supabase/supabase-js'

export function createUserProvider() {
  const currentUser = ref<User | null>(null)
  onMounted(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    currentUser.value = session?.user ?? null

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('----onAuthStateChange', event, session)
      currentUser.value = session?.user ?? null
    })
    return () => {
      data.subscription.unsubscribe()
    }
  })

  return {
    currentUser,
    currentUserId: currentUser.value?.id,
    isLoggedIn: currentUser.value?.id !== null
  }
}

export type UserProvider = ReturnType<typeof createUserProvider>
