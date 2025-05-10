import { useQuasar } from 'quasar'
import { supabase } from 'src/services/supabase/client'
import { Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
export function useAuth(loading: Ref<boolean>, onDialogOK: () => void) {
  const $q = useQuasar()
  const router = useRouter()
  const route = useRoute()

  async function auth(email: string, password:string, isSignUp:boolean = false) {
    try {
      loading.value = true

      const { data, error } = isSignUp ? await supabase.auth.signUp({
        email,
        password
      }) : await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        $q.notify({
          message: error.message,
          color: 'negative'
        })
        return
      }
      $q.notify({
        message: isSignUp ? `Signed up with ${email}` : `Logged in with ${email}`,
        color: 'green'
      })

      onDialogOK()
    } catch (error) {
      console.error(error)
      $q.notify({
        message: `Error: ${error}`,
        color: 'negative'
      })
    } finally {
      loading.value = false
    }

    // supabase.auth.getUser
  }

  return {
    signUp: async (email: string, password: string) => await auth(email, password, true),
    signIn: async (email: string, password: string) => await auth(email, password, false),
    signOut: async () => await supabase.auth.signOut()
  }
}
