import { useQuasar } from "quasar"
import { supabase } from "@/services/data/supabase/client"
import { Ref } from "vue"

/**
 * Options for the useAuth composable
 */
interface UseAuthOptions {
  /** Loading state reference to track authentication status */
  loading: Ref<boolean>;
  /** Callback function to execute after successful authentication */
  onComplete: () => void;
}

/**
 * Authentication credentials
 */
interface AuthCredentials {
  /** User email */
  email: string;
  /** User password */
  password: string;
}

/**
 * Authentication options
 */
interface AuthOptions {
  /** Authentication mode - either 'signUp' or 'signIn' */
  mode?: 'signUp' | 'signIn';
}

/**
 * Composable for handling authentication operations
 *
 * @param options - Authentication configuration options
 * @returns Authentication methods (signIn, signUp, signOut)
 */
export function useAuth(options: UseAuthOptions) {
  const { loading, onComplete } = options
  const $q = useQuasar()

  /**
   * Authenticate user with credentials
   *
   * @param credentials - User authentication credentials
   * @param authOptions - Authentication options
   */
  async function authenticate(
    credentials: AuthCredentials,
    authOptions?: AuthOptions
  ) {
    const { email, password } = credentials
    const { mode = 'signIn' } = authOptions || {}
    const isSignUp = mode === 'signUp'

    try {
      loading.value = true

      const { error } = isSignUp
        ? await supabase.auth.signUp({
          email,
          password,
        })
        : await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        $q.notify({
          message: error.message,
          color: "negative",
        })

        return
      }

      $q.notify({
        message: isSignUp
          ? `Signed up with ${email}`
          : `Logged in with ${email}`,
        color: "green",
      })

      onComplete()
    } catch (error) {
      console.error(error)
      $q.notify({
        message: `Error: ${error}`,
        color: "negative",
      })
    } finally {
      loading.value = false
    }
  }

  return {
    signUp: async (email: string, password: string) =>
      await authenticate({ email, password }, { mode: 'signUp' }),
    signIn: async (email: string, password: string) =>
      await authenticate({ email, password }, { mode: 'signIn' }),
    signOut: async () => {
      await supabase.auth.signOut()
      onComplete()
    },
  }
}
