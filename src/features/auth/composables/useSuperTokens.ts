import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Session from 'supertokens-auth-react/recipe/session'
import { redirectToAuth } from 'supertokens-auth-react'
import { useQuasar } from 'quasar'

export function useSuperTokens() {
  const $q = useQuasar()
  const router = useRouter()

  const isLoading = ref(false)
  const user = ref(null)
  const isAuthenticated = ref(false)

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      isLoading.value = true
      const doesSessionExist = await Session.doesSessionExist()
      isAuthenticated.value = doesSessionExist

      if (doesSessionExist) {
        const session = await Session.getSession()
        user.value = session.getUserId()
      }

      return doesSessionExist
    } catch (error) {
      console.error('Error checking authentication:', error)
      isAuthenticated.value = false
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Sign out user
  const signOut = async () => {
    try {
      isLoading.value = true
      await Session.signOut()
      isAuthenticated.value = false
      user.value = null

      // Show success notification
      $q.notify({
        type: 'positive',
        message: 'Successfully signed out'
      })

      // Redirect to login page
      await router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
      $q.notify({
        type: 'negative',
        message: 'Error signing out'
      })
    } finally {
      isLoading.value = false
    }
  }

  // Redirect to auth page
  const redirectToLogin = () => {
    redirectToAuth()
  }

  // Get user session
  const getSession = async () => {
    try {
      if (await Session.doesSessionExist()) {
        return await Session.getSession()
      }
      return null
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  // Get user ID
  const getUserId = async () => {
    const session = await getSession()
    return session?.getUserId() || null
  }

  // Get access token
  const getAccessToken = async () => {
    const session = await getSession()
    return session?.getAccessToken() || null
  }

  // Get access token payload
  const getAccessTokenPayload = async () => {
    const session = await getSession()
    return session?.getAccessTokenPayload() || {}
  }

  // Check if session needs refresh
  const attemptRefreshingSession = async () => {
    try {
      return await Session.attemptRefreshingSession()
    } catch (error) {
      console.error('Error refreshing session:', error)
      return false
    }
  }

  return {
    // State
    isLoading: computed(() => isLoading.value),
    user: computed(() => user.value),
    isAuthenticated: computed(() => isAuthenticated.value),

    // Methods
    checkAuth,
    signOut,
    redirectToLogin,
    getSession,
    getUserId,
    getAccessToken,
    getAccessTokenPayload,
    attemptRefreshingSession,
  }
}
